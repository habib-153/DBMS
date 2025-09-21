import httpStatus from 'http-status';
import { PostStatus, VoteType, Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import { TCreatePost, TUpdatePost, TCreateComment } from './post.interface';
import prisma from '../../../shared/prisma';
import { postSearchableFields } from './post.constant';
import { TImageFile } from '../../interfaces/image.interface';
import { TUser } from '../User/user.interface';

const createPost = async (
  postData: TCreatePost,
  imageFile: TImageFile,
  authorId: string
) => {
  // Convert crimeDate string to Date
  const crimeDate = new Date(postData.crimeDate);

  const post = await prisma.post.create({
    data: {
      title: postData.title,
      description: postData.description,
      image: imageFile.path,
      location: postData.location,
      district: postData.district,
      division: postData.division,
      crimeDate: crimeDate,
      authorId: authorId,
      status: PostStatus.PENDING,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      votes: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
            },
          },
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
  });

  return post;
};

const getAllPosts = async (filters: Record<string, unknown>) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    searchTerm,
    ...filterData
  } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const andConditions: Prisma.PostWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: postSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  andConditions.push({
    isDeleted: false,
    status: {
      in: [PostStatus.APPROVED, PostStatus.PENDING],
    },
  });

  const whereConditions: Prisma.PostWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const posts = await prisma.post.findMany({
    where: whereConditions,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      votes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      comments: {
        where: {
          isDeleted: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
            },
          },
          votes: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
  });

  const total = await prisma.post.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data: posts,
  };
};

const getSinglePost = async (id: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      votes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      comments: {
        where: {
          isDeleted: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
            },
          },
          votes: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
  });

  if (!post || post.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  return post;
};

const updatePost = async (
  id: string,
  updateData: TUpdatePost,
  imageFile: TImageFile | undefined,
  userId: string
) => {
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post || post.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.authorId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only update your own posts'
    );
  }

  const updatePayload: Prisma.PostUpdateInput = { ...updateData };

  if (imageFile) {
    updatePayload.image = imageFile.path;
  }

  if (updateData.crimeDate) {
    updatePayload.crimeDate = new Date(updateData.crimeDate);
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data: updatePayload,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      votes: true,
      comments: true,
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
  });

  return updatedPost;
};

const deletePost = async (id: string, userId: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post || post.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.authorId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own posts'
    );
  }

  await prisma.post.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return { message: 'Post deleted successfully' };
};

// Upvote functionality
const addPostUpvote = async (postId: string, user: TUser) => {
  return await addPostVote(postId, user.id, VoteType.UP);
};

// Downvote functionality
const addPostDownvote = async (postId: string, user: TUser) => {
  return await addPostVote(postId, user.id, VoteType.DOWN);
};

// Remove upvote
const removePostUpvote = async (postId: string, user: TUser) => {
  const existingVote = await prisma.postVote.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId,
      },
    },
  });

  if (existingVote && existingVote.type === VoteType.UP) {
    await prisma.postVote.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });
    return { message: 'Upvote removed successfully' };
  }

  throw new AppError(httpStatus.BAD_REQUEST, 'No upvote found to remove');
};

// Remove downvote
const removePostDownvote = async (postId: string, user: TUser) => {
  const existingVote = await prisma.postVote.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId,
      },
    },
  });

  if (existingVote && existingVote.type === VoteType.DOWN) {
    await prisma.postVote.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });
    return { message: 'Downvote removed successfully' };
  }

  throw new AppError(httpStatus.BAD_REQUEST, 'No downvote found to remove');
};

// Generic vote function
const addPostVote = async (postId: string, userId: string, type: VoteType) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const existingVote = await prisma.postVote.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingVote) {
    if (existingVote.type === type) {
      // If same vote type, remove it
      await prisma.postVote.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return { message: 'Vote removed' };
    } else {
      // If different vote type, update it
      await prisma.postVote.update({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
        data: { type },
      });
      return { message: 'Vote updated' };
    }
  } else {
    // Create new vote
    await prisma.postVote.create({
      data: {
        userId,
        postId,
        type,
      },
    });
    return { message: 'Vote added' };
  }
};

const createComment = async (commentData: TCreateComment, authorId: string) => {
  const comment = await prisma.comment.create({
    data: {
      content: commentData.content,
      image: commentData.image,
      postId: commentData.postId,
      authorId: authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return comment;
};

const updateComment = async (
  id: string,
  updateData: Partial<TCreateComment>,
  userId: string
) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment || comment.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.authorId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only update your own comments'
    );
  }

  const updatedComment = await prisma.comment.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      votes: true,
    },
  });

  return updatedComment;
};

const deleteComment = async (id: string, userId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment || comment.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.authorId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own comments'
    );
  }

  await prisma.comment.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return { message: 'Comment deleted successfully' };
};

export const PostService = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  addPostUpvote,
  addPostDownvote,
  removePostUpvote,
  removePostDownvote,
  addPostVote,
  createComment,
  updateComment,
  deleteComment,
};
