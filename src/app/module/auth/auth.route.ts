import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerSchema), // <--- এখানে যোগ করুন
  AuthController.register
);
router.post("/google-login", AuthController.googleLogin);
router.post(
  "/login",
  validateRequest(AuthValidation.loginSchema), 
  AuthController.login
);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);

router.get("/me", auth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN), AuthController.getMyProfile);

router.patch(
  "/me",
  auth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  AuthController.updateMyProfile
);

export const AuthRoutes = router;