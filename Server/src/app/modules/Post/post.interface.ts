export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TPost {
  id: string;
  title: string;
  description: string;
  location: string;
  district: string;
  division: string;
  crimeDate: Date;
  image?: string;
  authorId: string;
  status: PostStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TCreatePost {
  title: string;
  description: string;
  location: string;
  district: string;
  division: string;
  crimeDate: string; // Will be converted to Date
}

export interface TUpdatePost {
  title?: string;
  description?: string;
  location?: string;
  district?: string;
  division?: string;
  crimeDate?: string;
  status?: PostStatus;
}

export interface TComment {
  id: string;
  content: string;
  image?: string;
  postId: string;
  authorId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TCreateComment {
  content: string;
  image?: string;
  postId: string;
}

export interface TPostFilterableFields {
  title?: string;
  location?: string;
  district?: string;
  division?: string;
  status?: PostStatus;
  authorId?: string;
  searchTerm?: string;
}
