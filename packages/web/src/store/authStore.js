import { create } from "zustand";
import api from "../lib/api";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data.data;
  },

  signup: async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    localStorage.setItem("accessToken", data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const { data } = await api.get("/auth/me");
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("accessToken");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
