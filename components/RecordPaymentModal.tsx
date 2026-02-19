
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Payment } from '../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTotal: number;
  onConfirm: (amount: number, method: Payment['method']) => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, pendingTotal, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Payment['method']>('pix');

  useEffect(() => {
    if (isOpen) {
      setAmount(pendingTotal.toFixed(2));
    }
  }, [isOpen, pendingTotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      onConfirm(numericAmount, method);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset state on close
    setAmount('');
    setMethod('pix');
    onClose();
  }

  const isInvalidAmount = !amount || parseFloat(amount) <= 0 || parseFloat(amount) > pendingTotal;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Pagamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="paymentAmount" className="block text-sm font-medium text-onSurfaceMuted mb-1">
            Valor a Pagar (Pendente: R$ {pendingTotal.toFixed(2)})
          </label>
          <Input
            id="paymentAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            min="0.01"
            step="0.01"
            max={pendingTotal.toFixed(2)}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-onSurfaceMuted mb-1">
            Forma de Pagamento
          </label>
          <Select id="paymentMethod" value={method} onChange={(e) => setMethod(e.target.value as Payment['method'])}>
            <option value="pix">Pix</option>
            <option value="cash">Dinheiro</option>
            <option value="card">Cartão</option>
          </Select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isInvalidAmount}>
            Confirmar Pagamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;