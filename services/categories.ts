import { api } from "./api"
import type { CategoryResponse, CategoryWithTodosResponse, CreateCategoryDto, UpdateCategoryDto } from "@/types"

export const categoryService = {
  getAll: () =>
    api.get<CategoryResponse[]>("/categories").then((r) => r.data),

  getWithTodos: () =>
    api
      .get<CategoryWithTodosResponse[]>("/categories/with-todos")
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<CategoryResponse>(`/categories/${id}`).then((r) => r.data),

  create: (dto: CreateCategoryDto) =>
    api.post<CategoryResponse>("/categories", dto).then((r) => r.data),

  update: (id: string, dto: UpdateCategoryDto) =>
    api.patch<CategoryResponse>(`/categories/${id}`, dto).then((r) => r.data),

  delete: (id: string) => api.delete(`/categories/${id}`),
}
