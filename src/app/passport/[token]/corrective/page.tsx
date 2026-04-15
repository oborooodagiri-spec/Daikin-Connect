import { PrismaClient } from "@/generated/client_v2";
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

  // Fetch last preventive maintenance date
  const lastPM = await prisma.service_activities.findFirst({
    where: {
      unit_id: unit.id,
      type: "Preventive",
      status: "Final_Approved"
    },
    orderBy: {
      service_date: "desc"
    },
    select: {
      service_date: true
    }
  });

  const lastPreventiveDate = lastPM?.service_date ? lastPM.service_date.toISOString().split("T")[0] : null;

  return <CorrectiveFormClient unit={unit} lastPreventiveDate={lastPreventiveDate} />;
}
