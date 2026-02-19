
import React from 'react';
import { Subscription } from '../types';
import { Logo } from './ui/Logo';
import { Button } from './ui/Button';

interface SubscriptionPaywallProps {
  subscription: Subscription;
}

const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({ subscription }) => {
  const handleCopyPix = () => {
    if (subscription.pixCopiaCola) {
      navigator.clipboard.writeText(subscription.pixCopiaCola);
      alert('Código Pix Copia e Cola copiado!');
    } else {
      alert('Código Pix ainda não configurado.');
    }
  };

  const handleSendProof = () => {
    const message = encodeURIComponent(`Olá! Realizei o pagamento da mensalidade do Finansys Marcão. Segue o comprovante.`);
    window.open(`https://wa.me/55${subscription.pixKey.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-3xl p-8 border border-slate-700/50 shadow-2xl text-center space-y-6">
        <div className="flex flex-col items-center">
          <Logo size="xl" className="mb-4 grayscale" />
          <h1 className="text-2xl font-black text-white">ACESSO SUSPENSO</h1>
          <p className="text-slate-400 text-sm mt-2">Sua assinatura expirou. Realize o pagamento para continuar utilizando o sistema.</p>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/30">
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Pagamento via PIX</p>
          
          <div className="aspect-square bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden">
            {/* Espaço para o QR Code real no futuro */}
            <div className="text-slate-300 text-center p-4">
               <i className="fas fa-qrcode text-6xl mb-2"></i>
               <p className="text-[10px] font-bold uppercase">QR Code será exibido aqui</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleCopyPix}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <i className="fas fa-copy"></i> COPIAR PIX COPIA E COLA
            </button>
            <p className="text-[10px] text-slate-500 font-medium">Chave: {subscription.pixKey || 'A definir'}</p>
          </div>
        </div>

        <Button 
          onClick={handleSendProof}
          className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black transition-all"
        >
          <i className="fab fa-whatsapp mr-2 text-xl"></i> ENVIAR COMPROVANTE
        </Button>

        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Tecnologia Argent Cloud</p>
      </div>
    </div>
  );
};

export default SubscriptionPaywall;
