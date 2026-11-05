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
    // 1. Check Phone Details and WABA ID
    console.log("\n[1] Fetching Phone Number & WABA details...");
    const phoneRes = await fetch(`https://graph.facebook.com/v19.0/${phoneId}?fields=id,display_phone_number,verified_name,whatsapp_business_account,code_verification_status,quality_rating`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const phoneData = await phoneRes.json();
    console.log("Phone Details:", JSON.stringify(phoneData, null, 2));

    const wabaId = phoneData.whatsapp_business_account?.id;
    if (!wabaId) {
      console.log("\n[WARN] WABA ID could not be retrieved from this Phone Number ID.");
      return;
    }

    // 2. Fetch all message templates registered under this WABA
    console.log(`\n[2] Fetching Message Templates for WABA ${wabaId}...`);
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
      console.log("\nNo templates found in this WABA. Meta Response:", JSON.stringify(tplData, null, 2));
    }

  } catch (err) {
    console.error("Diagnostic failed:", err);
  }
}

check();
