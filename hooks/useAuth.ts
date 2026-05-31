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
