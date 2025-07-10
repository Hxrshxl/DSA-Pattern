import { prisma } from "./prisma"
import type { Difficulty, NoteType } from "@prisma/client"

export interface UserStats {
  totalSolved: number
  totalProblems: number
  easyCompleted: number
  mediumCompleted: number
  hardCompleted: number
  currentStreak: number
  longestStreak: number
  studyTimeToday: number
  weeklyGoalProgress: number
  level: string
  xp: number
  nextLevelXp: number
}

// User Management
export async function createOrUpdateUser(userId: string, email: string) {
  try {
    return await prisma.user.upsert({
      where: { id: userId },
      update: {
        email,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        email,
      },
    })
  } catch (error) {
    console.error("Database: Error in createOrUpdateUser:", error)
    throw error
  }
}

export async function getUserProfile(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
    })
  } catch (error) {
    console.error("Database: Error in getUserProfile:", error)
    return null
  }
}

// Statistics - Simplified to avoid complex joins that might cause panics
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    console.log("Database: getUserStats called for user:", userId)

    // Get user profile, create if doesn't exist
    let user = await getUserProfile(userId)

    if (!user) {
      console.log("Database: Creating new user:", userId)
      user = await createOrUpdateUser(userId, `user-${userId}@example.com`)
    }

    // Get total problems count with simple query
    let totalProblems = 0
    try {
      totalProblems = await prisma.problem.count()
      console.log(`Database: Total problems count: ${totalProblems}`)
    } catch (error) {
      console.error("Database: Error counting problems:", error)
      totalProblems = 0
    }

    if (totalProblems === 0) {
      console.warn("Database: No problems in database! Returning default stats.")
      return {
        totalSolved: 0,
        totalProblems: 0,
        easyCompleted: 0,
        mediumCompleted: 0,
        hardCompleted: 0,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        studyTimeToday: 0,
        weeklyGoalProgress: 0,
        level: user.level,
        xp: user.xp,
        nextLevelXp: getNextLevelXP(user.level),
      }
    }

    // Get solved problems count with simple query
    let totalSolved = 0
    let easyCompleted = 0
    let mediumCompleted = 0
    let hardCompleted = 0

    try {
      // Simple count query first
      totalSolved = await prisma.userProgress.count({
        where: {
          userId,
          solved: true,
        },
      })

      console.log(`Database: Total solved problems: ${totalSolved}`)

      // If we have solved problems, get difficulty breakdown
      if (totalSolved > 0) {
        // Use raw query to avoid complex joins that might cause panics
        const difficultyStats = (await prisma.$queryRaw`
          SELECT p.difficulty, COUNT(*) as count
          FROM user_progress up
          JOIN problems p ON up.problem_id = p.id
          WHERE up.user_id = ${userId} AND up.solved = true
          GROUP BY p.difficulty
        `) as Array<{ difficulty: string; count: bigint }>

        difficultyStats.forEach((stat) => {
          const count = Number(stat.count)
          switch (stat.difficulty) {
            case "Easy":
              easyCompleted = count
              break
            case "Medium":
              mediumCompleted = count
              break
            case "Hard":
              hardCompleted = count
              break
          }
        })
      }
    } catch (error) {
      console.error("Database: Error getting solved problems:", error)
      // Use safe defaults
      totalSolved = 0
      easyCompleted = 0
      mediumCompleted = 0
      hardCompleted = 0
    }

    // Get today's study time with simple query
    let studyTimeToday = 0
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayStudyTime = await prisma.studySession.aggregate({
        where: {
          userId,
          sessionDate: {
            gte: today,
          },
        },
        _sum: {
          duration: true,
        },
      })

      studyTimeToday = todayStudyTime._sum.duration || 0
    } catch (error) {
      console.error("Database: Error getting study time:", error)
      studyTimeToday = 0
    }

    // Calculate weekly goal progress with simple query
    let weeklyGoalProgress = 0
    try {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const weeklyProgress = await prisma.userProgress.count({
        where: {
          userId,
          solved: true,
          solvedAt: {
            gte: weekStart,
          },
        },
      })

      weeklyGoalProgress = Math.min(weeklyProgress / user.weeklyGoal, 1)
    } catch (error) {
      console.error("Database: Error getting weekly progress:", error)
      weeklyGoalProgress = 0
    }

    const stats = {
      totalSolved,
      totalProblems,
      easyCompleted,
      mediumCompleted,
      hardCompleted,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      studyTimeToday,
      weeklyGoalProgress,
      level: user.level,
      xp: user.xp,
      nextLevelXp: getNextLevelXP(user.level),
    }

    console.log("Database: Final user stats:", stats)
    return stats
  } catch (error) {
    console.error("Database: Error in getUserStats:", error)

    // Return safe default stats
    return {
      totalSolved: 0,
      totalProblems: 0,
      easyCompleted: 0,
      mediumCompleted: 0,
      hardCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      studyTimeToday: 0,
      weeklyGoalProgress: 0,
      level: "Bronze",
      xp: 0,
      nextLevelXp: 1000,
    }
  }
}

