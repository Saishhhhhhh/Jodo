import axios from 'axios';

const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';

export class ShiprocketService {
  /**
   * Authenticate with Shiprocket to get a token
   */
  static async authenticate(email: string, password: string): Promise<string> {
    try {
      const response = await axios.post(`${SHIPROCKET_API}/auth/login`, {
        email,
        password,
      });
      return response.data.token;
    } catch (error: any) {
      console.error('Shiprocket Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket. Please check your credentials.');
    }
  }

  /**
   * Create a Custom Order in Shiprocket
   */
  static async createOrder(token: string, orderData: any): Promise<any> {
    try {
      // Map Jodo Order to Shiprocket Payload
      const payload = {
        order_id: orderData.orderNumber,
        order_date: new Date(orderData.createdAt).toISOString().split('T')[0],
        pickup_location: 'Primary', // Needs to be configured in Shiprocket dashboard
        
        billing_customer_name: orderData.shippingAddress.firstName,
        billing_last_name: orderData.shippingAddress.lastName,
        billing_address: orderData.shippingAddress.address1,
        billing_address_2: orderData.shippingAddress.address2 || '',
        billing_city: orderData.shippingAddress.city,
        billing_pincode: orderData.shippingAddress.zip,
        billing_state: orderData.shippingAddress.state,
        billing_country: orderData.shippingAddress.country,
        billing_email: orderData.customerEmail,
        billing_phone: orderData.shippingAddress.phone || '0000000000',
        
        shipping_is_billing: true,
        
        order_items: orderData.items.map((item: any) => ({
          name: item.title,
          sku: item.sku || `SKU-${Math.floor(Math.random() * 1000)}`,
          units: item.quantity,
          selling_price: item.price,
        })),
        
        payment_method: orderData.paymentStatus === 'paid' ? 'Prepaid' : 'COD',
        sub_total: orderData.totalAmount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
      };

      const response = await axios.post(`${SHIPROCKET_API}/orders/create/ad-hoc`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data; // contains order_id, shipment_id
    } catch (error: any) {
      console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create order in Shiprocket');
    }
  }

  /**
   * Assign Courier and Generate AWB
   */
  static async generateAWB(token: string, shipmentId: number): Promise<any> {
    try {
      const response = await axios.post(
        `${SHIPROCKET_API}/courier/assign/awb`,
        { shipment_id: shipmentId, courier_id: "" }, // empty courier_id lets Shiprocket auto-assign
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Shiprocket AWB Error:', error.response?.data || error.message);
      return { error: true, message: error.response?.data?.message || 'Failed to generate AWB' };
    }
  }
}
