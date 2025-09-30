import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '../../components/ui/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../hooks/index.ts';
import { logout } from '../auth/authSlice.ts';

export function MainLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user, profileStatus } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!token && profileStatus !== 'loading') {
      navigate('/login');
    }
  }, [token, navigate, profileStatus]);

  if (!token && profileStatus === 'loading') {
    return (
      <div className="sidebar-layout">
        <div className="main-content" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
          <div>Validating session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-layout">
      <aside className="sidebar" role="navigation" aria-label="Primary">
        <div className="sidebar-header">Covid Slayer</div>
        {user ? (
          <div
            style={{
              marginBottom: '1rem',
              fontSize: '0.9rem',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{user.fullname}</div>
              <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
            </div>

            <Button
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
              style={{
                padding: '0.3rem 0.8rem',
                fontSize: '0.8rem',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#e74c3c',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Logout
            </Button>
          </div>
        ) : null}
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/game" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Game
          </NavLink>
        </nav>
        <div style={{ marginTop: '1.25rem' }}>
          {token ? (
            <Button
              variant="ghost"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
            >
              Logout
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