// Problems Management - Simplified
export async function getProblemsWithProgress(
  userId: string,
  filters?: {
    search?: string
    difficulty?: string
    pattern?: string
    status?: string
  },
) {
  console.log("Database: getProblemsWithProgress called for user:", userId)
  console.log("Database: Filters:", filters)

  try {
    // Test basic database connection first
    await prisma.$queryRaw`SELECT 1 as test`
    console.log("Database: Connection test successful")

    // Check if problems table has data
    const problemCount = await prisma.problem.count()
    console.log(`Database: Total problems in database: ${problemCount}`)

    if (problemCount === 0) {
      console.warn("Database: No problems found in database! Run the seed script.")
      return []
    }

    // Ensure user exists
    let user = await getUserProfile(userId)
    if (!user) {
      console.log("Database: Creating user:", userId)
      user = await createOrUpdateUser(userId, `user-${userId}@example.com`)
    }

    // Build where clause for problems
    const whereClause: any = {}

    if (filters?.difficulty && filters.difficulty !== "All") {
      whereClause.difficulty = filters.difficulty as Difficulty
    }

    if (filters?.pattern && filters.pattern !== "All") {
      whereClause.pattern = filters.pattern
    }

    if (filters?.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { topics: { has: filters.search } },
      ]
    }

    console.log("Database: Where clause:", JSON.stringify(whereClause, null, 2))

    // Get problems with a simpler query structure
    const problems = await prisma.problem.findMany({
      where: whereClause,
      orderBy: { questionNo: "asc" },
      take: 1000, // Limit to prevent memory issues
    })

    console.log(`Database: Found ${problems.length} problems`)

    // Get user progress separately to avoid complex joins
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        problemId: true,
        solved: true,
        solvedAt: true,
        timeSpent: true,
        attempts: true,
      },
    })

    // Create a map for quick lookup
    const progressMap = new Map()
    userProgress.forEach((progress) => {
      progressMap.set(progress.problemId, progress)
    })

    // Combine problems with progress
    const problemsWithProgress = problems.map((problem) => ({
      ...problem,
      progress: progressMap.has(problem.id) ? [progressMap.get(problem.id)] : [],
    }))

    // Filter by solved status if needed
    let filteredProblems = problemsWithProgress
    if (filters?.status && filters.status !== "All") {
      const isSolved = filters.status === "Solved"
      filteredProblems = problemsWithProgress.filter((problem) => {
        const progress = problem.progress[0]
        return progress ? progress.solved === isSolved : !isSolved
      })
      console.log(`Database: After status filter: ${filteredProblems.length} problems`)
    }

    return filteredProblems
  } catch (error) {
    console.error("Database: Error in getProblemsWithProgress:", error)
    return []
  }
}

