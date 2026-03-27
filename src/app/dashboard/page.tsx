import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardWrapper from "./DashboardWrapper";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col p-6">
      <DashboardWrapper />
    </main>
  );
}
