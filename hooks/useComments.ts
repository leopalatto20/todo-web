import { useMutation, useQueryClient } from "@tanstack/react-query"
import { commentService } from "@/services/comments"
import type { AddCommentDto } from "@/types"

export function useAddComment(todoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: AddCommentDto) => commentService.add(todoId, dto),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["todos", todoId] }),
  })
}
