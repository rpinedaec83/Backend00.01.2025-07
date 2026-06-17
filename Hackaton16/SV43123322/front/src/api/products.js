import { api } from './http';
export const listProducts = () => api('/api/products');
