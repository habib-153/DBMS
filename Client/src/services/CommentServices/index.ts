import axiosInstance from "@/src/libs/AxiosInstance";

export const postAComment = async (payload: {
  postId: string;
  content: string;
  image?: string | null;
}) => {
  try {
    return (await axiosInstance.post(`/comments`, payload)).data;
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

export default { postAComment, getPostComments };
