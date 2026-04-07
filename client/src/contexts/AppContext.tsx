import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AppSettings, StoreData, Category, DayEntry, MonthData, Debt, StoreId, AppScreen, MainTab } from '@/lib/types';
import { DEFAULT_CATEGORIES } from '@/lib/types';
import { generateId } from '@/lib/helpers';
import { useSyncServer } from '@/hooks/useSyncServer';

interface AppContextType {
  settings: AppSettings;
  updatePassword: (p: string) => void;
  stores: Record<string, StoreData>;
  currentStore: StoreId;
  setCurrentStore: (s: StoreId) => void;
  getCategories: () => Category[];
  addCategory: (name: string, op: 'add' | 'subtract' | 'null') => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, u: Partial<Category>) => void;
  getMonthData: (y: number, m: number) => MonthData | undefined;
  saveEntry: (date: string, values: Record<string, number>) => void;
  deleteEntry: (date: string) => void;
  debts: Debt[];
  addDebt: (name: string, desc: string, amount: number, date: string) => void;
  payDebt: (id: string, amt?: number) => void;
  removeDebt: (id: string) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  selectedYear: number;
  selectedMonth: number;
  setSelectedYear: (y: number) => void;
  setSelectedMonth: (m: number) => void;
  filterMonths: number;
  setFilterMonths: (m: number) => void;
  screen: AppScreen;
  setScreen: (s: AppScreen) => void;
  tab: MainTab;
  setTab: (t: MainTab) => void;
  isLoading: boolean;
  isSyncing: boolean;
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be within AppProvider');
  return ctx;
};

const KEYS = { SETTINGS: 'fd_settings', STORES: 'fd_stores', DEBTS: 'fd_debts' };

const defaultSettings: AppSettings = { password: '2512' };

