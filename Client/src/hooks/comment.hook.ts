import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  postAComment,
  getPostComments,
  updateComment,
  deleteComment,
} from "@/src/services/CommentServices";

export const usePostAComment = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationKey: ["POST_COMMENT"],
    mutationFn: async (payload: any) => {
      return postAComment(payload);
    },
    onSuccess: (_data, variables) => {
      toast.success("Comment posted successfully");
      // Extract postId from FormData or object
      const postId =
        variables instanceof FormData
          ? variables.get("postId")
          : variables?.postId;

      // Invalidate the singlePost query for this post id so comments and counts refresh
      if (postId) {
        queryClient.invalidateQueries({
          queryKey: ["singlePost", postId],
        });
        // Also refresh the comments list
        queryClient.invalidateQueries({
          queryKey: ["postComments", postId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["singlePost"] });
        queryClient.invalidateQueries({ queryKey: ["postComments"] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { commentId: string; payload: any; postId: string }
  >({
    mutationKey: ["UPDATE_COMMENT"],
    mutationFn: async ({ commentId, payload }) => {
      return updateComment(commentId, payload);
    },
    onSuccess: (_data, variables) => {
      toast.success("Comment updated successfully");
      if (variables.postId) {
        queryClient.invalidateQueries({
          queryKey: ["singlePost", variables.postId],
        });
        queryClient.invalidateQueries({
          queryKey: ["postComments", variables.postId],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { commentId: string; postId: string }>({
    mutationKey: ["DELETE_COMMENT"],
    mutationFn: async ({ commentId }) => {
      return deleteComment(commentId);
    },
    onSuccess: (_data, variables) => {
      toast.success("Comment deleted successfully");
      if (variables.postId) {
        queryClient.invalidateQueries({
          queryKey: ["singlePost", variables.postId],
        });
        queryClient.invalidateQueries({
          queryKey: ["postComments", variables.postId],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useGetPostComments = (postId: string) => {
  return useQuery({
    queryKey: ["postComments", postId],
    queryFn: async () => await getPostComments(postId),
    enabled: !!postId,
  });
};

export default {
  usePostAComment,
  useGetPostComments,
  useUpdateComment,
  useDeleteComment,
};
