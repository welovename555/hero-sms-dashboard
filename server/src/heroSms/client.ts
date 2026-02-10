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
        timeout: 15000
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
    if (data === 'BAD_KEY') throw new Error('API Key ไม่ถูกต้อง');
    throw new Error(`ไม่สามารถอ่านยอดเงิน: ${data}`);
  }

  async getServices(country?: number) {
    return this.request(ACTIONS.GET_SERVICES, { country, lang: 'en' });
  }

  async getCountries() {
    return this.request(ACTIONS.GET_COUNTRIES);
  }

  async getPrices(service?: string, country?: number) {
    return this.request(ACTIONS.GET_PRICES, { service, country });
  }

  async getTopCountries(service: string) {
    return this.request(ACTIONS.GET_TOP_COUNTRIES, { service, freePrice: 'true' });
  }

  async getNumber(service: string, country: number) {
    const data = await this.request(ACTIONS.GET_NUMBER, { service, country });
    
    // V2 returns JSON usually
    if (typeof data === 'object' && data.activationId) {
      return {
        id: String(data.activationId),
        number: String(data.phoneNumber || '').replace(/^\+/, ''),
        cost: data.activationCost,
        operator: data.activationOperator,
        country: data.countryCode
      };
    }

    // Handle text errors
    if (data === 'NO_NUMBERS') throw new Error('📵 ไม่มีเบอร์ว่างสำหรับบริการนี้');
    if (data === 'NO_BALANCE') throw new Error('💸 ยอดเงินไม่เพียงพอ');
    if (data === 'BAD_KEY') throw new Error('🔑 API Key ไม่ถูกต้อง');
    
    throw new Error(`ไม่สามารถซื้อเบอร์: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  async getStatus(id: string) {
    const result = await this.request(ACTIONS.GET_STATUS, { id });
    if (typeof result === 'string') {
      if (result.startsWith('STATUS_OK:')) {
        return { status: 'ok', code: result.split(':')[1] };
      }
      if (result === 'STATUS_WAIT_CODE') return { status: 'waiting', code: null };
      if (result === 'STATUS_WAIT_RETRY') return { status: 'retry', code: null };
      if (result === 'STATUS_CANCEL') return { status: 'cancelled', code: null };
      if (result === 'NO_ACTIVATION') throw new Error('ไม่พบรายการนี้');
    }
    return { status: 'unknown', raw: result };
  }

  async setStatus(id: string, status: number) {
    return this.request(ACTIONS.SET_STATUS, { id, status });
  }

  async getActiveActivations() {
    return this.request(ACTIONS.GET_ACTIVE_ACTIVATIONS);
  }
}
