"use client"

import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard"
import { useUserData } from "@/lib/hooks/use-user-data"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2 bg-white/10" />
        <Skeleton className="h-4 w-64 bg-white/5" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="modern-card p-6 rounded-xl">
            <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
            <Skeleton className="h-8 w-16 mb-2 bg-white/10" />
            <Skeleton className="h-3 w-20 bg-white/5" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="modern-card p-6 rounded-xl">
            <Skeleton className="h-6 w-32 mb-4 bg-white/10" />
            <Skeleton className="h-64 w-full bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsClient() {
  const { data, loading, fetchAnalytics } = useUserData()

  useEffect(() => {
    if (!data.analytics) fetchAnalytics()
  }, [data.analytics, fetchAnalytics])

  if (loading.analytics && !data.analytics) {
    return <AnalyticsSkeleton />
  }

  const defaultAnalytics = {
    weeklyActivity: [
      { day: "Sun", problems: 0 },
      { day: "Mon", problems: 0 },
      { day: "Tue", problems: 0 },
      { day: "Wed", problems: 0 },
      { day: "Thu", problems: 0 },
      { day: "Fri", problems: 0 },
      { day: "Sat", problems: 0 },
    ],
    patternProgress: [],
    difficultyTrends: [
      { month: "Jan", easy: 0, medium: 0, hard: 0 },
      { month: "Feb", easy: 0, medium: 0, hard: 0 },
      { month: "Mar", easy: 0, medium: 0, hard: 0 },
    ],
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <AnalyticsDashboard data={data.analytics || defaultAnalytics} />
    </motion.div>
  )
}
