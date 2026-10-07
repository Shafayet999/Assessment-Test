import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { UserRole } from "../../generated/prisma/enums";

export interface RequestUser {
  id: string;
  userId: string; // id এবং userId দুটোই রাখা হলো যাতে কোনো কন্ট্রোলারে টাইপ এরর না আসে
  email: string;
  name?: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // ১. কুকি অথবা হেডার থেকে টোকেন সংগ্রহ
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not logged in. Please log in to access this resource."
      );
    }

    // ২. টোকেন ভেরিফাই
    const verifiedToken = jwtUtils.verifyToken(
      token,
      config.jwt_access_secret || process.env.JWT_SECRET || "default_jwt_secret"
    );

    if (!verifiedToken.success) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        verifiedToken.error || "Invalid or expired token."
      );
    }

    const decoded = verifiedToken.data as JwtPayload;
    const targetUserId = decoded.userId || decoded.id;

    // ৩. ডাটাবেসে ইউজার যাচাই
    const user = await prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
    });

    if (!user || user.isDeleted) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "User not found. Please log in again."
      );
    }

    if (user.status === "BLOCKED") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account has been blocked. Please contact support."
      );
    }

    // ৪. রোল গার্ড ভ্যালিডেশন
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource."
      );
    }

    // ৫. রিকোয়েস্টে ইউজার অবজেক্ট সেট
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  });
};