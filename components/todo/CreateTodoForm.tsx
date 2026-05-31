import { useState, type ReactNode } from "react"
import { useCreateTodo } from "@/hooks/useTodos"
import { useCategories } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { TodoPriority } from "@/types"

interface CreateTodoFormProps {
  trigger?: ReactNode
}

export function CreateTodoForm({ trigger }: CreateTodoFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const createTodo = useCreateTodo()
  const { data: categories } = useCategories()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createTodo.mutateAsync({
      title,
      description,
      dueDate: dueDate ? `${dueDate}T00:00:00` : dueDate,
      priority,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    })
    setTitle("")
    setDescription("")
    setDueDate("")
    setPriority("MEDIUM")
    setSelectedCategories([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>New todo</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create todo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
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
          <Button type="submit" className="w-full" disabled={createTodo.isPending}>
            {createTodo.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
