import React, { useState, useEffect } from 'react';
import api from './api/axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteDetalle from './pages/ClienteDetalle';
import TiposMembresia from './pages/TiposMembresia';
import Pagos from './pages/Pagos';
import Reportes from './pages/Reportes';
import Sucursales from './pages/Sucursales';
import ContenidoIA from './pages/ContenidoIA';
import AsistenciaModal from './components/AsistenciaModal';
import RegistrarPagoModal from './components/RegistrarPagoModal';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';

  // Estados de navegación
  const [currentView, setCurrentView] = useState('panel'); 
  // 'panel' | 'clientes' | 'cliente-detalle' | 'membresias' | 'pagos' | 'reportes' | 'sucursales' | 'contenido-ia'
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [activeBranch, setActiveBranch] = useState('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modales globales
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [pagoPreselectedClienteId, setPagoPreselectedClienteId] = useState(null);

  // Forzar sucursal asignada si es recepcionista
  useEffect(() => {
    if (user) {
      if (user.rol === 'RECEPCIONISTA') {
        const branchId = String(user.sucursal?.id || user.sucursalId || '1');
        setActiveBranch(branchId);
      } else {
        setActiveBranch('TODAS');
      }
    }
  }, [user]);

  // Si un recepcionista intenta acceder a una vista de configuración, redirigir al panel
  useEffect(() => {
    if (user && user.rol !== 'ADMINISTRADOR') {
      if (currentView === 'sucursales' || currentView === 'membresias') {
        setCurrentView('panel');
      }
    }
  }, [currentView, user]);

  const handleSetActiveBranch = (branchId) => {
    if (isAdmin) {
      setActiveBranch(branchId);
    }
  };

  const fetchSucursales = async () => {
    try {
      const res = await api.get('/sucursales');
      if (res.data?.success) {
        setSucursales(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching sucursales in App:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSucursales();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleOpenPagoModal = (clienteId = null) => {
    setPagoPreselectedClienteId(clienteId);
    setIsPagoModalOpen(true);
  };

  const handleSelectCliente = (clienteId) => {
    setSelectedClienteId(clienteId);
    setCurrentView('cliente-detalle');
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim() && currentView !== 'clientes') {
      setCurrentView('clientes');
    }
  };

  const getViewConfig = () => {
    switch (currentView) {
      case 'clientes':
        return {
          title: 'SOCIOS DEL CLUB',
          subtitle: 'ADMINISTRACIÓN Y CARNET QR · RF-W02',
        };
      case 'cliente-detalle':
        return {
          title: 'PERFIL DE SOCIO',
          subtitle: 'HISTORIAL INTEGRAL · RF-W11',
        };
      case 'membresias':
        return {
          title: 'CATÁLOGO DE MEMBRESÍAS',
          subtitle: 'PLANES DE BOXEO Y VIGENCIAS · RF-W03',
        };
      case 'pagos':
        return {
          title: 'REGISTRO DE COBROS',
          subtitle: 'CAJA Y AUDITORÍA FINANCIERA · RF-W05',
        };
      case 'reportes':
        return {
          title: 'REPORTES FINANCIEROS',
          subtitle: 'ANÁLISIS DE INGRESOS Y EXPORTACIÓN PDF · RF-W08, RF-W09',
        };
      case 'sucursales':
        return {
          title: 'SUCURSALES ACTIVAS',
          subtitle: 'CONFIGURACIÓN DE SEDES · RF-W10',
        };
      case 'contenido-ia':
        return {
          title: 'CONTENIDO POR IA',
          subtitle: 'RUTINAS Y NUTRICIÓN ASISTIDA · RF-W12',
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
      {/* Sidebar fijo a la izquierda con enlaces activos y badges dinámicos */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => {
          setSearchQuery('');
          setCurrentView(view);
        }}
      />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar
          title={viewConfig.title}
          subtitle={viewConfig.subtitle}
          sucursales={sucursales}
          activeBranch={activeBranch}
          setActiveBranch={handleSetActiveBranch}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onOpenNuevoPago={() => handleOpenPagoModal()}
        />

        <main className="flex-1">
          <ErrorBoundary>
            {currentView === 'panel' && (
              <Dashboard
                activeBranch={activeBranch}
                sucursales={sucursales}
                onNavigateTo={(view, id) => {
                  if (view === 'cliente-detalle') {
                    handleSelectCliente(id);
                  } else {
                    setCurrentView(view);
                  }
                }}
                onOpenPago={(clienteId) => handleOpenPagoModal(clienteId)}
                onOpenCheckIn={() => setIsCheckInOpen(true)}
              />
            )}

            {currentView === 'clientes' && (
              <Clientes
                onSelectCliente={handleSelectCliente}
                onOpenNuevoPago={handleOpenPagoModal}
                searchQuery={searchQuery}
                externalBranch={activeBranch}
                sucursalesList={sucursales}
              />
            )}

            {currentView === 'cliente-detalle' && (
              <ClienteDetalle
                clienteId={selectedClienteId}
                onBack={() => setCurrentView('clientes')}
                onOpenPago={(clienteId) => handleOpenPagoModal(clienteId)}
                sucursalesList={sucursales}
              />
            )}

            {currentView === 'membresias' && isAdmin && <TiposMembresia />}

            {currentView === 'pagos' && (
              <Pagos
                onOpenNuevoPago={handleOpenPagoModal}
                externalBranch={activeBranch}
                sucursalesList={sucursales}
              />
            )}

            {currentView === 'reportes' && (
              <Reportes
                externalBranch={activeBranch}
                sucursalesList={sucursales}
              />
            )}

            {currentView === 'sucursales' && isAdmin && (
              <Sucursales onSucursalesChange={fetchSucursales} />
            )}

            {currentView === 'contenido-ia' && <ContenidoIA />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Modal de Asistencia y Control de Acceso en Vivo (RF-M03) */}
      <AsistenciaModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onOpenPago={(clienteId) => handleOpenPagoModal(clienteId)}
      />

      {/* Modal de Registro de Pago en Caja (RF-W05 - Mockup 05) */}
      <RegistrarPagoModal
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
        preselectedClienteId={pagoPreselectedClienteId}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
