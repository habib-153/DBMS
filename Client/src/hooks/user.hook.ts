import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { IUser } from "../types";
import { getVerified, updateUser } from "../services/AuthService";
import { useUser } from "../context/user.provider";
import { updateAccessTokenInCookies } from "../utils/updateAccessToken";
import { deleteUser, followUser, getAllUsers, getSingleUser, unFollowUser, updateUserRole } from "../services/UserService";

export const useGetAllUsers = (query?: string) => {
  const { data, refetch, isLoading } = useQuery({
    queryKey: query ? ["users", query] : ["users"],
    queryFn: async () => await getAllUsers(query || ""),
    refetchInterval: 2000,
  });

  return { data, refetch, isLoading };
};

export const useGetSingleUser = (id: string) => {
  return useQuery({
    queryKey: ["singleUser", id],
    queryFn: async () => await getSingleUser(id),
    enabled: !!id, 
    refetchInterval: 2000,
  });
};

export const useGetVerified = (onSuccessCallback: any) => {
  return useMutation<any, Error, Partial<IUser>>({
    mutationKey: ["UPDATE_USER"],
    mutationFn: async (payload) => {
      const response = await getVerified(payload);

      return response;
    },
    onSuccess: (data) => {
      onSuccessCallback(data);
    },
    onError: (error) => {
      toast.error("Error when giving payment: " + error.message);
    },
  });
};

export const useFollowUser = () => {
  return useMutation<any, Error, { id: string; name: string }>({
    mutationKey: ["FOLLOW_USER"],
    mutationFn: async ({ id, name }) => {
      return toast.promise(followUser(id), {
        loading: "Following user...",
        success: `You followed ${name}!`,
        error: "Error when following this user.",
      });
    },
  });
};

export const useUnfollowUser = () => {
  return useMutation<any, Error, { id: string; name: string }>({
    mutationKey: ["UNFOLLOW_USER"],
    mutationFn: async ({ id, name }) => {
      return toast.promise(unFollowUser(id), {
        loading: "UnFollowing user...",
        success: `You unFollowed ${name}!`,
        error: "Error when following user.",
      });
    },
  });
};

export const useUpdateUser = () => {
  const { updateProfile } = useUser();

  return useMutation<any, Error, FormData>({
    mutationKey: ["UPDATE_USER"],
    mutationFn: async (userData) => await updateUser(userData),
    onSuccess: (_data) => {
      toast.success("Profile updated successfully!");
      // console.log(_data?.data)
      updateProfile(_data?.data);
      updateAccessTokenInCookies(_data?.data);
      // }
    },
    onError: (error) => {
      toast.error(`Failed to update profile ${error?.message}`);
    },
  });
};

export const useUpdateUserRole = () => {
  return useMutation<any, Error, { payload : any; id: string }>({
    mutationKey: ["UPDATE_USER_ROLE"],
    mutationFn: async ({ payload, id }) => {
      return toast.promise(updateUserRole(id, payload), {
        loading: "Updating User Role...",
        success: "User Role updated successfully!",
        error: "Error when updating the user role.",
      });
    },
  });
};

export const useDeleteUser = () => {
  return useMutation<any, Error, { id: string }>({
    mutationKey: ["DELETE_USER"],
    mutationFn: async ({ id }) => {
      return toast.promise(deleteUser(id), {
        loading: "Deleting User...",
        success: "User deleted successfully!",
        error: "Error when deleting user.",
      });
    },
  });
};