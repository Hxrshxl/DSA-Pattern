import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white neon-glow",
              card: "modern-card border-white/10 bg-black",
              headerTitle: "text-white text-2xl",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: "modern-card border-white/10 text-white hover:bg-white/10",
              formFieldLabel: "text-white",
              formFieldInput: "bg-white/5 border-white/10 text-white",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            },
          }}
        />
      </div>
    </div>
  )
}
