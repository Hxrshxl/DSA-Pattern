"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { motion } from "framer-motion"

export default function SettingsClient() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Customize your learning experience and preferences</p>
        </div>

        <Card className="glassmorphism border-white/10">
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Settings Panel Coming Soon</h3>
            <p className="text-gray-400 mb-6">
              We're building a comprehensive settings panel to customize your dashboard experience.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
