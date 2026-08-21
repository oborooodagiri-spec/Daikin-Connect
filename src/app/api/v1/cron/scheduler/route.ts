import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function GET() {
  try {
    const now = new Date();
    
    // Force timezone to WIB (Asia/Jakarta) regardless of VPS server timezone
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Some Node environments return "12.48", we ensure it's "12:48"
    const currentTime = formatter.format(now).replace('.', ':');
    
    console.log(`[Cron] Checking scheduler at ${currentTime}`);
    
    const projects = await prisma.projects.findMany({
      where: { wa_settings: { not: null } }
    });
    
    for (const project of projects) {
      if (!project.wa_settings) continue;
      let settings;
      try {
        if (typeof project.wa_settings === 'string') {
          settings = JSON.parse(project.wa_settings);
        } else {
          settings = project.wa_settings;
        }
      } catch(e) { continue; }
      
      if (settings.schedules && settings.schedules.includes(currentTime)) {
        console.log(`[Cron] Triggering Outstanding cases for Project: ${project.name}`);
        
        const allCases = await prisma.outstanding_cases.findMany({
          where: { project_id: project.id }
        });
        
        const pendingCases = allCases.filter((c: any) => c.status === "Pending");
        const completedCases = allCases.filter((c: any) => 
          c.status === "Completed" && 
          new Date(c.updated_at) >= new Date(new Date(now).setHours(0,0,0,0))
        );

        // if (pendingCases.length === 0) continue;

        let pendingStr = pendingCases.length > 0 
          ? pendingCases.map((c: any, i: number) => `${i+1}. ${c.title} ${c.unit_name ? '('+c.unit_name+')' : ''}`).join('\n')
          : "🎉 Semua pekerjaan telah selesai! Tidak ada Outstanding Case yang tertunda.";
          
        let completedStr = completedCases.length > 0 ? completedCases.map((c: any, i: number) => `- ${c.title}`).join('\n') : "Belum ada case diselesaikan hari ini.";
        
        const dateStr = now.toLocaleDateString('id-ID', { 
          timeZone: 'Asia/Jakarta',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        let template = settings.template || "";
        let message = template
          .replace('{{ProjectName}}', project.name || "Proyek")
          .replace('{{Date}}', dateStr)
          .replace('{{PendingList}}', pendingStr)
          .replace('{{CompletedList}}', completedStr);
          
        const numbers = settings.numbers || [];
        for (const num of numbers) {
          console.log(`[Cron] Sending to ${num}...`);
          await sendWhatsAppMessage(num, message);
        }
      }
    }
    
    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("[Cron] Error:", error);
    return new NextResponse(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
