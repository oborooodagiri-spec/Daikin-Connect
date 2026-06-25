const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'prisma', 'schema.prisma');

const newModels = `
// Master Pricelist
model pricelist_items {
  id            String   @id @default(uuid())
  category      String   @db.VarChar(100)
  name          String   @db.VarChar(255)
  specification String?  @db.Text
  unit          String   @db.VarChar(50)
  price         Decimal  @db.Decimal(15, 2)
  created_at    DateTime @default(now()) @db.Timestamp(0)
  updated_at    DateTime @updatedAt
  
  boq_items     boq_items[]
}

// BoQ Projects
model boq_projects {
  id            String   @id @default(uuid())
  project_name  String   @db.VarChar(255)
  customer_name String?  @db.VarChar(150)
  created_by    Int
  created_at    DateTime @default(now()) @db.Timestamp(0)
  updated_at    DateTime @updatedAt

  items         boq_items[]
  users         users    @relation(fields: [created_by], references: [id])
  
  @@index([created_by])
}

// BoQ Line Items
model boq_items {
  id            String   @id @default(uuid())
  boq_id        String
  item_id       String
  quantity      Float
  unit_price    Decimal  @db.Decimal(15, 2)
  total_price   Decimal  @db.Decimal(15, 2)
  
  boq           boq_projects    @relation(fields: [boq_id], references: [id], onDelete: Cascade)
  pricelist     pricelist_items @relation(fields: [item_id], references: [id])

  @@index([boq_id])
  @@index([item_id])
}
`;

fs.appendFileSync(target, newModels);
console.log("Appended new models successfully.");
