import axios from 'axios';
import { HERO_SMS_BASE_URL, ACTIONS } from './endpoints.js';

export class HeroSmsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(action: string, params: Record<string, any> = {}) {
    try {
      const response = await axios.get(HERO_SMS_BASE_URL, {
        params: {
          api_key: this.apiKey,
          action,
          ...params,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`HeroSms API Error (${action}):`, error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  async getBalance() {
    const data = await this.request(ACTIONS.GET_BALANCE);
    if (typeof data === 'string' && data.startsWith('ACCESS_BALANCE:')) {
      return parseFloat(data.split(':')[1] || '0');
    }
    throw new Error(`Unexpected balance response: ${data}`);
  }

  async getPrices(country?: number, service?: string) {
    return this.request(ACTIONS.GET_PRICES, { country, service });
  }

  async getNumber(service: string, country: number, operator?: string) {
    const data = await this.request(ACTIONS.GET_NUMBER, { service, country, operator });
    if (typeof data === 'string' && data.startsWith('ACCESS_NUMBER:')) {
      const [, id, number] = data.split(':');
      return { id, number };
    }
    throw new Error(`Order failed: ${data}`);
  }

  async getStatus(id: string) {
    return this.request(ACTIONS.GET_STATUS, { id });
  }

  async setStatus(id: string, status: number) {
    return this.request(ACTIONS.SET_STATUS, { id, status });
  }

  async getActiveActivations() {
    return this.request(ACTIONS.GET_ACTIVE_ACTIVATIONS);
  }
}
