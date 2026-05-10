"use server";

import { prisma } from "@/lib/prisma";
import * as ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import fs from "fs";
import path from "path";

export async function bulkSyncExcelAction(formData: FormData) {
  const session = await getSession();
  const isAdmin = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
  );

  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required.");
  }

  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;
  const syncType = formData.get("syncType") as string;
  
  const options = {
    autoCreateUnits: formData.get("autoCreateUnits") === "true",
    fuzzyMatching: formData.get("fuzzyMatching") === "true",
    overwriteExisting: formData.get("overwriteExisting") === "true"
  };

  if (!file) throw new Error("No file provided");
  if (!projectId) throw new Error("Please select a target project");

  const bytes = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(bytes));
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("No worksheet found in file");

  // Map images to cells
  const imagesInCells = new Map<string, { buffer: Buffer, extension: string }[]>();
  
  worksheet.getImages().forEach(imgRef => {
    const img = workbook.getImage(Number(imgRef.imageId));
    const row = Math.floor(imgRef.range.tl.row) + 1;
    const col = Math.floor(imgRef.range.tl.col) + 1;
    const cellKey = `${row}:${col}`;
    
    if (!imagesInCells.has(cellKey)) imagesInCells.set(cellKey, []);
    imagesInCells.get(cellKey)?.push({
      buffer: img.buffer as Buffer,
      extension: img.extension || 'jpg'
    });
  });

  console.log(`[BULK_SYNC] Processing ${worksheet.rowCount} rows for Project ${projectId}. Found ${imagesInCells.size} cells with images.`);

  let unitsCreated = 0;
  let activitiesSynced = 0;
  let photosSynced = 0;
  let errors = 0;
  let skippedRows = 0;
  let totalRows = worksheet.rowCount - 1; // excluding header

  // Identify Headers
  const headerRow = worksheet.getRow(1);
  const colMap: Record<string, number> = {};
  headerRow.eachCell((cell, colNumber) => {
    const val = String(cell.value || "").toLowerCase().trim();
    colMap[val] = colNumber;
  });

  console.log(`[BULK_SYNC] Detected columns:`, Object.keys(colMap));

  // Common Mappings
  const getCol = (names: string[]) => {
    for (const name of names) {
      if (colMap[name.toLowerCase()]) return colMap[name.toLowerCase()];
    }
    return -1;
  };

  const tenantCol = getCol(["Tenant", "Room/Tenant", "ROOM/TENANT", "NAMA UNIT", "NAMA TENANT", "CUSTOMER"]);
  const dateCol = getCol(["Date", "Service Date", "DATE", "TANGGAL", "TANGGAL SERVICE"]);
  const modelCol = getCol(["Model", "MODEL", "TYPE", "TIPE"]);
  const floorCol = getCol(["Floor", "Building/Floor", "FLOOR", "LANTAI", "BLDG/FLOOR"]);
  const tagCol = getCol(["Tag", "Tag Number", "TAG NUMBER", "ID", "TAG"]);

  // Photo columns (common names)
  const photoCols: number[] = [];
  headerRow.eachCell((cell, colNumber) => {
    const val = String(cell.value || "").toLowerCase();
    if (val.includes("foto") || val.includes("photo") || val.includes("image")) {
      photoCols.push(colNumber);
    }
  });

  const getCellValue = (row: ExcelJS.Row, colIndex: number) => {
    if (colIndex === -1) return "";
    const cell = row.getCell(colIndex);
    if (!cell || cell.value === null || cell.value === undefined) return "";
    if (typeof cell.value === 'object' && 'richText' in (cell.value as any)) {
      return (cell.value as any).richText.map((rt: any) => rt.text).join("");
    }
    return String(cell.value).trim();
  };

  // Process Rows (Starting from Row 2)
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    try {
      const tenant = getCellValue(row, tenantCol);
      const dateVal = dateCol !== -1 ? row.getCell(dateCol).value : null;
      const model = getCellValue(row, modelCol);
      const floor = getCellValue(row, floorCol);
      const tag = getCellValue(row, tagCol);

      if (!tenant && !tag) {
        skippedRows++;
        continue;
      }

      // 1. Find Unit
      let unit = await prisma.units.findFirst({
        where: {
          project_ref_id: BigInt(projectId),
          OR: [
            { tag_number: tag || undefined },
            { room_tenant: { contains: tenant || undefined } }
          ].filter(cond => cond.tag_number !== undefined || (cond.room_tenant as any)?.contains !== undefined)
        }
      });

      // 2. Auto-Create if missing
      if (!unit && options.autoCreateUnits && (tenant || tag)) {
        unit = await prisma.units.create({
          data: {
            project_ref_id: BigInt(projectId),
            customer_name: "Auto-Synced",
            room_tenant: tenant || "N/A",
            building_floor: floor || "N/A",
            tag_number: tag || `SYNC-${Date.now()}-${i}`,
            unit_type: syncType.toUpperCase().replace('PREVENTIVE_', ''),
            brand: "Daikin",
            model: model || "N/A",
            status: "Normal",
            location: "Jakarta"
          }
        });
        unitsCreated++;
      }

      if (!unit) {
        skippedRows++;
        continue;
      }

      // 3. Process Activity
      let activityDate = new Date();
      if (dateVal instanceof Date) activityDate = dateVal;
      else if (typeof dateVal === 'string') {
        const parsed = new Date(dateVal);
        if (!isNaN(parsed.getTime())) activityDate = parsed;
      } else if (typeof dateVal === 'number') {
        // Handle Excel date numbers if needed, but ExcelJS usually converts them to Date objects
        // However, if it's a serial number:
        const parsed = new Date((dateVal - 25569) * 86400 * 1000);
        if (!isNaN(parsed.getTime())) activityDate = parsed;
      }

      const syncTypeNormalized = (syncType === 'audit') ? 'Audit' : (syncType === 'corrective' || syncType === 'complaint_fcu') ? 'Corrective' : 'Preventive';

      // Check for existing
      let activity = await prisma.service_activities.findFirst({
        where: {
          unit_id: unit.id,
          type: syncTypeNormalized,
          service_date: {
            gte: new Date(new Date(activityDate).setHours(0,0,0,0)),
            lte: new Date(new Date(activityDate).setHours(23,59,59,999))
          },
          deleted_at: null
        }
      });

      if (!activity || options.overwriteExisting) {
        const technicalData: any = {};
        headerRow.eachCell((cell, colNumber) => {
          const key = String(cell.value || `col_${colNumber}`);
          const val = row.getCell(colNumber).value;
          technicalData[key] = val;
        });

        if (activity) {
          activity = await prisma.service_activities.update({
            where: { id: activity.id },
            data: {
              technical_json: JSON.stringify(technicalData),
              engineer_note: "Updated via Sync Center (ExcelJS)"
            }
          });
        } else {
          activity = await prisma.service_activities.create({
            data: {
              unit_id: unit.id,
              type: syncTypeNormalized,
              service_date: activityDate,
              inspector_name: "Sync Center Admin",
              engineer_note: `Imported via Sync Center (${syncType})`,
              technical_json: JSON.stringify(technicalData),
              status: "Completed"
            }
          });
        }
        activitiesSynced++;

        // 4. Extract and Sync Photos for this Row
        const uploadDir = path.join(process.cwd(), "public", "uploads", syncType);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        // Iterate through all cells in this row to find images
        for (let c = 1; c <= worksheet.columnCount; c++) {
          const cellKey = `${i}:${c}`;
          const images = imagesInCells.get(cellKey);
          
          if (images && images.length > 0) {
            for (const [idx, imgData] of images.entries()) {
              const fileName = `${syncType}_${unit.id}_${Date.now()}_${i}_${c}_${idx}.${imgData.extension}`;
              const filePath = path.join(uploadDir, fileName);
              fs.writeFileSync(filePath, imgData.buffer);

              await prisma.activity_photos.create({
                data: {
                  activity_id: activity.id,
                  type: syncTypeNormalized.toUpperCase(),
                  photo_url: `/uploads/${syncType}/${fileName}`,
                  caption: `Photo from Excel (Row ${i}, Col ${c})`,
                  media_type: "image"
                }
              });
              photosSynced++;
            }
          }
        }
      } else {
        // Skipped because already exists and overwrite is false
        skippedRows++;
      }

    } catch (err) {
      console.error(`[BULK_SYNC_ERROR] Row ${i}:`, err);
      errors++;
    }
  }

  revalidatePath("/dashboard");
  return { 
    success: true, 
    message: `Sync complete: ${totalRows} rows total. ${activitiesSynced} activities processed, ${unitsCreated} units created, ${skippedRows} rows skipped, ${photosSynced} photos extracted.`,
    errorCount: errors
  };
}
