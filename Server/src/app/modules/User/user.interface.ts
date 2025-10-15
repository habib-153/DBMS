export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED';

export interface TUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  role: UserRole;
  latitude?: number;
  longitude?: number;
  status: UserStatus;
  isVerified: boolean;
  otp?: string;
  needPasswordChange: boolean;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TUserFilterableFields {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  searchTerm?: string;
}

export interface TUserProfile extends TUser {
  followers: Array<{
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  }>;
  following: Array<{
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  }>;
  totalUpVotes: number;
  postCount: number;
}
