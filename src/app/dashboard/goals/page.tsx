// app/dashboard/goals/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GoalsClient from "@/components/dashboard/goals-client";

export default async function GoalsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <GoalsClient userId={userId} />;
}
