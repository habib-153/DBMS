const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type TLoginUser = {
  email: string;
  password: string;
};

export type TRegisterUser = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: keyof typeof UserRole;
  address?: string;
  profilePhoto?: string;
};

export interface TAuthUser {
  id: string;
  name: string;
  email: string;
  role: keyof typeof UserRole;
  phone: string;
  isVerified: boolean;
}

export interface TChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface TResetPassword {
  email: string;
  newPassword: string;
}

export interface TVerifyOTP {
  email: string;
  otp: string;
}

export interface TSendOTP {
  email: string;
}
