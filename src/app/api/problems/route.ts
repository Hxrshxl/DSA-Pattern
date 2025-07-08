import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getProblems } from "@/lib/api"

export async function GET(request: NextRequest) {
  try {
    console.log("API /problems: Starting request")

    const { userId } = await auth()

    if (!userId) {
      console.error("API /problems: No userId found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("API /problems: Authenticated user:", userId)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const difficulty = searchParams.get("difficulty") || ""
    const status = searchParams.get("status") || ""
    const pattern = searchParams.get("pattern") || ""

    console.log("API /problems: Filters:", { search, difficulty, status, pattern })

    // Check if getProblems function exists
    if (typeof getProblems !== "function") {
      console.error("API /problems: getProblems is not a function:", typeof getProblems)
      return NextResponse.json({ error: "getProblems function not found" }, { status: 500 })
    }

    console.log("API /problems: Calling getProblems function")

    const problems = await getProblems({
      search,
      difficulty,
      status,
      pattern,
      userId,
    })

    console.log(`API /problems: Found ${problems.length} problems`)

    // Transform the data to ensure consistent format
    const transformedProblems = problems.map((problem: any) => ({
      id: problem.id,
      title: problem.title,
      url: problem.url,
      isPremium: problem.isPremium || problem.is_premium,
      acceptanceRate: problem.acceptanceRate || problem.acceptance_rate,
      difficulty: problem.difficulty,
      frequency: problem.frequency,
      topics: Array.isArray(problem.topics) ? problem.topics : [],
      pattern: problem.pattern,
      questionNo: problem.questionNo || problem.question_no,
      progress: problem.progress || [],
      solved: problem.progress?.[0]?.solved || false,
    }))

    console.log("API /problems: Returning transformed problems")
    return NextResponse.json(transformedProblems)
  } catch (error) {
    console.error("API /problems: Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
