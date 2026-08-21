const fs = require('fs');

// 1. UPDATE lib/whatsapp.ts to add sendWhatsAppTemplate function
let waCode = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

if (!waCode.includes('sendWhatsAppTemplate')) {
  const templateFunction = `
export async function sendWhatsAppTemplate(to: string, templateName: string, params: string[], languageCode: string = "en") {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.error("Missing WhatsApp credentials");
    return false;
  }

  let cleanTo = to.replace(/\\D/g, "");
  if (cleanTo.startsWith("0")) {
    cleanTo = "62" + cleanTo.substring(1);
  }

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
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters: params.map(p => ({ type: "text", text: p.substring(0, 1024) }))
            }
          ]
        }
      }),
    });
    const data = await res.json();
    if (!res.ok) console.error("WA Template Error:", JSON.stringify(data, null, 2));
    return res.ok;
  } catch (err) {
    console.error("WA Error:", err);
    return false;
  }
}
`;
  waCode += templateFunction;
  fs.writeFileSync('src/lib/whatsapp.ts', waCode);
}
