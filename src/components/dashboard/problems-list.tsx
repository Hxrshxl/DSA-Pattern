"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, ChevronLeft, ChevronRight, Check, Clock, Crown, Search } from "lucide-react"
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

export function ProblemsList() {
  const [data, setData] = useState<ProblemWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [progressFilter, setProgressFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const itemsPerPage =358

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
        title: "❌ Error Loading Problems",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load problems data. Please check the console and try refreshing.",
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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const toggleProblemStatus = (id: string, currentProgress: string) => {
    const newProgress = currentProgress === "todo" ? "done" : "todo"

    // Update local state
    setData((prev) =>
      prev.map((problem) => (problem.id === id ? { ...problem, progress: newProgress as "todo" | "done" } : problem)),
    )

    // Update localStorage
    const savedProgress = loadProgressFromStorage()
    savedProgress[id] = {
      progress: newProgress,
      completedAt: newProgress === "done" ? new Date().toISOString() : undefined,
    }
    saveProgressToStorage(savedProgress)

    toast({
      title: "✅ Success",
      description: `Problem marked as ${newProgress === "done" ? "completed" : "todo"}!`,
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

  const toggleAllSelection = () => {
    if (selectedRows.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((item) => item.id)))
    }
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
      title: "✅ Success",
      description: `${selectedRows.size} problems marked as completed!`,
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const completedCount = data.filter((p) => p.progress === "done").length
  const totalCount = data.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Problems...</CardTitle>
          <CardDescription>Please wait while we fetch your coding problems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Total Problems</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{progressPercentage}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Problems Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Coding Problems
                <Badge variant="outline">{filteredData.length} shown</Badge>
              </CardTitle>
              <CardDescription>
                Track your progress through {totalCount} coding problems • {completedCount} completed so far
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={progressFilter} onValueChange={setProgressFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Problems</SelectItem>
                <SelectItem value="todo">Todo ({data.filter((p) => p.progress === "todo").length})</SelectItem>
                <SelectItem value="done">Completed ({completedCount})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-900">
                {selectedRows.size} problem{selectedRows.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={bulkMarkComplete}>
                  Mark as Complete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedRows(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Problems List */}
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg font-medium text-sm">
              <div className="w-8">
                <Checkbox
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onCheckedChange={toggleAllSelection}
                  aria-label="Select all"
                />
              </div>
              <div className="w-8">Status</div>
              <div className="flex-1">Problem</div>
              <div className="w-20">Difficulty</div>
              <div className="w-24">Progress</div>
              <div className="w-20">Actions</div>
            </div>

            {paginatedData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-2">No problems found</div>
                <div className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "No problems match the current filter"}
                </div>
              </div>
            ) : (
              paginatedData.map((problem, index) => (
                <div
                  key={problem.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all hover:shadow-sm",
                    problem.progress === "done" ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50",
                    selectedRows.has(problem.id) && "ring-2 ring-blue-500",
                  )}
                >
                  {/* Selection */}
                  <div className="w-8">
                    <Checkbox
                      checked={selectedRows.has(problem.id)}
                      onCheckedChange={() => toggleRowSelection(problem.id)}
                      aria-label="Select problem"
                    />
                  </div>

                  {/* Status */}
                  <div className="w-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-6 h-6 rounded-full p-0 transition-all",
                        problem.progress === "done"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "border-2 border-gray-300 hover:border-green-500",
                      )}
                      onClick={() => toggleProblemStatus(problem.id, problem.progress)}
                    >
                      {problem.progress === "done" ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </div>

                  {/* Problem Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-mono">#{startIndex + index + 1}</span>
                      <span
                        className={cn(
                          "font-medium truncate",
                          problem.progress === "done" && "line-through text-muted-foreground",
                        )}
                      >
                        {problem.title}
                      </span>
                      {problem.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="w-20">
                    <Badge variant="outline" className={cn("text-xs", getDifficultyColor(problem.difficulty))}>
                      {problem.difficulty}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="w-24">
                    <Badge variant={problem.progress === "done" ? "default" : "secondary"} className="text-xs">
                      {problem.progress === "done" ? "Completed" : "Todo"}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="w-20 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(problem.url, "_blank")}
                      className="h-6 w-6 p-0"
                      title="Open problem"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 7) {
                      pageNum = i + 1
                    } else {
                      if (currentPage <= 4) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i
                      } else {
                        pageNum = currentPage - 3 + i
                      }
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
