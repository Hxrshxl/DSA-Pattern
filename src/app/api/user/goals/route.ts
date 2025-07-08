import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserAnalytics } from "@/lib/api"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analytics = await getUserAnalytics(userId)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching user analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
