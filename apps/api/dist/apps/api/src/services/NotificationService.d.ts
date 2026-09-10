export declare class NotificationService {
    /**
     * Evaluate inventory states for a specific item and trigger notifications if state changed
     */
    static checkInventoryItem(item: any): Promise<void>;
    static checkExpiringReservations(): Promise<void>;
}
