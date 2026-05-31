import { TodoDetail } from "@/components/todo/TodoDetail"

export default async function TodoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TodoDetail id={id} />
}
