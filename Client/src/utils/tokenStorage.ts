"use client";

// Client-side token storage utilities
export const setAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }

  return null;
};

export const removeAccessToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
};

export const setTokens = (accessToken: string, refreshToken?: string) => {
  setAccessToken(accessToken);
  if (refreshToken && typeof window !== "undefined") {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};
