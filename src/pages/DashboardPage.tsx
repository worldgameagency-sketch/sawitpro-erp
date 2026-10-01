import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Tractor, 
  CalendarDays, 
  Coins, 
  Plus, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatRupiah, formatKg } from '../lib/formatters';
import { Card } from '../components/common/CommonUI';

export const DashboardPage: React.FC = () => {
  const { metrics, filteredHarvests, setActiveTab, selectedFarm } = useApp();

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Banner / Welcome Info */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded-full font-medium text-emerald-200">
              {selectedFarm ? selectedFarm.name : 'Semua Kebun Aktif'}
            </span>
            <span className="text-xs text-emerald-300">
              {selectedFarm ? `Luas ${selectedFarm.totalAreaHa} ha` : ''}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">Ringkasan Operasional</h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
            Hasil panen TBS, pengeluaran upah & sisa laba bersih terkini.
          </p>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => setActiveTab('panen')}
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-900 font-extrabold px-4 py-2.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Panen Baru</span>
        </button>
      </div>

      {/* 4 Kartu Utama: Total Panen, Pendapatan Kotor, Total Biaya, Hasil Setelah Biaya */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Panen */}
        <Card className="border-l-4 border-l-emerald-600 bg-white">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Panen</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-stone-900 mt-2 truncate">
            {formatKg(metrics?.totalHarvestKg || 0)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Timbangan bersih TBS</p>
        </Card>

        {/* Pendapatan Kotor */}
        <Card className="border-l-4 border-l-blue-600 bg-white">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Pendapatan Kotor</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-stone-900 mt-2 truncate">
            {formatRupiah(metrics?.grossIncome || 0)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Total penjualan buah</p>
        </Card>

        {/* Total Biaya */}
        <Card className="border-l-4 border-l-rose-500 bg-white">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Biaya</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-rose-600 mt-2 truncate">
            {formatRupiah(metrics?.totalExpense || 0)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Upah, pupuk, transport, BBM</p>
        </Card>

        {/* Hasil Setelah Biaya (Sisa Bersih) */}
        <Card className="border-l-4 border-l-amber-500 bg-emerald-950 text-white">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
            <span>Sisa Hasil Bersih</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-400 mt-2 truncate">
            {formatRupiah(metrics?.netIncome || 0)}
          </div>
          <p className="text-[11px] text-emerald-200/80 mt-1">Keuntungan pemilik kebun</p>
        </Card>
      </div>

      {/* Baris Metrik Produktivitas Lapangan */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Produktivitas kg/ha */}
        <Card className="bg-stone-50/80 text-center py-3">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-stone-500">
            <Tractor className="w-3.5 h-3.5 text-emerald-600" />
            <span>Produktivitas</span>
          </div>
          <div className="text-base sm:text-xl font-black text-stone-900 mt-1">
            {(metrics?.productivityKgPerHa || 0).toLocaleString('id-ID')} <span className="text-xs font-semibold text-stone-500">kg/ha</span>
          </div>
        </Card>

        {/* Hari Kerja */}
        <Card className="bg-stone-50/80 text-center py-3">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-stone-500">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <span>Hari Kerja</span>
          </div>
          <div className="text-base sm:text-xl font-black text-stone-900 mt-1">
            {metrics?.totalWorkDays || 0} <span className="text-xs font-semibold text-stone-500">hari</span>
          </div>
        </Card>

        {/* Biaya per Kg */}
        <Card className="bg-stone-50/80 text-center py-3">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-stone-500">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>Biaya / Kg</span>
          </div>
          <div className="text-base sm:text-xl font-black text-stone-900 mt-1">
            {formatRupiah(metrics?.costPerKg || 0)} <span className="text-xs font-semibold text-stone-500">/kg</span>
          </div>
        </Card>
      </div>

      {/* Riwayat Panen Terakhir (Mobile friendly cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Aktivitas Panen Terakhir</span>
          </h3>
          <button
            onClick={() => setActiveTab('panen')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!filteredHarvests || filteredHarvests.length === 0) ? (
          <Card className="text-center py-8 text-stone-400">
            <Scale className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold text-stone-600">Belum ada data panen pada periode ini.</p>
            <p className="text-xs text-stone-400 mt-1">Tekan tombol "Catat Panen Baru" untuk mulai memasukkan hasil kebun.</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {(filteredHarvests || []).slice(0, 3).map((item) => (
              <Card key={item.id} className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{item.farmName}</span>
                      {item.blockName && (
                        <span className="text-[11px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                          {item.blockName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.date} • {item.buyerRamName || 'Timbangan RAM'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm sm:text-base text-emerald-700">
                      {formatKg(item.totalWeightKg)}
                    </span>
                    <p className="text-[11px] text-stone-500">
                      @ {formatRupiah(item.pricePerKg)}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="text-stone-600">
                    <span className="font-semibold text-stone-800">
                      {(item.harvesters || []).map(h => h.workerName).join(', ')}
                    </span>
                    {item.driverName && <span className="text-stone-500"> • Sopir: {item.driverName}</span>}
                  </div>
                  <div className="font-bold text-stone-900">
                    {formatRupiah(item.grossIncome)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};