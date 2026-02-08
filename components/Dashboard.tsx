import React from 'react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils';
import { PieChart, TrendingDown, AlertCircle } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, categories }) => {
  // Calculate expenses
  const expenseTransactions = transactions.filter(t => t.expense > 0);
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.expense, 0);
  
  // Calculate Income for summary
  const totalIncome = transactions.reduce((acc, t) => acc + t.income, 0);
  const remainingBalance = totalIncome - totalExpense;

  // Group by category
  const categoryTotals: Record<string, number> = {};
  
  expenseTransactions.forEach(t => {
    const catId = t.categoryId || 'uncategorized';
    categoryTotals[catId] = (categoryTotals[catId] || 0) + t.expense;
  });

  // Convert to array and sort
  const data = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const category = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: category ? category.name : 'Tanpa Kategori',
        color: category ? category.color : '#cbd5e1', // slate-300
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-red-50 rounded-full mb-2 text-red-500">
                <TrendingDown size={20} />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Keluar</p>
            <p className="text-lg md:text-xl font-bold text-slate-800">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
            <div className={`p-2 rounded-full mb-2 ${remainingBalance >= 0 ? 'bg-sky-50 text-primary' : 'bg-red-50 text-red-500'}`}>
                <PieChart size={20} />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Sisa Saldo</p>
            <p className={`text-lg md:text-xl font-bold ${remainingBalance >= 0 ? 'text-primary' : 'text-red-500'}`}>
                {formatCurrency(remainingBalance)}
            </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
            <h3 className="text-slate-700 font-bold text-base">Persentase Pengeluaran</h3>
            <span className="text-xs text-slate-400 font-normal">({data.length} Kategori)</span>
        </div>
        
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Belum ada data pengeluaran.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {data.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                        {item.percentage.toFixed(0)}%
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-700">{item.name}</p>
                      <p className="text-xs text-slate-400">Rp {formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                  {/* Percentage Bar Background Visual */}
                </div>
                
                {/* Visual Bar at Bottom */}
                <div className="w-full bg-slate-50 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${item.percentage}%`, 
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;