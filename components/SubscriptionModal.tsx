
import React from 'react';
import { Modal } from './ui/Modal';
import { Subscription } from '../types';
import { Button } from './ui/Button';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, subscription }) => {
  const handleCopyPix = () => {
    if (subscription.pixCopiaCola) {
      navigator.clipboard.writeText(subscription.pixCopiaCola);
      alert('Código Pix Copia e Cola copiado!');
    } else {
      alert('Código Pix ainda não configurado pelo administrador.');
    }
  };

  const handleSendProof = () => {
    const message = encodeURIComponent(`Olá! Quero renovar minha assinatura do Finansys Marcão.`);
    window.open(`https://wa.me/55${subscription.pixKey.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renovar Assinatura">
      <div className="space-y-6">
        <div className="text-center p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <p className="text-sm text-indigo-300 font-medium">Assinatura Mensal</p>
          <p className="text-3xl font-black text-white mt-1">
            {subscription.monthlyValue > 0 ? `R$ ${subscription.monthlyValue.toFixed(2)}` : 'Consulte o valor'}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/30">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 text-center">Pagamento via PIX</p>
          
          <div className="aspect-square bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden max-w-[200px] mx-auto">
            <div className="text-slate-300 text-center p-4">
               <i className="fas fa-qrcode text-5xl mb-2 text-slate-400"></i>
               <p className="text-[8px] font-bold uppercase text-slate-500">QR Code</p>
            </div>
          </div>

          <button 
            onClick={handleCopyPix}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <i className="fas fa-copy"></i> COPIAR PIX COPIA E COLA
          </button>
          
          <p className="text-[10px] text-slate-500 text-center mt-3">Chave: {subscription.pixKey}</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleSendProof}
            className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all"
          >
            <i className="fab fa-whatsapp mr-2 text-lg"></i> FALAR NO WHATSAPP
          </Button>
          <button 
            onClick={onClose}
            className="w-full text-[10px] text-slate-500 uppercase font-black tracking-widest hover:text-slate-400 transition-colors"
          >
            VOLTAR AO SISTEMA
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;
