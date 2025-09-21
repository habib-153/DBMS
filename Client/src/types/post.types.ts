export interface IPost {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  district: string;
  division: string;
  postDate: Date;
  crimeDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isDeleted: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  votes: IPostVote[];
  comments: IComment[];
  _count: {
    votes: number;
    comments: number;
  };
}

export interface IPostVote {
  id: string;
  userId: string;
  postId: string;
  type: 'UP' | 'DOWN';
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}

export interface IComment {
  id: string;
  content: string;
  image?: string;
  postId: string;
  authorId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    profilePhoto?: string;
  };
  votes: ICommentVote[];
}

export interface ICommentVote {
  id: string;
  userId: string;
  commentId: string;
  type: 'UP' | 'DOWN';
  createdAt: Date;
}

export interface IPostsResponse {
  success: boolean;
  message: string;
  data: IPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}