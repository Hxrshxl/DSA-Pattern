"use client"

export default function DashboardFallback() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Loading your dashboard...</h2>
        <p className="text-gray-400 mb-4">Setting up your profile and loading problems data.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
