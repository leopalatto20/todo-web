"use client"

import { useTodos, useUpdateTodo } from "@/hooks/useTodos"
import { useSignOut } from "@/hooks/useAuth"
import { TodoCard } from "@/components/todo/TodoCard"
import { TodoCardSkeleton } from "@/components/todo/TodoCardSkeleton"
import { EmptyTodoState } from "@/components/todo/EmptyTodoState"
import { ErrorTodoState } from "@/components/todo/ErrorTodoState"
import { CreateTodoForm } from "@/components/todo/CreateTodoForm"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function TodosPage() {
  const { data: todos, isLoading, error, refetch } = useTodos()
  const signOut = useSignOut()
  const updateTodo = useUpdateTodo()

  function handleToggle(id: string, completed: boolean) {
    updateTodo.mutate({ id, dto: { completed } })
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pb-20">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todos</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>

      {isLoading ? (
        <TodoCardSkeleton />
      ) : error ? (
        <ErrorTodoState onRetry={refetch} />
      ) : !todos?.length ? (
        <EmptyTodoState />
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onToggle={handleToggle} />
          ))}
        </div>
      )}

      <CreateTodoForm />
    </div>
  )
}
