# Web App Base Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port mobile todo app data layer + components to Next.js web app

**Architecture:** Page → Hook (TanStack Query v5) → Service (Axios) → REST API. Auth via Firebase Auth → Zustand store (persisted to localStorage) → Axios Bearer interceptor. Client-side auth guard in root layout.

**Tech Stack:** Next.js 16 App Router, shadcn/ui Radix Nova, Tailwind v4, Zustand 5, TanStack Query v5, Axios, Firebase Auth

---

### Task 1: Upgrade TanStack React Query to v5

**Files:**
- Modify: `package.json:12`

- [ ] **Step 1: Update dependency version**

Edit `package.json` line 12 — change `"@tanstack/react-query": "4"` to `"@tanstack/react-query": "^5"`:

```json
"@tanstack/react-query": "^5",
```

- [ ] **Step 2: Install updated dependency**

Run: `bun install`
Expected: Downloads react-query v5 + react-query devtools

- [ ] **Step 3: Verify version installed**

Run: `bun ls @tanstack/react-query 2>&1 | head -5`
Expected: Shows v5.x.x installed

---

### Task 2: Create Type Definitions

**Files:**
- Create: `types/todo.ts`
- Create: `types/category.ts`
- Create: `types/comment.ts`
- Create: `types/user.ts`
- Create: `types/index.ts`

- [ ] **Step 1: Create `types/todo.ts`**

```typescript
export type TodoPriority = "LOW" | "MEDIUM" | "HIGH"

export interface TodoResponse {
  id: string
  title: string
  description: string
  completed: boolean
  priority: TodoPriority
  dueDate: string
  categories: CategoryResponse[]
}

export interface TodoDetailResponse extends TodoResponse {
  comments: CommentResponse[]
}

export interface CategoryWithTodosResponse extends CategoryResponse {
  todos: TodoResponse[]
}

export interface CreateTodoDto {
  categories?: string[]
  title: string
  description: string
  dueDate: string
  priority: TodoPriority
}

export interface UpdateTodoDto {
  title?: string
  description?: string
  dueDate?: string
  priority?: TodoPriority
  categories?: string[]
  completed?: boolean
}
```

Import `CategoryResponse` from `./category` and `CommentResponse` from `./comment`.

- [ ] **Step 2: Create `types/category.ts`**

```typescript
export interface CategoryResponse {
  id: string
  name: string
  description: string
  color: string
}

export interface CreateCategoryDto {
  name: string
  description: string
  color: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  color?: string
}
```

- [ ] **Step 3: Create `types/comment.ts`**

```typescript
export interface CommentResponse {
  id: string
  content: string
}

export interface AddCommentDto {
  content: string
}
```

- [ ] **Step 4: Create `types/user.ts`**

```typescript
export interface UserProfileResponse {
  id: string
  name: string
  email: string
  providerUid: string
  role: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  role?: string
}
```

- [ ] **Step 5: Create `types/index.ts`**

```typescript
export type { TodoPriority, TodoResponse, TodoDetailResponse, CategoryWithTodosResponse, CreateTodoDto, UpdateTodoDto } from "./todo"
export type { CategoryResponse, CreateCategoryDto, UpdateCategoryDto } from "./category"
export type { CommentResponse, AddCommentDto } from "./comment"
export type { UserProfileResponse, CreateUserDto } from "./user"
```

---

### Task 3: Create Utils

**Files:**
- Create: `utils/date.ts`
- Create: `utils/priority.ts`
- Create: `utils/color.ts`

- [ ] **Step 1: Create `utils/date.ts`**

```typescript
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
```

- [ ] **Step 2: Create `utils/priority.ts`**

```typescript
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
```

- [ ] **Step 3: Create `utils/color.ts`**

```typescript
export const PRESET_COLOR_NAMES = [
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "fuchsia",
  "pink", "rose", "slate",
] as const

export function resolveColor(color: string): string {
  return color
}
```

---

### Task 4: Create Firebase Config

**Files:**
- Create: `config/firebase.ts`

- [ ] **Step 1: Create `config/firebase.ts`**

```typescript
import { initializeApp, type FirebaseApp } from "firebase/app"
import { initializeAuth, type Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

let app: FirebaseApp | undefined
let auth: Auth | undefined

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const a = getFirebaseApp()
    auth = initializeAuth(a)
  }
  return auth
}
```

---

### Task 5: Create Axios Service Layer

