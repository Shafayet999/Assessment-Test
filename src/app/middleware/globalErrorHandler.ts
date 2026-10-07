import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import { AppError } from "../utils/AppError";

export const globalErrorHandler = async (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    if (config.node_env === "development") {
        console.log("Error from Global Error Handler:", err);
    }

    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string = err.message || "Internal Server Error";
    let errorSources: { path: string; message: string }[] = [];

    // Zod ভ্যালিডেশন এরর হ্যান্ডলিং অংশে:
    if (err instanceof ZodError) {
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "Validation Error";
        errorSources = err.issues.map((issue) => {
            return {
                path: String(issue.path[issue.path.length - 1] ?? ""), // <--- String() দিয়ে র‍্যাপ করুন
                message: issue.message,
            };
        });
    }

    // ২. প্রিজমা এরর হ্যান্ডলিং
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage =
            "You have provided incorrect field type or missing fields";
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Duplicate Key Error: Record already exists";
        } else if (err.code === "P2003") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Foreign key constraint failed";
        } else if (err.code === "P2025") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Operation failed: Record not found";
        }
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        if (err.errorCode === "P1000") {
            statusCode = httpStatus.UNAUTHORIZED;
            errorMessage = "Database authentication failed. Check credentials";
        } else if (err.errorCode === "P1001") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Can't reach database server";
        }
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorMessage = "Error occurred during database query execution";
    }

    // ৩. কাস্টম অ্যাপ এরর
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorMessage = err.message;
    }

    // ৪. সাধারণ এরর
    else if (err instanceof Error) {
        errorMessage = err.message;
    }

    // রিকোয়ারমেন্টের সাথে সামঞ্জস্যপূর্ণ রেসপন্স ফরম্যাট
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: errorMessage,
        errors:
            errorSources.length > 0
                ? errorSources
                : [{ path: "", message: errorMessage }],
        stack: config.node_env === "development" ? err.stack : undefined,
    });
};
