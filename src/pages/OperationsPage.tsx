import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wrench, 
  Sprout, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Fuel, 
  Scissors, 
  Coffee, 
  Tag
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../lib/formatters';
import { Card, Modal, ConfirmDialog } from '../components/common/CommonUI';
import { ExpenseCategory } from '../types';

export const OperationsPage: React.FC = () => {
  const { 
    filteredFertilizations, 
    filteredExpenses, 
    farms, 
    blocks, 
    workers,
    addFertilization, 
    deleteFertilization, 
    addExpense, 
    deleteExpense,
    selectedFarmId
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'fertilization'>('expenses');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isFertModalOpen, setIsFertModalOpen] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'expense' | 'fert'; id: string } | null>(null);

  // Common farm helper
  const defaultFarmId = selectedFarmId !== 'all' ? selectedFarmId : (farms[0]?.id || '');

  // State Form Biaya Operasional
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expFarmId, setExpFarmId] = useState(defaultFarmId);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('bbm');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expRecipient, setExpRecipient] = useState('');

  // State Form Pemupukan
  const [fertDate, setFertDate] = useState(new Date().toISOString().split('T')[0]);
  const [fertFarmId, setFertFarmId] = useState(defaultFarmId);
  const [fertBlockId, setFertBlockId] = useState('');
  const [fertName, setFertName] = useState('NPK Mahkota 13-8-27');
  const [fertQty, setFertQty] = useState('10');
  const [fertUnit, setFertUnit] = useState('sak (50kg)');
  const [fertPricePerUnit, setFertPricePerUnit] = useState('360000');
  const [fertWorkerName, setFertWorkerName] = useState('');
  const [fertLaborCost, setFertLaborCost] = useState('300000');

  // Perhitungan Pemupukan
  const numQty = parseFloat(fertQty) || 0;
  const numPrice = parseFloat(fertPricePerUnit) || 0;
  const numLabor = parseFloat(fertLaborCost) || 0;
  const materialCost = numQty * numPrice;
  const totalFertCost = materialCost + numLabor;

  const currentFarmBlocks = blocks.filter(b => b.farmId === (activeSubTab === 'fertilization' ? fertFarmId : expFarmId));

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expAmount) || 0;
    if (amount <= 0 || !expDesc.trim()) return;

    const farm = farms.find(f => f.id === expFarmId);
    addExpense({
      date: expDate,
      farmId: expFarmId,
      farmName: farm?.name || 'Kebun Sawit',
      category: expCategory,
      amount,
      description: expDesc.trim(),
      recipient: expRecipient.trim() || undefined,
    } as any);

    setExpAmount('');
    setExpDesc('');
    setExpRecipient('');
    setIsExpenseModalOpen(false);
  };

  const handleSaveFertilization = (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) return;

    const farm = farms.find(f => f.id === fertFarmId);
    const block = blocks.find(b => b.id === fertBlockId);

    addFertilization({
      date: fertDate,
      farmId: fertFarmId,
      farmName: farm?.name || 'Kebun Sawit',
      blockId: fertBlockId || undefined,
      blockName: block?.name || undefined,
      fertilizerType: fertName.trim(),
      quantity: numQty,
      unit: fertUnit,
      unitPrice: numPrice,
      materialCost,
      workerName: fertWorkerName.trim() || undefined,
      laborCost: numLabor,
      totalCost: totalFertCost,
    } as any);

    setIsFertModalOpen(false);
  };

  const getCategoryBadge = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'bbm':
        return { label: 'BBM & Solar', icon: Fuel, color: 'bg-amber-100 text-amber-800' };
      case 'perawatan_rumput':
        return { label: 'Tebas / Semprot', icon: Scissors, color: 'bg-emerald-100 text-emerald-800' };
      case 'konsumsi':
        return { label: 'Konsumsi Pekerja', icon: Coffee, color: 'bg-orange-100 text-orange-800' };
      case 'alat_kerja':
        return { label: 'Alat & Perlengkapan', icon: Wrench, color: 'bg-blue-100 text-blue-800' };
      default:
        return { label: 'Biaya Lainnya', icon: Tag, color: 'bg-stone-100 text-stone-800' };
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-700" />
            <span>Biaya Operasional & Kebun</span>
          </h2>
          <p className="text-xs text-stone-500">
            Catat pemupukan (material + upah sebar) serta pengeluaran operasional lapangan
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => activeSubTab === 'expenses' ? setIsExpenseModalOpen(true) : setIsFertModalOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-1.5 touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{activeSubTab === 'expenses' ? 'Catat Biaya Baru' : 'Catat Pemupukan'}</span>
        </button>
      </div>

      {/* Segmented Buttons for Sub-Tabs */}
      <div className="bg-stone-200/80 p-1 rounded-xl flex">
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'expenses'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Biaya Operasional ({filteredExpenses.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('fertilization')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'fertilization'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>Aplikasi Pemupukan ({filteredFertilizations.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: BIAYA OPERASIONAL LAINNYA */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <Card className="text-center py-10 text-stone-400">
              <DollarSign className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold text-stone-700">Belum ada catatan biaya operasional.</p>
              <p className="text-xs text-stone-400 mt-1">Catat biaya solar BBM, tebas semak, konsumsi, dan perawatan.</p>
            </Card>
          ) : (
            filteredExpenses.map((exp) => {
              const badge = getCategoryBadge(exp.category);
              const BadgeIcon = badge.icon;
              // Mencari nama kebun secara aman berdasarkan farmId
              const matchedFarm = farms.find(f => f.id === exp.farmId);
              const farmDisplayName = exp.farmName || matchedFarm?.name || 'Kebun Sawit';

              return (
                <Card key={exp.id} className="p-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <span className="text-xs text-stone-400">• {formatDateIndo(exp.date)}</span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 mt-1.5">{exp.description}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Kebun: {farmDisplayName} {exp.recipient && `• Penerima: ${exp.recipient}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm sm:text-base text-rose-600">
                        - {formatRupiah(exp.amount)}
                      </span>
                      <button
                        onClick={() => setDeleteTarget({ type: 'expense', id: exp.id })}
                        className="block ml-auto mt-2 text-stone-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* SUB-TAB 2: PEMUPUKAN */}
      {activeSubTab === 'fertilization' && (
        <div className="space-y-3">
          {filteredFertilizations.length === 0 ? (
            <Card className="text-center py-10 text-stone-400">
              <Sprout className="w-10 h-10 mx-auto text-emerald-300 mb-2" />
              <p className="text-sm font-semibold text-stone-700">Belum ada catatan pemupukan.</p>
              <p className="text-xs text-stone-400 mt-1">Catat pembelian pupuk dan upah sebar tenaga kerja di sini.</p>
            </Card>
          ) : (
            filteredFertilizations.map((fert) => {
              // Mencari nama kebun & blok secara aman berdasarkan ID
              const matchedFarm = farms.find(f => f.id === fert.farmId);
              const matchedBlock = blocks.find(b => b.id === fert.blockId);
              const farmDisplayName = fert.farmName || matchedFarm?.name || 'Kebun Sawit';
              const blockDisplayName = fert.blockName || matchedBlock?.name;

              return (
                <Card key={fert.id} className="p-3.5 border-l-4 border-l-emerald-600">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                          {fert.fertilizerType}
                        </span>
                        <span className="text-xs text-stone-400">{formatDateIndo(fert.date)}</span>
                      </div>
                      <p className="text-xs text-stone-600 font-semibold mt-1">
                        {farmDisplayName} {blockDisplayName && `(${blockDisplayName})`}
                      </p>
                      <p className="text-xs text-stone-500">
                        Jumlah: {fert.quantity} {fert.unit} @ {formatRupiah(fert.unitPrice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-500 block">Total Biaya</span>
                      <span className="font-black text-sm sm:text-base text-rose-600">
                        - {formatRupiah(fert.totalCost)}
                      </span>
                      <button
                        onClick={() => setDeleteTarget({ type: 'fert', id: fert.id })}
                        className="block ml-auto mt-2 text-stone-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pemisahan Biaya Material vs Upah Tenaga Kerja */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2 rounded-xl">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Biaya Pupuk (Material):</span>
                      <span className="font-bold text-stone-800">{formatRupiah(fert.materialCost)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">
                        Biaya Upah Sebar {fert.workerName ? `(${fert.workerName})` : ''}:
                      </span>
                      <span className="font-bold text-stone-800">{formatRupiah(fert.laborCost)}</span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* MODAL INPUT BIAYA OPERASIONAL */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Catat Biaya Operasional Kebun"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Kebun</label>
              <select
                value={expFarmId}
                onChange={(e) => setExpFarmId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Kategori Biaya</label>
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="bbm">BBM / Solar Genset & Mesin</option>
              <option value="perawatan_rumput">Tebas Semak / Semprot Gulma</option>
              <option value="konsumsi">Konsumsi & Minum Pekerja</option>
              <option value="alat_kerja">Alat Kerja (Dodos, Egrek, Angkong, Pisau)</option>
              <option value="lainnya">Biaya Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nominal Biaya (Rp) *</label>
            <input
              type="number"
              placeholder="Contoh: 350000"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm font-black text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Keterangan Pengeluaran *</label>
            <input
              type="text"
              placeholder="Contoh: Beli 25 liter solar untuk genset"
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Penerima / Toko (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: SPBU Bangkinang"
              value={expRecipient}
              onChange={(e) => setExpRecipient(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
            >
              Simpan Biaya
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL INPUT PEMUPUKAN */}
      <Modal
        isOpen={isFertModalOpen}
        onClose={() => setIsFertModalOpen(false)}
        title="Catat Aplikasi Pemupukan"
      >
        <form onSubmit={handleSaveFertilization} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={fertDate}
                onChange={(e) => setFertDate(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Kebun</label>
              <select
                value={fertFarmId}
                onChange={(e) => setFertFarmId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {currentFarmBlocks.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Blok Kebun</label>
              <select
                value={fertBlockId}
                onChange={(e) => setFertBlockId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="">-- Semua Blok / Tidak spesifik --</option>
                {currentFarmBlocks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.areaHa} ha)</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Jenis / Merk Pupuk</label>
            <input
              type="text"
              placeholder="Contoh: NPK Mahkota 13-8-27 atau Urea"
              value={fertName}
              onChange={(e) => setFertName(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Jumlah</label>
              <input
                type="number"
                value={fertQty}
                onChange={(e) => setFertQty(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Satuan</label>
              <select
                value={fertUnit}
                onChange={(e) => setFertUnit(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2 py-2 text-xs"
              >
                <option value="sak (50kg)">sak (50kg)</option>
                <option value="karung">karung</option>
                <option value="kg">kg</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Harga / Satuan</label>
              <input
                type="number"
                value={fertPricePerUnit}
                onChange={(e) => setFertPricePerUnit(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-bold"
              />
            </div>
          </div>

          {/* Tenaga Kerja & Upah Sebar */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Pekerja Pemupukan (Nama / Tim)
              </label>
              <input
                type="text"
                placeholder="Contoh: Pak Slamet & Tim (2 orang)"
                value={fertWorkerName}
                onChange={(e) => setFertWorkerName(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Biaya Upah Sebar / Jasa Tenaga Kerja (Rp)
              </label>
              <input
                type="number"
                placeholder="300000"
                value={fertLaborCost}
                onChange={(e) => setFertLaborCost(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-emerald-950 text-white p-3 rounded-2xl space-y-1 text-xs">
            <div className="flex justify-between text-stone-300">
              <span>Biaya Material Pupuk:</span>
              <span className="font-bold text-white">{formatRupiah(materialCost)}</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>Upah Tenaga Kerja Sebar:</span>
              <span className="font-bold text-amber-300">{formatRupiah(numLabor)}</span>
            </div>
            <div className="pt-1.5 border-t border-emerald-800 flex justify-between text-sm font-black">
              <span className="text-emerald-300">Total Biaya Pemupukan:</span>
              <span className="text-emerald-400">{formatRupiah(totalFertCost)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFertModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
            >
              Simpan Pemupukan
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'expense') {
              deleteExpense(deleteTarget.id);
            } else {
              deleteFertilization(deleteTarget.id);
            }
            setDeleteTarget(null);
          }
        }}
        title="Hapus Data Biaya?"
        message="Data ini akan dihapus dari pembukuan dan rekapan total biaya operasional akan diperbarui."
      />
    </div>
  );
};