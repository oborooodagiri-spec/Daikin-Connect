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
      await sendWhatsAppMessage(from, "Your conversation session has automatically expired due to 5 minutes of inactivity.\n\nPlease type 'Menu' to start again.");
    } catch (e) { console.error(e); }
  }, 5 * 60 * 1000);

  sessions.set(from, { ...data, timeoutId });
}

function clearSession(from: string) {
  const existing = sessions.get(from);
  if (existing && existing.timeoutId) {
    clearTimeout(existing.timeoutId);
  }
  sessions.delete(from);
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
  const session = sessions.get(from);
  let command = text.trim();

  // 1. Top level commands
  if (command.toUpperCase() === "MENU" || command.toUpperCase() === "BANTUAN" || command === "MAIN_MENU") {
    clearSession(from);
    await sendMainMenu(from);
    return;
  }

  if (command === "MAIN_INFO") {
    clearSession(from);
    await sendWhatsAppMessage(from, "For further information or technical support, please contact our team via email at info@dconnect.id. We are ready to assist you.");
    return;
  }

  if (command === "MAIN_PROJECTS") {
    clearSession(from);
    await sendProjectListMenu(from);
    return;
  }

  if (command === "PROJ_ADD") {
    setSessionTimeout(from, { step: "AWAITING_CODE" });
    await sendWhatsAppMessage(from, "Please enter your Project Code:\n(Contact your project administrator if you do not have one)");
    return;
  }

  if (command.startsWith("PROJ_SEL_")) {
    clearSession(from);
    const projectId = command.replace("PROJ_SEL_", "");
    await sendProjectFeaturesMenu(from, projectId);
    return;
  }

  if (command.startsWith("FEAT_OUTSTANDING_")) {
    clearSession(from);
    const projectId = command.replace("FEAT_OUTSTANDING_", "");
    await sendOutstandingCasesMenu(from, projectId);
    return;
  }

  if (command.startsWith("OUT_STATUS_")) {
    clearSession(from);
    const projectId = command.replace("OUT_STATUS_", "");
    await handleOutstandingStatus(from, projectId);
    return;
  }

  if (command.startsWith("OUT_UNSUB_")) {
    clearSession(from);
    const projectId = command.replace("OUT_UNSUB_", "");
    await handleUnsubscribe(from, projectId);
    return;
  }

  if (command.startsWith("OUT_ADD_")) {
    const projectId = command.replace("OUT_ADD_", "");
    const project = await prisma.projects.findUnique({ where: { id: BigInt(projectId) } });
    setSessionTimeout(from, { step: "ADD_CASE_TITLE", projectId: BigInt(projectId), projectName: project?.name || "Project" });
    await sendWhatsAppMessage(from, "Please enter the Case Title or Description:\n(Example: AC leaking on Level 2)");
    return;
  }

  if (command.startsWith("OUT_RESOLVE_")) {
    const projectId = command.replace("OUT_RESOLVE_", "");
    const pendingCases = await prisma.outstanding_cases.findMany({ where: { project_id: BigInt(projectId), status: "Pending" } });
    
    if (pendingCases.length === 0) {
      await sendWhatsAppMessage(from, "There are no pending cases for this project at the moment.");
      return;
    }
    
    let listStr = pendingCases.map((c: any) => `ID: *${c.id}* - ${c.title}`).join('\n');
    setSessionTimeout(from, { step: "RESOLVE_CASE_ID", projectId: BigInt(projectId) });
    await sendWhatsAppMessage(from, `Please reply with the *Case ID* that has been resolved:\n\n${listStr}`);
    return;
  }

  // 2. Handle active sessions (text input flows)
  if (session) {
    if (session.step === "AWAITING_CODE") {
      const project = await prisma.projects.findFirst({ where: { wa_invite_code: text } });
      if (!project) {
        await sendWhatsAppMessage(from, "Invalid Project Code. Please try again or type MENU to cancel.");
        return;
      }
      
      const existing = await prisma.wa_subscribers.findFirst({ where: { phone: from, project_id: project.id } });
      if (existing) {
        clearSession(from);
        await sendWhatsAppMessage(from, `You are already registered for ${project.name}. Your status is: *${existing.status}*.`);
        return;
      }

      session.step = "AWAITING_NAME";
      session.projectId = project.id;
      session.projectName = project.name;
      setSessionTimeout(from, session);
      await sendWhatsAppMessage(from, `Project found: *${project.name}*\n\nPlease enter your *Full Name*:`);
      return;
    }

    if (session.step === "AWAITING_NAME") {
      session.step = "AWAITING_COMPANY";
      session.name = text;
      setSessionTimeout(from, session);
      await sendWhatsAppMessage(from, "Please enter your *Company Name*:");
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

      await sendWhatsAppMessage(from, "Your registration has been submitted.\nStatus: *Waiting for Admin Approval*\n\nYou will receive a notification once approved.");
      return;
    }

    if (session.step === "ADD_CASE_TITLE") {
      session.title = text;
      session.step = "ADD_CASE_UNIT";
      setSessionTimeout(from, session);
      await sendWhatsAppMessage(from, "Title recorded.\nPlease enter the *Unit Name / Location*:\n(Or type '-' if none)");
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
      await sendWhatsAppMessage(from, `New case successfully added for project *${session.projectName}*.`);
      return;
    }

    if (session.step === "RESOLVE_CASE_ID") {
      clearSession(from);
      const caseId = parseInt(text);
      if (isNaN(caseId)) {
        await sendWhatsAppMessage(from, "Invalid ID format. Must be a number. Please try resolving again via the menu.");
        return;
      }
      
      const targetCase = await prisma.outstanding_cases.findFirst({ where: { id: BigInt(caseId), project_id: session.projectId, status: "Pending" } });
      if (!targetCase) {
        await sendWhatsAppMessage(from, "ID not found or case is already resolved.");
        return;
      }

      await prisma.outstanding_cases.update({
        where: { id: targetCase.id },
        data: { status: "Completed", updated_at: new Date() }
      });
      await sendWhatsAppMessage(from, `Case *${targetCase.title}* marked as resolved successfully.`);
      return;
    }
  }

  // 3. Fallback
  await sendMainMenu(from);
}

