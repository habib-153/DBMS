"use server";

import { revalidateTag } from "next/cache";

import axiosInstance from "@/src/libs/AxiosInstance";

export const getAllUsers = async (query?: string) => {
  try {
    const { data } = await axiosInstance.get(`/users?${query}`);

    return data;
  } catch (error) {
    throw error;
  }
};

export const getSingleUser = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/users/${id}`);

    return res.data;
  } catch (error) {
    throw error;
  }
};


export const updateUserRole = async (id: string, payload: any) => {
  try {
    const { data } = await axiosInstance.put(`/users/${id}`, payload);

    revalidateTag("users");

    return data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const deleteUser = async (id: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.delete(`/users/${id}`);

    revalidateTag("users");

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const followUser = async (followedId: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.post(`/users/follow/${followedId}`);

    revalidateTag("follow");
    revalidateTag('users');
    revalidateTag("posts");

    return data.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const unFollowUser = async (followedId: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.delete(
      `/users/unfollow/${followedId}`
    );

    revalidateTag("follow");
    revalidateTag("posts");

    return data.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};
