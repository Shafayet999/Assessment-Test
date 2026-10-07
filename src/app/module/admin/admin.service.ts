import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";


// ১. ড্যাশবোর্ড পরিসংখ্যান (Analytics / Stats)
const getDashboardStats = async () => {
  const [totalUsers, totalAssessments, totalAttempts, totalRevenue] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.assessment.count({ where: { isDeleted: false } }),
    prisma.candidateAssessment.count(),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  return {
    totalUsers,
    totalAssessments,
    totalAttempts,
    totalRevenue: totalRevenue._sum.amount || 0,
    usersByRole,
  };
};

// ২. সব ইউজারের লিস্ট দেখা (Pagination & Filtering)
const getAllUsers = async (query: { role?: UserRole; status?: UserStatus; page?: string; limit?: string }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereCondition: any = { isDeleted: false };
  if (query.role) whereCondition.role = query.role;
  if (query.status) whereCondition.status = query.status;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        credits: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereCondition }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  };
};

// ৩. ইউজারের রোল বা স্ট্যাটাস আপডেট করা + Audit Log তৈরি
const updateUserRoleOrStatus = async (
  adminId: string,
  targetUserId: string,
  payload: { role?: UserRole; status?: UserStatus }
) => {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new Error("User not found!");

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: targetUserId },
      data: payload,
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: "USER_PERMISSION_CHANGED",
        entity: "User",
        entityId: targetUserId,
        details: payload,
      },
    });

    return updated;
  });

  return updatedUser;
};

// ৪. অডিট লগ দেখা
const getAuditLogs = async () => {
  return await prisma.auditLog.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};





export const AdminService = {
  getDashboardStats,
  getAllUsers,
  updateUserRoleOrStatus,
  getAuditLogs,
};