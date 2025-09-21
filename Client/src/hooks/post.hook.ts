import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { addDownvote, addUpvote, createPost, deletePost, getAllPosts, getSinglePost, removeDownvote, removeUpvote, updatePost } from "../services/PostServices";


export const useCreatePost = () => {
  return useMutation<any, Error, FormData>({
    mutationKey: ["CREATE_POST"],
    mutationFn: async (postData) => await createPost(postData),
    onSuccess: () => {
      toast.success("Post created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useGetAllPosts = (apiUrl: string) => {
  return useQuery({
    queryKey: [apiUrl],
    queryFn: async () => await getAllPosts(apiUrl),
  });
};

export const useGetSinglePost = (id: string) => {
  return useQuery({
    queryKey: ["singlePost", id],
    queryFn: async () => await getSinglePost(id),
    enabled: !!id,
    refetchInterval: 1500,
  });
};

export const useAddUpVotePost = () => {
  return useMutation<any, Error, { id: string }>({
    mutationKey: ["ADD_UPVOTE_POST"],
    mutationFn: async ({ id }) => {
      return toast.promise(addUpvote(id), {
        loading: "UpVoting post...",
        success: `You upVoted this post!`,
        error: "Error when upVoting post.",
      });
    },
  });
};

export const useRemoveUpVoteFromPost = () => {
  return useMutation<any, Error, { id: string }>({
    mutationKey: ["REMOVE_UPVOTE_POST"],
    mutationFn: async ({ id }) => {
      return toast.promise(removeUpvote(id), {
        loading: "Removing upvote post...",
        success: `You remove upVote from this post!`,
        error: "Error when upVoting post.",
      });
    },
  });
};

export const useAddDownVotePost = () => {
  return useMutation<any, Error, { id: string }>({
    mutationKey: ["ADD_DOWNVOTE_POST"],
    mutationFn: async ({ id }) => {
      return toast.promise(addDownvote(id), {
        loading: "DownVoting post...",
        success: `You downVoted this post!`,
        error: "Error when downVoting post.",
      });
    },
  });
};

export const useRemoveDownVoteFromPost = () => {
  return useMutation<any, Error, { id: string }>({
    mutationKey: ["REMOVE_UPVOTE_POST"],
    mutationFn: async ({ id }) => {
      return toast.promise(removeDownvote(id), {
        loading: "Removing downvote post...",
        success: `You removed downvote from this post!`,
        error: "Error when downVoting post.",
      });
    },
  });
};

export const useUpdatePost = () => {
  return useMutation<any, Error, { postData: FormData; id: string }>({
    mutationKey: ["UPDATE_POST"],
    mutationFn: async ({ postData, id }) => {
      return toast.promise(updatePost(postData, id), {
        loading: "Updating Post...",
        success: "Post updated successfully!",
        error: "Error when updating Post.",
      });
    },
  });
};

export const useDeletePost = () => {
  return useMutation<any, Error, { id: string }>({
    mutationKey: ["DELETE_POST"],
    mutationFn: async ({ id }) => {
      return toast.promise(deletePost(id), {
        loading: "Deleting Post...",
        success: "Post deleted successfully!",
        error: "Error when deleting post.",
      });
    },
  });
};

// export const usePostAComment = () => {
//   return useMutation<any, Error, IComment>({
//     mutationKey: ["CREATE_COMMENT"],
//     mutationFn: async (commentData) => {
//       return toast.promise(postAComment(commentData), {
//         loading: "Posting comment...",
//         success: "You added a new comment!",
//         error: "Something went wrong!",
//       });
//     },
//   });
// };

// export const useGetPostAllComments = (postId: string) => {
//   return useQuery({
//     queryKey: [postId],
//     queryFn: async () => await getPostAllComments(postId),
//     enabled: !!postId,
//     refetchInterval: 1000,
//   });
// };

// export const useUpdateComment = () => {
//   return useMutation<
//     any,
//     Error,
//     { id: string; updatedComment: Partial<IComment> }
//   >({
//     mutationKey: ["UPDATE_COMMENT"],
//     mutationFn: async ({ id, updatedComment }) => {
//       return toast.promise(updateComment(id, updatedComment), {
//         loading: "Updating comment...",
//         success: "Comment updated successfully!",
//         error: "Error when updating comment.",
//       });
//     },
//   });
// };

// export const useDeleteComment = () => {
//   return useMutation<any, Error, { id: string }>({
//     mutationKey: ["DELETE_COMMENT"],
//     mutationFn: async ({ id }) => {
//       return toast.promise(deleteComment(id), {
//         loading: "Deleting comment...",
//         success: "Comment deleted successfully!",
//         error: "Error when deleting comment.",
//       });
//     },
//   });
// };