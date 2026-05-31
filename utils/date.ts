export function formatDueDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function isOverdue(dateString: string): boolean {
  return new Date(dateString) < new Date()
}
