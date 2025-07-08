"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"

interface UserStats {
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

interface Goal {
  id: string
  title: string
  description: string | null
  type: "daily" | "weekly" | "monthly"
  target: number
  current: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface UserData {
  stats: UserStats | null
  goals: Goal[]
  progress: Record<string, boolean>
  analytics: any
}

// Global cache to persist data across page navigations
const globalCache = {
  stats: null as UserStats | null,
  goals: [] as Goal[],
  progress: {} as Record<string, boolean>,
  analytics: null as any,
  lastFetch: {
    stats: 0,
    goals: 0,
    progress: 0,
    analytics: 0,
  },
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useUserData() {
  const { user, isLoaded } = useUser()
  const [data, setData] = useState<UserData>({
    stats: globalCache.stats,
    goals: globalCache.goals,
    progress: globalCache.progress,
    analytics: globalCache.analytics,
  })
  const [loading, setLoading] = useState({
    stats: !globalCache.stats,
    goals: globalCache.goals.length === 0,
    progress: Object.keys(globalCache.progress).length === 0,
    analytics: !globalCache.analytics,
  })

  const fetchStats = useCallback(async () => {
    if (!user?.id) return

    const now = Date.now()
    if (globalCache.stats && now - globalCache.lastFetch.stats < CACHE_DURATION) {
      return globalCache.stats
    }

    try {
      setLoading((prev) => ({ ...prev, stats: true }))
      const response = await fetch("/api/user/stats")
      if (response.ok) {
        const stats = await response.json()
        globalCache.stats = stats
        globalCache.lastFetch.stats = now
        setData((prev) => ({ ...prev, stats }))
        return stats
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }))
    }
  }, [user?.id])

  const fetchGoals = useCallback(async () => {
    if (!user?.id) return

    const now = Date.now()
    if (globalCache.goals.length > 0 && now - globalCache.lastFetch.goals < CACHE_DURATION) {
      return globalCache.goals
    }

    try {
      setLoading((prev) => ({ ...prev, goals: true }))
      const response = await fetch("/api/user/goals")
      if (response.ok) {
        let goals = await response.json()
        if (!Array.isArray(goals)) goals = []
        globalCache.goals = goals
        globalCache.lastFetch.goals = now
        setData((prev) => ({ ...prev, goals }))
        return goals
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading((prev) => ({ ...prev, goals: false }))
    }
  }, [user?.id])

  const fetchProgress = useCallback(async () => {
    if (!user?.id) return

    const now = Date.now()
    if (Object.keys(globalCache.progress).length > 0 && now - globalCache.lastFetch.progress < CACHE_DURATION) {
      return globalCache.progress
    }

    try {
      setLoading((prev) => ({ ...prev, progress: true }))
      const response = await fetch("/api/user/progress")
      if (response.ok) {
        const progress = await response.json()
        globalCache.progress = progress
        globalCache.lastFetch.progress = now
        setData((prev) => ({ ...prev, progress }))
        return progress
      }
    } catch (error) {
      console.error("Error fetching progress:", error)
    } finally {
      setLoading((prev) => ({ ...prev, progress: false }))
    }
  }, [user?.id])

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return

    const now = Date.now()
    if (globalCache.analytics && now - globalCache.lastFetch.analytics < CACHE_DURATION) {
      return globalCache.analytics
    }

    try {
      setLoading((prev) => ({ ...prev, analytics: true }))
      const response = await fetch("/api/user/analytics")
      if (response.ok) {
        const analytics = await response.json()
        globalCache.analytics = analytics
        globalCache.lastFetch.analytics = now
        setData((prev) => ({ ...prev, analytics }))
        return analytics
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading((prev) => ({ ...prev, analytics: false }))
    }
  }, [user?.id])

  const refreshData = useCallback(
    async (type?: "stats" | "goals" | "progress" | "analytics") => {
      if (type) {
        switch (type) {
          case "stats":
            globalCache.lastFetch.stats = 0
            return await fetchStats()
          case "goals":
            globalCache.lastFetch.goals = 0
            return await fetchGoals()
          case "progress":
            globalCache.lastFetch.progress = 0
            return await fetchProgress()
          case "analytics":
            globalCache.lastFetch.analytics = 0
            return await fetchAnalytics()
        }
      } else {
        // Refresh all
        globalCache.lastFetch = { stats: 0, goals: 0, progress: 0, analytics: 0 }
        await Promise.all([fetchStats(), fetchGoals(), fetchProgress(), fetchAnalytics()])
      }
    },
    [fetchStats, fetchGoals, fetchProgress, fetchAnalytics],
  )

  // Initial data fetch
  useEffect(() => {
    if (isLoaded && user?.id) {
      // Only fetch data that's not already cached
      if (!globalCache.stats) fetchStats()
      if (globalCache.goals.length === 0) fetchGoals()
      if (Object.keys(globalCache.progress).length === 0) fetchProgress()
      if (!globalCache.analytics) fetchAnalytics()
    }
  }, [isLoaded, user?.id, fetchStats, fetchGoals, fetchProgress, fetchAnalytics])

  return {
    data,
    loading,
    refreshData,
    fetchStats,
    fetchGoals,
    fetchProgress,
    fetchAnalytics,
  }
}
