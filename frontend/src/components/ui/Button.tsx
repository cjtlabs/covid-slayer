import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn.ts';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading = false, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          `btn-${variant}`,
          loading ? 'btn-loading' : undefined,
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <span className="btn-spinner" aria-hidden="true" />}
        {icon ? <span className="btn-icon">{icon}</span> : null}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
