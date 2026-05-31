"use client"

import { useCategoriesWithTodos } from "@/hooks/useCategories"
import { CategoryCard } from "@/components/category/CategoryCard"
import { CreateCategoryForm } from "@/components/category/CreateCategoryForm"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"

export default function CategoriesPage() {
  const { data: categories, isLoading, error, refetch } = useCategoriesWithTodos()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">Categories</h1>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-4 text-muted-foreground">Failed to load categories</p>
          <Button onClick={() => refetch()} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            {categories?.length ?? 0} categories
          </p>
        </div>
        <CreateCategoryForm
          trigger={<Button><Plus className="mr-1.5 h-4 w-4" />New category</Button>}
        />
      </div>
      <div className="space-y-3">
        {categories?.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  )
}
