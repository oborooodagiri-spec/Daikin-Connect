export async function sendWhatsAppMessage(to: string, text: string) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.error("Missing WhatsApp credentials");
    return false;
  }

  let cleanTo = to.replace(/\D/g, "");
  if (cleanTo.startsWith("0")) {
    cleanTo = "62" + cleanTo.substring(1);
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: { preview_url: false, body: text }
      }),
    });
    const data = await res.json();
    if (!res.ok) console.error("WA API Error:", data);
    return res.ok;
  } catch (err) {
    console.error("WA Error:", err);
    return false;
  }
}
