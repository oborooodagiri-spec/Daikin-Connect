require('dotenv').config();

const token = process.env.WA_ACCESS_TOKEN;
const phoneId = process.env.WA_PHONE_NUMBER_ID;
const businessId = "909955945483144";

async function check() {
  try {
    console.log("==========================================");
    console.log("Checking Business ID:", businessId);
    console.log("==========================================");

    // 1. Get WABAs from Business Portfolio
    const wabaRes = await fetch(`https://graph.facebook.com/v19.0/${businessId}/owned_whatsapp_business_accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const wabaData = await wabaRes.json();
    console.log("Owned WABAs:", JSON.stringify(wabaData, null, 2));

    let wabas = wabaData.data || [];
    if (wabas.length === 0) {
      const clientRes = await fetch(`https://graph.facebook.com/v19.0/${businessId}/client_whatsapp_business_accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const clientData = await clientRes.json();
      console.log("Client WABAs:", JSON.stringify(clientData, null, 2));
      wabas = clientData.data || [];
    }

    // 2. For each WABA, fetch phone numbers and templates
    for (const waba of wabas) {
      console.log(`\n------------------------------------------`);
      console.log(`WABA: ${waba.name || "N/A"} (ID: ${waba.id})`);
      console.log(`------------------------------------------`);

      // Phone numbers in this WABA
      const pRes = await fetch(`https://graph.facebook.com/v19.0/${waba.id}/phone_numbers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pData = await pRes.json();
      console.log("Phone Numbers in this WABA:", JSON.stringify(pData.data?.map(p => ({ id: p.id, display_phone_number: p.display_phone_number, verified_name: p.verified_name })), null, 2));

      // Templates in this WABA
      const tRes = await fetch(`https://graph.facebook.com/v19.0/${waba.id}/message_templates?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tData = await tRes.json();
      console.log(`Templates in WABA ${waba.id}:`);
      if (tData.data && tData.data.length > 0) {
        tData.data.forEach((t, i) => {
          console.log(`  ${i + 1}. Name: "${t.name}" | Status: ${t.status} | Lang: "${t.language}" | Category: ${t.category}`);
        });
      } else {
        console.log("  No templates found or error:", JSON.stringify(tData));
      }
    }

  } catch (e) {
    console.error(e);
  }
}

check();
