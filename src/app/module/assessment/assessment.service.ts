
import { Prisma } from "../../../generated/prisma/client";
import { AssessmentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IAssessmentFilterRequest, ICreateAssessment, ICreateQuestion } from "./assessment.interface";



// ১. প্রশ্ন তৈরি (Problem Bank)
const createQuestion = async (payload: ICreateQuestion) => {
  const result = await prisma.question.create({
    data: {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      difficulty: payload.difficulty,
      options: payload.options ? (payload.options as any) : Prisma.JsonNull,
      correctAnswer: payload.correctAnswer || null,
      marks: payload.marks || 10,
    },
  });
  return result;
};

// ২. প্রশ্ন ব্যাংকের সব প্রশ্ন দেখা
const getAllQuestions = async () => {
  return await prisma.question.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
};

// ৩. অ্যাসেসমেন্ট তৈরি করা (Recruiter Credit চেক ও Transaction সহ)
const createAssessment = async (recruiterId: string, payload: ICreateAssessment) => {
  // রিক্রুটারের ক্রেডিট চেক
  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId },
  });

  if (!recruiter || recruiter.credits < 1) {
    throw new Error("Insufficient credits! Please purchase credits via bKash to create assessments.");
  }

  // ট্রানজ্যাকশন: অ্যাসেসমেন্ট তৈরি + ক্রেডিট ১ কমানো + প্রশ্ন লিংক করা
  const result = await prisma.$transaction(async (tx) => {
    // ১ ক্রেডিট ডিডাক্ট করা
    await tx.user.update({
      where: { id: recruiterId },
      data: { credits: { decrement: 1 } },
    });

    // অ্যাসেসমেন্ট ক্রিয়েট
    const newAssessment = await tx.assessment.create({
      data: {
        title: payload.title,
        description: payload.description,
        durationMinutes: Number(payload.durationMinutes),
        totalMarks: payload.totalMarks || 100,
        passMarks: payload.passMarks || 40,
        status: AssessmentStatus.PUBLISHED,
        recruiterId,
      },
    });

    // যদি প্রশ্ন সিলেক্ট করে দেওয়া থাকে তবে লিংক করা
    if (payload.questionIds && payload.questionIds.length > 0) {
      const links = payload.questionIds.map((qId, index) => ({
        assessmentId: newAssessment.id,
        questionId: qId,
        order: index + 1,
      }));
      await tx.assessmentQuestion.createMany({ data: links });
    }

    return newAssessment;
  });

  return result;
};

// ৪. ফিল্টারিং, সার্চ ও পেজিনেশন সহ সব অ্যাসেসমেন্ট আনা
const getAllAssessments = async (filters: IAssessmentFilterRequest) => {
  const { searchTerm, status, page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc" } = filters;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const andConditions: Prisma.AssessmentWhereInput[] = [{ isDeleted: false }];

  // সার্চিং
  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  // স্ট্যাটাস ফিল্টারিং
  if (status) {
    andConditions.push({ status });
  }

  const whereConditions: Prisma.AssessmentWhereInput = { AND: andConditions };

  const [data, total] = await Promise.all([
    prisma.assessment.findMany({
      where: whereConditions,
      skip,
      take: limitNum,
      orderBy: { [sortBy]: sortOrder },
      include: {
        recruiter: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { questions: true, candidates: true } },
      },
    }),
    prisma.assessment.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    data,
  };
};

// ৫. সিঙ্গেল অ্যাসেসমেন্ট বিস্তারিত দেখা
const getSingleAssessment = async (id: string) => {
  const result = await prisma.assessment.findFirst({
    where: { id, isDeleted: false },
    include: {
      questions: {
        include: { question: true },
        orderBy: { order: "asc" },
      },
      recruiter: { select: { id: true, name: true, email: true } },
    },
  });

  if (!result) {
    throw new Error("Assessment not found!");
  }
  return result;
};

// ৬. Soft Delete Assessment
const softDeleteAssessment = async (id: string, userId: string, role: string) => {
  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment || assessment.isDeleted) {
    throw new Error("Assessment not found!");
  }

  // রিক্রুটার শুধু তার নিজের অ্যাসেসমেন্ট ডিলিট করতে পারবে, এডমিন যেকোনোটা
  if (role !== "ADMIN" && assessment.recruiterId !== userId) {
    throw new Error("You are not authorized to delete this assessment!");
  }

  const result = await prisma.assessment.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return result;
};

export const AssessmentService = {
  createQuestion,
  getAllQuestions,
  createAssessment,
  getAllAssessments,
  getSingleAssessment,
  softDeleteAssessment,
};