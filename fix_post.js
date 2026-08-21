const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/webhook/whatsapp/route.ts', 'utf8');

// Fix the POST handler completely
const oldPost = /export async function POST[\s\S]*?async function handleIncomingMessage/m;
const newPost = `export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const messages = body.entry[0].changes[0].value.messages;
      if (messages && messages.length > 0) {
        const msg = messages[0];
        if (msg.type === 'text') {
          await handleIncomingMessage(msg.from, msg.text.body.trim());
        } else if (msg.type === 'interactive' && msg.interactive.type === 'list_reply') {
          await handleIncomingMessage(msg.from, msg.interactive.list_reply.id);
        }
      }
    }
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

async function handleIncomingMessage`;

code = code.replace(oldPost, newPost);
fs.writeFileSync('src/app/api/v1/webhook/whatsapp/route.ts', code, 'utf8');
