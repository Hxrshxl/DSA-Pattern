"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, Trash2, ChevronLeft, ChevronRight, Check, Clock, Crown } from "lucide-react"
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

export function ProblemsListTable() {
  const [data, setData] = useState<ProblemWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [progressFilter, setProgressFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const itemsPerPage = 10

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
      setData(
        result.map((problem: Problem) => ({
          ...problem,
          progress: "todo",
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
      if (searchTerm === "") return true
      return item.title.toLowerCase().includes(searchTerm.toLowerCase())
    })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const deleteProblem = async (id: string) => {
    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "✅ Success",
        description: "Problem deleted successfully.",
      })
      loadProblems()
    } catch (error) {
      console.error("Failed to delete problem:", error)
      toast({
        title: "❌ Error",
        description: "Failed to delete problem. Please try again.",
      })
    }
  }

  const toggleProblemStatus = async (id: string, currentProgress: string) => {
    const newProgress = currentProgress === "todo" ? "done" : "todo"

    setData((prev) =>
      prev.map((problem) => (problem.id === id ? { ...problem, progress: newProgress as "todo" | "done" } : problem)),
    )

    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress: newProgress }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "✅ Success",
        description: `Problem marked as ${newProgress === "done" ? "completed" : "todo"}!`,
      })
    } catch (error) {
      setData((prev) =>
        prev.map((problem) =>
          problem.id === id ? { ...problem, progress: currentProgress as "todo" | "done" } : problem,
        ),
      )

      console.error("Failed to update progress:", error)
      toast({
        title: "❌ Error",
        description: "Failed to update progress. Please try again.",
      })
    }
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
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((item) => item.id)))
    }
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Problems</CardTitle>
          <CardDescription>Loading problems...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Problems
              <Badge variant="outline" className="ml-2">
                {completedCount}/{totalCount} completed
              </Badge>
            </CardTitle>
            <CardDescription>Track your coding problem progress • {filteredData.length} problems shown</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((completedCount / totalCount) * 100) || 0}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
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
        </div>

        {/* Table Structure */}
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <Checkbox
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={toggleAllSelection}
                    aria-label="Select all"
                  />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Problem</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Difficulty</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Progress</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-24 text-center">
                    <div className="text-muted-foreground">No problems found</div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((problem) => (
                  <tr
                    key={problem.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      problem.progress === "done" && "bg-green-50/50",
                      selectedRows.has(problem.id) && "bg-blue-50",
                    )}
                  >
                    <td className="p-4 align-middle">
                      <Checkbox
                        checked={selectedRows.has(problem.id)}
                        onCheckedChange={() => toggleRowSelection(problem.id)}
                        aria-label="Select row"
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-8 h-8 rounded-full p-0 transition-all",
                          problem.progress === "done"
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "border-2 border-gray-300 hover:border-green-500",
                        )}
                        onClick={() => toggleProblemStatus(problem.id, problem.progress)}
                      >
                        {problem.progress === "done" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium",
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
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline" className={cn("text-xs", getDifficultyColor(problem.difficulty))}>
                        {problem.difficulty}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={problem.progress === "done" ? "default" : "secondary"} className="text-xs">
                        {problem.progress === "done" ? "Completed" : "Todo"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(problem.url, "_blank")}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProblem(problem.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bulk Actions */}
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-900">
              {selectedRows.size} problem{selectedRows.size > 1 ? "s" : ""} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedRows(new Set())}>
              Clear selection
            </Button>
          </div>
        )}

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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
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
  )
}
