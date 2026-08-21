const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(/wa_settings\s+String\?\s+@db\.LongText/, 
  'wa_settings          String?               @db.LongText\n  wa_invite_code       String?               @db.VarChar(20)\n  wa_subscribers       wa_subscribers[]');

schema += `\n\nmodel wa_subscribers {
  id              BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  project_id      BigInt    @db.UnsignedBigInt
  phone           String    @db.VarChar(20)
  name            String    @db.VarChar(100)
  company         String    @db.VarChar(150)
  status          String    @default("Pending") @db.VarChar(20)
  registered      Boolean   @default(true)
  created_at      DateTime  @default(now()) @db.Timestamp(0)
  approved_by     String?   @db.VarChar(100)
  approved_at     DateTime? @db.Timestamp(0)
  projects        projects  @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@unique([project_id, phone])
  @@index([project_id])
}\n`;

fs.writeFileSync('prisma/schema.prisma', schema);
