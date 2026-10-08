import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { UserRole } from "../../generated/prisma/enums";

export const seedInitialData = async () => {
  try {
    const defaultPassword = await bcrypt.hash("password123", 10);

    // ১. অ্যাডমিন সিড
    const isSuperAdminExists = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (!isSuperAdminExists) {
      await prisma.user.create({
        data: {
          email: "admin@assessment.com",
          password: defaultPassword,
          name: "System Admin",
          role: UserRole.ADMIN,
          credits: 999,
        },
      });
      console.log("🌱 Super Admin seeded: admin@assessment.com");
    }

    // ২. রিক্রুটার টেস্ট ইউজার
    const isRecruiterExists = await prisma.user.findFirst({
      where: { role: UserRole.RECRUITER },
    });

    if (!isRecruiterExists) {
      await prisma.user.create({
        data: {
          email: "recruiter@techcorp.com",
          name: "John Recruiter",
          password: defaultPassword,
          role: UserRole.RECRUITER,
          credits: 10,
        },
      });
      console.log("🌱 Recruiter seeded: recruiter@techcorp.com");
    }

    // ৩. ক্যান্ডিডেট টেস্ট ইউজার
    const isCandidateExists = await prisma.user.findFirst({
      where: { role: UserRole.CANDIDATE },
    });

    if (!isCandidateExists) {
      await prisma.user.create({
        data: {
          email: "candidate@dev.com",
          name: "Jane Candidate",
          password: defaultPassword,
          role: UserRole.CANDIDATE,
        },
      });
      console.log("🌱 Candidate seeded: candidate@dev.com");
    }

    // ৪. কোশ্চেন সিডিং পুরোপুরি বন্ধ রাখা হয়েছে
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
  }
};