const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CSV_DATA = `No.,Tanggal,Jenis Unit,Brand,Model,Tenant / Area,Finding,Rekomendasi,Dokumentasi,Link Daikin Connect
2,02-Mar-26,SPLIT WALL,Panasonic,,,,,,https://daikin-connect.com/unit/cfdba09e3ac63c7090dd9ff1229b15d2
3,,SPLIT WALL,Panasonic,,Security Loading Dock 002,"Kabel kompresor terbakar, tekanan drop, kompresor shirt body",Ganti Unit Baru,,https://daikin-connect.com/unit/37862544f92f1de8990fece20a9361f8
4,,SPLIT WALL,Panasonic,CU-PN18WKJ,ACAII,,,,https://daikin-connect.com/unit/d47e7c6b60d0cbff12447997a15a8e72
5,,AHU,Daikin,DDW150DB,Koridor ACAII,,,,https://daikin-connect.com/unit/0E72171BF4A1D7EBA4AB3B290503C074
6,,AHU,Trane,CLCP 40,Koridor Tengah (AHU B1-08),,,,https://daikin-connect.com/unit/d1ead5c4f245c9a583e508fa70d641aa
7,03-Mar-26,SPLIT DUCT,Daikin,FBFC60DVM4,Gudang Luis Vuitton 003,,,,https://daikin-connect.com/unit/b875bfa158480c8174b3e2fbfef8f801
8,,SPLIT DUCT,Daikin,,Gudang Luis Vuitton 001,,,,https://daikin-connect.com/unit/e04a4db67e7e268efbd96fbea196a501
9,,SPLIT DUCT,Daikin,,Gudang Luis Vuitton 002,,,,https://daikin-connect.com/unit/fadf6c137aac8a9cfcf2da594aaa74d2
10,,AHU,Trane,CLCP 20,Koridor Panorama (AHU B1-09),Bak drain sudah korosi,,,https://daikin-connect.com/unit/9c6e4cdd2db4bcb4f9331c430b1e29b8
11,,AHU,Trane,CLCP 40,Koridor Maison D'Aura (AHU B1-10),"Bak drain sudah korosi, V Belt sudah renggang, lampu di lokasi hanya menyala satu",,,https://daikin-connect.com/unit/d32fb966b2ac9e1c8434fccd51602459
12,04-Mar-26,SPLIT DUCT,Daikin,,Salad Stop,,,,https://daikin-connect.com/unit/d1cf9116c6af7b0f7f7dff1208345d23
13,,SPLIT DUCT,Daikin,FBFC100DVM4,R&B Tea (Tenant),,,,https://daikin-connect.com/unit/b454687d10076a58d536c4b277b78901
14,,AHU,Trane,CLCP 40,Koridor Social House (AHU B1-11),,,,https://daikin-connect.com/unit/2cd57662804b4694939797cc779951aa
15,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/8e0404434914c6d17b3ff48744b8294a
16,05-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/42436d655f465d16434444585145b001
17,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/357368655c655c16434444585145b001
18,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/b1324db6b245e2ef84347fccd51602459
19,,AHU,York,YDM 50 x 70,Koridor Kitchen Paul (AHU B1-13),,,,https://daikin-connect.com/unit/2f9c491223945df331cfcc95669941aa
20,06-Mar-26,SPLIT WALL,Daikin,STKC15RV14,Kantor Building Service,,,,https://daikin-connect.com/unit/017368655c655c16434444585145b001
21,,SPLIT DUCT,Daikin,FBFC125DVM4,Tenant ABC (Samping Ismaya),,,,https://daikin-connect.com/unit/52a65959f7e0478c6e499e8d1ead5c4f
22,,SPLIT DUCT,Daikin,,Tenant Dr Specs (Samping Ismaya),,,,https://daikin-connect.com/unit/3e7e268efbd96fbea196a5012cd57662
23,,AHU,York,YDM 30 x 50,Koridor Optik Melawai (AHU P3-01),"Kisi Evaporator sebagian rebah. V Belt dalam keadaan kendur, sudah dilakukan penggantian V Belt",Perbaikan kisi evaporator,,https://daikin-connect.com/unit/aa38394e5f5601a49ee7b4f754ba7a18
24,,AHU,York,YDM 40 x 50,Koridor Metro P3 (AHU P3-02),,,,https://daikin-connect.com/unit/804b4694939797cc779951aa8e040443
25,07-Mar-26,SPLIT DUCT,Daikin,,Tenant Uniqlo (P3),,,,https://daikin-connect.com/unit/cfdba09e3ac63c7090dd9ff1229b15d2
26,,SPLIT DUCT,Daikin,,Tenant Uniqlo (P3),,,,https://daikin-connect.com/unit/37862544f92f1de8990fece20a9361f8
27,,SPLIT DUCT,Daikin,,Tenant Uniqlo (P3),,,,https://daikin-connect.com/unit/d47e7c6b60d0cbff12447997a15a8e72
28,,AHU,York,YDM 50 x 60,Koridor L3 (AHU P3-03),,,,https://daikin-connect.com/unit/0E72171BF4A1D7EBA4AB3B290503C074
29,,AHU,York,YDM 40 x 60,Koridor L3 (AHU P3-04),,,,https://daikin-connect.com/unit/d1ead5c4f245c9a583e508fa70d641aa
30,09-Mar-26,SPLIT DUCT,Daikin,,Gudang Louis Vuitton 004,,,,https://daikin-connect.com/unit/b875bfa158480c8174b3e2fbfef8f801
31,,SPLIT DUCT,Daikin,,Gudang Louis Vuitton 005,,,,https://daikin-connect.com/unit/e04a4db67e7e268efbd96fbea196a501
32,,SPLIT DUCT,Daikin,,Gudang Louis Vuitton 006,,,,https://daikin-connect.com/unit/fadf6c137aac8a9cfcf2da594aaa74d2
33,,AHU,York,YDM 40 x 50,Koridor Optik Seis (AHU P3-05),,,,https://daikin-connect.com/unit/9c6e4cdd2db4bcb4f9331c430b1e29b8
34,,AHU,York,YDM 30 x 40,Koridor ACA II (AHU P3-10),,,,https://daikin-connect.com/unit/d32fb966b2ac9e1c8434fccd51602459
35,10-Mar-26,SPLIT DUCT,Daikin,,Salad Stop,,,,https://daikin-connect.com/unit/d1cf9116c6af7b0f7f7dff1208345d23
36,,SPLIT DUCT,Daikin,,Salad Stop,,,,https://daikin-connect.com/unit/b454687d10076a58d536c4b277b78901
37,,SPLIT DUCT,Daikin,,Salad Stop,,,,https://daikin-connect.com/unit/2cd57662804b4694939797cc779951aa
38,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/8e0404434914c6d17b3ff48744b8294a
39,,AHU,York,YDM 50 x 70,Koridor Kitchen Paul (AHU B1-13),,,,https://daikin-connect.com/unit/42436d655f465d16434444585145b001
40,11-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/357368655c655c16434444585145b001
41,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/b1324db6b245e2ef84347fccd51602459
42,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/2f9c491223945df331cfcc95669941aa
43,,AHU,Trane,CLCP 40,Koridor Social House (AHU B1-11),,,,https://daikin-connect.com/unit/017368655c655c16434444585145b001
44,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/52a65959f7e0478c6e499e8d1ead5c4f
45,12-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/3e7e268efbd96fbea196a5012cd57662
46,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/aa38394e5f5601a49ee7b4f754ba7a18
47,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/804b4694939797cc779951aa8e040443
48,,AHU,York,YDM 50 x 70,Koridor Kitchen Paul (AHU B1-13),,,,https://daikin-connect.com/unit/cfdba09e3ac63c7090dd9ff1229b15d2
49,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/37862544f92f1de8990fece20a9361f8
50,13-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/d47e7c6b60d0cbff12447997a15a8e72
51,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/0E72171BF4A1D7EBA4AB3B290503C074
52,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/d1ead5c4f245c9a583e508fa70d641aa
53,,AHU,Trane,CLCP 40,Koridor Social House (AHU B1-11),,,,https://daikin-connect.com/unit/b875bfa158480c8174b3e2fbfef8f801
54,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/e04a4db67e7e268efbd96fbea196a501
55,14-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/fadf6c137aac8a9cfcf2da594aaa74d2
56,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/9c6e4cdd2db4bcb4f9331c430b1e29b8
57,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/d32fb966b2ac9e1c8434fccd51602459
58,,AHU,York,YDM 50 x 70,Koridor Kitchen Paul (AHU B1-13),,,,https://daikin-connect.com/unit/d1cf9116c6af7b0f7f7dff1208345d23
59,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/b454687d10076a58d536c4b277b78901
60,16-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/2cd57662804b4694939797cc779951aa
61,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/8e0404434914c6d17b3ff48744b8294a
62,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/42436d655f465d16434444585145b001
63,,AHU,Trane,CLCP 40,Koridor Social House (AHU B1-11),,,,https://daikin-connect.com/unit/357368655c655c16434444585145b001
64,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/b1324db6b245e2ef84347fccd51602459
65,17-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/2f9c491223945df331cfcc95669941aa
66,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/017368655c655c16434444585145b001
67,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/52a65959f7e0478c6e499e8d1ead5c4f
68,,AHU,York,YDM 50 x 70,Koridor Kitchen Paul (AHU B1-13),,,,https://daikin-connect.com/unit/3e7e268efbd96fbea196a5012cd57662
69,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/aa38394e5f5601a49ee7b4f754ba7a18
70,18-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/804b4694939797cc779951aa8e040443
71,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/cfdba09e3ac63c7090dd9ff1229b15d2
72,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/37862544f92f1de8990fece20a9361f8
73,,AHU,Trane,CLCP 40,Koridor Social House (AHU B1-11),,,,https://daikin-connect.com/unit/d47e7c6b60d0cbff12447997a15a8e72
74,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/0E72171BF4A1D7EBA4AB3B290503C074
75,19-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/d1ead5c4f245c9a583e508fa70d641aa
76,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/b875bfa158480c8174b3e2fbfef8f801
77,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/e04a4db67e7e268efbd96fbea196a501
78,,AHU,York,YDM 50 x 70,Koridor Kitchen Paul (AHU B1-13),,,,https://daikin-connect.com/unit/fadf6c137aac8a9cfcf2da594aaa74d2
79,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/9c6e4cdd2db4bcb4f9331c430b1e29b8
80,20-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/d32fb966b2ac9e1c8434fccd51602459
81,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/d1cf9116c6af7b0f7f7dff1208345d23
82,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/b454687d10076a58d536c4b277b78901
83,,AHU,Trane,CLCP 40,Koridor Social House (AHU B1-11),,,,https://daikin-connect.com/unit/2cd57662804b4694939797cc779951aa
84,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/8e0404434914c6d17b3ff48744b8294a
85,21-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/42436d655f465d16434444585145b001
86,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/357368655c655c16434444585145b001
87,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/b1324db6b245e2ef84347fccd51602459
88,,AHU,York,YDM 50 x 70,Koridor Kitchen Paul (AHU B1-13),,,,https://daikin-connect.com/unit/2f9c491223945df331cfcc95669941aa
89,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/017368655c655c16434444585145b001
90,23-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/52a65959f7e0478c6e499e8d1ead5c4f
91,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 005,,,,https://daikin-connect.com/unit/3e7e268efbd96fbea196a5012cd57662
92,,SPLIT DUCT,Daikin,,Gudang Lacoste B1 006,,,,https://daikin-connect.com/unit/aa38394e5f5601a49ee7b4f754ba7a18
93,,AHU,Trane,CLCP 40,Koridor Social House (AHU B1-11),,,,https://daikin-connect.com/unit/804b4694939797cc779951aa8e040443
94,,AHU,York,YDM 60 x 80,Koridor Paul (AHU B1-12),,,,https://daikin-connect.com/unit/cfdba09e3ac63c7090dd9ff1229b15d2
95,24-Mar-26,SPLIT DUCT,Daikin,,Gudang Lacoste B1 004,,,,https://daikin-connect.com/unit/37862544f92f1de8990fece20a9361f8`;