export async function getUserProgress(userId: string) {
  try {
    // Ensure user exists
    const user = await getUserProfile(userId)
    if (!user) {
      await createOrUpdateUser(userId, `user-${userId}@example.com`)
    }

    const progress = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        problemId: true,
        solved: true,
        solvedAt: true,
        timeSpent: true,
      },
    })

    // Convert to object for easy lookup
    const progressMap: Record<string, boolean> = {}
    progress.forEach((p) => {
      progressMap[p.problemId] = p.solved
    })

    console.log(`Database: getUserProgress returned ${progress.length} progress records`)
    return progressMap
  } catch (error) {
    console.error("Database: Error in getUserProgress:", error)
    return {}
  }
}

// Progress Management
export async function toggleProblemProgress(userId: string, problemId: string, solved: boolean) {
  try {
    const result = await prisma.userProgress.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {
        solved,
        solvedAt: solved ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        problemId,
        solved,
        solvedAt: solved ? new Date() : null,
      },
    })

    // Fetch problem details (pattern, difficulty)
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: { pattern: true, difficulty: true },
    })

    if (problem?.pattern) {
      // Update PatternMastery for this user and pattern
      const mastery = await prisma.patternMastery.findUnique({
        where: { userId_pattern: { userId, pattern: problem.pattern } },
      })
      // Count solved problems for this pattern
      const solvedCount = await prisma.userProgress.count({
        where: {
          userId,
          solved: true,
          problem: { pattern: problem.pattern },
        },
      })
      // Count total problems for this pattern
      const totalCount = await prisma.problem.count({
        where: { pattern: problem.pattern },
      })
      const masteryPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0
      await prisma.patternMastery.upsert({
        where: { userId_pattern: { userId, pattern: problem.pattern } },
        update: {
          problemsSolved: solvedCount,
          totalProblems: totalCount,
          masteryPercentage,
        },
        create: {
          userId,
          pattern: problem.pattern,
          problemsSolved: solvedCount,
          totalProblems: totalCount,
          masteryPercentage,
        },
      })
    }

    // Update user XP and streak if solved
    if (solved) {
      await updateUserXP(userId, 10)
      await updateUserStreak(userId)
    }

    return result
  } catch (error) {
    console.error("Database: Error in toggleProblemProgress:", error)
    throw error
  }
}

// Helper to compute difficulty trends for analytics
export async function getUserDifficultyTrends(userId: string) {
  // Get all solved problems for this user, grouped by month and difficulty
  const solvedProblems = await prisma.userProgress.findMany({
    where: { userId, solved: true },
    select: {
      solvedAt: true,
      problem: { select: { difficulty: true } },
    },
  })
  // Group by month and difficulty
  const trends: Record<string, { easy: number; medium: number; hard: number }> = {}
  const today = new Date()
  solvedProblems.forEach((entry) => {
    const date = entry.solvedAt ? new Date(entry.solvedAt) : today
    const month = date.toLocaleString("default", { month: "short" })
    const year = date.getFullYear()
    const key = `${month} ${year}`
    const difficulty = entry.problem?.difficulty || "Easy"
    if (!trends[key]) trends[key] = { easy: 0, medium: 0, hard: 0 }
    if (difficulty === "Easy") trends[key].easy++
    else if (difficulty === "Medium") trends[key].medium++
    else if (difficulty === "Hard") trends[key].hard++
  })
  // Return as array sorted by date (limit to last 6 months)
  const sortedKeys = Object.keys(trends).sort((a, b) => {
    const [ma, ya] = a.split(" ");
    const [mb, yb] = b.split(" ");
    const da = new Date(`${ma} 1, ${ya}`)
    const db = new Date(`${mb} 1, ${yb}`)
    return da.getTime() - db.getTime()
  })
  return sortedKeys.slice(-6).map((key) => ({ month: key, ...trends[key] }))
}

// Helper functions
function getNextLevelXP(currentLevel: string): number {
  switch (currentLevel) {
    case "Bronze":
      return 1000
    case "Silver":
      return 2500
    case "Gold":
      return 5000
    default:
      return 1000
  }
}

