import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { todoService } from "@/services/todos"
import type { TodoResponse, TodoDetailResponse, CreateTodoDto, UpdateTodoDto } from "@/types"

const todoKeys = {
  all: ["todos"] as const,
  detail: (id: string) => ["todos", id] as const,
  search: (query: string, filters?: Record<string, unknown>) =>
    ["todos", "search", query, filters] as const,
}

export function useTodos() {
  return useQuery({
    queryKey: todoKeys.all,
    queryFn: () => todoService.getAll(),
  })
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoService.getById(id),
    enabled: !!id,
  })
}

export function useSearchTodos(
  query: string,
  filters?: { completed?: boolean; priority?: string },
) {
  return useQuery({
    queryKey: todoKeys.search(query, filters),
    queryFn: () => todoService.search(query, filters),
    enabled: query.length > 0,
  })
}

export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateTodoDto) => todoService.create(dto),
    onSettled: () => qc.invalidateQueries({ queryKey: todoKeys.all }),
  })
}

export function useUpdateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTodoDto }) =>
      todoService.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await qc.cancelQueries({ queryKey: todoKeys.all })
      const prev = qc.getQueryData<TodoResponse[]>(todoKeys.all)
      qc.setQueryData<TodoResponse[]>(todoKeys.all, (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...dto } as TodoResponse : t)),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(todoKeys.all, context.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: todoKeys.all }),
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => todoService.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: todoKeys.all })
      const prev = qc.getQueryData<TodoResponse[]>(todoKeys.all)
      qc.setQueryData<TodoResponse[]>(todoKeys.all, (old) =>
        old?.filter((t) => t.id !== id),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(todoKeys.all, context.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: todoKeys.all }),
  })
}
