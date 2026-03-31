import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import CorrectiveFormClient from "./CorrectiveFormClient";

const prisma = new PrismaClient();

export default async function CorrectivePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const unit = await prisma.units.findFirst({
    where: { qr_code_token: token }
  });

  if (!unit) {
    return notFound();
  }

  return <CorrectiveFormClient unit={unit} />;
}
