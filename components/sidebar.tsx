"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ListTodo, FolderKanban, Search, Info, LogOut } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { useSignOut } from "@/hooks/useAuth"

const links = [
  { href: "/todos", label: "Todos", icon: ListTodo },
  { href: "/categories", label: "Categories", icon: FolderKanban },
  { href: "/search", label: "Search", icon: Search },
  { href: "/about", label: "About", icon: Info },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const signOut = useSignOut()

  const publicRoutes = ["/login", "/signup"]
  if (publicRoutes.includes(pathname) || pathname === "/") return null

  return (
    <aside className="flex w-56 flex-col border-r bg-sidebar py-4">
      <div className="mb-8 px-5">
        <h1 className="text-lg font-semibold tracking-tight">todo</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t px-5 pt-4">
        {user && (
          <p className="truncate text-sm font-medium">{user.name}</p>
        )}
        <button
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {signOut.isPending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </aside>
  )
}