**Files:**
- Create: `services/api.ts`
- Create: `services/todos.ts`
- Create: `services/categories.ts`
- Create: `services/comments.ts`
- Create: `services/users.ts`

- [ ] **Step 1: Create `services/api.ts`**

```typescript
import axios from "axios"
import { useAuthStore } from "@/stores/authStore"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().signOut()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)
```

- [ ] **Step 2: Create `services/todos.ts`**

```typescript
import { api } from "./api"
import type { TodoResponse, TodoDetailResponse, CreateTodoDto, UpdateTodoDto } from "@/types"

export const todoService = {
  getAll: () => api.get<TodoResponse[]>("/todos").then((r) => r.data),

  getById: (id: string) =>
    api.get<TodoDetailResponse>(`/todos/${id}`).then((r) => r.data),

  create: (dto: CreateTodoDto) =>
    api.post<TodoResponse>("/todos", dto).then((r) => r.data),

  update: (id: string, dto: UpdateTodoDto) =>
    api.patch<TodoResponse>(`/todos/${id}`, dto).then((r) => r.data),

  delete: (id: string) => api.delete(`/todos/${id}`),

  search: (query: string, filters?: { completed?: boolean; priority?: string }) =>
    api
      .get<TodoResponse[]>(`/todos/search/${encodeURIComponent(query)}`, {
        params: filters,
      })
      .then((r) => r.data),
}
```

- [ ] **Step 3: Create `services/categories.ts`**

```typescript
import { api } from "./api"
import type { CategoryResponse, CategoryWithTodosResponse, CreateCategoryDto, UpdateCategoryDto } from "@/types"

export const categoryService = {
  getAll: () =>
    api.get<CategoryResponse[]>("/categories").then((r) => r.data),

  getWithTodos: () =>
    api
      .get<CategoryWithTodosResponse[]>("/categories/with-todos")
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<CategoryResponse>(`/categories/${id}`).then((r) => r.data),

  create: (dto: CreateCategoryDto) =>
    api.post<CategoryResponse>("/categories", dto).then((r) => r.data),

  update: (id: string, dto: UpdateCategoryDto) =>
    api.patch<CategoryResponse>(`/categories/${id}`, dto).then((r) => r.data),

  delete: (id: string) => api.delete(`/categories/${id}`),
}
```

- [ ] **Step 4: Create `services/comments.ts`**

```typescript
import { api } from "./api"
import type { CommentResponse, AddCommentDto } from "@/types"

export const commentService = {
  add: (todoId: string, dto: AddCommentDto) =>
    api.post(`/todos/${todoId}/comments`, dto),
}
```

- [ ] **Step 5: Create `services/users.ts`**

```typescript
import { api } from "./api"
import type { UserProfileResponse, CreateUserDto } from "@/types"

export const userService = {
  register: (dto: CreateUserDto) => api.post("/users", dto),

  getProfile: () =>
    api.get<UserProfileResponse>("/users/me").then((r) => r.data),
}
```

---

### Task 6: Create Zustand Auth Store

**Files:**
- Create: `stores/authStore.ts`

- [ ] **Step 1: Create `stores/authStore.ts`**

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { getFirebaseAuth } from "@/config/firebase"
import { userService } from "@/services/users"
import type { UserProfileResponse } from "@/types"

interface AuthState {
  user: UserProfileResponse | null
  token: string | null
  isLoading: boolean
  firebaseUser: FirebaseUser | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      // Set up Firebase auth state listener
      if (typeof window !== "undefined") {
        try {
          const auth = getFirebaseAuth()
          onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              const token = await firebaseUser.getIdToken()
              set({ firebaseUser, token, isLoading: false })
              // Try to get profile
              try {
                const profile = await userService.getProfile()
                set({ user: profile })
              } catch {
                // Profile fetch may fail if backend not ready
              }
            } else {
              set({ firebaseUser: null, token: null, user: null, isLoading: false })
            }
          })
        } catch {
          set({ isLoading: false })
        }
      } else {
        set({ isLoading: false })
      }

      return {
        user: null,
        token: null,
        isLoading: true,
        firebaseUser: null,

        signIn: async (email: string, password: string) => {
          const auth = getFirebaseAuth()
          const credential = await signInWithEmailAndPassword(auth, email, password)
          const token = await credential.user.getIdToken()
          const profile = await userService.getProfile()
          set({ user: profile, token, firebaseUser: credential.user })
        },

        signOut: async () => {
          try {
            const auth = getFirebaseAuth()
            await firebaseSignOut(auth)
          } finally {
            set({ user: null, token: null, firebaseUser: null })
          }
        },
      }
    },
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        firebaseUser: state.firebaseUser,
      }),
    },
  ),
)
```

---

### Task 7: Create TanStack Query Hooks

**Files:**
- Create: `hooks/useAuth.ts`
- Create: `hooks/useTodos.ts`
- Create: `hooks/useCategories.ts`
- Create: `hooks/useComments.ts`

- [ ] **Step 1: Create `hooks/useAuth.ts`**

```typescript
import { useMutation } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/authStore"
import { userService } from "@/services/users"
import type { CreateUserDto } from "@/types"

