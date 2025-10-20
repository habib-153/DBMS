"use server";

import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";
import { jwtDecode } from "jwt-decode";

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
    // Extract meaningful error message safely
    let errorMessage = "Registration failed";

    try {
      if (error?.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      } else if (error?.response?.data?.errorSources?.[0]?.message) {
        errorMessage = String(error.response.data.errorSources[0].message);
      } else if (error?.message) {
        errorMessage = String(error.message);
      }
    } catch (e) {
      // If any parsing fails, use default message
      errorMessage = "Registration failed";
    }

    // Create a proper Error object with just the message (no circular references)
    const cleanError = new Error(errorMessage);
    (cleanError as any).statusCode = error?.response?.status;
    (cleanError as any).responseMessage = errorMessage;

    throw cleanError;
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
    // Extract meaningful error message safely
    let errorMessage = "Login failed";

    try {
      if (error?.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      } else if (error?.response?.data?.errorSources?.[0]?.message) {
        errorMessage = String(error.response.data.errorSources[0].message);
      } else if (error?.message) {
        errorMessage = String(error.message);
      }
    } catch (e) {
      // If any parsing fails, use default message
      errorMessage = "Login failed";
    }

    // Create a proper Error object with just the message (no circular references)
    const cleanError = new Error(errorMessage);
    // Attach response data in a serializable way
    (cleanError as any).statusCode = error?.response?.status;
    (cleanError as any).responseMessage = errorMessage;

    throw cleanError;
  }
};

export const sendOTP = async (payload: { email: string }) => {
  try {
    const { data } = await axiosInstance.post("/auth/send-otp", payload);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Failed to send OTP";

    throw new Error(errorMessage);
  }
};

export const verifyOTP = async (payload: { email: string; otp: string }) => {
  try {
    const { data } = await axiosInstance.post("/auth/verify-otp", payload, {
      withCredentials: true,
    });

    // If tokens returned, set cookies server-side will set refreshToken; also set accessToken cookie client-side
    if (data?.data?.accessToken) {
      cookies().set("accessToken", data.data.accessToken);
    }

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to verify OTP";

    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    // Call backend to mark session as inactive
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    // Continue with logout even if backend call fails
    console.error("Error logging out on server:", error);
  }

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
