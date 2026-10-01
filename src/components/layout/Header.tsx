import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Calendar, 
  Download, 
  WifiOff, 
  Sprout,
  Settings
} from 'lucide-react';
import { getMonthYearIndo } from '../../lib/formatters';

export const Header: React.FC = () => {
  const { 
    farms, 
    selectedFarmId, 
    setSelectedFarmId, 
    dateFilter, 
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    isInstallable,
    triggerInstall,
    isOnline,
    setActiveTab,
    activeTab
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md">
      {/* Top Banner on Offline or Installable */}
      {!isOnline && (
        <div className="bg-amber-600 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 text-white">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Mode Offline (Sinyal Lemah) — Data tetap tersimpan di HP Anda</span>
        </div>
      )}

      {isInstallable && (
        <div className="bg-emerald-700/80 hover:bg-emerald-700 px-4 py-1 text-xs flex items-center justify-between transition-colors border-b border-emerald-600/50">
          <span className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pasang SawitPRO di layar utama HP Anda</span>
          </span>
          <button
            onClick={triggerInstall}
            className="bg-emerald-500 hover:bg-emerald-400 text-stone-900 font-bold px-2.5 py-0.5 rounded text-[11px] shadow"
          >
            Pasang Aplikasi
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-inner border border-emerald-500/40">
            <Sprout className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight leading-none text-white">SawitPRO</h1>
              <span className="bg-emerald-800 text-[10px] text-emerald-300 font-bold px-1.5 py-0.5 rounded">ERP</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-tight">Operasional Kebun</p>
          </div>
        </div>

        {/* Right Controls: Farm Switcher & Settings */}
        <div className="flex items-center gap-2">
          {/* Farm Switcher Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1 bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-100">
              <Building2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
                aria-label="Pilih Kebun"
              >
                <option value="all" className="bg-emerald-900 text-white">Semua Kebun ({farms.length})</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id} className="bg-emerald-900 text-white">
                    {farm.name} ({farm.totalAreaHa} ha)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Kebun / Setting Button */}
          <button
            onClick={() => setActiveTab('kebun')}
            className={`p-2 rounded-lg border transition-colors ${
              activeTab === 'kebun'
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-emerald-800/60 hover:bg-emerald-800 border-emerald-700 text-emerald-200'
            }`}
            title="Kelola Data Kebun & Blok"
            aria-label="Pengaturan Kebun"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date & Period Filter Bar (Only show on Dashboard, Laporan, Panen, Operasional) */}
      {activeTab !== 'kebun' && activeTab !== 'pekerja' && (
        <div className="bg-emerald-950/70 border-t border-emerald-800/60 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* Active Period Label */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white">
                {dateFilter === 'month' && getMonthYearIndo()}
                {dateFilter === 'today' && 'Hari Ini'}
                {dateFilter === 'week' && '7 Hari Terakhir'}
                {dateFilter === 'custom' && 'Rentang Kustom'}
              </span>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-medium no-scrollbar">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  dateFilter === 'today'
                    ? 'bg-emerald-500 text-stone-900 font-bold'
                    : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  dateFilter === 'week'
                    ? 'bg-emerald-500 text-stone-900 font-bold'
                    : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  dateFilter === 'month'
                    ? 'bg-emerald-500 text-stone-900 font-bold'
                    : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                Bulan Ini
              </button>
              <button
                onClick={() => setDateFilter('custom')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  dateFilter === 'custom'
                    ? 'bg-emerald-500 text-stone-900 font-bold'
                    : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                Kustom
              </button>
            </div>
          </div>

          {/* Custom Date Picker Inputs when 'custom' is active */}
          {dateFilter === 'custom' && (
            <div className="max-w-7xl mx-auto pt-2 mt-1 border-t border-emerald-900/60 flex items-center gap-2 text-xs">
              <span className="text-emerald-300 text-[11px]">Dari:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-emerald-900 text-white px-2 py-1 rounded border border-emerald-700 text-xs focus:outline-none"
              />
              <span className="text-emerald-300 text-[11px]">Sampai:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-emerald-900 text-white px-2 py-1 rounded border border-emerald-700 text-xs focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </header>
  );
};
