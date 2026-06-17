import { createContext, useContext, useEffect, useState } from 'react';
import { getCart, addToCart, clearCart } from '../api/cart';

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [cart,setCart] = useState([]);
  const refresh = () => getCart().then(d=> setCart(d.cart));
  useEffect(()=>{ refresh(); },[]);
  const add = async (id, q=1) => { await addToCart(id,q); refresh(); };
  const empty = async () => { await clearCart(); refresh(); };
  return <CartCtx.Provider value={{ cart, add, empty, refresh }}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);