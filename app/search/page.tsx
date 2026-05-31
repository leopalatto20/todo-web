"use client"

import { useState } from "react"
import { useSearchTodos } from "@/hooks/useTodos"
import { TodoCard } from "@/components/todo/TodoCard"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

const priorities = ["HIGH", "MEDIUM", "LOW"] as const

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [priority, setPriority] = useState<string | undefined>()
  const { data: results, isLoading } = useSearchTodos(query, {
    ...(priority ? { priority } : {}),
  })

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Search</h1>
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search todos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="mb-6 flex gap-2">
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => setPriority(priority === p ? undefined : p)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              priority === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {results?.map((todo) => (
          <TodoCard key={todo.id} todo={todo} onToggle={() => {}} />
        ))}
        {query && !isLoading && !results?.length && (
          <p className="text-center text-sm text-muted-foreground">
            No results found
          </p>
        )}
      </div>
    </div>
  )
}
