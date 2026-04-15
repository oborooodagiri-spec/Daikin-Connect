import { PrismaClient } from "@/generated/client_v2";
import { notFound } from "next/navigation";
import PreventiveFormClient from "./PreventiveFormClient";

const prisma = new PrismaClient();

export default async function PreventivePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const unit = await prisma.units.findFirst({
    where: { qr_code_token: token }
  });

  if (!unit) {
    return notFound();
  }

  return <PreventiveFormClient unit={unit} />;
}
