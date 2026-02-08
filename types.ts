export interface Category {
  id: string;
  name: string;
  color: string; // Hex code or Tailwind class
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  categoryId: string | null;
  income: number;
  expense: number;
}

export interface Period {
  month: number;
  year: number;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  period: Period;
  whatsappNumber: string;
  savingsPercentage: number;
}