import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/ui/Button.tsx';
import { useAppDispatch, useAppSelector } from '../hooks/index.ts';
import { loginThunk, clearAuthError } from '../features/auth/authSlice.ts';
import type { LoginPayload } from '../types/auth.ts';
import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, token } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (token) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [token, navigate, location.state]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = (values: FormValues) => {
    dispatch(loginThunk(values as LoginPayload));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="Login form">
      <div className="form-field">
        <label className="form-label" htmlFor="email">Email</label>
        <input id="email" className="form-input" type="email" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="password">Password</label>
        <input id="password" className="form-input" type="password" {...register('password')} />
        {errors.password && <span className="form-error">{errors.password.message}</span>}
      </div>

      {error ? <div className="error-banner" role="alert">{error}</div> : null}

      <div className="profile-actions">
        <Button type="submit" variant="primary" loading={status === 'loading'}>
          Login
        </Button>
        <Link to="/signup" className="nav-link">Create account</Link>
      </div>
    </form>
  );
}
