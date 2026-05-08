"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function getGlobalProjectIntelligence() {
  const session = await getSession();
  
  try {
    // ULTIMATE BYPASS: Using Raw SQL to avoid dependency on outdated generated Prisma Client
    const projects: any[] = await prisma.$queryRaw`
      SELECT p.id, p.name, c.name as customer_name 
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      ORDER BY p.name ASC
    `;

    const intelRecords: any[] = await prisma.$queryRaw`SELECT * FROM project_intelligence`;
    const issues: any[] = await prisma.$queryRaw`SELECT * FROM project_issues ORDER BY created_at ASC`;

    return {
      success: true,
      data: projects.map((p: any) => {
        const intel = intelRecords.find((r: any) => r.project_id.toString() === p.id.toString());
        return {
          id: p.id.toString(),
          projectName: p.name,
          customerName: p.customer_name || "No Customer Linked",
          intelligence: intel ? {
            ...intel,
            id: intel.id.toString(),
            projectId: intel.project_id.toString(),
          } : null,
          issues: issues
            .filter((i: any) => i.project_id.toString() === p.id.toString())
            .map((i: any) => ({
              ...i,
              id: i.id.toString(),
              projectId: i.project_id.toString()
            }))
        };
      })
    };
  } catch (err: any) {
    console.error("CRITICAL OPS ERROR:", err);
    return { error: `Database Error: ${err.message}` };
  }
}

export async function addProjectIssue(projectId: string, issueText: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Access Denied" };

  try {
    // Adding with default tactical values
    await prisma.$executeRaw`
      INSERT INTO project_issues (project_id, issue_text, status, urgency, action_status, outcome, created_at, updated_at)
      VALUES (${BigInt(projectId)}, ${issueText}, 'Todo', 'Normal', 'Pending', 'Ongoing', ${new Date()}, ${new Date()})
    `;
    revalidatePath(`/dashboard/operations`);
    return { success: true };
  } catch (err: any) {
    console.error("ADD ISSUE ERROR:", err);
    return { error: "Failed to add issue: " + err.message };
  }
}

export async function updateProjectIssue(issueId: string, data: any) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Access Denied" };

  try {
    const id = BigInt(issueId);
    
    // 1. Fetch current state to ensure no data is lost during partial update
    const current: any[] = await prisma.$queryRaw`SELECT * FROM project_issues WHERE id = ${id} LIMIT 1`;
    if (current.length === 0) return { error: "Issue not found" };
    const existing = current[0];

    // 2. Merge existing data with new updates
    const issueText = data.issue_text || existing.issue_text;
    const status = data.status || existing.status;
    const urgency = data.urgency || existing.urgency;
    const actionStatus = data.action_status || existing.action_status;
    const outcome = data.outcome || existing.outcome;
    const roadmapAction = data.roadmap_action !== undefined ? data.roadmap_action : existing.roadmap_action;
    const solutionText = data.solution_text !== undefined ? data.solution_text : existing.solution_text;

    // 3. Execute the merged update
    await prisma.$executeRaw`
      UPDATE project_issues 
      SET issue_text = ${issueText}, 
          solution_text = ${solutionText},
          urgency = ${urgency},
          action_status = ${actionStatus},
          outcome = ${outcome},
          roadmap_action = ${roadmapAction},
          status = ${status},
          updated_at = ${new Date()}
      WHERE id = ${id}
    `;
    
    revalidatePath(`/dashboard/operations`);
    return { success: true };
  } catch (err: any) {
    console.error("UPDATE ISSUE SQL ERROR:", err);
    return { error: "Database rejected the update: " + err.message };
  }
}

export async function deleteProjectIssue(issueId: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Access Denied" };

  try {
    await prisma.$executeRaw`
      DELETE FROM project_issues WHERE id = ${BigInt(issueId)}
    `;
    revalidatePath(`/dashboard/operations`);
    return { success: true };
  } catch (err: any) {
    console.error("DELETE ISSUE ERROR:", err);
    return { error: "Failed to delete issue: " + err.message };
  }
}

export async function updateProjectIntelligence(projectId: string, data: any) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Clearance Required" };

  try {
    const pId = BigInt(projectId);
    
    // Using Raw SQL Upsert pattern for maximum stability
    const existing: any[] = await prisma.$queryRaw`SELECT id FROM project_intelligence WHERE project_id = ${pId} LIMIT 1`;
    
    if (existing.length > 0) {
      await prisma.$executeRaw`
        UPDATE project_intelligence 
        SET strategic_status = ${data.strategic_status},
            health_score = ${data.health_score},
            bottlenecks = ${data.bottlenecks},
            stakeholders = ${data.stakeholders},
            impact_level = ${data.impact_level},
            action_status = ${data.action_status},
            last_update_note = ${data.last_update_note},
            updated_by_id = ${parseInt(session.userId)},
            updated_at = ${new Date()}
        WHERE project_id = ${pId}
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO project_intelligence 
        (project_id, strategic_status, health_score, bottlenecks, stakeholders, impact_level, action_status, last_update_note, updated_by_id, created_at, updated_at)
        VALUES 
        (${pId}, ${data.strategic_status}, ${data.health_score}, ${data.bottlenecks}, ${data.stakeholders}, ${data.impact_level}, ${data.action_status}, ${data.last_update_note}, ${parseInt(session.userId)}, ${new Date()}, ${new Date()})
      `;
    }

    revalidatePath(`/dashboard/operations`);
    return { success: true };
  } catch (err: any) {
    console.error("Update Intelligence Raw Error:", err);
    return { error: "Database Sync Failed: " + err.message };
  }
}
