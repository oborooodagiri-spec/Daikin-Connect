const fs = require('fs');
const content = `"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

function generateRandomCode(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return \`\${prefix.substring(0, 3).toUpperCase()}-\${code}\`;
}

export async function getProjectWaSubscribers(projectId: string | number | bigint) {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized." };
    }

    const subscribers = await prisma.wa_subscribers.findMany({
      where: { project_id: BigInt(projectId) },
      orderBy: { created_at: 'desc' }
    });

    const project = await prisma.projects.findUnique({
      where: { id: BigInt(projectId) },
      select: { wa_invite_code: true, name: true, code: true }
    });

    return { 
      success: true, 
      data: subscribers.map(s => ({
        ...s,
        id: s.id.toString(),
        project_id: s.project_id.toString(),
        created_at: s.created_at.toISOString(),
        approved_at: s.approved_at?.toISOString()
      })),
      inviteCode: project?.wa_invite_code || null,
      projectCode: project?.code || project?.name?.substring(0, 3).toUpperCase()
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateProjectInviteCode(projectId: string | number | bigint) {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized." };
    }

    const project = await prisma.projects.findUnique({
      where: { id: BigInt(projectId) },
      select: { name: true, code: true }
    });

    if (!project) return { success: false, error: "Project not found" };

    const prefix = project.code || project.name;
    const newCode = generateRandomCode(prefix);

    await prisma.projects.update({
      where: { id: BigInt(projectId) },
      data: { wa_invite_code: newCode }
    });

    revalidatePath(`/w/${projectId}/client/dashboard`);
    revalidatePath(`/w/${projectId}/dashboard`);

    return { success: true, code: newCode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveSubscriber(id: string, projectId: string) {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized." };
    }

    const adminName = session.user?.name || "Admin";

    const sub = await prisma.wa_subscribers.update({
      where: { id: BigInt(id) },
      data: { 
        status: "Approved", 
        registered: true,
        approved_by: adminName,
        approved_at: new Date()
      },
      include: { projects: true }
    });

    const msg = `? *Pendaftaran Disetujui*\n\nHalo ${sub.name}, pendaftaran Anda untuk menerima laporan otomatis proyek *${sub.projects.name}* telah disetujui oleh admin.\n\nAnda akan mulai menerima laporan sesuai jadwal. Ketik *STATUS* kapan saja untuk melihat update.`;
    await sendWhatsAppMessage(sub.phone, msg);

    revalidatePath(`/w/${projectId}/client/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectSubscriber(id: string, projectId: string) {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized." };
    }

    const sub = await prisma.wa_subscribers.update({
      where: { id: BigInt(id) },
      data: { 
        status: "Rejected", 
        registered: false
      },
      include: { projects: true }
    });

    const msg = `? *Pendaftaran Ditolak*\n\nMohon maaf ${sub.name}, pendaftaran Anda untuk proyek *${sub.projects.name}* tidak dapat disetujui saat ini. Silakan hubungi admin proyek untuk informasi lebih lanjut.`;
    await sendWhatsAppMessage(sub.phone, msg);

    revalidatePath(`/w/${projectId}/client/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function revokeSubscriber(id: string, projectId: string) {
  try {
    const session = await getSession();
    if (!session?.isInternal) {
      return { success: false, error: "Unauthorized." };
    }

    const sub = await prisma.wa_subscribers.update({
      where: { id: BigInt(id) },
      data: { 
        registered: false
      },
      include: { projects: true }
    });

    const msg = `?? *Akses Dicabut*\n\nAkses Anda untuk menerima laporan proyek *${sub.projects.name}* telah dihentikan oleh admin.`;
    await sendWhatsAppMessage(sub.phone, msg);

    revalidatePath(`/w/${projectId}/client/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
`;
fs.writeFileSync('src/app/actions/wa-subscribers.ts', content, 'utf8');
