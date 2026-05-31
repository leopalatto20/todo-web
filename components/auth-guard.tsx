"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

const publicRoutes = ["/login", "/signup"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!token && !publicRoutes.includes(pathname)) {
      router.replace("/login")
    }
    if (token && publicRoutes.includes(pathname)) {
      router.replace("/todos")
    }
  }, [token, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  return <>{children}</>
}
