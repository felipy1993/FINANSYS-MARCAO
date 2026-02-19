
import React from 'react';
import { Employee } from '../types';
import { Input } from './ui/Input';

interface EmployeeListProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  getPendingTotalForEmployee: (employeeId: string) => number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSelectEmployee, getPendingTotalForEmployee, searchTerm, onSearchChange }) => {
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
                className="p-4 bg-surface rounded-lg border border-border cursor-pointer hover:border-primary transition-colors hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="font-semibold text-lg text-onSurface">{employee.name}</p>
                <p className="text-sm text-onSurfaceMuted">{employee.whatsapp}</p>
                <p className={`mt-2 font-bold ${pendingTotal > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  Pendente: R$ {pendingTotal.toFixed(2)}
                </p>
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
