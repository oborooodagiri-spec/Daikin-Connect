import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/lib/whatsapp';

export async function GET() {
  try {
    const now = new Date();
    
    // Force timezone to WIB (Asia/Jakarta)
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const currentTime = formatter.format(now).replace('.', ':');
    console.log("[Cron] Checking scheduler at " + currentTime);
    
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
        console.log("[Cron] Triggering Outstanding cases for Project: " + project.name);
        
        const allCases = await prisma.outstanding_cases.findMany({
          where: { project_id: project.id }
        });
        
        const pendingCases = allCases.filter((c: any) => c.status === "Pending");
        const completedCases = allCases.filter((c: any) => 
          c.status === "Completed" && 
          new Date(c.updated_at) >= new Date(new Date(now).setHours(0,0,0,0))
        );

        if (pendingCases.length === 0) continue;

        let pendingStr = pendingCases.map((c: any, i: number) => (i+1) + ". " + c.title + (c.unit_name ? ' ('+c.unit_name+')' : '')).join('\n');
        let completedStr = completedCases.length > 0 ? completedCases.map((c: any, i: number) => "- " + c.title).join('\n') : "Belum ada case diselesaikan hari ini.";
        
        // WhatsApp templates reject newlines in variables. Create a flattened version for the template.
        let templatePendingStr = pendingCases.map((c: any, i: number) => (i+1) + ". " + c.title).join(', ');
        if (templatePendingStr.length > 1000) templatePendingStr = templatePendingStr.substring(0, 995) + "...";
        let templateCompletedStr = completedCases.length > 0 ? completedCases.map((c: any) => c.title).join(', ') : "Belum ada";
        if (templateCompletedStr.length > 1000) templateCompletedStr = templateCompletedStr.substring(0, 995) + "...";

        const dateStr = now.toLocaleDateString('id-ID', { 
          timeZone: 'Asia/Jakarta', year: 'numeric', month: 'long', day: 'numeric' 
        });
        
        const param1 = project.name || "Proyek";
        const param2 = dateStr;
          
        // Merge manual numbers with subscribers and normalize to 62...
        const manualNumbers = settings.numbers || [];
        const subscribers = await prisma.wa_subscribers.findMany({
          where: { project_id: project.id, status: "Approved", registered: true }
        });
        
        const normalizePhone = (p: string) => {
          let num = p.replace(/\D/g, '');
          if (num.startsWith('0')) return '62' + num.substring(1);
          return num;
        };
        
        const allNumbers = [...new Set([...manualNumbers.map(normalizePhone), ...subscribers.map(s => normalizePhone(s.phone))])];

        for (const num of allNumbers) {
          console.log("[Cron] Sending to " + num + "...");
          // Try template first using the flattened strings
          const templateSuccess = await sendWhatsAppTemplate(num, "outstanding_report", [param1, param2, templatePendingStr, templateCompletedStr], "en");
          if (!templateSuccess) {
            console.log("[Cron] Template failed. Falling back to standard text message for " + num);
            // Fallback uses the nicely formatted strings with newlines
            const fallbackMessage = `*Outstanding Cases - ${param1}*\nDate: ${param2}\n\n*Pending Cases:*\n${pendingStr}\n\n*Completed Today:*\n${completedStr}`;
            await sendWhatsAppMessage(num, fallbackMessage);
          }
        }
      }
    }
    
    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("[Cron] Error:", error);
    return new NextResponse(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
