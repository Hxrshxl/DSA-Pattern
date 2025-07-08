"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"

export default function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user with database
      fetch("/api/user/sync", {
        method: "POST",
      }).catch((error) => {
        console.error("Failed to sync user:", error)
      })
    }
  }, [isLoaded, user])

  return null
}
