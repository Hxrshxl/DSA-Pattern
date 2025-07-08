"use client"

import type React from "react"
import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Home, Target, BarChart3, BookOpen, Settings, Menu, X, Flame, Trophy, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useUserData } from "@/lib/hooks/use-user-data"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, color: "icon-blue" },
  { name: "Goals", href: "/dashboard/goals", icon: Target, color: "icon-green" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "icon-purple" },
  { name: "Notes", href: "/dashboard/notes", icon: BookOpen, color: "icon-orange" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, color: "icon-red" },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data } = useUserData()

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col modern-card border-r border-white/10 bg-black">
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <Brain className="h-10 w-10 icon-purple" />
              <span className="text-2xl font-bold text-white">DSA Patterns</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Stats */}
          <div className="px-6 pb-6">
            <div className="modern-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-300">Current Streak</span>
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 icon-orange" />
                  <span className="text-orange-400 font-bold text-lg">{data.stats?.currentStreak || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-300">Level</span>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 icon-yellow" />
                  <span className="text-yellow-400 font-bold text-lg">{data.stats?.level || "Bronze"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Study Time</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 icon-blue" />
                  <span className="text-blue-400 font-bold text-lg">
                    {((data.stats?.studyTimeToday || 0) / 60).toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6">
            <ul className="space-y-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 neon-glow"
                          : "text-gray-300 hover:bg-white/10 hover:text-white modern-card",
                      )}
                    >
                      <item.icon className={cn("h-6 w-6", isActive ? "icon-blue" : item.color)} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center space-x-4">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-12 w-12",
                  },
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-white truncate">Welcome back!</p>
                <p className="text-sm text-gray-400 truncate">Keep up the great work</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 modern-card border-b border-white/10 bg-black">
          <div className="flex items-center justify-between px-6 py-4">
            <Button variant="ghost" size="sm" className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                <Target className="h-4 w-4 mr-2 icon-green" />
                Daily Goal: {Math.floor((data.stats?.weeklyGoalProgress || 0) * 15)}/3 Complete
              </Badge>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-2">
                <Flame className="h-4 w-4 mr-2 icon-orange" />
                {data.stats?.currentStreak || 0} Day Streak
              </Badge>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-black">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
