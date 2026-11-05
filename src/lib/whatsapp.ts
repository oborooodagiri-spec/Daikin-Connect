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

export async function sendWhatsAppTemplate(to: string, templateName: string, params: string[], languageCode: string = "en") {
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
  const text = `*DSSI CONNECT - PERMINTAAN AKSES DITERIMA*

Halo *${name}*,

Permintaan akses akun Anda untuk platform *DSSI Connect* telah berhasil kami terima.

📋 *Status:* Menunggu Peninjauan Administrator

Tim Administrator akan segera meninjau permohonan akses Anda. Anda akan menerima pemberitahuan otomatis segera setelah akun Anda disetujui.

Terima kasih,
*PT. Daikin Airconditioning Indonesia / DSSI*`;

  return sendWhatsAppMessage(to, text);
}

/**
 * Notifikasi Akun Disetujui & Aktif (Approved)
 */
export async function sendWhatsAppAccountApproved(to: string, name: string, role: string) {
  if (!to) return false;
  const baseUrl = process.env.APP_URL || 'https://dconnect.id';
  const text = `*DSSI CONNECT - AKUN TELAH AKTIF*

Selamat, *${name}*! 🎉

Akun Anda di platform *DSSI Connect* telah *DISETUJUI* dan kini berstatus *AKTIF*.

👤 *Detail Akun:*
• Nama: ${name}
• Peran (Role): ${role}
• Portal Login: ${baseUrl}

Anda sekarang dapat login ke portal DSSI Connect menggunakan alamat email dan kata sandi yang telah Anda daftarkan.

Salam hangat,
*Tim DSSI Connect*`;

  return sendWhatsAppMessage(to, text);
}

/**
 * Notifikasi Akun Dinonaktifkan (Suspended)
 */
export async function sendWhatsAppAccountSuspended(to: string, name: string) {
  if (!to) return false;
  const text = `*DSSI CONNECT - PEMBERITAHUAN AKUN*

Halo *${name}*,

Kami menginformasikan bahwa akses akun Anda di platform *DSSI Connect* saat ini telah *DINONAKTIFKAN (SUSPENDED)* oleh Administrator.

Apabila Anda memerlukan klarifikasi atau menganggap hal ini sebagai kekeliruan, silakan hubungi tim Administrator DSSI Connect.

Terima kasih,
*Tim DSSI Connect*`;

  return sendWhatsAppMessage(to, text);
}

/**
 * Notifikasi Permintaan Reset Password
 */
export async function sendWhatsAppPasswordReset(to: string, name: string, resetLink: string) {
  if (!to) return false;
  const text = `*DSSI CONNECT - ATUR ULANG KATA SANDI*

Halo *${name}*,

Kami menerima permintaan untuk mengatur ulang kata sandi akun *DSSI Connect* Anda.

Silakan klik tautan berikut untuk membuat kata sandi baru (tautan berlaku selama 1 jam):
${resetLink}

Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan pesan ini demi keamanan akun Anda.

Terima kasih,
*Tim DSSI Connect*`;

  return sendWhatsAppMessage(to, text);
}
