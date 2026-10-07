
import { Router } from "express";

import { AdminController } from "./admin.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/dashboard-stats", auth(UserRole.ADMIN), AdminController.getDashboardStats);
router.get("/users", auth(UserRole.ADMIN), AdminController.getAllUsers);
router.patch("/users/:id", auth(UserRole.ADMIN), AdminController.updateUserRoleOrStatus);
router.get("/audit-logs", auth(UserRole.ADMIN), AdminController.getAuditLogs);


export const AdminRoutes = router;