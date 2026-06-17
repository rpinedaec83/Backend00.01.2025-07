import { api } from './http';
export const createCheckout = (orderId) =>
  api(`/api/payments/checkout/${orderId}`, { method:'POST' });