"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import GoalsManager from "@/components/dashboard/goals-manager";
import { useUserData } from "@/lib/hooks/use-user-data";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Define the expected props
interface GoalsClientProps {
  userId: string;
}

// 2. Add loading skeleton UI
function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-white/10" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
        <Skeleton className="h-10 w-24 bg-white/10" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="modern-card p-6 rounded-xl">
            <Skeleton className="h-6 w-32 mb-4 bg-white/10" />
            <Skeleton className="h-4 w-full mb-2 bg-white/5" />
            <Skeleton className="h-2 w-full mb-4 bg-white/5" />
            <Skeleton className="h-4 w-24 bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Component definition with prop usage
export default function GoalsClient({ userId }: GoalsClientProps) {
  const { data, loading, fetchGoals } = useUserData();

  useEffect(() => {
    if (data.goals.length === 0) {
      fetchGoals();
    }
  }, [data.goals.length, fetchGoals]);

  if (loading.goals && data.goals.length === 0) {
    return <GoalsSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GoalsManager initialGoals={data.goals} />
    </motion.div>
  );
}
