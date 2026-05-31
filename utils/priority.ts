import type { TodoPriority } from "@/types"

export const priorityColor: Record<TodoPriority, string> = {
  HIGH: "text-red-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
}

export const priorityLabel: Record<TodoPriority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}