export function useSignIn() {
  const signIn = useAuthStore((s) => s.signIn)
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
  })
}

export function useSignOut() {
  const signOut = useAuthStore((s) => s.signOut)
  return useMutation({
    mutationFn: () => signOut(),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (dto: CreateUserDto) => userService.register(dto),
  })
}
```

- [ ] **Step 2: Install react-query-devtools**

Run: `bun add @tanstack/react-query-devtools`
Expected: Package installed

- [ ] **Step 3: Create `hooks/useTodos.ts`**

```typescript
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
        old?.map((t) => (t.id === id ? { ...t, ...dto } : t)),
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
```

- [ ] **Step 4: Create `hooks/useCategories.ts`**

```typescript
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { categoryService } from "@/services/categories"
import type { CategoryResponse, CreateCategoryDto, UpdateCategoryDto } from "@/types"

const categoryKeys = {
  all: ["categories"] as const,
  withTodos: ["categories", "with-todos"] as const,
  detail: (id: string) => ["categories", id] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoryService.getAll(),
  })
}

export function useCategoriesWithTodos() {
  return useQuery({
    queryKey: categoryKeys.withTodos,
    queryFn: () => categoryService.getWithTodos(),
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoryService.create(dto),
    onSettled: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
      categoryService.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await qc.cancelQueries({ queryKey: categoryKeys.all })
      const prev = qc.getQueryData<CategoryResponse[]>(categoryKeys.all)
      qc.setQueryData<CategoryResponse[]>(categoryKeys.all, (old) =>
        old?.map((c) => (c.id === id ? { ...c, ...dto } : c)),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(categoryKeys.all, context.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: categoryKeys.all })
      const prev = qc.getQueryData<CategoryResponse[]>(categoryKeys.all)
      qc.setQueryData<CategoryResponse[]>(categoryKeys.all, (old) =>
        old?.filter((c) => c.id !== id),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(categoryKeys.all, context.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}
```

- [ ] **Step 5: Create `hooks/useComments.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { commentService } from "@/services/comments"
import type { AddCommentDto } from "@/types"

const todoDetailKeys = {
  detail: (id: string) => ["todos", id] as const,
}

export function useAddComment(todoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: AddCommentDto) => commentService.add(todoId, dto),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: todoDetailKeys.detail(todoId) }),
  })
}
```

---

### Task 8: Install shadcn UI Components

**Files:**
- Modify: (shadcn adds to `components/ui/`)

- [ ] **Step 1: Add all needed shadcn components**

Run:

```bash
bunx shadcn add button card input select dialog badge skeleton progress checkbox command label textarea separator
```

Expected: Each component is scaffolded into `components/ui/`

---

### Task 9: Update Root Layout with Providers

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Rewrite `app/layout.tsx`**

```typescript
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Todo App",
  description: "A todo list application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create `components/providers.tsx`**

```typescript
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>{children}</AuthGuard>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

### Task 10: Create Auth Guard Component

**Files:**
- Create: `components/auth-guard.tsx`

- [ ] **Step 1: Create `components/auth-guard.tsx`**

```typescript
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
```

---

### Task 11: Create Auth Pages

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/signup/page.tsx`
- Create: `app/page.tsx` (modify existing)

