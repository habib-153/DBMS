// Database result types
export interface DbUser extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  isVerified: boolean;
  otp?: string;
  needPasswordChange: boolean;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbPost extends Record<string, unknown> {
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
}

export interface DbPostVote extends Record<string, unknown> {
  id: string;
  userId: string;
  postId: string;
  type: 'UP' | 'DOWN';
  createdAt: Date;
}

export interface DbComment extends Record<string, unknown> {
  id: string;
  content: string;
  image?: string;
  postId: string;
  authorId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbCommentVote extends Record<string, unknown> {
  id: string;
  userId: string;
  commentId: string;
  type: 'UP' | 'DOWN';
  createdAt: Date;
}

export interface DbFollow extends Record<string, unknown> {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

// Extended types with relations
export interface DbPostWithAuthor extends DbPost {
  authorName: string;
  authorEmail: string;
  authorProfilePhoto?: string;
  voteCount?: number;
  commentCount?: number;
  upVotes?: number;
  downVotes?: number;
}

export interface DbPostWithDetails extends DbPostWithAuthor {
  votes?: DbPostVote[];
  comments?: DbComment[];
}

// Pagination result type
export interface PaginatedResult<T> {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: T[];
}
