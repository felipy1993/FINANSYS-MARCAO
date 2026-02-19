
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.type === 'text' || !props.type) {
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      e.target.value = e.target.value.toUpperCase();
      if (onChange) onChange(e);
      
      // Manter a posição do cursor após a conversão
      setTimeout(() => {
        e.target.setSelectionRange(start, end);
      }, 0);
    } else {
      if (onChange) onChange(e);
    }
  };

  return (
    <input
      className={`block w-full px-3 py-2 text-base border-border bg-surface text-onSurface placeholder-onSurfaceMuted/50 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm disabled:opacity-50 uppercase ${className}`}
      {...props}
      onChange={handleChange}
    />
  );
};
