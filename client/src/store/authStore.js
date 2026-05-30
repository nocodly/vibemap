import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      githubToken: null,
      user: null,

      setGithubToken: (token) => set({ githubToken: token }),
      setUser: (user) => set({ user }),

      logout: () => {
        set({ githubToken: null, user: null })
      },

      isAuthenticated: () => !!get().githubToken,
    }),
    {
      name: 'vibemap-auth',
      partialize: (state) => ({
        githubToken: state.githubToken,
        user: state.user,
      }),
    }
  )
)
