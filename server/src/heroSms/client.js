"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroSmsClient = void 0;
const axios_1 = __importDefault(require("axios"));
const endpoints_1 = require("./endpoints");
class HeroSmsClient {
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async request(action, params = {}) {
        try {
            const response = await axios_1.default.get(endpoints_1.HERO_SMS_BASE_URL, {
                params: {
                    api_key: this.apiKey,
                    action,
                    ...params,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error(`HeroSms API Error (${action}):`, error.message);
            throw new Error(error.response?.data || error.message);
        }
    }
    async getBalance() {
        const data = await this.request(endpoints_1.ACTIONS.GET_BALANCE);
        // Format: ACCESS_BALANCE:<amount>
        if (typeof data === 'string' && data.startsWith('ACCESS_BALANCE:')) {
            return parseFloat(data.split(':')[1]);
        }
        throw new Error(`Unexpected balance response: ${data}`);
    }
    async getPrices(country, service) {
        return this.request(endpoints_1.ACTIONS.GET_PRICES, { country, service });
    }
    async getNumber(service, country, operator) {
        const data = await this.request(endpoints_1.ACTIONS.GET_NUMBER, { service, country, operator });
        // Format: ACCESS_NUMBER:<id>:<number>
        if (typeof data === 'string' && data.startsWith('ACCESS_NUMBER:')) {
            const [, id, number] = data.split(':');
            return { id, number };
        }
        throw new Error(`Order failed: ${data}`);
    }
    async getStatus(id) {
        return this.request(endpoints_1.ACTIONS.GET_STATUS, { id });
    }
    async setStatus(id, status) {
        return this.request(endpoints_1.ACTIONS.SET_STATUS, { id, status });
    }
    async getActiveActivations() {
        return this.request(endpoints_1.ACTIONS.GET_ACTIVE_ACTIVATIONS);
    }
}
exports.HeroSmsClient = HeroSmsClient;
//# sourceMappingURL=client.js.map