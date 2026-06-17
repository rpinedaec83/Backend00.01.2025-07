import { useSearchParams, Link } from 'react-router-dom';

export default function Success() {
  const [sp] = useSearchParams();
  const sessionId = sp.get('session_id');
  return (
    <div className="container py-5 text-center">
      <h3>Pago Exitoso</h3>
      <p>Session ID: {sessionId}</p>
      <Link to="/" className="btn btn-primary mt-3">Volver a la tienda</Link>
    </div>
  );
}