import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, Users, AlertTriangle, DollarSign, QrCode, 
  ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight, Zap
} from 'lucide-react';
import IngresosChart from '../components/IngresosChart';

export default function Dashboard({ activeBranch, sucursales = [], onNavigateTo, onOpenPago, onOpenCheckIn }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const branchParam = activeBranch || 'TODAS';
      const res = await api.get(`/dashboard/metrics?sucursalId=${branchParam}`);
      if (res.data?.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeBranch]);

  const kpis = metrics?.kpis;
  const porVencerLista = metrics?.porVencerLista || [];
  const checkIns = metrics?.checkInsEnVivo || [];
  const datosGrafico = metrics?.datosGrafico || [];

  if (loading && !metrics) {
    return (
      <div className="p-6 md:p-8 space-y-6 bg-[#0B0B0D] min-h-[calc(100vh-75px)] animate-pulse select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-[#1B1B21] border border-[#33333C] h-40 flex flex-col justify-between">
              <div className="h-3 w-28 bg-[#33333C] rounded"></div>
              <div className="h-12 w-24 bg-[#232329] rounded my-2"></div>
              <div className="h-3 w-full bg-[#33333C] rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 bg-[#1B1B21] border border-[#33333C] h-80 flex flex-col justify-between">
            <div className="h-5 w-48 bg-[#33333C] rounded mb-4"></div>
            <div className="h-56 bg-[#141418] rounded"></div>
          </div>
          <div className="lg:col-span-5 p-6 bg-[#1B1B21] border border-[#33333C] h-80 flex flex-col justify-between">
            <div className="h-5 w-40 bg-[#33333C] rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-[#141418] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#0B0B0D] min-h-[calc(100vh-75px)] select-none">
      {/* KPI ROW (MATCHING MOCKUP 02-dashboard.svg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Socios Activos (Hero KPI con barra dorada) */}
        <div className="p-6 bg-[#1B1B21] border border-[#33333C] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E8B84A]"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#A5A5AF] uppercase font-medium">
                SOCIOS ACTIVOS
              </span>
              <span className="px-2 py-0.5 bg-[#1E2E1E] text-[#4ADE80] border border-[#4ADE80]/30 font-mono text-[10px] rounded flex items-center gap-1 font-bold">
                <span>▲</span> VIGENTES
              </span>
            </div>
            <div className="font-display text-6xl text-[#F5EFE0] leading-none mb-4">
              {kpis?.sociosActivos?.total ?? 0}
            </div>
          </div>
          <div className="pt-3 border-t border-[#33333C] flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-[#A5A5AF]">
            {kpis?.sociosActivos?.desglose?.length > 0 ? (
              kpis.sociosActivos.desglose.map((s) => (
                <span key={s.id}>
                  <strong className="text-[#F5EFE0]">{s.count}</strong> {s.codigo}
                </span>
              ))
            ) : (
              <>
                <span><strong className="text-[#F5EFE0]">{kpis?.sociosActivos?.norte ?? 0}</strong> NORTE</span>
                <span><strong className="text-[#F5EFE0]">{kpis?.sociosActivos?.sur ?? 0}</strong> SUR</span>
              </>
            )}
          </div>
        </div>

        {/* KPI 2: Por Vencer · 7D */}
        <div className="p-6 bg-[#1B1B21] border border-[#33333C] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#A5A5AF] uppercase font-medium">
                POR VENCER · 7D
              </span>
              <span className="px-2 py-0.5 bg-[#2E2818] text-[#FBBF24] border border-[#FBBF24]/30 font-mono text-[10px] rounded flex items-center gap-1 font-bold">
                <span>⚠</span> ATENCIÓN
              </span>
            </div>
            <div className="font-display text-6xl text-[#F5EFE0] leading-none mb-4">
              {kpis?.porVencer?.total ?? 0}
            </div>
          </div>
          <div className="pt-3 border-t border-[#33333C] flex justify-between font-mono text-[10px] text-[#A5A5AF]">
            <span>TOTAL EN RIESGO DE RENOVACIÓN</span>
          </div>
        </div>

        {/* KPI 3: Ingresos Mes */}
        <div className="p-6 bg-[#1B1B21] border border-[#33333C] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#A5A5AF] uppercase font-medium">
                INGRESOS DEL MES
              </span>
              <span className="px-2 py-0.5 bg-[#1E2E1E] text-[#4ADE80] border border-[#4ADE80]/30 font-mono text-[10px] rounded flex items-center gap-1 font-bold">
                <span>▲</span> MENSUAL
              </span>
            </div>
            <div className="font-display text-6xl text-[#E8B84A] leading-none mb-4">
              {kpis?.ingresosMes?.total || '$0'}
              <span className="font-mono text-xs text-[#A5A5AF] ml-2 tracking-normal font-semibold">USD</span>
            </div>
          </div>
          <div className="pt-3 border-t border-[#33333C] flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-[#A5A5AF]">
            {kpis?.ingresosMes?.desglose?.length > 0 ? (
              kpis.ingresosMes.desglose.map((s) => (
                <span key={s.id}>
                  {s.codigo}: <strong className="text-[#F5EFE0]">${(s.monto / 1000).toFixed(1)}K</strong>
                </span>
              ))
            ) : (
              <>
                <span>NORTE: <strong className="text-[#F5EFE0]">{kpis?.ingresosMes?.norte || '$0K'}</strong></span>
                <span>SUR: <strong className="text-[#F5EFE0]">{kpis?.ingresosMes?.sur || '$0K'}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* KPI 4: Asistencias Hoy */}
        <div className="p-6 bg-[#1B1B21] border border-[#33333C] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#A5A5AF] uppercase font-medium">
                ASISTENCIAS HOY
              </span>
              <span className="px-2 py-0.5 bg-[#1E2E1E] text-[#4ADE80] border border-[#4ADE80]/30 font-mono text-[10px] rounded font-bold">
                EN VIVO
              </span>
            </div>
            <div className="font-display text-6xl text-[#F5EFE0] leading-none mb-4">
              {kpis?.asistenciasHoy?.total ?? 0}
              <span className="font-mono text-xs text-[#A5A5AF] ml-2 tracking-normal font-semibold">ASIST.</span>
            </div>
          </div>
          <div className="pt-3 border-t border-[#33333C] flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-[#A5A5AF]">
            {kpis?.asistenciasHoy?.desglose?.length > 0 ? (
              kpis.asistenciasHoy.desglose.map((s) => (
                <span key={s.id}>
                  {s.codigo}: <strong className="text-[#F5EFE0]">{s.asistencias}</strong> ({s.aforo})
                </span>
              ))
            ) : (
              <>
                <span>NORTE: <strong className="text-[#F5EFE0]">{kpis?.asistenciasHoy?.norte ?? 0}</strong></span>
                <span>SUR: <strong className="text-[#F5EFE0]">{kpis?.asistenciasHoy?.sur ?? 0}</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: CHART + UPCOMING EXPIRATIONS (MATCHING MOCKUP 02) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART PANEL: INGRESOS DIARIOS (Col-span 7) (Mockup 02 + Interactivo) */}
        <div className="lg:col-span-7 p-6 bg-[#1B1B21] border border-[#33333C] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#33333C]">
              <div>
                <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                  INGRESOS DIARIOS · 30 DÍAS
                </h3>
                <div className="font-mono text-[10px] tracking-wider text-[#A5A5AF]">
                  RECAUDACIÓN POR FECHA Y SEDE · INTERACTIVO
                </div>
              </div>
              <div className="font-mono text-xs tracking-wider flex items-center gap-2 text-[#A5A5AF]">
                <span className="px-2 py-0.5 bg-[#141418] border border-[#33333C] text-[#E8B84A] font-bold text-[10px]">
                  {activeBranch === 'TODAS' ? 'AMBAS SEDES' : `SEDE ${activeBranch}`}
                </span>
              </div>
            </div>

            {/* Componente Gráfico Interactivo con Tooltip y Fechas Reales */}
            <div className="mt-4">
              <IngresosChart datosGrafico={datosGrafico} activeBranch={activeBranch} />
            </div>
          </div>

          <div className="pt-4 border-t border-[#33333C] flex justify-between items-center text-xs font-mono text-[#A5A5AF]">
            <span>SINCRONIZACIÓN EN TIEMPO REAL CON MYSQL</span>
            <button
              onClick={() => onNavigateTo && onNavigateTo('reportes')}
              className="text-[#E8B84A] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>GENERAR REPORTE DETALLADO (PDF)</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* TABLE PANEL: POR VENCER · 7D (Col-span 5) (Matching Mockup 02) */}
        <div className="lg:col-span-5 p-6 bg-[#1B1B21] border border-[#33333C] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#33333C]">
              <div>
                <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                  POR VENCER · 7D
                </h3>
                <div className="font-mono text-[10px] tracking-wider text-[#A5A5AF] uppercase">
                  ORDENADO POR URGENCIA DE COBRO
                </div>
              </div>
              <button
                onClick={() => onNavigateTo && onNavigateTo('clientes')}
                className="px-3 py-1 border border-[#A6822D] text-[#E8B84A] hover:bg-[#E8B84A] hover:text-[#1A1206] font-mono text-[10px] tracking-wider font-bold transition-colors"
              >
                VER TODOS ({porVencerLista.length})
              </button>
            </div>

            {/* List of Expiring Memberships */}
            <div className="divide-y divide-[#33333C] mt-2">
              {porVencerLista.slice(0, 6).map((item, idx) => {
                const esCritico = item.diasRestantes <= 2;
                const esAlerta = item.diasRestantes <= 5;

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => onNavigateTo && onNavigateTo('cliente-detalle', item.clienteId)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[#141418] cursor-pointer px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-[#1B1B21] border border-[#40404C] flex items-center justify-center font-display text-xs text-[#E8B84A] shrink-0 font-bold">
                        {item.iniciales}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F5EFE0] truncate">
                          {item.nombre}
                        </div>
                        <div className="font-mono text-[10px] text-[#A5A5AF] truncate">
                          {item.codigo} · {item.plan}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Branch Pill */}
                      <span className={`px-2 py-0.5 font-mono text-[9px] border font-bold ${
                        item.sucursalCode === 'NORTE'
                          ? 'border-[#A6822D] text-[#E8B84A]'
                          : 'border-[#4A6899] text-[#8DB4FF]'
                      }`}>
                        {item.sucursalCode}
                      </span>

                      {/* Urgency Pill */}
                      <div className="text-right w-16">
                        <div className={`font-mono text-xs font-bold leading-tight ${
                          esCritico ? 'text-[#F87171]' : esAlerta ? 'text-[#FBBF24]' : 'text-[#A5A5AF]'
                        }`}>
                          {item.urgencia}
                        </div>
                        <div className="font-mono text-[9px] text-[#A5A5AF]">
                          {item.fechaVence}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#33333C]">
            <button
              onClick={() => onOpenPago && onOpenPago()}
              className="w-full py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold transition-colors"
            >
              + REGISTRAR COBRO RÁPIDO
            </button>
          </div>
        </div>
      </div>

      {/* STREAM DE ASISTENCIAS EN VIVO */}
      <div className="p-6 bg-[#141418] border border-[#33333C]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#33333C]">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-[#A5A5AF] uppercase">
              CONTROL DE ACCESO · RECEPCIÓN
            </div>
            <h4 className="font-display text-xl text-[#F5EFE0] tracking-wider mt-0.5">
              ÚLTIMOS INGRESOS (ESCANEO QR EN VIVO)
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#4ADE80] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping"></span>
              <span>SINCRONIZADO EN TIEMPO REAL</span>
            </div>
            {onOpenCheckIn && (
              <button
                onClick={onOpenCheckIn}
                className="px-3 py-1.5 bg-[#1F1810] border border-[#A6822D] text-[#E8B84A] font-mono text-[10px] tracking-wider font-bold hover:bg-[#E8B84A] hover:text-[#1A1206] transition-colors"
              >
                + ESCANEAR ACCESO
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[#A5A5AF] border-b border-[#33333C] pb-2 font-semibold">
                <th className="py-2.5">SOCIO</th>
                <th className="py-2.5">PLAN ASIGNADO</th>
                <th className="py-2.5">SUCURSAL</th>
                <th className="py-2.5">HORA</th>
                <th className="py-2.5 text-right">MÉTODO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#33333C]">
              {checkIns.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-[#1B1B21] transition-colors">
                  <td className="py-3 font-semibold text-[#F5EFE0]">{row.socio}</td>
                  <td className="py-3 text-[#C4C4CC]">{row.plan}</td>
                  <td className="py-3 text-[#A5A5AF]">{row.sucursal}</td>
                  <td className="py-3 text-[#E8B84A] font-bold">{row.hora}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 bg-[#232329] text-[10px] text-[#F5EFE0] border border-[#40404C] font-semibold">
                      {row.metodo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
