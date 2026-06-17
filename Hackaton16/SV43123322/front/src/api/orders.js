import { api } from './http';
export const createOrder = () => api('/api/orders/create', { method:'POST' });
export const getOrder = (id) => api(`/api/orders/${id}`);