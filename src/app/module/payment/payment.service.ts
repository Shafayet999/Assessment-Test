import { PaymentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { ICreatePaymentPayload, IRefundPaymentPayload } from "./payment.interface";


// ১. পেমেন্ট তৈরি করা (v2 Create Payment)
const initiatePayment = async (userId: string, payload: ICreatePaymentPayload) => {
  const bkashIdToken = (await getBkashIdToken()) as string;


  const invoiceNumber = `INV-${Date.now()}`;
  const callbackURL = `http://localhost:5000/api/v1/payments/callback`;

  const response = await fetch(
    "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/payment/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        payerReference: userId.slice(0, 11), // স্যান্ডবক্সে রেফারেন্স স্ট্রিং
        callbackURL,
        amount: String(payload.amount),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invoiceNumber,
        subMerchantName: "AssessmentPlatform",
        merchantAssociationInfo: "MI05MID54RF09123456789",
      }),
    }
  );

  const result = await response.json();

  console.log(result);

 

  if (result && result.paymentId) {
    // লোকাল ডাটাবেসে PENDING পেমেন্ট তৈরি
    const paymentRecord = await prisma.payment.create({
      data: {
        userId,
        amount: Number(payload.amount),
        currency: "BDT",
        paymentGateway: "bKash",
        paymentID: result.paymentId,
        creditsPurchased: Number(payload.creditsPurchased) || 5,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentRecord,
      bkashURL: result.bkashURL,
      paymentID: result.paymentID,
    };
  }

  throw new Error(result.statusMessage || "Failed to create bKash payment");
};

// ২. bKash কলব্যাক হ্যান্ডলার ও পেমেন্ট এক্সিকিউট (v2 Execute Payment + Prisma Transaction)
const handleCallback = async (query: { paymentID?: string; status?: string }) => {
  const { paymentID, status } = query;

  if (!paymentID) throw new Error("Payment ID is missing");
  if (!status) throw new Error("Payment status is missing");

  // ক্যানসেল হ্যান্ডলিং
  if (status === "cancel") {
    await prisma.payment.updateMany({
      where: { paymentID },
      data: { status: PaymentStatus.CANCELLED },
    });
    return {
      success: false,
      message: "Payment cancelled by user",
      status: "cancel",
      paymentID,
    };
  }

  // ফেইলিউর হ্যান্ডলিং
  if (status === "failure") {
    await prisma.payment.updateMany({
      where: { paymentID },
      data: { status: PaymentStatus.FAILED },
    });
    return {
      success: false,
      message: "Payment failed during checkout",
      status: "failure",
      paymentID,
    };
  }

  // সাকসেস হলে বিকাশ থেকে Execute করা
  if (status === "success") {
    const bkashIdToken = (await getBkashIdToken()) as string;

    const executedResponse = await fetch(
      "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/payment/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config.bkash_app_key,
        },
        body: JSON.stringify({
          paymentId: paymentID,
        }),
      }
    );

    const executedResult = await executedResponse.json();

    if (
      executedResult.transactionStatus !== "Completed" ||
      !executedResult.trxId
    ) {
      await prisma.payment.updateMany({
        where: { paymentID },
        data: { status: PaymentStatus.FAILED },
      });

      throw new Error(executedResult.statusMessage || "bKash Execution Failed");
    }

    // Prisma Transaction: পেমেন্ট কমপ্লিট ও ইউজারের ক্রেডিট বাড়ানো
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { paymentID },
      });

      if (!payment) {
        throw new Error("Payment record not found in system!");
      }

      if (payment.status === PaymentStatus.COMPLETED) {
        return payment;
      }

      // পেমেন্ট রেকর্ড কমপ্লিট করা
      const completedPayment = await tx.payment.update({
        where: { paymentID },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: executedResult.trxId,
        },
      });

      // ইউজারের ক্রেডিট বাড়িয়ে দেওয়া
      await tx.user.update({
        where: { id: payment.userId },
        data: {
          credits: { increment: payment.creditsPurchased },
        },
      });

      // অডিট লগ সংরক্ষণ
      await tx.auditLog.create({
        data: {
          userId: payment.userId,
          action: "CREDIT_PURCHASE_COMPLETED",
          entity: "Payment",
          entityId: completedPayment.id,
          details: {
            trxId: executedResult.trxId,
            creditsAdded: payment.creditsPurchased,
            amount: payment.amount,
          },
        },
      });

      return completedPayment;
    });

    return {
      success: true,
      message: "Payment completed and assessment credits added!",
      trxId: executedResult.trxId,
      data: result,
    };
  }

  throw new Error("Invalid payment status received");
};

// ৩. রিফান্ড পেমেন্ট (v2 Refund API + অ্যাডমিন অপারেশন)
const refundPayment = async (payload: IRefundPaymentPayload) => {
  const bkashIdToken = (await getBkashIdToken()) as string;

  const refundResponse = await fetch(
    "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/refund/payment/transaction",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        paymentId: payload.paymentId,
        refundAmount: Number(payload.refundAmount),
        trxId: payload.trxId,
        reason: payload.reason || "Assessment cancellation or billing adjustment",
        sku: "DEV-CREDIT-PKG",
      }),
    }
  );

  const refundResult = await refundResponse.json();

  if (refundResult && refundResult.statusCode === "0000") {
    // ডাটাবেসে পেমেন্ট এবং ইউজারের ক্রেডিট অ্যাডজাস্ট
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { paymentID: payload.paymentId },
      });

      if (payment) {
        await tx.user.update({
          where: { id: payment.userId },
          data: {
            credits: { decrement: payment.creditsPurchased },
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: "PAYMENT_REFUNDED",
          entity: "Payment",
          entityId: payload.paymentId,
          details: refundResult,
        },
      });
    });

    return {
      message: "Refund processed successfully",
      refundResult,
    };
  }

  throw new Error(refundResult.statusMessage || "Refund processing failed");
};

// ৪. ইউজারের নিজস্ব পেমেন্ট লিস্ট
const getMyPayments = async (userId: string) => {
  return await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

// ৫. অ্যাডমিনের জন্য সব পেমেন্ট
const getAllPayments = async () => {
  return await prisma.payment.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const PaymentService = {
  initiatePayment,
  handleCallback,
  refundPayment,
  getMyPayments,
  getAllPayments,
};