export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/\./g, '');
  return parseInt(cleanValue, 10) || 0;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
