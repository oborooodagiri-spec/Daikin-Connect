import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendWhatsAppInteractiveList } from '@/lib/whatsapp';
import { prisma } from '@/lib/prisma';

const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || "daikin_connect_secure_token_2026";


interface SessionData {
  step: string;
  timeoutId?: NodeJS.Timeout;
  [key: string]: any;
}

const sessions = new Map<string, SessionData>();

function setSessionTimeout(from: string, data: any) {
  const existing = sessions.get(from);
  if (existing && existing.timeoutId) {
    clearTimeout(existing.timeoutId);
  }
  
  const timeoutId = setTimeout(async () => {
    clearSession(from);
    try {
      await sendWhatsAppMessage(from, "?? Sesi percakapan Anda telah *berakhir otomatis* karena tidak ada aktivitas selama 5 menit.

Silakan klik tombol *Pilih Layanan* pada menu utama untuk memulai kembali.");
    } catch (e) { console.error(e); }
  }, 5 * 60 * 1000);

  setSessionTimeout(from, { ...data, timeoutId });
}

function clearSession(from: string) {
  const existing = sessions.get(from);
  if (existing && existing.timeoutId) {
    clearTimeout(existing.timeoutId);
  }
  clearSession(from);
}


export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  if (searchParams.get("hub.mode") === "subscribe" && searchParams.get("hub.verify_token") === VERIFY_TOKEN) {
    return new NextResponse(searchParams.get("hub.challenge"), { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
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

async function handleIncomingMessage(from: string, text: string) {
  
  let command = text.toUpperCase().trim();
  
  // Replaced with interactive list ID processing
  
  const session = sessions.get(from);


  if (command === "BANTUAN" || command === "MENU") {
    clearSession(from);
    await sendMenu(from);
    return;
  }

  if (command === "BERHENTI") {
    clearSession(from);
    await handleUnsubscribe(from);
    return;
  }

  if (command === "STATUS") {
    clearSession(from);
    await handleStatus(from);
    return;
  }

  if (command === "DAFTAR") {
    setSessionTimeout(from, { step: "AWAITING_CODE" });
    await sendWhatsAppMessage(from, "Silakan masukkan *Kode Undangan Proyek* Anda.\nHubungi admin proyek jika Anda belum memilikinya.");
    return;
  }

  if (command === "TAMBAH") {
    const subs = await prisma.wa_subscribers.findMany({ where: { phone: from, status: "Approved", registered: true } });
    if (subs.length === 0) {
      await sendWhatsAppMessage(from, "? Anda harus terdaftar dan disetujui (DAFTAR) terlebih dahulu untuk menambah kasus.");
      return;
    }
    if (subs.length > 1) {
      await sendWhatsAppMessage(from, "Anda terdaftar di >1 proyek. Fitur tambah via WA saat ini difokuskan untuk 1 proyek utama. Silakan gunakan website.");
      return;
    }
    setSessionTimeout(from, { step: "ADD_CASE_TITLE", projectId: subs[0].project_id, projectName: subs[0].projects?.name || "Proyek" });
    await sendWhatsAppMessage(from, "Silakan masukkan *Judul/Deskripsi Masalah* (contoh: AC Mati di Lantai 2):");
    return;
  }

  if (command === "SELESAI") {
    const subs = await prisma.wa_subscribers.findMany({ where: { phone: from, status: "Approved", registered: true } });
    if (subs.length === 0) {
      await sendWhatsAppMessage(from, "? Anda belum terdaftar.");
      return;
    }
    const projectId = subs[0].project_id;
    const pendingCases = await prisma.outstanding_cases.findMany({ where: { project_id: projectId, status: "Pending" } });
    if (pendingCases.length === 0) {
      await sendWhatsAppMessage(from, "Tidak ada kasus pending di proyek Anda saat ini.");
      return;
    }
    
    let listStr = pendingCases.map((c: any) => `ID: *${c.id}* - ${c.title}`).join('\n');
    setSessionTimeout(from, { step: "RESOLVE_CASE_ID", projectId });
    await sendWhatsAppMessage(from, `Silakan balas dengan *ID Kasus* yang sudah diselesaikan:\n\n${listStr}`);
    return;
  }

  // Handle active session
  if (session) {
    if (session.step === "AWAITING_CODE") {
      const project = await prisma.projects.findFirst({ where: { wa_invite_code: text } });
      if (!project) {
        await sendWhatsAppMessage(from, "? Kode tidak valid. Coba lagi atau ketik BANTUAN.");
        return;
      }
      
      const existing = await prisma.wa_subscribers.findFirst({ where: { phone: from, project_id: project.id } });
      if (existing) {
        clearSession(from);
        await sendWhatsAppMessage(from, "Anda sudah terdaftar. Status: *" + existing.status + "*.");
        return;
      }

      session.step = "AWAITING_NAME";
      session.projectId = project.id;
      session.projectName = project.name;
      setSessionTimeout(from, session);
      await sendWhatsAppMessage(from, "? Proyek ditemukan: *" + project.name + "*\n\nSilakan masukkan *Nama Lengkap* Anda:");
      return;
    }

    if (session.step === "AWAITING_NAME") {
      session.step = "AWAITING_COMPANY";
      session.name = text;
      setSessionTimeout(from, session);
      await sendWhatsAppMessage(from, "Silakan masukkan *Nama Perusahaan* Anda:");
      return;
    }

    if (session.step === "AWAITING_COMPANY") {
      session.company = text;
      clearSession(from);

      await prisma.wa_subscribers.create({
        data: {
          project_id: session.projectId,
          phone: from,
          name: session.name,
          company: session.company,
          status: "Pending",
          registered: true
        }
      });

      await sendWhatsAppMessage(from, "Pendaftaran Anda telah dikirim.\nStatus: *Menunggu Persetujuan Admin*");
      return;
    }

    if (session.step === "ADD_CASE_TITLE") {
      session.title = text;
      session.step = "ADD_CASE_UNIT";
      setSessionTimeout(from, session);
      await sendWhatsAppMessage(from, "Judul dicatat.\nSilakan masukkan *Nama Unit / Lokasi* (atau ketik '-' jika tidak ada):");
      return;
    }

    if (session.step === "ADD_CASE_UNIT") {
      const unit = text === "-" ? "" : text;
      clearSession(from);
      
      await prisma.outstanding_cases.create({
        data: {
          project_id: session.projectId,
          title: session.title,
          unit_name: unit,
          status: "Pending",
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      await sendWhatsAppMessage(from, `? Kasus baru berhasil ditambahkan untuk proyek *${session.projectName}*.`);
      return;
    }

    if (session.step === "RESOLVE_CASE_ID") {
      clearSession(from);
      const caseId = parseInt(text);
      if (isNaN(caseId)) {
        await sendWhatsAppMessage(from, "? Format ID salah. Harus berupa angka. Ketik SELESAI untuk mencoba lagi.");
        return;
      }
      
      const targetCase = await prisma.outstanding_cases.findFirst({ where: { id: BigInt(caseId), project_id: session.projectId, status: "Pending" } });
      if (!targetCase) {
        await sendWhatsAppMessage(from, "? ID tidak ditemukan atau sudah selesai.");
        return;
      }

      await prisma.outstanding_cases.update({
        where: { id: targetCase.id },
        data: { status: "Completed", updated_at: new Date() }
      });
      await sendWhatsAppMessage(from, `? Kasus *${targetCase.title}* berhasil ditandai selesai!`);
      return;
    }
  }

  await sendMenu(from);
}

async function sendMenu(from: string) {
  const sections = [
    {
      title: "Layanan Laporan",
      rows: [
        { id: "DAFTAR", title: "Registrasi", description: "Daftar untuk menerima laporan otomatis" },
        { id: "STATUS", title: "Cek Outstanding", description: "Lihat status kasus saat ini" },
        { id: "BERHENTI", title: "Berhenti Langganan", description: "Cabut akses notifikasi proyek" }
      ]
    },
    {
      title: "Manajemen Kasus",
      rows: [
        { id: "TAMBAH", title: "Lapor Kasus Baru", description: "Tambahkan kasus baru ke sistem" },
        { id: "SELESAI", title: "Tandai Selesai", description: "Tandai kasus yang sudah beres" }
      ]
    }
  ];
  
  await sendWhatsAppInteractiveList(
    from, 
    "Main Menu", 
    `Selamat datang di *DSSI Connect*.
Silakan pilih layanan yang ingin Anda gunakan dari menu di bawah ini:`, 
    "? Pilih Layanan", 
    sections
  );
}

async function handleUnsubscribe(from: string) {
  const updated = await prisma.wa_subscribers.updateMany({ where: { phone: from, registered: true }, data: { registered: false } });
  if (updated.count > 0) await sendWhatsAppMessage(from, "? Anda telah berhenti menerima laporan.");
  else await sendWhatsAppMessage(from, "Anda tidak sedang berlangganan.");
}

async function handleStatus(from: string) {
  const subscriptions = await prisma.wa_subscribers.findMany({ where: { phone: from, status: "Approved", registered: true }, include: { projects: true } });
  if (subscriptions.length === 0) {
    await sendWhatsAppMessage(from, "Anda belum terdaftar dan disetujui di proyek manapun.");
    return;
  }
  for (const sub of subscriptions) {
    const allCases = await prisma.outstanding_cases.findMany({ where: { project_id: sub.project_id } });
    const now = new Date();
    const pendingCases = allCases.filter((c: any) => c.status === "Pending");
    const completedCases = allCases.filter((c: any) => c.status === "Completed" && new Date(c.updated_at) >= new Date(new Date(now).setHours(0,0,0,0)));
    
    let pendingStr = pendingCases.length > 0 ? pendingCases.map((c: any, i: number) => (i+1) + ". " + c.title).join('\n') : "Tidak ada kasus pending.";
    let completedStr = completedCases.length > 0 ? completedCases.map((c: any, i: number) => "- " + c.title).join('\n') : "Belum ada case diselesaikan hari ini.";
    
    const msg = "*Outstanding Cases � " + sub.projects.name + "*\n\n*Pending (" + pendingCases.length + "):*\n" + pendingStr + "\n\n*Selesai hari ini (" + completedCases.length + "):*\n" + completedStr;
    await sendWhatsAppMessage(from, msg);
  }
}
