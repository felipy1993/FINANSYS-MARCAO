
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`${iconSizes[size]} relative flex-shrink-0`}>
        {/* Camada de Sombra Estilizada */}
        <div className="absolute inset-0 bg-indigo-600/10 blur-xl rounded-full"></div>
        
        {/* Imagem da Logo Oficial */}
        <img 
          src="/logo.png" 
          alt="FINANSYS MARCÃO" 
          className="w-full h-full object-contain relative drop-shadow-lg"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${textSizes[size]} font-black tracking-tighter text-white uppercase`}>
            FINANSYS
          </span>
          <span className={`${size === 'xl' ? 'text-lg' : 'text-[10px]'} font-bold tracking-[0.3em] text-indigo-400 mt-0.5`}>
            MARCÃO
          </span>
        </div>
      )}
    </div>
  );
};
