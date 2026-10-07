import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const googleLogin = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;
        if (!idToken) throw new Error("Google idToken is required");
        const result = await AuthService.googleLogin(idToken);
        return res.status(200).json({
            success: true,
            message: "Google login successful",
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Google authentication failed",
            errors: [{ path: "googleLogin", message: error.message }],
        });
    }
};

const register = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.registerUser(req.body);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to register user",
            errors: [{ path: "register", message: error.message }],
        });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.loginUser(req.body);

        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
        });

        // Refresh token কে Secure HTTP-Only Cookie তে রাখা
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return res.status(200).json({ 
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user,
            },
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message || "Login failed",
            errors: [{ path: "login", message: error.message }],
        });
    }
};

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged out successfully",
    data: null,
  });
});



const refreshToken = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is missing!",
                errors: [{ path: "refreshToken", message: "Token required" }],
            });
        }

        const result = await AuthService.refreshToken(token);
        return res.status(200).json({
            success: true,
            message: "New access token generated successfully",
            data: result,
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message || "Token refresh failed",
            errors: [{ path: "refreshToken", message: error.message }],
        });
    }
};

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any; // auth মিডলওয়্যার থেকে পাওয়া ডিকোডেড টোকেন/ইউজার ডাটা

  const result = await AuthService.getMyProfile(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any; // auth মিডলওয়্যার থেকে প্রাপ্ত ইউজার ডেটা

  const result = await AuthService.updateMyProfile(user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

export const AuthController = {
    register,
    login,
    refreshToken,
    googleLogin,
    getMyProfile,
    updateMyProfile,
    logout
};
