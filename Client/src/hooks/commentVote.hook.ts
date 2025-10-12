import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addCommentUpvote,
  addCommentDownvote,
  removeCommentUpvote,
  removeCommentDownvote,
} from "@/src/services/CommentVoteService";

export const useAddCommentUpvote = (postId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["ADD_COMMENT_UPVOTE"],
    // accept optional userId to match calls from components
    mutationFn: async ({ commentId, userId }: { commentId: string; userId?: string }) => {
      return toast.promise(addCommentUpvote(commentId), {
        loading: "Upvoting comment...",
        success: "You upvoted the comment",
        error: "Failed to upvote comment",
      });
    },
    onMutate: async (variables: { commentId: string; userId?: string }) => {
      if (!postId) return null;

      await queryClient.cancelQueries({ queryKey: ["postComments", postId] });

      const previous = queryClient.getQueryData<any>(["postComments", postId]);

      // Optimistically update the comment's votes array
      queryClient.setQueryData(["postComments", postId], (old: any) => {
        if (!old || !old.data) return old;

        const updated = JSON.parse(JSON.stringify(old));

        updated.data = updated.data.map((c: any) => {
          if (c.id !== variables.commentId) return c;

          const votes = Array.isArray(c.votes) ? [...c.votes] : [];

          // remove any existing DOWN vote by this user
          if (variables.userId) {
            const filtered = votes.filter(
              (v: any) => v.userId !== variables.userId
            );

            // add UP vote
            filtered.push({ type: "UP", userId: variables.userId });

            return { ...c, votes: filtered };
          }

          return c;
        });

        return updated;
      });

      return { previous };
    },
    onError: (_err, _variables, context: any) => {
      if (!postId) return;
      if (context?.previous) {
        queryClient.setQueryData(["postComments", postId], context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.commentId && postId) {
        queryClient.refetchQueries({ queryKey: ["postComments", postId] });
        queryClient.refetchQueries({ queryKey: ["singlePost", postId] });
      }
    },
  });
};

export const useAddCommentDownvote = (postId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["ADD_COMMENT_DOWNVOTE"],
    // accept optional userId to match calls from components
    mutationFn: async ({ commentId, userId }: { commentId: string; userId?: string }) => {
      return toast.promise(addCommentDownvote(commentId), {
        loading: "Downvoting comment...",
        success: "You downvoted the comment",
        error: "Failed to downvote comment",
      });
    },
    onMutate: async (variables: { commentId: string; userId?: string }) => {
      if (!postId) return null;

      await queryClient.cancelQueries({ queryKey: ["postComments", postId] });

      const previous = queryClient.getQueryData<any>(["postComments", postId]);

      queryClient.setQueryData(["postComments", postId], (old: any) => {
        if (!old || !old.data) return old;

        const updated = JSON.parse(JSON.stringify(old));

        updated.data = updated.data.map((c: any) => {
          if (c.id !== variables.commentId) return c;

          const votes = Array.isArray(c.votes) ? [...c.votes] : [];

          // remove any existing UP vote by this user
          if (variables.userId) {
            const filtered = votes.filter(
              (v: any) => v.userId !== variables.userId
            );

            // add DOWN vote
            filtered.push({ type: "DOWN", userId: variables.userId });

            return { ...c, votes: filtered };
          }

          return c;
        });

        return updated;
      });

      return { previous };
    },
    onError: (_err, _variables, context: any) => {
      if (!postId) return;
      if (context?.previous) {
        queryClient.setQueryData(["postComments", postId], context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.commentId && postId) {
        queryClient.refetchQueries({ queryKey: ["postComments", postId] });
        queryClient.refetchQueries({ queryKey: ["singlePost", postId] });
      }
    },
  });
};

export const useRemoveCommentUpvote = (postId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["REMOVE_COMMENT_UPVOTE"],
    // accept optional userId to match calls from components
    mutationFn: async ({ commentId, userId }: { commentId: string; userId?: string }) => {
      return toast.promise(removeCommentUpvote(commentId), {
        loading: "Removing upvote...",
        success: "Removed upvote",
        error: "Failed to remove upvote",
      });
    },
    onMutate: async (variables: { commentId: string; userId?: string }) => {
      if (!postId) return null;

      await queryClient.cancelQueries({ queryKey: ["postComments", postId] });

      const previous = queryClient.getQueryData<any>(["postComments", postId]);

      queryClient.setQueryData(["postComments", postId], (old: any) => {
        if (!old || !old.data) return old;

        const updated = JSON.parse(JSON.stringify(old));

        updated.data = updated.data.map((c: any) => {
          if (c.id !== variables.commentId) return c;

          const votes = Array.isArray(c.votes) ? [...c.votes] : [];

          if (variables.userId) {
            const filtered = votes.filter(
              (v: any) => v.userId !== variables.userId
            );

            return { ...c, votes: filtered };
          }

          return c;
        });

        return updated;
      });

      return { previous };
    },
    onError: (_err, _variables, context: any) => {
      if (!postId) return;
      if (context?.previous) {
        queryClient.setQueryData(["postComments", postId], context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.commentId && postId) {
        queryClient.refetchQueries({ queryKey: ["postComments", postId] });
        queryClient.refetchQueries({ queryKey: ["singlePost", postId] });
      }
    },
  });
};

export const useRemoveCommentDownvote = (postId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["REMOVE_COMMENT_DOWNVOTE"],
    // accept optional userId to match calls from components
    mutationFn: async ({ commentId, userId }: { commentId: string; userId?: string }) => {
      return toast.promise(removeCommentDownvote(commentId), {
        loading: "Removing downvote...",
        success: "Removed downvote",
        error: "Failed to remove downvote",
      });
    },
    onMutate: async (variables: { commentId: string; userId?: string }) => {
      if (!postId) return null;

      await queryClient.cancelQueries({ queryKey: ["postComments", postId] });

      const previous = queryClient.getQueryData<any>(["postComments", postId]);

      queryClient.setQueryData(["postComments", postId], (old: any) => {
        if (!old || !old.data) return old;

        const updated = JSON.parse(JSON.stringify(old));

        updated.data = updated.data.map((c: any) => {
          if (c.id !== variables.commentId) return c;

          const votes = Array.isArray(c.votes) ? [...c.votes] : [];

          if (variables.userId) {
            const filtered = votes.filter(
              (v: any) => v.userId !== variables.userId
            );

            return { ...c, votes: filtered };
          }

          return c;
        });

        return updated;
      });

      return { previous };
    },
    onError: (_err, _variables, context: any) => {
      if (!postId) return;
      if (context?.previous) {
        queryClient.setQueryData(["postComments", postId], context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.commentId && postId) {
        queryClient.refetchQueries({ queryKey: ["postComments", postId] });
        queryClient.refetchQueries({ queryKey: ["singlePost", postId] });
      }
    },
  });
};

export default {
  useAddCommentUpvote,
  useAddCommentDownvote,
  useRemoveCommentUpvote,
  useRemoveCommentDownvote,
};
