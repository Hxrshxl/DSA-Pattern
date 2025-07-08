import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { saveNote, getNotes } from "@/lib/api"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const problemId = searchParams.get("problemId")

    if (!problemId) {
      return NextResponse.json({ error: "Problem ID required" }, { status: 400 })
    }

    const notes = await getNotes(userId, problemId)
    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { problemId, content, type } = await request.json()

    const result = await saveNote(userId, problemId, content, type)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error saving note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
