
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface GenerateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptText: string;
  whatsappNumber: string;
}

const GenerateReceiptModal: React.FC<GenerateReceiptModalProps> = ({ isOpen, onClose, receiptText, whatsappNumber }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  useEffect(() => {
    if (!isOpen) {
        setIsCopied(false);
    }
  }, [isOpen]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(receiptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleOpenWhatsApp = () => {
    // Sanitize phone number (remove anything that's not a digit)
    let sanitizedNumber = whatsappNumber.replace(/\D/g, '');
    
    // Se o número não começar com 55 (código do Brasil), adiciona automaticamente
    if (sanitizedNumber.length > 0 && !sanitizedNumber.startsWith('55')) {
      sanitizedNumber = '55' + sanitizedNumber;
    }

    const whatsappUrl = `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(receiptText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recibo para WhatsApp">
      <div className="space-y-4">
        <div className="p-4 bg-background rounded-md whitespace-pre-wrap text-onSurface max-h-60 overflow-y-auto">
          {receiptText}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleCopyToClipboard} variant="secondary" className="w-full">
            <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'} mr-2`}></i>
            {isCopied ? 'Copiado!' : 'Copiar Texto'}
          </Button>
          <Button onClick={handleOpenWhatsApp} className="w-full">
            <i className="fab fa-whatsapp mr-2"></i> Abrir no WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GenerateReceiptModal;
