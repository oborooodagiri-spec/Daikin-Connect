import { PrismaClient } from "@/generated/client_v2";
import { notFound } from "next/navigation";
import AuditFormClient from "./AuditFormClient";

const prisma = new PrismaClient();

export default async function AuditPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const unit = await prisma.units.findFirst({
    where: { qr_code_token: token }
  });

  if (!unit) {
    return notFound();
  }

  return <AuditFormClient unit={unit} />;
}
