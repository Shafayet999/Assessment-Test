import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import httpStatus from "http-status";

import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { AssessmentRoutes } from "./app/module/assessment/assessment.route";
import { SubmissionRoutes } from "./app/module/submission/submission.route";
import { PaymentRoutes } from "./app/module/payment/payment.route";
import { AdminRoutes } from "./app/module/admin/admin.route";

const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://developer-assessment-platform-delta.vercel.app",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// 1. CORS Middleware (এটি একাই OPTIONS সহ সব রিকোয়েস্ট প্রসেস করবে)
app.use(cors(corsOptions));

// 2. Body Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// 3. API Routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/assessments", AssessmentRoutes);
app.use("/api/v1/submissions", SubmissionRoutes);
app.use("/api/v1/payments", PaymentRoutes);
app.use("/api/v1/admin", AdminRoutes);

// Health Check route
app.get("/", async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to Developer Assessment & Coding Platform Backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;