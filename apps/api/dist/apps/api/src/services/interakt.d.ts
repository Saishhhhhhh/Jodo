export declare class InteraktService {
    /**
     * Send a template message via Interakt
     *
     * @param apiKey Base64 encoded API Key from Interakt
     * @param phoneNumber Destination phone number (including country code, e.g. +919876543210)
     * @param templateName Name of the template in Interakt
     * @param languageCode Language code (e.g., 'en', 'en-US')
     * @param bodyValues Array of strings to replace {{1}}, {{2}} in the template body
     */
    static sendTemplateMessage(apiKey: string, phoneNumber: string, templateName: string, languageCode?: string, bodyValues?: string[]): Promise<any>;
}
