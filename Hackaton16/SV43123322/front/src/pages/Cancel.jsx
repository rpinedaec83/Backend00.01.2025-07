import { Link } from 'react-router-dom';
export default function Cancel() {
  return (
    <div className="container py-5 text-center">
      <h3>Pago Cancelado</h3>
      <p>Tu pago no fue completado.</p>
      <Link to="/" className="btn btn-secondary mt-3">Volver</Link>
    </div>
  );
}