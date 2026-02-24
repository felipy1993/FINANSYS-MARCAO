
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
                    <h1 className="text-2xl font-bold text-onSurface capitalize tracking-tight">{formattedMonth}</h1>
                    <button 
                        onClick={() => setIsReportOpen(true)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-xl transition-all flex items-center justify-center w-10 h-10 shadow-sm"
                        title="Relatório Mensal"
                    >
                        <i className="fas fa-file-alt"></i>
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-1 scale-90 sm:scale-100 origin-right">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-onSurfaceMuted">De:</label>
                      <input
                          type="date"
                          value={periodFilter.startDate.split('T')[0]}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            date.setHours(0,0,0,0);
                            setPeriodFilter({...periodFilter, startDate: date.toISOString()});
                          }}
                          className="bg-transparent text-sm focus:outline-none text-onSurface w-28"
                      />
                    </div>
                    <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-1 scale-90 sm:scale-100 origin-right">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-onSurfaceMuted">Até:</label>
                      <input
                          type="date"
                          value={periodFilter.endDate.split('T')[0]}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            date.setHours(23,59,59,999);
                            setPeriodFilter({...periodFilter, endDate: date.toISOString()});
                          }}
                          className="bg-transparent text-sm focus:outline-none text-onSurface w-28"
                      />
                    </div>
                </div>
            </div>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="glass-card p-5 rounded-2xl border-l-4 border-l-primary relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 bg-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 relative">
                        <div className="bg-primary/20 p-3 rounded-xl flex-shrink-0">
                            <i className="fas fa-wallet text-primary text-xl"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-onSurfaceMuted text-[10px] uppercase font-bold tracking-widest">Receita do Mês</p>
                            <p className="text-2xl font-black text-onSurface mt-1">
                                R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                 <div className="glass-card p-5 rounded-2xl border-l-4 border-l-red-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 bg-red-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 relative">
                        <div className="bg-red-500/20 p-3 rounded-xl flex-shrink-0">
                            <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-onSurfaceMuted text-[10px] uppercase font-bold tracking-widest">Total Pendente</p>
                            <p className="text-2xl font-black text-red-500 mt-1">
                                R$ {totalPendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border-l-4 border-l-secondary relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 bg-secondary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 relative">
                        <div className="bg-secondary/20 p-3 rounded-xl flex-shrink-0">
                            <i className="fas fa-building text-secondary text-xl"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-onSurfaceMuted text-[10px] uppercase font-bold tracking-widest">Empresa Destaque</p>
                            <p className="text-lg font-black text-onSurface mt-1 truncate">
                                {topCompany && topCompany.totalSales > 0 ? topCompany.companyName : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border-l-4 border-l-accent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 bg-accent/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 relative">
                        <div className="bg-accent/20 p-3 rounded-xl flex-shrink-0">
                            <i className="fas fa-crown text-accent text-xl"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-onSurfaceMuted text-[10px] uppercase font-bold tracking-widest">Mais Vendido</p>
                            <p className="text-lg font-black text-onSurface mt-1 truncate">
                                {topProduct ? topProduct.name : 'N/A'}
                            </p>
                            {topProduct && <p className="text-accent text-xs font-bold leading-none">{topProduct.quantity} vendidos</p>}
                        </div>
                    </div>
                </div>
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