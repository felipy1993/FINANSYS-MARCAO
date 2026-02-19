
import React from 'react';
import { Subscription } from '../types';

interface SubscriptionBannerProps {
  subscription: Subscription;
  onRenew: () => void;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ subscription, onRenew }) => {
  const daysRemaining = Math.ceil((new Date(subscription.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining > 5) return null;

  const isUrgent = daysRemaining <= 1;

  return (
    <div className={`w-full py-2 px-4 text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
      isUrgent ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-slate-900'
    }`}>
      <i className={`fas ${isUrgent ? 'fa-exclamation-triangle' : 'fa-clock'}`}></i>
      <span>
        {daysRemaining <= 0 
          ? "Sua assinatura vence hoje! Regularize para evitar bloqueio." 
          : `Sua assinatura vence em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}.`}
      </span>
      <button 
        onClick={onRenew}
        className={`px-3 py-1 rounded-full text-[10px] uppercase font-black transition-all ${
          isUrgent ? 'bg-white text-rose-600' : 'bg-slate-900 text-white'
        }`}
      >
        Renovar Agora
      </button>
    </div>
  );
};

export default SubscriptionBanner;
