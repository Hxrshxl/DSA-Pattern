"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, ChevronDown, ExternalLink, Star, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Problem {
  id: string
  title: string
  url: string
  isPremium: boolean
  acceptanceRate: number
  difficulty: "Easy" | "Medium" | "Hard"
  frequency: number
  topics: string[]
  pattern: string | null
  questionNo: number
  progress?: Array<{
    solved: boolean
    solvedAt: Date | null
    timeSpent: number
    attempts: number
  }>
  solved: boolean
  solvedAt?: string
}

interface ProblemsListProps {
  initialProgress: Record<string, boolean>
}

const PATTERN_ORDER = [
  "Two Pointers",
  "Sliding Window",
  "Prefix Sums",
  "Merge Intervals",
  "Sorting-Based Patterns",
  "Greedy & Interval Partitioning",
  "String Manipulation & Regular Expressions",
  "Hashmaps & Frequency Counting",
  "Binary Search (and Variants)",
  "Kth Largest/Smallest Elements (Heaps / QuickSelect)",
  "Backtracking & Recursive Search",
  "Divide and Conquer",
  "Fast and Slow Pointers",
  "Linked List Techniques (Dummy Node, In-place Reversal)",
  "Stacks and Queues",
  "Monotonic Stack / Queue",
  "Expression Evaluation (Two Stacks)",
  "Binary Trees & BSTs (Traversal, Construction, Properties)",
  "Path Sum & Root-to-Leaf Techniques",
  "Top K Frequent Elements",
  "Merge K Sorted Lists",
  "Dynamic Programming (Including Knapsack, Range DP, etc.)",
  "Graph Traversals (BFS, DFS)",
  "Graph Algorithms (DAGs, MSTs, Shortest Paths, etc.)",
  "Design Problems (LRU Cache, Twitter, etc.)"
]

const PATTERN_NAME_MAP: Record<string, string> = {
  "Two Pointers": "Two Pointers",
  "Sliding Window": "Sliding Window",
  "Prefix sum": "Prefix Sums",
  "Merge Intervals": "Merge Intervals",
  "Sorting Based patterns": "Sorting-Based Patterns",
  "Greedy & Interval Partitioning": "Greedy & Interval Partitioning",
  "String Manipulation & Regular Expressions": "String Manipulation & Regular Expressions",
  "Hashmaps & Frequency counting": "Hashmaps & Frequency Counting",
  "kth largest and smallest elements (heaps and quickselect)": "Kth Largest/Smallest Elements (Heaps / QuickSelect)",
  "Backtracking & Recursive search": "Backtracking & Recursive Search",
  "Divide and Conquer": "Divide and Conquer",
  "Fast and Slow pointers": "Fast and Slow Pointers",
  "Linked list techniques (dummy node,in-place_reversal)": "Linked List Techniques (Dummy Node, In-place Reversal)",
  "Stacks and Queues": "Stacks and Queues",
  "Monotonic Stack and Queue": "Monotonic Stack / Queue",
  "Expression evaluation(two stacks)": "Expression Evaluation (Two Stacks)",
  "Binary trees & Bsts(traversal,construction,properties)": "Binary Trees & BSTs (Traversal, Construction, Properties)",
  "Path sum & Root-to-leaf techniques": "Path Sum & Root-to-Leaf Techniques",
  "Top k Frequent Elements": "Top K Frequent Elements",
  "Merge k Sorted Lists": "Merge K Sorted Lists",
  "Dynamic Programming": "Dynamic Programming (Including Knapsack, Range DP, etc.)",
  "Graph traversals (bfs,dfs)": "Graph Traversals (BFS, DFS)",
  "Graph algorithms (dags, msts,shortest paths, etc.)": "Graph Algorithms (DAGs, MSTs, Shortest Paths, etc.)",
  "Design Problems (lru cache,twitter,etc.)": "Design Problems (LRU Cache, Twitter, etc.)"
}

