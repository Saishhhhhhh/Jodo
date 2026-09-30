"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class RazorpayService {
    static getKeyId() {
        return process.env.RAZORPAY_KEY_ID || 'rzp_test_ThqAXccEenS0Um';
    }
    static getKeySecret() {
        return process.env.RAZORPAY_KEY_SECRET || 'tYJwiAUbqAwYfJJrFTNJ6NER';
    }
    static getAuthHeader() {
        const keyId = this.getKeyId();
        const keySecret = this.getKeySecret();
        return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    }
    /**
     * Create an order on Razorpay
     * @param params { amount in INR, currency, receipt, notes }
     */
    static async createOrder(params) {
        const amountInPaise = Math.round(Number(params.amount) * 100);
        const currency = params.currency || 'INR';
        const payload = {
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
        const data = await response.json();
        if (!response.ok) {
            console.error('Razorpay order creation error:', data);
            throw new Error(data?.error?.description || 'Failed to create Razorpay order');
        }
        return data;
    }
    /**
     * Verify Razorpay Payment Signature
     */
    static verifyPaymentSignature(params) {
        const { orderId, paymentId, signature } = params;
        if (!orderId || !paymentId || !signature) {
            return false;
        }
        const keySecret = this.getKeySecret();
        const expectedSignature = crypto_1.default
            .createHmac('sha256', keySecret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');
        return expectedSignature === signature;
    }
    /**
     * Fetch payment details from Razorpay
     */
    static async getPaymentDetails(paymentId) {
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
exports.RazorpayService = RazorpayService;
//# sourceMappingURL=razorpay.js.map