const mkStore = (id: StoreId, name: string, cnpj: string): StoreData => ({
  storeId: id, storeName: name, cnpj, months: [], categories: [...DEFAULT_CATEGORIES],
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [stores, setStores] = useState<Record<string, StoreData>>({
    loja1: mkStore('loja1', 'Loja 1', '09.545.637/0001/38'),
    loja2: mkStore('loja2', 'Loja 2', '42.016.151/0001-88'),
  });
  const [currentStore, setCurrentStore] = useState<StoreId>('loja1');
  const [debts, setDebts] = useState<Debt[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filterMonths, setFilterMonths] = useState(1);
  const [screen, setScreen] = useState<AppScreen>('selection');
  const [tab, setTab] = useState<MainTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { loadFromServer, saveToServer, isSyncing, isOnline } = useSyncServer();

  // Carregar dados na inicialização
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Tentar carregar do servidor primeiro
        const serverData = await loadFromServer();
        
        if (serverData) {
          // Dados do servidor disponíveis
          setSettings(serverData.settings || defaultSettings);
          setStores(serverData.stores || {
            loja1: mkStore('loja1', 'Loja 1', '09.545.637/0001/38'),
            loja2: mkStore('loja2', 'Loja 2', '42.016.151/0001-88'),
          });
          setDebts(serverData.debts || []);
          console.log('[AppContext] Loaded from server');
        } else {
          // Fallback para localStorage
          const s = localStorage.getItem(KEYS.SETTINGS);
          const st = localStorage.getItem(KEYS.STORES);
          const d = localStorage.getItem(KEYS.DEBTS);
          if (s) setSettings(JSON.parse(s));
          if (st) setStores(JSON.parse(st));
          if (d) setDebts(JSON.parse(d));
          console.log('[AppContext] Loaded from localStorage');
        }
      } catch (e) {
        console.error('[AppContext] Init error:', e);
      }
      setIsLoading(false);
      setHasInitialized(true);
    };

    initializeData();
  }, []);

  // Sincronizar com servidor quando dados mudam
  useEffect(() => {
    if (!isLoading && hasInitialized && isOnline) {
      const syncData = async () => {
        const success = await saveToServer({ settings, stores, debts });
        if (success) {
          console.log('[AppContext] Synced to server');
        }
      };

      // Sincronizar após 1 segundo de inatividade
      const timer = setTimeout(syncData, 1000);
      return () => clearTimeout(timer);
    }
  }, [settings, stores, debts, isLoading, hasInitialized, isOnline, saveToServer]);

  // Salvar em localStorage como fallback
  useEffect(() => {
    if (!isLoading && hasInitialized) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(KEYS.STORES, JSON.stringify(stores));
      localStorage.setItem(KEYS.DEBTS, JSON.stringify(debts));
    }
  }, [settings, stores, debts, isLoading, hasInitialized]);

  const updatePassword = (p: string) => setSettings(s => ({ ...s, password: p }));

  const getCategories = useCallback(() => {
    const cats = stores[currentStore]?.categories || DEFAULT_CATEGORIES;
    return [...cats].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [stores, currentStore]);

  const addCategory = (name: string, op: 'add' | 'subtract' | 'null') => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    setStores(p => ({
      ...p,
      [currentStore]: {
        ...p[currentStore],
        categories: [...p[currentStore].categories, { id, name, operation: op, order: p[currentStore].categories.length + 1 }],
      },
    }));
  };

  const removeCategory = (id: string) => {
    setStores(p => ({
      ...p,
      [currentStore]: { ...p[currentStore], categories: p[currentStore].categories.filter(c => c.id !== id) },
    }));
  };

  const updateCategory = (id: string, u: Partial<Category>) => {
    setStores(p => ({
      ...p,
      [currentStore]: {
        ...p[currentStore],
        categories: p[currentStore].categories.map(c => c.id === id ? { ...c, ...u } : c),
      },
    }));
  };

  const getMonthData = useCallback((y: number, m: number) => {
    return stores[currentStore]?.months.find(md => md.year === y && md.month === m);
  }, [stores, currentStore]);

  const saveEntry = (date: string, values: Record<string, number>) => {
    setStores(prev => {
      const store = { ...prev[currentStore], months: [...prev[currentStore].months] };
      const [yS, mS] = date.split('-');
      const y = parseInt(yS), m = parseInt(mS);
      let mi = store.months.findIndex(md => md.year === y && md.month === m);
      if (mi < 0) {
        store.months.push({ year: y, month: m, entries: [] });
        mi = store.months.length - 1;
      } else {
        store.months[mi] = { ...store.months[mi], entries: [...store.months[mi].entries] };
      }
      const ei = store.months[mi].entries.findIndex(e => e.date === date);
      if (ei >= 0) store.months[mi].entries[ei] = { date, values };
      else store.months[mi].entries.push({ date, values });
      return { ...prev, [currentStore]: store };
    });
  };

  const deleteEntry = (date: string) => {
    setStores(prev => {
      const store = { ...prev[currentStore], months: [...prev[currentStore].months] };
      const [yS, mS] = date.split('-');
      const y = parseInt(yS), m = parseInt(mS);
      const mi = store.months.findIndex(md => md.year === y && md.month === m);
      if (mi >= 0) {
        store.months[mi] = { ...store.months[mi], entries: store.months[mi].entries.filter(e => e.date !== date) };
      }
      return { ...prev, [currentStore]: store };
    });
  };

  const addDebt = (name: string, desc: string, amount: number, date: string) => {
    setDebts(d => [...d, { id: generateId(), personName: name, description: desc, amount, date, paid: false }]);
  };

  const payDebt = (id: string, amt?: number) => {
    setDebts(d => d.map(debt => debt.id === id ? { ...debt, paid: true, paidAmount: (debt.paidAmount || 0) + (amt || debt.amount) } : debt));
  };

  const removeDebt = (id: string) => {
    setDebts(d => d.filter(debt => debt.id !== id));
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(d => d.map(debt => debt.id === id ? { ...debt, ...updates } : debt));
  };

  const value: AppContextType = {
    settings,
    updatePassword,
    stores,
    currentStore,
    setCurrentStore,
    getCategories,
    addCategory,
    removeCategory,
    updateCategory,
    getMonthData,
    saveEntry,
    deleteEntry,
    debts,
    addDebt,
    payDebt,
    removeDebt,
    updateDebt,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    filterMonths,
    setFilterMonths,
    screen,
    setScreen,
    tab,
    setTab,
    isLoading,
    isSyncing,
    isOnline,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
