import axiosInstance from "@/src/libs/AxiosInstance";

export const postAComment = async (payload: any) => {
  try {
    // Check if payload is FormData (for image uploads)
    const isFormData = payload instanceof FormData;

    return (
      await axiosInstance.post(`/comments`, payload, {
        headers: isFormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : undefined,
      })
    ).data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to post comment";

    throw new Error(errorMessage);
  }
};

export const getPostComments = async (postId: string) => {
  try {
    const { data } = await axiosInstance.get(`/posts/${postId}/comments`);

    return data;
  } catch (error: any) {
    throw error;
  }
};

export const updateComment = async (commentId: string, payload: any) => {
  try {
    const isFormData = payload instanceof FormData;

    return (
      await axiosInstance.patch(`/comments/${commentId}`, payload, {
        headers: isFormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : undefined,
      })
    ).data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update comment";

    throw new Error(errorMessage);
  }
};

export const deleteComment = async (commentId: string) => {
  try {
    return (await axiosInstance.delete(`/comments/${commentId}`)).data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete comment";

    throw new Error(errorMessage);
  }
};

export default { postAComment, getPostComments, updateComment, deleteComment };
