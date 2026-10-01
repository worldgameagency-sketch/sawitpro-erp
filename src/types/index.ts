export type WorkerRole = 'pemanen' | 'sopir' | 'pemupuk' | 'mandor' | 'lainnya';

export interface Farm {
  id: string;
  name: string;
  ownerName: string;
  totalAreaHa: number;
  location?: string;
  plantedYear?: number;
  notes?: string;
  createdAt?: string;
}

export interface FarmBlock {
  id: string;
  farmId: string;
  blockName: string;
  areaHa: number;
  plantedYear?: number;
  treeCount?: number;
  notes?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  phone?: string;
  defaultRatePerKg: number;   // Contoh: Rp 250 / kg untuk pemanen atau Rp 120 / kg untuk sopir
  defaultRatePerDay?: number; // Contoh: Rp 120.000 / hari jika borongan harian
  vehicleNumber?: string;     // Khusus sopir, contoh: "BM 8912 TN"
  isActive: boolean;
  notes?: string;
}

export interface HarvesterEntry {
  workerId: string;
  workerName: string;
  weightKg: number;
  ratePerKg: number;
  totalWage: number; // weightKg * ratePerKg
}

export interface HarvestTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  farmId: string;
  farmName: string;
  blockId?: string;
  blockName?: string;
  
  // Total Timbangan Nota Jual Pabrik / RAM
  totalWeightKg: number;
  pricePerKg: number;
  grossIncome: number; // totalWeightKg * pricePerKg

  // Rincian Pemanen (Mendukung 1 atau banyak pemanen per trip panen)
  harvesters: HarvesterEntry[];
  totalHarvesterWage: number; // Sum of harvesters' wages

  // Transportasi / Angkutan Truk
  driverId?: string;
  driverName?: string;
  vehicleNumber?: string;
  driverRatePerKg?: number;
  transportCost?: number; // totalWeightKg * driverRatePerKg

  buyerRamName?: string; // Pabrik Kelapa Sawit (PKS) atau RAM Timbangan
  receiptNumber?: string; // Nomor nota/SPK timbangan
  notes?: string;
  createdAt?: string;
}

export interface FertilizationRecord {
  id: string;
  date: string;
  farmId: string;
  farmName: string;
  blockId?: string;
  blockName?: string;
  fertilizerName: string; // misal: "Urea", "NPK Mahkota 13-8-27", "Dolomit"
  quantity: number;
  unit: string; // "sak", "karung", "kg"
  pricePerUnit: number;
  materialCost: number; // quantity * pricePerUnit
  
  workerId?: string;
  workerName?: string;
  laborCost: number; // Biaya jasa sebar pupuk
  
  totalCost: number; // materialCost + laborCost
  notes?: string;
  createdAt?: string;
}

export type ExpenseCategory = 
  | 'pupuk' 
  | 'jasa_pemupukan' 
  | 'jasa_panen' 
  | 'jasa_angkut' 
  | 'bbm' 
  | 'perawatan_rumput' 
  | 'alat_kerja' 
  | 'konsumsi' 
  | 'lainnya';

export interface ExpenseRecord {
  id: string;
  date: string;
  farmId: string;
  farmName: string;
  blockId?: string;
  blockName?: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  recipientName?: string;
  notes?: string;
  createdAt?: string;
}

export type DateFilterType = 'today' | 'week' | 'month' | 'custom';

export interface DashboardMetrics {
  totalHarvestKg: number;
  grossIncome: number;
  totalExpense: number;
  netIncome: number;
  productivityKgPerHa: number;
  totalWorkDays: number;
  costPerKg: number;
}
