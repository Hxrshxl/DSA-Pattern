import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("Testing database connection...")

    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("Database connection test:", result)

    // Test if problems table exists and has data
    const problemCount = await prisma.problem.count()
    console.log("Problems count:", problemCount)

    // Get sample problems
    const sampleProblems = await prisma.problem.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        difficulty: true,
        pattern: true,
      },
    })
    console.log("Sample problems:", sampleProblems)

    // Test if users table exists
    const userCount = await prisma.user.count()
    console.log("Users count:", userCount)

    // Get unique patterns
    const patterns = await prisma.problem.findMany({
      where: { pattern: { not: null } },
      select: { pattern: true },
      distinct: ["pattern"],
    })
    console.log("Unique patterns:", patterns.length)

    return NextResponse.json({
      success: true,
      connection: "OK",
      problemCount,
      userCount,
      patternCount: patterns.length,
      sampleProblems,
      patterns: patterns.map((p) => p.pattern),
      message: "Database connection successful",
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
