"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Target, Plus, Edit, Trash2, Calendar, Clock, Trophy, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Goal {
  id: string
  title: string
  description: string | null
  type: "daily" | "weekly" | "monthly"
  target: number
  current: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface GoalsManagerProps {
  initialGoals: Goal[]
}

export default function GoalsManager({ initialGoals }: GoalsManagerProps) {
  const [goals, setGoals] = useState<Goal[]>(Array.isArray(initialGoals) ? initialGoals : [])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    type: "daily" as const,
    target: 3,
  })

  const { toast } = useToast()

  const createGoal = async () => {
    try {
      const goal: Goal = {
        id: Date.now().toString(),
        ...newGoal,
        current: 0,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Goal

      setGoals((prev) => [...prev, goal])
      setIsCreateDialogOpen(false)
      setNewGoal({ title: "", description: "", type: "daily", target: 3 })

      toast({
        title: "Goal Created! 🎯",
        description: "Your new goal has been set. Time to crush it!",
      })
    } catch (error) {
      // Remove the variant property - use a different approach for error styling
      toast({
        title: "❌ Error",
        description: "Failed to create goal. Please try again.",
      })
    }
  }

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)))
      toast({
        title: "Goal Updated",
        description: "Your goal has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update goal. Please try again.",
      })
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
      toast({
        title: "Goal Deleted",
        description: "Goal has been removed from your list.",
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete goal. Please try again.",
      })
    }
  }

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <Calendar className="h-4 w-4" />
      case "weekly":
        return <Clock className="h-4 w-4" />
      case "monthly":
        return <Trophy className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getGoalColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "weekly":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "monthly":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-yellow-500"
    if (percentage >= 50) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Goals & Targets</h1>
          <p className="text-gray-400 mt-2">Set and track your learning objectives to stay motivated</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="glassmorphism border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Goal</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set a new learning target to keep yourself motivated
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">
                  Goal Title
                </Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Daily Problem Solving"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your goal..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-white">
                    Goal Type
                  </Label>
                  <Select
                    value={newGoal.type}
                    onValueChange={(value: any) => setNewGoal((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target" className="text-white">
                    Target
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, target: Number.parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createGoal} disabled={!newGoal.title}>
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Goals */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals
          .filter((goal) => goal.active)
          .map((goal) => {
            const progressPercentage = (goal.current / goal.target) * 100
            const isCompleted = progressPercentage >= 100
            const isAtRisk = progressPercentage < 50 && goal.type === "daily"

            return (
              <Card key={goal.id} className="glassmorphism border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getGoalColor(goal.type)}>
                      {getGoalIcon(goal.type)}
                      <span className="ml-1 capitalize">{goal.type}</span>
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                      {isAtRisk && <AlertCircle className="h-4 w-4 text-red-400" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGoal(goal)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-white">{goal.title}</CardTitle>
                  <CardDescription className="text-gray-400">{goal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white font-medium">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{progressPercentage.toFixed(0)}% complete</span>
                      {isCompleted && <span className="text-green-400 font-medium">🎉 Completed!</span>}
                      {isAtRisk && <span className="text-red-400 font-medium">⚠️ Behind target</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Completed Goals */}
      {goals.some((goal) => !goal.active || goal.current / goal.target >= 1) && (
        <Card className="glassmorphism border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
              Completed Goals
            </CardTitle>
            <CardDescription className="text-gray-400">Celebrate your achievements!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {goals
                .filter((goal) => !goal.active || goal.current / goal.target >= 1)
                .map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <div>
                        <h4 className="font-medium text-white">{goal.title}</h4>
                        <p className="text-sm text-gray-400">
                          {goal.current}/{goal.target} completed
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ Done</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="glassmorphism border-white/10">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Goals Set</h3>
            <p className="text-gray-400 mb-6">
              Create your first goal to start tracking your progress and stay motivated.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
