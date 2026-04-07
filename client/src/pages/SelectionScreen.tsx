import { useApp } from '@/contexts/AppContext';
import { TrendingUp, ShoppingCart, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SelectionScreen() {
  const { setScreen } = useApp();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-2xl font-bold text-foreground">Financeiro <span className="text-accent">DANADO</span></h1>
        <p className="text-muted-foreground text-sm mt-2">Selecione a área desejada</p>
      </motion.div>

      <div className="flex gap-4 w-full max-w-sm">
        <motion.button initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          onClick={() => setScreen('storeSelection')}
          className="flex-1 bg-primary rounded-2xl p-6 flex flex-col items-center gap-3 hover:opacity-90 active:scale-95 transition-all card-glow"
        >
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-primary-foreground font-bold text-lg">VENDAS</span>
          <span className="text-primary-foreground/70 text-xs">Gerenciar vendas</span>
        </motion.button>

        <motion.button initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          onClick={() => toast.info('Área de compras em desenvolvimento!')}
          className="flex-1 bg-muted rounded-2xl p-6 flex flex-col items-center gap-3 relative overflow-hidden opacity-60"
        >
          <div className="absolute top-2 right-2 bg-warning/20 text-warning text-[10px] font-bold px-2 py-0.5 rounded-full">EM BREVE</div>
          <div className="w-14 h-14 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground font-bold text-lg">COMPRAS</span>
          <span className="text-muted-foreground/50 text-xs">Em breve...</span>
          <Lock className="w-4 h-4 text-muted-foreground/40 absolute bottom-3 right-3" />
        </motion.button>
      </div>
    </div>
  );
}
