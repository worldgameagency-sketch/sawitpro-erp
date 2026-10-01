import { Farm, FarmBlock, Worker, HarvestTransaction, FertilizationRecord, ExpenseRecord } from '../types';

export const INITIAL_FARMS: Farm[] = [];

export const INITIAL_BLOCKS: FarmBlock[] = [];

export const INITIAL_WORKERS: Worker[] = [];

export const INITIAL_HARVESTS: HarvestTransaction[] = [];

export const INITIAL_FERTILIZATIONS: FertilizationRecord[] = [];

export const INITIAL_EXPENSES: ExpenseRecord[] = [];

// Local Storage Keys
const STORAGE_PREFIX = 'sawitpro_';

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}