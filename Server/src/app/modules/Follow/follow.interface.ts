export type TFollow = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
};

export type TFollowWithUser = TFollow & {
  followerUserId?: string;
  followerName?: string;
  followerEmail?: string;
  followerProfilePhoto?: string;
  followingUserId?: string;
  followingName?: string;
  followingEmail?: string;
  followingProfilePhoto?: string;
};
