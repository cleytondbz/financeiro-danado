export interface Category {
  id: string;
  name: string;
  operation: 'add' | 'subtract' | 'null';
  order: number;
}

export interface DayEntry {
  date: string;
  values: Record<string, number>;
}

export interface MonthData {
  year: number;
  month: number;
  entries: DayEntry[];
}

export interface StoreData {
  storeId: string;
  storeName: string;
  cnpj: string;
  months: MonthData[];
  categories: Category[];
}

export interface Debt {
  id: string;
  personName: string;
  description: string;
  amount: number;
  date: string;
  paid: boolean;
  paidDate?: string;
  paidAmount?: number;
}

export interface AppSettings {
  password: string;
}

export type StoreId = 'loja1' | 'loja2';
export type AppScreen = 'login' | 'selection' | 'storeSelection' | 'main';
export type MainTab = 'dashboard' | 'lancamentos' | 'dividas' | 'totais' | 'opcoes';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'dinheiro', name: 'Dinheiro', operation: 'add', order: 1 },
  { id: 'pix', name: 'PIX', operation: 'add', order: 2 },
  { id: 'sobra', name: 'Sobra', operation: 'add', order: 3 },
  { id: 'cartao', name: 'Cartão', operation: 'add', order: 4 },
  { id: 'duplicata', name: 'Duplicata', operation: 'add', order: 5 },
  { id: 'cart_jb', name: 'Cart/JB', operation: 'add', order: 6 },
  { id: 'est_desp', name: 'Est/Desp', operation: 'subtract', order: 7 },
  { id: 'sangria', name: 'Sangria', operation: 'null', order: 8 },
];

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const CHART_COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)',
  '#8B5CF6', '#EC4899',
];

export const CHART_HEX = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#A855F7', '#8B5CF6', '#EC4899'];
