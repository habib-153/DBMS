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
            // @ts-ignore
            config.headers["Authorization"] = accessToken.startsWith("Bearer ")
              ? accessToken
              : `Bearer ${accessToken}`;
          }
        } catch (e) {
          // dynamic import failed; ignore
        }
      } else {
        // Client-side: we rely on cookies being sent (withCredentials=true)
        // to allow server middleware to read token from http-only cookie.
        // Do not attempt to read httpOnly cookie from document.cookie.
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

export default axiosInstance;
