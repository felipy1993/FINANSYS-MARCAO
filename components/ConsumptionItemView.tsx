
import React from 'react';
import { Consumption, Product } from '../types';

interface ConsumptionItemViewProps extends React.HTMLAttributes<HTMLDivElement> {
  consumption: Consumption;
  products: Product[];
  onEdit: () => void;
  onDelete: () => void;
  onRevert?: () => void;
}

const paymentMethodMap = {
    pix: "Pix",
    cash: "Dinheiro",
    card: "Cartão"
};

const ConsumptionItemView: React.FC<ConsumptionItemViewProps> = ({ consumption, products, onEdit, onDelete, onRevert, ...props }) => (
  <div className="border-t border-border py-3" {...props}>
      <div className="flex justify-between items-start text-sm">
          <div>
            <span className="font-semibold">{new Date(consumption.date).toLocaleDateString('pt-BR')}</span>
            {consumption.payment ? (
                <span className="ml-2 text-xs font-medium bg-green-500/10 text-green-300 px-2 py-1 rounded-full">
                    Pago ({paymentMethodMap[consumption.payment.method]})
                </span>
            ) : (
                <span className="ml-2 text-xs font-medium bg-red-500/10 text-red-300 px-2 py-1 rounded-full">Pendente</span>
            )}
          </div>
          <div className="flex items-center gap-2 -mr-2">
              {consumption.payment && onRevert && (
                <button onClick={onRevert} className="w-8 h-8 flex items-center justify-center text-primary hover:text-primary-light transition-colors" title="Estornar Pagamento">
                    <i className="fas fa-undo"></i>
                </button>
              )}
              {!consumption.payment && consumption.items.some(i => i.productId === 'payment-adjustment') && (
                <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center text-green-400 hover:text-green-300 transition-colors" title="Remover Abatimento">
                    <i className="fas fa-times-circle"></i>
                </button>
              )}
              <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center text-onSurfaceMuted hover:text-primary transition-colors" aria-label="Editar venda"><i className="fas fa-pencil-alt"></i></button>
              <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center text-onSurfaceMuted hover:text-red-400 transition-colors" aria-label="Excluir venda"><i className="fas fa-trash-alt"></i></button>
          </div>
      </div>
      <ul className="mt-2 list-disc list-inside text-onSurfaceMuted">
          {consumption.items.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              let displayName = product?.name || 'Produto';
              
              if (item.productId === 'partial-payment') displayName = 'Pagamento Parcial';
              if (item.productId === 'payment-adjustment') displayName = 'Abatimento de Pagto';

              const totalItemPrice = item.quantity * item.priceAtTime;
              return (
                  <li key={index} className={item.priceAtTime < 0 ? 'text-green-400 list-none ml-[-1rem]' : ''}>
                      {item.priceAtTime < 0 ? '-' : `${item.quantity}x`} {displayName} - R$ {Math.abs(totalItemPrice).toFixed(2)}
                  </li>
              );
          })}
      </ul>
      <div className="text-right font-bold text-onSurface mt-1">
        Total: R$ {consumption.items.reduce((acc, item) => acc + item.priceAtTime * item.quantity, 0).toFixed(2)}
      </div>
  </div>
);

export default ConsumptionItemView;