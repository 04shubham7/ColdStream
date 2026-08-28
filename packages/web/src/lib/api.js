import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import toast from "react-hot-toast";

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post("/api/v1/auth/refresh", null, {
          withCredentials: true,
        });

        const newToken = data.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Global error toasts
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || "An unexpected error occurred.";

      if (status === 429) {
        toast.error("Too many requests. Please try again later.", { id: "429" });
      } else if (status === 400) {
        toast.error(message, { id: "400" });
      } else if (status === 403) {
        toast.error("You don't have permission to do this.", { id: "403" });
      } else if (status >= 500) {
        toast.error("Server error. We're working on it!", { id: "500" });
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.", { id: "network" });
    }

    return Promise.reject(error);
  }
);

export default api;
