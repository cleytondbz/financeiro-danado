import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getDaysInMonth, getDayOfWeek, dateStr } from '@/lib/helpers';
import { DAY_NAMES } from '@/lib/types';
import MonthSelector from '@/components/MonthSelector';
import { Plus, Settings2, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LancamentosTab() {
  const { getCategories, getMonthData, saveEntry, deleteEntry, addCategory, removeCategory, updateCategory, selectedYear, selectedMonth } = useApp();
  const cats = getCategories();
  const md = getMonthData(selectedYear, selectedMonth);
  const days = getDaysInMonth(selectedYear, selectedMonth);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCatMgr, setShowCatMgr] = useState(false);
  const [selDay, setSelDay] = useState(1);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [editDate, setEditDate] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatOp, setNewCatOp] = useState<'add' | 'subtract' | 'null'>('add');
  const [keepOpen, setKeepOpen] = useState(false);
  const [draggedCat, setDraggedCat] = useState<string | null>(null);

  const monthTotal = useMemo(() => {
    let t = 0;
    md?.entries.forEach(e => { cats.forEach(c => { 
      if (c.operation !== 'null') {
        t += (c.operation === 'add' ? 1 : -1) * (e.values[c.id] || 0); 
      }
    }); });
    return t;
  }, [md, cats]);

  const openAdd = () => {
    const v: Record<string, string> = {};
    cats.forEach(c => { v[c.id] = ''; });
    setVals(v); setSelDay(1); setShowAdd(true);
  };

  const openEdit = (ds: string) => {
    const entry = md?.entries.find(e => e.date === ds);
    const v: Record<string, string> = {};
    cats.forEach(c => { v[c.id] = entry?.values[c.id]?.toString() || ''; });
    setVals(v); setEditDate(ds); setShowEdit(true);
  };

  const handleSave = () => {
    const ds = dateStr(selectedYear, selectedMonth, selDay);
    const values: Record<string, number> = {};
    cats.forEach(c => { values[c.id] = parseFloat(vals[c.id]?.replace(',', '.') || '0') || 0; });
    saveEntry(ds, values);
    toast.success('Lançamento salvo!');
    
    if (keepOpen) {
      // Reset form for next entry
      const v: Record<string, string> = {};
      cats.forEach(c => { v[c.id] = ''; });
      setVals(v);
      setSelDay(selDay < days ? selDay + 1 : selDay);
    } else {
      setShowAdd(false);
    }
  };

  const handleUpdate = () => {
    const values: Record<string, number> = {};
    cats.forEach(c => { values[c.id] = parseFloat(vals[c.id]?.replace(',', '.') || '0') || 0; });
    saveEntry(editDate, values);
    setShowEdit(false);
    toast.success('Lançamento atualizado!');
  };

  const handleDelete = (ds: string) => {
    if (confirm('Excluir este lançamento?')) {
      deleteEntry(ds);
      toast.success('Excluído!');
    }
  };

  const handleAddCat = () => {
    if (!newCatName.trim()) { toast.error('Digite o nome'); return; }
    addCategory(newCatName.trim(), newCatOp);
    setNewCatName(''); setNewCatOp('add'); toast.success('Categoria adicionada!');
  };

  const getDayTotal = (ds: string) => {
    const entry = md?.entries.find(e => e.date === ds);
    if (!entry) return 0;
    let t = 0;
    cats.forEach(c => { 
      if (c.operation === 'add' || c.operation === 'subtract') {
        t += (c.operation === 'add' ? 1 : -1) * (entry.values[c.id] || 0); 
      }
    });
    return t;
  };

  const allDays = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const d = i + 1;
      const ds = dateStr(selectedYear, selectedMonth, d);
      return { day: d, ds, entry: md?.entries.find(e => e.date === ds), dow: getDayOfWeek(ds) };
    });
  }, [md, selectedYear, selectedMonth, days]);

  const handleMoveCategory = (catId: string, direction: 'up' | 'down') => {
    const index = cats.findIndex(c => c.id === catId);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < cats.length - 1)) {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const cat1 = cats[index];
      const cat2 = cats[newIndex];
      const temp = cat1.order;
      updateCategory(cat1.id, { order: cat2.order });
      updateCategory(cat2.id, { order: temp });
      toast.success(`Categoria movida para ${direction === 'up' ? 'cima' : 'baixo'}!`);
    }
  };

  return (
    <div className="space-y-3 pb-24">
      <MonthSelector />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={openAdd} className="flex-1 gap-1"><Plus className="w-4 h-4" /> Lançar</Button>
        <Button onClick={() => setShowCatMgr(true)} variant="secondary" className="gap-1"><Settings2 className="w-4 h-4" /> Categorias</Button>
      </div>

      {/* Total bar */}
      <div className="bg-primary/20 border border-primary/30 rounded-xl px-4 py-2 text-center">
        <span className="text-xs text-muted-foreground">Total: </span>
        <span className="font-bold font-mono-num text-primary">{formatCurrency(monthTotal)}</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header */}
            <div className="flex bg-primary text-primary-foreground text-[10px] font-bold sticky top-0">
              <div className="w-12 p-2 text-center shrink-0">Dia</div>
              {cats.map(c => <div key={c.id} className="w-20 p-2 text-center shrink-0">{c.name}</div>)}
              <div className="w-20 p-2 text-center shrink-0">Saldo</div>
              <div className="w-16 p-2 text-center shrink-0">Ações</div>
            </div>
            {/* Rows */}
            {allDays.map(({ day, ds, entry, dow }) => {
              const isSun = dow === 0;
              return (
                <div key={day} className={`flex text-[11px] border-b border-border/50 ${isSun ? 'bg-destructive/10' : day % 2 === 0 ? 'bg-secondary/30' : ''}`}>
                  <div className="w-12 p-2 text-center shrink-0">
                    <div className={`font-bold ${isSun ? 'text-destructive' : 'text-foreground'}`}>{String(day).padStart(2, '0')}</div>
                    <div className={`text-[8px] ${isSun ? 'text-destructive' : 'text-muted-foreground'}`}>{DAY_NAMES[dow]}</div>
                  </div>
                  {cats.map(c => (
                    <div key={c.id} className="w-20 p-2 text-center shrink-0">
                      <span className={`font-mono-num ${entry?.values[c.id] ? (c.operation === 'subtract' ? 'text-destructive' : c.operation === 'add' ? 'text-foreground' : 'text-muted-foreground') : 'text-muted-foreground/40'}`}>
                        {entry?.values[c.id] ? formatCurrency(entry.values[c.id]) : '-'}
                      </span>
                    </div>
                  ))}
                  <div className="w-20 p-2 text-center shrink-0">
                    <span className={`font-bold font-mono-num ${entry ? (getDayTotal(ds) >= 0 ? 'text-success' : 'text-destructive') : 'text-muted-foreground/40'}`}>
                      {entry ? formatCurrency(getDayTotal(ds)) : '-'}
                    </span>
                  </div>
                  <div className="w-16 p-2 flex items-center justify-center gap-1 shrink-0">
                    {entry && (
                      <>
                        <button onClick={() => openEdit(ds)} className="p-1 rounded bg-warning/20 hover:bg-warning/30">
                          <Pencil className="w-3 h-3 text-warning" />
                        </button>
                        <button onClick={() => handleDelete(ds)} className="p-1 rounded bg-destructive/20 hover:bg-destructive/30">
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Dia</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {Array.from({ length: days }, (_, i) => i + 1).map(d => (
                  <button key={d} onClick={() => setSelDay(d)}
                    className={`w-9 h-8 rounded-lg text-xs font-semibold transition-all ${selDay === d ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-primary/20'}`}>
                    {String(d).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
            {cats.map(c => (
              <div key={c.id}>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium">{c.name}</label>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.operation === 'add' ? 'bg-success/20 text-success' : c.operation === 'subtract' ? 'bg-destructive/20 text-destructive' : 'bg-muted/20 text-muted-foreground'}`}>
                    {c.operation === 'add' ? '+' : c.operation === 'subtract' ? '-' : 'Nulo'}
                  </span>
                </div>
                <Input type="text" inputMode="decimal" placeholder="0,00"
                  value={vals[c.id] || ''}
                  onChange={e => setVals(p => ({ ...p, [c.id]: e.target.value }))}
                  className="font-mono-num" />
              </div>
            ))}
            
            {/* Keep Open Option */}
            <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
              <input type="checkbox" id="keepOpen" checked={keepOpen} onChange={e => setKeepOpen(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="keepOpen" className="text-sm font-medium cursor-pointer flex-1">Continuar adicionando</label>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} className="flex-1">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar - {editDate.split('-').reverse().join('/')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {cats.map(c => (
              <div key={c.id}>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium">{c.name}</label>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.operation === 'add' ? 'bg-success/20 text-success' : c.operation === 'subtract' ? 'bg-destructive/20 text-destructive' : 'bg-muted/20 text-muted-foreground'}`}>
                    {c.operation === 'add' ? '+' : c.operation === 'subtract' ? '-' : 'Nulo'}
                  </span>
                </div>
                <Input type="text" inputMode="decimal" placeholder="0,00"
                  value={vals[c.id] || ''}
                  onChange={e => setVals(p => ({ ...p, [c.id]: e.target.value }))}
                  className="font-mono-num" />
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowEdit(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleUpdate} className="flex-1">Atualizar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Manager Dialog */}
      <Dialog open={showCatMgr} onOpenChange={setShowCatMgr}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Gerenciar Categorias</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {cats.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleMoveCategory(c.id, 'up')} disabled={idx === 0}
                    className="p-0.5 rounded hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" title="Mover para cima">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3.707 9.293a1 1 0 010 1.414l5 5a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L10 12.586 5.121 7.707a1 1 0 00-1.414 0z" transform="rotate(180 10 10)" /></svg>
                  </button>
                  <button onClick={() => handleMoveCategory(c.id, 'down')} disabled={idx === cats.length - 1}
                    className="p-0.5 rounded hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" title="Mover para baixo">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3.707 9.293a1 1 0 010 1.414l5 5a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L10 12.586 5.121 7.707a1 1 0 00-1.414 0z" /></svg>
                  </button>
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">{c.name}</span>
                <button onClick={() => updateCategory(c.id, { operation: (c.operation === 'add' ? 'subtract' : c.operation === 'subtract' ? 'null' : 'add') as 'add' | 'subtract' | undefined })}
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${c.operation === 'add' ? 'bg-success/20 text-success' : c.operation === 'subtract' ? 'bg-destructive/20 text-destructive' : 'bg-muted/20 text-muted-foreground'}`}>
                  {c.operation === 'add' ? '+ Soma' : c.operation === 'subtract' ? '- Subtrai' : 'Nulo'}
                </button>
                <button onClick={() => { if (confirm(`Excluir "${c.name}"?`)) removeCategory(c.id); }}
                  className="p-1 rounded bg-destructive/20 hover:bg-destructive/30">
                  <X className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))}
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="text-sm font-bold text-foreground">Adicionar Categoria</h4>
              <Input placeholder="Nome da categoria" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => setNewCatOp('add')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold ${newCatOp === 'add' ? 'bg-success text-success-foreground' : 'bg-secondary text-foreground'}`}>
                  + Soma
                </button>
                <button onClick={() => setNewCatOp('subtract')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold ${newCatOp === 'subtract' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-foreground'}`}>
                  - Subtrai
                </button>
                <button onClick={() => setNewCatOp('null')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold ${newCatOp === 'null' ? 'bg-muted text-muted-foreground' : 'bg-secondary text-foreground'}`}>
                  Nulo
                </button>
              </div>
              <Button onClick={handleAddCat} className="w-full">Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
