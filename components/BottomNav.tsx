
import React, { useState, useEffect } from 'react';
import { View } from '../App';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onAddConsumptionClick: () => void;
  isAddingConsumption: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange, onAddConsumptionClick, isAddingConsumption }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Impede que o mini-infobar apareça no mobile
      e.preventDefault();
      // Guarda o evento para disparar depois
      setDeferredPrompt(e);
      // Mostra o botão de instalar
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      // Limpa após instalado
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostra o prompt de instalação
    deferredPrompt.prompt();
    
    // Espera pela resposta do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-lg z-40 md:hidden">
      <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center h-full text-[10px] transition-colors ${currentView === 'dashboard' && !isAddingConsumption ? 'text-primary' : 'text-onSurfaceMuted hover:text-primary'}`}
        >
          <i className="fas fa-chart-pie fa-lg mb-1"></i>
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onViewChange('companies')}
          className={`flex-1 flex flex-col items-center justify-center h-full text-[10px] transition-colors ${currentView === 'companies' && !isAddingConsumption ? 'text-primary' : 'text-onSurfaceMuted hover:text-primary'}`}
        >
          <i className="fas fa-building fa-lg mb-1"></i>
          <span>Empresas</span>
        </button>
        
        <button
          onClick={() => onViewChange('products')}
          className={`flex-1 flex flex-col items-center justify-center h-full text-[10px] transition-colors ${currentView === 'products' && !isAddingConsumption ? 'text-primary' : 'text-onSurfaceMuted hover:text-primary'}`}
        >
          <i className="fas fa-box-open fa-lg mb-1"></i>
          <span>Produtos</span>
        </button>

        <button
          onClick={onAddConsumptionClick}
          className={`flex-1 flex flex-col items-center justify-center h-full text-[10px] font-semibold transition-colors ${isAddingConsumption ? 'text-primary' : 'text-onSurfaceMuted hover:text-primary'}`}
        >
          <i className="fas fa-plus-circle fa-lg mb-1"></i>
          <span>Venda</span>
        </button>

        {showInstallBtn && (
          <button
            onClick={handleInstallClick}
            className="flex-1 flex flex-col items-center justify-center h-full text-[10px] font-black text-indigo-400 animate-pulse border-l border-border"
          >
            <i className="fas fa-download fa-lg mb-1"></i>
            <span>INSTALAR</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;