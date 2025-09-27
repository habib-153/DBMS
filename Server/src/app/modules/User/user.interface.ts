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
