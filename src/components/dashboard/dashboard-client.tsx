"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import StatsOverview from "@/components/dashboard/stats-overview"
import { useUserData } from "@/lib/hooks/use-user-data"
import { Skeleton } from "@/components/ui/skeleton"

interface ProblemsListProps {
  initialProgress: Record<string, boolean>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="modern-card p-6 rounded-xl">
            <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
            <Skeleton className="h-8 w-16 mb-2 bg-white/10" />
            <Skeleton className="h-3 w-20 bg-white/5" />
          </div>
        ))}
      </div>
      <div className="modern-card p-6 rounded-xl">
        <Skeleton className="h-6 w-32 mb-4 bg-white/10" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  )
}

const defaultStats = {
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
export function ProblemsList({ initialProgress }: ProblemsListProps) {
  return (
    <div>
      {/* Render something with initialProgress */}
      {Object.entries(initialProgress).map(([problemId, isSolved]) => (
        <div key={problemId}>
          Problem {problemId}: {isSolved ? "✅ Solved" : "❌ Unsolved"}
        </div>
      ))}
    </div>
  );
}
export default function DashboardClient() {
  const { data, loading, fetchStats, fetchProgress } = useUserData()

  useEffect(() => {
    if (!data.stats) fetchStats()
    if (!data.progress || Object.keys(data.progress).length === 0) {
      fetchProgress()
    }
  }, [data.stats, data.progress, fetchStats, fetchProgress])

  if (loading.stats && !data.stats) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <StatsOverview stats={data.stats ?? defaultStats} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
       <ProblemsList initialProgress={data.progress} />
      </motion.div>
    </div>
  )
}
