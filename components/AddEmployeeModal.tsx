
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (name: string, whatsapp: string) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAddEmployee }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddEmployee(name.trim(), whatsapp.trim());
      setName('');
      setWhatsapp('');
      onClose();
    }
  };
  
  const handleClose = () => {
    setName('');
    setWhatsapp('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cadastrar Novo Funcionário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employeeName" className="block text-sm font-medium text-onSurfaceMuted mb-1">
            Nome do Funcionário
          </label>
          <Input
            id="employeeName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João da Silva"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="employeeWhatsapp" className="block text-sm font-medium text-onSurfaceMuted mb-1">
            WhatsApp (Opcional)
          </label>
          <Input
            id="employeeWhatsapp"
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ex: 5511987654321"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;