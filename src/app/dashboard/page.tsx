"use client"

import { useEffect, useState } from "react"
import { useUserData } from "@/lib/hooks/use-user-data"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Clock,
  CheckCircle,
  Flame,
  Star,
  Target,
  TrendingUp,
  ExternalLink,
  Brain,
  BookOpen,
  Play,
} from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

type Problem = {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  url: string
  isPremium: boolean
  pattern: string
  description?: string
  tags?: string[]
  acceptanceRate?: number
  frequency?: number
  timeComplexity?: string
  spaceComplexity?: string
  companies?: string[]
  approach?: string
  keyPoints?: string[]
  relatedProblems?: string[]
  solutionUrl?: string
  videoUrl?: string
}

function FrequencyStars({ frequency }: { frequency: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-400">Frequency:</span>
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < frequency ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading } = useUserData()
  const [problemsByPattern, setProblemsByPattern] = useState<{ [pattern: string]: Problem[] }>({})
  const [loadingProblems, setLoadingProblems] = useState(true)
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Load solved problems from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("solvedProblems")
    if (saved) {
      setSolvedProblems(new Set(JSON.parse(saved)))
    }
  }, [])

  // Save solved problems to localStorage
  const saveSolvedProblems = (solved: Set<string>) => {
    localStorage.setItem("solvedProblems", JSON.stringify(Array.from(solved)))
  }

  useEffect(() => {
    async function fetchProblems() {
      setLoadingProblems(true)
      try {
        const res = await fetch("/api/problems")
        const problems = await res.json()

        // Group problems by pattern
        const grouped: { [pattern: string]: Problem[] } = {}
        for (const problem of problems) {
          const pattern = problem.pattern || "Uncategorized"
          if (!grouped[pattern]) grouped[pattern] = []
          grouped[pattern].push(problem)
        }

        setProblemsByPattern(grouped)
      } catch (error) {
        console.error("Failed to fetch problems:", error)
      } finally {
        setLoadingProblems(false)
      }
    }

    fetchProblems()
  }, [])

  const toggleProblemSolved = (problemId: string) => {
    const newSolved = new Set(solvedProblems)
    if (newSolved.has(problemId)) {
      newSolved.delete(problemId)
      toast({
        title: "Problem unmarked",
        description: "Problem removed from solved list",
      })
    } else {
      newSolved.add(problemId)
      toast({
        title: "🎉 Problem solved!",
        description: "Great job! Keep up the momentum!",
      })
    }
    setSolvedProblems(newSolved)
    saveSolvedProblems(newSolved)
  }

  // Calculate stats based on solved problems
  const totalProblems = Object.values(problemsByPattern).flat().length
  const totalSolved = solvedProblems.size
  const completionRate = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0

  // Calculate difficulty breakdown
  const allProblems = Object.values(problemsByPattern).flat()
  const easyCompleted = allProblems.filter((p) => p.difficulty === "Easy" && solvedProblems.has(p.id)).length
  const mediumCompleted = allProblems.filter((p) => p.difficulty === "Medium" && solvedProblems.has(p.id)).length
  const hardCompleted = allProblems.filter((p) => p.difficulty === "Hard" && solvedProblems.has(p.id)).length

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

  // The desired pattern order
  const PATTERN_ORDER = [
    "Two Pointers",
    "Sliding Window",
    "Prefix Sums",
    "Merge Intervals",
    "Binary Search (and Variants)",
    "Sorting-Based Patterns",
    "Fast and Slow Pointers",
    "Backtracking & Recursive Search",
    "Divide and Conquer",
    "Linked List Techniques (Dummy Node, In-place Reversal)",
    "Stacks and Queues",
    "Monotonic Stack / Queue",
    "Expression Evaluation (Two Stacks)",
    "String Manipulation & Regular Expressions",
    "Hashmaps & Frequency Counting",
    "Binary Trees & BSTs (Traversal, Construction, Properties)",
    "Path Sum & Root-to-Leaf Techniques",
    "Kth Largest/Smallest Elements (Heaps / QuickSelect)",
    "Top K Frequent Elements",
    "Merge K Sorted Lists",
    "Dynamic Programming (Including Knapsack, Range DP, etc.)",
    "Greedy & Interval Partitioning",
    "Graph Traversals (BFS, DFS)",
    "Graph Algorithms (DAGs, MSTs, Shortest Paths, etc.)",
    "Design Problems (LRU Cache, Twitter, etc.)"
  ];

  if (loading.stats || loadingProblems) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="modern-card p-6 rounded-xl">
              <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
              <Skeleton className="h-8 w-16 mb-2 bg-white/10" />
              <Skeleton className="h-3 w-20 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview - Original Colors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Overall Progress */}
          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Overall Progress</CardTitle>
              <CheckCircle className="h-5 w-5 icon-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {totalSolved}/{totalProblems}
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
              <div className="text-3xl font-bold text-orange-400">{data.stats?.currentStreak || 0} days</div>
              <p className="text-sm text-gray-400 mt-2">Best: {data.stats?.longestStreak || 0} days</p>
            </CardContent>
          </Card>

          {/* Study Time */}
          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Today's Study Time</CardTitle>
              <Clock className="h-5 w-5 icon-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {((data.stats?.studyTimeToday || 0) / 60).toFixed(1)}h
              </div>
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
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {data.stats?.level || "Bronze"}
                </Badge>
                <span className="text-sm text-gray-400">{data.stats?.xp || 160} XP</span>
              </div>
              <Progress
                value={((data.stats?.xp || 160) / (data.stats?.nextLevelXp || 1000)) * 100}
                className="mt-2 h-2"
              />
              <p className="text-sm text-gray-400 mt-2">
                {(data.stats?.nextLevelXp || 1000) - (data.stats?.xp || 160)} XP to next level
              </p>
            </CardContent>
          </Card>

          {/* Difficulty Breakdown */}
          <Card className="modern-card md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 icon-purple" />
                Difficulty Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-green-400"></div>
                    <span className="text-base text-gray-300">Easy</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-base text-white font-medium">{easyCompleted}</span>
                    <Progress
                      value={
                        (easyCompleted / Math.max(allProblems.filter((p) => p.difficulty === "Easy").length, 1)) * 100
                      }
                      className="w-24 h-2"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <span className="text-base text-gray-300">Medium</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-base text-white font-medium">{mediumCompleted}</span>
                    <Progress
                      value={
                        (mediumCompleted / Math.max(allProblems.filter((p) => p.difficulty === "Medium").length, 1)) *
                        100
                      }
                      className="w-24 h-2"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-red-400"></div>
                    <span className="text-base text-gray-300">Hard</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-base text-white font-medium">{hardCompleted}</span>
                    <Progress
                      value={
                        (hardCompleted / Math.max(allProblems.filter((p) => p.difficulty === "Hard").length, 1)) * 100
                      }
                      className="w-24 h-2"
                    />
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-300">Problems Solved This Week</span>
                  <span className="text-base text-white font-medium">{totalSolved}/15</span>
                </div>
                <Progress value={(totalSolved / 15) * 100} className="h-3" />
                <div className="flex items-center space-x-2 mt-4">
                  <Star className="h-5 w-5 icon-yellow" />
                  <span className="text-sm text-gray-400">
                    {totalSolved >= 15 ? "Goal completed! 🎉" : `${15 - totalSolved} more to reach your goal`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Pattern-based Problem Groups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-6 w-6 text-purple-400" />
              Problems by Pattern
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {Object.keys(problemsByPattern).length} patterns
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-4">
              {/* Sort patterns according to PATTERN_ORDER, then append any not in the list */}
              {(() => {
                const allPatterns = Object.keys(problemsByPattern);
                const orderedPatterns = [
                  ...PATTERN_ORDER.filter((pattern) => allPatterns.includes(pattern)),
                  ...allPatterns.filter((pattern) => !PATTERN_ORDER.includes(pattern)),
                ];
                return orderedPatterns.map((pattern) => {
                  const problems = problemsByPattern[pattern];
                  const solvedInPattern = problems.filter((p) => solvedProblems.has(p.id)).length;
                  const totalInPattern = problems.length;
                  const progressPercentage = (solvedInPattern / totalInPattern) * 100;
                  return (
                    <AccordionItem
                      key={pattern}
                      value={pattern}
                      className="border border-white/10 rounded-lg modern-card"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center gap-3">
                            <Target className="h-5 w-5 text-blue-400" />
                            <span className="text-white font-medium">{pattern}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {solvedInPattern}/{totalInPattern}
                            </Badge>
                            <span className="text-sm text-gray-400">{progressPercentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-3">
                          {problems.map((problem, index) => (
                            <div
                              key={problem.id}
                              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                              {/* Main Problem Row */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={solvedProblems.has(problem.id)}
                                    onCheckedChange={() => toggleProblemSolved(problem.id)}
                                    className="border-white/30"
                                  />
                                  <span className="text-sm text-gray-400 font-mono">#{index + 1}</span>
                                  <span
                                    className={`text-white font-medium ${solvedProblems.has(problem.id) ? "line-through text-gray-500" : ""}`}
                                  >
                                    {problem.title}
                                  </span>
                                  {problem.isPremium && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                                    {problem.difficulty}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(problem.url, "_blank")}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                    title="Open problem"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Problem Details */}
                              <div className="ml-8 space-y-3 text-sm">
                                {/* Description */}
                                {problem.description && (
                                  <div>
                                    <span className="text-gray-400 font-medium">Description: </span>
                                    <span className="text-gray-300">{problem.description}</span>
                                  </div>
                                )}

                                {/* Tags */}
                                {problem.tags && problem.tags.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-gray-400 font-medium">Tags: </span>
                                    {problem.tags.map((tag: string) => (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Stats Row */}
                                <div className="flex items-center gap-6 text-xs">
                                  {problem.acceptanceRate && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400">Acceptance:</span>
                                      <span
                                        className={`font-medium ${
                                          problem.acceptanceRate > 50
                                            ? "text-green-400"
                                            : problem.acceptanceRate > 30
                                              ? "text-yellow-400"
                                              : "text-red-400"
                                        }`}
                                      >
                                        {problem.acceptanceRate}%
                                      </span>
                                    </div>
                                  )}

                                  {typeof problem.frequency === "number" && (
                                    <FrequencyStars frequency={problem.frequency} />
                                  )}

                                  {problem.timeComplexity && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400">Time:</span>
                                      <span className="text-purple-400 font-mono">{problem.timeComplexity}</span>
                                    </div>
                                  )}

                                  {problem.spaceComplexity && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400">Space:</span>
                                      <span className="text-purple-400 font-mono">{problem.spaceComplexity}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Companies */}
                                {problem.companies && problem.companies.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-gray-400 font-medium">Companies: </span>
                                    {problem.companies.slice(0, 5).map((company: string) => (
                                      <Badge
                                        key={company}
                                        variant="outline"
                                        className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"
                                      >
                                        {company}
                                      </Badge>
                                    ))}
                                    {problem.companies.length > 5 && (
                                      <span className="text-gray-500 text-xs">+{problem.companies.length - 5} more</span>
                                    )}
                                  </div>
                                )}

                                {/* Solution Approach Hint */}
                                {problem.approach && (
                                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Brain className="h-4 w-4 text-blue-400" />
                                      <span className="text-blue-400 font-medium text-xs">Approach Hint</span>
                                    </div>
                                    <p className="text-gray-300 text-xs leading-relaxed">{problem.approach}</p>
                                  </div>
                                )}

                                {/* Key Points */}
                                {problem.keyPoints && problem.keyPoints.length > 0 && (
                                  <div>
                                    <span className="text-gray-400 font-medium">Key Points: </span>
                                    <ul className="list-disc list-inside text-gray-300 space-y-1 mt-1">
                                      {problem.keyPoints.map((point: string, idx: number) => (
                                        <li key={idx} className="text-xs">
                                          {point}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Related Problems */}
                                {problem.relatedProblems && problem.relatedProblems.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-gray-400 font-medium">Related: </span>
                                    {problem.relatedProblems.slice(0, 3).map((related: string) => (
                                      <Badge
                                        key={related}
                                        variant="outline"
                                        className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs"
                                      >
                                        {related}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Personal Notes Section */}
                                <div className="bg-gray-800/50 border border-white/10 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="h-4 w-4 text-orange-400" />
                                    <span className="text-orange-400 font-medium text-xs">Personal Notes</span>
                                  </div>
                                  <textarea
                                    placeholder="Add your notes, solution approach, or key insights..."
                                    className="w-full bg-transparent text-gray-300 text-xs placeholder-gray-500 border-none outline-none resize-none"
                                    rows={2}
                                    defaultValue={localStorage.getItem(`notes-${problem.id}`) || ""}
                                    onChange={(e) => localStorage.setItem(`notes-${problem.id}`, e.target.value)}
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(problem.url, "_blank")}
                                    className="bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 text-xs h-7"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Solve
                                  </Button>

                                  {problem.solutionUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(problem.solutionUrl, "_blank")}
                                      className="bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 text-xs h-7"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Solution
                                    </Button>
                                  )}

                                  {problem.videoUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(problem.videoUrl, "_blank")}
                                      className="bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 text-xs h-7"
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      Video
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                });
              })().map((item) => item)}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
