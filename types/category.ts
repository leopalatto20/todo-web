export interface CategoryResponse {
  id: string
  name: string
  description: string
  color: string
}

export interface CreateCategoryDto {
  name: string
  description: string
  color: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  color?: string
}
