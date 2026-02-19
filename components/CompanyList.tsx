
import React from 'react';
import { Company } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';

interface CompanyListProps {
  companies: Company[];
  onSelectCompany: (companyId: string) => void;
  onSelectGuestSales: () => void;
  getPendingTotalForCompany: (companyId: string) => number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, onSelectCompany, onSelectGuestSales, getPendingTotalForCompany, searchTerm, onSearchChange }) => {
  return (
    <div className="space-y-6">
      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-onSurfaceMuted"></i>
        <Input
            type="text"
            placeholder="Pesquisar empresa..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Special Card for Guest Sales */}
        <Card 
            onClick={onSelectGuestSales}
            className="cursor-pointer animate-fade-in-up bg-primary/10 border-primary/20"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-primary">
                <i className="fas fa-shopping-cart mr-3"></i>
                Vendas Avulsas
              </h3>
              <i className="fas fa-chevron-right text-onSurfaceMuted"></i>
            </div>
            <p className="mt-2 text-onSurfaceMuted text-sm">
              Vendas rápidas e pagas no ato.
            </p>
          </Card>
      
        {/* Regular Companies */}
        {companies.map((company, index) => {
          const totalPending = getPendingTotalForCompany(company.id);
          return (
            <Card 
              key={company.id} 
              onClick={() => onSelectCompany(company.id)}
              className="cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-onSurface">{company.name}</h3>
                <i className="fas fa-chevron-right text-onSurfaceMuted"></i>
              </div>
              <p className={`mt-2 font-bold ${totalPending > 0 ? 'text-red-400' : 'text-green-400'}`}>
                Total Pendente: R$ {totalPending.toFixed(2)}
              </p>
            </Card>
          )
        })}
      </div>
      
      {companies.length === 0 && (
        <div className="text-center py-10">
          <p className="text-onSurfaceMuted">Nenhuma empresa encontrada com o termo "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
};

export default CompanyList;