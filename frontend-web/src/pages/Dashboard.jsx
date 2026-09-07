import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Users, AlertTriangle, DollarSign, QrCode, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ activeBranch, onNavigateToSucursales }) {
  const { user } = useAuth();

  // Datos contextuales según filtro de sucursal
  const stats = {
    socios: activeBranch === 'SUR' ? 58 : activeBranch === 'NORTE' ? 84 : 142,
    porVencer: activeBranch === 'SUR' ? 7 : activeBranch === 'NORTE' ? 11 : 18,
    ingresos: activeBranch === 'SUR' ? '$2,410' : activeBranch === 'NORTE' ? '$3,430' : '$5,840',
    asistenciasHoy: activeBranch === 'SUR' ? 26 : activeBranch === 'NORTE' ? 38 : 64,
  };

  const recentCheckIns = [
    { socio: 'Mateo Morales', plan: 'Plan Mensual Boxeo Full', hora: '10:42 AM', sucursal: 'Sede Norte', metodo: 'QR_SCAN', estado: 'ACTIVO' },
    { socio: 'Valeria Castro', plan: 'Plan Trimestral Pro', hora: '10:15 AM', sucursal: 'Sede Sur', metodo: 'QR_SCAN', estado: 'ACTIVO' },
    { socio: 'David Benítez', plan: 'Pase 10 Clases', hora: '09:50 AM', sucursal: 'Sede Norte', metodo: 'QR_SCAN', estado: 'ACTIVO' },
    { socio: 'Estefanía Loor', plan: 'Plan Mensual Boxeo Full', hora: '09:20 AM', sucursal: 'Sede Sur', metodo: 'MANUAL', estado: 'ACTIVO' },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#0B0B0D] min-h-[calc(100vh-85px)]">
      {/* Primer Avance Milestone Banner */}
      <div className="p-4 bg-gradient-to-r from-[#1E293B]/80 to-[#0F172A] border-l-4 border-[#E8B84A] border border-[#2A2A31] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#E8B84A] text-[#1A1206] font-mono text-[9px] font-bold rounded">
              SPRINT 1 — CUMPLIDO
            </span>
            <span className="font-mono text-xs text-[#82828A]">Hito Inicial de Evaluación</span>
          </div>
          <h3 className="font-display text-xl text-[#F5EFE0] tracking-wide mt-1">
            ARQUITECTURA BASE, AUTENTICACIÓN JWT Y CONTROL DE SUCURSALES
          </h3>
          <p className="text-xs text-[#82828A] mt-0.5">
            API REST en Node/Express conectada a MySQL en XAMPP. Documentada en Swagger UI y Web Admin operativa.
          </p>
        </div>
        <button
          onClick={onNavigateToSucursales}
          className="px-4 py-2 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold shrink-0 transition-colors"
        >
          VER GESTIÓN DE SUCURSALES →
        </button>
      </div>

      {/* KPI ROW (MATCHING MOCKUP 02-dashboard.svg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Socios Activos */}
        <div className="p-6 bg-[#1B1B21] border border-[#2A2A31] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E8B84A]"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">SOCIOS ACTIVOS</span>
            <span className="px-2 py-0.5 bg-[#1E2E1E] text-[#4ADE80] font-mono text-[10px] rounded">▲ 12</span>
          </div>
          <div className="font-display text-5xl text-[#F5EFE0] leading-none mb-4">
            {stats.socios}
          </div>
          <div className="pt-3 border-t border-[#2A2A31] flex justify-between font-mono text-[10px] text-[#82828A]">
            <span><strong className="text-[#F5EFE0]">84</strong> NORTE</span>
            <span><strong className="text-[#F5EFE0]">58</strong> SUR</span>
          </div>
        </div>

        {/* KPI 2: Por Vencer 7D */}
        <div className="p-6 bg-[#1B1B21] border border-[#2A2A31] relative">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">POR VENCER · 7D</span>
            <span className="px-2 py-0.5 bg-[#2E2818] text-[#FBBF24] font-mono text-[10px] rounded">▲ 4</span>
          </div>
          <div className="font-display text-5xl text-[#F5EFE0] leading-none mb-4">
            {stats.porVencer}
          </div>
          <div className="pt-3 border-t border-[#2A2A31] flex justify-between font-mono text-[10px] text-[#82828A]">
            <span><strong className="text-[#F5EFE0]">11</strong> MENSUAL</span>
            <span><strong className="text-[#F5EFE0]">7</strong> TRIM.</span>
          </div>
        </div>

        {/* KPI 3: Ingresos Mes */}
        <div className="p-6 bg-[#1B1B21] border border-[#2A2A31] relative">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">INGRESOS DEL MES</span>
            <span className="px-2 py-0.5 bg-[#1E2E1E] text-[#4ADE80] font-mono text-[10px] rounded">+8.4%</span>
          </div>
          <div className="font-display text-5xl text-[#E8B84A] leading-none mb-4">
            {stats.ingresos}
          </div>
          <div className="pt-3 border-t border-[#2A2A31] flex justify-between font-mono text-[10px] text-[#82828A]">
            <span><strong className="text-[#F5EFE0]">$3.4K</strong> NORTE</span>
            <span><strong className="text-[#F5EFE0]">$2.4K</strong> SUR</span>
          </div>
        </div>

        {/* KPI 4: Asistencias Hoy */}
        <div className="p-6 bg-[#1B1B21] border border-[#2A2A31] relative">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">ASISTENCIAS HOY</span>
            <span className="px-2 py-0.5 bg-[#1E2E1E] text-[#4ADE80] font-mono text-[10px] rounded">EN VIVO</span>
          </div>
          <div className="font-display text-5xl text-[#F5EFE0] leading-none mb-4">
            {stats.asistenciasHoy}
          </div>
          <div className="pt-3 border-t border-[#2A2A31] flex justify-between font-mono text-[10px] text-[#82828A]">
            <span>AFORO NORTE: <strong className="text-[#4ADE80]">68%</strong></span>
            <span>SUR: <strong className="text-[#4ADE80]">52%</strong></span>
          </div>
        </div>
      </div>

      {/* RECENT CHECK-INS AND OPERATIONAL HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream de Asistencias Recientes */}
        <div className="lg:col-span-2 p-6 bg-[#141418] border border-[#2A2A31]">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A2A31]">
            <div>
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">CONTROL DE ACCESO</span>
              <h4 className="font-display text-xl text-[#F5EFE0] tracking-wider">ÚLTIMOS INGRESOS (ESCANEO QR)</h4>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#4ADE80]">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping"></span>
              <span>SINCRONIZADO EN TIEMPO REAL</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#82828A] border-b border-[#2A2A31] pb-2">
                  <th className="py-2">SOCIO</th>
                  <th className="py-2">PLAN ASIGNADO</th>
                  <th className="py-2">SUCURSAL</th>
                  <th className="py-2">HORA</th>
                  <th className="py-2 text-right">MÉTODO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A31]">
                {recentCheckIns.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1B1B21] transition-colors">
                    <td className="py-3 font-semibold text-[#F5EFE0]">{row.socio}</td>
                    <td className="py-3 text-[#B8B8BE]">{row.plan}</td>
                    <td className="py-3 text-[#82828A]">{row.sucursal}</td>
                    <td className="py-3 text-[#E8B84A]">{row.hora}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 bg-[#232329] text-[10px] text-[#F5EFE0] border border-[#3A3A42] rounded">
                        {row.metodo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BoxControl Status & Tech Stack Summary Card */}
        <div className="p-6 bg-[#141418] border border-[#2A2A31] flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#E8B84A] uppercase">ESTADO DE ARQUITECTURA</span>
            <h4 className="font-display text-xl text-[#F5EFE0] tracking-wider mb-4">COMPONENTES ACTIVOS</h4>
            
            <ul className="space-y-3 font-mono text-xs">
              <li className="flex items-center justify-between p-2 bg-[#1B1B21] border border-[#2A2A31]">
                <span className="text-[#B8B8BE]">API REST Node.js/Express</span>
                <span className="text-[#4ADE80] font-bold">PORT 4000 ●</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-[#1B1B21] border border-[#2A2A31]">
                <span className="text-[#B8B8BE]">MySQL (XAMPP)</span>
                <span className="text-[#4ADE80] font-bold">PORT 3306 ●</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-[#1B1B21] border border-[#2A2A31]">
                <span className="text-[#B8B8BE]">Swagger UI Documentation</span>
                <span className="text-[#4ADE80] font-bold">ACTIVO ●</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-[#1B1B21] border border-[#2A2A31]">
                <span className="text-[#B8B8BE]">Frontend Web React (Vite)</span>
                <span className="text-[#4ADE80] font-bold">ACTIVO ●</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-[#1B1B21] border border-[#2A2A31]">
                <span className="text-[#B8B8BE]">App Móvil (React Native Expo)</span>
                <span className="text-[#FBBF24] font-bold">SPRINT 3 ⏳</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-6 border-t border-[#2A2A31] text-center">
            <div className="font-mono text-[9px] text-[#82828A]">
              GRUPO 4 · CHACHALO, JIRON, PAREDES
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
