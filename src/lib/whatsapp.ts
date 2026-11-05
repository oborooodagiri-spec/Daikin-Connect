export async function sendWhatsAppMessage(to: string, text: string) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.error("[WA] Missing WhatsApp credentials (WA_ACCESS_TOKEN or WA_PHONE_NUMBER_ID)");
    return false;
  }

  let cleanTo = to.replace(/\D/g, "");
  if (cleanTo.startsWith("0")) {
    cleanTo = "62" + cleanTo.substring(1);
  }

  console.log(`[WA] Attempting to send WhatsApp message to ${cleanTo}...`);

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
    if (!res.ok) {
      console.error("[WA API Error]:", JSON.stringify(data));
      return false;
    }
    console.log(`[WA] Message sent successfully to ${cleanTo} (id: ${data.messages?.[0]?.id || "ok"})`);
    return true;
  } catch (err) {
    console.error("[WA Network Error]:", err);
    return false;
  }
}

export async function sendWhatsAppTemplate(to: string, templateName: string, params: string[], languageCode: string = "en") {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.error("[WA] Missing WhatsApp credentials (WA_ACCESS_TOKEN or WA_PHONE_NUMBER_ID)");
    return false;
  }

  let cleanTo = to.replace(/\D/g, "");
  if (cleanTo.startsWith("0")) {
    cleanTo = "62" + cleanTo.substring(1);
  }

  console.log(`[WA] Attempting to send Template '${templateName}' (${languageCode}) to ${cleanTo}...`);

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
    if (!res.ok) {
      console.error(`[WA Template Error - ${templateName}]:`, JSON.stringify(data));
      return false;
    }
    console.log(`[WA] Template '${templateName}' sent successfully to ${cleanTo} (id: ${data.messages?.[0]?.id || "ok"})`);
    return true;
  } catch (err) {
    console.error(`[WA Template Network Error - ${templateName}]:`, err);
    return false;
  }
}

export async function sendWhatsAppInteractiveList(to: string, header: string, bodyText: string, buttonText: string, sections: any[]) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneId) return false;

  let cleanTo = to.replace(/\D/g, "");
  if (cleanTo.startsWith("0")) cleanTo = "62" + cleanTo.substring(1);

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


export async function sendWhatsAppAuthTemplate(to: string, otpCode: string) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneId) return false;

  let cleanTo = to.replace(/\D/g, "");
  if (cleanTo.startsWith("0")) cleanTo = "62" + cleanTo.substring(1);

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
        type: "template",
        template: {
          name: "otp_auth",
          language: { code: "id" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: otpCode }]
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: otpCode }]
            }
          ]
        }
      }),
    });
    const data = await res.json();
    if (!res.ok) console.error("WA Auth Template Error:", JSON.stringify(data, null, 2));
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * Notifikasi Permintaan Akses Baru Diterima
 */
export async function sendWhatsAppRegistrationReceived(to: string, name: string) {
  if (!to) return false;
  // Try approved Meta Template first
  const templateSent = await sendWhatsAppTemplate(to, "dssi_registration_received", [name], "id");
  if (templateSent) return true;

  // Fallback to text message
  const text = `*DSSI CONNECT - PEMBERITAHUAN PERMINTAAN AKSES*

Yth. *${name}*,

Permintaan akses akun Anda untuk portal DSSI Connect telah berhasil kami terima.

Status: Menunggu Peninjauan Administrator

Permohonan Anda saat ini sedang dalam proses verifikasi oleh tim Administrator. Pemberitahuan resmi akan dikirimkan kepada Anda setelah proses verifikasi selesai.

Terima kasih.
PT Daikin Applied Solutions Indonesia`;

  return sendWhatsAppMessage(to, text);
}

/**
 * Notifikasi Akun Disetujui & Aktif (Approved)
 */
export async function sendWhatsAppAccountApproved(to: string, name: string, role: string) {
  if (!to) return false;
  // Try approved Meta Template first (dssi_account_approve)
  const templateSent = await sendWhatsAppTemplate(to, "dssi_account_approve", [name, role], "id");
  if (templateSent) return true;

  // Fallback to text message
  const baseUrl = process.env.APP_URL || 'https://dconnect.id';
  const text = `*DSSI CONNECT - PEMBERITAHUAN AKTIVASI AKUN*

Yth. *${name}*,

Akun Anda pada portal DSSI Connect telah disetujui dan saat ini berstatus AKTIF dengan peran sebagai ${role}.

Anda dapat mengakses sistem dengan menggunakan alamat email dan kata sandi yang telah Anda daftarkan melalui portal:
${baseUrl}

Terima kasih.
PT Daikin Applied Solutions Indonesia`;

  return sendWhatsAppMessage(to, text);
}

/**
 * Notifikasi Akun Dinonaktifkan (Suspended)
 */
export async function sendWhatsAppAccountSuspended(to: string, name: string) {
  if (!to) return false;
  // Try approved Meta Template first
  const templateSent = await sendWhatsAppTemplate(to, "dssi_account_suspended", [name], "id");
  if (templateSent) return true;

  // Fallback to text message
  const text = `*DSSI CONNECT - PEMBERITAHUAN PENANGGUHAN AKUN*

Yth. *${name}*,

Kami menginformasikan bahwa status akses akun Anda pada portal DSSI Connect saat ini telah dinonaktifkan oleh Administrator.

Apabila Anda memerlukan informasi lebih lanjut mengenai status akun Anda, silakan menghubungi pihak Administrator terkait.

Terima kasih.
PT Daikin Applied Solutions Indonesia`;

  return sendWhatsAppMessage(to, text);
}

/**
 * Notifikasi Permintaan Reset Password
 */
export async function sendWhatsAppPasswordReset(to: string, name: string, resetLink: string) {
  if (!to) return false;
  // Try approved Meta Template first
  const templateSent = await sendWhatsAppTemplate(to, "dssi_password_reset", [name, resetLink], "id");
  if (templateSent) return true;

  // Fallback to text message
  const text = `*DSSI CONNECT - PERMINTAAN ATUR ULANG KATA SANDI*

Yth. *${name}*,

Kami menerima permohonan untuk mengatur ulang kata sandi akun DSSI Connect Anda.

Silakan gunakan tautan berikut untuk memperbarui kata sandi Anda (tautan berlaku selama 1 jam):
${resetLink}

Apabila Anda tidak merasa melakukan permohonan ini, silakan abaikan pesan ini demi keamanan akun Anda.

Terima kasih.
PT Daikin Applied Solutions Indonesia`;

  return sendWhatsAppMessage(to, text);
}
