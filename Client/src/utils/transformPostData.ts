import { IPost } from "@/src/types/post.types";

// Transform flat backend response to nested frontend structure
export const transformPostData = (backendPost: any): IPost => {
  return {
    ...backendPost,
    // Transform flat author fields to nested author object
    author: {
      id: backendPost.authorId,
      name: backendPost.authorName,
      email: backendPost.authorEmail,
      profilePhoto: backendPost.authorProfilePhoto,
    },
    // Ensure vote counts are numbers
    upVotes: parseInt(backendPost.upVotes) || 0,
    downVotes: parseInt(backendPost.downVotes) || 0,
    commentCount: parseInt(backendPost.commentCount) || 0,
    // Transform votes array if needed
    votes: backendPost.votes || [],
    // Clean up flat author fields to avoid confusion
    authorId: undefined,
    authorName: undefined,
    authorEmail: undefined,
    authorProfilePhoto: undefined,
  } as IPost;
};

// Transform array of posts
export const transformPostsData = (backendPosts: any[]): IPost[] => {
  return backendPosts.map(transformPostData);
};
