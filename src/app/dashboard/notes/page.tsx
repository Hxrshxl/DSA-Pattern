import NotesClient from "@/components/dashboard/notes-client"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function NotesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return <NotesClient />
}
