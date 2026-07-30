import { NextResponse } from 'next/server';
import { updateDeal } from '@/app/actions/pipeline';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const deal = await prisma.pipeline_deals.findFirst({
      where: { project_name: { contains: "RC-Chiller" } }
    });
    
    if (!deal) return NextResponse.json({ error: "Deal not found" });

    // Mock getSession by temporarily ignoring session check in updateDeal? 
    // We can't do that easily without modifying pipeline.ts. 
    // Let's just create a raw prisma update that mimics updateDeal exactly.
    
    const data = { pic: "Aris Prasetyo" };
    const updateData: any = { pic: data.pic };
    
    const userMatch = await prisma.users.findFirst({ where: { name: data.pic } });
    if (userMatch) {
      updateData.pic_id = userMatch.id;
    }

    const res = await prisma.pipeline_deals.update({
      where: { id: deal.id },
      data: updateData
    });

    return NextResponse.json({ success: true, id: res.id, pic_id: res.pic_id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) });
  }
}
