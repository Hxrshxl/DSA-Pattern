import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AnalyticsClient from "@/components/dashboard/analytics-client"

export default async function AnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <AnalyticsClient />
  )
}
