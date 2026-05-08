import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getProfile, getRecentActivity } from "@/app/actions/profile";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const profile = await getProfile();
  if (!profile) {
    redirect("/");
  }

  const recentActivity = await getRecentActivity(5);

  return <HomeClient profile={profile} recentActivity={recentActivity} />;
}
