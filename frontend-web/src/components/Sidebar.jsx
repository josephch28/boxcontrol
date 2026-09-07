import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, CreditCard, DollarSign, 
  FileText, MapPin, Sparkles, LogOut, ShieldCheck
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const { user, logout } = useAuth();

  const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre[0] : 'J';
    const a = apellido ? apellido[0] : 'C';
    return `${n}${a}`.toUpperCase();
  };

  const navItemsOperacion = [
    { id: 'panel', label: 'Panel', icon: LayoutDashboard, badge: null },
    { id: 'clientes', label: 'Clientes', icon: Users, badge: '142', disabled: true },
    { id: 'membresias', label: 'Membresías', icon: CreditCard, badge: '18', disabled: true },
    { id: 'pagos', label: 'Pagos', icon: DollarSign, badge: null, disabled: true },
    { id: 'reportes', label: 'Reportes', icon: FileText, badge: null, disabled: true },
  ];

  const navItemsConfig = [
    { id: 'sucursales', label: 'Sucursales', icon: MapPin, badge: '2', disabled: false },
    { id: 'contenido-ia', label: 'Contenido IA', icon: Sparkles, badge: '3', disabled: true },
  ];

  return (
    <aside className="w-60 min-h-screen bg-[#0E0E11] border-r border-[#2A2A31] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Logo */}
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
            <div className="px-3 pb-2 font-mono text-[9px] tracking-[0.25em] text-[#82828A] uppercase">
              — OPERACIÓN
            </div>
            <nav className="space-y-1">
              {navItemsOperacion.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => !item.disabled && setCurrentView(item.id)}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#151510] text-[#F5EFE0] border-l-2 border-[#E8B84A] font-semibold'
                        : item.disabled
                        ? 'text-[#4A4A52] cursor-not-allowed'
                        : 'text-[#B8B8BE] hover:text-[#F5EFE0] hover:bg-[#141418]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-[#E8B84A]' : 'text-current'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-[#232329] text-[10px] font-mono text-[#F5EFE0] rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Configuración */}
          <div>
            <div className="px-3 pb-2 font-mono text-[9px] tracking-[0.25em] text-[#82828A] uppercase">
              — CONFIGURACIÓN
            </div>
            <nav className="space-y-1">
              {navItemsConfig.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => !item.disabled && setCurrentView(item.id)}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#151510] text-[#F5EFE0] border-l-2 border-[#E8B84A] font-semibold'
                        : item.disabled
                        ? 'text-[#4A4A52] cursor-not-allowed'
                        : 'text-[#B8B8BE] hover:text-[#F5EFE0] hover:bg-[#141418]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-[#E8B84A]' : 'text-current'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                        isActive ? 'bg-[#E8B84A] text-[#1A1206] font-bold' : 'bg-[#232329] text-[#F5EFE0]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-t border-[#2A2A31]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#232329] border border-[#A6822D] flex items-center justify-center font-display text-sm tracking-wider text-[#E8B84A] font-bold">
              {user ? getInitials(user.nombre, user.apellido) : 'JC'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-[#F5EFE0] truncate">
                {user ? `${user.nombre} ${user.apellido}` : 'Joseph Chachalo'}
              </div>
              <div className="font-mono text-[9px] tracking-wider text-[#82828A] truncate">
                {user?.rol || 'ADMIN GENERAL'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="p-1.5 text-[#82828A] hover:text-[#E8B84A] hover:bg-[#1B1B21] transition-colors rounded"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
