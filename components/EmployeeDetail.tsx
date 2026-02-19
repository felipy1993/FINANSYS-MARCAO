
import React, { useState, useMemo, useCallback } from 'react';
import { Employee, Consumption, Product, Payment } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import GenerateReceiptModal from './GenerateReceiptModal';
import DateRangeModal from './DateRangeModal';
import RecordPaymentModal from './RecordPaymentModal';
import { formatReceiptText } from '../utils/receiptUtils';
import { isSameDay } from '../utils/dateUtils';
import ConsumptionItemView from './ConsumptionItemView';


interface EmployeeDetailProps {
  employee: Employee;
  consumptions: Consumption[];
  products: Product[];
  onRecordPayment: (employeeId: string, amount: number, method: Payment['method']) => Promise<Consumption[]>;
  getPendingTotalForEmployee: (employeeId: string) => number;
  onEditConsumption: (consumption: Consumption) => void;
  onDeleteConsumption: (consumptionId: string) => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, consumptions, products, onRecordPayment, getPendingTotalForEmployee, onEditConsumption, onDeleteConsumption }) => {
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  const [lastPayment, setLastPayment] = useState<{ consumptions: Consumption[], payment: Payment} | null>(null);
  const [receiptText, setReceiptText] = useState('');
  
  const { pendingConsumptions, paidConsumptions } = useMemo(() => {
    const pending = consumptions.filter(c => !c.payment).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const paid = consumptions.filter(c => c.payment).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { pendingConsumptions: pending, paidConsumptions: paid };
  }, [consumptions]);

  const pendingTotal = getPendingTotalForEmployee(employee.id);
  
  const handleGenerateReceipt = useCallback((
    receiptConsumptions: Consumption[],
    receiptType: 'payment' | 'daily' | 'period',
    dateInfo: { payment?: Payment; startDate?: string; endDate?: string }
  ) => {
    setReceiptModalOpen(true);
    
    const total = receiptConsumptions.reduce((sum, c) => sum + c.items.reduce((itemSum, item) => itemSum + item.priceAtTime * item.quantity, 0), 0);
    const text = formatReceiptText(employee, receiptConsumptions, products, receiptType, total, dateInfo);

    setReceiptText(text);
  }, [employee, products]);

  const handleConfirmPayment = async (amount: number, method: Payment['method']) => {
    const paidConsumptions = await onRecordPayment(employee.id, amount, method);

    if (paidConsumptions.length > 0) {
        const paymentInfo = { date: new Date().toISOString(), method: method };
        // The total amount for the receipt is the sum of the paid consumptions, not the input amount
        setLastPayment({ consumptions: paidConsumptions, payment: paymentInfo });
    } else {
        setLastPayment(null);
    }
  };

  const handleDailyReceipt = () => {
    const todayConsumptions = consumptions.filter(c => isSameDay(new Date(c.date), new Date()));
    handleGenerateReceipt(todayConsumptions, 'daily', {});
  };

  const handlePeriodReceipt = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day

    const periodConsumptions = consumptions.filter(c => {
      const consumptionDate = new Date(c.date);
      return consumptionDate >= start && consumptionDate <= end;
    });
    handleGenerateReceipt(periodConsumptions, 'period', { startDate, endDate });
  };


  return (
    <Card>
      <p className="text-onSurfaceMuted mb-4">{employee.whatsapp}</p>

      <Card className="mb-6 bg-surface/50">
        <h3 className="text-lg font-bold text-onSurface">Ações Rápidas</h3>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button onClick={handleDailyReceipt} variant="outline" className="w-full">
            <i className="fas fa-calendar-day mr-2"></i> Recibo do Dia
          </Button>
          <Button onClick={() => setIsDateRangeModalOpen(true)} variant="outline" className="w-full">
            <i className="fas fa-calendar-alt mr-2"></i> Recibo por Período
          </Button>
        </div>
      </Card>

      {pendingConsumptions.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/20 mb-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-red-300">Pagamento Pendente</h3>
              <p className="text-2xl font-extrabold text-red-400 my-2">R$ {pendingTotal.toFixed(2)}</p>
            </div>
            <Button onClick={() => setPaymentModalOpen(true)} className="w-full sm:w-auto mt-2 sm:mt-0">
                <i className="fas fa-cash-register mr-2"></i> Registrar Pagamento
            </Button>
          </div>
        </Card>
      )}

      {lastPayment && (
          <Card className="bg-primary/10 border-primary/20 mb-6 flex flex-col sm:flex-row text-center sm:text-left justify-between items-center gap-4">
              <div>
                  <h3 className="font-semibold text-indigo-300">Pagamento Registrado!</h3>
                  <p className="text-sm text-indigo-400">Gere um comprovante para enviar.</p>
              </div>
              <Button onClick={() => handleGenerateReceipt(lastPayment.consumptions, 'payment', {payment: lastPayment.payment})} variant="secondary" className="w-full sm:w-auto flex-shrink-0">
                <i className="fab fa-whatsapp mr-2"></i> Gerar Comprovante
              </Button>
          </Card>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-2 text-onSurface">Histórico de Consumo</h3>
        {pendingConsumptions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold text-red-400 mb-2">Pendentes</h4>
            {pendingConsumptions.map(c => <ConsumptionItemView key={c.id} consumption={c} products={products} onEdit={() => onEditConsumption(c)} onDelete={() => onDeleteConsumption(c.id)} />)}
          </div>
        )}
        {paidConsumptions.length > 0 && (
          <div>
            <h4 className="font-bold text-green-400 mb-2">Pagos</h4>
            {paidConsumptions.map(c => <ConsumptionItemView key={c.id} consumption={c} products={products} onEdit={() => onEditConsumption(c)} onDelete={() => onDeleteConsumption(c.id)} />)}
          </div>
        )}
        {consumptions.length === 0 && <p className="text-onSurfaceMuted">Nenhum consumo registrado.</p>}
      </div>

      <GenerateReceiptModal 
        isOpen={isReceiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receiptText={receiptText}
        whatsappNumber={employee.whatsapp}
      />
      <DateRangeModal 
        isOpen={isDateRangeModalOpen}
        onClose={() => setIsDateRangeModalOpen(false)}
        onGenerate={handlePeriodReceipt}
      />
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        pendingTotal={pendingTotal}
        onConfirm={handleConfirmPayment}
      />
    </Card>
  );
};

export default EmployeeDetail;