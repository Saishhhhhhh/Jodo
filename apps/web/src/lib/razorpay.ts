export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpayFailureResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id?: string;
    };
  };
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag is already being loaded
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      // In case it already finished loading
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout(
  options: RazorpayOptions,
  onFailure?: (response: RazorpayFailureResponse) => void
): void {
  if (typeof window === 'undefined' || !(window as any).Razorpay) {
    throw new Error('Razorpay SDK is not loaded. Please ensure you are connected to the internet.');
  }

  const rzp = new (window as any).Razorpay(options);

  rzp.on('payment.failed', (response: RazorpayFailureResponse) => {
    console.error('Razorpay payment failed:', response.error);
    if (onFailure) {
      onFailure(response);
    } else {
      alert(`Payment failed: ${response.error?.description || 'Your payment was not completed.'}`);
    }
  });

  rzp.open();
}
