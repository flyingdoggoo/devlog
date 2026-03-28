import React from 'react';
import { cn } from '@utils/index';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'w-full bg-[#1a1a1a] rounded-lg border border-[#333333]',
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('px-8 pt-8 pb-4', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn('px-8 pb-8', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('px-8 pt-4 pb-8', className)}>
      {children}
    </div>
  );
}
