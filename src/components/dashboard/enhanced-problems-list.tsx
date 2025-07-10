"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ExternalLink,
  Check,
  Clock,
  Crown,
  Search,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Filter,
  ArrowUpRight,
  BookOpen,
  Play,
  Layers,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Problem = {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  url: string
  isPremium: boolean
}

type ProblemWithProgress = Problem & {
  progress: "todo" | "done"
}

export function EnhancedProblemsList() {
  const [data, setData] = useState<ProblemWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [progressFilter, setProgressFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Load progress from localStorage
  const loadProgressFromStorage = () => {
    try {
      const saved = localStorage.getItem("problemsProgress")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  // Save progress to localStorage
  const saveProgressToStorage = (progressData: Record<string, { progress: string; completedAt?: string }>) => {
    try {
      localStorage.setItem("problemsProgress", JSON.stringify(progressData))
    } catch (error) {
      console.error("Failed to save progress:", error)
    }
  }

  const loadProblems = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/problems", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      const savedProgress = loadProgressFromStorage()
      setData(
        result.map((problem: Problem) => ({
          ...problem,
          progress: savedProgress[problem.id]?.progress || "todo",
        })),
      )
    } catch (error) {
      console.error("Failed to load problems:", error)
      toast({
        title: "Failed to load problems",
        description: "Please check your connection and try again."
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProblems()
  }, [])

  // Filter data
  const filteredData = data
    .filter((item) => {
      if (progressFilter === "all") return true
      return item.progress === progressFilter
    })
    .filter((item) => {
      if (difficultyFilter === "all") return true
      return item.difficulty === difficultyFilter
    })
    .filter((item) => {
      if (searchTerm === "") return true
      return item.title.toLowerCase().includes(searchTerm.toLowerCase())
    })

  const toggleProblemStatus = (id: string, currentProgress: string) => {
    const newProgress = currentProgress === "todo" ? "done" : "todo"
    setData((prev) =>
      prev.map((problem) => (problem.id === id ? { ...problem, progress: newProgress as "todo" | "done" } : problem)),
    )
    const savedProgress = loadProgressFromStorage()
    savedProgress[id] = {
      progress: newProgress,
      completedAt: newProgress === "done" ? new Date().toISOString() : undefined,
    }
    saveProgressToStorage(savedProgress)
    toast({
      title: newProgress === "done" ? "Problem completed!" : "Marked as todo",
      description: `${data.find((p) => p.id === id)?.title} has been updated.`,
    })
  }

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const bulkMarkComplete = () => {
    const savedProgress = loadProgressFromStorage()
    setData((prev) =>
      prev.map((problem) => {
        if (selectedRows.has(problem.id) && problem.progress === "todo") {
          savedProgress[problem.id] = {
            progress: "done",
            completedAt: new Date().toISOString(),
          }
          return { ...problem, progress: "done" as const }
        }
        return problem
      }),
    )
    saveProgressToStorage(savedProgress)
    setSelectedRows(new Set())
    toast({
      title: "Bulk update completed",
      description: `${selectedRows.size} problems marked as completed.`,
    })
  }

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return {
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          icon: "🟢",
          gradient: "from-emerald-400 to-green-400",
        }
      case "Medium":
        return {
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          icon: "🟡",
          gradient: "from-amber-400 to-orange-400",
        }
      case "Hard":
        return {
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          icon: "🔴",
          gradient: "from-red-400 to-rose-400",
        }
      default:
        return {
          color: "text-slate-400",
          bg: "bg-slate-500/10",
          border: "border-slate-500/20",
          icon: "⚪",
          gradient: "from-slate-400 to-gray-400",
        }
    }
  }

  const completedCount = data.filter((p) => p.progress === "done").length
  const totalCount = data.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Loading your workspace</h1>
              <p className="text-slate-400">Preparing your coding challenges...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-16 bg-white/10 mb-2" />
                  <Skeleton className="h-4 w-24 bg-white/10 mb-4" />
                  <Skeleton className="h-6 w-full bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-white/5">
                  <Skeleton className="h-5 w-5 bg-white/10" />
                  <Skeleton className="h-5 w-5 bg-white/10" />
                  <Skeleton className="h-5 w-80 bg-white/10" />
                  <Skeleton className="h-5 w-20 bg-white/10" />
                  <Skeleton className="h-5 w-24 bg-white/10" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
            <Trophy className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Coding Challenges
            </h1>
            <p className="text-slate-400 text-lg">
              Master algorithms and data structures with {totalCount} curated problems
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-sm hover:from-blue-500/15 hover:to-blue-600/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{totalCount}</div>
                  <div className="text-sm text-slate-400">Total Problems</div>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 backdrop-blur-sm hover:from-emerald-500/15 hover:to-emerald-600/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{completedCount}</div>
                  <div className="text-sm text-slate-400">Completed</div>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 backdrop-blur-sm hover:from-amber-500/15 hover:to-amber-600/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{totalCount - completedCount}</div>
                  <div className="text-sm text-slate-400">Remaining</div>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${100 - progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 backdrop-blur-sm hover:from-purple-500/15 hover:to-purple-600/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{progressPercentage}%</div>
                  <div className="text-sm text-slate-400">Progress</div>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                  <Zap className="w-6 h-6 text-blue-400" />
                  Problem Workspace
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                    {filteredData.length} shown
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Track your coding journey and build your skills systematically
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  {viewMode === "grid" ? <BarChart3 className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex gap-3">
                <Select value={progressFilter} onValueChange={setProgressFilter}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white focus:border-blue-500/50">
                    <Filter className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Progress" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Problems</SelectItem>
                    <SelectItem value="todo">Todo ({data.filter((p) => p.progress === "todo").length})</SelectItem>
                    <SelectItem value="done">Completed ({completedCount})</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white focus:border-blue-500/50">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="font-medium text-blue-400">
                    {selectedRows.size} problem{selectedRows.size > 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={bulkMarkComplete}
                    className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRows(new Set())}
                    className="bg-white/5 border-white/20 text-slate-400 hover:bg-white/10"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Problems Display */}
            {filteredData.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-700/50 flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">No problems found</h3>
                  <p className="text-slate-400">
                    {searchTerm ? "Try adjusting your search terms" : "No problems match the current filters"}
                  </p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View - Premium Card Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((problem, index) => {
                  const difficultyConfig = getDifficultyConfig(problem.difficulty)
                  const isCompleted = problem.progress === "done"
                  const isSelected = selectedRows.has(problem.id)

                  return (
                    <Card
                      key={problem.id}
                      className={cn(
                        "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer",
                        isCompleted
                          ? "bg-gradient-to-br from-emerald-500/5 via-emerald-600/5 to-transparent border-emerald-500/20 hover:from-emerald-500/10 hover:via-emerald-600/10"
                          : "bg-gradient-to-br from-white/5 via-white/5 to-transparent border-white/10 hover:from-white/10 hover:via-white/10 hover:border-white/20",
                        isSelected && "ring-2 ring-blue-500/50 bg-blue-500/5",
                      )}
                    >
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Selection Checkbox */}
                      <div className="absolute top-4 left-4 z-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(problem.id)}
                          className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                      </div>

                      {/* Premium Badge */}
                      {problem.isPremium && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30 text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        </div>
                      )}

                      <CardContent className="p-6 relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded-md">
                              #{String(index + 1).padStart(3, "0")}
                            </div>
                            <Badge
                              className={cn(
                                "text-xs font-medium",
                                difficultyConfig.bg,
                                difficultyConfig.color,
                                difficultyConfig.border,
                              )}
                            >
                              <span className="mr-1">{difficultyConfig.icon}</span>
                              {problem.difficulty}
                            </Badge>
                          </div>
                        </div>

                        {/* Problem Title */}
                        <div className="mb-6">
                          <h3
                            className={cn(
                              "text-lg font-semibold leading-tight transition-all group-hover:text-blue-400",
                              isCompleted ? "line-through text-slate-500" : "text-white",
                            )}
                          >
                            {problem.title}
                          </h3>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Progress</span>
                            <Badge
                              className={cn(
                                "text-xs",
                                isCompleted
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-slate-500/20 text-slate-400 border-slate-500/30",
                              )}
                            >
                              {isCompleted ? "Completed" : "Todo"}
                            </Badge>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all duration-500",
                                isCompleted
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400 w-full"
                                  : "bg-gradient-to-r from-slate-600 to-slate-500 w-0",
                              )}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleProblemStatus(problem.id, problem.progress)
                            }}
                            className={cn(
                              "h-10 px-4 rounded-xl transition-all duration-200",
                              isCompleted
                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                                : "bg-slate-700/50 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 border border-slate-600",
                            )}
                          >
                            {isCompleted ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                              </>
                            )}
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(problem.url, "_blank")
                              }}
                              className="h-10 w-10 p-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </Card>
                  )
                })}
              </div>
            ) : (
              /* List View - Compact Premium Layout */
              <div className="space-y-3">
                {filteredData.map((problem, index) => {
                  const difficultyConfig = getDifficultyConfig(problem.difficulty)
                  const isCompleted = problem.progress === "done"
                  const isSelected = selectedRows.has(problem.id)

                  return (
                    <Card
                      key={problem.id}
                      className={cn(
                        "group relative overflow-hidden transition-all duration-200 hover:scale-[1.01] cursor-pointer",
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-500/5 via-emerald-600/5 to-transparent border-emerald-500/20 hover:from-emerald-500/10"
                          : "bg-gradient-to-r from-white/5 via-white/5 to-transparent border-white/10 hover:from-white/10 hover:border-white/20",
                        isSelected && "ring-2 ring-blue-500/50 bg-blue-500/5",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Selection */}
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRowSelection(problem.id)}
                            className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />

                          {/* Status Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProblemStatus(problem.id, problem.progress)}
                            className={cn(
                              "w-8 h-8 rounded-full p-0 transition-all duration-200",
                              isCompleted
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                                : "border-2 border-slate-600 hover:border-emerald-500 bg-transparent hover:bg-emerald-500/10",
                            )}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4 text-slate-400 group-hover:text-emerald-400" />
                            )}
                          </Button>

                          {/* Problem Info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-sm text-slate-500 font-mono shrink-0 bg-slate-800/50 px-2 py-1 rounded-md">
                              #{String(index + 1).padStart(3, "0")}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "font-medium truncate transition-all text-lg",
                                    isCompleted
                                      ? "line-through text-slate-500"
                                      : "text-white group-hover:text-blue-400",
                                  )}
                                >
                                  {problem.title}
                                </span>
                                {problem.isPremium && (
                                  <Badge className="text-xs bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30 shrink-0">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Pro
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Difficulty */}
                          <Badge
                            className={cn(
                              "text-xs font-medium shrink-0",
                              difficultyConfig.bg,
                              difficultyConfig.color,
                              difficultyConfig.border,
                            )}
                          >
                            <span className="mr-1">{difficultyConfig.icon}</span>
                            {problem.difficulty}
                          </Badge>

                          {/* Progress */}
                          <Badge
                            className={cn(
                              "text-xs shrink-0",
                              isCompleted
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-slate-500/20 text-slate-400 border-slate-500/30",
                            )}
                          >
                            {isCompleted ? "Done" : "Todo"}
                          </Badge>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(problem.url, "_blank")}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 transition-all rounded-lg"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 transition-all rounded-lg"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
