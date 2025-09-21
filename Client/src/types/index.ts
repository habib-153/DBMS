import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};


export type TPostCategory =
  | "Adventure"
  | "Exploration"
  | "Business Travel"
  | "Family Vacation"
  | "Relaxation"
  | "Luxury Travel";
export interface IPost {
  _id?: string;
  title: string;
  description: string;
  image: string;
  category: TPostCategory;
  author?: IUser | string;
  upVotes?: [IUser];
  upvoteCount?: number;
  downvoteCount?: number;
  downVotes?: [IUser];
  createdAt?: string;
  crimeDate?: string;
  postDate?: Date;
  division?: string;
  district?: string;
  location?: string;
}

export interface IInput {
  variant?: "flat" | "bordered" | "faded" | "underlined";
  size?: "sm" | "md" | "lg";
  required?: boolean;
  type?: string;
  label: string;
  name: string;
  disabled?: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  mobileNumber: string;
  profilePhoto: string;
  followers: [IUser];
  following: [IUser];
  isVerified: boolean;
  postCount: number;
  totalUpVotes: number;
  paymentStatus?: string;
  transactionId?: string;
  premiumStart?: string;
  premiumEnd?: string;
  premiumCharge?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
