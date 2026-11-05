require('dotenv').config();

const token = process.env.WA_ACCESS_TOKEN;
const phoneId = process.env.WA_PHONE_NUMBER_ID;

async function check() {
  try {
    // Check App's WABAs
    const appId = "1038910105500364";
    console.log(`\nFetching WABAs associated with App ${appId}...`);
    
    // Check app/whatsapp_business_accounts
    const appRes = await fetch(`https://graph.facebook.com/v19.0/${appId}/whatsapp_business_accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const appData = await appRes.json();
    console.log("App WABAs:", JSON.stringify(appData, null, 2));

    let wabaId = appData.data?.[0]?.id;

    if (!wabaId) {
      // Try business clients
      const busRes = await fetch(`https://graph.facebook.com/v19.0/122125848153441286/assigned_whatsapp_business_accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const busData = await busRes.json();
      console.log("Assigned WABAs:", JSON.stringify(busData, null, 2));
      wabaId = busData.data?.[0]?.id;
    }

    if (wabaId) {
      console.log(`\nFetching Templates for WABA ${wabaId}...`);
      const tplRes = await fetch(`https://graph.facebook.com/v19.0/${wabaId}/message_templates?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tplData = await tplRes.json();
      console.log("\nTemplates in WABA " + wabaId + ":");
      if (tplData.data) {
        tplData.data.forEach((t, i) => {
          console.log(`  ${i + 1}. "${t.name}" | Status: ${t.status} | Lang: "${t.language}" | Category: ${t.category}`);
        });
      } else {
        console.log(JSON.stringify(tplData, null, 2));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

check();
