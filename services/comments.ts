import { api } from "./api"
import type { CommentResponse, AddCommentDto } from "@/types"

export const commentService = {
  add: (todoId: string, dto: AddCommentDto) =>
    api.post(`/todos/${todoId}/comments`, dto),
}
