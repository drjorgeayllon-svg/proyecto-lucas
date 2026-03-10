import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  ListOrdered, 
  PieChart, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Users,
  X,
  CreditCard,
  Coffee,
  ShoppingCart,
  Car,
  Home as HomeIcon,
  Zap,
  User,
  Building,
  Landmark,
  PiggyBank,
  Settings,
  LogOut,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Bell,
  Moon,
  Download,
  Tags,
  WalletCards,
  Shield,
  Link2,
  Percent,
  Calculator,
  Eye,
  EyeOff,
  CalendarClock
} from 'lucide-react';

// --- CONFIGURACIÓN DE USUARIOS FAMILIARES ---
const USERS = {
  yo: { name: 'Jorge', email: 'jorge@email.com', avatar: '👨🏻', color: 'bg-zinc-800' },
  pareja: { name: 'Gicela', email: 'gicela@email.com', avatar: '👩🏽', color: 'bg-indigo-600' }
};

// --- DATOS INICIALES ---
const INITIAL_ACCOUNTS = {
  personal: [
    { id: 'efectivo_p', name: 'Billetera Jorge', type: 'cash', balance: 500, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 'banco_p', name: 'Cuenta Sueldo', type: 'bank', balance: 3500, icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'tc_p', name: 'Tarjeta Crédito', type: 'credit', balance: -1200, icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-100' },
  ],
  pareja: [
    { id: 'banco_j', name: 'Fondo Pareja', type: 'bank', balance: 4200, icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { id: 'ahorro_l', name: 'Ahorro Lucas 👶🏻', type: 'savings', balance: 1500, icon: PiggyBank, color: 'text-amber-500', bg: 'bg-amber-100' },
  ]
};

const INITIAL_TRANSACTIONS = [
  { id: 1, space: 'personal', type: 'ingreso', amount: 3500, accountId: 'banco_p', category: 'Salario', desc: 'Sueldo de Jorge', date: '2026-03-01', addedBy: 'yo' },
  { id: 2, space: 'personal', type: 'gasto', amount: 45, accountId: 'efectivo_p', category: 'Comida', desc: 'Almuerzo oficina', date: '2026-03-02', addedBy: 'yo' },
  { id: 4, space: 'pareja', type: 'gasto', amount: 1000, accountId: 'banco_j', category: 'Hogar', desc: 'Alquiler (Jorge)', date: '2026-03-05', addedBy: 'yo' },
  { id: 5, space: 'pareja', type: 'gasto', amount: 400, accountId: 'banco_j', category: 'Supermercado', desc: 'Compra Gicela', date: '2026-03-08', addedBy: 'pareja' },
];

const CATEGORIES = {
  gasto: [
    { id: 'Supermercado', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'Hogar', icon: HomeIcon, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 'Transporte', icon: Car, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 'Comida', icon: Coffee, color: 'text-rose-500', bg: 'bg-rose-100' },
    { id: 'Servicios', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { id: 'Otros', icon: CreditCard, color: 'text-slate-500', bg: 'bg-slate-100' },
  ],
  ingreso: [
    { id: 'Salario', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 'Aporte', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { id: 'Negocio', icon: ArrowUpRight, color: 'text-teal-500', bg: 'bg-teal-100' },
    { id: 'Otros', icon: Plus, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  ]
};

const formatMoney = (amount) => {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 0 }).format(amount);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentSpace, setCurrentSpace] = useState('personal'); 
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enableSplitCalculation, setEnableSplitCalculation] = useState(true);
  
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isDiscreetMode, setIsDiscreetMode] = useState(false);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddAccount = (space, newAccount) => {
    setAccounts(prev => ({
      ...prev,
      [space]: [...prev[space], { ...newAccount, id: Date.now().toString() }]
    }));
  };

  const handleUpdateAccountBalance = (space, accountId, newBalance) => {
    setAccounts(prev => ({
      ...prev,
      [space]: prev[space].map(acc => 
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      )
    }));
  };

  const renderMoney = (amount) => {
    if (isDiscreetMode) return '***';
    return formatMoney(amount);
  };

  const { totalIncome, totalExpense, balance, spaceTransactions, spaceAccounts } = useMemo(() => {
    const filteredTx = transactions.filter(t => t.space === currentSpace);
    let income = 0; let expense = 0;
    filteredTx.forEach(t => {
      if (t.type === 'ingreso') income += t.amount;
      if (t.type === 'gasto') expense += t.amount;
    });
    const currentAccounts = accounts[currentSpace];
    const actualBalance = currentAccounts.reduce((acc, curr) => acc + curr.balance, 0);
    return { totalIncome: income, totalExpense: expense, balance: actualBalance, spaceTransactions: filteredTx, spaceAccounts: currentAccounts };
  }, [transactions, currentSpace, accounts]);

  const handleAddTransaction = (newTx) => {
    const simulatedUser = currentSpace === 'pareja' && Math.random() > 0.5 ? 'pareja' : 'yo';
    setTransactions([{ ...newTx, id: Date.now(), addedBy: simulatedUser, date: new Date().toISOString().split('T')[0] }, ...transactions]);
    setAccounts(prev => {
      const updated = { ...prev };
      updated[newTx.space] = updated[newTx.space].map(acc => {
        if (acc.id === newTx.accountId) return { ...acc, balance: newTx.type === 'ingreso' ? acc.balance + newTx.amount : acc.balance - newTx.amount };
        return acc;
      });
      return updated;
    });
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = (id, txSpace, txType, txAmount, accountId) => {
    setTransactions(transactions.filter(t => t.id !== id));
    setAccounts(prev => {
      const updated = { ...prev };
      updated[txSpace] = updated[txSpace].map(acc => acc.id === accountId ? { ...acc, balance: txType === 'ingreso' ? acc.balance - txAmount : acc.balance + txAmount } : acc);
      return updated;
    });
  };

  const HomeView = () => {
    const currentDay = Math.max(1, new Date().getDate());
    const dailyAvg = totalExpense / currentDay;
    return (
      <div className="p-5 space-y-7 pb-28 overflow-y-auto h-full hide-scrollbar animate-fade-in">
        <div className="flex bg-zinc-100 p-1.5 rounded-full w-full max-w-[260px] mx-auto border border-zinc-200/50 shadow-inner">
          <button onClick={() => setCurrentSpace('personal')} className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-300 ${currentSpace === 'personal' ? 'bg-white shadow text-zinc-800 scale-100' : 'text-zinc-400 hover:text-zinc-600'}`}>Personal</button>
          <button onClick={() => setCurrentSpace('pareja')} className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-300 ${currentSpace === 'pareja' ? 'bg-white shadow text-indigo-600 scale-100' : 'text-zinc-400 hover:text-zinc-600'}`}>Pareja</button>
        </div>

        <div onClick={() => setShowBalanceDetails(!showBalanceDetails)} className={`rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden transition-all duration-500 transform hover:scale-[1.02] cursor-pointer ${currentSpace === 'personal' ? 'bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-700' : 'bg-gradient-to-tr from-indigo-900 via-violet-800 to-fuchsia-700'}`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          {showBalanceDetails ? (
            <div className="relative z-10 animate-fade-in flex flex-col justify-between min-h-[140px]">
              <div className="space-y-2">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Desglose {currentSpace}</p>
                {spaceAccounts.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center text-sm font-medium">
                    <span className="flex items-center gap-2 text-white/80"><acc.icon size={12}/> {acc.name}</span>
                    <span>{renderMoney(acc.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest flex items-center gap-1"><Zap size={10}/> Gasto Diario: {renderMoney(dailyAvg)}</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 animate-fade-in">
              <p className="text-white/70 text-xs font-medium uppercase mb-1">{currentSpace === 'personal' ? 'Mi Balance Jorge' : 'Fondo Pareja'}</p>
              <h1 className="text-4xl font-light mb-6 tracking-tight">{renderMoney(balance)}</h1>
              <div className="flex justify-between border-t border-white/10 pt-4">
                <div><p className="text-[10px] text-emerald-300 uppercase font-bold">Ingresos</p><p className="text-sm font-bold">{renderMoney(totalIncome)}</p></div>
                <div className="w-px h-8 bg-white/10"></div>
                <div><p className="text-[10px] text-rose-300 uppercase font-bold">Gastos</p><p className="text-sm font-bold">{renderMoney(totalExpense)}</p></div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-zinc-800">Cuentas</h3>
            <button onClick={() => setIsManageAccountsOpen(true)} className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors">Administrar</button>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-5 px-5 snap-x">
            {spaceAccounts.map(acc => (
              <div key={acc.id} className="snap-center min-w-[150px] bg-white p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm flex-shrink-0">
                <div className={`p-3 rounded-2xl w-fit mb-4 ${acc.bg} ${acc.color}`}><acc.icon size={20} /></div>
                <p className="text-xs text-zinc-500 font-medium mb-1 truncate">{acc.name}</p>
                <p className="text-base font-bold">{renderMoney(acc.balance)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-zinc-800">Recientes</h3>
            <button onClick={() => setActiveTab('transactions')} className="text-xs text-zinc-400 font-medium flex items-center">Ver todo <ChevronRight size={14}/></button>
          </div>
          <div className="space-y-3">
            {spaceTransactions.length > 0 ? spaceTransactions.slice(0, 4).map(tx => <TransactionItem key={tx.id} tx={tx} accounts={accounts} onDelete={handleDeleteTransaction} isDiscreetMode={isDiscreetMode} />) : <p className="text-center py-6 text-zinc-400 text-sm italic">Sin movimientos aún</p>}
          </div>
        </div>
      </div>
    );
  };

  const TransactionsView = () => (
    <div className="p-5 pb-28 overflow-y-auto h-full hide-scrollbar bg-zinc-50 animate-fade-in">
      <h2 className="text-2xl font-bold text-zinc-800 mb-6 tracking-tight">Historial</h2>
      <div className="space-y-3">
        {spaceTransactions.length > 0 ? spaceTransactions.map(tx => <TransactionItem key={tx.id} tx={tx} accounts={accounts} onDelete={handleDeleteTransaction} isDiscreetMode={isDiscreetMode} />) : <p className="text-center py-20 text-zinc-400">No hay registros este mes</p>}
      </div>
    </div>
  );

  const BudgetView = () => {
    const expensesByCategory = spaceTransactions.filter(t => t.type === 'gasto').reduce((acc, tx) => { acc[tx.category] = (acc[tx.category] || 0) + tx.amount; return acc; }, {});
    const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
    const maxExpense = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;
    let jPaid = 0; let gPaid = 0;
    spaceTransactions.filter(t => t.type === 'gasto').forEach(tx => { if (tx.addedBy === 'yo') jPaid += tx.amount; if (tx.addedBy === 'pareja') gPaid += tx.amount; });
    const jTarget = totalExpense * (splitRatio / 100);
    const diff = jPaid - jTarget;
    return (
      <div className="p-5 pb-28 overflow-y-auto h-full hide-scrollbar animate-fade-in">
        <h2 className="text-2xl font-bold text-zinc-800 mb-6">Análisis</h2>
        {currentSpace === 'pareja' && totalExpense > 0 && (
          <div className="bg-zinc-900 rounded-3xl p-6 text-white mb-8 shadow-xl">
             <div className="flex justify-between items-center mb-4"><span className="text-xs font-bold uppercase tracking-widest text-white/50">Cuentas Claras Jorge/Gicela</span><button onClick={() => setIsSplitModalOpen(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Percent size={14}/></button></div>
             <div className="flex justify-between text-xs font-bold mb-2"><span>Jorge: {formatMoney(jPaid)}</span><span>Gicela: {formatMoney(gPaid)}</span></div>
             <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(jPaid/totalExpense)*100}%` }}/></div>
             <div className="p-3 bg-white/5 rounded-xl text-center text-xs font-bold text-indigo-300 border border-white/10">{diff > 0 ? `Gicela debe transferirte ${formatMoney(Math.abs(diff))}` : `Debes transferirle ${formatMoney(Math.abs(diff))} a Gicela`}</div>
          </div>
        )}
        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Gasto por Categoría</h4>
        <div className="space-y-6">
          {sortedCategories.map(([cat, amt]) => (
            <div key={cat} className="group">
              <div className="flex justify-between text-sm font-bold text-zinc-800 mb-1.5"><span>{cat}</span><span>{formatMoney(amt)}</span></div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-zinc-800 transition-all duration-1000" style={{ width: `${(amt/maxExpense)*100}%` }}/></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ProfileView = () => (
    <div className="p-5 pb-28 overflow-y-auto h-full hide-scrollbar bg-zinc-50/50 animate-fade-in">
      <h2 className="text-2xl font-bold text-zinc-800 mb-6">Configuración</h2>
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 mb-8 flex items-center gap-4">
         <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-3xl shadow-lg">{USERS.yo.avatar}</div>
         <div><h3 className="font-bold text-xl text-zinc-800">{USERS.yo.name}</h3><p className="text-xs text-zinc-400 font-medium">Plan Pareja Lucas 👶🏻</p></div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden mb-8">
         <button onClick={() => setIsSplitModalOpen(true)} className="w-full flex justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors"><span className="text-sm font-bold flex items-center gap-3"><Percent size={18} className="text-amber-500"/> Regla Jorge / Gicela</span><span className="text-xs font-bold text-zinc-400">{splitRatio}/{100-splitRatio} <ChevronRight size={14}/></span></button>
         <button onClick={() => setIsManageAccountsOpen(true)} className="w-full flex justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors"><span className="text-sm font-bold flex items-center gap-3"><WalletCards size={18} className="text-emerald-500"/> Mis Billeteras</span><ChevronRight size={14} className="text-zinc-400"/></button>
         <button onClick={() => showToast("Exportando Excel para Gicela y Jorge...")} className="w-full flex justify-between p-4 hover:bg-zinc-50 transition-colors"><span className="text-sm font-bold flex items-center gap-3"><Download size={18} className="text-blue-500"/> Exportar para Excel</span><ChevronRight size={14} className="text-zinc-400"/></button>
      </div>
      <button onClick={() => showToast("Cerrando sesión segura...")} className="w-full p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"><LogOut size={18}/> Salir de la App</button>
    </div>
  );

  return (
    <div className="bg-zinc-200/50 min-h-screen flex justify-center items-center p-0 sm:p-4 font-sans text-zinc-900 relative">
      <div className="w-full max-w-[400px] h-[100dvh] sm:h-[820px] bg-white sm:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col sm:border-[10px] border-zinc-900">
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-50"></div>
        <div className="px-6 pt-12 pb-2 bg-white flex justify-between items-center z-30 border-b border-zinc-100/50 backdrop-blur-xl bg-white/80">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('profile')} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-xl shadow-sm border border-zinc-200">{USERS.yo.avatar}</button>
            <div><p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Hola, Jorge</p><h2 className="text-sm font-extrabold text-zinc-800 tracking-tight">Proyecto Lucas</h2></div>
          </div>
          <div className="relative">
            <button onClick={() => setIsTopMenuOpen(!isTopMenuOpen)} className={`p-2 rounded-full border transition-colors ${isTopMenuOpen ? 'bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-zinc-50 border-zinc-100 text-zinc-500'}`}><Settings size={20} /></button>
            {isTopMenuOpen && (
              <div className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-2 z-50 animate-fade-in origin-top-right">
                <button onClick={() => { setIsDiscreetMode(!isDiscreetMode); setIsTopMenuOpen(false); }} className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors"><span className="text-sm font-bold flex items-center gap-2">{isDiscreetMode ? <EyeOff size={16} className="text-indigo-500"/> : <Eye size={16}/>} Modo Discreto</span><div className={`w-10 h-6 rounded-full relative transition-colors ${isDiscreetMode ? 'bg-indigo-500' : 'bg-zinc-200'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isDiscreetMode ? 'translate-x-5' : 'translate-x-1'}`}/></div></button>
                <div className="h-px bg-zinc-100 my-1 mx-2"></div>
                <button onClick={() => { setIsTopMenuOpen(false); alert("Historial de meses para Gicela y Jorge próximamente"); }} className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl transition-colors font-bold text-sm text-zinc-700"><CalendarClock size={18} className="text-amber-500"/> Historial de Meses</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'budget' && <BudgetView />}
          {activeTab === 'profile' && <ProfileView />}
        </div>

        <div className="absolute bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 px-6 py-4 flex justify-between items-center z-20 pb-safe shadow-lg rounded-b-[2.5rem]">
          <button onClick={() => setActiveTab('home')} className={`p-2 transition-all ${activeTab === 'home' ? 'text-zinc-900 scale-110' : 'text-zinc-400'}`}><Home size={24} strokeWidth={activeTab === 'home' ? 3 : 2}/></button>
          <button onClick={() => setActiveTab('transactions')} className={`p-2 transition-all ${activeTab === 'transactions' ? 'text-zinc-900 scale-110' : 'text-zinc-400'}`}><ListOrdered size={24}/></button>
          <div className="w-16"></div>
          <button onClick={() => setActiveTab('budget')} className={`p-2 transition-all ${activeTab === 'budget' ? 'text-indigo-600 scale-110' : 'text-zinc-400'}`}><PieChart size={24}/></button>
          <button onClick={() => setActiveTab('profile')} className={`p-2 transition-all ${activeTab === 'profile' ? 'text-zinc-900 scale-110' : 'text-zinc-400'}`}><User size={24}/></button>
        </div>

        <button onClick={() => setIsModalOpen(true)} className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white p-4 rounded-full shadow-2xl z-30 active:scale-95 transition-all hover:scale-110 ${currentSpace === 'personal' ? 'bg-zinc-900 shadow-zinc-900/40' : 'bg-indigo-600 shadow-indigo-600/40'}`}><Plus size={32} strokeWidth={3}/></button>
      </div>

      {isModalOpen && <AddTransactionModal onClose={() => setIsModalOpen(false)} onSave={handleAddTransaction} initialSpace={currentSpace} accounts={accounts} />}
      {isManageAccountsOpen && <ManageAccountsModal onClose={() => setIsManageAccountsOpen(false)} accounts={spaceAccounts} spaceName={currentSpace} renderMoney={renderMoney} onAddAccount={(acc) => handleAddAccount(currentSpace, acc)} onUpdateBalance={(id, bal) => handleUpdateAccountBalance(currentSpace, id, bal)} />}
      {isSplitModalOpen && <SplitRuleModal onClose={() => setIsSplitModalOpen(false)} ratio={splitRatio} setRatio={setSplitRatio} />}
      {toastMessage && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full text-xs font-bold z-[150] shadow-2xl animate-slide-up flex items-center gap-2"><Sparkles size={14}/> {toastMessage}</div>}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
      `}} />
    </div>
  );
}

function TransactionItem({ tx, accounts, onDelete, isDiscreetMode }) {
  const isIncome = tx.type === 'ingreso';
  const catData = CATEGORIES[tx.type].find(c => c.id === tx.category) || CATEGORIES[tx.type][0];
  const Icon = catData.icon;
  const user = USERS[tx.addedBy];
  return (
    <div className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:border-zinc-200 transition-all">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className={`p-3 rounded-2xl ${catData.bg} ${catData.color} flex-shrink-0`}><Icon size={20} strokeWidth={2.5}/></div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-zinc-800 text-sm truncate">{tx.category}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {tx.space === 'pareja' && <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded-md text-zinc-600 font-bold">{user.avatar} {user.name}</span>}
            <span className="text-xs text-zinc-400 truncate font-medium">{tx.desc}</span>
          </div>
        </div>
      </div>
      <div className="text-right ml-2">
        <p className={`font-bold text-base tracking-tight ${isIncome && !isDiscreetMode ? 'text-emerald-500' : 'text-zinc-800'}`}>{isDiscreetMode ? '***' : `${isIncome ? '+' : '-'}${formatMoney(tx.amount)}`}</p>
        <button onClick={() => onDelete(tx.id, tx.space, tx.type, tx.amount, tx.accountId)} className="text-rose-400 bg-rose-50 p-1 rounded mt-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
      </div>
    </div>
  );
}

function AddTransactionModal({ onClose, onSave, initialSpace, accounts }) {
  const [type, setType] = useState('gasto'); const [space, setSpace] = useState(initialSpace); const [amount, setAmount] = useState(''); const [category, setCategory] = useState(CATEGORIES.gasto[0].id); const [desc, setDesc] = useState(''); const availableAccounts = accounts[space]; const [accountId, setAccountId] = useState(availableAccounts[0]?.id || '');
  useEffect(() => { const accs = accounts[space]; if (accs.length > 0) setAccountId(accs[0].id); }, [space, accounts]);
  const handleSubmit = (e) => { e.preventDefault(); if (!amount || Number(amount) <= 0) return; onSave({ type, space, accountId, amount: Number(amount), category, desc: desc || category }); };
  return (
    <div className="absolute inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-[2.5rem] p-6 animate-slide-up shadow-2xl flex flex-col gap-6">
         <div className="flex justify-between items-center"><h3 className="font-extrabold text-xl text-zinc-800">Nuevo Registro</h3><button onClick={onClose} className="p-2 bg-zinc-100 rounded-full"><X size={20}/></button></div>
         <form onSubmit={handleSubmit} className="flex flex-col gap-6">
           <div className="flex bg-zinc-100 p-1 rounded-2xl"><button type="button" onClick={() => setType('gasto')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${type === 'gasto' ? 'bg-white shadow text-rose-500' : 'text-zinc-400'}`}>Gasto</button><button type="button" onClick={() => setType('ingreso')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${type === 'ingreso' ? 'bg-white shadow text-emerald-500' : 'text-zinc-400'}`}>Ingreso</button></div>
           <div className="text-center"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Monto BOB</p><input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full text-center text-5xl font-light outline-none bg-transparent" autoFocus /></div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Espacio</p><select value={space} onChange={(e) => setSpace(e.target.value)} className="w-full bg-zinc-50 p-4 rounded-2xl text-sm font-bold border border-zinc-100 outline-none"><option value="personal">Personal</option><option value="pareja">Pareja</option></select></div>
             <div className="space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Cuenta</p><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full bg-zinc-50 p-4 rounded-2xl text-sm font-bold border border-zinc-100 outline-none">{availableAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
           </div>
           <div className="space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase ml-1">¿En qué gastaste?</p><input type="text" placeholder="Ej. Pañales Lucas, Cena..." value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-zinc-50 p-4 rounded-2xl text-sm font-bold border border-zinc-100 outline-none" /></div>
           <button type="submit" className={`w-full py-5 text-white font-bold rounded-[1.5rem] shadow-xl transition-all active:scale-95 ${type === 'gasto' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>Guardar Registro Familiar</button>
         </form>
      </div>
    </div>
  );
}

const ACCOUNT_STYLES = { 
  cash: { icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-100', label: 'Efectivo' }, 
  bank: { icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Cuenta Bancaria' }, 
  credit: { icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-100', label: 'Tarjeta' }, 
  savings: { icon: PiggyBank, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Ahorro' } 
};

function ManageAccountsModal({ onClose, accounts, spaceName, renderMoney, onAddAccount, onUpdateBalance }) {
  const [view, setView] = useState('list'); const [selectedAcc, setSelectedAcc] = useState(null); const [accName, setAccName] = useState(''); const [accType, setAccType] = useState('cash'); const [accBalance, setAccBalance] = useState('');
  return (
    <div className="absolute inset-0 z-[110] flex flex-col justify-end">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-h-[90%] bg-white rounded-t-[2.5rem] p-6 animate-slide-up flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          {view === 'list' ? (<div><h3 className="font-extrabold text-xl text-zinc-800">Mis Billeteras</h3><p className="text-xs text-zinc-400 capitalize">Control de flujo {spaceName}</p></div>) : (<button onClick={() => setView('list')} className="flex items-center gap-2 font-bold text-zinc-500 hover:text-zinc-800 transition-colors"><ChevronLeft size={20}/> Volver</button>)}
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full text-zinc-500"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-6">
          {view === 'list' && (
            <div className="space-y-3 animate-fade-in">
              {accounts.map(acc => {
                const style = ACCOUNT_STYLES[acc.type] || ACCOUNT_STYLES.cash;
                const Icon = style.icon;
                return (
                  <div key={acc.id} className="flex items-center justify-between p-4 bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm hover:border-zinc-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${style.bg} ${style.color}`}>
                        <Icon size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-800 text-sm">{acc.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{style.label}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className={`font-bold tracking-tight text-sm ${acc.balance < 0 ? 'text-rose-600' : 'text-zinc-800'}`}>
                        {renderMoney(acc.balance)}
                      </p>
                      <button onClick={() => { setSelectedAcc(acc); setAccBalance(acc.balance.toString()); setView('edit'); }} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg mt-1.5 opacity-100 transition-all hover:bg-blue-100">
                        Ajustar
                      </button>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setView('add')} className="w-full flex items-center justify-center gap-2 bg-zinc-50 border-2 border-dashed border-zinc-200 text-zinc-400 font-bold py-5 rounded-[1.5rem] hover:bg-zinc-100 hover:text-zinc-700 transition-all active:scale-95 mt-4">
                <Plus size={20} strokeWidth={2.5} /> Añadir nueva billetera
              </button>
            </div>
          )}
          {view === 'edit' && (
            <div className="space-y-8 animate-fade-in pt-4">
              <div className="text-center">
                <div className={`mx-auto w-fit p-4 rounded-3xl mb-4 ${ACCOUNT_STYLES[selectedAcc?.type]?.bg} ${ACCOUNT_STYLES[selectedAcc?.type]?.color}`}>
                  {React.createElement(ACCOUNT_STYLES[selectedAcc?.type]?.icon || Wallet, { size: 32 })}
                </div>
                <h3 className="text-lg font-bold text-zinc-800">{selectedAcc?.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">Ingresa el saldo real disponible</p>
              </div>
              <div className="text-center py-4"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Saldo Real BOB</p><input type="number" value={accBalance} onChange={(e) => setAccBalance(e.target.value)} className="w-full text-center text-4xl font-light outline-none bg-transparent border-b border-zinc-100 pb-4" autoFocus /></div>
              <button onClick={() => { onUpdateBalance(selectedAcc.id, Number(accBalance)); setView('list'); }} className="w-full bg-zinc-900 text-white font-bold py-5 rounded-[1.5rem] shadow-xl active:scale-95 transition-all">Guardar Ajuste Familiar</button>
            </div>
          )}
          {view === 'add' && (
            <div className="space-y-6 animate-fade-in pt-2">
              <div className="space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Nombre de la billetera</p><input type="text" placeholder="Ej. Mi Ahorro Jorge, Banco..." value={accName} onChange={(e) => setAccName(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold text-zinc-800 focus:border-zinc-300" /></div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase ml-1 mb-2">Tipo</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ACCOUNT_STYLES).map(([k,v]) => (
                    <button key={k} onClick={() => setAccType(k)} className={`flex items-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all ${accType === k ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 text-zinc-400 hover:bg-zinc-50'}`}>
                      {React.createElement(v.icon, { size: 16 })} {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1"><p className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Saldo Inicial</p><input type="number" placeholder="0.00" value={accBalance} onChange={(e) => setAccBalance(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold text-zinc-800 focus:border-zinc-300" /></div>
              <button onClick={() => { if(!accName || accBalance === '') return; onAddAccount({ name: accName, type: accType, balance: Number(accBalance), icon: ACCOUNT_STYLES[accType].icon, color: ACCOUNT_STYLES[accType].color, bg: ACCOUNT_STYLES[accType].bg }); setView('list'); }} className="w-full bg-blue-600 text-white font-bold py-5 rounded-[1.5rem] shadow-xl active:scale-95 transition-all">Crear Billetera Familiar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SplitRuleModal({ onClose, ratio, setRatio }) {
  return (
    <div className="absolute inset-0 z-[120] flex flex-col justify-end">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-[2.5rem] p-8 animate-slide-up shadow-2xl flex flex-col gap-8">
        <div className="flex justify-between items-center"><h3 className="font-extrabold text-xl text-zinc-800">Acuerdo de Aportes</h3><button onClick={onClose} className="p-2 bg-zinc-100 rounded-full text-zinc-500"><X size={20}/></button></div>
        <div className="flex justify-around items-center"><div className="text-center"><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">JORGE</p><p className="text-4xl font-light text-zinc-800">{ratio}%</p></div><div className="w-px h-12 bg-zinc-100"></div><div className="text-center"><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">GICELA</p><p className="text-4xl font-light text-indigo-600">{100-ratio}%</p></div></div>
        <div className="px-2"><input type="range" min="0" max="100" step="5" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} className="w-full accent-zinc-900 h-2 bg-zinc-100 rounded-full appearance-none cursor-pointer" /></div>
        <button onClick={onClose} className="w-full bg-zinc-900 text-white font-bold py-5 rounded-[1.5rem] shadow-xl active:scale-95 transition-all shadow-zinc-900/30">Guardar Acuerdo Familiar</button>
      </div>
    </div>
  );
}