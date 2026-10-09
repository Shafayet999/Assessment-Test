import { Request, Response } from "express";
import { PaymentService } from "./payment.service";

const initiatePayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

 
    const result = await PaymentService.initiatePayment(userId, req.body);
    console.log(result, "result from service file");
    return res.status(200).json({
      success: true,
      message: "bKash payment URL generated successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to initiate payment",
      errors: [{ path: "initiatePayment", message: error.message }],
    });
  }
};

// src/app/modules/payment/payment.controller.ts

const handleCallback = async (req: Request, res: Response) => {
  const clientUrl = "http://localhost:3000";

  try {
    const result = await PaymentService.handleCallback(req.query as any);

    if (result.success) {
      // ✅ সফল হলে Success পেজে রিডাইরেক্ট
      return res.redirect(
        `${clientUrl}/recruiter/billing/success?trxId=${result.trxId || ""}`
      );
    } else {
      // ❌ ইউজার ক্যানসেল বা ফেইল করলে Cancel পেজে রিডাইরেক্ট
      return res.redirect(
        `${clientUrl}/recruiter/billing/cancel?reason=${result.status || "cancelled"}`
      );
    }
  } catch (error: any) {
    return res.redirect(
      `${clientUrl}/recruiter/billing/cancel?reason=error&message=${encodeURIComponent(
        error.message || "Payment processing failed"
      )}`
    );
  }
};

const refundPayment = async (req: Request, res: Response) => {
  try {
    const result = await PaymentService.refundPayment(req.body);
    return res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Refund failed",
      errors: [{ path: "refundPayment", message: error.message }],
    });
  }
};

const getMyPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await PaymentService.getMyPayments(userId);
    return res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payments",
      errors: [{ path: "getMyPayments", message: error.message }],
    });
  }
};

const getAllPayments = async (req: Request, res: Response) => {
  try {
    const result = await PaymentService.getAllPayments();
    return res.status(200).json({
      success: true,
      message: "All payments fetched successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payments",
      errors: [{ path: "getAllPayments", message: error.message }],
    });
  }
};

export const PaymentController = {
  initiatePayment,
  handleCallback,
  refundPayment,
  getMyPayments,
  getAllPayments,
};