- [ ] **Step 1: Create `app/login/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSignIn } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const signIn = useSignIn()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await signIn.mutateAsync({ email, password })
      router.push("/todos")
    } catch {}
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {signIn.error && (
              <p className="text-sm text-destructive">
                {(signIn.error as Error).message}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={signIn.isPending}>
              {signIn.isPending ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/signup/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRegister } from "@/hooks/useAuth"
import { useSignIn } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const register = useRegister()
  const signIn = useSignIn()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await register.mutateAsync({ name, email, password })
      await signIn.mutateAsync({ email, password })
      router.push("/todos")
    } catch {}
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Fill in your details</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {register.error && (
              <p className="text-sm text-destructive">
                {(register.error as Error).message}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? "Creating account..." : "Sign up"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Replace `app/page.tsx` with landing page**

```typescript
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/todos")
}
```

---

### Task 12: Create Domain Components

**Files:**
- Create: `components/todo/PriorityBadge.tsx`
- Create: `components/todo/TodoCard.tsx`
- Create: `components/todo/TodoCardSkeleton.tsx`
- Create: `components/todo/EmptyTodoState.tsx`
- Create: `components/todo/ErrorTodoState.tsx`
- Create: `components/todo/CreateTodoForm.tsx`
- Create: `components/todo/TodoDetail.tsx`
- Create: `components/category/CategoryCard.tsx`
- Create: `components/category/CreateCategoryForm.tsx`
- Create: `components/category/CategoryDetail.tsx`

- [ ] **Step 1: Create `components/todo/PriorityBadge.tsx`**

```typescript
import { Badge } from "@/components/ui/badge"
import { priorityColor, priorityLabel } from "@/utils/priority"
import type { TodoPriority } from "@/types"

interface PriorityBadgeProps {
  priority: TodoPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge variant="outline" className={`gap-1.5 ${priorityColor[priority]}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current`} />
      {priorityLabel[priority]}
    </Badge>
  )
}
```

- [ ] **Step 2: Create `components/todo/TodoCard.tsx`**

```typescript
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PriorityBadge } from "./PriorityBadge"
import { formatDueDate, isOverdue } from "@/utils/date"
import type { TodoResponse } from "@/types"
import Link from "next/link"

interface TodoCardProps {
  todo: TodoResponse
  onToggle: (id: string, completed: boolean) => void
}

