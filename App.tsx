
import React, { useState, useMemo } from 'react';
import { Company, Employee, Consumption, Payment, ConsumptionItem, Product } from './types';
import useData from './hooks/useData';
import Header from './components/Header';
import CompanyList from './components/CompanyList';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';
import AddConsumptionView from './components/AddConsumptionView';
import { Button } from './components/ui/Button';
import AddCompanyModal from './components/AddCompanyModal';
import AddProductModal from './components/AddProductModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import ProductList from './components/ProductList';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import { GUEST_COMPANY_ID, GUEST_EMPLOYEE_ID } from './constants';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import GuestSalesDetail from './components/GuestSalesDetail';
import Login from './components/Login';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useEffect } from 'react';
import SubscriptionBanner from './components/SubscriptionBanner';
import SubscriptionPaywall from './components/SubscriptionPaywall';
import SubscriptionModal from './components/SubscriptionModal';

export type View = 'companies' | 'products' | 'dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const data = useData();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewingGuestSales, setIsViewingGuestSales] = useState(false);
  const [isAddingConsumption, setIsAddingConsumption] = useState(false);
  
  // Modal states
  const [isAddCompanyModalOpen, setAddCompanyModalOpen] = useState(false);
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Edit/Delete states
  const [consumptionToEdit, setConsumptionToEdit] = useState<Consumption | null>(null);
  const [consumptionToDelete, setConsumptionToDelete] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleteProductModalOpen, setDeleteProductModalOpen] = useState(false);

  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Handle Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };


  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedEmployee(null);
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };
  
  const handleSelectGuestSales = () => {
    setIsViewingGuestSales(true);
  }

  const handleBackToCompanies = () => {
    setSelectedCompanyId(null);
    setSelectedEmployee(null);
    setEmployeeSearchTerm('');
    setIsViewingGuestSales(false);
  };

  const handleBackToEmployees = () => {
    setSelectedEmployee(null);
  };

  const selectedCompany = useMemo(
    () => data.companies.find((c) => c.id === selectedCompanyId),
    [data.companies, selectedCompanyId]
  );
  
  const regularEmployees = useMemo(
    () => data.employees.filter(e => e.id !== GUEST_EMPLOYEE_ID),
    [data.employees]
  );
  
  const regularCompanies = useMemo(
    () => data.companies.filter(c => c.id !== GUEST_COMPANY_ID),
    [data.companies]
  );
  
  const guestConsumptions = useMemo(
    () => data.consumptions.filter(c => c.employeeId === GUEST_EMPLOYEE_ID).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data.consumptions]
  );

  const employeesOfSelectedCompany = useMemo(
    () => data.employees.filter((e) => e.companyId === selectedCompanyId && e.id !== GUEST_EMPLOYEE_ID),
    [data.employees, selectedCompanyId]
  );
  
  const filteredCompanies = useMemo(
    () =>
      regularCompanies.filter((company) =>
        company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
      ),
    [regularCompanies, companySearchTerm]
  );
  
  const filteredEmployeesOfSelectedCompany = useMemo(
    () =>
      employeesOfSelectedCompany.filter((employee) =>
        employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
      ),
    [employeesOfSelectedCompany, employeeSearchTerm]
  );
  
  const handleRecordPayment = async (employeeId: string, amount: number, method: Payment['method']): Promise<Consumption[]> => {
    const { paidConsumptions } = await data.recordPayment(employeeId, amount, method);
    // Optimistically update the employee object to re-render consumption list
    if(selectedEmployee) {
      setSelectedEmployee(e => e ? {...e} : null);
    }
    return paidConsumptions;
  };

  const handleAddEmployee = (name: string, whatsapp: string) => {
    if (selectedCompanyId) {
      data.addEmployee(name, whatsapp, selectedCompanyId);
    }
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    // Reset selection when changing main view to avoid inconsistent state
    setSelectedCompanyId(null);
    setSelectedEmployee(null);
    setCompanySearchTerm('');
    setEmployeeSearchTerm('');
    setIsViewingGuestSales(false);
    setIsAddingConsumption(false);
  };

  const handleAddConsumption = async (
    consumptionData: { employeeId: string } | { newEmployee: { name: string; whatsapp: string; companyId: string } },
    items: Omit<ConsumptionItem, 'priceAtTime'>[],
    saleDate: string,
    paymentInfo: { method: Payment['method'] } | null = null
  ) => {
    if ('newEmployee' in consumptionData) {
      const newEmployee = await data.addEmployee(
        consumptionData.newEmployee.name,
        consumptionData.newEmployee.whatsapp,
        consumptionData.newEmployee.companyId
      );
      if (newEmployee) {
        await data.addConsumption(newEmployee.id, items, saleDate, paymentInfo);
      }
    } else if (consumptionData.employeeId) {
      await data.addConsumption(consumptionData.employeeId, items, saleDate, paymentInfo);
    }
    setIsAddingConsumption(false);
  };

  const handleEditConsumption = async (consumptionId: string, items: Omit<ConsumptionItem, 'priceAtTime'>[], newDate: string) => {
      await data.editConsumption(consumptionId, items, newDate);
      setConsumptionToEdit(null);
      setIsAddingConsumption(false);
  };

  const openEditModal = (consumption: Consumption) => {
      setConsumptionToEdit(consumption);
      setIsAddingConsumption(true);
  }
  
  const openDeleteModal = (consumptionId: string) => {
      setConsumptionToDelete(consumptionId);
      setDeleteModalOpen(true);
  }
  
  const confirmDelete = () => {
      if (consumptionToDelete) {
          data.deleteConsumption(consumptionToDelete);
      }
      setDeleteModalOpen(false);
      setConsumptionToDelete(null);
  }

  const handleSaveProduct = async (name: string, price: number, type: Product['type'], stock: number, id?: string) => {
    if (id) {
      await data.editProduct(id, name, price, type, stock);
    } else {
      await data.addProduct(name, price, type, stock);
    }
    setProductToEdit(null);
  };

  const openEditProductModal = (product: Product) => {
    setProductToEdit(product);
    setAddProductModalOpen(true);
  };

  const openDeleteProductModal = (productId: string) => {
    setProductToDelete(productId);
    setDeleteProductModalOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      data.deleteProduct(productToDelete);
    }
    setDeleteProductModalOpen(false);
    setProductToDelete(null);
  };

  const handleCancelAddConsumption = () => {
    setIsAddingConsumption(false);
    if(consumptionToEdit) {
        setConsumptionToEdit(null);
    }
  }

  const handleCloseProductModal = () => {
    setAddProductModalOpen(false);
    setProductToEdit(null);
  }


  // Dynamic Header Logic
  let headerTitle = "FINANSYS MARCÃO";
  let onBack: (() => void) | undefined = undefined;
  let onAction: (() => void) | undefined = undefined;
  let actionIcon: string | undefined = undefined;

  if (isAddingConsumption) {
      headerTitle = consumptionToEdit ? "Editar Venda" : "Registrar Nova Venda";
      onBack = handleCancelAddConsumption;
  } else if (selectedEmployee) {
      headerTitle = selectedEmployee.name;
      onBack = handleBackToEmployees;
  } else if (selectedCompany) {
      headerTitle = selectedCompany.name;
      onBack = handleBackToCompanies;
      onAction = () => setAddEmployeeModalOpen(true);
      actionIcon = 'fas fa-plus';
  } else if (isViewingGuestSales) {
      headerTitle = "Vendas Avulsas";
      onBack = handleBackToCompanies;
  } else if (currentView === 'products') {
      headerTitle = "Produtos";
      onAction = () => setAddProductModalOpen(true);
      actionIcon = 'fas fa-plus';
  } else if (currentView === 'companies') {
      headerTitle = "Empresas";
      onAction = () => setAddCompanyModalOpen(true);
      actionIcon = 'fas fa-plus';
  } else if (currentView === 'dashboard') {
    headerTitle = "Dashboard";
  }


  const renderContent = () => {
    if (isAddingConsumption) {
      return (
        <AddConsumptionView
          onCancel={handleCancelAddConsumption}
          employees={regularEmployees}
          companies={regularCompanies}
          products={data.products}
          onAddConsumption={handleAddConsumption}
          onEditConsumption={handleEditConsumption}
          consumptionToEdit={consumptionToEdit}
          initialEmployeeId={selectedEmployee?.id}
        />
      );
    }
    
    if (data.loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <i className="fas fa-spinner fa-spin text-primary text-3xl"></i>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
              getMonthlyRevenue={data.getMonthlyRevenue}
              getTotalPendingAmount={data.getTotalPendingAmount}
              getCompanyPerformance={data.getCompanyPerformance}
              getSalesByCategory={data.getSalesByProductCategory}
              getBestSellingProducts={data.getBestSellingProducts}
          />
        );
      case 'companies':
        if (selectedEmployee) {
          return (
            <EmployeeDetail 
              employee={selectedEmployee}
              consumptions={data.consumptions.filter(c => c.employeeId === selectedEmployee.id)}
              products={data.products}
              onRecordPayment={handleRecordPayment}
              getPendingTotalForEmployee={data.getPendingTotalForEmployee}
              onEditConsumption={openEditModal}
              onDeleteConsumption={openDeleteModal}
              onAddSale={() => setIsAddingConsumption(true)}
            />
          );
        }
        if (selectedCompanyId) {
          return (
             <EmployeeList
                employees={filteredEmployeesOfSelectedCompany}
                onSelectEmployee={handleSelectEmployee}
                onAddSale={(employee) => {
                  setSelectedEmployee(employee);
                  setIsAddingConsumption(true);
                }}
                getPendingTotalForEmployee={data.getPendingTotalForEmployee}
                searchTerm={employeeSearchTerm}
                onSearchChange={setEmployeeSearchTerm}
                companies={data.companies}
              />
          );
        }
         if (isViewingGuestSales) {
          return <GuestSalesDetail 
                    consumptions={guestConsumptions} 
                    products={data.products}
                    onEditConsumption={openEditModal}
                    onDeleteConsumption={openDeleteModal}
                 />;
        }
        return (
          <CompanyList
            companies={filteredCompanies}
            onSelectCompany={handleSelectCompany}
            onSelectGuestSales={handleSelectGuestSales}
            getPendingTotalForCompany={data.getPendingTotalForCompany}
            searchTerm={companySearchTerm}
            onSearchChange={setCompanySearchTerm}
          />
        );
      case 'products':
        return (
          <ProductList
            products={data.products}
            onUpdateStock={data.updateStock}
            onEdit={openEditProductModal}
            onDelete={openDeleteProductModal}
          />
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-primary text-4xl"></i>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Lógica de bloqueio por assinatura
  const isExpired = data.subscription?.status === 'expired' || 
                   (data.subscription?.expirationDate && new Date(data.subscription.expirationDate).getTime() < Date.now());

  if (isExpired && data.subscription) {
    return <SubscriptionPaywall subscription={data.subscription} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {data.subscription && (
        <SubscriptionBanner 
          subscription={data.subscription} 
          onRenew={() => setIsSubscriptionModalOpen(true)} 
        />
      )}
      <Header 
        title={headerTitle} 
        onBack={onBack} 
        onAction={onAction} 
        actionIcon={actionIcon} 
        onLogout={handleLogout}
        showLogo={!onBack}
      />
      <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="hidden md:flex mb-6 border-b border-border">
            <button
            onClick={() => handleViewChange('dashboard')}
            className={`py-2 px-4 text-lg font-semibold transition-colors ${currentView === 'dashboard' && !isAddingConsumption ? 'text-primary border-b-2 border-primary' : 'text-onSurfaceMuted hover:text-onSurface'}`}
          >
            <i className="fas fa-chart-pie mr-2"></i> Dashboard
          </button>
          <button
            onClick={() => handleViewChange('companies')}
            className={`py-2 px-4 text-lg font-semibold transition-colors ${currentView === 'companies' && !isAddingConsumption ? 'text-primary border-b-2 border-primary' : 'text-onSurfaceMuted hover:text-onSurface'}`}
          >
            <i className="fas fa-building mr-2"></i> Empresas
          </button>
          <button
            onClick={() => handleViewChange('products')}
            className={`py-2 px-4 text-lg font-semibold transition-colors ${currentView === 'products' && !isAddingConsumption ? 'text-primary border-b-2 border-primary' : 'text-onSurfaceMuted hover:text-onSurface'}`}
          >
            <i className="fas fa-box-open mr-2"></i> Produtos
          </button>
        </div>
        
        <div key={isAddingConsumption ? 'add' : currentView} className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
      
      {!isAddingConsumption && (
        <div className="hidden md:block fixed bottom-6 right-6 z-20">
            <Button onClick={() => setIsAddingConsumption(true)} size="lg" className="rounded-full shadow-lg shadow-primary/30 h-16 w-16">
            <i className="fas fa-plus text-xl"></i>
            </Button>
        </div>
      )}

      <BottomNav
        currentView={currentView}
        onViewChange={handleViewChange}
        onAddConsumptionClick={() => setIsAddingConsumption(true)}
        isAddingConsumption={isAddingConsumption}
      />

      <AddCompanyModal
        isOpen={isAddCompanyModalOpen}
        onClose={() => setAddCompanyModalOpen(false)}
        onAddCompany={data.addCompany}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={handleCloseProductModal}
        onSaveProduct={handleSaveProduct}
        product={productToEdit}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setAddEmployeeModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita e o estoque dos produtos será devolvido."
      />

      <ConfirmDeleteModal
        isOpen={isDeleteProductModalOpen}
        onClose={() => setDeleteProductModalOpen(false)}
        onConfirm={confirmDeleteProduct}
        title="Confirmar Exclusão de Produto"
        message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
      />

      {data.subscription && (
        <SubscriptionModal 
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          subscription={data.subscription}
        />
      )}
    </div>
  );
}