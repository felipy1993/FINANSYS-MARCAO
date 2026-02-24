
import React from 'react';
import { Employee, Company } from '../types';
import { Input } from './ui/Input';

interface EmployeeListProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onAddSale: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  getPendingTotalForEmployee: (employeeId: string) => number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  companies: Company[];
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  onSelectEmployee, 
  onAddSale, 
  onEditEmployee,
  getPendingTotalForEmployee, 
  searchTerm, 
  onSearchChange, 
  companies 
}) => {
  return (
    <div className="space-y-6">
      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-onSurfaceMuted"></i>
        <Input
            type="text"
            placeholder="Pesquisar funcionário..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10"
        />
      </div>

      {employees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee, index) => {
            const pendingTotal = getPendingTotalForEmployee(employee.id);
            const hasHighDebt = pendingTotal >= 50;
            
            return (
              <div 
                key={employee.id} 
                onClick={() => onSelectEmployee(employee)} 
                className="p-5 glass-card rounded-2xl cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02] animate-fade-in-up flex justify-between items-center group relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {hasHighDebt && (
                    <div className="absolute top-0 right-0">
                        <div className="bg-red-500 text-white text-[8px] font-black py-0.5 px-4 rotate-45 translate-x-3 translate-y-1 shadow-lg">
                            DÉBITO
                        </div>
                    </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <p className="font-black text-lg text-onSurface truncate pr-4">{employee.name}</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5 opacity-80">
                    {companies.find(c => c.id === employee.companyId)?.name || 'Sem Empresa'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                      <div className={`px-2 py-1 rounded-lg text-xs font-black ${pendingTotal > 0 ? 'bg-red-500/10 text-red-500' : 'bg-secondary/10 text-secondary'}`}>
                        R$ {pendingTotal.toFixed(2)}
                      </div>
                      {employee.whatsapp && (
                          <a 
                            href={`https://wa.me/55${employee.whatsapp.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-secondary/10 text-secondary p-1.5 rounded-lg hover:bg-secondary/20 transition-colors"
                          >
                              <i className="fab fa-whatsapp"></i>
                          </a>
                      )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSale(employee);
                    }}
                    className="w-10 h-10 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all hover:scale-110 flex items-center justify-center shadow-sm"
                    title="Nova Venda"
                  >
                    <i className="fas fa-plus-circle text-lg"></i>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEmployee(employee);
                    }}
                    className="w-10 h-10 bg-onSurface/5 text-onSurfaceMuted rounded-xl hover:bg-onSurface/10 hover:text-onSurface transition-all flex items-center justify-center"
                    title="Editar Cliente"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-onSurfaceMuted">Nenhum funcionário encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
