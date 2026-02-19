
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Employee, Product, ConsumptionItem, Company, Payment, Consumption } from '../types';
import { GUEST_EMPLOYEE_ID } from '../constants';

interface AddConsumptionViewProps {
  onCancel: () => void;
  employees: Employee[];
  companies: Company[];
  products: Product[];
  onAddConsumption: (
    data: { employeeId: string } | { newEmployee: { name: string; whatsapp: string; companyId: string } },
    items: Omit<ConsumptionItem, 'priceAtTime'>[],
    saleDate: string,
    paymentInfo?: { method: Payment['method'] }
  ) => void;
  onEditConsumption: (
    consumptionId: string,
    items: Omit<ConsumptionItem, 'priceAtTime'>[],
    newDate: string
  ) => void;
  consumptionToEdit?: Consumption | null;
  initialEmployeeId?: string | null;
}

type Tab = 'existing' | 'new' | 'guest';

const AddConsumptionView: React.FC<AddConsumptionViewProps> = ({ 
  onCancel, 
  employees, 
  companies, 
  products, 
  onAddConsumption,
  onEditConsumption,
  consumptionToEdit,
  initialEmployeeId 
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [saleDate, setSaleDate] = useState('');
  
  const [activeTab, setActiveTab] = useState<Tab>('existing');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeWhatsapp, setNewEmployeeWhatsapp] = useState('');
  const [newEmployeeCompanyId, setNewEmployeeCompanyId] = useState('');
  const [guestPaymentMethod, setGuestPaymentMethod] = useState<Payment['method']>('pix');

  const isEditMode = !!consumptionToEdit;

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
    drink: 'Bebidas'
  };

  const categoryOrder: Product['type'][] = ['snack', 'food', 'drink'];

  useEffect(() => {
    if (isEditMode && consumptionToEdit) {
        // Edit mode
        setActiveTab('existing');
        setSelectedEmployeeId(consumptionToEdit.employeeId);
        setSaleDate(new Date(consumptionToEdit.date).toISOString().split('T')[0]);
        const initialCart = consumptionToEdit.items.reduce((acc, item) => {
            acc[item.productId] = item.quantity;
            return acc;
        }, {} as Record<string, number>);
        setCart(initialCart);
    } else {
        // Add mode
        setSaleDate(new Date().toISOString().split('T')[0]);
        if (initialEmployeeId) {
            setSelectedEmployeeId(initialEmployeeId);
            setActiveTab('existing');
        } else if (employees.length > 0) {
            setSelectedEmployeeId(employees[0].id);
            setActiveTab('existing');
        } else {
            setActiveTab('new');
        }
        if (companies.length > 0) {
            setNewEmployeeCompanyId(companies[0].id);
        }
    }
  }, [isEditMode, consumptionToEdit, initialEmployeeId, employees, companies]);


  const handleQuantityChange = (productId: string, delta: number) => {
    setCart(prev => {
      const newQuantity = (prev[productId] || 0) + delta;
      if (newQuantity <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleSave = () => {
    const items: Omit<ConsumptionItem, 'priceAtTime'>[] = Object.entries(cart).map(([productId, quantity]) => ({
      productId,
      quantity: quantity as number,
    }));

    if (isEditMode && consumptionToEdit) {
        onEditConsumption(consumptionToEdit.id, items, saleDate);
    } else {
        if (activeTab === 'existing') {
            onAddConsumption({ employeeId: selectedEmployeeId }, items, saleDate);
        } else if (activeTab === 'new') {
            onAddConsumption({
                newEmployee: {
                    name: newEmployeeName,
                    whatsapp: newEmployeeWhatsapp,
                    companyId: newEmployeeCompanyId,
                }
            }, items, saleDate);
        } else if (activeTab === 'guest') {
            onAddConsumption({ employeeId: GUEST_EMPLOYEE_ID }, items, saleDate, { method: guestPaymentMethod });
        }
    }
  };
  
  const total = Object.entries(cart).reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product?.price || 0) * (quantity as number);
  }, 0);

  const isSaveDisabled = Object.keys(cart).length === 0 || !saleDate ||
    (activeTab === 'existing' && !selectedEmployeeId && !isEditMode) ||
    (activeTab === 'new' && (!newEmployeeName.trim() || !newEmployeeCompanyId));

  return (
    <div className="space-y-4">
      {!isEditMode && (
        <div className="flex border-b border-border mb-4">
            <button 
                onClick={() => setActiveTab('existing')}
                className={`flex-1 py-2 px-3 font-semibold transition-colors text-sm text-center ${activeTab === 'existing' ? 'text-primary border-b-2 border-primary' : 'text-onSurfaceMuted hover:text-onSurface'}`}
            >
                Funcionário
            </button>
            <button 
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2 px-3 font-semibold transition-colors text-sm text-center ${activeTab === 'new' ? 'text-primary border-b-2 border-primary' : 'text-onSurfaceMuted hover:text-onSurface'}`}
            >
                Novo
            </button>
            <button 
                onClick={() => setActiveTab('guest')}
                className={`flex-1 py-2 px-3 font-semibold transition-colors text-sm text-center ${activeTab === 'guest' ? 'text-primary border-b-2 border-primary' : 'text-onSurfaceMuted hover:text-onSurface'}`}
            >
                Venda Avulsa
            </button>
        </div>
      )}
      
      {activeTab === 'existing' && (
          <div className="animate-fade-in space-y-4">
            <div>
                <label htmlFor="employee" className="block text-sm font-medium text-onSurfaceMuted mb-1">Funcionário</label>
                <Select id="employee" value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} disabled={isEditMode}>
                  {isEditMode && consumptionToEdit ? 
                      <option value={consumptionToEdit.employeeId}>
                        {(() => {
                          const emp = employees.find(e => e.id === consumptionToEdit.employeeId);
                          const comp = companies.find(c => c.id === emp?.companyId);
                          return `${emp?.name} — ${comp?.name || 'Sem Empresa'}`;
                        })()}
                      </option>
                    : [...employees]
                        .sort((a, b) => {
                          const compA = companies.find(c => c.id === a.companyId)?.name || '';
                          const compB = companies.find(c => c.id === b.companyId)?.name || '';
                          if (compA !== compB) return compA.localeCompare(compB);
                          return a.name.localeCompare(b.name);
                        })
                        .map(e => {
                          const company = companies.find(c => c.id === e.companyId);
                          return (
                            <option key={e.id} value={e.id}>
                              {e.name} — {company?.name || 'Sem Empresa'}
                            </option>
                          );
                        })
                  }
                </Select>
            </div>
          </div>
      )}

      {activeTab === 'new' && !isEditMode && (
          <div className="space-y-4 animate-fade-in">
               <div>
                  <label htmlFor="newEmployeeName" className="block text-sm font-medium text-onSurfaceMuted mb-1">Nome do Novo Funcionário</label>
                  <Input id="newEmployeeName" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Ex: João da Silva" autoFocus />
               </div>
               <div>
                  <label htmlFor="newEmployeeWhatsapp" className="block text-sm font-medium text-onSurfaceMuted mb-1">WhatsApp (Opcional)</label>
                  <Input id="newEmployeeWhatsapp" value={newEmployeeWhatsapp} onChange={e => setNewEmployeeWhatsapp(e.target.value)} placeholder="Ex: 5511987654321" />
               </div>
               <div>
                  <label htmlFor="newEmployeeCompany" className="block text-sm font-medium text-onSurfaceMuted mb-1">Empresa</label>
                  <Select id="newEmployeeCompany" value={newEmployeeCompanyId} onChange={e => setNewEmployeeCompanyId(e.target.value)}>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
               </div>
          </div>
      )}
      
      {activeTab === 'guest' && !isEditMode && (
          <div className="animate-fade-in space-y-4 p-4 bg-background rounded-md">
              <div className="text-center">
                  <i className="fas fa-user-tag text-primary text-2xl mb-2"></i>
                  <p className="text-onSurfaceMuted text-sm">
                      Esta venda será registrada como paga imediatamente.
                  </p>
              </div>
               <div>
                  <label htmlFor="guestPaymentMethod" className="block text-sm font-medium text-onSurfaceMuted mb-1 text-left">
                      Forma de Pagamento
                  </label>
                  <Select id="guestPaymentMethod" value={guestPaymentMethod} onChange={(e) => setGuestPaymentMethod(e.target.value as Payment['method'])}>
                      <option value="pix">Pix</option>
                      <option value="cash">Dinheiro</option>
                      <option value="card">Cartão</option>
                  </Select>
               </div>
          </div>
      )}
      
       <div className="pt-2">
            <label htmlFor="saleDate" className="block text-sm font-medium text-onSurfaceMuted mb-1">
                Data da Venda
            </label>
            <Input
              id="saleDate"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              required
            />
        </div>

      <div className="max-h-[calc(100vh-420px)] overflow-y-auto pr-2 space-y-4 pt-4">
        {categoryOrder.map(category => (
          groupedProducts[category] && groupedProducts[category].length > 0 && (
            <div key={category}>
              <h3 className="text-lg font-semibold text-onSurface mb-2">{categoryTitles[category]}</h3>
              <div className="space-y-2">
                {groupedProducts[category].map(product => (
                  <div key={product.id} className="flex justify-between items-center p-2 bg-background rounded-md">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-onSurfaceMuted">R$ {product.price.toFixed(2)} <span className="ml-2">| Estoque: {product.stock}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleQuantityChange(product.id, -1)} className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">-</button>
                      <span className="w-8 text-center font-bold">{cart[product.id] || 0}</span>
                      <button 
                        onClick={() => handleQuantityChange(product.id, 1)} 
                        disabled={(cart[product.id] || 0) >= product.stock}
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center text-xl font-bold">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
          </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSave} disabled={isSaveDisabled}>Salvar Venda</Button>
      </div>
    </div>
  );
};

export default AddConsumptionView;