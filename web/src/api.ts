import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;

export const getBalance = () => api.get('/balance').then(res => res.data);
export const getServices = (country?: number) => api.get('/services', { params: { country } }).then(res => res.data);
export const getCountries = () => api.get('/countries').then(res => res.data);
export const getTopPrices = (service: string) => api.get('/prices/top', { params: { service } }).then(res => res.data);
export const buyNumber = (country: number, service: string) => api.post('/orders/buy', { country, service }).then(res => res.data);
export const getActiveOrders = () => api.get('/orders/active').then(res => res.data);
export const getOrderStatus = (id: string) => api.get(`/orders/${id}/status`).then(res => res.data);
export const setOrderStatus = (id: string, status: number) => api.post(`/orders/${id}/action`, { status }).then(res => res.data);
export const saveApiKey = (apiKey: string, persist: boolean) => api.post('/session/key', { apiKey, persist }).then(res => res.data);
export const clearApiKey = (clearPersist: boolean) => api.delete('/session/key', { params: { clearPersist } }).then(res => res.data);
export const checkConfig = () => api.get('/config').then(res => res.data);
