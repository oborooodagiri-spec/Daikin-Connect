const fs = require('fs');
let code = fs.readFileSync('src/app/actions/outstanding.ts', 'utf8');

// Inject broadcast into addOutstandingCase
const addTarget = `    revalidatePath(\`/w/\${data.project_id}/client/dashboard\`);`;
const addBroadcast = `
    // Broadcast to WA
    try {
      const project = await prisma.projects.findUnique({ where: { id: BigInt(data.project_id) } });
      if (project) {
        const subs = await prisma.wa_subscribers.findMany({ where: { project_id: project.id, status: "Approved", registered: true } });
        for (const sub of subs) {
          const msg = \`?? *NEW OUTSTANDING CASE*\\n\\n*Project:* \${project.name}\\n*Title:* \${data.title}\\n*Unit:* \${data.unit_name || "-"}\\n\\n_(Reported via Web Admin)_\`;
          await sendWhatsAppMessage(sub.phone, msg).catch(e => console.error("WA Send Error:", e));
        }
      }
    } catch(e) { console.error("Broadcast error:", e); }

    revalidatePath(\`/w/\${data.project_id}/client/dashboard\`);
`;
code = code.replace(addTarget, addBroadcast);


// Inject broadcast into resolveOutstandingCase
const resolveTarget = `    await prisma.outstanding_cases.update({`;
const resolveBroadcast = `    const targetCase = await prisma.outstanding_cases.update({`;
code = code.replace(resolveTarget, resolveBroadcast);

const resolvePath = `    revalidatePath(\`/w/\${projectId}/client/dashboard\`);`;
const resolveBroadcastSend = `
    // Broadcast to WA
    try {
      const project = await prisma.projects.findUnique({ where: { id: BigInt(projectId) } });
      if (project) {
        const subs = await prisma.wa_subscribers.findMany({ where: { project_id: project.id, status: "Approved", registered: true } });
        for (const sub of subs) {
          const msg = \`? *CASE RESOLVED*\\n\\n*Project:* \${project.name}\\n*Title:* \${targetCase.title}\\n\\n_(Resolved via Web Admin)_\`;
          await sendWhatsAppMessage(sub.phone, msg).catch(e => console.error("WA Send Error:", e));
        }
      }
    } catch(e) { console.error("Broadcast error:", e); }

    revalidatePath(\`/w/\${projectId}/client/dashboard\`);
`;
code = code.replace(resolvePath, resolveBroadcastSend);

fs.writeFileSync('src/app/actions/outstanding.ts', code, 'utf8');
