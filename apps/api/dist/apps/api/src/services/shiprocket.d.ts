export declare class ShiprocketService {
    /**
     * Authenticate with Shiprocket to get a token
     */
    static authenticate(email: string, password: string): Promise<string>;
    /**
     * Create a Custom Order in Shiprocket
     */
    static createOrder(token: string, orderData: any): Promise<any>;
    /**
     * Assign Courier and Generate AWB
     */
    static generateAWB(token: string, shipmentId: number): Promise<any>;
}
