
import { CandidateAssessmentStatus, QuestionType } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IAssessmentSubmissionPayload, IInviteCandidate } from "./submission.interface";


// ১. ক্যান্ডিডেটকে অ্যাসেসমেন্টে ইনভাইট/অ্যাসাইন করা
const inviteCandidate = async (recruiterId: string, payload: IInviteCandidate) => {
  const assessment = await prisma.assessment.findFirst({
    where: { id: payload.assessmentId, isDeleted: false },
  });

  if (!assessment) {
    throw new Error("Assessment not found!");
  }

  if (assessment.recruiterId !== recruiterId) {
    throw new Error("You are not authorized to invite candidates to this assessment!");
  }

  const candidate = await prisma.user.findUnique({
    where: { email: payload.candidateEmail },
  });

  if (!candidate) {
    throw new Error("Candidate not registered with this email!");
  }

  const existingInvitation = await prisma.candidateAssessment.findUnique({
    where: {
      candidateId_assessmentId: {
        candidateId: candidate.id,
        assessmentId: payload.assessmentId,
      },
    },
  });

  if (existingInvitation) {
    throw new Error("Candidate is already invited to this assessment!");
  }

  const invitation = await prisma.candidateAssessment.create({
    data: {
      candidateId: candidate.id,
      assessmentId: payload.assessmentId,
      status: CandidateAssessmentStatus.INVITED,
    },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
      assessment: { select: { id: true, title: true, durationMinutes: true } },
    },
  });

  return invitation;
};

// ২. ক্যান্ডিডেটের নিজের সব অ্যাসাইন করা টেস্ট লিস্ট দেখা
const getMyAssignedAssessments = async (candidateId: string) => {
  const results = await prisma.candidateAssessment.findMany({
    where: { candidateId },
    include: {
      assessment: {
        select: {
          id: true,
          title: true,
          description: true,
          durationMinutes: true,
          totalMarks: true,
          passMarks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return results;
};

// ৩. পরীক্ষা শুরু করা (টাইমার ট্র্যাকিং)
const startAssessment = async (candidateAssessmentId: string, candidateId: string) => {
  const attempt = await prisma.candidateAssessment.findUnique({
    where: { id: candidateAssessmentId },
    include: {
      assessment: {
        include: {
          questions: {
            include: {
              question: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  type: true,
                  options: true,
                  marks: true,
                  // correctAnswer ক্যান্ডিডেটকে দেখানো যাবে না (Security)
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!attempt || attempt.candidateId !== candidateId) {
    throw new Error("Assessment attempt record not found!");
  }

  if (attempt.status === CandidateAssessmentStatus.SUBMITTED) {
    throw new Error("You have already submitted this assessment!");
  }

  // যদি প্রথমবার স্টার্ট করে তবে startedAt সেট হবে
  let startedAt = attempt.startedAt;
  if (!startedAt) {
    startedAt = new Date();
    await prisma.candidateAssessment.update({
      where: { id: attempt.id },
      data: {
        status: CandidateAssessmentStatus.IN_PROGRESS,
        startedAt,
      },
    });
  }

  return {
    attemptId: attempt.id,
    startedAt,
    durationMinutes: attempt.assessment.durationMinutes,
    assessment: {
      title: attempt.assessment.title,
      questions: attempt.assessment.questions.map((q) => q.question),
    },
  };
};

// ৪. উত্তর সাবমিট করা ও অটো-ইভ্যালুয়েশন (Transaction)
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

  // প্রশ্নগুলোর সঠিক উত্তরের একটি ম্যাপ তৈরি
  const questionMap = new Map();
  attempt.assessment.questions.forEach((item) => {
    questionMap.set(item.question.id, item.question);
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
        // MCQ হলে সরাসরি সঠিক উত্তরের সাথে মিলিয়ে অটো মার্কিং
        if (
          question.correctAnswer &&
          question.correctAnswer.trim().toLowerCase() === ans.answerText.trim().toLowerCase()
        ) {
          obtainedMarks = question.marks;
        }
        isEvaluated = true;
      } else {
        // কোডিং বা রিটেন প্রশ্নের জন্য প্রাথমিক অবস্থায় ০ মার্কস (রিক্রুটার পরে ম্যানুয়াল রিভিউ করবে)
        obtainedMarks = 0;
        isEvaluated = false;
      }

      totalCalculatedScore += obtainedMarks;

      submissionsData.push({
        candidateAssessmentId: attempt.id,
        questionId: ans.questionId,
        answerText: ans.answerText,
        obtainedMarks,
        isEvaluated,
      });
    }
  }

  // ডাটাবেস ট্রানজ্যাকশন: সব সাবমিশন সেভ এবং টোটাল স্কোর আপডেট
  const result = await prisma.$transaction(async (tx) => {
    // সাবমিশনগুলো তৈরি করা
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

    // ক্যান্ডিডেট অ্যাসেসমেন্ট স্ট্যাটাস এবং ফাইনাল স্কোর আপডেট
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

// ৫. ফলাফল বা রিপোর্ট দেখা (ক্যান্ডিডেট ও রিক্রুটারের জন্য)
const getSubmissionResult = async (candidateAssessmentId: string, userId: string, role: string) => {
  const result = await prisma.candidateAssessment.findUnique({
    where: { id: candidateAssessmentId },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
      assessment: { select: { id: true, title: true, totalMarks: true, passMarks: true, recruiterId: true } },
      submissions: {
        include: {
          question: {
            select: { id: true, title: true, type: true, marks: true, correctAnswer: true },
          },
        },
      },
    },
  });

  if (!result) {
    throw new Error("Result not found!");
  }

  // ক্যান্ডিডেট শুধু নিজের রেজাল্ট দেখবে, রিক্রুটার তার অ্যাসেসমেন্টের রেজাল্ট দেখবে, এডমিন সব দেখবে
  if (role === "CANDIDATE" && result.candidateId !== userId) {
    throw new Error("Access denied!");
  }

  if (role === "RECRUITER" && result.assessment.recruiterId !== userId) {
    throw new Error("Access denied!");
  }

  return result;
};

const getSubmissionsByAssessmentId = async (
  assessmentId: string,
  userId: string,
  userRole: string
) => {
  // ১. অ্যাসেসমেন্টটি ডাটাবেসে আছে কি না যাচাই
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) {
    throw new Error("Assessment not found!");
  }

  // ২. সিকিউরিটি গার্ড: এডমিন ছাড়া অন্য রিক্রুটার কেবল তার নিজের অ্যাসেসমেন্ট দেখতে পারবে
  if (userRole === "RECRUITER" && assessment.recruiterId !== userId) {
    throw new Error("You are not authorized to view submissions for this assessment!");
  }

  // ৩. এই অ্যাসেসমেন্টে অংশ নেওয়া সব প্রার্থীর তালিকা ও রেজাল্ট ফেচ
  const candidateAssessments = await prisma.candidateAssessment.findMany({
    where: { assessmentId },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      totalMarks: assessment.totalMarks,
      passMarks: assessment.passMarks,
    },
    totalCandidates: candidateAssessments.length,
    candidates: candidateAssessments,
  };
};



export const SubmissionService = {
  inviteCandidate,
  getMyAssignedAssessments,
  startAssessment,
  submitAssessment,
  getSubmissionResult,
  getSubmissionsByAssessmentId
};