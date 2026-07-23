import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = "daikin_connect_secure_token_2026";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WhatsApp WEBHOOK_VERIFIED successfully");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Log incoming messages or status updates for debugging
    console.log("WhatsApp Webhook Received:", JSON.stringify(body, null, 2));
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    return new NextResponse("Error processing webhook", { status: 500 });
  }
}
