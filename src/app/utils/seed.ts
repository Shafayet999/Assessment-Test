import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { Difficulty, QuestionType, UserRole } from "../../generated/prisma/enums";
import { Prisma } from "../../generated/prisma/client";

export const seedInitialData = async () => {
  try {
    const defaultPassword = await bcrypt.hash('password123', 10);
    // "password123"

    // ১. অ্যাডমিন সিড
    const isSuperAdminExists = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (!isSuperAdminExists) {
      await prisma.user.create({
        data: {
          email: 'admin@assessment.com',
          password: defaultPassword,
          name: 'System Admin',
          role: UserRole.ADMIN,
          credits: 999,
        },
      });
      console.log('🌱 Super Admin seeded: admin@assessment.com');
    }

    // ২. রিক্রুটার টেস্ট ইউজার
    const isRecruiterExists = await prisma.user.findFirst({
      where: { role: UserRole.RECRUITER },
    });

    if (!isRecruiterExists) {
      await prisma.user.create({
        data: {
          email: 'recruiter@techcorp.com',
          name: 'John Recruiter',
          password: defaultPassword,
          role: UserRole.RECRUITER,
          credits: 10,
        },
      });
      console.log('🌱 Recruiter seeded: recruiter@techcorp.com');
    }

    // ৩. ক্যান্ডিডেট টেস্ট ইউজার
    const isCandidateExists = await prisma.user.findFirst({
      where: { role: UserRole.CANDIDATE },
    });

    if (!isCandidateExists) {
      await prisma.user.create({
        data: {
          email: 'candidate@dev.com',
          name: 'Jane Candidate',
          password: defaultPassword,
          role: UserRole.CANDIDATE,
        },
      });
      console.log('🌱 Candidate seeded: candidate@dev.com');
    }

    // ৪. স্যাম্পল প্রশ্ন সিড (Prisma.QuestionCreateInput টাইপ ব্যবহার করা হয়েছে যাতে টাইপ এরর না আসে)
    const sampleQuestions: Prisma.QuestionCreateInput[] = [
      {
        title: 'What is the event loop in Node.js?',
        description: 'Explain the mechanism that allows Node.js to perform non-blocking I/O operations.',
        type: QuestionType.MCQ,
        difficulty: Difficulty.EASY,
        options: [
          'A multi-threaded queue worker',
          'A single-threaded loop that handles asynchronous callbacks',
          'A database connection pool mechanism',
          'A memory management engine',
        ],
        correctAnswer: 'A single-threaded loop that handles asynchronous callbacks',
        marks: 10,
      },
      {
        title: 'Reverse a Linked List',
        description: 'Write a function in TypeScript to reverse a singly linked list in O(n) time and O(1) space.',
        type: QuestionType.CODE_SNIPPET,
        difficulty: Difficulty.MEDIUM,
        options: Prisma.JsonNull, // null এর বদলে Prisma.JsonNull
        correctAnswer: null,
        marks: 20,
      },
    ];

    for (const q of sampleQuestions) {
      const existing = await prisma.question.findFirst({
        where: { title: q.title },
      });

      if (!existing) {
        await prisma.question.create({
          data: q,
        });
      }
    }
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
};