import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Scale, 
  Wrench, 
  Users, 
  FileSpreadsheet,
  Trees,
  Sprout
} from 'lucide-react';

interface SidebarItem {
  id: ActiveTab;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Ringkasan / Dashboard', desc: 'Metrik panen & keuangan', icon: LayoutDashboard },
  { id: 'panen', label: 'Pencatatan Panen', desc: 'Input hasil timbangan & upah', icon: Scale },
  { id: 'operasional', label: 'Biaya & Pemupukan', desc: 'Pupuk, upah sebar & BBM', icon: Wrench },
  { id: 'pekerja', label: 'Data Pekerja & Sopir', desc: 'Tarif panen & data armada', icon: Users },
  { id: 'laporan', label: 'Laporan & Rekap', desc: 'Rekap upah & laba bersih', icon: FileSpreadsheet },
  { id: 'kebun', label: 'Data Kebun & Blok', desc: 'Kelola aset luas kebun', icon: Trees },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 border-r border-stone-800 h-screen sticky top-0 flex-shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black tracking-tight text-white">SawitPRO</h2>
            <span className="bg-emerald-800/80 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded">ERP</span>
          </div>
          <p className="text-xs text-stone-400">Operasional Kebun Sawit</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/30'
                  : 'hover:bg-stone-800/70 text-stone-300'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
              <div className="truncate">
                <div className="text-sm leading-snug">{item.label}</div>
                <div className={`text-[11px] truncate ${isActive ? 'text-emerald-100' : 'text-stone-400'}`}>
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-stone-800 text-xs text-stone-400">
        <p className="font-semibold text-stone-300">PWA Siap Mobile</p>
        <p className="text-[11px] text-stone-400 mt-0.5">Didesain khusus untuk kemudahan pemilik kebun di lapangan.</p>
      </div>
    </aside>
  );
};
