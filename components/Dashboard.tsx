
import React, { useMemo, useState } from 'react';
import { Card } from './ui/Card';
import { Product } from '../types';
import Chart from './ui/Chart';
import { Input } from './ui/Input';
import BestSellingProducts from './BestSellingProducts';
import MonthlyReportModal from './MonthlyReportModal';

interface DashboardProps {
    getMonthlyRevenue: () => number;
    getTotalPendingAmount: () => number;
    getCompanyPerformance: () => { companyName: string; totalSales: number }[];
    getSalesByCategory: () => Record<Product['type'], number>;
    getBestSellingProducts: () => { name: string; quantity: number, totalValue: number }[];
    periodFilter: { startDate: string, endDate: string };
    setPeriodFilter: (filter: { startDate: string, endDate: string }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    getMonthlyRevenue, 
    getTotalPendingAmount,
    getCompanyPerformance, 
    getSalesByCategory,
    getBestSellingProducts,
    periodFilter,
    setPeriodFilter
}) => {
    const [isReportOpen, setIsReportOpen] = useState(false);

    const monthlyRevenue = useMemo(() => getMonthlyRevenue(), [getMonthlyRevenue]);
    const totalPendingAmount = useMemo(() => getTotalPendingAmount(), [getTotalPendingAmount]);
    const companyPerformance = useMemo(() => getCompanyPerformance(), [getCompanyPerformance]);
    const salesByCategory = useMemo(() => getSalesByCategory(), [getSalesByCategory]);
    const bestSellingProducts = useMemo(() => getBestSellingProducts(), [getBestSellingProducts]);

    const topCompany = companyPerformance.length > 0 ? companyPerformance[0] : null;
    const topProduct = bestSellingProducts.length > 0 ? bestSellingProducts[0] : null;


    const categoryTitles: Record<Product['type'], string> = {
        snack: 'Salgados',
        food: 'Comidas',
        drink: 'Bebidas',
        dessert: 'Sobremesas'
    };

    const categoryChartData = {
        labels: Object.keys(salesByCategory).map(key => categoryTitles[key as Product['type']]),
        datasets: [
            {
                label: 'Vendas por Categoria',
                data: Object.values(salesByCategory),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)', // indigo-500
                    'rgba(16, 185, 129, 0.7)', // emerald-500
                    'rgba(239, 68, 68, 0.7)',   // red-500
                    'rgba(245, 158, 11, 0.7)',  // amber-500
                ],
                borderColor: [
                    '#6366f1',
                    '#10b981',
                    '#ef4444',
                    '#f59e0b',
                ],
                borderWidth: 1,
            },
        ],
    };
    
    const startObj = new Date(periodFilter.startDate);
    const endObj = new Date(periodFilter.endDate);
    const formattedMonth = startObj.getMonth() === endObj.getMonth() 
      ? startObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : `${startObj.toLocaleDateString('pt-BR', { month: 'short' })} a ${endObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric'})}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-onSurface capitalize">{formattedMonth}</h1>
                    <button 
                        onClick={() => setIsReportOpen(true)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10"
                        title="Relatório Mensal"
                    >
                        <i className="fas fa-file-alt"></i>
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-onSurfaceMuted">De:</label>
                      <Input
                          type="date"
                          value={periodFilter.startDate.split('T')[0]}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            date.setHours(0,0,0,0);
                            setPeriodFilter({...periodFilter, startDate: date.toISOString()});
                          }}
                          className="w-36"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-onSurfaceMuted">Até:</label>
                      <Input
                          type="date"
                          value={periodFilter.endDate.split('T')[0]}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            date.setHours(23,59,59,999);
                            setPeriodFilter({...periodFilter, endDate: date.toISOString()});
                          }}
                          className="w-36"
                      />
                    </div>
                </div>
            </div>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <Card>
                    <div className="flex items-start space-x-3">
                        <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                            <i className="fas fa-dollar-sign text-primary text-lg"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-onSurfaceMuted text-sm font-medium truncate">Receita do Mês</p>
                            <p className="text-xl md:text-2xl font-bold text-onSurface break-words">
                                R$ {monthlyRevenue.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </Card>
                 <Card>
                    <div className="flex items-start space-x-3">
                        <div className="bg-red-500/10 p-3 rounded-full flex-shrink-0">
                            <i className="fas fa-file-invoice-dollar text-red-400 text-lg"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-onSurfaceMuted text-sm font-medium truncate">Total Pendente</p>
                            <p className="text-xl md:text-2xl font-bold text-onSurface break-words">
                                R$ {totalPendingAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-start space-x-3">
                        <div className="bg-secondary/10 p-3 rounded-full flex-shrink-0">
                            <i className="fas fa-trophy text-secondary text-lg"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-onSurfaceMuted text-sm font-medium truncate">Empresa Destaque</p>
                            <p className="text-base md:text-lg font-bold text-onSurface truncate">
                                {topCompany && topCompany.totalSales > 0 ? topCompany.companyName : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-start space-x-3">
                        <div className="bg-red-500/10 p-3 rounded-full flex-shrink-0">
                            <i className="fas fa-star text-red-400 text-lg"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-onSurfaceMuted text-sm font-medium truncate">Mais Vendido</p>
                            <p className="text-base md:text-lg font-bold text-onSurface truncate">
                                {topProduct ? `${topProduct.name} (${topProduct.quantity})` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
            
            {/* Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-onSurface mb-4">Vendas por Categoria</h3>
                    <div className="h-64">
{/* FIX: Cast v to number to fix TypeScript error. The `Object.values` method can return `unknown[]`, so we need to assert the type for comparison. */}
                         {Object.values(salesByCategory).some(v => (v as number) > 0) ? (
                             <Chart type="doughnut" data={categoryChartData} />
                          ) : (
                            <p className="text-onSurfaceMuted text-center mt-10">Nenhuma venda neste mês.</p>
                          )}
                    </div>
                </Card>
                <BestSellingProducts products={bestSellingProducts} />
            </div>

            <MonthlyReportModal 
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                data={{
                    monthName: formattedMonth,
                    totalRevenue: monthlyRevenue,
                    pendingAmount: totalPendingAmount,
                    topProducts: bestSellingProducts,
                    categorySales: salesByCategory,
                    companyPerformance: companyPerformance
                }}
            />
        </div>
    );
};

export default Dashboard;