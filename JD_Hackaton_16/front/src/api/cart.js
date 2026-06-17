import { api } from './http';

export const getCart = () => api('/api/cart');
export const addToCart = (product_id, quantity=1) =>
  api('/api/cart/add', { method:'POST', body: JSON.stringify({ product_id, quantity }) });
export const clearCart = () => api('/api/cart/clear', { method:'POST' });