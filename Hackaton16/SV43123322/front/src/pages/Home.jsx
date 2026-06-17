import ProductList from '../components/ProductList';
import Cart from '../components/Cart';
import CheckoutButton from '../components/CheckoutButton';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading, loginGoogle, logout } = useAuth();
  if (loading) return <p>Cargando...</p>;
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Pizza Jhoseps</h2>
        <div>
          {user ? (
            <>
              <span className="me-2">Hola, {user.name}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={logout}>Salir</button>
            </>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={loginGoogle}>Ingresar con Google</button>
          )}
        </div>
      </div>
      <div className="row g-4">
        <div className="col-md-8">
          <ProductList />
        </div>
        <div className="col-md-4">
          {user ? (
            <>
              <Cart />
              <CheckoutButton />
            </>
          ) : <p>Inicia sesión para comprar.</p>}
        </div>
      </div>
    </div>
  );
}