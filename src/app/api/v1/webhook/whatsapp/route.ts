import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || "daikin_connect_secure_token_2026";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const messages = body.entry[0].changes[0].value.messages;
      if (messages && messages.length > 0) {
        const msg = messages[0];
        const from = msg.from;
        
        if (msg.type === 'text') {
          const text = msg.text.body;
          console.log("[WA Cloud] Message from " + from + ": " + text);
          
          let replyText = "Halo! Ini adalah sistem Daikin Connect yang baru berbasis Meta Cloud API.\n\nPesan Anda: *" + text + "*\n\nSistem AI sedang dalam pembaruan.";
          
          await sendWhatsAppMessage(from, replyText);
        }
      }
    }
    
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
}
