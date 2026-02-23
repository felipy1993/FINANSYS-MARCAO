
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Employee } from '../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEmployee: (name: string, whatsapp: string) => void;
  employee?: Employee | null;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSaveEmployee, employee }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setWhatsapp(employee.whatsapp || '');
    } else {
      setName('');
      setWhatsapp('');
    }
  }, [employee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSaveEmployee(name.trim(), whatsapp.trim());
      handleClose();
    }
  };
  
  const handleClose = () => {
    setName('');
    setWhatsapp('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={employee ? "Editar Cliente" : "Cadastrar Novo Cliente"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employeeName" className="block text-sm font-medium text-onSurfaceMuted mb-1">
            Nome do Cliente
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
            WhatsApp (DDD + Número)
          </label>
          <Input
            id="employeeWhatsapp"
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ex: 17991234567"
            noUppercase
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {employee ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;
