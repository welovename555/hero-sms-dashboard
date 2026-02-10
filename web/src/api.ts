import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;

export const getBalance = () => api.get('/balance').then(res => res.data);
export const getPrices = (country?: number, service?: string) => 
  api.get('/prices', { params: { country, service } }).then(res => res.data);
export const buyNumber = (country: number, service: string, operator?: string) => 
  api.post('/orders/buy', { country, service, operator }).then(res => res.data);
export const getOrders = () => api.get('/orders').then(res => res.data);
export const getOrderStatus = (id: string) => api.get(`/orders/${id}/status`).then(res => res.data);
export const setOrderStatus = (id: string, status: number) => 
  api.post(`/orders/${id}/action`, { status }).then(res => res.data);
export const saveApiKey = (apiKey: string) => api.post('/session/key', { apiKey }).then(res => res.data);
export const clearApiKey = () => api.delete('/session/key').then(res => res.data);
export const checkAuth = () => api.get('/session/check').then(res => res.data);
