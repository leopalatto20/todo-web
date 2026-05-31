import { CheckCircle, FolderTree, Search, Tag, MessageSquare, Gauge } from "lucide-react"

const features = [
  {
    icon: CheckCircle,
    title: "Task management",
    desc: "Create, organize, and track todos with priorities and due dates. Mark tasks complete with a single click.",
  },
  {
    icon: FolderTree,
    title: "Categories",
    desc: "Group related tasks into color-coded categories. See progress at a glance with completion bars.",
  },
  {
    icon: Search,
    title: "Full-text search",
    desc: "Find any task instantly by title or description. Filter by priority and completion status.",
  },
  {
    icon: Tag,
    title: "Priorities",
    desc: "Flag tasks as High, Medium, or Low priority. Stay focused on what matters most.",
  },
  {
    icon: MessageSquare,
    title: "Comments",
    desc: "Add notes and context to any task. Keep discussions attached to the work they belong to.",
  },
  {
    icon: Gauge,
    title: "Real-time sync",
    desc: "Powered by Firebase Auth and a REST API. Your data stays in sync across sessions.",
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-16 space-y-4 pt-8 text-center">
        <h1 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          About
        </h1>
        <p className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          A focused workspace
          <br />
          <span className="text-muted-foreground">for getting things done.</span>
        </p>
        <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground">
          Todo is a lean task manager built for clarity, not complexity.
          Organize work your way — with priorities, categories, and search
          that actually work.
        </p>
      </div>

      <div className="mb-16 grid gap-px overflow-hidden rounded-xl border bg-muted sm:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className="bg-background p-6 transition-colors hover:bg-muted/50"
            >
              <Icon className="mb-3 h-5 w-5 text-primary" />
              <h3 className="mb-1.5 font-medium">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          )
        })}
      </div>

      <div className="border-t pt-8 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, shadcn/ui, Tailwind CSS, TanStack Query, Zustand, and Firebase.</p>
      </div>
    </div>
  )
}
