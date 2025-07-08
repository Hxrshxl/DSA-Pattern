"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { motion } from "framer-motion"

export default function NotesClient() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Notes & Solutions</h1>
          <p className="text-gray-400 mt-2">Keep track of your problem-solving insights and notes</p>
        </div>

        <Card className="glassmorphism border-white/10">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Notes Feature Coming Soon</h3>
            <p className="text-gray-400 mb-6">
              We're working on a comprehensive note-taking system for your problem-solving journey.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