// --- Menu Generators ---

async function sendMainMenu(from: string) {
  const sections = [
    {
      title: "Services",
      rows: [
        { id: "MAIN_PROJECTS", title: "Project Access", description: "Access project features and reports" },
        { id: "MAIN_INFO", title: "Information", description: "Contact and support information" }
      ]
    }
  ];
  
  await sendWhatsAppInteractiveList(
    from, 
    "Main Menu", 
    "Welcome to *DSSI Connect by Value Engineering Services of EPL*.\nPlease select a service from the menu below:", 
    "Select Service", 
    sections
  );
}

async function sendProjectListMenu(from: string) {
  const subscriptions = await prisma.wa_subscribers.findMany({ 
    where: { phone: from, status: "Approved", registered: true },
    include: { projects: true }
  });

  const rows = subscriptions.map(sub => ({
    id: `PROJ_SEL_${sub.project_id}`,
    title: sub.projects.name.substring(0, 24),
    description: "Access this project"
  }));

  rows.push({ id: "PROJ_ADD", title: "Access Another Project", description: "Register with a new Project Code" });
  rows.push({ id: "MAIN_MENU", title: "Back to Main Menu", description: "Return to the main menu" });

  const sections = [{ title: "Your Projects", rows: rows.slice(0, 10) }];

  await sendWhatsAppInteractiveList(
    from, 
    "Project Access", 
    "Please select a project to access or register a new one:", 
    "Select Project", 
    sections
  );
}

async function sendProjectFeaturesMenu(from: string, projectId: string) {
  const project = await prisma.projects.findUnique({ where: { id: BigInt(projectId) } });
  
  const sections = [
    {
      title: "Features",
      rows: [
        { id: `FEAT_OUTSTANDING_${projectId}`, title: "Outstanding Cases", description: "Manage outstanding cases" },
        { id: "MAIN_PROJECTS", title: "Back to Projects", description: "Return to project list" }
      ]
    }
  ];
  
  await sendWhatsAppInteractiveList(
    from, 
    `Project: ${project?.name?.substring(0, 40) || "Unknown"}`, 
    "Please select a feature to access:", 
    "Select Feature", 
    sections
  );
}

async function sendOutstandingCasesMenu(from: string, projectId: string) {
  const sections = [
    {
      title: "Outstanding Cases",
      rows: [
        { id: `OUT_STATUS_${projectId}`, title: "Check Status", description: "View pending and completed cases" },
        { id: `OUT_ADD_${projectId}`, title: "Report New Case", description: "Add a new outstanding case" },
        { id: `OUT_RESOLVE_${projectId}`, title: "Resolve Case", description: "Mark a case as completed" },
        { id: `OUT_UNSUB_${projectId}`, title: "Unsubscribe", description: "Stop receiving reports" },
        { id: `PROJ_SEL_${projectId}`, title: "Back to Features", description: "Return to project features" }
      ]
    }
  ];
  
  await sendWhatsAppInteractiveList(
    from, 
    "Outstanding Cases", 
    "Please select an action from the menu below:", 
    "Select Action", 
    sections
  );
}

// --- Action Handlers ---

async function handleUnsubscribe(from: string, projectId: string) {
  const updated = await prisma.wa_subscribers.updateMany({ 
    where: { phone: from, project_id: BigInt(projectId), registered: true }, 
    data: { registered: false } 
  });
  
  if (updated.count > 0) {
    await sendWhatsAppMessage(from, "You have successfully unsubscribed from this project's reports.");
  } else {
    await sendWhatsAppMessage(from, "You are not currently subscribed to this project.");
  }
}

async function handleOutstandingStatus(from: string, projectId: string) {
  const sub = await prisma.wa_subscribers.findFirst({ 
    where: { phone: from, project_id: BigInt(projectId), status: "Approved", registered: true }, 
    include: { projects: true } 
  });
  
  if (!sub) {
    await sendWhatsAppMessage(from, "You are not registered or approved for this project.");
    return;
  }
  
  const allCases = await prisma.outstanding_cases.findMany({ where: { project_id: BigInt(projectId) } });
  const now = new Date();
  const pendingCases = allCases.filter((c: any) => c.status === "Pending");
  const completedCases = allCases.filter((c: any) => c.status === "Completed" && new Date(c.updated_at) >= new Date(new Date(now).setHours(0,0,0,0)));
  
  let pendingStr = pendingCases.length > 0 ? pendingCases.map((c: any, i: number) => (i+1) + ". " + c.title).join('\n') : "No pending cases.";
  let completedStr = completedCases.length > 0 ? completedCases.map((c: any, i: number) => "- " + c.title).join('\n') : "No cases completed today.";
  
  const msg = `*Outstanding Cases - ${sub.projects.name}*\n\n*Pending (${pendingCases.length}):*\n${pendingStr}\n\n*Completed Today (${completedCases.length}):*\n${completedStr}`;
  await sendWhatsAppMessage(from, msg);
}
