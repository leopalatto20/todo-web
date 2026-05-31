import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PriorityBadge } from "./PriorityBadge"
import { formatDueDate, isOverdue } from "@/utils/date"
import { resolveColor } from "@/utils/color"
import type { TodoResponse } from "@/types"
import Link from "next/link"
import { Pencil } from "lucide-react"

interface TodoCardProps {
  todo: TodoResponse
  onToggle: (id: string, completed: boolean) => void
}

export function TodoCard({ todo, onToggle }: TodoCardProps) {
  return (
    <Card className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked) =>
          onToggle(todo.id, checked as boolean)
        }
        className="mt-1"
      />
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <h3
            className={`font-medium ${todo.completed ? "text-muted-foreground line-through" : ""}`}
          >
            {todo.title}
          </h3>
          <PriorityBadge priority={todo.priority} />
          <Link
            href={`/todo/${todo.id}`}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
        {todo.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {todo.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          {todo.categories.map((cat) => (
            <Badge
              key={cat.id}
              className="text-xs"
              style={{ backgroundColor: resolveColor(cat.color), color: "white" }}
            >
              {cat.name}
            </Badge>
          ))}
          {todo.dueDate && (
            <span
              className={`text-xs ${
                isOverdue(todo.dueDate) ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {formatDueDate(todo.dueDate)}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
