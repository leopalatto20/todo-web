"use client"

import { useTodos, useUpdateTodo } from "@/hooks/useTodos"
import { TodoCard } from "@/components/todo/TodoCard"
import { TodoCardSkeleton } from "@/components/todo/TodoCardSkeleton"
import { EmptyTodoState } from "@/components/todo/EmptyTodoState"
import { ErrorTodoState } from "@/components/todo/ErrorTodoState"
import { CreateTodoForm } from "@/components/todo/CreateTodoForm"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function TodosPage() {
  const { data: todos, isLoading, error, refetch } = useTodos()
  const updateTodo = useUpdateTodo()

  function handleToggle(id: string, completed: boolean) {
    updateTodo.mutate({ id, dto: { completed } })
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
          <p className="text-sm text-muted-foreground">
            {todos?.length ?? 0} tasks
          </p>
        </div>
        <CreateTodoForm
          trigger={<Button><Plus className="mr-1.5 h-4 w-4" />New todo</Button>}
        />
      </div>

      {isLoading ? (
        <TodoCardSkeleton />
      ) : error ? (
        <ErrorTodoState onRetry={refetch} />
      ) : !todos?.length ? (
        <EmptyTodoState />
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  )
}
