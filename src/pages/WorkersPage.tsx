import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Phone, 
  Truck, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { formatRupiah } from '../lib/formatters';
import { Card, Modal, ConfirmDialog } from '../components/common/CommonUI';
import { Worker, WorkerRole } from '../types';

export const WorkersPage: React.FC = () => {
  const { workers, addWorker, updateWorker, deleteWorker } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<WorkerRole>('pemanen');
  const [phone, setPhone] = useState('');
  const [defaultRatePerKg, setDefaultRatePerKg] = useState('250');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingWorker(null);
    setName('');
    setRole('pemanen');
    setPhone('');
    setDefaultRatePerKg('250');
    setVehicleNumber('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: Worker) => {
    setEditingWorker(w);
    setName(w.name);
    setRole(w.role);
    setPhone(w.phone || '');
    setDefaultRatePerKg(String(w.defaultRatePerKg || 0));
    setVehicleNumber(w.vehicleNumber || '');
    setNotes(w.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rate = parseFloat(defaultRatePerKg) || 0;

    if (editingWorker) {
      updateWorker({
        ...editingWorker,
        name: name.trim(),
        role,
        phone: phone.trim() || undefined,
        defaultRatePerKg: rate,
        vehicleNumber: role === 'sopir' ? vehicleNumber.trim() : undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addWorker({
        name: name.trim(),
        role,
        phone: phone.trim() || undefined,
        defaultRatePerKg: rate,
        vehicleNumber: role === 'sopir' ? vehicleNumber.trim() : undefined,
        isActive: true,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const getRoleBadge = (r: WorkerRole) => {
    switch (r) {
      case 'pemanen':
        return { label: 'Pemanen', color: 'bg-emerald-100 text-emerald-800' };
      case 'sopir':
        return { label: 'Sopir Truk', color: 'bg-blue-100 text-blue-800' };
      case 'mandor':
        return { label: 'Mandor', color: 'bg-purple-100 text-purple-800' };
      case 'pemupuk':
        return { label: 'Pemupuk', color: 'bg-amber-100 text-amber-800' };
      default:
        return { label: 'Pekerja Lain', color: 'bg-stone-100 text-stone-800' };
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>Pekerja & Sopir</span>
          </h2>
          <p className="text-xs text-stone-500">
            Daftar tenaga kerja kebun, tarif jasa per kg, dan kendaraan
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md flex items-center gap-1.5 touch-target"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pekerja</span>
        </button>
      </div>

      {/* Workers List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {workers.map((worker) => {
          const badge = getRoleBadge(worker.role);

          return (
            <Card key={worker.id} className="p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-700 text-sm">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 leading-tight">{worker.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Active Button */}
                  <button
                    onClick={() => updateWorker({ ...worker, isActive: !worker.isActive })}
                    className={`text-xs flex items-center gap-1 font-semibold ${
                      worker.isActive ? 'text-emerald-700' : 'text-stone-400'
                    }`}
                    title={worker.isActive ? 'Aktif' : 'Nonaktif'}
                  >
                    {worker.isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center justify-between bg-stone-50 p-2 rounded-xl">
                    <span className="text-stone-500">Tarif Standar:</span>
                    <span className="font-black text-stone-900">
                      {formatRupiah(worker.defaultRatePerKg)} / kg
                    </span>
                  </div>

                  {worker.vehicleNumber && (
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Truck className="w-3.5 h-3.5 text-stone-400" />
                      <span>{worker.vehicleNumber}</span>
                    </div>
                  )}

                  {worker.phone && (
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{worker.phone}</span>
                    </div>
                  )}

                  {worker.notes && (
                    <p className="text-[11px] text-stone-500 italic mt-1">{worker.notes}</p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(worker)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Ubah Data
                </button>
                <button
                  onClick={() => setDeleteTargetId(worker.id)}
                  className="text-stone-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL INPUT / EDIT PEKERJA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorker ? 'Ubah Data Pekerja' : 'Tambah Pekerja Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Peran / Kategori</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as WorkerRole)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2.5 text-xs font-semibold"
              >
                <option value="pemanen">Pemanen</option>
                <option value="sopir">Sopir Angkut</option>
                <option value="pemupuk">Pemupuk</option>
                <option value="mandor">Mandor</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tarif Dasar (/Kg)
              </label>
              <input
                type="number"
                placeholder="250"
                value={defaultRatePerKg}
                onChange={(e) => setDefaultRatePerKg(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold"
              />
            </div>
          </div>

          {role === 'sopir' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nomor Polisi / Nama Armada Truk
              </label>
              <input
                type="text"
                placeholder="Contoh: BM 8412 TA (Canter Kuning)"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nomor HP / WhatsApp</label>
            <input
              type="tel"
              placeholder="0812-xxxx-xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Catatan Tambahan</label>
            <input
              type="text"
              placeholder="Contoh: Pemanen tetap ancak barat"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>

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
              {editingWorker ? 'Simpan Perubahan' : 'Simpan Pekerja'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteWorker(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Hapus Data Pekerja?"
        message="Pekerja ini akan dihapus dari daftar master. Riwayat panen terdahulu yang melibatkan pekerja ini tetap tersimpan."
      />
    </div>
  );
};
