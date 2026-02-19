
import React from 'react';
import { Logo } from './ui/Logo';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: string;
  onLogout?: () => void;
  showLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, onAction, actionIcon, onLogout, showLogo }) => {
  return (
    <header className="bg-surface shadow-md border-b border-border sticky top-0 z-30">
      <div className="max-w-4xl mx-auto py-3 px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          {onBack && (
            <button onClick={onBack} className="mr-3 text-onSurfaceMuted hover:text-onSurface transition-colors h-10 w-10 flex items-center justify-center -ml-2">
              <i className="fas fa-arrow-left fa-lg"></i>
            </button>
          )}
          {showLogo && !onBack ? (
            <Logo size="sm" />
          ) : (
            <h1 className="text-xl font-bold text-onSurface truncate">{title}</h1>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onAction && actionIcon && (
            <button onClick={onAction} className="text-primary hover:text-primary-hover transition-colors h-10 w-10 flex items-center justify-center">
              <i className={`${actionIcon} fa-lg`}></i>
            </button>
          )}
          {onLogout && (
            <button onClick={onLogout} title="Sair do Sistema" className="text-rose-400 hover:text-rose-500 transition-colors h-10 w-10 flex items-center justify-center border-l border-border pl-2">
              <i className="fas fa-sign-out-alt fa-lg"></i>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;