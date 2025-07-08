"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { Problem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, Trash2 } from "lucide-react"

interface DataTableProps {
  columns?: ColumnDef<Problem>[]
  initialProgress?: Record<string, boolean>
}

export function ProblemsList({ columns = [], initialProgress = {} }: DataTableProps) {
  const [data, setData] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [progressFilter, setProgressFilter] = useState<string | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")

  // Define default columns if none provided
  const defaultColumns: ColumnDef<Problem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Problem",
      cell: ({ row }) => {
        const problem = row.original
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{problem.title}</span>
            {problem.isPremium && (
              <Badge variant="secondary" className="text-xs">
                Premium
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as string
        const colorMap = {
          Easy: "text-green-600",
          Medium: "text-yellow-600",
          Hard: "text-red-600",
        }
        return (
          <Badge variant="outline" className={colorMap[difficulty as keyof typeof colorMap]}>
            {difficulty}
          </Badge>
        )
      },
    },
    {
      accessorKey: "progress",
      header: "Status",
      cell: ({ row }) => {
        const progress = row.getValue("progress") as string
        return (
          <Badge variant={progress === "done" ? "default" : "secondary"}>
            {progress === "done" ? "Completed" : "Todo"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const problem = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => window.open(problem.url, "_blank")}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteProblem(problem.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const actualColumns = columns.length > 0 ? columns : defaultColumns

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
      setData(result)
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

  const table = useReactTable({
    data: data
      .filter((item) => {
        if (progressFilter === undefined || progressFilter === "all") {
          return true
        }
        return item.progress === progressFilter
      })
      .filter((item) => {
        if (searchTerm === "") {
          return true
        }
        return item.title.toLowerCase().includes(searchTerm.toLowerCase())
      }),
    columns: actualColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

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

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          type="text"
          placeholder="Search problems..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm mr-2"
        />
        <Select onValueChange={setProgressFilter} defaultValue={progressFilter}>
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

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full table-auto">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} className="px-4 py-2 text-left">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={actualColumns.length} className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={actualColumns.length} className="p-4 text-center italic">
                    No problems found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-2 px-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} of {data.length} row(s)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
