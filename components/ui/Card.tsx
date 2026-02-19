
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  const interactiveClasses = props.onClick ? 'hover:-translate-y-1 hover:border-primary/80' : '';
  
  return (
    <div 
      className={`bg-surface p-4 sm:p-6 rounded-lg border border-border transition-all duration-200 ease-in-out ${interactiveClasses} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};
