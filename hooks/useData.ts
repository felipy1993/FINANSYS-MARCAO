
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
  writeBatch
} from 'firebase/firestore';
import { initialCompanies, initialEmployees, initialProducts, initialConsumptions } from '../data/mockData';

const useData = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

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

    const unsubConsumptions = onSnapshot(query(collection(db, 'consumptions'), orderBy('date', 'desc')), (snap) => {
      setConsumptions(snap.docs.map(doc => doc.data() as Consumption));
      setLoading(false);
    });

    const subscriptionRef = doc(db, 'system', 'subscription');
    const unsubSubscription = onSnapshot(subscriptionRef, (snapshot) => {
      if (snapshot.exists()) {
        setSubscription(snapshot.data() as Subscription);
      } else {
        // Inicializa se não existir (Trial de 7 dias padrão)
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
      unsubConsumptions();
      unsubSubscription();
    };
  }, []);

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
      consumptionToDelete.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              const productRef = doc(db, 'products', product.id);
              batch.update(productRef, { stock: product.stock + item.quantity });
          }
      });

      batch.delete(doc(db, 'consumptions', consumptionId));
      await batch.commit();
  }, [consumptions, products]);
  
  const recordPayment = useCallback(async (employeeId: string, amount: number, method: Payment['method']): Promise<{ paidConsumptions: Consumption[] }> => {
    const paymentDate = new Date().toISOString();
    
    const unpaidConsumptions = consumptions
        .filter(c => c.employeeId === employeeId && !c.payment)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let remainingAmount = amount;
    const newlyPaidConsumptions: Consumption[] = [];
    const batch = writeBatch(db);

    for (const consumption of unpaidConsumptions) {
        const consumptionTotal = calculateConsumptionTotal(consumption);
        if (remainingAmount >= consumptionTotal) {
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

  const addProduct = useCallback(async (name: string, price: number, type: 'snack' | 'drink' | 'food', stock: number) => {
    const id = `p-${Date.now()}`;
    const newProduct: Product = { id, name, price, type, stock };
    await setDoc(doc(db, 'products', id), newProduct);
  }, []);

  const editProduct = useCallback(async (productId: string, name: string, price: number, type: 'snack' | 'drink' | 'food', stock: number) => {
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

  const updateStock = useCallback(async (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      await updateDoc(doc(db, 'products', productId), { stock: newStock });
    }
  }, [products]);

  const getMonthlyRevenue = useCallback((date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return consumptions
      .filter(c => {
        if (!c.payment) return false;
        const paymentDate = new Date(c.payment.date);
        return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
      })
      .reduce((total, c) => total + calculateConsumptionTotal(c), 0);
  }, [consumptions, calculateConsumptionTotal]);

  const getCompanyPerformance = useCallback((date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const performance = companies.map(company => {
      const companyEmployeeIds = employees
        .filter(e => e.companyId === company.id)
        .map(e => e.id);

      const totalSales = consumptions
        .filter(c => {
          if (!c.payment || !companyEmployeeIds.includes(c.employeeId)) return false;
          const paymentDate = new Date(c.payment.date);
          return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
        })
        .reduce((total, c) => total + calculateConsumptionTotal(c), 0);
        
      return { companyName: company.name, totalSales };
    });

    return performance.sort((a, b) => b.totalSales - a.totalSales);
  }, [companies, employees, consumptions, calculateConsumptionTotal]);
  
  const getSalesByProductCategory = useCallback((date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const sales: Record<Product['type'], number> = {
      snack: 0,
      food: 0,
      drink: 0,
    };

    consumptions
      .filter(c => {
        if (!c.payment) return false;
        const paymentDate = new Date(c.payment.date);
        return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
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
  }, [consumptions, products]);

  const getBestSellingProducts = useCallback((date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const productSales: Record<string, {name: string, quantity: number, totalValue: number}> = {};

    consumptions
      .filter(c => {
        if (!c.payment) return false;
        const paymentDate = new Date(c.payment.date);
        return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
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
  }, [consumptions, products]);


  return {
    companies,
    employees,
    products,
    consumptions,
    loading,
    addConsumption,
    editConsumption,
    deleteConsumption,
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
    updateStock,
    getMonthlyRevenue,
    getCompanyPerformance,
    getSalesByProductCategory,
    getBestSellingProducts,
    subscription
  };
};

export default useData;