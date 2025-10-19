import axios from "axios";

import envConfig from "@/src/config/envConfig";

const axiosInstance = axios.create({
  baseURL: envConfig.baseApi,
  // send cookies (httpOnly) with cross-site requests
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async function (config) {
    try {
      // Server-side (Next.js) - dynamically import next/headers only on server
      if (typeof window === "undefined") {
        try {
          const nh = await import("next/headers");
          const cookieStore = nh.cookies();
          const accessToken = cookieStore.get("accessToken")?.value;

          if (accessToken) {
            config.headers = config.headers || {};
            // Ensure Bearer prefix so server can parse uniformly
            config.headers["Authorization"] = accessToken.startsWith("Bearer ")
              ? accessToken
              : `Bearer ${accessToken}`;
          }
        } catch (e) {
          // dynamic import failed; ignore
        }
      } else {
        // Client-side: Try to get accessToken from localStorage as fallback
        // (cookies should be sent automatically via withCredentials)
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
          config.headers = config.headers || {};
          config.headers["Authorization"] = accessToken.startsWith("Bearer ")
            ? accessToken
            : `Bearer ${accessToken}`;
        }
      }
    } catch (e) {
      // ignore and continue
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const { data } = await axiosInstance.post("/auth/refresh-token");

        if (data?.data?.accessToken) {
          // Store new access token
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", data.data.accessToken);
          }

          // Retry the original request with new token
          originalRequest.headers["Authorization"] =
            data.data.accessToken.startsWith("Bearer ")
              ? data.data.accessToken
              : `Bearer ${data.data.accessToken}`;

          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
