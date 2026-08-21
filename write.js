import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function GET() {
  const result = await sendWhatsAppMessage("088222202002", "Tes Token WhatsApp dari Robot");
  return NextResponse.json({ success: result });
}
