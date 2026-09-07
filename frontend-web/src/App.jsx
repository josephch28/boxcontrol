import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Sucursales from './pages/Sucursales';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('panel'); // 'panel' | 'sucursales'
  const [activeBranch, setActiveBranch] = useState('TODAS'); // 'TODAS' | 'NORTE' | 'SUR'

  if (!isAuthenticated) {
    return <Login />;
  }

  const getViewConfig = () => {
    switch (currentView) {
      case 'sucursales':
        return {
          title: 'SUCURSALES ACTIVAS',
          subtitle: 'CONFIGURACIÓN DE SEDES · RF-W10',
        };
      case 'panel':
      default:
        return {
          title: 'PANEL OPERATIVO',
          subtitle: null,
        };
    }
  };

  const viewConfig = getViewConfig();

  return (
    <div className="flex min-h-screen bg-[#0B0B0D] text-[#F5EFE0] font-sans antialiased">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar
          title={viewConfig.title}
          subtitle={viewConfig.subtitle}
          activeBranch={activeBranch}
          setActiveBranch={setActiveBranch}
        />

        <main className="flex-1">
          {currentView === 'panel' && (
            <Dashboard
              activeBranch={activeBranch}
              onNavigateToSucursales={() => setCurrentView('sucursales')}
            />
          )}
          {currentView === 'sucursales' && <Sucursales />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
