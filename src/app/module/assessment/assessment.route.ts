
import { Router } from "express";

import { AssessmentController } from "./assessment.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { AssessmentValidation } from "./assessment.validation";

const router = Router();

// Question Bank Routes
router.post(
  "/questions",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.createQuestion
);
router.get(
  "/questions",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.getAllQuestions
);

// Assessment Routes
router.post(
  "/",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(AssessmentValidation.createAssessmentSchema),
  AssessmentController.createAssessment
);
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.getAllAssessments
);
router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.getSingleAssessment
);
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.deleteAssessment
);

export const AssessmentRoutes = router;