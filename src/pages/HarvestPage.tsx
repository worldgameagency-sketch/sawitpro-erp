import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Scale, 
  Plus, 
  Trash2, 
  Calendar, 
  UserCheck, 
  Truck, 
  Receipt,
  FileCheck2
} from 'lucide-react';
import { formatRupiah, formatKg, formatDateIndo } from '../lib/formatters';
import { Card, Modal, ConfirmDialog } from '../components/common/CommonUI';
import { HarvesterEntry } from '../types';

export const HarvestPage: React.FC = () => {
  const { 
    filteredHarvests, 
    farms, 
    blocks, 
    workers, 
    addHarvest, 
    deleteHarvest,
    selectedFarmId
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State dengan aman (fallback array)
  const safeFarms = farms || [];
  const safeBlocks = blocks || [];
  const safeWorkers = workers || [];
  const safeHarvests = filteredHarvests || [];

  const defaultFarmId = selectedFarmId !== 'all' ? selectedFarmId : (safeFarms[0]?.id || '');
  const [farmId, setFarmId] = useState<string>(defaultFarmId);
  const [blockId, setBlockId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [totalWeightKg, setTotalWeightKg] = useState<string>('');
  const [pricePerKg, setPricePerKg] = useState<string>('3000');
  
  // Pemanen state
  const availableHarvesters = safeWorkers.filter(w => w.role === 'pemanen' && w.isActive);
  const [selectedHarvesterIds, setSelectedHarvesterIds] = useState<string[]>(
    availableHarvesters[0] ? [availableHarvesters[0].id] : []
  );
  // Manual weight per harvester if multiple
  const [harvesterWeights, setHarvesterWeights] = useState<Record<string, string>>({});

  // Sopir State
  const availableDrivers = safeWorkers.filter(w => w.role === 'sopir' && w.isActive);
  const [driverId, setDriverId] = useState<string>(availableDrivers[0]?.id || '');
  
  const [buyerRamName, setBuyerRamName] = useState<string>('RAM Sawit Makmur');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Filter blocks based on selected farm
  const currentFarmBlocks = safeBlocks.filter(b => b.farmId === farmId);

  // Calculations
  const numWeight = parseFloat(totalWeightKg) || 0;
  const numPrice = parseFloat(pricePerKg) || 0;
  const grossIncome = numWeight * numPrice;

  // Selected driver details
  const selectedDriver = safeWorkers.find(w => w.id === driverId);
  const driverRate = selectedDriver?.defaultRatePerKg || 0;
  const transportCost = numWeight * driverRate;

  // Harvesters calculation
  const computedHarvesters: HarvesterEntry[] = selectedHarvesterIds.map(hId => {
    const worker = safeWorkers.find(w => w.id === hId);
    const rate = worker?.defaultRatePerKg || 250;
    
    let weight = 0;
    if (selectedHarvesterIds.length === 1) {
      weight = numWeight;
    } else {
      weight = parseFloat(harvesterWeights[hId]) || 0;
    }

    return {
      workerId: hId,
      workerName: worker?.name || 'Pemanen',
      weightKg: weight,
      ratePerKg: rate,
      totalWage: weight * rate,
    };
  });

  const totalHarvesterWage = computedHarvesters.reduce((acc, h) => acc + h.totalWage, 0);
  const totalAllocatedWeight = computedHarvesters.reduce((acc, h) => acc + h.weightKg, 0);

  // Toggle harvester selection
  const handleToggleHarvester = (id: string) => {
    if (selectedHarvesterIds.includes(id)) {
      if (selectedHarvesterIds.length > 1) {
        setSelectedHarvesterIds(selectedHarvesterIds.filter(item => item !== id));
      }
    } else {
      setSelectedHarvesterIds([...selectedHarvesterIds, id]);
    }
  };

  const handleOpenModal = () => {
    setFarmId(selectedFarmId !== 'all' ? selectedFarmId : (safeFarms[0]?.id || ''));
    setTotalWeightKg('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (numWeight <= 0) {
      setFormError('Total berat timbangan harus lebih besar dari 0 kg');
      return;
    }
    if (numPrice <= 0) {
      setFormError('Harga jual TBS per kg harus lebih besar dari 0');
      return;
    }
    if (selectedHarvesterIds.length === 0) {
      setFormError('Pilih minimal 1 orang pemanen');
      return;
    }

    if (selectedHarvesterIds.length > 1 && Math.abs(totalAllocatedWeight - numWeight) > 0.1) {
      setFormError(`Pembagian berat pemanen (${formatKg(totalAllocatedWeight)}) belum sama dengan total timbangan (${formatKg(numWeight)})`);
      return;
    }

    const currentFarm = safeFarms.find(f => f.id === farmId);
    const currentBlock = safeBlocks.find(b => b.id === blockId);

    addHarvest({
      date,
      farmId,
      farmName: currentFarm?.name || 'Kebun Sawit',
      blockId: blockId || undefined,
      blockName: currentBlock?.blockName || undefined,
      totalWeightKg: numWeight,
      pricePerKg: numPrice,
      grossIncome,
      harvesters: computedHarvesters,
      totalHarvesterWage,
      driverId: selectedDriver?.id,
      driverName: selectedDriver?.name,
      vehicleNumber: selectedDriver?.vehicleNumber,
      driverRatePerKg: driverRate,
      transportCost,
      buyerRamName: buyerRamName.trim() || undefined,
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-700" />
            <span>Pencatatan Panen</span>
          </h2>
          <p className="text-xs text-stone-500">
            Catat hasil timbangan TBS, upah pemanen, dan ongkos angkut
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md flex items-center gap-1.5 touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Panen</span>
        </button>
      </div>

      {/* List Transaksi Panen */}
      {safeHarvests.length === 0 ? (
        <Card className="text-center py-12 text-stone-400">
          <Scale className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-700">Belum ada catatan panen</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
            Data panen yang Anda catat akan otomatis menghitung pendapatan kotor, upah pemanen, dan biaya transport.
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-4 bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            + Mulai Catat Sekarang
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {safeHarvests.map((harvest) => {
            const netTripMargin = (harvest.grossIncome || 0) - ((harvest.totalHarvesterWage || 0) + (harvest.transportCost || 0));

            return (
              <Card key={harvest.id} className="p-4 relative">
                {/* Header Card: Tanggal, Kebun, Hapus */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateIndo(harvest.date)}
                    </span>
                    <span className="font-bold text-sm text-stone-900">{harvest.farmName}</span>
                    {harvest.blockName && (
                      <span className="text-[11px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                        {harvest.blockName}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteTargetId(harvest.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-50"
                    title="Hapus transaksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Detail Timbangan & Pendapatan */}
                <div className="mt-3 grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Total Timbangan</span>
                    <span className="text-base font-black text-emerald-800">
                      {formatKg(harvest.totalWeightKg)}
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      @ {formatRupiah(harvest.pricePerKg)}/kg
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">Pendapatan Kotor</span>
                    <span className="text-base font-black text-blue-700">
                      {formatRupiah(harvest.grossIncome)}
                    </span>
                    <span className="text-[10px] text-stone-400 block truncate">
                      {harvest.buyerRamName || 'RAM Pabrik'}
                    </span>
                  </div>
                </div>

                {/* Rincian Pemanen */}
                <div className="mt-2.5 text-xs space-y-1">
                  <div className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upah Pemanen: {formatRupiah(harvest.totalHarvesterWage)}</span>
                  </div>
                  <div className="bg-emerald-50/50 rounded-lg p-2 space-y-1">
                    {(harvest.harvesters || []).map((h, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-700">
                          {h.workerName} ({formatKg(h.weightKg)} × {formatRupiah(h.ratePerKg)})
                        </span>
                        <span className="font-semibold text-emerald-800">
                          {formatRupiah(h.totalWage)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rincian Sopir & Angkut */}
                {harvest.driverName && (
                  <div className="mt-2 text-xs flex items-center justify-between text-stone-600 bg-stone-50 p-2 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-stone-500" />
                      <span>Sopir: {harvest.driverName} ({harvest.vehicleNumber || 'Armada'})</span>
                    </div>
                    <span className="font-semibold text-stone-800">
                      {formatRupiah(harvest.transportCost)}
                    </span>
                  </div>
                )}

                {/* Sisa Bersih Trip Panen Ini */}
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">Sisa Bersih Panen Ini:</span>
                  <span className="font-black text-sm text-stone-900">
                    {formatRupiah(netTripMargin)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL INPUT TRANSAKSI PANEN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Transaksi Panen Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 p-2.5 rounded-xl text-xs font-semibold">
              ⚠️ {formError}
            </div>
          )}

          {/* Tanggal & Kebun */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Kebun</label>
              <select
                value={farmId}
                onChange={(e) => {
                  setFarmId(e.target.value);
                  setBlockId('');
                }}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-emerald-600"
              >
                {safeFarms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Blok Kebun (Opsional) */}
          {currentFarmBlocks.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Blok Kebun (Opsional)</label>
              <select
                value={blockId}
                onChange={(e) => setBlockId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-600"
              >
                <option value="">-- Pilih Blok (Bisa kosong jika gabungan) --</option>
                {currentFarmBlocks.map((b) => (
                  <option key={b.id} value={b.id}>{b.blockName} ({b.areaHa} ha)</option>
                ))}
              </select>
            </div>
          )}

          {/* Timbangan Bersih (kg) & Harga/kg */}
          <div className="grid grid-cols-2 gap-2 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
            <div>
              <label className="block text-xs font-extrabold text-emerald-950 mb-1">
                Berat Timbangan (Kg) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="Contoh: 2500"
                value={totalWeightKg}
                onChange={(e) => setTotalWeightKg(e.target.value)}
                required
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2.5 text-sm font-black text-stone-900 focus:outline-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-emerald-950 mb-1">
                Harga Jual TBS (/Kg) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="Contoh: 3000"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                required
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2.5 text-sm font-black text-stone-900 focus:outline-emerald-700"
              />
            </div>
            <div className="col-span-2 pt-2 border-t border-emerald-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-900">Otomatis Pendapatan Kotor:</span>
              <span className="font-black text-base text-emerald-800">
                {formatRupiah(grossIncome)}
              </span>
            </div>
          </div>

          {/* Pilih Pemanen */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-700">
                Pilih Pemanen (Bisa Lebih Dari 1) *
              </label>
              <span className="text-[11px] text-stone-400">
                {selectedHarvesterIds.length} pemanen terpilih
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200">
              {availableHarvesters.map((w) => {
                const isSelected = selectedHarvesterIds.includes(w.id);
                return (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => handleToggleHarvester(w.id)}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-emerald-700 border-emerald-800 text-white shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="truncate">{w.name}</span>
                    <span className="text-[10px] opacity-80">@{w.defaultRatePerKg}</span>
                  </button>
                );
              })}
            </div>

            {/* Jika lebih dari 1 pemanen, sediakan input pembagian kg */}
            {selectedHarvesterIds.length > 1 && (
              <div className="mt-2.5 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-amber-900">
                  <span>Bagi Hasil Timbangan per Pemanen:</span>
                  <span>Total: {formatKg(totalAllocatedWeight)} / {formatKg(numWeight)}</span>
                </div>
                {selectedHarvesterIds.map((hId) => {
                  const worker = safeWorkers.find(w => w.id === hId);
                  return (
                    <div key={hId} className="flex items-center gap-2">
                      <span className="text-xs text-stone-700 font-medium w-28 truncate">
                        {worker?.name}
                      </span>
                      <input
                        type="number"
                        placeholder="kg hasil"
                        value={harvesterWeights[hId] || ''}
                        onChange={(e) => setHarvesterWeights({ ...harvesterWeights, [hId]: e.target.value })}
                        className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs w-24 focus:outline-emerald-600"
                      />
                      <span className="text-[11px] text-stone-500 font-semibold truncate flex-1 text-right">
                        = {formatRupiah((parseFloat(harvesterWeights[hId]) || 0) * (worker?.defaultRatePerKg || 250))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Upah Pemanen Display */}
            <div className="mt-1 text-right text-xs text-stone-600 font-semibold">
              Total Upah Pemanen: <span className="text-emerald-700 font-black">{formatRupiah(totalHarvesterWage)}</span>
            </div>
          </div>

          {/* Sopir & Angkutan */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-stone-600" />
                <span>Sopir / Jasa Angkut</span>
              </label>
              <span className="text-[11px] text-stone-500">
                Tarif: {formatRupiah(driverRate)}/kg
              </span>
            </div>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-600"
            >
              <option value="">-- Tanpa Jasa Angkut / Angkut Sendiri --</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.vehicleNumber || 'Truk'}) - {formatRupiah(d.defaultRatePerKg)}/kg
                </option>
              ))}
            </select>
            {driverId && (
              <div className="flex justify-between items-center text-xs pt-1 border-t border-stone-200">
                <span className="text-stone-600">Total Ongkos Angkut Truk:</span>
                <span className="font-black text-stone-900">{formatRupiah(transportCost)}</span>
              </div>
            )}
          </div>

          {/* Pembeli / RAM & Nomor Nota */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Pabrik / RAM Pembeli
              </label>
              <input
                type="text"
                placeholder="RAM Sawit Makmur"
                value={buyerRamName}
                onChange={(e) => setBuyerRamName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                No. SPK / Nota
              </label>
              <input
                type="text"
                placeholder="SPK-001"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Ringkasan Sebelum Simpan */}
          <div className="bg-stone-900 text-white p-3 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Ringkasan Transaksi:</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>Pendapatan Kotor:</span>
              <span className="font-bold text-white">{formatRupiah(grossIncome)}</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>Total Upah Pemanen:</span>
              <span className="text-amber-300">- {formatRupiah(totalHarvesterWage)}</span>
            </div>
            {driverId && (
              <div className="flex justify-between text-stone-300">
                <span>Ongkos Angkut Sopir:</span>
                <span className="text-amber-300">- {formatRupiah(transportCost)}</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-stone-700 flex justify-between text-sm font-black">
              <span className="text-emerald-300">Estimasi Sisa Bersih:</span>
              <span className="text-emerald-400">
                {formatRupiah(grossIncome - totalHarvesterWage - (driverId ? transportCost : 0))}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
            >
              Simpan Transaksi Panen
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteHarvest(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Hapus Catatan Panen?"
        message="Data transaksi panen ini akan dihapus permanen. Total pendapatan dan rekapan upah akan diperbarui otomatis."
      />
    </div>
  );
};