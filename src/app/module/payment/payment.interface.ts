export interface ICreatePaymentPayload {
  amount: number;
  creditsPurchased: number;
}

export interface IRefundPaymentPayload {
  paymentId: string; // bKash paymentID
  trxId: string;     // bKash trxID
  refundAmount: number;
  reason?: string;
}