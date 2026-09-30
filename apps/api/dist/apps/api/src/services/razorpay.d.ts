export interface CreateOrderParams {
    amount: number;
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
export declare class RazorpayService {
    private static getKeyId;
    private static getKeySecret;
    private static getAuthHeader;
    /**
     * Create an order on Razorpay
     * @param params { amount in INR, currency, receipt, notes }
     */
    static createOrder(params: CreateOrderParams): Promise<RazorpayOrderResponse>;
    /**
     * Verify Razorpay Payment Signature
     */
    static verifyPaymentSignature(params: {
        orderId: string;
        paymentId: string;
        signature: string;
    }): boolean;
    /**
     * Fetch payment details from Razorpay
     */
    static getPaymentDetails(paymentId: string): Promise<any>;
    /**
     * Returns public configuration for client SDK
     */
    static getPublicConfig(): {
        keyId: string;
        currency: string;
    };
}
