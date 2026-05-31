# todo-web Base Configuration Design

Port mobile todo app data layer + components to Next.js web app.

## Architecture

```
Page → Hook (TanStack Query v5) → Service (Axios) → REST API

Auth: Firebase Auth → Zustand store (persist:localStorage) → Axios interceptor (Bearer token)
```

Client-side auth guard in root layout. No middleware.

## Routes

| Route | Component | Auth |
|---|---|---|
| `/` | Landing → redirect `/todos` if authed | No |
| `/login` | Login form | No, redirect if authed |
| `/signup` | Signup form | No, redirect if authed |
| `/todos` | Todo list + FAB | Yes |
| `/categories` | Category list + FAB | Yes |
| `/search` | Search + filters | Yes |
| `/todo/[id]` | Todo detail/edit | Yes |
| `/category/[id]` | Category detail/edit | Yes |

## File Structure

```
types/
  index.ts          barrel
  todo.ts           TodoPriority enum, TodoResponse, TodoDetailResponse,
                    CategoryWithTodosResponse, CreateTodoDto, UpdateTodoDto
  category.ts       CategoryResponse, CreateCategoryDto, UpdateCategoryDto
  comment.ts        CommentResponse, AddCommentDto
  user.ts           User, UserProfileResponse, CreateUserDto

config/
  firebase.ts       initializeApp + initializeAuth (localStorage persistence)

services/
  api.ts            Axios instance, Bearer token interceptor, 401 → signout
  todos.ts          getAll, getById, create, update, delete, search
  categories.ts     getAll, getWithTodos, create, getById, update, delete
  comments.ts       add
  users.ts          register, getProfile

stores/
  authStore.ts      Zustand + persist(localStorage)
                    state: { user, token, isLoading, firebaseUser }
                    actions: signIn, signOut, setUser, setFirebaseUser

hooks/
  useAuth.ts        useSignIn, useSignOut, useRegister mutations
  useTodos.ts       useTodos, useTodo, useCreateTodo, useUpdateTodo (optimistic),
                    useDeleteTodo (optimistic), useSearchTodos
  useCategories.ts  useCategories, useCategoriesWithTodos, useCategory,
                    useCreateCategory, useUpdateCategory (optimistic),
                    useDeleteCategory (optimistic)
  useComments.ts    useAddComment (invalidates todo detail)

utils/
  date.ts           formatDueDate(), isOverdue()
  priority.ts       priorityColor map, priorityLabel map
  color.ts          resolveColor(), PRESET_COLOR_NAMES

components/
  todo/
    TodoCard.tsx             shadcn Card + Checkbox
    TodoCardSkeleton.tsx     shadcn Skeleton
    CreateTodoForm.tsx       shadcn Dialog + form fields
    TodoDetail.tsx           detail + comments section
    PriorityBadge.tsx        shadcn Badge
    EmptyTodoState.tsx       centered illustration + text
    ErrorTodoState.tsx       error message + retry button
  category/
    CategoryCard.tsx         shadcn Card + colored border + Progress
    CreateCategoryForm.tsx   shadcn Dialog + color swatches
    CategoryDetail.tsx       detail + linked todos

app/
  layout.tsx        + QueryClientProvider + auth guard
  page.tsx          landing/redirect
  login/page.tsx
  signup/page.tsx
  todos/page.tsx    TodoList container
  categories/page.tsx
  search/page.tsx
  todo/[id]/page.tsx
  category/[id]/page.tsx
```

## Key Packages

- Upgrade `@tanstack/react-query` from `4` to `^5`
- Add `firebase` (already in deps)
- `shadcn` components to install: Button, Card, Input, Select, Dialog, Badge, Skeleton, Progress, Checkbox, Command, Label, Textarea

## Type Definitions

1:1 mapping from OpenAPI spec schemas:

- **TodoPriority**: `"LOW" | "MEDIUM" | "HIGH"` (string enum)
- **TodoResponse**: `{ id: UUID; title: string; description: string; completed: boolean; priority: TodoPriority; dueDate: string; categories: CategoryResponse[] }`
- **TodoDetailResponse**: `TodoResponse & { comments: CommentResponse[] }`
- **CreateTodoDto**: `{ title; description; dueDate; priority; categories: string[] }`
- **UpdateTodoDto**: `{ title?; description?; dueDate?; priority?; categories?: string[]; completed? }`
- **CategoryResponse**: `{ id: UUID; name; description; color }`
- **CategoryWithTodosResponse**: `CategoryResponse & { todos: TodoResponse[] }`
- **CommentResponse**: `{ id: UUID; content: string }`
- **UserProfileResponse**: `{ id; name; email; providerUid; role }`
- **CreateUserDto**: `{ name; email; password; role? }`

## Auth Flow

1. User signs in: `signInWithEmailAndPassword` → `getIdToken()` → store token + user in Zustand
2. Axios interceptor reads token from `useAuthStore.getState().token` → Bearer header
3. 401 response → clear store → redirect `/login`
4. Page mount: `useAuthStore.isLoading` from persisted state → show spinner → check token → redirect
5. Login/signup pages: if token exists on mount, redirect to `/todos`

## Data Patterns

### Query Keys (structured)

```typescript
const todoKeys = {
  all: ["todos"] as const,
  detail: (id: string) => ["todos", id] as const,
  search: (q: string, filters?: Record<string, unknown>) =>
    ["todos", "search", q, filters] as const,
}
```

### Optimistic Updates

Update mutation pattern: cancel queries → snapshot prev data → apply optimistic → rollback on error → invalidate on settle.

### Error Handling

3 layers: Axios interceptor (401) → TanStack Query (isError/error from query/mutation) → Screen (error state rendering + retry).

## Component Patterns

- `cn()` from `@/lib/utils` for className
- shadcn Radix Nova style components
- Lucide icons
- Dark mode via `.dark` class (already configured in globals.css)
- Page pattern: isLoading → skeleton, error → ErrorTodoState, empty → EmptyTodoState, data → component
