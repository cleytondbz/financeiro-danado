import { useApp } from '@/contexts/AppContext';
import type { MainTab } from '@/lib/types';
import { LayoutDashboard, FileSpreadsheet, Users, Calculator, Settings, ArrowLeft, Store } from 'lucide-react';
import DashboardTab from './DashboardTab';
import LancamentosTab from './LancamentosTab';
import DividasTab from './DividasTab';
import TotaisTab from './TotaisTab';
import OpcoesTab from './OpcoesTab';
import { motion, AnimatePresence } from 'framer-motion';

const tabs: { id: MainTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos', label: 'Lançamentos', icon: FileSpreadsheet },
  { id: 'dividas', label: 'Dívidas', icon: Users },
  { id: 'totais', label: 'Totais', icon: Calculator },
  { id: 'opcoes', label: 'Opções', icon: Settings },
];

export default function MainLayout() {
  const { tab, setTab, setScreen, stores, currentStore, setCurrentStore } = useApp();
  const store = stores[currentStore];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => setScreen('storeSelection')} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        {/* Seletor de Loja - Aumentado e à Esquerda */}
        <select 
          value={currentStore} 
          onChange={(e) => setCurrentStore(e.target.value as any)}
          className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground border border-primary hover:bg-primary/90 transition-colors cursor-pointer min-w-[120px]"
        >
          <option value="loja1">Loja 1</option>
          <option value="loja2">Loja 2</option>
        </select>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">{store.storeName}</h1>
            <p className="text-[9px] text-muted-foreground">{store.cnpj}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {tabs.find(t => t.id === tab)?.label}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
            {tab === 'dashboard' && <DashboardTab />}
            {tab === 'lancamentos' && <LancamentosTab />}
            {tab === 'dividas' && <DividasTab />}
            {tab === 'totais' && <TotaisTab />}
            {tab === 'opcoes' && <OpcoesTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-30 bg-card/90 backdrop-blur-xl border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex flex-col items-center py-2 px-1 min-w-[56px] transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <t.icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_6px_var(--primary)]' : ''}`} />
                <span className="text-[9px] font-semibold mt-0.5">{t.label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
