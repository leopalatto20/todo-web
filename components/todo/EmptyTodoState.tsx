import { ClipboardList } from "lucide-react"

export function EmptyTodoState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">No todos yet</h3>
      <p className="text-sm text-muted-foreground">
        Create your first todo to get started
      </p>
    </div>
  )
}
