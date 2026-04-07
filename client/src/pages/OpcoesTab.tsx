import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Lock, LogOut, Store, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OpcoesTab() {
  const { settings, updatePassword, setScreen, stores, currentStore } = useApp();
  const [showPwd, setShowPwd] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleChangePwd = () => {
    if (oldPwd !== settings.password) { toast.error('Senha atual incorreta!'); return; }
    if (newPwd.length < 4) { toast.error('Mínimo 4 dígitos!'); return; }
    if (newPwd !== confirmPwd) { toast.error('Senhas não coincidem!'); return; }
    updatePassword(newPwd);
    setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    setShowPwd(false);
    toast.success('Senha alterada com sucesso!');
  };

  const store = stores[currentStore];

  return (
    <div className="space-y-4 pb-24">
      {/* Store Info */}
      <div className="bg-card rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{store.storeName}</h3>
            <p className="text-xs text-muted-foreground">CNPJ: {store.cnpj}</p>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-card rounded-2xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Segurança</h3>
        <button onClick={() => setShowPwd(true)}
          className="w-full flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
          <Lock className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Alterar Senha</p>
            <p className="text-[10px] text-muted-foreground">Senha de acesso ao app</p>
          </div>
        </button>
      </div>

      {/* About */}
      <div className="bg-card rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Financeiro DANADO</p>
            <p className="text-[10px] text-muted-foreground">Versão 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <Button variant="destructive" onClick={() => setScreen('login')} className="w-full gap-2">
        <LogOut className="w-4 h-4" /> Sair
      </Button>

      {/* Change Password Dialog */}
      <Dialog open={showPwd} onOpenChange={setShowPwd}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Alterar Senha</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Senha Atual</label>
              <Input type="password" inputMode="numeric" maxLength={6} value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Nova Senha</label>
              <Input type="password" inputMode="numeric" maxLength={6} value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Confirmar Nova Senha</label>
              <Input type="password" inputMode="numeric" maxLength={6} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowPwd(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleChangePwd} className="flex-1">Alterar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
