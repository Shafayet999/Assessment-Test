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

const handleCallback = async (req: Request, res: Response) => {
  try {
    const result = await PaymentService.handleCallback(req.query as any);
    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Callback processing failed",
      errors: [{ path: "handleCallback", message: error.message }],
    });
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