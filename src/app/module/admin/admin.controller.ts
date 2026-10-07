import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getDashboardStats();
    return res.status(200).json({ success: true, message: "Dashboard stats fetched", data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getAllUsers(req.query as any);
    return res.status(200).json({ success: true, message: "Users fetched", data: result.data, meta: result.meta });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

const updateUserRoleOrStatus = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const { id } = req.params;
    const result = await AdminService.updateUserRoleOrStatus(adminId, id as string, req.body);
    return res.status(200).json({ success: true, message: "User updated successfully", data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message, errors: [error.message] });
  }
};

const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getAuditLogs();
    return res.status(200).json({ success: true, message: "Audit logs fetched", data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  updateUserRoleOrStatus,
  getAuditLogs,
};