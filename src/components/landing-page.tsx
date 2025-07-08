import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SignInButton } from "@clerk/nextjs"
import { Brain, Target, Trophy, Clock, BarChart3, BookOpen, Zap, Sparkles, Rocket, Star } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Brain className="h-10 w-10 icon-purple" />
            <span className="text-3xl font-bold text-white">CodePatterns</span>
          </div>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="modern-card text-white border-white/20 hover:bg-white/10 neon-glow bg-transparent"
            >
              Sign In
            </Button>
          </SignInButton>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Sparkles className="h-4 w-4 mr-2 icon-yellow" />
            Hey..Hey..Heyyy!!!
          </Badge>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
            Master DSA with
            <span className="gradient-text block mt-2">Smart Practice</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Practice 1000+ LeetCode problems organized by patterns. Track progress, build streaks, and level up your
            coding skills with gamified learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton mode="modal">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg neon-glow">
                <Rocket className="h-5 w-5 mr-2 icon-yellow" />
                Start Learning Free
              </Button>
            </SignInButton>
    {/* hello */}
            <Button
              size="lg"
              variant="outline"
              className="modern-card text-white border-white/20 hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
            >
              <Star className="h-5 w-5 mr-2 icon-yellow" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Everything You Need to Excel</h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Comprehensive tools and gamification features to make your DSA journey engaging and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="modern-card">
              <CardHeader>
                <Target className="h-12 w-12 icon-blue mb-4" />
                <CardTitle className="text-white text-xl">Pattern-Based Learning</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  1000+ problems organized by 25+ algorithmic patterns for structured learning.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <Trophy className="h-12 w-12 icon-yellow mb-4" />
                <CardTitle className="text-white text-xl">Gamified Progress</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Earn XP, build streaks, unlock achievements, and level up your skills.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <Clock className="h-12 w-12 icon-green mb-4" />
                <CardTitle className="text-white text-xl">Smart Scheduling</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Spaced repetition system to review problems at optimal intervals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <BarChart3 className="h-12 w-12 icon-purple mb-4" />
                <CardTitle className="text-white text-xl">Advanced Analytics</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Detailed insights into your progress, strengths, and areas for improvement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <BookOpen className="h-12 w-12 icon-orange mb-4" />
                <CardTitle className="text-white text-xl">Smart Notes</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Take organized notes with categories for mistakes, insights, and solutions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <Zap className="h-12 w-12 icon-red mb-4" />
                <CardTitle className="text-white text-xl">Goal Setting</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Set daily/weekly goals and track your consistency with visual progress.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="modern-card gradient-border">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold icon-blue mb-2">1000+</div>
                  <div className="text-gray-300 text-lg">LeetCode Problems</div>
                </div>
                <div>
                  <div className="text-5xl font-bold icon-green mb-2">25+</div>
                  <div className="text-gray-300 text-lg">Algorithm Patterns</div>
                </div>
                <div>
                  <div className="text-5xl font-bold icon-purple mb-2">10K+</div>
                  <div className="text-gray-300 text-lg">Problems Solved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Level Up Your Coding Skills?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who are mastering DSA with our gamified platform.
          </p>
          <SignInButton mode="modal">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl neon-glow"
            >
              <Rocket className="h-6 w-6 mr-3 icon-yellow" />
              Start Your Journey
            </Button>
          </SignInButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 DSA Patterns Practice Dashboard. Built by Harshal Bhagat</p>
        </div>
      </footer>
    </div>
  )
}
