import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { resolveColor } from "@/utils/color"
import type { CategoryWithTodosResponse, CategoryResponse } from "@/types"
import Link from "next/link"

interface CategoryCardProps {
  category: CategoryWithTodosResponse | CategoryResponse
}

export function CategoryCard({ category }: CategoryCardProps) {
  const todos = "todos" in category ? category.todos : []
  const completed = todos.filter((t) => t.completed).length
  const progress = todos.length > 0 ? (completed / todos.length) * 100 : 0

  return (
    <Link href={`/category/${category.id}`}>
      <Card
        className="border-l-4 p-4 transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: resolveColor(category.color) || "oklch(0.7 0 0)" }}
      >
        <div className="space-y-1.5">
          <h3 className="font-medium">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}
          {"todos" in category && todos.length > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completed}/{todos.length} completed
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
