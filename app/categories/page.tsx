"use client"

import { useCategoriesWithTodos } from "@/hooks/useCategories"
import { CategoryCard } from "@/components/category/CategoryCard"
import { CreateCategoryForm } from "@/components/category/CreateCategoryForm"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function CategoriesPage() {
  const { data: categories, isLoading, error, refetch } = useCategoriesWithTodos()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-4 pb-20">
        <h1 className="mb-6 text-2xl font-bold">Categories</h1>
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
      <div className="mx-auto max-w-2xl p-4 pb-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive/50" />
        <p className="mt-4">Failed to load categories</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pb-20">
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>
      <div className="space-y-3">
        {categories?.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
      <CreateCategoryForm />
    </div>
  )
}
