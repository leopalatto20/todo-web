import { Badge } from "@/components/ui/badge"
import { priorityColor, priorityLabel } from "@/utils/priority"
import type { TodoPriority } from "@/types"

interface PriorityBadgeProps {
  priority: TodoPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge variant="outline" className={`gap-1.5 ${priorityColor[priority]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priorityLabel[priority]}
    </Badge>
  )
}
