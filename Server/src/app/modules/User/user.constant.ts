export const USER_ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  DELETED: 'DELETED',
} as const;

export const DEFAULT_PROFILE_URL =
  'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-Free-Download.png';

export const userSearchableFields = [
  'name',
  'email',
  'role',
  'status',
  'searchTerm',
];

export const userFilterableFields = [
  'name',
  'email',
  'phone',
  'role',
  'status',
  'searchTerm',
];
