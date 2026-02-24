
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
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 shadow-[0_-4px_10px_rgba(0,0,0,0.3)] z-40 md:hidden px-4 pb-safe">
      <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center h-full text-[10px] transition-all duration-300 ${currentView === 'dashboard' && !isAddingConsumption ? 'text-primary scale-110' : 'text-onSurfaceMuted opacity-60'}`}
        >
          <i className={`fas fa-chart-pie text-lg mb-1`}></i>
          <span className="font-black uppercase tracking-tighter">Início</span>
        </button>
        <button
          onClick={() => onViewChange('companies')}
          className={`flex-1 flex flex-col items-center justify-center h-full text-[10px] transition-all duration-300 ${currentView === 'companies' && !isAddingConsumption ? 'text-primary scale-110' : 'text-onSurfaceMuted opacity-60'}`}
        >
          <i className={`fas fa-building text-lg mb-1`}></i>
          <span className="font-black uppercase tracking-tighter">Empresas</span>
        </button>
        
        <button
          onClick={onAddConsumptionClick}
          className={`relative -top-4 w-14 h-14 bg-primary text-white rounded-2xl shadow-glow-primary flex items-center justify-center transition-all active:scale-95 flex-shrink-0 z-50`}
        >
          <i className="fas fa-plus text-xl"></i>
        </button>

        <button
          onClick={() => onViewChange('products')}
          className={`flex-1 flex flex-col items-center justify-center h-full text-[10px] transition-all duration-300 ${currentView === 'products' && !isAddingConsumption ? 'text-primary scale-110' : 'text-onSurfaceMuted opacity-60'}`}
        >
          <i className={`fas fa-box-open text-lg mb-1`}></i>
          <span className="font-black uppercase tracking-tighter">Estoque</span>
        </button>

        {showInstallBtn ? (
          <button
            onClick={handleInstallClick}
            className="flex-1 flex flex-col items-center justify-center h-full text-[10px] font-black text-accent animate-pulse"
          >
            <i className="fas fa-download text-lg mb-1"></i>
            <span>BAIXAR</span>
          </button>
        ) : (
             <button
                onClick={() => onViewChange('dashboard')} // Placeholder or extra button
                className={`flex-1 flex flex-col items-center justify-center h-full text-[10px] transition-all duration-300 opacity-60 text-onSurfaceMuted`}
            >
                <i className={`fas fa-ellipsis-h text-lg mb-1`}></i>
                <span className="font-black uppercase tracking-tighter">Mais</span>
            </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;