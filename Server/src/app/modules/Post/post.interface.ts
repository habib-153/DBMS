export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CrimeCategory =
  | 'MURDER'
  | 'THEFT'
  | 'PICKPOCKET'
  | 'BURGLARY'
  | 'DACOITY'
  | 'ASSAULT'
  | 'FRAUD'
  | 'VANDALISM'
  | 'KIDNAPPING'
  | 'OTHERS';

export interface TPost {
  id: string;
  title: string;
  description: string;
  location: string;
  district: string;
  division: string;
  crimeDate: Date;
  category?: CrimeCategory;
  image?: string;
  video?: string;
  authorId: string;
  status: PostStatus;
  isDeleted: boolean;
  aiVerificationScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TCreatePost {
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  district: string;
  division: string;
  crimeDate: string; // Will be converted to Date
  category?: CrimeCategory;
}

export interface TUpdatePost {
  title?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  division?: string;
  crimeDate?: string;
  category?: CrimeCategory;
  status?: PostStatus;
}

export interface TPostFilterableFields {
  title?: string;
  location?: string;
  district?: string;
  division?: string;
  status?: PostStatus;
  category?: CrimeCategory;
  authorId?: string;
  searchTerm?: string;
}

export interface TReportPost {
  reason: string;
  description?: string;
}
