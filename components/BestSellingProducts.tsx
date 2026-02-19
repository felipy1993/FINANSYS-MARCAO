
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface BestSellingProductsProps {
  products: {
    name: string;
    quantity: number;
    totalValue: number;
  }[];
}

const BestSellingProducts: React.FC<BestSellingProductsProps> = ({ products }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedProducts = useMemo(() => {
    if (isExpanded) {
      return products;
    }
    return products.slice(0, 5);
  }, [products, isExpanded]);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-onSurface mb-4">Produtos Mais Vendidos</h3>
      {products.length > 0 ? (
        <>
          <ol className="space-y-3">
            {displayedProducts.map((product, index) => (
              <li key={product.name} className="flex items-center justify-between text-sm animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center">
                  <span className="text-onSurfaceMuted font-bold w-6 text-center mr-2">{index + 1}</span>
                  <span className="font-medium text-onSurface">{product.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary">R$ {product.totalValue.toFixed(2)}</span>
                  <span className="text-xs text-onSurfaceMuted block">{product.quantity} un.</span>
                </div>
              </li>
            ))}
          </ol>
          {products.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Ver menos' : 'Ver mais'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-onSurfaceMuted text-center mt-10">Nenhum produto vendido neste mês.</p>
      )}
    </Card>
  );
};

export default BestSellingProducts;
