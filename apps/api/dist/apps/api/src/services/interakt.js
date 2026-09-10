"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteraktService = void 0;
const axios_1 = __importDefault(require("axios"));
const INTERAKT_API_URL = 'https://api.interakt.ai/v1/public';
class InteraktService {
    /**
     * Send a template message via Interakt
     *
     * @param apiKey Base64 encoded API Key from Interakt
     * @param phoneNumber Destination phone number (including country code, e.g. +919876543210)
     * @param templateName Name of the template in Interakt
     * @param languageCode Language code (e.g., 'en', 'en-US')
     * @param bodyValues Array of strings to replace {{1}}, {{2}} in the template body
     */
    static async sendTemplateMessage(apiKey, phoneNumber, templateName, languageCode = 'en', bodyValues = []) {
        try {
            if (!apiKey || !phoneNumber || !templateName) {
                console.warn('Interakt Warning: Missing required fields for sending message', { phoneNumber, templateName });
                return null;
            }
            // Clean phone number (remove +, spaces, dashes)
            const cleanedPhone = phoneNumber.replace(/[\s\-\+]/g, '');
            let countryCode = '91'; // default to India
            let phone = cleanedPhone;
            if (cleanedPhone.length > 10) {
                countryCode = cleanedPhone.substring(0, cleanedPhone.length - 10);
                phone = cleanedPhone.substring(cleanedPhone.length - 10);
            }
            const payload = {
                countryCode,
                phoneNumber: phone,
                type: 'Template',
                template: {
                    name: templateName,
                    languageCode,
                    bodyValues
                }
            };
            const response = await axios_1.default.post(`${INTERAKT_API_URL}/message/`, payload, {
                headers: {
                    Authorization: `Basic ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Interakt Service Error:', error.response?.data || error.message);
            // We don't want to throw and break the checkout/fulfillment flow just because WhatsApp failed
            return null;
        }
    }
}
exports.InteraktService = InteraktService;
//# sourceMappingURL=interakt.js.map