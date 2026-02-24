
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
    drink: 'Bebidas',
    dessert: 'Sobremesas'
  };

  const categoryOrder: Product['type'][] = ['snack', 'food', 'drink', 'dessert'];

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

  const categoryIcons: Record<Product['type'], string> = {
    snack: 'fas fa-cookie-bite',
    food: 'fas fa-utensils',
    drink: 'fas fa-glass-whiskey',
    dessert: 'fas fa-ice-cream'
  };

  const categoryColors: Record<Product['type'], string> = {
    snack: 'text-amber-400',
    food: 'text-red-400',
    drink: 'text-blue-400',
    dessert: 'text-pink-400'
  };

  return (
    <div className="space-y-4">
      {!isEditMode && (
        <div className="flex p-1 bg-surface/50 rounded-xl mb-4 border border-border">
            <button 
                onClick={() => setActiveTab('existing')}
                className={`flex-1 py-2 px-3 font-bold transition-all text-xs text-center rounded-lg ${activeTab === 'existing' ? 'bg-primary text-white shadow-lg' : 'text-onSurfaceMuted hover:text-onSurface'}`}
            >
                CLIENTE
            </button>
            <button 
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2 px-3 font-bold transition-all text-xs text-center rounded-lg ${activeTab === 'new' ? 'bg-primary text-white shadow-lg' : 'text-onSurfaceMuted hover:text-onSurface'}`}
            >
                NOVO
            </button>
            <button 
                onClick={() => setActiveTab('guest')}
                className={`flex-1 py-2 px-3 font-bold transition-all text-xs text-center rounded-lg ${activeTab === 'guest' ? 'bg-primary text-white shadow-lg' : 'text-onSurfaceMuted hover:text-onSurface'}`}
            >
                AVULSA
            </button>
        </div>
      )}
      
      {activeTab === 'existing' && (
          <div className="animate-fade-in space-y-4">
            <div className="glass-card p-4 rounded-xl">
                <label htmlFor="employee" className="block text-[10px] items-center gap-1 uppercase font-black text-onSurfaceMuted mb-2 tracking-widest">
                    <i className="fas fa-user-check mr-1"></i> Selecionar Cliente
                </label>
                <div className="relative">
                    <select 
                        id="employee" 
                        value={selectedEmployeeId} 
                        onChange={e => setSelectedEmployeeId(e.target.value)} 
                        disabled={isEditMode}
                        className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-onSurface focus:ring-2 focus:ring-primary focus:outline-none appearance-none font-bold"
                    >
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
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-onSurfaceMuted pointer-events-none"></i>
                </div>
            </div>
          </div>
      )}

      {activeTab === 'new' && !isEditMode && (
          <div className="space-y-4 animate-fade-in glass-card p-4 rounded-xl">
               <div>
                  <label htmlFor="newEmployeeName" className="block text-[10px] uppercase font-black text-onSurfaceMuted mb-1 tracking-widest">Nome do Novo Cliente</label>
                  <Input id="newEmployeeName" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Ex: João da Silva" autoFocus />
               </div>
               <div>
                  <label htmlFor="newEmployeeWhatsapp" className="block text-[10px] uppercase font-black text-onSurfaceMuted mb-1 tracking-widest">WhatsApp (DDD + Número)</label>
                  <Input id="newEmployeeWhatsapp" value={newEmployeeWhatsapp} onChange={e => setNewEmployeeWhatsapp(e.target.value)} placeholder="Ex: 17991234567" noUppercase />
               </div>
               <div>
                  <label htmlFor="newEmployeeCompany" className="block text-[10px] uppercase font-black text-onSurfaceMuted mb-1 tracking-widest">Empresa</label>
                  <Select id="newEmployeeCompany" value={newEmployeeCompanyId} onChange={e => setNewEmployeeCompanyId(e.target.value)}>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
               </div>
          </div>
      )}
      
      {activeTab === 'guest' && !isEditMode && (
          <div className="animate-fade-in space-y-4 p-4 glass-card rounded-xl border-l-4 border-l-secondary">
              <div className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-2 rounded-lg">
                      <i className="fas fa-bolt text-secondary"></i>
                  </div>
                  <p className="text-onSurface font-bold text-sm">
                      Venda Rápida (Paga)
                  </p>
              </div>
               <div>
                  <label htmlFor="guestPaymentMethod" className="block text-[10px] uppercase font-black text-onSurfaceMuted mb-1 tracking-widest">
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
      
       <div className="glass-card p-3 rounded-xl flex items-center justify-between">
            <label htmlFor="saleDate" className="text-[10px] uppercase font-black text-onSurfaceMuted tracking-widest">
                Data da Venda
            </label>
            <input
              id="saleDate"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="bg-transparent text-sm font-bold focus:outline-none text-onSurface inv"
              required
            />
        </div>

      <div className="max-h-[calc(100vh-450px)] overflow-y-auto pr-2 space-y-6 pt-2 custom-scrollbar">
        {categoryOrder.map(category => (
          groupedProducts[category] && groupedProducts[category].length > 0 && (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                  <div className={`p-1.5 rounded-lg bg-surface ${categoryColors[category]} shadow-sm`}>
                      <i className={`${categoryIcons[category]} text-xs`}></i>
                  </div>
                  <h3 className="text-xs uppercase font-black tracking-[0.2em] text-onSurfaceMuted">{categoryTitles[category]}</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {groupedProducts[category].map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 glass-card rounded-xl hover:border-primary/50 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-onSurface group-hover:text-primary transition-colors truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs font-black text-primary">R$ {product.price.toFixed(2)}</p>
                          <span className="text-[10px] text-onSurfaceMuted">|</span>
                          <p className={`text-[10px] font-bold ${product.stock < 5 ? 'text-red-400' : 'text-onSurfaceMuted'}`}>Estoque: {product.stock}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-background/40 p-1 rounded-xl border border-border/50 translate-x-1">
                      <button 
                        onClick={() => handleQuantityChange(product.id, -1)} 
                        className="w-8 h-8 rounded-lg bg-surface text-onSurface font-black hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm"
                      >
                        <i className="fas fa-minus text-xs"></i>
                      </button>
                      <span className="w-4 text-center font-black text-sm">{cart[product.id] || 0}</span>
                      <button 
                        onClick={() => handleQuantityChange(product.id, 1)} 
                        disabled={(cart[product.id] || 0) >= product.stock}
                        className="w-8 h-8 rounded-lg bg-surface text-onSurface font-black hover:bg-primary hover:text-white transition-all active:scale-90 disabled:opacity-30 shadow-sm"
                      >
                         <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-onSurfaceMuted tracking-widest">Total da Venda</span>
              <span className="text-2xl font-black text-onSurface">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaveDisabled}>Finalizar</Button>
          </div>
      </div>
    </div>
  );
};

export default AddConsumptionView;