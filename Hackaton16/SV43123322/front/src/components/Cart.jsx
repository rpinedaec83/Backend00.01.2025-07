import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { listProducts } from '../api/products';

export default function Cart() {
  const { cart, empty } = useCart();
  const [map,setMap] = useState({});
  useEffect(()=>{
    listProducts().then(d=>{
      const m = {};
      d.products.forEach(p=> m[p.id]=p);
      setMap(m);
    });
  },[]);
  const total = cart.reduce((acc,i)=> acc + (map[i.product_id]?.price_cents||0)*i.quantity,0);
  return (
    <div>
      <h4>Carrito</h4>
      {!cart.length && <p>Vacío</p>}
      {cart.map(i=> (
        <div key={i.product_id} className="d-flex justify-content-between border-bottom py-1">
          <span>{map[i.product_id]?.name} x {i.quantity}</span>
          <span>S/ {(((map[i.product_id]?.price_cents||0)/100)*i.quantity).toFixed(2)}</span>
        </div>
      ))}
      {cart.length>0 && (
        <>
          <div className="mt-2 fw-bold">Total: S/ {(total/100).toFixed(2)}</div>
          <button className="btn btn-sm btn-outline-danger mt-2" onClick={empty}>Vaciar</button>
        </>
      )}
    </div>
  );
}