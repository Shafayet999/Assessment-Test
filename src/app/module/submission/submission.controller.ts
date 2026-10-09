import { Request, Response } from "express";
import { SubmissionService } from "./submission.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import {
    CandidateAssessmentStatus,
    QuestionType,
} from "../../../generated/prisma/enums";
import { IAssessmentSubmissionPayload } from "./submission.interface";
import { prisma } from "../../lib/prisma";

const inviteCandidate = async (req: Request, res: Response) => {
    try {
        const recruiterId = req.user!.id;
        const result = await SubmissionService.inviteCandidate(
            recruiterId,
            req.body,
        );
        return res.status(201).json({
            success: true,
            message: "Candidate invited successfully to the assessment",
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to invite candidate",
            errors: [{ path: "inviteCandidate", message: error.message }],
        });
    }
};

const getMyAssignedAssessments = async (req: Request, res: Response) => {
    try {
        const candidateId = req.user!.id;
        const result =
            await SubmissionService.getMyAssignedAssessments(candidateId);
        return res.status(200).json({
            success: true,
            message: "Assigned assessments retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch assessments",
            errors: [
                { path: "getMyAssignedAssessments", message: error.message },
            ],
        });
    }
};

const startAssessment = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;
        const candidateId = req.user!.id;
        const result = await SubmissionService.startAssessment(
            attemptId as string,
            candidateId,
        );
        return res.status(200).json({
            success: true,
            message: "Assessment exam started successfully",
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to start assessment",
            errors: [{ path: "startAssessment", message: error.message }],
        });
    }
};

// submission.service.ts এর submitAssessment ফাংশন:

const submitAssessment = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;
        const candidateId = (req as any).user?.id; // অথবা req.user!.id

        const result = await SubmissionService.submitAssessment(
            attemptId as string,
            candidateId,
            req.body,
        );

        return res.status(200).json({
            success: true,
            message: "Assessment submitted and evaluated successfully",
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to submit assessment",
            errors: [{ path: "submitAssessment", message: error.message }],
        });
    }
};

const getSubmissionResult = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;
        const userId = req.user!.id;
        const role = req.user!.role;
        const result = await SubmissionService.getSubmissionResult(
            attemptId as string,
            userId,
            role,
        );
        return res.status(200).json({
            success: true,
            message: "Assessment report and results fetched successfully",
            data: result,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message || "Failed to fetch result",
            errors: [{ path: "getSubmissionResult", message: error.message }],
        });
    }
};

const getSubmissionsByAssessment = catchAsync(
    async (req: Request, res: Response) => {
        const { assessmentId } = req.params;
        const user = req.user as any; // auth মিডলওয়্যার থেকে পাওয়া ইউজার ডাটা

        const result = await SubmissionService.getSubmissionsByAssessmentId(
            assessmentId as string,
            user.id,
            user.role,
        );

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Assessment candidate submissions retrieved successfully",
            data: result,
        });
    },
);

export const SubmissionController = {
    inviteCandidate,
    getMyAssignedAssessments,
    startAssessment,
    submitAssessment,
    getSubmissionResult,
    getSubmissionsByAssessment,
};
