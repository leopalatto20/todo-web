import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface TodoCardSkeletonProps {
  count?: number
}

export function TodoCardSkeleton({ count = 5 }: TodoCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="mt-1 h-4 w-4 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  )
}
