"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, CheckCircle, Flame, Star, Target, TrendingUp, Award, Zap } from "lucide-react"

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

export default function EnhancedStatsOverview({ stats }: StatsOverviewProps) {
  const completionRate = (stats.totalSolved / stats.totalProblems) * 100

  // Calculate star rating based on performance
  const getStarRating = (value: number, max: number) => {
    const percentage = (value / max) * 100
    if (percentage >= 80) return 5
    if (percentage >= 60) return 4
    if (percentage >= 40) return 3
    if (percentage >= 20) return 2
    return 1
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
    ))
  }

  const overallStars = getStarRating(stats.totalSolved, stats.totalProblems)
  const streakStars = getStarRating(stats.currentStreak, 30) // Max 30 days for 5 stars
  const studyStars = getStarRating(stats.studyTimeToday, 240) // 4 hours for 5 stars
  const levelStars = stats.level === "Bronze" ? 2 : stats.level === "Silver" ? 3 : stats.level === "Gold" ? 4 : 5

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Overall Progress</CardTitle>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <Award className="h-4 w-4 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">
            {stats.totalSolved}
            <span className="text-gray-500">/{stats.totalProblems}</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex space-x-1">{renderStars(overallStars)}</div>
            <span className="text-xs text-gray-400">({overallStars}/5)</span>
          </div>
          <Progress value={completionRate} className="h-2 mb-2" />
          <p className="text-sm text-gray-400">{completionRate.toFixed(1)}% complete</p>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-900/20 to-black border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Current Streak</CardTitle>
          <div className="flex items-center space-x-1">
            <Flame className="h-5 w-5 text-orange-400" />
            <Zap className="h-4 w-4 text-yellow-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {stats.currentStreak} <span className="text-lg text-gray-400">days</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex space-x-1">{renderStars(streakStars)}</div>
            <span className="text-xs text-gray-400">({streakStars}/5)</span>
          </div>
          <p className="text-sm text-gray-400">Best: {stats.longestStreak} days</p>
          {stats.currentStreak >= 7 && (
            <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">🔥 On Fire!</Badge>
          )}
        </CardContent>
      </Card>

      {/* Study Time */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Today's Study Time</CardTitle>
          <div className="flex items-center space-x-1">
            <Clock className="h-5 w-5 text-blue-400" />
            <Target className="h-4 w-4 text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {(stats.studyTimeToday / 60).toFixed(1)}
            <span className="text-lg text-gray-400">h</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex space-x-1">{renderStars(studyStars)}</div>
            <span className="text-xs text-gray-400">({studyStars}/5)</span>
          </div>
          <p className="text-sm text-gray-400">Keep it up! 🎯</p>
          {stats.studyTimeToday >= 120 && (
            <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">💪 Focused!</Badge>
          )}
        </CardContent>
      </Card>

      {/* Level & XP */}
      <Card className="bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Level & XP</CardTitle>
          <div className="flex items-center space-x-1">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-lg px-3 py-1">
              {stats.level}
            </Badge>
            <span className="text-sm text-gray-400">{stats.xp} XP</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex space-x-1">{renderStars(levelStars)}</div>
            <span className="text-xs text-gray-400">({levelStars}/5)</span>
          </div>
          <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-2 mb-2" />
          <p className="text-sm text-gray-400">{stats.nextLevelXp - stats.xp} XP to next level</p>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl md:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
            Difficulty Breakdown
            <div className="flex space-x-1 ml-4">
              {renderStars(Math.ceil((stats.easyCompleted + stats.mediumCompleted + stats.hardCompleted) / 50))}
            </div>
          </CardTitle>
          <CardDescription className="text-gray-400">Your progress across different difficulty levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
                <span className="text-base text-gray-300">Easy</span>
                <div className="flex space-x-1">{renderStars(getStarRating(stats.easyCompleted, 100))}</div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-base text-white font-medium">{stats.easyCompleted}</span>
                <Progress value={75} className="w-24 h-2" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span className="text-base text-gray-300">Medium</span>
                <div className="flex space-x-1">{renderStars(getStarRating(stats.mediumCompleted, 100))}</div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-base text-white font-medium">{stats.mediumCompleted}</span>
                <Progress value={45} className="w-24 h-2" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
                <span className="text-base text-gray-300">Hard</span>
                <div className="flex space-x-1">{renderStars(getStarRating(stats.hardCompleted, 50))}</div>
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
      <Card className="bg-gradient-to-br from-green-900/20 to-black border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-2xl md:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-400" />
            Weekly Goal Progress
            <div className="flex space-x-1 ml-4">{renderStars(Math.ceil(stats.weeklyGoalProgress * 5))}</div>
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
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-400">
                {stats.weeklyGoalProgress >= 1
                  ? "Goal completed! 🎉"
                  : `${Math.ceil((1 - stats.weeklyGoalProgress) * 15)} more to reach your goal`}
              </span>
            </div>
            {stats.weeklyGoalProgress >= 0.8 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">🎯 Almost There!</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
