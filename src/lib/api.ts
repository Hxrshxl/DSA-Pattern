import {
  getUserStats as dbGetUserStats,
  getUserProgress as dbGetUserProgress,
  getUserGoals as dbGetUserGoals,
  toggleProblemProgress,
  getProblemsWithProgress,
  saveNote as dbSaveNote,
  getNotes as dbGetNotes,
  getPatternMastery,
  getWeeklyActivity,
} from "./database"

export async function getUserProgress(userId: string) {
  return await dbGetUserProgress(userId)
}

export async function getUserStats(userId: string) {
  return await dbGetUserStats(userId)
}

export async function getUserGoals(userId: string) {
  return await dbGetUserGoals(userId)
}

export async function getUserAnalytics(userId: string) {
  const [weeklyActivity, patternProgress] = await Promise.all([getWeeklyActivity(userId), getPatternMastery(userId)])

  // Mock difficulty trends for now
  const difficultyTrends = [
    { month: "Jan", easy: 20, medium: 15, hard: 5 },
    { month: "Feb", easy: 25, medium: 18, hard: 7 },
    { month: "Mar", easy: 30, medium: 22, hard: 10 },
  ]

  return {
    weeklyActivity,
    patternProgress: patternProgress.map((p) => ({
      pattern: p.pattern,
      completed: p.problemsSolved,
      total: p.totalProblems,
    })),
    difficultyTrends,
  }
}

// Fix: Export the getProblems function
export async function getProblems(filters: {
  search: string
  difficulty: string
  status: string
  pattern: string
  userId: string
}) {
  return await getProblemsWithProgress(filters.userId, {
    search: filters.search,
    difficulty: filters.difficulty,
    status: filters.status,
    pattern: filters.pattern,
  })
}

export async function toggleProblemStatus(userId: string, problemId: string, solved: boolean) {
  return await toggleProblemProgress(userId, problemId, solved)
}

export async function saveNote(userId: string, problemId: string, content: string, type: string) {
  return await dbSaveNote(userId, problemId, content, type as any)
}

export async function getNotes(userId: string, problemId: string) {
  return await dbGetNotes(userId, problemId)
}
