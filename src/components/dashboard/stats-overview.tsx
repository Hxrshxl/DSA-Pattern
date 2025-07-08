"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, CheckCircle, Flame, Star, Target, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
  stats: {
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
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const completionRate = (stats.totalSolved / stats.totalProblems) * 100

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Overall Progress */}
      <Card className="modern-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Overall Progress</CardTitle>
          <CheckCircle className="h-5 w-5 icon-green" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {stats.totalSolved}/{stats.totalProblems}
          </div>
          <Progress value={completionRate} className="mt-3 h-2" />
          <p className="text-sm text-gray-400 mt-2">{completionRate.toFixed(1)}% complete</p>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="modern-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Current Streak</CardTitle>
          <Flame className="h-5 w-5 icon-orange" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-400">{stats.currentStreak} days</div>
          <p className="text-sm text-gray-400 mt-2">Best: {stats.longestStreak} days</p>
        </CardContent>
      </Card>

      {/* Study Time */}
      <Card className="modern-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Today's Study Time</CardTitle>
          <Clock className="h-5 w-5 icon-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-400">{(stats.studyTimeToday / 60).toFixed(1)}h</div>
          <p className="text-sm text-gray-400 mt-2">Keep it up! 🎯</p>
        </CardContent>
      </Card>

      {/* Level & XP */}
      <Card className="modern-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Level & XP</CardTitle>
          <Trophy className="h-5 w-5 icon-yellow" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{stats.level}</Badge>
            <span className="text-sm text-gray-400">{stats.xp} XP</span>
          </div>
          <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="mt-2 h-2" />
          <p className="text-sm text-gray-400 mt-2">{stats.nextLevelXp - stats.xp} XP to next level</p>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card className="modern-card md:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 icon-purple" />
            Difficulty Breakdown
          </CardTitle>
          <CardDescription className="text-gray-400">Your progress across different difficulty levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
                <span className="text-base text-gray-300">Easy</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-base text-white font-medium">{stats.easyCompleted}</span>
                <Progress value={75} className="w-24 h-2" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span className="text-base text-gray-300">Medium</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-base text-white font-medium">{stats.mediumCompleted}</span>
                <Progress value={45} className="w-24 h-2" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
                <span className="text-base text-gray-300">Hard</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-base text-white font-medium">{stats.hardCompleted}</span>
                <Progress value={25} className="w-24 h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card className="modern-card md:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="h-5 w-5 mr-2 icon-green" />
            Weekly Goal Progress
          </CardTitle>
          <CardDescription className="text-gray-400">You're doing great! Keep up the momentum</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-300">Problems Solved This Week</span>
              <span className="text-base text-white font-medium">{Math.floor(stats.weeklyGoalProgress * 15)}/15</span>
            </div>
            <Progress value={stats.weeklyGoalProgress * 100} className="h-3" />
            <div className="flex items-center space-x-2 mt-4">
              <Star className="h-5 w-5 icon-yellow" />
              <span className="text-sm text-gray-400">
                {stats.weeklyGoalProgress >= 1
                  ? "Goal completed! 🎉"
                  : `${Math.ceil((1 - stats.weeklyGoalProgress) * 15)} more to reach your goal`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
