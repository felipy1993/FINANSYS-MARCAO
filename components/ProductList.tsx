
import React, { useMemo } from 'react';
import { Product } from '../types';
import { Card } from './ui/Card';

interface ProductListProps {
  products: Product[];
  onUpdateStock: (productId: string, delta: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onUpdateStock, onEdit, onDelete }) => {
  let itemIndex = 0;
  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!acc[product.type]) {
        acc[product.type] = [];
      }
      acc[product.type].push(product);
      return acc;
    }, {} as Record<Product['type'], Product[]>);
  }, [products]);

  const categoryTitles: Record<Product['type'], string> = {
    snack: 'Salgados',
    food: 'Comidas',
    drink: 'Bebidas',
    dessert: 'Sobremesas'
  };

  const categoryOrder: Product['type'][] = ['snack', 'food', 'drink', 'dessert'];

  const getTypeLabel = (type: Product['type']) => {
      const map = {
          snack: 'Salgado',
          food: 'Comida',
          drink: 'Bebida',
          dessert: 'Sobremesa'
      }
      return map[type];
  }

  return (
    <div className="space-y-6">
      {categoryOrder.map(category => (
        groupedProducts[category] && groupedProducts[category].length > 0 && (
          <section key={category}>
            <h2 className="text-xl font-bold text-onSurface mb-3">{categoryTitles[category]}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groupedProducts[category].map(product => {
                const currentIndex = itemIndex++;
                return (
                    <Card 
                        key={product.id}
                        className="animate-fade-in-up group relative overflow-hidden"
                        style={{ animationDelay: `${currentIndex * 50}ms` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg text-onSurface">{product.name}</p>
                          <p className="text-sm text-onSurfaceMuted capitalize">{getTypeLabel(product.type)}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onEdit(product)}
                            className="p-2 rounded-full bg-surface-variant text-onSurfaceVariant hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => onDelete(product.id)}
                            className="p-2 rounded-full bg-surface-variant text-onSurfaceVariant hover:bg-error/10 hover:text-error transition-colors"
                            title="Excluir"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                          <p className="font-bold text-primary text-xl">
                              R$ {product.price.toFixed(2)}
                          </p>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                          <span className="text-sm font-medium text-onSurfaceMuted">Estoque:</span>
                          <div className="flex items-center gap-2">
                              <button onClick={() => onUpdateStock(product.id, -1)} disabled={product.stock <= 0} className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                              <span className="w-8 text-center font-bold text-lg">{product.stock}</span>
                              <button onClick={() => onUpdateStock(product.id, 1)} className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">+</button>
                          </div>
                      </div>
                    </Card>
                )
            })}
            </div>
          </section>
        )
      ))}
      {products.length === 0 && (
        <p className="text-onSurfaceMuted col-span-full text-center mt-8">Nenhum produto cadastrado.</p>
      )}
    </div>
  );
};

export default ProductList;
