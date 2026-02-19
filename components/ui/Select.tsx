
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children, className, ...props }) => {
  return (
    <select 
      className={`block w-full pl-3 pr-10 py-2 text-base border-border bg-surface text-onSurface focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};
