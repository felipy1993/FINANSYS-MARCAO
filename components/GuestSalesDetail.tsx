
import React from 'react';
import { Consumption, Product } from '../types';
import { Card } from './ui/Card';
import ConsumptionItemView from './ConsumptionItemView';

interface GuestSalesDetailProps {
  consumptions: Consumption[];
  products: Product[];
  onEditConsumption: (consumption: Consumption) => void;
  onDeleteConsumption: (consumptionId: string) => void;
}

const GuestSalesDetail: React.FC<GuestSalesDetailProps> = ({ consumptions, products, onEditConsumption, onDeleteConsumption }) => {

  return (
    <Card>
      <p className="text-onSurfaceMuted mb-4">
        Aqui está o histórico de todas as vendas rápidas que foram pagas no ato. Vendas finalizadas não podem ser editadas ou excluídas.
      </p>

      <div>
        <h3 className="text-xl font-semibold mb-2 text-onSurface">Histórico de Vendas Avulsas</h3>
        
        {consumptions.length > 0 ? (
          <div>
            {consumptions.map((c, index) => (
              <ConsumptionItemView 
                key={c.id} 
                consumption={c} 
                products={products}
                onEdit={() => onEditConsumption(c)} 
                onDelete={() => onDeleteConsumption(c.id)}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-onSurfaceMuted mt-6">Nenhuma venda avulsa registrada ainda.</p>
        )}
      </div>
    </Card>
  );
};

export default GuestSalesDetail;