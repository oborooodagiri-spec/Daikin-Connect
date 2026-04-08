import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import DailyLogFormClient from "../../daily/DailyLogFormClient";

const prisma = new PrismaClient();

export default async function DailyLogPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const unit = await prisma.units.findFirst({
    where: { qr_code_token: token }
  });

  if (!unit) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl min-h-screen p-6 relative">
          <DailyLogFormClient unitId={Number(unit.id)} token={token} />
      </div>
    </div>
  );
}
