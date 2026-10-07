import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { AssessmentRoutes } from "./app/module/assessment/assessment.route";
import { SubmissionRoutes } from "./app/module/submission/submission.route";
import { PaymentRoutes } from "./app/module/payment/payment.route";
import { AdminRoutes } from "./app/module/admin/admin.route";


const app: Application = express();

app.use(
	cors({
		origin: true,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/assessments", AssessmentRoutes);
app.use("/api/v1/submissions", SubmissionRoutes);
app.use("/api/v1/payments", PaymentRoutes);
app.use("/api/v1/admin", AdminRoutes);



// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to Developer Assessment & Coding Platform Backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;