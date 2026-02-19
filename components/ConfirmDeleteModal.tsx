
import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-onSurfaceMuted">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;