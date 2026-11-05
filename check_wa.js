require('dotenv').config();

const token = process.env.WA_ACCESS_TOKEN;
const phoneId = process.env.WA_PHONE_NUMBER_ID;

console.log("==========================================");
console.log("   DSSI CONNECT - META WA DIAGNOSTIC      ");
console.log("==========================================");
console.log("Phone Number ID :", phoneId);
console.log("Token Present   :", !!token);

async function check() {
  if (!token || !phoneId) {
    console.error("Error: WA_ACCESS_TOKEN or WA_PHONE_NUMBER_ID is missing in .env");
    return;
  }

  try {
    // 1. Check Phone Details
    console.log("\n[1] Fetching Phone Details...");
    const phoneRes = await fetch(`https://graph.facebook.com/v19.0/${phoneId}?fields=id,display_phone_number,verified_name,quality_rating,name_status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const phoneData = await phoneRes.json();
    console.log("Phone Details:", JSON.stringify(phoneData, null, 2));

    // 2. Discover WABA ID from me/businesses or debug_token
    console.log("\n[2] Discovering WhatsApp Business Account (WABA)...");
    
    // Try me/whatsapp_business_accounts
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me/whatsapp_business_accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log("WABA from /me:", JSON.stringify(meData, null, 2));

    // Also try debug token
    let wabaId = null;
    if (meData.data && meData.data.length > 0) {
      wabaId = meData.data[0].id;
    }

    if (!wabaId) {
      // Try fetching granter from debug_token
      const debugRes = await fetch(`https://graph.facebook.com/v19.0/debug_token?input_token=${token}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const debugData = await debugRes.json();
      console.log("Debug Token Info:", JSON.stringify(debugData, null, 2));
      const targetIds = debugData.data?.granular_scopes?.find(s => s.scope === 'whatsapp_business_management')?.target_ids;
      if (targetIds && targetIds.length > 0) {
        wabaId = targetIds[0];
      }
    }

    // 3. If WABA found, list templates
    if (wabaId) {
      console.log(`\n[3] Fetching Message Templates for WABA ID: ${wabaId}...`);
      const tplRes = await fetch(`https://graph.facebook.com/v19.0/${wabaId}/message_templates?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tplData = await tplRes.json();
      if (tplData.data && tplData.data.length > 0) {
        console.log(`\nFound ${tplData.data.length} template(s) in this WABA:`);
        tplData.data.forEach((t, i) => {
          console.log(`  ${i + 1}. Name: "${t.name}" | Status: ${t.status} | Lang: "${t.language}" | Category: ${t.category}`);
        });
      } else {
        console.log("\nTemplates response:", JSON.stringify(tplData, null, 2));
      }
    } else {
      console.log("\n[Notice] Could not auto-detect WABA ID. Please check the WABA ID from Meta Business Suite URL.");
    }

  } catch (err) {
    console.error("Diagnostic failed:", err);
  }
}

check();
