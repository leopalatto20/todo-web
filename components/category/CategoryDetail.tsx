"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Trash2 } from "lucide-react"
import { PRESET_COLOR_NAMES } from "@/utils/color"

export function CategoryDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: category, isLoading } = useCategory(id)
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("")
  const [editing, setEditing] = useState(false)

  if (isLoading || !category) {
    return <div className="flex-1 p-6">Loading...</div>
  }

  async function handleSave() {
    await updateCategory.mutateAsync({ id, dto: { name, description, color } })
    setEditing(false)
  }

  async function handleDelete() {
    await deleteCategory.mutateAsync(id)
    router.push("/categories")
  }

  function startEditing() {
    setName(category!.name)
    setDescription(category!.description || "")
    setColor(category!.color)
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
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLOR_NAMES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateCategory.isPending}>
              {updateCategory.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h1 className="text-2xl font-bold">{category.name}</h1>
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
          {category.description && <p>{category.description}</p>}
        </div>
      )}
    </div>
  )
}
