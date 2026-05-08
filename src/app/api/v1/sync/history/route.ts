import { NextRequest, NextResponse } from "next/server";
import { importMaintenanceHistoryExcel } from "@/app/actions/units";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for large imports

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await importMaintenanceHistoryExcel(formData);
    
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Sync Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal Server Error during sync" 
    }, { status: 500 });
  }
}
