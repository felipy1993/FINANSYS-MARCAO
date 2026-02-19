
import React from 'react';
import { Employee, Company } from '../types';
import { Input } from './ui/Input';

interface EmployeeListProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onAddSale: (employee: Employee) => void;
  getPendingTotalForEmployee: (employeeId: string) => number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  companies: Company[];
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSelectEmployee, onAddSale, getPendingTotalForEmployee, searchTerm, onSearchChange, companies }) => {
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
            return (
              <div 
                key={employee.id} 
                onClick={() => onSelectEmployee(employee)} 
                className="p-4 bg-surface rounded-lg border border-border cursor-pointer hover:border-primary transition-colors hover:-translate-y-1 animate-fade-in-up flex justify-between items-start"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div>
                  <p className="font-semibold text-lg text-onSurface">{employee.name}</p>
                  <p className="text-xs text-primary font-medium uppercase tracking-wider">
                    {companies.find(c => c.id === employee.companyId)?.name || 'Sem Empresa'}
                  </p>
                  <p className="text-sm text-onSurfaceMuted mt-1">{employee.whatsapp}</p>
                  <p className={`mt-2 font-bold ${pendingTotal > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    Pendente: R$ {pendingTotal.toFixed(2)}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSale(employee);
                  }}
                  className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                  title="Nova Venda"
                >
                  <i className="fas fa-cart-plus text-xl"></i>
                </button>
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
