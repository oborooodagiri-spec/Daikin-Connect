"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

import fs from 'fs';
import path from 'path';

export async function getOutstandingCases(projectId: string | number | bigint) {
  try {
    const cases = await prisma.outstanding_cases.findMany({
      where: {
        project_id: BigInt(projectId),
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return {
      success: true,
      data: cases.map(c => ({
        ...c,
        id: c.id.toString(),
        project_id: c.project_id.toString(),
      }))
    };
  } catch (error: any) {
    console.error("getOutstandingCases error:", error);
    return { success: false, error: error.message };
  }
}

export async function addOutstandingCase(data: { project_id: string | number | bigint, title: string, unit_name?: string }) {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized. Only internal staff can add cases." };
    }

    const newCase = await prisma.outstanding_cases.create({
      data: {
        project_id: BigInt(data.project_id),
        title: data.title,
        unit_name: data.unit_name || null,
        status: "Pending"
      }
    });

    revalidatePath(`/w/${data.project_id}/client/dashboard`);
    revalidatePath(`/w/${data.project_id}/dashboard`);

    return { success: true, data: { ...newCase, id: newCase.id.toString(), project_id: newCase.project_id.toString() } };
  } catch (error: any) {
    console.error("addOutstandingCase error:", error);
    return { success: false, error: error.message };
  }
}

export async function resolveOutstandingCase(id: string | number | bigint, projectId: string | number | bigint) {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized. Only internal staff can resolve cases." };
    }

    await prisma.outstanding_cases.update({
      where: { id: BigInt(id) },
      data: { status: "Completed" }
    });

    revalidatePath(`/w/${projectId}/client/dashboard`);
    revalidatePath(`/w/${projectId}/dashboard`);

    return { success: true };
  } catch (error: any) {
    console.error("resolveOutstandingCase error:", error);
    return { success: false, error: error.message };
  }
}

export async function getProjectWaTargets(projectId: string | number | bigint) {
  try {
    const project = await prisma.projects.findUnique({
      where: { id: BigInt(projectId) },
      select: { wa_settings: true }
    });
    
    const defaultSettings = {
      numbers: [],
      groups: [],
      schedules: ["06:00", "18:00"],
      template: "*OUTSTANDING CASE REPORT*\nProyek: {{ProjectName}}\nTanggal: {{Date}}\n\n*DAFTAR OUTSTANDING PENDING*:\n{{PendingList}}\n\n*DISELESAIKAN HARI INI*:\n{{CompletedList}}\nMohon kerja samanya untuk segera menyelesaikan case yang masih pending.\nPesan ini dikirim secara otomatis oleh Robot Daikin Connect."
    };

    return { success: true, data: project?.wa_settings || defaultSettings };
  } catch (error: any) {
    console.error("getProjectWaTargets error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProjectWaTargets(projectId: string | number | bigint, settings: any) {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized." };
    }

    await prisma.projects.update({
      where: { id: BigInt(projectId) },
      data: { wa_settings: settings }
    });

    revalidatePath(`/w/${projectId}/client/dashboard`);
    revalidatePath(`/w/${projectId}/dashboard`);

    return { success: true };
  } catch (error: any) {
    console.error("updateProjectWaTargets error:", error);
    return { success: false, error: error.message };
  }
}

export async function getWaBotStatus() {
  try {
    const statusFilePath = path.join(process.cwd(), 'public', 'wa-status.json');
    if (!fs.existsSync(statusFilePath)) {
      return { success: true, data: { status: "DISCONNECTED", qr_string: "", command: "" } };
    }
    const data = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutWaBot() {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized." };
    }

    const statusFilePath = path.join(process.cwd(), 'public', 'wa-status.json');
    if (fs.existsSync(statusFilePath)) {
      const data = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
      data.command = "LOGOUT";
      fs.writeFileSync(statusFilePath, JSON.stringify(data));
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
