import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { useAppSelector } from '../hooks/index.ts';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, user, navigate]);
  
  if (token && user) {
    return (
      <div className="hero-section" role="main">
        <div>
          <h1>Redirecting to Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-section" role="main">
      <div>
        <h1 className="hero-title">Battle the Covid Monster</h1>
        <p className="hero-subtitle">
          Covid Slayer blends strategy and speed with a mission to protect humanity. Train, attack,
          and heal in real time while tracking your stats and match history.
        </p>
        <div className="profile-actions">
          <Button variant="primary" onClick={() => navigate('/signup')}>
            Start the Fight
          </Button>
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </div>

      <div className="feature-grid" aria-label="Game highlights">
        <Card title="Strategic Combat">
          <p>Choose your move wisely—attack, blast, heal, or surrender. Every action has impact.</p>
        </Card>
        <Card title="Live Commentary">
          <p>Track the battle in real time with a rich action log and animated feedback.</p>
        </Card>
        <Card title="Player Progression">
          <p>Review your win rate, damage stats, and history to refine your approach.</p>
        </Card>
      </div>
    </div>
  );
}
