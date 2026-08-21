import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false });
  const currentTime = formatter.format(now).replace('.', ':');
  
  const projects = await prisma.projects.findMany({ where: { wa_settings: { not: null } } });
  
  let results = [];
  for (const project of projects) {
      if (!project.wa_settings) continue;
      let settings = typeof project.wa_settings === 'string' ? JSON.parse(project.wa_settings) : project.wa_settings;
      
      const allCases = await prisma.outstanding_cases.findMany({ where: { project_id: project.id } });
      const pendingCases = allCases.filter((c: any) => c.status === "Pending");
      
      results.push({
          projectName: project.name,
          settingsSchedules: settings.schedules,
          pendingCount: pendingCases.length,
          allCount: allCases.length
      });
  }
  
  return NextResponse.json({
      serverTimeUtc: now.toISOString(),
      wibTime: currentTime,
      projects: results
  });
}