async function updateUserXP(userId: string, xpGain: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    })

    if (!user) return

    const newXP = user.xp + xpGain
    let newLevel = user.level

    if (user.level === "Bronze" && newXP >= 1000) {
      newLevel = "Silver"
    } else if (user.level === "Silver" && newXP >= 2500) {
      newLevel = "Gold"
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel,
      },
    })
  } catch (error) {
    console.error("Database: Error in updateUserXP:", error)
  }
}

async function updateUserStreak(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true },
    })

    if (!user) return

    const lastSolved = await prisma.userProgress.findFirst({
      where: {
        userId,
        solved: true,
        solvedAt: { not: null },
      },
      orderBy: { solvedAt: "desc" },
      select: { solvedAt: true },
    })

    if (!lastSolved?.solvedAt) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastSolvedDate = new Date(lastSolved.solvedAt)
    lastSolvedDate.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = user.currentStreak

    if (lastSolvedDate.getTime() === today.getTime()) {
      return
    } else if (lastSolvedDate.getTime() === yesterday.getTime()) {
      newStreak = user.currentStreak + 1
    } else {
      newStreak = 1
    }

    const newLongestStreak = Math.max(newStreak, user.longestStreak)

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
      },
    })
  } catch (error) {
    console.error("Database: Error in updateUserStreak:", error)
  }
}

// Notes Management
export async function saveNote(userId: string, problemId: string, content: string, type: NoteType) {
  try {
    return await prisma.note.upsert({
      where: {
        userId_problemId_type: {
          userId,
          problemId,
          type,
        },
      },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        userId,
        problemId,
        type,
        content,
      },
    })
  } catch (error) {
    console.error("Database: Error in saveNote:", error)
    throw error
  }
}

export async function getNotes(userId: string, problemId: string) {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId,
        problemId,
      },
      select: {
        type: true,
        content: true,
      },
    })

    const notesObj = {
      general: "",
      mistakes: "",
      insights: "",
    }

    notes.forEach((note) => {
      notesObj[note.type] = note.content || ""
    })

    return notesObj
  } catch (error) {
    console.error("Database: Error in getNotes:", error)
    return {
      general: "",
      mistakes: "",
      insights: "",
    }
  }
}

// Goals Management
export async function getUserGoals(userId: string) {
  try {
    const user = await getUserProfile(userId)
    if (!user) {
      await createOrUpdateUser(userId, `user-${userId}@example.com`)
    }

    return await prisma.goal.findMany({
      where: {
        userId,
        active: true,
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Database: Error in getUserGoals:", error)
    return []
  }
}

// Analytics
export async function getPatternMastery(userId: string) {
  try {
    return await prisma.patternMastery.findMany({
      where: { userId },
      orderBy: { masteryPercentage: "desc" },
    })
  } catch (error) {
    console.error("Database: Error in getPatternMastery:", error)
    return []
  }
}

// Update getWeeklyActivity to count solved problems even if solvedAt is missing
export async function getWeeklyActivity(userId: string) {
  try {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    weekStart.setHours(0, 0, 0, 0)

    // Get all solved problems for this user in the last week, or with missing solvedAt
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        solved: true,
      },
      select: {
        solvedAt: true,
      },
    })

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const activityMap: Record<string, number> = {}
    const today = new Date()
    progress.forEach((entry) => {
      let date = entry.solvedAt ? new Date(entry.solvedAt) : today
      if (date >= weekStart) {
        const dayName = days[date.getDay()]
        activityMap[dayName] = (activityMap[dayName] || 0) + 1
      }
    })

    return days.map((day) => ({
      day,
      problems: activityMap[day] || 0,
    }))
  } catch (error) {
    console.error("Database: Error in getWeeklyActivity:", error)
    return [
      { day: "Sun", problems: 0 },
      { day: "Mon", problems: 0 },
      { day: "Tue", problems: 0 },
      { day: "Wed", problems: 0 },
      { day: "Thu", problems: 0 },
      { day: "Fri", problems: 0 },
      { day: "Sat", problems: 0 },
    ]
  }
}
