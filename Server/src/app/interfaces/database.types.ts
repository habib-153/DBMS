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

export interface DbDivision extends Record<string, unknown> {
  id: number;
  name: string;
  bn_name?: string;
  url?: string;
}

export interface DbDistrict extends Record<string, unknown> {
  id: number;
  division_id: number;
  name: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  url?: string;
}

export interface DbDistrictWithDivision extends DbDistrict {
  divisionName?: string;
  divisionBnName?: string;
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
  verificationScore: number;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbPostReport extends Record<string, unknown> {
  id: string;
  postId: string;
  userId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
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
  parentId?: string;
  authorId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: DbComment[];
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
  reports?: DbPostReport[];
}

export interface DbPostReportWithUser extends DbPostReport {
  userName: string;
  userEmail: string;
  userProfilePhoto?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  postTitle?: string;
  postVerificationScore?: number;
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
