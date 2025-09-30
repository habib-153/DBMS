import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { postAComment, getPostComments } from "@/src/services/CommentServices";

export const usePostAComment = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { postId: string; content: string }>({
    mutationKey: ["POST_COMMENT"],
    mutationFn: async (payload: { postId: string; content: string }) => {
      return postAComment(payload);
    },
    onSuccess: (_data, variables) => {
      toast.success("Comment posted successfully");
      // Invalidate the singlePost query for this post id so comments and counts refresh
      if (variables?.postId) {
        queryClient.invalidateQueries({
          queryKey: ["singlePost", variables.postId],
        });
        // Also refresh the comments list
        queryClient.invalidateQueries({
          queryKey: ["postComments", variables.postId],
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

export const useGetPostComments = (postId: string) => {
  return useQuery({
    queryKey: ["postComments", postId],
    queryFn: async () => await getPostComments(postId),
    enabled: !!postId,
  });
};

export default { usePostAComment, useGetPostComments };
