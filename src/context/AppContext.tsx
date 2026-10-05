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
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [customStartDate, setCustomStartDate] = useState<string>(firstDay);
  const [customEndDate, setCustomEndDate] = useState<string>(lastDay);

  // Data States
  const [farms, setFarms] = useState<Farm[]>([]);
  const [blocks, setBlocks] = useState<FarmBlock[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [harvests, setHarvests] = useState<HarvestTransaction[]>([]);
  const [fertilizations, setFertilizations] = useState<FertilizationRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  // Get Current User Auth Session on Mount
  useEffect(() => {
    const checkUser = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    };
    checkUser();
  }, []);

  // Fetch Data from Supabase based on user authentication
  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      setIsSyncing(true);
      try {
        // Ambil data berdasarkan RLS (Row Level Security) Supabase secara otomatis
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

        if (farmsData) {
          const mappedFarms = farmsData.map((f: any) => ({
            id: f.id,
            name: f.name,
            location: f.location,
            totalAreaHa: f.total_area_ha,
            ownerName: f.owner_name,
            plantedYear: f.planted_year,
            notes: f.notes,
            createdAt: f.created_at,
          }));
          setFarms(mappedFarms);
        }

        if (blocksData) {
          const mappedBlocks = blocksData.map((b: any) => ({
            id: b.id,
            farmId: b.farm_id,
            name: b.name,
            areaHa: b.area_ha,
            palmCount: b.palm_count,
          }));
          setBlocks(mappedBlocks);
        }

        if (workersData) {
          const mappedWorkers = workersData.map((w: any) => ({
            id: w.id,
            name: w.name,
            role: w.role,
            phone: w.phone,
            dailyWage: Number(w.daily_wage) || 0,
            isActive: w.is_active ?? true,
          }));
          setWorkers(mappedWorkers);
        }

        if (harvestsData) {
          const mappedHarvests = harvestsData.map((h: any) => ({
            id: h.id,
            farmId: h.farm_id,
            blockId: h.farm_block_id,
            date: h.date,
            totalWeightKg: h.yield_amount,
            pricePerKg: h.price_per_kg,
            grossIncome: h.gross_income,
            driverId: h.driver_id,
            driverRatePerKg: h.driver_rate_per_kg,
            totalHarvesterWage: h.total_harvester_wage,
            transportCost: h.transport_cost,
            buyerRamName: h.mill_name,
            receiptNumber: h.receipt_number,
            harvesters: h.harvesters || [],
            createdAt: h.created_at,
          }));
          setHarvests(mappedHarvests);
        }

        if (fertsData) {
          const mappedFerts = fertsData.map((f: any) => {
            const qty = Number(f.quantity) || 0;
            const uPrice = Number(f.unit_price || f.price_per_unit || 0);
            const mCost = Number(f.material_cost || (qty * uPrice) || 0);
            const lCost = Number(f.labor_cost || 0);
            const tCost = Number(f.total_cost || (mCost + lCost) || 0);

            return {
              id: f.id,
              farmId: f.farm_id,
              blockId: f.block_id,
              date: f.date,
              fertilizerType: f.fertilizer_type || f.fertilizer_name,
              quantity: qty,
              unit: f.unit || 'sak (50kg)',
              unitPrice: uPrice,
              materialCost: mCost,
              workerName: f.worker_name,
              laborCost: lCost,
              totalCost: tCost,
              notes: f.notes,
              createdAt: f.created_at,
            };
          });
          setFertilizations(mappedFerts);
        }

        if (expensesData) {
          const mappedExpenses = expensesData.map((e: any) => ({
            id: e.id,
            farmId: e.farm_id,
            date: e.date,
            category: e.category,
            amount: e.amount,
            description: e.description,
            recipient: e.recipient,
            createdAt: e.created_at,
          }));
          setExpenses(mappedExpenses);
        }
      } catch (err) {
        console.error('Gagal mengambil data saking Supabase:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchData();
  }, [currentUserId]);

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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
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

  // --- MUTATORS (Kanthi user_id otomatis saking Auth) ---

  const addHarvest = async (item: Omit<HarvestTransaction, 'id' | 'createdAt'>) => {
    const newId = 'harvest-' + Date.now();
    const newCreatedAt = new Date().toISOString();
    const newEntry: HarvestTransaction = { ...item, id: newId, createdAt: newCreatedAt };
    
    setHarvests(prev => [newEntry, ...prev]);
    
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        id: newId,
        user_id: user?.id || null,
        farm_id: item.farmId || null,
        farm_block_id: item.blockId || null,
        date: item.date || null,
        yield_amount: Number(item.totalWeightKg) || 0,
        price_per_kg: Number(item.pricePerKg) || 0,
        gross_income: Number(item.grossIncome) || 0,
        driver_id: item.driverId || null,
        driver_rate_per_kg: Number(item.driverRatePerKg) || 0,
        total_harvester_wage: Number(item.totalHarvesterWage) || 0,
        transport_cost: Number(item.transportCost) || 0,
        mill_name: item.buyerRamName || null,
        receipt_number: item.receiptNumber || null,
        harvesters: item.harvesters || [],
      };
      await supabase.from('harvest_transactions').insert([payload]);
    }
  };

  const deleteHarvest = async (id: string) => {
    setHarvests(prev => prev.filter(h => h.id !== id));
    if (supabase) {
      await supabase.from('harvest_transactions').delete().eq('id', id);
    }
  };

  const addWorker = async (worker: Omit<Worker, 'id'>) => {
    const newId = 'worker-' + Date.now();
    const newWorker: Worker = { ...worker, id: newId };
    setWorkers(prev => [newWorker, ...prev]);
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        id: newId,
        user_id: user?.id || null,
        name: worker.name,
        role: worker.role || null,
        phone: worker.phone || null,
        daily_wage: Number(worker.dailyWage) || 0,
        is_active: worker.isActive ?? true,
      };
      await supabase.from('workers').insert([payload]);
    }
  };

  const updateWorker = async (updated: Worker) => {
    setWorkers(prev => prev.map(w => w.id === updated.id ? updated : w));
    if (supabase) {
      const payload = {
        name: updated.name,
        role: updated.role,
        phone: updated.phone,
        daily_wage: Number(updated.dailyWage) || 0,
        is_active: updated.isActive ?? true,
      };
      await supabase.from('workers').update(payload).eq('id', updated.id);
    }
  };

  const deleteWorker = async (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    if (supabase) {
      await supabase.from('workers').delete().eq('id', id);
    }
  };

  const addFertilization = async (item: Omit<FertilizationRecord, 'id' | 'createdAt'>) => {
    const newId = 'fert-' + Date.now();
    const newCreatedAt = new Date().toISOString();
    const newRecord: FertilizationRecord = { ...item, id: newId, createdAt: newCreatedAt };
    setFertilizations(prev => [newRecord, ...prev]);
    
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const numQty = Number(item.quantity) || 0;
      const numPrice = Number(item.unitPrice) || 0;
      const matCost = Number(item.materialCost) || (numQty * numPrice);
      const labCost = Number(item.laborCost) || 0;
      const totCost = Number(item.totalCost) || (matCost + labCost);

      const payload = {
        id: newId,
        user_id: user?.id || null,
        farm_id: item.farmId || null,
        block_id: item.blockId || null,
        date: item.date || null,
        fertilizer_type: item.fertilizerType || null,
        quantity: numQty,
        unit: item.unit || 'sak (50kg)',
        unit_price: numPrice,
        material_cost: matCost,
        worker_name: item.workerName || null,
        labor_cost: labCost,
        total_cost: totCost,
        notes: item.notes || null,
      };
      await supabase.from('fertilization_records').insert([payload]);
    }
  };

  const deleteFertilization = async (id: string) => {
    setFertilizations(prev => prev.filter(f => f.id !== id));
    if (supabase) {
      await supabase.from('fertilization_records').delete().eq('id', id);
    }
  };

  const addExpense = async (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    const newId = 'exp-' + Date.now();
    const newCreatedAt = new Date().toISOString();
    const newExpense: ExpenseRecord = { ...expense, id: newId, createdAt: newCreatedAt };
    setExpenses(prev => [newExpense, ...prev]);
    
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        id: newId,
        user_id: user?.id || null,
        farm_id: expense.farmId || null,
        date: expense.date || null,
        category: expense.category || null,
        amount: Number(expense.amount) || 0,
        description: expense.description || null,
        recipient: expense.recipient || null,
      };
      await supabase.from('expenses').insert([payload]);
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (supabase) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  };

  const addFarm = async (farm: Omit<Farm, 'id' | 'createdAt'>) => {
    const newId = 'farm-' + Date.now();
    const newCreatedAt = new Date().toISOString();
    const newFarm: Farm = { ...farm, id: newId, createdAt: newCreatedAt };
    setFarms(prev => [...prev, newFarm]);
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        id: newId,
        user_id: user?.id || null,
        name: farm.name,
        location: farm.location || null,
        total_area_ha: Number(farm.totalAreaHa) || 0,
        owner_name: farm.ownerName || null,
        planted_year: farm.plantedYear ? Number(farm.plantedYear) : null,
        notes: farm.notes || null,
      };
      await supabase.from('farms').insert([payload]);
    }
  };

  const updateFarm = async (id: string, updatedFields: Partial<Farm>) => {
    setFarms(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
    if (supabase) {
      const payload: any = {};
      if (updatedFields.name !== undefined) payload.name = updatedFields.name;
      if (updatedFields.location !== undefined) payload.location = updatedFields.location;
      if (updatedFields.totalAreaHa !== undefined) payload.total_area_ha = Number(updatedFields.totalAreaHa);
      if (updatedFields.ownerName !== undefined) payload.owner_name = updatedFields.ownerName;
      if (updatedFields.plantedYear !== undefined) payload.planted_year = updatedFields.plantedYear ? Number(updatedFields.plantedYear) : null;
      if (updatedFields.notes !== undefined) payload.notes = updatedFields.notes;
      
      await supabase.from('farms').update(payload).eq('id', id);
    }
  };

  const deleteFarm = async (id: string) => {
    setFarms(prev => prev.filter(f => f.id !== id));
    setBlocks(prev => prev.filter(b => b.farmId !== id));
    if (selectedFarmId === id) setSelectedFarmId('all');
    if (supabase) {
      await supabase.from('farms').delete().eq('id', id);
    }
  };

  const addBlock = async (block: Omit<FarmBlock, 'id'>) => {
    const newId = 'block-' + Date.now();
    const newBlock: FarmBlock = { ...block, id: newId };
    setBlocks(prev => [...prev, newBlock]);
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        id: newId,
        user_id: user?.id || null,
        farm_id: block.farmId || null,
        name: block.name,
        area_ha: Number(block.areaHa) || 0,
        palm_count: Number(block.palmCount) || 0,
      };
      await supabase.from('farm_blocks').insert([payload]);
    }
  };

  const updateBlock = async (id: string, updatedFields: Partial<FarmBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    if (supabase) {
      const payload: any = {};
      if (updatedFields.farmId !== undefined) payload.farm_id = updatedFields.farmId;
      if (updatedFields.name !== undefined) payload.name = updatedFields.name;
      if (updatedFields.areaHa !== undefined) payload.area_ha = Number(updatedFields.areaHa);
      if (updatedFields.palmCount !== undefined) payload.palm_count = Number(updatedFields.palmCount);

      await supabase.from('farm_blocks').update(payload).eq('id', id);
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