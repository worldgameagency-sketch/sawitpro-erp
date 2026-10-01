import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Users, 
  Truck, 
  TrendingUp, 
  Share2 
} from 'lucide-react';
import { formatRupiah, formatKg, getMonthYearIndo } from '../lib/formatters';
import { Card } from '../components/common/CommonUI';

export const ReportsPage: React.FC = () => {
  const { 
    filteredHarvests, 
    filteredFertilizations, 
    filteredExpenses, 
    metrics, 
    workers,
    selectedFarm,
    dateFilter
  } = useApp();

  const [copied, setCopied] = useState(false);

  // Group by Harvester (Aman dengan optional chaining & fallback)
  const harvesterReport = (workers || [])
    .filter(w => w.role === 'pemanen')
    .map(worker => {
      let totalKg = 0;
      let totalWage = 0;
      let tripCount = 0;

      (filteredHarvests || []).forEach(harvest => {
        const found = (harvest.harvesters || []).find(h => h.workerId === worker.id);
        if (found) {
          totalKg += (found.weightKg || 0);
          totalWage += (found.totalWage || 0);
          tripCount++;
        }
      });

      return {
        worker,
        totalKg,
        totalWage,
        tripCount,
      };
    })
    .filter(item => item.tripCount > 0);

  // Group by Driver
  const driverReport = (workers || [])
    .filter(w => w.role === 'sopir')
    .map(driver => {
      let totalKg = 0;
      let totalCost = 0;
      let tripCount = 0;

      (filteredHarvests || []).forEach(harvest => {
        if (harvest.driverId === driver.id) {
          totalKg += (harvest.totalWeightKg || 0);
          totalCost += (harvest.transportCost || 0);
          tripCount++;
        }
      });

      return {
        driver,
        totalKg,
        totalCost,
        tripCount,
      };
    })
    .filter(item => item.tripCount > 0);

  // Sub-totals for cost breakdown
  const totalHarvesterWages = (filteredHarvests || []).reduce((acc, h) => acc + (h.totalHarvesterWage || 0), 0);
  const totalTransportCosts = (filteredHarvests || []).reduce((acc, h) => acc + (h.transportCost || 0), 0);
  const totalFertilizerCosts = (filteredFertilizations || []).reduce((acc, f) => acc + (f.totalCost || 0), 0);
  const totalOtherExpenses = (filteredExpenses || []).reduce((acc, e) => acc + (e.amount || 0), 0);

  // Generate WhatsApp formatted text
  const generateWaText = () => {
    const periodLabel = dateFilter === 'month' ? getMonthYearIndo() : 'Periode Terpilih';
    const farmName = selectedFarm ? selectedFarm.name : 'Semua Kebun';

    let text = `🌴 *LAPORAN OPERASIONAL SAWIT*\n`;
    text += `Kebun: *${farmName}*\n`;
    text += `Periode: *${periodLabel}*\n`;
    text += `--------------------------------\n`;
    text += `📊 *HASIL PANEN:*\n`;
    text += `• Total Buah: ${formatKg(metrics?.totalHarvestKg || 0)}\n`;
    text += `• Pendapatan Kotor: ${formatRupiah(metrics?.grossIncome || 0)}\n`;
    text += `• Produktivitas: ${metrics?.productivityKgPerHa || 0} kg/ha\n\n`;

    text += `💸 *BIAYA OPERASIONAL:*\n`;
    text += `• Upah Pemanen: ${formatRupiah(totalHarvesterWages)}\n`;
    text += `• Jasa Angkut Truk: ${formatRupiah(totalTransportCosts)}\n`;
    text += `• Biaya Pemupukan: ${formatRupiah(totalFertilizerCosts)}\n`;
    text += `• Operasional Lainnya: ${formatRupiah(totalOtherExpenses)}\n`;
    text += `*TOTAL BIAYA:* ${formatRupiah(metrics?.totalExpense || 0)}\n\n`;

    text += `💰 *SISA HASIL BERSIH:* *${formatRupiah(metrics?.netIncome || 0)}*\n`;
    text += `--------------------------------\n`;

    if (harvesterReport.length > 0) {
      text += `👷 *REKAP UPAH PEMANEN:*\n`;
      harvesterReport.forEach(h => {
        text += `• ${h.worker.name}: ${formatKg(h.totalKg)} = ${formatRupiah(h.totalWage)}\n`;
      });
      text += `\n`;
    }

    if (driverReport.length > 0) {
      text += `🚛 *REKAP ONGKOS ANGKUT:*\n`;
      driverReport.forEach(d => {
        text += `• ${d.driver.name}: ${formatKg(d.totalKg)} = ${formatRupiah(d.totalCost)}\n`;
      });
    }

    text += `\n_Dibuat otomatis via SawitPRO PWA_`;
    return text;
  };

  const handleCopyWa = () => {
    const text = generateWaText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <span>Laporan & Rekapitulasi</span>
          </h2>
          <p className="text-xs text-stone-500">
            Laporan laba rugi kebun dan rekapitulasi upah siap bayar
          </p>
        </div>

        {/* WhatsApp Share Button */}
        <button
          onClick={handleCopyWa}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 touch-target"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Teks Tersalin! Siap Tempel di WA' : 'Salin Laporan ke WhatsApp'}</span>
        </button>
      </div>

      {/* 1. KARTU REKAP LABA BERSIH */}
      <Card className="bg-emerald-950 text-white p-5 border-none shadow-lg">
        <div className="flex items-center justify-between text-xs text-emerald-200">
          <span>Laporan Keuangan Periode Ini</span>
          <span className="bg-emerald-800 px-2 py-0.5 rounded font-semibold text-[11px]">
            {dateFilter === 'month' ? getMonthYearIndo() : 'Periode Aktif'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-emerald-800/80 pb-4">
          <div>
            <span className="text-xs text-emerald-300">Pendapatan Kotor:</span>
            <div className="text-xl font-black text-white mt-0.5">
              {formatRupiah(metrics?.grossIncome || 0)}
            </div>
            <span className="text-[11px] text-emerald-300/80">{formatKg(metrics?.totalHarvestKg || 0)} TBS</span>
          </div>

          <div>
            <span className="text-xs text-rose-300">Total Biaya Operasional:</span>
            <div className="text-xl font-black text-rose-400 mt-0.5">
              - {formatRupiah(metrics?.totalExpense || 0)}
            </div>
            <span className="text-[11px] text-emerald-300/80">Upah, transport, pupuk, BBM</span>
          </div>

          <div>
            <span className="text-xs text-amber-300">Sisa Hasil Bersih Pemilik:</span>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {formatRupiah(metrics?.netIncome || 0)}
            </div>
            <span className="text-[11px] text-emerald-200/80">Laba bersih yang masuk kantong</span>
          </div>
        </div>

        {/* Breakdown Biaya Bar */}
        <div className="mt-4 space-y-2 text-xs">
          <span className="font-bold text-emerald-300 block">Rincian Pengeluaran:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-emerald-900/60 p-2 rounded-lg">
              <span className="text-stone-300 text-[10px] block">Upah Pemanen:</span>
              <span className="font-bold text-white text-xs">{formatRupiah(totalHarvesterWages)}</span>
            </div>
            <div className="bg-emerald-900/60 p-2 rounded-lg">
              <span className="text-stone-300 text-[10px] block">Jasa Angkut Truk:</span>
              <span className="font-bold text-white text-xs">{formatRupiah(totalTransportCosts)}</span>
            </div>
            <div className="bg-emerald-900/60 p-2 rounded-lg">
              <span className="text-stone-300 text-[10px] block">Pupuk & Sebar:</span>
              <span className="font-bold text-white text-xs">{formatRupiah(totalFertilizerCosts)}</span>
            </div>
            <div className="bg-emerald-900/60 p-2 rounded-lg">
              <span className="text-stone-300 text-[10px] block">Biaya Lainnya:</span>
              <span className="font-bold text-white text-xs">{formatRupiah(totalOtherExpenses)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. REKAP UPAH PEMANEN (PAYROLL) */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-700" />
          <span>Rekap Upah Pemanen Siap Bayar</span>
        </h3>

        {harvesterReport.length === 0 ? (
          <Card className="text-center py-6 text-stone-400 text-xs">
            Tidak ada transaksi panen oleh pemanen pada periode ini.
          </Card>
        ) : (
          <div className="space-y-2">
            {harvesterReport.map((item) => (
              <Card key={item.worker.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{item.worker.name}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {item.tripCount} kali panen • Total: <span className="font-bold text-stone-800">{formatKg(item.totalKg)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Total Upah</span>
                  <span className="text-base font-black text-emerald-700">
                    {formatRupiah(item.totalWage)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. REKAP ONGKOS ANGKUT SOPIR */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-emerald-700" />
          <span>Rekap Jasa Angkut Sopir / Armada</span>
        </h3>

        {driverReport.length === 0 ? (
          <Card className="text-center py-6 text-stone-400 text-xs">
            Tidak ada pencatatan jasa angkut sopir pada periode ini.
          </Card>
        ) : (
          <div className="space-y-2">
            {driverReport.map((item) => (
              <Card key={item.driver.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{item.driver.name}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {item.driver.vehicleNumber || 'Truk'} • {item.tripCount} trip • <span className="font-bold text-stone-800">{formatKg(item.totalKg)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Total Biaya Angkut</span>
                  <span className="text-base font-black text-stone-900">
                    {formatRupiah(item.totalCost)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};