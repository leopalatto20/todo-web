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
      if (typeof window !== "undefined") {
        try {
          const auth = getFirebaseAuth()
          onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              const token = await firebaseUser.getIdToken()
              set({ firebaseUser, token, isLoading: false })
              try {
                const profile = await userService.getProfile()
                set({ user: profile })
              } catch {}
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
