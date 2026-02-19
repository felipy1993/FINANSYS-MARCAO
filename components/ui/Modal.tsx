
import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else if (isAnimating) {
      // Quando fechar por prop, espera a animação terminar para remover do DOM
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAnimating]);

  if (!isAnimating) return null;

  const handleClose = () => {
    // Wait for animation to finish before calling parent's onClose
    setTimeout(() => {
        setIsAnimating(false);
        onClose();
    }, 200); // Duration should match animation-duration
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-200 ${isOpen ? 'bg-black bg-opacity-50' : 'bg-opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-surface rounded-lg shadow-xl w-11/12 max-w-lg m-4 flex flex-col max-h-[90vh] ${isOpen ? 'animate-scale-in' : 'animate-scale-out'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border shrink-0">
          <h2 className="text-xl font-bold text-onSurface">{title}</h2>
          <button onClick={handleClose} className="text-onSurfaceMuted hover:text-onSurface">
            <i className="fas fa-times fa-lg"></i>
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
