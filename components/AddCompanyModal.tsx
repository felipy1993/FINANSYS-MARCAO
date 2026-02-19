
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompany: (name: string) => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onAddCompany }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddCompany(name.trim());
      setName('');
      onClose();
    }
  };
  
  const handleClose = () => {
    setName('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cadastrar Nova Empresa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-onSurfaceMuted mb-1">
            Nome da Empresa
          </label>
          <Input
            id="companyName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: InovaTech Soluções"
            required
            autoFocus
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

export default AddCompanyModal;
