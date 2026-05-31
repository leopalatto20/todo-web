import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorTodoStateProps {
  onRetry: () => void
}

export function ErrorTodoState({ onRetry }: ErrorTodoStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="h-12 w-12 text-destructive/50" />
      <h3 className="mt-4 text-lg font-medium">Something went wrong</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Failed to load todos
      </p>
      <Button onClick={onRetry} variant="outline">
        Try again
      </Button>
    </div>
  )
}
