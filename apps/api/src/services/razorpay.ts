import crypto from 'crypto';

export interface CreateOrderParams {
  amount: number; // in INR
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
  attempts: number;
  created_at: number;
}

export class RazorpayService {
  private static getKeyId(): string {
    return process.env.RAZORPAY_KEY_ID || 'rzp_test_ThqAXccEenS0Um';
  }

  private static getKeySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || 'tYJwiAUbqAwYfJJrFTNJ6NER';
  }

  private static getAuthHeader(): string {
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();
    return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  }

  /**
   * Create an order on Razorpay
   * @param params { amount in INR, currency, receipt, notes }
   */
  static async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResponse> {
    const amountInPaise = Math.round(Number(params.amount) * 100);
    const currency = params.currency || 'INR';

    const payload: Record<string, any> = {
      amount: amountInPaise,
      currency,
      receipt: params.receipt || `rcpt_${Date.now()}`,
    };

    if (params.notes) {
      payload.notes = params.notes;
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error('Razorpay order creation error:', data);
      throw new Error(data?.error?.description || 'Failed to create Razorpay order');
    }

    return data as RazorpayOrderResponse;
  }

  /**
   * Verify Razorpay Payment Signature
   */
  static verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const { orderId, paymentId, signature } = params;
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    const keySecret = this.getKeySecret();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Fetch payment details from Razorpay
   */
  static async getPaymentDetails(paymentId: string): Promise<any> {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    return await response.json();
  }

  /**
   * Returns public configuration for client SDK
   */
  static getPublicConfig() {
    return {
      keyId: this.getKeyId(),
      currency: 'INR',
    };
  }
}
