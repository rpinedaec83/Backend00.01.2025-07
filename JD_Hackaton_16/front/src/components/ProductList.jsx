import { useEffect, useState } from 'react';
import { listProducts } from '../api/products';
import { useCart } from '../context/CartContext';

export default function ProductList() {
  const [products,setProducts] = useState([]);
  const { add } = useCart();

  useEffect(()=>{
    listProducts().then(d=> setProducts(d.products));
  },[]);

  return (
    <div className="row g-3">
      {products.map(p=>(
        <div key={p.id} className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{p.name}</h5>
              <small className="text-muted">{p.category}</small>
              {p.description && <p className="mt-2 flex-grow-1">{p.description.slice(0,120)}</p>}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <strong>S/ {(p.price_cents/100).toFixed(2)}</strong>
                <button className="btn btn-sm btn-primary" onClick={()=>add(p.id,1)}>Agregar</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}