import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../utils/cn.ts';

type CardProps = {
  className?: string;
  title?: string;
  headerAction?: ReactNode;
}

export function Card({ className, title, headerAction, children }: PropsWithChildren<CardProps>) {
  return (
    <div className={cn('card', className)}>
      {(title || headerAction) && (
        <div className="card-header">
          {title ? <h2>{title}</h2> : null}
          {headerAction}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
}
