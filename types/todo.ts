import type { CategoryResponse } from "./category"
import type { CommentResponse } from "./comment"

export type TodoPriority = "LOW" | "MEDIUM" | "HIGH"

export interface TodoResponse {
  id: string
  title: string
  description: string
  completed: boolean
  priority: TodoPriority
  dueDate: string
  categories: CategoryResponse[]
}

export interface TodoDetailResponse extends TodoResponse {
  comments: CommentResponse[]
}

export interface CategoryWithTodosResponse extends CategoryResponse {
  todos: TodoResponse[]
}

export interface CreateTodoDto {
  categories?: string[]
  title: string
  description: string
  dueDate: string
  priority: TodoPriority
}

export interface UpdateTodoDto {
  title?: string
  description?: string
  dueDate?: string
  priority?: TodoPriority
  categories?: string[]
  completed?: boolean
}
