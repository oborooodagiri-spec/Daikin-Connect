const fs = require('fs');

// 1. UPDATE lib/whatsapp.ts
let waCode = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

if (!waCode.includes('sendWhatsAppInteractiveList')) {
  const interactiveFunction = `
export async function sendWhatsAppInteractiveList(to: string, header: string, bodyText: string, buttonText: string, sections: any[]) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneId) return false;

  let cleanTo = to.replace(/\\D/g, "");
  if (cleanTo.startsWith("0")) cleanTo = "62" + cleanTo.substring(1);

  try {
    const res = await fetch(\`https://graph.facebook.com/v19.0/\${phoneId}/messages\`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "interactive",
        interactive: {
          type: "list",
          header: { type: "text", text: header.substring(0, 60) },
          body: { text: bodyText },
          footer: { text: "DSSI Connect by Daikin" },
          action: {
            button: buttonText.substring(0, 20),
            sections: sections
          }
        }
      }),
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}
`;
  waCode += interactiveFunction;
  fs.writeFileSync('src/lib/whatsapp.ts', waCode);
}
