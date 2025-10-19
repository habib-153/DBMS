import { FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getMyProfile, loginUser, registerUser } from "../services/AuthService";
import { setTokens } from "../utils/tokenStorage";

export const useUserRegistration = () => {
  return useMutation<any, Error, FieldValues>({
    mutationKey: ["USER_REGISTRATION"],
    mutationFn: async (userData) => await registerUser(userData),
    onSuccess: (data) => {
      toast.success("User registration successful.");
      // Store tokens in localStorage for client-side access
      if (data?.data?.accessToken) {
        setTokens(data.data.accessToken, data.data.refreshToken);
      }
    },
    onError: (error) => {
      // More specific error handling
      const errorMessage =
        error.message || "Registration failed. Please try again.";

      toast.error(errorMessage);
    },
  });
};

export const useUserLogin = () => {
  return useMutation<any, Error, FieldValues>({
    mutationKey: ["USER_LOGIN"],
    mutationFn: async (userData) => await loginUser(userData),
    onSuccess: (data) => {
      toast.success("User login successful.");
      // Store tokens in localStorage for client-side access
      if (data?.data?.accessToken) {
        setTokens(data.data.accessToken, data.data.refreshToken);
      }
    },
    onError: (error) => {
      // More specific error handling
      const errorMessage =
        error.message || "Login failed. Please check your credentials.";

      toast.error(errorMessage);
    },
  });
};

export const useGetMyProfile = () => {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => await getMyProfile(),
  });
};
