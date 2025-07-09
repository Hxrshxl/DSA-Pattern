import { NextResponse } from "next/server"

export async function POST() {
  // Dummy response: user sync is disabled
  return NextResponse.json({ success: true, user: null, message: "User sync is disabled." })
}
