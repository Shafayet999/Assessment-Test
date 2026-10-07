
import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums";

const registerSchema = z.object({
  name: z
		.string("Not A String!!!!!")
		.min(3, "Name must atleast 3 characters long!!!")
		.max(10),
	email: z.email("Not email!!"),
	password: z
		.string()
		.min(8, "Password Must Minimum 8 Characters Long.")
   
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