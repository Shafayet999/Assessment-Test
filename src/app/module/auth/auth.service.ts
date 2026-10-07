import * as bcrypt from "bcryptjs";
import { jwtUtils } from "../../utils/jwt"; // আপনার jwt ফাইলের পাথ অনুযায়ী মিলিয়ে নিন
import { ILoginResponse, ILoginUser, IRegisterUser } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../../generated/prisma/enums";
import { googleClient } from "../../lib/googleAuth";
import config from "../../config";
import { SignOptions } from "jsonwebtoken";

const googleLogin = async (idToken: string) => {
    // ১. গুগল টোকেন ভেরিফিকেশন
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error("Google authentication failed: Invalid token payload");
    }

    const { email, name, picture } = payload;

    // ২. ইউজার খোঁজা বা নতুন ইউজার তৈরি (Upsert)
    let user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                name: name || "Google User",
                profileImage: picture || null,
                role: UserRole.CANDIDATE, // ডিফল্ট রোল
                password: null, // সোশ্যাল লগইনে পাসওয়ার্ড নাল থাকবে
            },
        });
    }

    if (user.isDeleted || user.status === "BLOCKED") {
        throw new Error("Account is blocked or deactivated");
    }

    // loginUser মেথডের ভেতরে:
    const jwtPayload = {
        id: user.id,
        userId: user.id, 
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            credits: user.credits,
        },
    };
};

const registerUser = async (payload: IRegisterUser) => {
    const isUserExist = await prisma.user.findUnique({
        where: { email: payload.email },
    });

    if (isUserExist) {
        throw new Error("User already exists with this email!");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const result = await prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
            role: payload.role || UserRole.CANDIDATE,
            credits: payload.role === UserRole.RECRUITER ? 5 : 0,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            credits: true,
            createdAt: true,
        },
    });

    return result;
};

const loginUser = async (payload: ILoginUser): Promise<ILoginResponse> => {
    const user = await prisma.user.findUnique({
        where: { email: payload.email },
    });

    if (!user || !user.password) {
        throw new Error("Invalid email or password!");
    }

    if (user.isDeleted || user.status === "BLOCKED") {
        throw new Error("Your account is deactivated or blocked!");
    }

    const isPasswordMatched = await bcrypt.compare(
        payload.password,
        user.password,
    );
    if (!isPasswordMatched) {
        throw new Error("Invalid email or password!");
    }

   const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            credits: user.credits,
        },
    };
};

const refreshToken = async (token: string) => {
    const verifyResult = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

    if (!verifyResult.success || !verifyResult.data) {
        throw new Error("Invalid or expired refresh token!");
    }

    const decoded = verifyResult.data as {
        id: string;
        email: string;
        role: UserRole;
    };

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
    });

    if (!user || user.isDeleted || user.status === "BLOCKED") {
        throw new Error("User does not exist or is blocked!");
    }

    const newAccessToken = jwtUtils.createToken(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "default_jwt_secret",
        (process.env.JWT_EXPIRES_IN || "1d") as any,
    );

    return {
        accessToken: newAccessToken,
    };
};

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User profile not found!");
  }

  return user;
};

const updateMyProfile = async (
  userId: string,
  payload: { name?: string; bio?: string }
) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExist) {
    throw new Error("User not found!");
  }


  const updateData: Record<string, any> = {};
  if (payload.name) updateData.name = payload.name;
  

  // if (payload.bio) updateData.bio = payload.bio;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const AuthService = {
    registerUser,
    loginUser,
    refreshToken,
    googleLogin,
    getMyProfile,
    updateMyProfile
}; 
