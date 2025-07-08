"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Problem } from "@prisma/client"

type ProblemWithProgress = Problem & { progress: "todo" | "done" }

export function ProblemsList() {
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
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      // Add a local progress property if not present
      setData(
        result.map((problem: Problem) => ({
          ...problem,
          progress: "todo", // or load from localStorage or another source if needed
        }))
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
        }
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
        description: "Progress updated successfully.",
      })
      loadProblems()
    } catch (error) {
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
        return "text-green-600 border-green-600"
      case "Medium":
        return "text-yellow-600 border-yellow-600"
      case "Hard":
        return "text-red-600 border-red-600"
      default:
        return "text-gray-600 border-gray-600"
    }
  }

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
        <CardTitle>Problems ({filteredData.length})</CardTitle>
        <CardDescription>Manage and track your coding problems</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center space-x-4">
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
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">
                    <Checkbox
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={toggleAllSelection}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Problem</th>
                  <th className="px-4 py-2 text-left">Difficulty</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No problems found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((problem) => (
                    <tr key={problem.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={selectedRows.has(problem.id)}
                          onCheckedChange={() => toggleRowSelection(problem.id)}
                          aria-label="Select row"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{problem.title}</span>
                          {problem.isPremium && (
                            <Badge variant="secondary" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={problem.progress === "done" ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleProblemStatus(problem.id, problem.progress)}
                        >
                          {problem.progress === "done" ? "Completed" : "Todo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => window.open(problem.url, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteProblem(problem.id)}>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