export function TodoCard({ todo, onToggle }: TodoCardProps) {
  return (
    <Link href={`/todo/${todo.id}`}>
      <Card className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) =>
            onToggle(todo.id, checked as boolean)
          }
          className="mt-1"
        />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3
              className={`font-medium ${todo.completed ? "text-muted-foreground line-through" : ""}`}
            >
              {todo.title}
            </h3>
            <PriorityBadge priority={todo.priority} />
          </div>
          {todo.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {todo.description}
            </p>
          )}
          <div className="flex items-center gap-2">
            {todo.categories.map((cat) => (
              <Badge key={cat.id} variant="secondary" className="text-xs">
                {cat.name}
              </Badge>
            ))}
            {todo.dueDate && (
              <span
                className={`text-xs ${
                  isOverdue(todo.dueDate) ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {formatDueDate(todo.dueDate)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 3: Create `components/todo/TodoCardSkeleton.tsx`**

```typescript
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface TodoCardSkeletonProps {
  count?: number
}

export function TodoCardSkeleton({ count = 5 }: TodoCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="mt-1 h-4 w-4 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create `components/todo/EmptyTodoState.tsx`**

```typescript
import { ClipboardList } from "lucide-react"

export function EmptyTodoState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">No todos yet</h3>
      <p className="text-sm text-muted-foreground">
        Create your first todo to get started
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Create `components/todo/ErrorTodoState.tsx`**

```typescript
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorTodoStateProps {
  onRetry: () => void
}

export function ErrorTodoState({ onRetry }: ErrorTodoStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="h-12 w-12 text-destructive/50" />
      <h3 className="mt-4 text-lg font-medium">Something went wrong</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Failed to load todos
      </p>
      <Button onClick={onRetry} variant="outline">
        Try again
      </Button>
    </div>
  )
}
```

- [ ] **Step 6: Create `components/todo/CreateTodoForm.tsx`**

```typescript
import { useState } from "react"
import { useCreateTodo } from "@/hooks/useTodos"
import { useCategories } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type { TodoPriority } from "@/types"

export function CreateTodoForm() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const createTodo = useCreateTodo()
  const { data: categories } = useCategories()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createTodo.mutateAsync({
      title,
      description,
      dueDate,
      priority,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    })
    setTitle("")
    setDescription("")
    setDueDate("")
    setPriority("MEDIUM")
    setSelectedCategories([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create todo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as TodoPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {categories && (
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = selectedCategories.includes(cat.id)
                  return (
                    <Button
                      key={cat.id}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          selected
                            ? prev.filter((id) => id !== cat.id)
                            : [...prev, cat.id],
                        )
                      }
                    >
                      {cat.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={createTodo.isPending}>
            {createTodo.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 7: Create `components/todo/TodoDetail.tsx`**

```typescript
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTodo, useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos"
import { useAddComment } from "@/hooks/useComments"
import { useCategories } from "@/hooks/useCategories"
import { PriorityBadge } from "./PriorityBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDueDate, isOverdue } from "@/utils/date"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { TodoPriority } from "@/types"

export function TodoDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: todo, isLoading } = useTodo(id)
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const addComment = useAddComment(id)
  const { data: categories } = useCategories()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const [editing, setEditing] = useState(false)

  if (isLoading || !todo) {
    return <div className="flex-1 p-6">Loading...</div>
  }

  async function handleSave() {
    await updateTodo.mutateAsync({
      id,
      dto: {
        title,
        description,
        dueDate: dueDate || undefined,
        priority,
        categories: selectedCategories,
      },
    })
    setEditing(false)
  }

  async function handleDelete() {
    await deleteTodo.mutateAsync(id)
    router.push("/todos")
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    await addComment.mutateAsync({ content: comment })
    setComment("")
  }

  function startEditing() {
    setTitle(todo.title)
    setDescription(todo.description || "")
    setDueDate(todo.dueDate || "")
    setPriority(todo.priority)
    setSelectedCategories(todo.categories.map((c) => c.id))
    setEditing(true)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {editing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as TodoPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {categories && (
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = selectedCategories.includes(cat.id)
                  return (
                    <Button
                      key={cat.id}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          selected
                            ? prev.filter((id) => id !== cat.id)
                            : [...prev, cat.id],
                        )
                      }
                    >
                      {cat.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateTodo.isPending}>
              {updateTodo.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{todo.title}</h1>
              <div className="mt-2 flex items-center gap-2">
                <PriorityBadge priority={todo.priority} />
                {todo.dueDate && (
                  <span
                    className={
                      isOverdue(todo.dueDate)
                        ? "text-sm text-destructive"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    Due {formatDueDate(todo.dueDate)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={startEditing}>
                Edit
              </Button>
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {todo.description && <p>{todo.description}</p>}

          {todo.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {todo.categories.map((cat) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Comments</h2>
            {todo.comments?.map((c) => (
              <div key={c.id} className="rounded-lg border p-3 text-sm">
                {c.content}
              </div>
            ))}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <Button type="submit" disabled={addComment.isPending}>
                {addComment.isPending ? "..." : "Send"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Create `components/category/CategoryCard.tsx`**

```typescript
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { CategoryWithTodosResponse, CategoryResponse } from "@/types"
import Link from "next/link"

interface CategoryCardProps {
  category: CategoryWithTodosResponse | CategoryResponse
}

export function CategoryCard({ category }: CategoryCardProps) {
  const todos = "todos" in category ? category.todos : []
  const completed = todos.filter((t) => t.completed).length
  const progress = todos.length > 0 ? (completed / todos.length) * 100 : 0

  return (
    <Link href={`/category/${category.id}`}>
      <Card
        className="border-l-4 p-4 transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: category.color || "oklch(0.7 0 0)" }}
      >
        <div className="space-y-1.5">
          <h3 className="font-medium">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}
          {"todos" in category && todos.length > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completed}/{todos.length} completed
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 9: Create `components/category/CreateCategoryForm.tsx`**

```typescript
import { useState } from "react"
import { useCreateCategory } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { PRESET_COLOR_NAMES } from "@/utils/color"

export function CreateCategoryForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("blue")
  const createCategory = useCreateCategory()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createCategory.mutateAsync({ name, description, color })
    setName("")
    setDescription("")
    setColor("blue")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLOR_NAMES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 10: Create `components/category/CategoryDetail.tsx`**

```typescript
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2 } from "lucide-react"
import { PRESET_COLOR_NAMES } from "@/utils/color"
import Link from "next/link"

export function CategoryDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: category, isLoading } = useCategory(id)
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("")
  const [editing, setEditing] = useState(false)

  if (isLoading || !category) {
    return <div className="flex-1 p-6">Loading...</div>
  }

  async function handleSave() {
    await updateCategory.mutateAsync({ id, dto: { name, description, color } })
    setEditing(false)
  }

  async function handleDelete() {
    await deleteCategory.mutateAsync(id)
    router.push("/categories")
  }

  function startEditing() {
    setName(category.name)
    setDescription(category.description || "")
    setColor(category.color)
    setEditing(true)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {editing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLOR_NAMES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateCategory.isPending}>
              {updateCategory.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h1 className="text-2xl font-bold">{category.name}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={startEditing}>
                Edit
              </Button>
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {category.description && <p>{category.description}</p>}
        </div>
      )}
    </div>
  )
}
```

---

### Task 13: Create Page Files

**Files:**
- Create: `app/todos/page.tsx`
- Create: `app/categories/page.tsx`
- Create: `app/search/page.tsx`
- Create: `app/todo/[id]/page.tsx`
- Create: `app/category/[id]/page.tsx`

- [ ] **Step 1: Create `app/todos/page.tsx`**

```typescript
"use client"

import { useTodos, useUpdateTodo } from "@/hooks/useTodos"
import { TodoCard } from "@/components/todo/TodoCard"
import { TodoCardSkeleton } from "@/components/todo/TodoCardSkeleton"
import { EmptyTodoState } from "@/components/todo/EmptyTodoState"
import { ErrorTodoState } from "@/components/todo/ErrorTodoState"
import { CreateTodoForm } from "@/components/todo/CreateTodoForm"
import { useSignOut } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function TodosPage() {
  const { data: todos, isLoading, error, refetch } = useTodos()
  const signOut = useSignOut()
  const updateTodo = useUpdateTodo()

  function handleToggle(id: string, completed: boolean) {
    updateTodo.mutate({ id, dto: { completed } })
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todos</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>

      {isLoading ? (
        <TodoCardSkeleton />
      ) : error ? (
        <ErrorTodoState onRetry={refetch} />
      ) : !todos?.length ? (
        <EmptyTodoState />
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onToggle={handleToggle} />
          ))}
        </div>
      )}

      <CreateTodoForm />
    </div>
  )
}
```

- [ ] **Step 2: Create `app/categories/page.tsx`**

```typescript
"use client"

import { useCategoriesWithTodos } from "@/hooks/useCategories"
import { CategoryCard } from "@/components/category/CategoryCard"
import { CreateCategoryForm } from "@/components/category/CreateCategoryForm"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function CategoriesPage() {
  const { data: categories, isLoading, error, refetch } = useCategoriesWithTodos()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <h1 className="mb-6 text-2xl font-bold">Categories</h1>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive/50" />
        <p className="mt-4">Failed to load categories</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>
      <div className="space-y-3">
        {categories?.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
      <CreateCategoryForm />
    </div>
  )
}
```

- [ ] **Step 3: Create `app/search/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useSearchTodos } from "@/hooks/useTodos"
import { TodoCard } from "@/components/todo/TodoCard"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [priority, setPriority] = useState<string | undefined>()
  const { data: results, isLoading } = useSearchTodos(query, {
    ...(priority ? { priority } : {}),
  })

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search todos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="mb-4 flex gap-2">
        {["HIGH", "MEDIUM", "LOW"].map((p) => (
          <button
            key={p}
            onClick={() => setPriority(priority === p ? undefined : p)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              priority === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {results?.map((todo) => (
          <TodoCard key={todo.id} todo={todo} onToggle={() => {}} />
        ))}
        {query && !isLoading && !results?.length && (
          <p className="text-center text-sm text-muted-foreground">
            No results found
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/todo/[id]/page.tsx`**

```typescript
import { TodoDetail } from "@/components/todo/TodoDetail"

export default async function TodoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TodoDetail id={id} />
}
```

- [ ] **Step 5: Create `app/category/[id]/page.tsx`**

```typescript
import { CategoryDetail } from "@/components/category/CategoryDetail"

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CategoryDetail id={id} />
}
```

---

### Task 14: Add Navigation (Bottom Tab Bar)

**Files:**
- Create: `components/tab-bar.tsx`

- [ ] **Step 1: Create `components/tab-bar.tsx`**

```typescript
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
```

- [ ] **Step 2: Add TabBar to `app/todos/page.tsx`, `app/categories/page.tsx`, `app/search/page.tsx` layouts

Actually, simpler: add TabBar to root layout inside body.

Modify `app/layout.tsx` to import and render `TabBar`:

```typescript
import { TabBar } from "@/components/tab-bar"
// ... in body after children:
<TabBar />
```

---

### Task 15: Create .env.example and Verify Build

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

- [ ] **Step 2: Verify build compiles**

Run: `bun run build`
Expected: Build succeeds without errors. Any type errors should be fixed.
