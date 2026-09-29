import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ExternalLink, QrCode, Zap, MapPin } from 'lucide-react';

export default function Topbar({
  title,
  subtitle,
  sucursales = [],
  activeBranch,
  setActiveBranch,
  searchQuery,
  setSearchQuery,
  onOpenCheckIn,
  onOpenNuevoPago,
}) {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const sucursalAsignadaNombre = user?.sucursal?.nombre
    ? user.sucursal.nombre.toUpperCase().replace('SUCURSAL ', '').replace('SEDE ', '').trim()
    : 'SEDE ASIGNADA';

  const currentDate = new Date().toLocaleDateString('es-EC', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).toUpperCase();

  return (
    <header className="px-8 py-4 border-b border-[#33333C] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0B0D] sticky top-0 z-40">
      <div>
        <div className="font-mono text-[10px] tracking-[0.25em] text-[#A5A5AF] uppercase font-semibold">
          {subtitle || `VISTA GENERAL · ${currentDate}`}
        </div>
        <h1 className="font-display tracking-[0.08em] text-3xl text-[#F5EFE0] mt-0.5">
          {title || 'PANEL OPERATIVO'}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar socio, cédula o carnet…"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-60 bg-[#141418] border border-[#33333C] px-3.5 py-1.5 pl-9 text-xs font-mono text-[#F5EFE0] placeholder-[#A5A5AF] focus:outline-none focus:border-[#E8B84A] transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#A5A5AF]" />
        </div>

        {/* Branch Filter Combobox: Admin can switch between dynamic branches, Receptionist has fixed badge */}
        {isAdmin ? (
          <div className="relative flex items-center bg-[#141418] border border-[#33333C] hover:border-[#E8B84A] px-2.5 py-1.5 gap-2 transition-colors">
            <MapPin size={13} className="text-[#E8B84A] shrink-0" />
            <span className="text-[10px] font-mono text-[#82828A] tracking-wider uppercase font-bold shrink-0">
              SEDE:
            </span>
            <select
              value={activeBranch}
              onChange={(e) => setActiveBranch(e.target.value)}
              className="bg-transparent font-mono text-xs text-[#F5EFE0] font-bold focus:outline-none cursor-pointer tracking-wider pr-1"
              title="Filtrar datos por sede o consolidado general"
            >
              <option value="TODAS" className="bg-[#141418] text-[#F5EFE0]">
                TODAS LAS SEDES (CONSOLIDADO)
              </option>
              {sucursales && sucursales.length > 0 ? (
                sucursales
                  .filter((s) => s.estado !== 'INACTIVA')
                  .map((s) => (
                    <option
                      key={s.id}
                      value={String(s.id)}
                      className="bg-[#141418] text-[#F5EFE0]"
                    >
                      {s.nombre.toUpperCase()}
                    </option>
                  ))
              ) : (
                <>
                  <option value="1" className="bg-[#141418] text-[#F5EFE0]">
                    SUCURSAL NORTE
                  </option>
                  <option value="2" className="bg-[#141418] text-[#F5EFE0]">
                    SUCURSAL SUR
                  </option>
                </>
              )}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141418] border border-[#33333C] font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span>
            <span className="text-[#82828A] text-[10px] uppercase">SEDE:</span>
            <span className="text-[#E8B84A] font-bold text-xs">{sucursalAsignadaNombre}</span>
          </div>
        )}

        {/* Quick Check-in Button */}
        {onOpenCheckIn && (
          <button
            type="button"
            onClick={onOpenCheckIn}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1810] border border-[#A6822D] text-[#E8B84A] hover:bg-[#E8B84A] hover:text-[#1A1206] font-mono text-[10px] tracking-wider font-bold transition-all"
            title="Escanear QR o validar asistencia"
          >
            <QrCode size={13} />
            <span>ACCESO QR</span>
          </button>
        )}

        {/* Quick Payment Button */}
        {onOpenNuevoPago && (
          <button
            type="button"
            onClick={() => onOpenNuevoPago()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8B84A] text-[#1A1206] hover:bg-[#D4A538] font-display text-xs tracking-wider font-bold transition-colors"
            title="Registrar nuevo cobro en caja"
          >
            <span>+ COBRO</span>
          </button>
        )}

        {/* Swagger Docs Link Button */}
        <a
          href="http://localhost:4000/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          title="Ver documentación en Swagger UI"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#40404C] bg-[#1B1B21] text-[#A5A5AF] hover:text-[#E8B84A] hover:border-[#E8B84A] font-mono text-[10px] tracking-wider font-bold transition-colors"
        >
          <ExternalLink size={12} />
          <span>SWAGGER UI</span>
        </a>
      </div>
    </header>
  );
}