export default function ProblemsList({ initialProgress }: ProblemsListProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [patternFilter, setPatternFilter] = useState("All")
  const [progress, setProgress] = useState(initialProgress)
  const { toast } = useToast()

  // Load problems data
  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true)
        console.log("ProblemsList: Loading problems with filters:", {
          searchTerm,
          difficultyFilter,
          statusFilter,
          patternFilter,
        })

        const searchParams = new URLSearchParams({
          search: searchTerm,
          difficulty: difficultyFilter === "All" ? "" : difficultyFilter,
          status: statusFilter === "All" ? "" : statusFilter,
          pattern: patternFilter === "All" ? "" : patternFilter,
        })

        console.log("ProblemsList: Fetching from /api/problems with params:", searchParams.toString())

        const response = await fetch(`/api/problems?${searchParams}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("ProblemsList: API error:", response.status, errorData)
          throw new Error(`API Error: ${response.status} - ${errorData.error || "Unknown error"}`)
        }

        const data = await response.json()
        console.log("ProblemsList: Received data:", data.length, "problems")

        const problemsData = data.map((problem: any) => ({
          id: problem.id,
          title: problem.title,
          url: problem.url,
          isPremium: problem.isPremium || problem.is_premium,
          acceptanceRate: problem.acceptanceRate || problem.acceptance_rate,
          difficulty: problem.difficulty,
          frequency: problem.frequency,
          topics: problem.topics || [],
          pattern: problem.pattern,
          questionNo: problem.questionNo || problem.question_no,
          solved: problem.progress?.[0]?.solved || problem.solved || false,
          solvedAt: problem.progress?.[0]?.solvedAt,
          timeSpent: problem.progress?.[0]?.timeSpent || 0,
        }))

        console.log("ProblemsList: Processed problems:", problemsData.length)
        setProblems(problemsData)
      } catch (error) {
        console.error("ProblemsList: Error loading problems:", error)
        toast({
          title: "Error Loading Problems",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load problems data. Please check the console and try refreshing.",
          variant: "destructive",
        })
        // Set empty array so UI doesn't break
        setProblems([])
      } finally {
        setLoading(false)
      }
    }

    loadProblems()
  }, [searchTerm, difficultyFilter, statusFilter, patternFilter, toast])

  // Filter and group problems
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.topics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDifficulty = difficultyFilter === "All" || problem.difficulty === difficultyFilter
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Solved" && problem.solved) ||
        (statusFilter === "Unsolved" && !problem.solved)
      const matchesPattern = patternFilter === "All" || problem.pattern === patternFilter

      return matchesSearch && matchesDifficulty && matchesStatus && matchesPattern
    })
  }, [problems, searchTerm, difficultyFilter, statusFilter, patternFilter])

  const groupedProblems = useMemo(() => {
    const groups: Record<string, Problem[]> = {}
    filteredProblems.forEach((problem) => {
      const canonicalPattern = PATTERN_NAME_MAP[problem.pattern || ""] || "Other"
      if (!groups[canonicalPattern]) groups[canonicalPattern] = []
      groups[canonicalPattern].push(problem)
    })
    return groups
  }, [filteredProblems])

  const patterns = useMemo(() => {
    return Array.from(new Set(problems.map((p) => p.pattern).filter(Boolean))).sort()
  }, [problems])

  const toggleProblemStatus = async (problemId: string, solved: boolean) => {
    try {
      // Optimistic update
      setProgress((prev) => ({ ...prev, [problemId]: solved }))
      setProblems((prev) =>
        prev.map((p) =>
          p.id === problemId ? { ...p, solved, solvedAt: solved ? new Date().toISOString() : undefined } : p,
        ),
      )

      // API call
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, solved }),
      })

      if (!response.ok) {
        throw new Error("Failed to update progress")
      }

      toast({
        title: solved ? "Problem Solved! 🎉" : "Progress Updated",
        description: solved ? "Great job! Keep up the momentum." : "Problem marked as unsolved.",
      })
    } catch (error) {
      // Revert optimistic update
      setProgress((prev) => ({ ...prev, [problemId]: !solved }))
      setProblems((prev) => prev.map((p) => (p.id === problemId ? { ...p, solved: !solved } : p)))

      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 border-green-400/30"
      case "Medium":
        return "text-yellow-400 border-yellow-400/30"
      case "Hard":
        return "text-red-400 border-red-400/30"
      default:
        return "text-gray-400 border-gray-400/30"
    }
  }

  if (loading) {
    return (
      <Card className="glassmorphism border-white/10">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glassmorphism border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Problems Library</CardTitle>
          <CardDescription className="text-gray-400">
            Practice problems organized by algorithmic patterns ({patterns.length} patterns available)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Solved">Solved</SelectItem>
                <SelectItem value="Unsolved">Unsolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={patternFilter} onValueChange={setPatternFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Patterns</SelectItem>
                {patterns.filter((pattern): pattern is string => !!pattern).map((pattern) => (
                  <SelectItem key={pattern} value={pattern}>
                    {pattern}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Problems by Pattern */}
      <div className="space-y-4">
        {PATTERN_ORDER.map(pattern => {
          const patternProblems = groupedProblems[pattern] || []
          const solvedCount = patternProblems.filter((p) => p.solved).length
          const totalCount = patternProblems.length
          const completionRate = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0

          return (
            <Collapsible key={pattern} defaultOpen={false}>
              <Card className="glassmorphism border-white/10">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-data-[state=closed]:rotate-[-90deg]" />
                        <div>
                          <CardTitle className="text-white text-lg">{pattern}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {solvedCount}/{totalCount} problems solved ({completionRate.toFixed(0)}%)
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {totalCount} problems
                        </Badge>
                        {completionRate === 100 && totalCount > 0 && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ Complete</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {patternProblems.length === 0 ? (
                        <div className="text-gray-400 text-center py-4">No problems yet for this pattern.</div>
                      ) : (
                        patternProblems.map((problem, problemIndex) => {
                          // Create truly unique key using pattern, problem ID, and index
                          const uniqueKey = `pattern-${pattern.replace(/\s+/g, "-")}-problem-${problem.id}-index-${problemIndex}`

                          return (
                            <div
                              key={uniqueKey}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-lg border transition-colors",
                                "bg-white/5 border-white/10 hover:bg-white/10",
                                problem.solved && "opacity-75",
                              )}
                            >
                              <div className="flex items-center space-x-4 flex-1">
                                <Checkbox
                                  checked={problem.solved}
                                  onCheckedChange={(checked) => toggleProblemStatus(problem.id, checked as boolean)}
                                  className="border-white/30"
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3
                                      className={cn("font-medium text-white truncate", problem.solved && "line-through")}
                                    >
                                      {problem.title}
                                    </h3>
                                    {problem.isPremium && (
                                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                        Premium
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs", getDifficultyColor(problem.difficulty))}
                                    >
                                      {problem.difficulty}
                                    </Badge>
                                    <span>#{problem.questionNo}</span>
                                    <span>{(problem.acceptanceRate * 100).toFixed(1)}% acceptance</span>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3" />
                                      <span>{(problem.frequency * 100).toFixed(1)}%</span>
                                    </div>
                                  </div>

                                  {/* Show topics */}
                                  {problem.topics.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {problem.topics.slice(0, 3).map((topic, topicIndex) => (
                                        <Badge
                                          key={`${uniqueKey}-topic-${topicIndex}`}
                                          variant="outline"
                                          className="text-xs text-gray-400 border-gray-600"
                                        >
                                          {topic}
                                        </Badge>
                                      ))}
                                      {problem.topics.length > 3 && (
                                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                                          +{problem.topics.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white"
                                  onClick={() => window.open(problem.url, "_blank")}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <BookOpen className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      {/* Show message if no problems found */}
      {Object.keys(groupedProblems).length === 0 && !loading && (
        <Card className="glassmorphism border-white/10">
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Problems Found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search terms to find problems.</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setDifficultyFilter("All")
                setStatusFilter("All")
                setPatternFilter("All")
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
