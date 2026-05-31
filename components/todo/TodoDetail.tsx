"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTodo, useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos"
import { useAddComment } from "@/hooks/useComments"
import { useCategories } from "@/hooks/useCategories"
import { PriorityBadge } from "./PriorityBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDueDate, isOverdue } from "@/utils/date"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { TodoPriority } from "@/types"

export function TodoDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: todo, isLoading } = useTodo(id)
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const addComment = useAddComment(id)
  const { data: categories } = useCategories()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const [editing, setEditing] = useState(false)

  if (isLoading || !todo) {
    return <div className="flex-1 p-6">Loading...</div>
  }

  async function handleSave() {
    await updateTodo.mutateAsync({
      id,
      dto: {
        title,
        description,
        dueDate: dueDate ? `${dueDate}T00:00:00` : undefined,
        priority,
        categories: selectedCategories,
      },
    })
    setEditing(false)
  }

  async function handleDelete() {
    await deleteTodo.mutateAsync(id)
    router.push("/todos")
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    await addComment.mutateAsync({ content: comment })
    setComment("")
  }

  function startEditing() {
    setTitle(todo!.title)
    setDescription(todo!.description || "")
    setDueDate(todo!.dueDate ? todo!.dueDate.split("T")[0] : "")
    setPriority(todo!.priority)
    setSelectedCategories(todo!.categories.map((c) => c.id))
    setEditing(true)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {editing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as TodoPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {categories && (
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = selectedCategories.includes(cat.id)
                  return (
                    <Button
                      key={cat.id}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          selected
                            ? prev.filter((id) => id !== cat.id)
                            : [...prev, cat.id],
                        )
                      }
                    >
                      {cat.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateTodo.isPending}>
              {updateTodo.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{todo.title}</h1>
              <div className="mt-2 flex items-center gap-2">
                <PriorityBadge priority={todo.priority} />
                {todo.dueDate && (
                  <span
                    className={
                      isOverdue(todo.dueDate)
                        ? "text-sm text-destructive"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    Due {formatDueDate(todo.dueDate)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={startEditing}>
                Edit
              </Button>
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {todo.description && <p>{todo.description}</p>}

          {todo.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {todo.categories.map((cat) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Comments</h2>
            {todo.comments?.map((c) => (
              <div key={c.id} className="rounded-lg border p-3 text-sm">
                {c.content}
              </div>
            ))}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <Button type="submit" disabled={addComment.isPending}>
                {addComment.isPending ? "..." : "Send"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
