
import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums";

const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long!")
    .max(60, "Name cannot exceed 60 characters!"),

  email: z
    .string()
    .email("Not a valid email address!"),

  password: z
    .string()
    .min(6, "Password must be minimum 6 characters long!"),

  role: z
    .enum(["CANDIDATE", "RECRUITER", "ADMIN"])
    .optional(),
});

const loginSchema = z.object({
  email: z.email(),
	password: z
		.string()
		.min(8, "Password Must Minimum 8 Characters Long.")
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const AuthValidation = {
  registerSchema,
  loginSchema,
  refreshTokenValidationSchema,
};