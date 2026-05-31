"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ListTodo, FolderKanban, Search } from "lucide-react"

const tabs = [
  { href: "/todos", label: "Todos", icon: ListTodo },
  { href: "/categories", label: "Categories", icon: FolderKanban },
  { href: "/search", label: "Search", icon: Search },
]

export function TabBar() {
  const pathname = usePathname()

  const show = tabs.some((t) => pathname.startsWith(t.href))
  if (!show) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="mx-auto flex max-w-2xl justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-6 py-2 text-xs transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
