import { CategoryDetail } from "@/components/category/CategoryDetail"

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CategoryDetail id={id} />
}
