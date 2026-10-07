
import { Router } from "express";

import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

// পেমেন্ট কলব্যাক (bKash সার্ভার থেকে সরাসরি হিট করে, তাই এতে কোনো টোকেন গার্ড বসবে না)
router.get("/callback", PaymentController.handleCallback);

// রিক্রুটার ক্রেডিট কেনার পেমেন্ট শুরু করবে
router.post(
  "/initiate",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  PaymentController.initiatePayment
);

// নিজের পেমেন্ট হিস্ট্রি দেখা
router.get(
  "/my-history",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  PaymentController.getMyPayments
);

// অ্যাডমিন সব পেমেন্ট ট্র্যাক করবে
router.get(
  "/all",
  auth(UserRole.ADMIN),
  PaymentController.getAllPayments
);

// অ্যাডমিন কোনো ভুল পেমেন্ট রিফান্ড করবে
router.post(
  "/refund",
  auth(UserRole.ADMIN),
  PaymentController.refundPayment
);

export const PaymentRoutes = router;