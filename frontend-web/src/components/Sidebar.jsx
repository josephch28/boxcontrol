import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  LayoutDashboard, Users, CreditCard, DollarSign, 
  FileText, MapPin, Sparkles, LogOut, ShieldCheck
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const { user, logout } = useAuth();
  const [counts, setCounts] = useState({
    clientes: '142',
    porVencer: '18',
    contenidoIA: '3',
  });

  useEffect(() => {
    // Cargar contadores reales desde el backend
    const loadSidebarCounts = async () => {
      try {
        const [resDash, resIA] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/contenido-ia'),
        ]);

        const totalClientes = resDash.data?.data?.kpis?.sociosActivos?.total;
        const totalPorVencer = resDash.data?.data?.kpis?.porVencer?.total;
        const totalIAPendientes = resIA.data?.contadores?.pendientes;

        setCounts({
          clientes: totalClientes !== undefined ? String(totalClientes) : '142',
          porVencer: totalPorVencer !== undefined ? String(totalPorVencer) : '18',
          contenidoIA: totalIAPendientes !== undefined ? String(totalIAPendientes) : '3',
        });
      } catch (e) {
        // Usa valores predeterminados en caso de error
      }
    };

    loadSidebarCounts();
  }, [currentView]);

  const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre[0] : 'J';
    const a = apellido ? apellido[0] : 'C';
    return `${n}${a}`.toUpperCase();
  };

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const navItemsOperacion = [
    { id: 'panel', label: 'Panel', icon: LayoutDashboard, badge: null },
    { id: 'clientes', label: 'Clientes', icon: Users, badge: counts.clientes },
    { id: 'pagos', label: 'Pagos / Caja', icon: DollarSign, badge: null },
    { id: 'reportes', label: 'Reportes', icon: FileText, badge: null },
    { id: 'contenido-ia', label: 'Contenido IA', icon: Sparkles, badge: counts.contenidoIA },
  ];

  // Configuración del sistema: Exclusiva para el Administrador General
  const navItemsConfig = isAdmin
    ? [
        { id: 'membresias', label: 'Membresías', icon: CreditCard, badge: counts.porVencer },
        { id: 'sucursales', label: 'Sucursales', icon: MapPin, badge: '2' },
      ]
    : [];

  const sucursalNombre = user?.sucursal?.nombre ? user.sucursal.nombre.toUpperCase() : '';
  const userRolLabel = isAdmin
    ? 'ADMIN GENERAL'
    : sucursalNombre.includes('SUR')
    ? 'RECEPCIÓN SUR'
    : 'RECEPCIÓN NORTE';

  return (
    <aside className="w-60 min-h-screen bg-[#0E0E11] border-r border-[#2A2A31] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Logo (Matching Mockup 02/03) */}
        <div className="px-6 py-6 border-b border-[#2A2A31] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8 L28 8 L32 14 L32 26 L28 32 L20 34 L12 32 L8 26 L8 16 Z" fill="none" stroke="#E8B84A" strokeWidth="2.2"/>
              <circle cx="14" cy="18" r="1.8" fill="#E8B84A"/>
              <circle cx="26" cy="18" r="1.8" fill="#E8B84A"/>
            </svg>
            <div>
              <span className="font-display tracking-[0.15em] text-xl font-bold text-[#F5EFE0]">
                G<span className="text-[#E8B84A]">D</span> · BOX
              </span>
              <div className="font-mono text-[9px] tracking-widest text-[#82828A]">BOXCONTROL v1.0</div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-4 py-5 space-y-6">
          {/* Operación */}
          <div>
            <div className="px-3 pb-2 font-mono text-[9px] tracking-[0.25em] text-[#A5A5AF] uppercase font-semibold">
              — OPERACIÓN
            </div>
            <nav className="space-y-1">
              {navItemsOperacion.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-[13px] transition-colors ${
                      isActive
                        ? 'bg-[#151510] text-[#F5EFE0] border-l-2 border-[#E8B84A] font-semibold'
                        : 'text-[#C4C4CC] hover:text-[#F5EFE0] hover:bg-[#141418]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-[#E8B84A]' : 'text-current'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                        isActive
                          ? 'bg-[#E8B84A] text-[#1A1206] font-bold'
                          : 'bg-[#232329] text-[#F5EFE0] border border-[#40404C]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Configuración (Solo Administrador) */}
          {isAdmin && navItemsConfig.length > 0 && (
            <div>
              <div className="px-3 pb-2 font-mono text-[9px] tracking-[0.25em] text-[#A5A5AF] uppercase font-semibold">
                — CONFIGURACIÓN GENERAL
              </div>
              <nav className="space-y-1">
              {navItemsConfig.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-[13px] transition-colors ${
                      isActive
                        ? 'bg-[#151510] text-[#F5EFE0] border-l-2 border-[#E8B84A] font-semibold'
                        : 'text-[#C4C4CC] hover:text-[#F5EFE0] hover:bg-[#141418]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-[#E8B84A]' : 'text-current'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                        isActive
                          ? 'bg-[#E8B84A] text-[#1A1206] font-bold'
                          : 'bg-[#232329] text-[#F5EFE0] border border-[#40404C]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          )}
        </div>
      </div>

      {/* User Footer Profile (Matching Mockup 02) */}
      <div className="p-4 border-t border-[#33333C] bg-[#0E0E11]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-[#232329] border border-[#A6822D] shrink-0 flex items-center justify-center font-display text-base text-[#E8B84A]">
              {getInitials(user?.nombre, user?.apellido)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#F5EFE0] truncate">
                {user?.nombre} {user?.apellido}
              </div>
              <div className="font-mono text-[9px] tracking-wider text-[#A5A5AF] truncate font-medium">
                {userRolLabel}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 text-[#A5A5AF] hover:text-[#F87171] hover:bg-[#1B1B21] transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
