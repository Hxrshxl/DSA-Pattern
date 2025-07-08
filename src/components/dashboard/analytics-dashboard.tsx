"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Calendar, Target, Clock, Brain, Zap, Star } from "lucide-react"

interface AnalyticsDashboardProps {
  data: {
    weeklyActivity: Array<{ day: string; problems: number }>
    patternProgress: Array<{ pattern: string; completed: number; total: number }>
    difficultyTrends: Array<{ month: string; easy: number; medium: number; hard: number }>
  }
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  const totalProblemsThisWeek = data.weeklyActivity.reduce((sum, day) => sum + day.problems, 0)
  const avgProblemsPerDay = totalProblemsThisWeek / 7

  const patternMasteryData = data.patternProgress.map((pattern) => ({
    ...pattern,
    percentage: (pattern.completed / pattern.total) * 100,
  }))

  const difficultyDistribution = data.difficultyTrends[data.difficultyTrends.length - 1]
  const totalThisMonth = difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard

  const pieData = [
    { name: "Easy", value: difficultyDistribution.easy, color: "#10B981" },
    { name: "Medium", value: difficultyDistribution.medium, color: "#F59E0B" },
    { name: "Hard", value: difficultyDistribution.hard, color: "#EF4444" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-400 mt-2">Deep insights into your learning progress and patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glassmorphism border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProblemsThisWeek}</div>
            <p className="text-xs text-gray-400">{avgProblemsPerDay.toFixed(1)} avg per day</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Best Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {Math.max(...data.weeklyActivity.map((d) => d.problems))}
            </div>
            <p className="text-xs text-gray-400">problems solved</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Consistency</CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {data.weeklyActivity.filter((d) => d.problems > 0).length}/7
            </div>
            <p className="text-xs text-gray-400">active days</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">2.5h</div>
            <p className="text-xs text-gray-400">daily average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity Chart */}
        <Card className="glassmorphism border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Weekly Activity</CardTitle>
            <CardDescription className="text-gray-400">Problems solved each day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.8)",
                    border: "1px solid rgba(75, 85, 99, 0.3)",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="problems" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="glassmorphism border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Difficulty Distribution</CardTitle>
            <CardDescription className="text-gray-400">Problems solved by difficulty this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.8)",
                    border: "1px solid rgba(75, 85, 99, 0.3)",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-gray-300">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Mastery */}
      <Card className="glassmorphism border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-400" />
            Pattern Mastery Progress
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your progress across different algorithmic patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {patternMasteryData.map((pattern, index) => (
              <div key={pattern.pattern} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-white">{pattern.pattern}</span>
                    </div>
                    {pattern.percentage >= 80 && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <Star className="h-3 w-3 mr-1" />
                        Mastered
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {pattern.completed}/{pattern.total}
                  </div>
                </div>
                <Progress value={pattern.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{pattern.percentage.toFixed(0)}% complete</span>
                  <span>{pattern.total - pattern.completed} remaining</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="glassmorphism border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Monthly Progress Trends</CardTitle>
          <CardDescription className="text-gray-400">Your solving patterns over the last few months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.difficultyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.8)",
                  border: "1px solid rgba(75, 85, 99, 0.3)",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              <Line
                type="monotone"
                dataKey="easy"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="medium"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="hard"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="glassmorphism border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-400" />
            AI Insights & Recommendations
          </CardTitle>
          <CardDescription className="text-gray-400">
            Personalized suggestions based on your learning patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                <div>
                  <h4 className="font-medium text-blue-400 mb-1">Consistency Boost</h4>
                  <p className="text-sm text-gray-300">
                    You've been very consistent this week! Try to maintain this momentum by setting a daily reminder.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">Pattern Focus</h4>
                  <p className="text-sm text-gray-300">
                    Consider focusing more on "Dynamic Programming" - you're at 45% completion and it's a high-frequency
                    pattern.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                <div>
                  <h4 className="font-medium text-green-400 mb-1">Difficulty Balance</h4>
                  <p className="text-sm text-gray-300">
                    Great balance between difficulties! Consider adding more Hard problems to challenge yourself
                    further.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
