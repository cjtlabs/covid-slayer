import { Outlet } from 'react-router-dom';
import { Card } from '../../components/ui/Card.tsx';

export function AuthLayout() {
  return (
    <div className="auth-page">
      <section className="auth-hero" aria-label="Covid Slayer introduction">
        <h1>Covid Slayer</h1>
        <p>
          Let's sterilize the Covid Monster.
        </p>
      </section>

      <Card className="form-card">
        <Outlet />
      </Card>
    </div>
  );
}
