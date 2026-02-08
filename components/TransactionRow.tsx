import React from 'react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils';
import { Trash2 } from 'lucide-react';

interface TransactionRowProps {
  index: number;
  transaction: Transaction;
  categories: Category[];
  runningBalance: number;
  onChange: (id: string, field: keyof Transaction, value: any) => void;
  onDelete: (id: string) => void;
  isFirstRow?: boolean;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  index,
  transaction,
  categories,
  runningBalance,
  onChange,
  onDelete,
  isFirstRow = false,
}) => {
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'income' | 'expense') => {
    // Remove non-numeric characters except dots (which we remove in parse)
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const val = parseInt(rawVal, 10);
    onChange(transaction.id, field, isNaN(val) ? 0 : val);
  };

  const selectedCategory = categories.find(c => c.id === transaction.categoryId);

  return (
    <tr className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isFirstRow ? 'bg-slate-50 font-medium' : ''}`}>
      <td className="p-2 md:p-3 text-center text-slate-500 w-8 hidden md:table-cell text-xs md:text-sm">{index + 1}</td>
      
      {/* Description */}
      <td className="p-1 md:p-2 min-w-[100px] md:min-w-[150px]">
        <input
          type="text"
          value={transaction.description}
          onChange={(e) => onChange(transaction.id, 'description', e.target.value)}
          placeholder={isFirstRow ? "Penghasilan" : "Keterangan"}
          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 rounded px-1 md:px-2 py-1 outline-none text-slate-800 text-xs md:text-sm"
          readOnly={isFirstRow} 
        />
      </td>

      {/* Category */}
      <td className="p-1 md:p-2 min-w-[90px] md:min-w-[140px]">
        <div className="relative">
          <select
            value={transaction.categoryId || ''}
            onChange={(e) => onChange(transaction.id, 'categoryId', e.target.value || null)}
            className="w-full appearance-none bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-1 md:px-2 py-1 pr-4 md:pr-6 outline-none text-xs md:text-sm text-slate-700 cursor-pointer text-ellipsis overflow-hidden"
            style={{ 
              color: selectedCategory ? selectedCategory.color : undefined,
              fontWeight: selectedCategory ? 600 : 400
            }}
          >
            <option value="">-</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} style={{ color: 'black' }}>
                {cat.name}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <div 
              className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
        </div>
      </td>

      {/* Income */}
      <td className="p-1 md:p-2 min-w-[70px] md:min-w-[120px]">
        {isFirstRow || transaction.income > 0 || (transaction.expense === 0 && !isFirstRow) ? (
          <input
            type="text"
            value={transaction.income === 0 ? '' : formatCurrency(transaction.income)}
            onChange={(e) => handleNumberChange(e, 'income')}
            placeholder="-"
            className="w-full text-right bg-transparent border border-transparent hover:border-slate-200 focus:border-success focus:text-success focus:ring-0 rounded px-1 md:px-2 py-1 outline-none text-success font-medium text-xs md:text-sm"
          />
        ) : (
          <div className="text-right text-slate-300 px-1 md:px-2 text-xs md:text-sm">-</div>
        )}
      </td>

      {/* Expense */}
      <td className="p-1 md:p-2 min-w-[70px] md:min-w-[120px]">
        {!isFirstRow && (
          <input
            type="text"
            value={transaction.expense === 0 ? '' : formatCurrency(transaction.expense)}
            onChange={(e) => handleNumberChange(e, 'expense')}
            placeholder="-"
            className="w-full text-right bg-transparent border border-transparent hover:border-slate-200 focus:border-danger focus:text-danger focus:ring-0 rounded px-1 md:px-2 py-1 outline-none text-danger font-medium text-xs md:text-sm"
          />
        )}
        {isFirstRow && <div className="text-right text-slate-300 px-1 md:px-2 text-xs md:text-sm">-</div>}
      </td>

      {/* Balance (Calculated) */}
      <td className="p-1 md:p-2 min-w-[80px] md:min-w-[120px] text-right font-bold text-slate-700 text-xs md:text-sm">
        {formatCurrency(runningBalance)}
      </td>

      {/* Actions */}
      <td className="p-1 md:p-2 w-8 md:w-10 text-center">
        {!isFirstRow && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="text-slate-300 hover:text-danger p-1 rounded-full hover:bg-red-50 transition-colors"
            title="Hapus Baris"
          >
            <Trash2 size={14} className="md:w-4 md:h-4" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default TransactionRow;