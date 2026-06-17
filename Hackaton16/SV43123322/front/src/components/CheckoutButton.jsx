import { useState } from 'react';
import { createOrder } from '../api/orders';
import { createCheckout } from '../api/payments';
import { useCart } from '../context/CartContext';

export default function CheckoutButton() {
  const { cart } = useCart();
  const [loading,setLoading] = useState(false);
  const disabled = !cart.length || loading;

  const handle = async () => {
    try {
      setLoading(true);
      const { order } = await createOrder();
      const res = await createCheckout(order.orderId);
      window.location.href = res.checkout_url;
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button disabled={disabled} className="btn btn-success w-100 mt-3" onClick={handle}>
      {loading ? 'Procesando...' : 'Pagar con Stripe'}
    </button>
  );
}