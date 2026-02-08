import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Share2, 
  Plus, 
  Settings, 
  Wallet, 
  PieChart,
  List
} from 'lucide-react';

import { Transaction, Category, Period } from './types';
import { DEFAULT_CATEGORIES, MONTHS, YEARS, INITIAL_PERIOD, AUTO_CATEGORY_KEYWORDS } from './constants';
import { formatCurrency, generateId } from './utils';

import TransactionRow from './components/TransactionRow';
import SettingsModal from './components/SettingsModal';
import Dashboard from './components/Dashboard';

function App() {
  // --- State ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'dashboard'>('input');
  const [period, setPeriod] = useState<Period>(INITIAL_PERIOD);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'initial-income', description: 'Penghasilan', categoryId: null, income: 0, expense: 0 }
  ]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savingsPercent, setSavingsPercent] = useState(20); // Default 20%
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // New state to control if categories should be shown in settings modal
  const [showSettingsCategories, setShowSettingsCategories] = useState(true);

  const tableRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null); // Ref for the hidden 9:16 export layout

  // --- Persistence ---
  useEffect(() => {
    // Load data from local storage
    const savedData = localStorage.getItem('budgetApp_v1');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.period) setPeriod(parsed.period);
        if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
        if (parsed.savingsPercent) setSavingsPercent(parsed.savingsPercent);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = {
        categories,
        transactions,
        period,
        whatsappNumber,
        savingsPercent
      };
      localStorage.setItem('budgetApp_v1', JSON.stringify(dataToSave));
    }
  }, [categories, transactions, period, whatsappNumber, savingsPercent, isLoaded]);

  // --- Logic ---

  const totalIncome = transactions.reduce((acc, t) => acc + t.income, 0);
  const totalExpense = transactions.reduce((acc, t) => acc + t.expense, 0);
  const finalBalance = totalIncome - totalExpense;

  const handleAddRow = () => {
    const newTx: Transaction = {
      id: generateId(),
      description: '',
      categoryId: null,
      income: 0,
      expense: 0
    };
    setTransactions([...transactions, newTx]);
  };

  const handleChangeRow = (id: string, field: keyof Transaction, value: any) => {
    setTransactions(prev => prev.map(t => {
      if (t.id !== id) return t;
      
      let updates = { [field]: value };

      // Auto-categorize logic when description changes
      if (field === 'description') {
        const lowerDesc = (value as string).toLowerCase();
        
        // Find the first matching keyword
        const match = AUTO_CATEGORY_KEYWORDS.find(item => lowerDesc.includes(item.keyword));
        
        if (match) {
          // Verify if the category exists in current categories (in case user deleted it)
          const categoryExists = categories.some(c => c.id === match.catId);
          if (categoryExists) {
            updates = { ...updates, categoryId: match.catId };
          }
        }
      }

      return { ...t, ...updates };
    }));
  };

  const handleDeleteRow = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddSavings = () => {
    const amount = Math.round(transactions[0].income * (savingsPercent / 100));
    const savingsCategory = categories.find(c => c.name.includes('Keuangan') || c.name.includes('Tabungan'));
    
    const newTx: Transaction = {
      id: generateId(),
      description: `Tabungan (${savingsPercent}%)`,
      categoryId: savingsCategory ? savingsCategory.id : null,
      income: 0,
      expense: amount
    };
    setTransactions([...transactions, newTx]);
  };

  // Helper function to generate image from the hidden 9:16 export layout
  const generateTableImage = async (): Promise<Blob | null> => {
    if (exportRef.current) {
      try {
        // Since we are using a dedicated export view that is already pure HTML/Text (no inputs),
        // we don't need the complex onclone input replacement logic anymore.
        // We just capture the exportRef which is styled as 1080x1920.
        
        const canvas = await html2canvas(exportRef.current, {
          scale: 1, // The element is already high-res (1080px wide)
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          width: 1080,
          height: 1920,
          windowWidth: 1080,
          windowHeight: 1920
        });

        return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      } catch (error) {
        console.error("Error generating image:", error);
        return null;
      }
    }
    return null;
  };

  const handleExportJPG = async () => {
     const blob = await generateTableImage();
     if (blob) {
        const link = document.createElement('a');
        link.download = `Laporan-Keuangan-${MONTHS[period.month]}-${period.year}.jpg`;
        link.href = URL.createObjectURL(blob);
        link.click();
     }
  };

  const handleShareWhatsApp = async () => {
    if (!whatsappNumber) {
      // If no number, open settings but hide category management to focus on number input
      setShowSettingsCategories(false);
      setIsSettingsOpen(true);
      alert('Mohon isi nomor WhatsApp terlebih dahulu.');
      return;
    }

    const title = `*Laporan Keuangan ${MONTHS[period.month]} ${period.year}*`;
    const summary = `
Total Masuk: Rp ${formatCurrency(totalIncome)}
Total Keluar: Rp ${formatCurrency(totalExpense)}
Sisa Saldo: Rp ${formatCurrency(finalBalance)}
`;

    // Try to generate image for sharing (Mobile Web Share API)
    let imageFile: File | null = null;
    try {
        const blob = await generateTableImage();
        if (blob) {
            imageFile = new File([blob], `Laporan-${MONTHS[period.month]}-${period.year}.jpg`, { type: 'image/jpeg' });
        }
    } catch (e) {
        console.error("Failed to generate image", e);
    }

    // Try Web Share API Level 2 (Files)
    if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        try {
            await navigator.share({
                files: [imageFile],
                title: title,
                text: `${title}\n${summary}`,
            });
            return; // Exit if shared successfully
        } catch (e) {
            console.log("Share API cancelled or failed", e);
            // Continue to fallback
        }
    } 
    
    // Fallback: Standard text link if image sharing is not supported or cancelled
    const detailList = transactions
      .filter(t => t.income > 0 || t.expense > 0)
      .map((t, i) => {
        const amount = t.income > 0 ? t.income : t.expense;
        const catName = categories.find(c => c.id === t.categoryId)?.name || '-';
        return `${i + 1}. ${t.description} [${catName}] : Rp ${formatCurrency(amount)}`;
      }).join('%0A');

    const message = `${title}%0A${summary}%0A*Detail:*%0A${detailList}`;
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleMainIncomeChange = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    const firstRow = transactions[0];
    handleChangeRow(firstRow.id, 'income', num);
  };

  const openFullSettings = () => {
    setShowSettingsCategories(true);
    setIsSettingsOpen(true);
  };

  // --- Render ---

  let runningBalance = 0;
  // Separate running balance for the export view
  let exportRunningBalance = 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 md:p-2 rounded-lg text-white">
              <Wallet size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg leading-tight">Alokasi Pendapatan</h1>
              <p className="text-[10px] md:text-xs text-slate-500">Kelola keuangan rumah tangga</p>
            </div>
          </div>
          <button 
            onClick={openFullSettings}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Settings size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-xl mx-auto max-w-sm">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
              activeTab === 'input' 
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <List size={16} /> Tabel
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <PieChart size={16} /> Dashboard
          </button>
        </div>
        
        {/* CONTENT SWITCHER */}
        {activeTab === 'input' ? (
          <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
            {/* Controls Section */}
            <section className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3 md:space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                 {/* Main Income Input */}
                 <div className="w-full md:flex-1">
                  <label className="block text-xs md:text-sm font-semibold text-slate-600 mb-1 md:mb-2">Penghasilan Bulan Ini</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm md:text-base">Rp</span>
                    <input 
                      type="text" 
                      value={transactions[0].income ? formatCurrency(transactions[0].income) : ''}
                      onChange={(e) => handleMainIncomeChange(e.target.value)}
                      placeholder="0"
                      className="w-full pl-9 md:pl-12 pr-4 py-2 md:py-4 text-lg md:text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Filters & Savings */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                  {/* Period Selector */}
                  <select 
                    value={period.month} 
                    onChange={(e) => setPeriod({ ...period, month: parseInt(e.target.value) })}
                    className="bg-white border border-slate-200 text-slate-700 text-xs md:text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 md:p-2.5 min-w-[90px]"
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select 
                    value={period.year}
                    onChange={(e) => setPeriod({ ...period, year: parseInt(e.target.value) })}
                    className="bg-white border border-slate-200 text-slate-700 text-xs md:text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 md:p-2.5 min-w-[70px]"
                  >
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>

                   {/* Savings Helper */}
                   <div className="flex items-center gap-1 md:gap-2 bg-green-50 p-1 md:p-2 rounded-lg border border-green-100 ml-auto md:ml-0">
                    <span className="text-[10px] md:text-xs font-bold text-green-700 whitespace-nowrap mr-1">Rencana Tabungan:</span>
                    <select 
                      value={savingsPercent}
                      onChange={(e) => setSavingsPercent(parseInt(e.target.value))}
                      className="bg-white text-xs border-green-200 rounded px-1 py-1 text-green-700 font-bold focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      {[10, 15, 20, 25, 30].map(p => <option key={p} value={p}>{p}%</option>)}
                    </select>
                    <button 
                      onClick={handleAddSavings}
                      className="text-xs bg-green-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-md hover:bg-green-700 transition-colors shadow-sm font-medium whitespace-nowrap"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* The Table Card (Visible to User) */}
            <div ref={tableRef} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden relative">
              
              {/* Header for visual/export */}
              <div className="bg-primary p-3 md:p-4 text-white">
                <div className="flex justify-between items-end">
                   <div>
                      <h2 className="text-lg md:text-xl font-bold">Laporan Keuangan</h2>
                      <p className="text-sky-100 text-xs md:text-sm">{MONTHS[period.month]} {period.year}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] md:text-xs text-sky-100 uppercase tracking-wider">Sisa Saldo</p>
                      <p className="text-xl md:text-2xl font-bold">{formatCurrency(finalBalance)}</p>
                   </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] md:text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-2 py-2 md:px-3 md:py-3 w-8 text-center hidden md:table-cell">No</th>
                      <th className="px-1 py-2 md:px-2 md:py-3 min-w-[100px] md:min-w-[150px]">
                        <span className="hidden md:inline">Keterangan</span>
                        <span className="md:hidden">Ket</span>
                      </th>
                      <th className="px-1 py-2 md:px-2 md:py-3 min-w-[90px] md:min-w-[140px]">
                        <span className="hidden md:inline">Kategori</span>
                        <span className="md:hidden">Kat</span>
                      </th>
                      <th className="px-1 py-2 md:px-2 md:py-3 text-right min-w-[70px] md:min-w-[120px]">
                        <span className="hidden md:inline">Masuk</span>
                        <span className="md:hidden">Msk</span>
                      </th>
                      <th className="px-1 py-2 md:px-2 md:py-3 text-right min-w-[70px] md:min-w-[120px]">
                        <span className="hidden md:inline">Keluar</span>
                        <span className="md:hidden">Klr</span>
                      </th>
                      <th className="px-1 py-2 md:px-2 md:py-3 text-right min-w-[80px] md:min-w-[120px]">
                        <span className="hidden md:inline">Sisa</span>
                        <span className="md:hidden">Sisa</span>
                      </th>
                      <th className="px-1 py-2 md:px-2 md:py-3 w-8 md:w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map((t, index) => {
                      runningBalance = runningBalance + t.income - t.expense;
                      return (
                        <TransactionRow
                          key={t.id}
                          index={index}
                          transaction={t}
                          categories={categories}
                          runningBalance={runningBalance}
                          onChange={handleChangeRow}
                          onDelete={handleDeleteRow}
                          isFirstRow={index === 0}
                        />
                      );
                    })}
                  </tbody>
                  {/* Footer Total */}
                  <tfoot className="bg-slate-50 font-bold text-slate-700 border-t-2 border-slate-200 text-[10px] md:text-sm">
                     <tr>
                        <td colSpan={2} className="hidden md:table-cell px-4 py-3 text-right text-slate-500 uppercase text-xs tracking-wider">Total</td>
                        <td className="md:hidden px-2 py-2 text-right text-slate-500 uppercase">Tot</td>
                        <td className="hidden md:table-cell"></td>
                        <td className="px-1 py-2 md:px-2 md:py-3 text-right text-success">{formatCurrency(totalIncome)}</td>
                        <td className="px-1 py-2 md:px-2 md:py-3 text-right text-danger">{formatCurrency(totalExpense)}</td>
                        <td className="px-1 py-2 md:px-2 md:py-3 text-right text-primary">{formatCurrency(finalBalance)}</td>
                        <td></td>
                     </tr>
                  </tfoot>
                </table>
              </div>

              {/* Empty State / Add Prompt */}
              {transactions.length === 1 && (
                <div className="p-6 md:p-8 text-center text-slate-400">
                   <PieChart className="mx-auto h-10 w-10 md:h-12 md:w-12 text-slate-200 mb-2" />
                   <p className="text-sm">Belum ada pengeluaran dicatat.</p>
                   <p className="text-xs md:text-sm">Klik "Tambah Baris" untuk mulai mencatat.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
               <button 
                onClick={handleAddRow}
                className="col-span-2 bg-white border-2 border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary font-medium py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
               >
                 <Plus size={16} className="md:w-5 md:h-5" /> Tambah Baris
               </button>
               
               <button 
                 onClick={handleExportJPG}
                 className="bg-slate-800 text-white hover:bg-slate-700 font-medium py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200"
               >
                 <Download size={16} className="md:w-[18px] md:h-[18px]" /> JPG
               </button>

               <button 
                 onClick={handleShareWhatsApp}
                 className="bg-green-500 text-white hover:bg-green-600 font-medium py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-100"
               >
                 <Share2 size={16} className="md:w-[18px] md:h-[18px]" /> Kirim WA
               </button>
            </div>
          </div>
        ) : (
          <Dashboard transactions={transactions} categories={categories} />
        )}

      </main>

      {/* --- HIDDEN EXPORT TEMPLATE (9:16 Ratio - 1080x1920) --- */}
      <div 
        ref={exportRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px', // Hide off-screen
          width: '1080px',
          height: '1920px',
          backgroundColor: 'white',
          zIndex: -50,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Export Header */}
        <div className="bg-primary px-12 py-10 text-white flex justify-between items-center h-[200px] shrink-0">
           <div>
              <h1 className="text-5xl font-bold mb-4">Laporan Keuangan</h1>
              <p className="text-3xl text-sky-100">{MONTHS[period.month]} {period.year}</p>
           </div>
           <div className="text-right">
             <div className="bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm">
                <p className="text-xl uppercase tracking-widest text-sky-50 mb-1">Sisa Saldo</p>
                <p className="text-5xl font-bold">{formatCurrency(finalBalance)}</p>
             </div>
           </div>
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-2 gap-8 px-12 py-8 bg-slate-50 shrink-0">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-2xl text-slate-500 uppercase tracking-wide font-semibold mb-2">Total Pemasukan</p>
              <p className="text-4xl font-bold text-success">Rp {formatCurrency(totalIncome)}</p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-2xl text-slate-500 uppercase tracking-wide font-semibold mb-2">Total Pengeluaran</p>
              <p className="text-4xl font-bold text-danger">Rp {formatCurrency(totalExpense)}</p>
           </div>
        </div>

        {/* Transaction Table */}
        <div className="px-12 py-4 flex-1 overflow-hidden relative">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-6 text-2xl font-semibold rounded-tl-xl rounded-bl-xl w-16 text-center">No</th>
                <th className="px-4 py-6 text-2xl font-semibold">Keterangan</th>
                <th className="px-4 py-6 text-2xl font-semibold">Kategori</th>
                <th className="px-4 py-6 text-2xl font-semibold text-right">Masuk</th>
                <th className="px-4 py-6 text-2xl font-semibold text-right">Keluar</th>
                <th className="px-4 py-6 text-2xl font-semibold text-right rounded-tr-xl rounded-br-xl">Sisa</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
               {transactions.map((t, i) => {
                 exportRunningBalance = exportRunningBalance + t.income - t.expense;
                 const cat = categories.find(c => c.id === t.categoryId);
                 const isEven = i % 2 === 0;
                 return (
                   <tr key={t.id} className={isEven ? 'bg-white' : 'bg-slate-50'}>
                     <td className="px-4 py-5 text-2xl text-center text-slate-400 border-b border-slate-100">{i + 1}</td>
                     <td className="px-4 py-5 text-2xl font-medium border-b border-slate-100">{t.description || '-'}</td>
                     <td className="px-4 py-5 border-b border-slate-100">
                       <div className="flex items-center gap-3">
                         {cat && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>}
                         <span className={`text-2xl ${cat ? 'font-semibold' : 'text-slate-400'}`} style={{ color: cat ? cat.color : undefined }}>
                           {cat ? cat.name : '-'}
                         </span>
                       </div>
                     </td>
                     <td className="px-4 py-5 text-2xl text-right font-medium text-success border-b border-slate-100">
                        {t.income > 0 ? formatCurrency(t.income) : '-'}
                     </td>
                     <td className="px-4 py-5 text-2xl text-right font-medium text-danger border-b border-slate-100">
                        {t.expense > 0 ? formatCurrency(t.expense) : '-'}
                     </td>
                     <td className="px-4 py-5 text-2xl text-right font-bold text-slate-600 border-b border-slate-100">
                        {formatCurrency(exportRunningBalance)}
                     </td>
                   </tr>
                 );
               })}
            </tbody>
          </table>
          
          {/* Fill remaining space visually if table is short */}
          <div className="flex-1 min-h-[100px]"></div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800 text-white p-12 text-center mt-auto shrink-0">
           <div className="flex justify-center items-center gap-4 mb-4 opacity-70">
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet size={40} className="text-white" />
              </div>
              <p className="text-3xl font-light">Alokasi Pendapatan</p>
           </div>
           <p className="text-xl text-slate-400">Laporan ini dibuat secara otomatis.</p>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        categories={categories}
        showCategories={showSettingsCategories}
        onAddCategory={(name, color) => {
          setCategories([...categories, { id: generateId(), name, color, isDefault: false }]);
        }}
        onDeleteCategory={(id) => {
          setCategories(categories.filter(c => c.id !== id));
        }}
        phoneNumber={whatsappNumber}
        onPhoneNumberChange={setWhatsappNumber}
      />

    </div>
  );
}

export default App;