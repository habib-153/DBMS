"use server";

import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import { revalidateTag } from "next/cache";

import axiosInstance from "@/src/libs/AxiosInstance";
import envConfig from "@/src/config/envConfig";

export const registerUser = async (userData: FieldValues) => {
  try {
    const { data } = await axiosInstance.post("/auth/register", userData);
    //console.log("Data from registerUser: ", data);

    if (data.success) {
      cookies().set("accessToken", data?.data?.accessToken);
      cookies().set("refreshToken", data?.data?.refreshToken);
    }

    return data;
  } catch (error: any) {
    // Extract meaningful error message
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.errorSources?.[0]?.message ||
      error?.message ||
      "Registration failed";

    throw new Error(errorMessage);
  }
};

export const loginUser = async (userData: FieldValues) => {
  try {
    const { data } = await axiosInstance.post("/auth/login", userData);

    if (data.success) {
      cookies().set("accessToken", data?.data?.accessToken);
      cookies().set("refreshToken", data?.data?.refreshToken);
    }

    return data;
  } catch (error: any) {
    // Extract meaningful error message
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.errorSources?.[0]?.message ||
      error?.message ||
      "Login failed";

    throw new Error(errorMessage);
  }
};

export const logout = () => {
  cookies().delete("accessToken");
  cookies().delete("refreshToken");
};

export const getCurrentUser = async () => {
  const accessToken = cookies().get("accessToken")?.value;

  let decodedToken = null;

  if (accessToken) {
    decodedToken = await jwtDecode(accessToken);

    return {
      id: decodedToken.id || decodedToken._id,
      name: decodedToken.name,
      email: decodedToken.email,
      phone: decodedToken.phone || decodedToken.phone,
      role: decodedToken.role,
      status: decodedToken.status,
      profilePhoto: decodedToken.profilePhoto,
    };
  }

  return decodedToken;
};

export const getNewAccessToken = async () => {
  try {
    const refreshToken = cookies().get("refreshToken")?.value;

    const res = await axiosInstance({
      url: "/auth/refresh-token",
      method: "POST",
      withCredentials: true,
      headers: {
        cookie: `refreshToken=${refreshToken}`,
      },
    });

    return res.data;
  } catch (error) {
    throw new Error("Failed to get new access token");
  }
};

export const getMyProfile = async () => {
  const res = await axiosInstance.get(`/profile`);

  return res.data;
};

export const getVerified = async (payload: any) => {
  try {
    const { data } = await axiosInstance.put("/users/get-verified", payload);

    revalidateTag("posts");

    return data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const updateUser = async (payload: FormData) => {
  try {
    const { data } = await axiosInstance.patch(`/profile`, payload);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const forgotPassword = async (payload: { email: string }) => {
  try {
    const response = await fetch(`${envConfig.baseApi}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return result;
  } catch (error: any) {
    throw error;
  }
};

export const resetPassword = async (
  userData: {
    email: string;
    newPassword: string;
  },
  token: string
) => {
  try {
    const response = await fetch(`${envConfig.baseApi}/auth/reset-password`, {
      method: "POST",
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        result?.errorSources?.[0]?.message ||
        "Failed to reset password";

      throw new Error(errorMessage);
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to reset password");
  }
};

export const changePassword = async (userData: {
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await fetch(`${envConfig.baseApi}/auth/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookies().get("accessToken")?.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        result?.errorSources?.[0]?.message ||
        "Failed to change password";

      throw new Error(errorMessage);
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to change password");
  }
};
