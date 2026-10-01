import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Trees, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { formatHa } from '../lib/formatters';
import { Card, Modal } from '../components/common/CommonUI';

export const FarmsPage: React.FC = () => {
  // Pastikan deleteFarm / updateFarm sudah tersedia di AppContext kamu
  const { farms, blocks, addFarm, addBlock, updateFarm, deleteFarm } = useApp();

  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [targetFarmId, setTargetFarmId] = useState(farms[0]?.id || '');

  // State untuk Mode Edit Kebun
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);

  // Form Farm States
  const [farmName, setFarmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [totalAreaHa, setTotalAreaHa] = useState('');
  const [location, setLocation] = useState('');
  const [plantedYear, setPlantedYear] = useState('');
  const [notes, setNotes] = useState('');

  // Form Block States
  const [blockName, setBlockName] = useState('');
  const [blockAreaHa, setBlockAreaHa] = useState('');
  const [treeCount, setTreeCount] = useState('');
  const [blockPlantedYear, setBlockPlantedYear] = useState('');

  // Supabase Config State
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('sawitpro_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('sawitpro_supabase_key') || '');
  const [supabaseSaved, setSupabaseSaved] = useState(false);

  // Fungsi Buka Modal Tambah Kebun (Reset Form)
  const handleOpenAddFarmModal = () => {
    setEditingFarmId(null);
    setFarmName('');
    setOwnerName('');
    setTotalAreaHa('');
    setLocation('');
    setPlantedYear('');
    setNotes('');
    setIsFarmModalOpen(true);
  };

  // Fungsi Buka Modal Edit Kebun
  const handleOpenEditFarmModal = (farm: any) => {
    setEditingFarmId(farm.id);
    setFarmName(farm.name || '');
    setOwnerName(farm.ownerName || '');
    setTotalAreaHa(farm.totalAreaHa?.toString() || '');
    setLocation(farm.location || '');
    setPlantedYear(farm.plantedYear?.toString() || '');
    setNotes(farm.notes || '');
    setIsFarmModalOpen(true);
  };

  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();
    const area = parseFloat(totalAreaHa) || 0;
    if (!farmName.trim() || area <= 0) return;

    if (editingFarmId) {
      // Jika sedang Mode Edit (pastikan updateFarm ada di AppContext)
      if (updateFarm) {
        updateFarm(editingFarmId, {
          name: farmName.trim(),
          ownerName: ownerName.trim() || 'Pemilik Kebun',
          totalAreaHa: area,
          location: location.trim() || undefined,
          plantedYear: parseInt(plantedYear) || undefined,
          notes: notes.trim() || undefined,
        });
      }
    } else {
      // Mode Tambah Baru
      addFarm({
        name: farmName.trim(),
        ownerName: ownerName.trim() || 'Pemilik Kebun',
        totalAreaHa: area,
        location: location.trim() || undefined,
        plantedYear: parseInt(plantedYear) || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsFarmModalOpen(false);
    setEditingFarmId(null);
  };

  const handleDeleteFarmAction = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus kebun "${name}" beserta seluruh data blok di dalamnya?`)) {
      if (deleteFarm) {
        deleteFarm(id);
      }
    }
  };

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const area = parseFloat(blockAreaHa) || 0;
    if (!blockName.trim() || area <= 0) return;

    addBlock({
      farmId: targetFarmId,
      blockName: blockName.trim(),
      areaHa: area,
      treeCount: parseInt(treeCount) || undefined,
      plantedYear: parseInt(blockPlantedYear) || undefined,
    });

    setBlockName('');
    setBlockAreaHa('');
    setTreeCount('');
    setBlockPlantedYear('');
    setIsBlockModalOpen(false);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sawitpro_supabase_url', supabaseUrl.trim());
    localStorage.setItem('sawitpro_supabase_key', supabaseKey.trim());
    setSupabaseSaved(true);
    setTimeout(() => setSupabaseSaved(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-700" />
            <span>Data Kebun & Blok</span>
          </h2>
          <p className="text-xs text-stone-500">
            Kelola profil kebun, pembagian blok, dan konfigurasi database
          </p>
        </div>
        <button
          onClick={handleOpenAddFarmModal}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md flex items-center gap-1.5 touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kebun</span>
        </button>
      </div>

      {/* Farms List */}
      <div className="space-y-4">
        {farms.length === 0 ? (
          <Card className="p-6 text-center text-stone-400 text-xs italic">
            Belum ada data kebun. Klik "Tambah Kebun" di atas untuk mulai mencatat.
          </Card>
        ) : (
          farms.map((farm) => {
            const farmBlocks = blocks.filter(b => b.farmId === farm.id);

            return (
              <Card key={farm.id} className="p-4 border-l-4 border-l-emerald-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-stone-900">{farm.name}</h3>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                        {formatHa(farm.totalAreaHa)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                      <span>Pemilik: <strong className="text-stone-700">{farm.ownerName}</strong></span>
                      {farm.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {farm.location}
                        </span>
                      )}
                      {farm.plantedYear && (
                        <span>Tahun Tanam: {farm.plantedYear}</span>
                      )}
                    </div>
                  </div>

                  {/* Tombol Aksi (Tambah Blok, Edit, Hapus) */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        setTargetFarmId(farm.id);
                        setIsBlockModalOpen(true);
                      }}
                      className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Blok</span>
                    </button>
                    
                    <button
                      onClick={() => handleOpenEditFarmModal(farm)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold p-1.5 rounded-lg"
                      title="Edit Kebun"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteFarmAction(farm.id, farm.name)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-bold p-1.5 rounded-lg"
                      title="Hapus Kebun"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Blocks Section */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                    Daftar Blok ({farmBlocks.length} Blok)
                  </span>

                  {farmBlocks.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">Belum ada blok yang ditambahkan untuk kebun ini.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {farmBlocks.map((block) => (
                        <div key={block.id} className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
                          <div className="font-bold text-stone-900">{block.blockName}</div>
                          <div className="text-stone-500 mt-0.5">
                            Luas: <strong className="text-emerald-700">{formatHa(block.areaHa)}</strong>
                            {block.treeCount && ` • ${block.treeCount} pohon`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Supabase Free Database Configuration Box */}
      <Card className="p-4 bg-stone-900 text-stone-200 border-none shadow-md mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-sm sm:text-base">Koneksi Database Supabase (Free Tier)</h3>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed mb-3">
          Aplikasi sudah mendukung penyimpanan lokal HP dan siap dihubungkan langsung ke akun Supabase Anda untuk sinkronisasi cloud real-time.
        </p>

        <form onSubmit={handleSaveSupabase} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-300 mb-1">
              Supabase Anon Public Key (Safe for Frontend)
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-400 flex items-center gap-1">
              {supabaseUrl && supabaseKey ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Kredensial tersimpan di browser
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Berjalan menggunakan Mode Offline-Local Storage
                </span>
              )}
            </span>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
            >
              {supabaseSaved ? 'Tersimpan!' : 'Simpan Kredensial'}
            </button>
          </div>
        </form>
      </Card>

      {/* MODAL INPUT / EDIT KEBUN */}
      <Modal
        isOpen={isFarmModalOpen}
        onClose={() => setIsFarmModalOpen(false)}
        title={editingFarmId ? "Edit Data Kebun" : "Tambah Kebun Baru"}
      >
        <form onSubmit={handleSaveFarm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nama Kebun *</label>
            <input
              type="text"
              placeholder="Contoh: Kebun Kelapa Sawit Rimba Raya"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nama Pemilik *</label>
              <input
                type="text"
                placeholder="H. Sudirman"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Total Luas (Ha) *</label>
              <input
                type="number"
                step="any"
                placeholder="20"
                value={totalAreaHa}
                onChange={(e) => setTotalAreaHa(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Lokasi Kebun</label>
              <input
                type="text"
                placeholder="Kampar, Riau"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tahun Tanam</label>
              <input
                type="number"
                placeholder="2018"
                value={plantedYear}
                onChange={(e) => setPlantedYear(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Catatan</label>
            <input
              type="text"
              placeholder="Bibit Marihat, parit terawat"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFarmModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
            >
              {editingFarmId ? "Simpan Perubahan" : "Simpan Data Kebun"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL INPUT BLOK */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title="Tambah Blok Kebun"
      >
        <form onSubmit={handleSaveBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Pilih Kebun</label>
            <select
              value={targetFarmId}
              onChange={(e) => setTargetFarmId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nama / Kode Blok *</label>
              <input
                type="text"
                placeholder="Contoh: Blok A"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Luas Blok (Ha) *</label>
              <input
                type="number"
                step="any"
                placeholder="6"
                value={blockAreaHa}
                onChange={(e) => setBlockAreaHa(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Jumlah Pokok/Pohon</label>
              <input
                type="number"
                placeholder="840"
                value={treeCount}
                onChange={(e) => setTreeCount(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tahun Tanam</label>
              <input
                type="number"
                placeholder="2017"
                value={blockPlantedYear}
                onChange={(e) => setBlockPlantedYear(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBlockModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
            >
              Simpan Blok
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};