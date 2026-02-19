
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = 'font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out inline-flex items-center justify-center transform active:scale-95';
  
  const variantClasses = {
    primary: 'bg-primary text-onPrimary hover:bg-primary-hover focus:ring-primary disabled:bg-primary/50 disabled:cursor-not-allowed',
    secondary: 'bg-secondary text-white hover:bg-emerald-600 focus:ring-secondary disabled:bg-secondary/50',
    outline: 'bg-transparent border border-border text-onSurfaceMuted hover:bg-border/40 hover:text-onSurface focus:ring-primary'
  };

  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  };
  
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
