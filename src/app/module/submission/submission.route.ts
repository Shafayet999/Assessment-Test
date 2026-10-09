;
import { Router } from "express";


import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { SubmissionController } from "./submission.controller";

const router = Router();

// Recruiter: ক্যান্ডিডেট ইনভাইট করা
router.post(
  "/invite",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  SubmissionController.inviteCandidate
);

// Candidate: নিজের অ্যাসাইন করা এক্সাম দেখা
router.get(
  "/my-assessments",
  auth(UserRole.CANDIDATE),
  SubmissionController.getMyAssignedAssessments
);

// Candidate: এক্সাম শুরু করা
router.post(
  "/start/:attemptId",
  auth(UserRole.CANDIDATE),
  SubmissionController.startAssessment
);

// Candidate: উত্তর সাবমিট করা
router.post(
  "/submit/:attemptId",
  auth(UserRole.CANDIDATE),
  SubmissionController.submitAssessment
);

// Results & Report: ক্যান্ডিডেট, রিক্রুটার বা এডমিন দেখতে পারবে
router.get(
  "/results/:attemptId",
  auth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  SubmissionController.getSubmissionResult
);

router.get(
  "/assessment/:assessmentId", 
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  SubmissionController.getSubmissionsByAssessment 
);

export const SubmissionRoutes = router;