const parseCSV = (csv) => {
  const lines = csv.split('\n');
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current);
    result.push(parts);
  }
  return result;
};

async function sync() {
  const rows = parseCSV(CSV_DATA);
  let currentDate = '';

  for (const row of rows) {
    if (row.length < 10) {
        console.warn('Skipping row with insufficient columns:', row);
        continue;
    }

    let [no, tanggal, jenis, brand, model, tenant, finding, rekomendasi, dok, link] = row;
    
    if (tanggal) currentDate = tanggal;
    if (!currentDate) continue;

    // Parse Date: 02-Mar-26
    const dateParts = currentDate.split('-');
    const months = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
    const serviceDate = new Date(2000 + parseInt(dateParts[2]), months[dateParts[1]], parseInt(dateParts[0]));

    // Mapping SPLIT WALL -> SPLIT DUCT
    const originalType = jenis.toUpperCase();
    const mappedType = originalType === 'SPLIT WALL' ? 'SPLIT DUCT' : originalType;

    // Extract Token
    let token = null;
    if (link && link.includes('/unit/')) {
        token = link.split('/unit/')[1].trim();
    }

    let unit = null;
    if (token) {
        unit = await prisma.units.findUnique({ where: { qr_code_token: token } });
    }

    if (!unit && tenant) {
        // Try to find by Tenant
        const units = await prisma.units.findMany({
            where: {
                room_tenant: { contains: tenant.trim() }
            }
        });
        if (units.length === 1) unit = units[0];
    }

    if (!unit) {
        console.log(`Unit not found for ${tenant}. Creating new unit...`);
        unit = await prisma.units.create({
            data: {
                room_tenant: tenant || "Unknown Tenant",
                unit_type: mappedType,
                brand: brand || "Daikin",
                model: model || "-",
                qr_code_token: token || Math.random().toString(36).substring(7),
                site_id: 1, // Plaza Indonesia Site
                project_ref_id: 1,
                status: 'Normal'
            }
        });
    }

    // Create Service Activity
    console.log(`Syncing report for ${unit.room_tenant} (${unit.tag_number || unit.id}) on ${currentDate}`);
    
    const technicalJson = JSON.stringify({
        finding: finding || "-",
        recommendation: rekomendasi || "-",
        parameters: {}
    });

    await prisma.service_activities.create({
        data: {
            unit_id: unit.id,
            type: 'Preventive',
            service_date: serviceDate,
            inspector_name: 'Daikin Service Team',
            technical_json: technicalJson,
            technical_advice: `Finding: ${finding || "-"}\nRecommendation: ${rekomendasi || "-"}`,
            status: 'Final_Approved'
        }
    });
  }

  console.log('Sync completed successfully.');
  process.exit(0);
}

sync().catch(e => {
  console.error(e);
  process.exit(1);
});
