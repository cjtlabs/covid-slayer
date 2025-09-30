import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/ui/Button.tsx';
import { useAppDispatch, useAppSelector } from '../hooks/index.ts';
import { signupThunk, clearAuthError } from '../features/auth/authSlice.ts';
import type { SignupPayload } from '../types/auth.ts';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const schema = z.object({
  fullname: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  ),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, token } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = (values: FormValues) => {
    dispatch(signupThunk(values as SignupPayload));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="Signup form">
      <div className="form-field">
        <label className="form-label" htmlFor="fullname">Full name</label>
        <input id="fullname" className="form-input" type="text" {...register('fullname')} />
        {errors.fullname && <span className="form-error">{errors.fullname.message}</span>}
      </div>

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
          Create account
        </Button>
        <Link to="/login" className="nav-link">Already have an account?</Link>
      </div>
    </form>
  );
}
