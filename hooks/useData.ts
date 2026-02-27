
import { useState, useCallback, useEffect } from 'react';
import { Company, Employee, Product, Consumption, ConsumptionItem, Payment, Subscription } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDocs,
  writeBatch,
  where
} from 'firebase/firestore';
import { initialCompanies, initialEmployees, initialProducts, initialConsumptions } from '../data/mockData';

const useData = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [pendingConsumptions, setPendingConsumptions] = useState<Consumption[]>([]);
  const [periodConsumptions, setPeriodConsumptions] = useState<Consumption[]>([]);

  const defaultStart = new Date();
  defaultStart.setDate(1);
  defaultStart.setHours(0,0,0,0);
  
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setMonth(defaultEnd.getMonth() + 1);
  defaultEnd.setDate(0);
  defaultEnd.setHours(23,59,59,999);

  const [periodFilter, setPeriodFilter] = useState({ 
      startDate: defaultStart.toISOString(), 
      endDate: defaultEnd.toISOString() 
  });

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const map = new Map<string, Consumption>();
     pendingConsumptions.forEach(c => map.set(c.id, c));
     periodConsumptions.forEach(c => map.set(c.id, c));
     setConsumptions(Array.from(map.values()).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [pendingConsumptions, periodConsumptions]);

  // Subscribe to collections
  useEffect(() => {
    const unsubCompanies = onSnapshot(collection(db, 'companies'), (snap) => {
      setCompanies(snap.docs.map(doc => doc.data() as Company));
    });

    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snap) => {
      setEmployees(snap.docs.map(doc => doc.data() as Employee));
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => doc.data() as Product));
    });

    const subscriptionRef = doc(db, 'system', 'subscription');
    const unsubSubscription = onSnapshot(subscriptionRef, (snapshot) => {
      if (snapshot.exists()) {
        setSubscription(snapshot.data() as Subscription);
      } else {
        const initialSub: Subscription = {
          status: 'trial',
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          pixKey: '17997557625',
          pixCopiaCola: '',
          monthlyValue: 0
        };
        setSubscription(initialSub);
        setDoc(subscriptionRef, initialSub);
      }
    });

    return () => {
      unsubCompanies();
      unsubEmployees();
      unsubProducts();
      unsubSubscription();
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    
    // Todos os não pagos (fiados), independentemente da data
    const unsubPending = onSnapshot(query(collection(db, 'consumptions'), where('payment', '==', null)), (snap) => {
        setPendingConsumptions(snap.docs.map(doc => doc.data() as Consumption));
        setLoading(false);
    });

    // Consumos associados ao período selecionado
    // Utilizamos payment.date ou apenas data? 
    // Data do consumo em si para não perder itens pagos em outros meses quando filtrado:
    const unsubPeriod = onSnapshot(query(
        collection(db, 'consumptions'), 
        where('date', '>=', periodFilter.startDate), 
        where('date', '<=', periodFilter.endDate)
    ), (snap) => {
        setPeriodConsumptions(snap.docs.map(doc => doc.data() as Consumption));
        setLoading(false);
    });

    // Nota: itens baixados em unsubPeriod vão garantir que o Dashboard consiga ver as vendas do mês.
    // Itens pendentes sempre serão baixados por unsubPending, não importa se são meses ou anos antigos!

    return () => {
      unsubPending();
      unsubPeriod();
    };
  }, [periodFilter.startDate, periodFilter.endDate]);

  const calculateConsumptionTotal = useCallback((consumption: Consumption) => {
    return consumption.items.reduce((total, item) => total + item.priceAtTime * item.quantity, 0);
  }, []);
  
  const getPendingTotalForEmployee = useCallback((employeeId: string) => {
    return consumptions
      .filter(c => c.employeeId === employeeId && !c.payment)
      .reduce((total, c) => total + calculateConsumptionTotal(c), 0);
  }, [consumptions, calculateConsumptionTotal]);

  const getPendingTotalForCompany = useCallback((companyId: string) => {
    const companyEmployeeIds = employees
      .filter(e => e.companyId === companyId)
      .map(e => e.id);
    
    return companyEmployeeIds.reduce((total, employeeId) => total + getPendingTotalForEmployee(employeeId), 0);
  }, [employees, getPendingTotalForEmployee]);
  
  const getTotalPendingAmount = useCallback(() => {
    return consumptions
      .filter(c => !c.payment)
      .reduce((total, c) => total + calculateConsumptionTotal(c), 0);
  }, [consumptions, calculateConsumptionTotal]);

  const addConsumption = useCallback(async (employeeId: string, items: Omit<ConsumptionItem, 'priceAtTime'>[], saleDate: string, paymentInfo: { method: Payment['method'] } | null = null) => {
    if (!employeeId || items.length === 0) return;

    const consumptionDate = new Date(saleDate + 'T00:00:00').toISOString();
    const id = `con-${Date.now()}`;

    const newConsumption: Consumption = {
      id,
      employeeId,
      date: consumptionDate,
      items: items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          priceAtTime: product?.price || 0,
        };
      }),
      payment: paymentInfo ? { date: new Date().toISOString(), method: paymentInfo.method } : null,
    };

    await setDoc(doc(db, 'consumptions', id), newConsumption);
    
    // Update stock
    const batch = writeBatch(db);
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const productRef = doc(db, 'products', product.id);
        batch.update(productRef, { stock: Math.max(0, product.stock - item.quantity) });
      }
    });
    await batch.commit();

  }, [products]);

  const editConsumption = useCallback(async (consumptionId: string, newItems: Omit<ConsumptionItem, 'priceAtTime'>[], newDate: string) => {
    const originalConsumption = consumptions.find(c => c.id === consumptionId);
    if (!originalConsumption) return;

    const stockChanges: Record<string, number> = {};
    originalConsumption.items.forEach(item => {
        stockChanges[item.productId] = (stockChanges[item.productId] || 0) + item.quantity;
    });
    newItems.forEach(item => {
        stockChanges[item.productId] = (stockChanges[item.productId] || 0) - item.quantity;
    });

    const batch = writeBatch(db);
    for (const productId in stockChanges) {
        const product = products.find(p => p.id === productId);
        if (product) {
            const productRef = doc(db, 'products', product.id);
            batch.update(productRef, { stock: Math.max(0, product.stock + stockChanges[productId]) });
        }
    }
    
    const updatedConsumption = {
        ...originalConsumption,
        date: new Date(newDate + 'T00:00:00').toISOString(),
        items: newItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return { ...item, priceAtTime: product?.price || 0 };
        }),
    };
    
    batch.set(doc(db, 'consumptions', consumptionId), updatedConsumption);
    await batch.commit();
  }, [consumptions, products]);

  const deleteConsumption = useCallback(async (consumptionId: string) => {
      const consumptionToDelete = consumptions.find(c => c.id === consumptionId);
      if (!consumptionToDelete) return;

      const batch = writeBatch(db);
      
      // Move to trash collection for safety before permanent removal
      const trashRef = doc(db, 'trash', consumptionId);
      batch.set(trashRef, {
        ...consumptionToDelete,
        deletedAt: new Date().toISOString(),
        reason: 'user_delete'
      });

      consumptionToDelete.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product && item.productId !== 'partial-payment' && item.productId !== 'payment-adjustment') {
              const productRef = doc(db, 'products', product.id);
              batch.update(productRef, { stock: product.stock + item.quantity });
          }
      });

      batch.delete(doc(db, 'consumptions', consumptionId));
      await batch.commit();
  }, [consumptions, products]);
  
  const recordPayment = useCallback(async (employeeId: string, amount: number, method: Payment['method']): Promise<{ paidConsumptions: Consumption[] }> => {
    const paymentDate = new Date().toISOString();
    
    // Sort consumptions by date (oldest first)
    const unpaidConsumptions = consumptions
        .filter(c => c.employeeId === employeeId && !c.payment)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let remainingAmount = amount;
    const newlyPaidConsumptions: Consumption[] = [];
    const batch = writeBatch(db);

    for (const consumption of unpaidConsumptions) {
        if (remainingAmount <= 0.005) break; // Use a small epsilon for float comparison

        const consumptionTotal = calculateConsumptionTotal(consumption);
        
        if (consumptionTotal <= 0) continue; // Skip zero or negative total entries if any

        if (remainingAmount >= consumptionTotal - 0.005) {
            // Full payment for this consumption
            remainingAmount -= consumptionTotal;

            const paidConsumption = {
                ...consumption,
                payment: {
                    date: paymentDate,
                    method: method,
                }
            };
            batch.set(doc(db, 'consumptions', consumption.id), paidConsumption);
            newlyPaidConsumptions.push(paidConsumption);
        } else {
            // Partial payment for this entry
            // 1. Create a NEW consumption entry for the PAID portion
            const partialPaidId = `con-p-${Date.now()}`;
            const partialPaidEntry: Consumption = {
                id: partialPaidId,
                employeeId: employeeId,
                date: paymentDate,
                items: [{
                    productId: 'partial-payment',
                    quantity: 1,
                    priceAtTime: remainingAmount
                }],
                payment: {
                    date: paymentDate,
                    method: method
                }
            };
            batch.set(doc(db, 'consumptions', partialPaidId), partialPaidEntry);
            newlyPaidConsumptions.push(partialPaidEntry);

            // 2. Update the ORIGINAL entry with a negative adjustment to reduce its pending total
            const updatedConsumption: Consumption = {
                ...consumption,
                items: [
                    ...consumption.items,
                    {
                        productId: 'payment-adjustment',
                        quantity: 1,
                        priceAtTime: -remainingAmount
                    }
                ]
            };
            batch.set(doc(db, 'consumptions', consumption.id), updatedConsumption);
            
            remainingAmount = 0;
            break;
        }
    }

    await batch.commit();
    return { paidConsumptions: newlyPaidConsumptions };
  }, [consumptions, calculateConsumptionTotal]);

  const addCompany = useCallback(async (name: string) => {
    const id = `c-${Date.now()}`;
    const newCompany: Company = { id, name };
    await setDoc(doc(db, 'companies', id), newCompany);
  }, []);

  const addProduct = useCallback(async (name: string, price: number, type: 'snack' | 'drink' | 'food' | 'dessert', stock: number) => {
    const id = `p-${Date.now()}`;
    const newProduct: Product = { id, name, price, type, stock };
    await setDoc(doc(db, 'products', id), newProduct);
  }, []);

  const editProduct = useCallback(async (productId: string, name: string, price: number, type: 'snack' | 'drink' | 'food' | 'dessert', stock: number) => {
    await updateDoc(doc(db, 'products', productId), { name, price, type, stock });
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    await deleteDoc(doc(db, 'products', productId));
  }, []);

  const addEmployee = useCallback(async (name: string, whatsapp: string, companyId: string): Promise<Employee> => {
    const id = `e-${Date.now()}`;
    const newEmployee: Employee = { id, name, whatsapp, companyId };
    await setDoc(doc(db, 'employees', id), newEmployee);
    return newEmployee;
  }, []);

  const editEmployee = useCallback(async (employeeId: string, name: string, whatsapp: string, companyId: string) => {
    await updateDoc(doc(db, 'employees', employeeId), { name, whatsapp, companyId });
  }, []);

  const revertPayment = useCallback(async (consumptionId: string) => {
    const consumption = consumptions.find(c => c.id === consumptionId);
    if (!consumption || !consumption.payment) return;

    const batch = writeBatch(db);

    // If it's a 'partial-payment' entry (internal entry for payment portion), we just delete it
    if (consumption.items.some(item => item.productId === 'partial-payment')) {
      batch.delete(doc(db, 'consumptions', consumptionId));
      
      // We should also find the corresponding adjustment in the original entry if possible
      // However, usually the user will manually revert the adjustment from the original entry too
      // or we can try to find entries with 'payment-adjustment' for this employee around the same time.
      // For simplicity in this first version, we let the user revert both if they were split.
    } else {
      // If it's a regular entry that was marked as paid, we just clear the payment info
      // AND remove any 'payment-adjustment' items if they exist (though usually they are on unpaid ones)
      const updatedItems = consumption.items.filter(item => item.productId !== 'payment-adjustment');
      
      const updatedConsumption = {
        ...consumption,
        items: updatedItems,
        payment: null
      };
      batch.set(doc(db, 'consumptions', consumptionId), updatedConsumption);
    }

    await batch.commit();
  }, [consumptions]);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    // Check if employee has consumptions
    const hasConsumptions = consumptions.some(c => c.employeeId === employeeId);
    if (hasConsumptions) {
      throw new Error('Não é possível excluir um funcionário que possui consumos registrados.');
    }
    await deleteDoc(doc(db, 'employees', employeeId));
  }, [consumptions]);

  const updateStock = useCallback(async (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      await updateDoc(doc(db, 'products', productId), { stock: newStock });
    }
  }, [products]);

  const getMonthlyRevenue = useCallback(() => {
    return consumptions
      .filter(c => {
        if (!c.payment) return false;
        return c.payment.date >= periodFilter.startDate && c.payment.date <= periodFilter.endDate;
      })
      .reduce((total, c) => total + calculateConsumptionTotal(c), 0);
  }, [consumptions, calculateConsumptionTotal, periodFilter]);

  const getCompanyPerformance = useCallback(() => {
    const performance = companies.map(company => {
      const companyEmployeeIds = employees
        .filter(e => e.companyId === company.id)
        .map(e => e.id);

      const totalSales = consumptions
        .filter(c => {
          if (!c.payment || !companyEmployeeIds.includes(c.employeeId)) return false;
          return c.payment.date >= periodFilter.startDate && c.payment.date <= periodFilter.endDate;
        })
        .reduce((total, c) => total + calculateConsumptionTotal(c), 0);
        
      return { companyName: company.name, totalSales };
    });

    return performance.sort((a, b) => b.totalSales - a.totalSales);
  }, [companies, employees, consumptions, calculateConsumptionTotal, periodFilter]);
  
  const getSalesByProductCategory = useCallback(() => {
    const sales: Record<Product['type'], number> = {
      snack: 0,
      food: 0,
      drink: 0,
      dessert: 0,
    };

    consumptions
      .filter(c => {
        if (!c.payment) return false;
        return c.payment.date >= periodFilter.startDate && c.payment.date <= periodFilter.endDate;
      })
      .forEach(c => {
        c.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            sales[product.type] += item.priceAtTime * item.quantity;
          }
        });
      });

    return sales;
  }, [consumptions, products, periodFilter]);

  const getBestSellingProducts = useCallback(() => {
    const productSales: Record<string, {name: string, quantity: number, totalValue: number}> = {};

    consumptions
      .filter(c => {
        if (!c.payment) return false;
        return c.payment.date >= periodFilter.startDate && c.payment.date <= periodFilter.endDate;
      })
      .forEach(c => {
        c.items.forEach(item => {
          if (!productSales[item.productId]) {
            const product = products.find(p => p.id === item.productId);
            productSales[item.productId] = { name: product?.name || 'N/A', quantity: 0, totalValue: 0 };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].totalValue += item.quantity * item.priceAtTime;
        });
      });
      
    const sortedProducts = Object.values(productSales).sort((a,b) => b.totalValue - a.totalValue);
    
    return sortedProducts;
  }, [consumptions, products, periodFilter]);


  return {
    companies,
    employees,
    products,
    consumptions,
    loading,
    addConsumption,
    editConsumption,
    deleteConsumption,
    revertPayment,
    recordPayment,
    getPendingTotalForEmployee,
    getPendingTotalForCompany,
    getTotalPendingAmount,
    calculateConsumptionTotal,
    addCompany,
    addProduct,
    editProduct,
    deleteProduct,
    addEmployee,
    editEmployee,
    deleteEmployee,
    updateStock,
    getMonthlyRevenue,
    getCompanyPerformance,
    getSalesByProductCategory,
    getBestSellingProducts,
    subscription,
    periodFilter,
    setPeriodFilter
  };
};

export default useData;