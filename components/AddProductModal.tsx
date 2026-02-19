
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (name: string, price: number, type: Product['type'], stock: number, id?: string) => void;
  product?: Product | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSaveProduct, product }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<Product['type']>('snack');
  const [stock, setStock] = useState('');

  React.useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setType(product.type);
      setStock(product.stock.toString());
    } else {
      resetState();
    }
  }, [product, isOpen]);

  const resetState = () => {
    setName('');
    setPrice('');
    setType('snack');
    setStock('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNumber = parseFloat(price);
    const stockNumber = parseInt(stock, 10);
    if (name.trim() && !isNaN(priceNumber) && priceNumber > 0 && !isNaN(stockNumber) && stockNumber >= 0) {
      onSaveProduct(name.trim(), priceNumber, type, stockNumber, product?.id);
      resetState();
      onClose();
    }
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={product ? "Editar Produto" : "Cadastrar Novo Produto"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-onSurfaceMuted mb-1">
            Nome do Produto
          </label>
          <Input
            id="productName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Coxinha"
            required
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="productPrice" className="block text-sm font-medium text-onSurfaceMuted mb-1">
                Preço (R$)
              </label>
              <Input
                id="productPrice"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 5.00"
                required
                min="0.01"
                step="0.01"
              />
            </div>
             <div>
              <label htmlFor="productType" className="block text-sm font-medium text-onSurfaceMuted mb-1">
                Tipo
              </label>
              <Select id="productType" value={type} onChange={e => setType(e.target.value as Product['type'])}>
                <option value="snack">Salgado</option>
                <option value="food">Comida</option>
                <option value="drink">Bebida</option>
              </Select>
            </div>
        </div>
        <div>
          <label htmlFor="productStock" className="block text-sm font-medium text-onSurfaceMuted mb-1">
            Quantidade em Estoque
          </label>
          <Input
            id="productStock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Ex: 50"
            required
            min="0"
            step="1"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim() || !price || parseFloat(price) <= 0 || !stock || parseInt(stock, 10) < 0}>
            {product ? "Atualizar Produto" : "Salvar Produto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductModal;