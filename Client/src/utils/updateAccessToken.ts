"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { IUser } from "../types";
import envConfig from "../config/envConfig";

export const updateAccessTokenInCookies = (updatedUser: IUser) => {
  const secret = envConfig.jwt_access_secret;
  const expiresIn = envConfig.jwt_access_expires_in;

  if (!secret) {
    throw new Error("JWT secret is not defined");
  }

  if (!expiresIn) {
    throw new Error("JWT expiration is not defined or invalid");
  }

  try {
    // @ts-ignore
    const newAccessToken = jwt.sign(
      {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        status: updatedUser.status,
        profilePhoto: updatedUser?.profilePhoto,
      },
      secret,
      { expiresIn: expiresIn } // Ensure `expiresIn` is valid here
    );

    //console.log("New Access Token: ", newAccessToken);

    const oldAccessToken = cookies().get("accessToken")?.value;

    if (oldAccessToken) {
      cookies().delete("accessToken");
    }

    cookies().set("accessToken", newAccessToken);
  } catch (error) {
    //console.error("Error signing JWT: ", error);
  }
};
