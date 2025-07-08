import { type NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { createOrUpdateUser } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.error("User sync: No userId found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User sync: Processing for user:", userId)

    // Get user from Clerk using the imported clerkClient
    const clerkUser = await clerkClient.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress || `user-${userId}@example.com`

    console.log("User sync: Email found:", email)

    // Create or update user in database
    const user = await createOrUpdateUser(userId, email)

    console.log("User sync: Success for user:", userId)

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("User sync: Error:", error)
    return NextResponse.json(
      {
        error: "Failed to sync user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
