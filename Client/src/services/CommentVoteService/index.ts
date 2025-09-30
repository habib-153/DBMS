import axiosInstance from "@/src/libs/AxiosInstance";

export const addCommentUpvote = async (commentId: string) => {
  try {
    const { data } = await axiosInstance.post(`/comments/${commentId}/upvote`);

    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to upvote comment";

    throw new Error(message);
  }
};

export const addCommentDownvote = async (commentId: string) => {
  try {
    const { data } = await axiosInstance.post(
      `/comments/${commentId}/downvote`
    );

    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to downvote comment";

    throw new Error(message);
  }
};

export const removeCommentUpvote = async (commentId: string) => {
  try {
    const { data } = await axiosInstance.delete(
      `/comments/${commentId}/upvote`
    );

    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to remove upvote from comment";

    throw new Error(message);
  }
};

export const removeCommentDownvote = async (commentId: string) => {
  try {
    const { data } = await axiosInstance.delete(
      `/comments/${commentId}/downvote`
    );

    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to remove downvote from comment";

    throw new Error(message);
  }
};

export default {
  addCommentUpvote,
  addCommentDownvote,
  removeCommentUpvote,
  removeCommentDownvote,
};
