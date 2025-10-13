import axiosInstance from "@/src/libs/AxiosInstance";
import { getCurrentUser } from "../AuthService";

export const createPost = async (formData: FormData): Promise<any> => {
  try {
    const { data } = await axiosInstance.post("/posts/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error: any) {
    // Prefer structured server validation messages when available
    const resp = error?.response?.data;
    let errorMessage = "Failed to create post";

    if (resp) {
      if (Array.isArray(resp.errorSources) && resp.errorSources.length > 0) {
        try {
          errorMessage = resp.errorSources.map((s: any) => s.message).join("; ");
        } catch (e) {
          errorMessage = resp.message || JSON.stringify(resp);
        }
      } else if (resp.message) {
        errorMessage = resp.message;
      } else {
        errorMessage = JSON.stringify(resp);
      }
    } else {
      errorMessage = error?.message || errorMessage;
    }

    // surface the full response on console for debugging
    // eslint-disable-next-line no-console
    console.error("createPost error:", error?.response ?? error);

    throw new Error(errorMessage);
  }
};

export const getAllPosts = async (apiUrl: string) => {
  try {
    // Extract the path from the full URL since axiosInstance has baseURL configured
    const url = new URL(apiUrl);
    const pathWithQuery = url.pathname.replace("/api/v1", "") + url.search;

    const { data } = await axiosInstance.get(pathWithQuery);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.errorSources?.[0]?.message ||
      error?.message ||
      "Failed to fetch posts";

    throw new Error(errorMessage);
  }
};

export const getMyPosts = async () => {
  const user = await getCurrentUser();

  const res = await axiosInstance.get(`/posts/user/${user?.id}`);

  return res.data;
};

export const addUpvote = async (postId: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.post(`/posts/${postId}/upvote`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const removeUpvote = async (postId: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.delete(`/posts/${postId}/upvote`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const addDownvote = async (postId: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.post(`/posts/${postId}/downvote`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const removeDownvote = async (postId: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.delete(`/posts/${postId}/downvote`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const getSinglePost = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/posts/${id}`);

    return res.data;
  } catch (error) {
    //console.error("Error fetching post:", error);
    throw error;
  }
};

export const updatePost = async (payload: FormData, id: string) => {
  try {
    const { data } = await axiosInstance.patch(`/posts/${id}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.errorSources?.[0]?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const deletePost = async (id: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.delete(`/posts/${id}`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error occurred";

    throw new Error(errorMessage);
  }
};

export const reportPost = async (
  postId: string,
  reportData: { reason: string; description?: string }
): Promise<any> => {
  try {
    const { data } = await axiosInstance.post(
      `/posts/${postId}/report`,
      reportData
    );

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to report post";

    throw new Error(errorMessage);
  }
};

export const getPostReports = async (postId: string): Promise<any> => {
  try {
    const { data } = await axiosInstance.get(`/posts/${postId}/reports`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch post reports";

    throw new Error(errorMessage);
  }
};
