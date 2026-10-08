import { Request, Response } from "express";
import { SubmissionService } from "./submission.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";

const inviteCandidate = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user!.id;
    const result = await SubmissionService.inviteCandidate(recruiterId, req.body);
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
    const result = await SubmissionService.getMyAssignedAssessments(candidateId);
    return res.status(200).json({
      success: true,
      message: "Assigned assessments retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assessments",
      errors: [{ path: "getMyAssignedAssessments", message: error.message }],
    });
  }
};

const startAssessment = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const candidateId = req.user!.id;
    const result = await SubmissionService.startAssessment(attemptId as string, candidateId);
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

const submitAssessment = async (
  candidateAssessmentId: string,
  candidateId: string,
  payload: IAssessmentSubmissionPayload
) => {
  const attempt = await prisma.candidateAssessment.findUnique({
    where: { id: candidateAssessmentId },
    include: {
      assessment: {
        include: {
          questions: {
            include: { question: true },
          },
        },
      },
    },
  });

  if (!attempt || attempt.candidateId !== candidateId) {
    throw new Error("Attempt record not found!");
  }

  if (attempt.status === CandidateAssessmentStatus.SUBMITTED) {
    throw new Error("This assessment has already been submitted!");
  }

  // 🔍 ফিক্স ১: question.id এবং assessmentQuestion.id উভয় দিয়েই ম্যাপ রেজিস্টার করা
  const questionMap = new Map();
  attempt.assessment.questions.forEach((item) => {
    questionMap.set(item.question.id, item.question); // আসল Question ID
    questionMap.set(item.id, item.question);          // Join Table ID
    if (item.questionId) {
      questionMap.set(item.questionId, item.question);
    }
  });

  let totalCalculatedScore = 0;
  const submissionsData: any[] = [];

  // অটো-স্কোরিং লজিক
  for (const ans of payload.answers) {
    const question = questionMap.get(ans.questionId);
    let obtainedMarks = 0;
    let isEvaluated = false;

    if (question) {
      if (question.type === QuestionType.MCQ) {
        if (
          question.correctAnswer &&
          question.correctAnswer.trim().toLowerCase() ===
            ans.answerText.trim().toLowerCase()
        ) {
          obtainedMarks = question.marks;
        }
        isEvaluated = true;
      } else {
        obtainedMarks = 0;
        isEvaluated = false;
      }

      totalCalculatedScore += obtainedMarks;

      // 🔍 ফিক্স ২: ডেটাবেজ সেভের সময় সবসময় নিশ্চিত আসল question.id পাস করা
      submissionsData.push({
        candidateAssessmentId: attempt.id,
        questionId: question.id, // ans.questionId এর বদলে question.id
        answerText: ans.answerText,
        obtainedMarks,
        isEvaluated,
      });
    }
  }

  // ডাটাবেস ট্রানজ্যাকশন: সব সাবমিশন সেভ এবং টোটাল স্কোর আপডেট
  const result = await prisma.$transaction(async (tx) => {
    for (const sub of submissionsData) {
      await tx.submission.upsert({
        where: {
          candidateAssessmentId_questionId: {
            candidateAssessmentId: sub.candidateAssessmentId,
            questionId: sub.questionId,
          },
        },
        update: {
          answerText: sub.answerText,
          obtainedMarks: sub.obtainedMarks,
          isEvaluated: sub.isEvaluated,
        },
        create: sub,
      });
    }

    const updatedAttempt = await tx.candidateAssessment.update({
      where: { id: attempt.id },
      data: {
        status: CandidateAssessmentStatus.SUBMITTED,
        submittedAt: new Date(),
        totalScore: totalCalculatedScore,
      },
    });

    return updatedAttempt;
  });

  return {
    attemptId: result.id,
    status: result.status,
    totalScore: result.totalScore,
    submittedAt: result.submittedAt,
  };
};

const getSubmissionResult = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;
    const result = await SubmissionService.getSubmissionResult(attemptId as string, userId, role);
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

const getSubmissionsByAssessment = catchAsync(async (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  const user = req.user as any; // auth মিডলওয়্যার থেকে পাওয়া ইউজার ডাটা

  const result = await SubmissionService.getSubmissionsByAssessmentId(
    assessmentId as string,
    user.id,
    user.role
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assessment candidate submissions retrieved successfully",
    data: result,
  });
});

export const SubmissionController = {
  inviteCandidate,
  getMyAssignedAssessments,
  startAssessment,
  submitAssessment,
  getSubmissionResult,
  getSubmissionsByAssessment
};