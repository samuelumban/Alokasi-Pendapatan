import React, { useState } from 'react';
import { Category } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  showCategories?: boolean;
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (num: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  categories,
  showCategories = true,
  onAddCategory,
  onDeleteCategory,
  phoneNumber,
  onPhoneNumberChange
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim(), newCatColor);
      setNewCatName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {showCategories ? 'Pengaturan' : 'Atur Nomor WhatsApp'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* WhatsApp Settings */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">WhatsApp Data</h3>
            <div className="space-y-2">
              <label className="text-sm text-slate-600 block">Nomor HP (Format: 628...)</label>
              <input 
                type="text" 
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="628123456789"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                autoFocus={!showCategories}
              />
              <p className="text-xs text-slate-400">Nomor ini akan digunakan sebagai tujuan default pengiriman laporan.</p>
            </div>
          </section>

          {/* Category Management */}
          {showCategories && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Manajemen Kategori</h3>
              
              {/* Add New */}
              <div className="flex gap-2 mb-4 items-end">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Nama Kategori</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Contoh: Sedekah"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Warna</label>
                  <input 
                    type="color" 
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-[38px] w-12 rounded cursor-pointer border p-1"
                  />
                </div>
                <Button onClick={handleAdd} size="md" className="mb-[1px]">
                  <Plus size={18} />
                </Button>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      {cat.isDefault && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Default</span>}
                    </div>
                    {!cat.isDefault && (
                      <button 
                        onClick={() => onDeleteCategory(cat.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
        
        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <Button onClick={onClose}>Simpan & Tutup</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;