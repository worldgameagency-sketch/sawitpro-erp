import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Farm, 
  FarmBlock, 
  Worker, 
  HarvestTransaction, 
  FertilizationRecord, 
  ExpenseRecord, 
  DateFilterType, 
  DashboardMetrics 
} from '../types';
import { 
  INITIAL_FARMS, 
  INITIAL_BLOCKS, 
  INITIAL_WORKERS, 
  INITIAL_HARVESTS, 
  INITIAL_FERTILIZATIONS, 
  INITIAL_EXPENSES 
} from '../lib/demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export type ActiveTab = 'dashboard' | 'panen' | 'operasional' | 'pekerja' | 'laporan' | 'kebun';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Multi-Kebun Selection
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  selectedFarm: Farm | undefined;
  
  // Date Filters
  dateFilter: DateFilterType;
  setDateFilter: (filter: DateFilterType) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  
  // Master Data
  farms: Farm[];
  blocks: FarmBlock[];
  workers: Worker[];
  
  // Transactions
  harvests: HarvestTransaction[];
  fertilizations: FertilizationRecord[];
  expenses: ExpenseRecord[];
  
  // Filtered Data based on farm & date
  filteredHarvests: HarvestTransaction[];
  filteredFertilizations: FertilizationRecord[];
  filteredExpenses: ExpenseRecord[];
  metrics: DashboardMetrics;

  // Actions
  addHarvest: (item: Omit<HarvestTransaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteHarvest: (id: string) => Promise<void>;
  addWorker: (worker: Omit<Worker, 'id'>) => Promise<void>;
  updateWorker: (worker: Worker) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  addFertilization: (item: Omit<FertilizationRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteFertilization: (id: string) => Promise<void>;
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Farm & Block Actions
  addFarm: (farm: Omit<Farm, 'id' | 'createdAt'>) => Promise<void>;
  updateFarm: (id: string, farm: Partial<Farm>) => Promise<void>;
  deleteFarm: (id: string) => Promise<void>;
  
  addBlock: (block: Omit<FarmBlock, 'id'>) => Promise<void>;
  updateBlock: (id: string, block: Partial<FarmBlock>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  
  // PWA & Status
  isInstallable: boolean;
  triggerInstall: () => void;
  isOnline: boolean;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('month');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [customStartDate, setCustomStartDate] = useState<string>(firstDay);
  const [customEndDate, setCustomEndDate] = useState<string>(lastDay);

  // Data States (Default menggunakan LocalStorage/Demo agar tidak langsung kosong saat di-refresh)
  const [farms, setFarms] = useState<Farm[]>(() => {
    const saved = localStorage.getItem('sawit_farms');
    return saved ? JSON.parse(saved) : INITIAL_FARMS;
  });
  const [blocks, setBlocks] = useState<FarmBlock[]>(() => {
    const saved = localStorage.getItem('sawit_blocks');
    return saved ? JSON.parse(saved) : INITIAL_BLOCKS;
  });
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('sawit_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });
  const [harvests, setHarvests] = useState<HarvestTransaction[]>(() => {
    const saved = localStorage.getItem('sawit_harvests');
    return saved ? JSON.parse(saved) : INITIAL_HARVESTS;
  });
  const [fertilizations, setFertilizations] = useState<FertilizationRecord[]>(() => {
    const saved = localStorage.getItem('sawit_fertilizations');
    return saved ? JSON.parse(saved) : INITIAL_FERTILIZATIONS;
  });
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('sawit_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Simpan otomatis ke localStorage sebagai backup offline
  useEffect(() => { localStorage.setItem('sawit_farms', JSON.stringify(farms)); }, [farms]);
  useEffect(() => { localStorage.setItem('sawit_blocks', JSON.stringify(blocks)); }, [blocks]);
  useEffect(() => { localStorage.setItem('sawit_workers', JSON.stringify(workers)); }, [workers]);
  useEffect(() => { localStorage.setItem('sawit_harvests', JSON.stringify(harvests)); }, [harvests]);
  useEffect(() => { localStorage.setItem('sawit_fertilizations', JSON.stringify(fertilizations)); }, [fertilizations]);
  useEffect(() => { localStorage.setItem('sawit_expenses', JSON.stringify(expenses)); }, [expenses]);

  // Fetch Data from Supabase on mount with mapping
  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      setIsSyncing(true);
      try {
        const [
          { data: farmsData },
          { data: blocksData },
          { data: workersData },
          { data: harvestsData },
          { data: fertsData },
          { data: expensesData }
        ] = await Promise.all([
          supabase.from('farms').select('*'),
          supabase.from('farm_blocks').select('*'),
          supabase.from('workers').select('*'),
          supabase.from('harvest_transactions').select('*'),
          supabase.from('fertilization_records').select('*'),
          supabase.from('expenses').select('*'),
        ]);

        if (farmsData && farmsData.length > 0) setFarms(farmsData);
        if (blocksData && blocksData.length > 0) setBlocks(blocksData);
        if (workersData && workersData.length > 0) setWorkers(workersData);
        
        // Mapped Harvest Transactions from Supabase snake_case to camelCase
        if (harvestsData && harvestsData.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedHarvests = harvestsData.map((h: any) => ({
            id: h.id,
            farmId: h.farm_id,
            blockId: h.block_id,
            date: h.harvest_date,
            totalWeightKg: h.total_weight_kg,
            pricePerKg: h.price_per_kg,
            grossIncome: h.gross_income,
            driverId: h.driver_id,
            driverRatePerKg: h.driver_rate_per_kg,
            totalHarvesterWage: h.total_harvester_wage,
            transportCost: h.transport_cost,
            buyerRamName: h.buyer_ram_name,
            receiptNumber: h.receipt_number,
            harvesters: h.harvesters || [],
            createdAt: h.created_at,
          }));
          setHarvests(mappedHarvests);
        }

        if (fertsData && fertsData.length > 0) setFertilizations(fertsData);
        if (expensesData && expensesData.length > 0) setExpenses(expensesData);
      } catch (err) {
        console.error('Gagal mengambil data dari Supabase, menggunakan data lokal:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchData();
  }, []);

  // Online status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install prompt handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  const selectedFarm = useMemo(() => {
    return farms.find(f => f.id === selectedFarmId);
  }, [farms, selectedFarmId]);

  const isDateInRange = (dateStr: string) => {
    if (!dateStr) return false;
    const now = new Date();
    const target = new Date(dateStr);

    if (dateFilter === 'today') {
      return target.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return target >= oneWeekAgo && target <= now;
    }
    if (dateFilter === 'month') {
      return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : new Date(0);
      const end = customEndDate ? new Date(customEndDate) : new Date(8640000000000000);
      end.setHours(23, 59, 59, 999);
      return target >= start && target <= end;
    }
    return true;
  };

  const filteredHarvests = useMemo(() => {
    return harvests.filter(h => {
      const matchFarm = selectedFarmId === 'all' || h.farmId === selectedFarmId;
      const matchDate = isDateInRange(h.date);
      return matchFarm && matchDate;
    });
  }, [harvests, selectedFarmId, dateFilter, customStartDate, customEndDate]);

  const filteredFertilizations = useMemo(() => {
    return fertilizations.filter(f => {
      const matchFarm = selectedFarmId === 'all' || f.farmId === selectedFarmId;
      const matchDate = isDateInRange(f.date);
      return matchFarm && matchDate;
    });
  }, [fertilizations, selectedFarmId, dateFilter, customStartDate, customEndDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchFarm = selectedFarmId === 'all' || e.farmId === selectedFarmId;
      const matchDate = isDateInRange(e.date);
      return matchFarm && matchDate;
    });
  }, [expenses, selectedFarmId, dateFilter, customStartDate, customEndDate]);

  const metrics = useMemo<DashboardMetrics>(() => {
    const totalHarvestKg = filteredHarvests.reduce((acc, h) => acc + (Number(h.totalWeightKg) || 0), 0);
    const grossIncome = filteredHarvests.reduce((acc, h) => acc + (Number(h.grossIncome) || 0), 0);

    const harvesterWages = filteredHarvests.reduce((acc, h) => acc + (Number(h.totalHarvesterWage) || 0), 0);
    const transportCosts = filteredHarvests.reduce((acc, h) => acc + (Number(h.transportCost) || 0), 0);
    const fertilizationCosts = filteredFertilizations.reduce((acc, f) => acc + (Number(f.totalCost) || 0), 0);
    const otherCosts = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const totalExpense = harvesterWages + transportCosts + fertilizationCosts + otherCosts;
    const netIncome = grossIncome - totalExpense;

    let totalArea = 0;
    if (selectedFarmId === 'all') {
      totalArea = farms.reduce((acc, f) => acc + (Number(f.totalAreaHa) || 0), 0);
    } else {
      totalArea = selectedFarm?.totalAreaHa || 0;
    }

    const productivityKgPerHa = totalArea > 0 ? Math.round(totalHarvestKg / totalArea) : 0;

    const uniqueWorkDays = new Set([
      ...filteredHarvests.map(h => h.date),
      ...filteredFertilizations.map(f => f.date),
      ...filteredExpenses.map(e => e.date)
    ]).size;

    const costPerKg = totalHarvestKg > 0 ? Math.round(totalExpense / totalHarvestKg) : 0;

    return {
      totalHarvestKg,
      grossIncome,
      totalExpense,
      netIncome,
      productivityKgPerHa,
      totalWorkDays: uniqueWorkDays,
      costPerKg,
    };
  }, [filteredHarvests, filteredFertilizations, filteredExpenses, farms, selectedFarmId, selectedFarm]);

  // --- MUTATORS ---

  const addHarvest = async (item: Omit<HarvestTransaction, 'id' | 'createdAt'>) => {
    const newEntry: HarvestTransaction = {
      ...item,
      id: 'harvest-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    
    // Update state lokal terlebih dahulu agar UI langsung responsif
    setHarvests(prev => [newEntry, ...prev]);
    
    if (isSupabaseConfigured && supabase) {
      const payload = {
        farm_id: item.farmId || null,
        block_id: item.blockId || null,
        harvest_date: item.date || null,
        total_weight_kg: Number(item.totalWeightKg) || 0,
        price_per_kg: Number(item.pricePerKg) || 0,
        gross_income: Number(item.grossIncome) || 0,
        driver_id: item.driverId || null,
        driver_rate_per_kg: Number(item.driverRatePerKg) || 0,
        total_harvester_wage: Number(item.totalHarvesterWage) || 0,
        transport_cost: Number(item.transportCost) || 0,
        buyer_ram_name: item.buyerRamName || null,
        receipt_number: item.receiptNumber || null,
        harvesters: item.harvesters || [],
      };

      try {
        const { error } = await supabase.from('harvest_transactions').insert([payload]);
        if (error) {
          console.error('Gagal menyimpan transaksi panen ke Supabase:', error.message);
        } else {
          console.log('Berhasil menyimpan transaksi panen ke Supabase');
        }
      } catch (err) {
        console.error('Terjadi kesalahan saat koneksi ke Supabase:', err);
      }
    }
  };

  const deleteHarvest = async (id: string) => {
    setHarvests(prev => prev.filter(h => h.id !== id));
    if (supabase) {
      await supabase.from('harvest_transactions').delete().eq('id', id);
    }
  };

  const addWorker = async (worker: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...worker,
      id: 'worker-' + Date.now(),
    };
    setWorkers(prev => [newWorker, ...prev]);
    if (supabase) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id, ...workerData } = worker as any;
      await supabase.from('workers').insert([workerData]);
    }
  };

  const updateWorker = async (updated: Worker) => {
    setWorkers(prev => prev.map(w => w.id === updated.id ? updated : w));
    if (supabase) {
      await supabase.from('workers').update(updated).eq('id', updated.id);
    }
  };

  const deleteWorker = async (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    if (supabase) {
      await supabase.from('workers').delete().eq('id', id);
    }
  };

  const addFertilization = async (item: Omit<FertilizationRecord, 'id' | 'createdAt'>) => {
    const newRecord: FertilizationRecord = {
      ...item,
      id: 'fert-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFertilizations(prev => [newRecord, ...prev]);
    if (supabase) {
      await supabase.from('fertilization_records').insert([newRecord]);
    }
  };

  const deleteFertilization = async (id: string) => {
    setFertilizations(prev => prev.filter(f => f.id !== id));
    if (supabase) {
      await supabase.from('fertilization_records').delete().eq('id', id);
    }
  };

  const addExpense = async (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    const newExpense: ExpenseRecord = {
      ...expense,
      id: 'exp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    if (supabase) {
      await supabase.from('expenses').insert([newExpense]);
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (supabase) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  };

  const addFarm = async (farm: Omit<Farm, 'id' | 'createdAt'>) => {
    const newFarm: Farm = {
      ...farm,
      id: 'farm-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFarms(prev => [...prev, newFarm]);
    if (supabase) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id, ...farmData } = farm as any;
      await supabase.from('farms').insert([farmData]);
    }
  };

  const updateFarm = async (id: string, updatedFields: Partial<Farm>) => {
    setFarms(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
    if (supabase) {
      await supabase.from('farms').update(updatedFields).eq('id', id);
    }
  };

  const deleteFarm = async (id: string) => {
    setFarms(prev => prev.filter(f => f.id !== id));
    setBlocks(prev => prev.filter(b => b.farmId !== id));
    if (selectedFarmId === id) {
      setSelectedFarmId('all');
    }
    if (supabase) {
      await supabase.from('farms').delete().eq('id', id);
    }
  };

  const addBlock = async (block: Omit<FarmBlock, 'id'>) => {
    const newBlock: FarmBlock = {
      ...block,
      id: 'block-' + Date.now(),
    };
    setBlocks(prev => [...prev, newBlock]);
    if (supabase) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id, ...blockData } = block as any;
      await supabase.from('farm_blocks').insert([blockData]);
    }
  };

  const updateBlock = async (id: string, updatedFields: Partial<FarmBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    if (supabase) {
      await supabase.from('farm_blocks').update(updatedFields).eq('id', id);
    }
  };

  const deleteBlock = async (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (supabase) {
      await supabase.from('farm_blocks').delete().eq('id', id);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedFarmId,
        setSelectedFarmId,
        selectedFarm,
        dateFilter,
        setDateFilter,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        farms,
        blocks,
        workers,
        harvests,
        fertilizations,
        expenses,
        filteredHarvests,
        filteredFertilizations,
        filteredExpenses,
        metrics,
        addHarvest,
        deleteHarvest,
        addWorker,
        updateWorker,
        deleteWorker,
        addFertilization,
        deleteFertilization,
        addExpense,
        deleteExpense,
        addFarm,
        updateFarm,
        deleteFarm,
        addBlock,
        updateBlock,
        deleteBlock,
        isInstallable,
        triggerInstall,
        isOnline,
        isSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};