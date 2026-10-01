/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { HarvestPage } from './pages/HarvestPage';
import { OperationsPage } from './pages/OperationsPage';
import { WorkersPage } from './pages/WorkersPage';
import { ReportsPage } from './pages/ReportsPage';
import { FarmsPage } from './pages/FarmsPage';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-5">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'panen' && <HarvestPage />}
          {activeTab === 'operasional' && <OperationsPage />}
          {activeTab === 'pekerja' && <WorkersPage />}
          {activeTab === 'laporan' && <ReportsPage />}
          {activeTab === 'kebun' && <FarmsPage />}
        </main>

        {/* Mobile Bottom Navigation (hidden on desktop) */}
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
