import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Plus, RefreshCw, Search, Printer, Calendar, Filter } from 'lucide-react';

export default function Pagos({ onOpenNuevoPago, externalBranch, sucursalesList = [] }) {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sucursales, setSucursales] = useState(sucursalesList);
  const [filterBranch, setFilterBranch] = useState(() => {
    if (!isAdmin && user?.sucursal?.id) return String(user.sucursal.id);
    return 'TODAS';
  });
  const [filterMetodo, setFilterMetodo] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (sucursalesList && sucursalesList.length > 0) {
      setSucursales(sucursalesList);
    } else {
      api.get('/sucursales').then((res) => {
        if (res.data?.success) setSucursales(res.data.data);
      }).catch(console.error);
    }
  }, [sucursalesList]);

  useEffect(() => {
    if (!isAdmin && user?.sucursal?.id) {
      setFilterBranch(String(user.sucursal.id));
    } else if (externalBranch) {
      setFilterBranch(externalBranch);
    }
  }, [externalBranch, isAdmin, user?.sucursal?.id]);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterBranch !== 'TODAS') {
        params.sucursalId = filterBranch;
      }
      if (filterMetodo !== 'TODOS') {
        params.metodoPago = filterMetodo;
      }

      const res = await api.get('/pagos', { params });
      if (res.data?.success) {
        setPagos(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching pagos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, [filterBranch, filterMetodo]);

  const filteredPagos = pagos.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.socio?.toLowerCase().includes(q) ||
      p.cedula?.includes(q) ||
      p.reciboNumero?.toLowerCase().includes(q) ||
      p.plan?.toLowerCase().includes(q)
    );
  });

  const totalRecaudado = filteredPagos.reduce((sum, p) => sum + Number(p.monto), 0);

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#0B0B0D] min-h-[calc(100vh-75px)] select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2A31]">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-[#82828A] uppercase">
            OPERACIÓN · CAJA Y COBROS (RF-W05, RF-W11)
          </div>
          <h2 className="font-display text-3xl text-[#F5EFE0] tracking-wider mt-0.5">
            REGISTRO DE COBROS Y PAGOS
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar socio, recibo, cédula…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-[#141418] border border-[#2A2A31] px-3.5 py-2 pl-9 text-xs font-mono text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
            />
            <Search size={14} className="absolute left-3 top-3 text-[#82828A]" />
          </div>

          <button
            onClick={() => onOpenNuevoPago && onOpenNuevoPago()}
            className="px-5 py-2 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            <span>+ REGISTRAR COBRO</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#1B1B21] border border-[#2A2A31] flex justify-between items-center">
          <div>
            <div className="font-mono text-[9px] tracking-wider text-[#82828A] uppercase">TOTAL COBRADO EN LISTA</div>
            <div className="font-display text-4xl text-[#E8B84A] leading-none mt-1">
              ${totalRecaudado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="font-mono text-xs text-[#82828A] ml-1">USD</span>
            </div>
          </div>
          <DollarSign size={28} className="text-[#E8B84A]/30" />
        </div>

        <div className="p-4 bg-[#1B1B21] border border-[#2A2A31] flex justify-between items-center">
          <div>
            <div className="font-mono text-[9px] tracking-wider text-[#82828A] uppercase">TRANSACCIONES REGISTRADAS</div>
            <div className="font-display text-4xl text-[#F5EFE0] leading-none mt-1">
              {filteredPagos.length}
            </div>
          </div>
          <div className="font-mono text-xs text-[#82828A]">PAGOS</div>
        </div>

        <div className="p-4 bg-[#1B1B21] border border-[#2A2A31] flex justify-between items-center">
          <div>
            <div className="font-mono text-[9px] tracking-wider text-[#82828A] uppercase">TICKET PROMEDIO</div>
            <div className="font-display text-4xl text-[#F5EFE0] leading-none mt-1">
              ${filteredPagos.length > 0 ? (totalRecaudado / filteredPagos.length).toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="font-mono text-xs text-[#82828A]">USD / COBRO</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[#82828A] text-[10px] uppercase tracking-wider">FILTRAR POR:</span>

          {/* Branch */}
          {isAdmin ? (
            <div className="flex bg-[#141418] border border-[#2A2A31] p-0.5">
              {[
                { id: 'TODAS', label: 'TODAS' },
                ...sucursales.map((s) => ({
                  id: String(s.id),
                  label: s.nombre.toUpperCase().replace('SUCURSAL ', '').replace('SEDE ', '').trim(),
                })),
              ].map((b) => {
                const isSelected =
                  filterBranch === b.id ||
                  (filterBranch === 'NORTE' && b.id === '1') ||
                  (filterBranch === 'SUR' && b.id === '2');
                return (
                  <button
                    key={b.id}
                    onClick={() => setFilterBranch(b.id)}
                    className={`px-3 py-1 text-[10px] tracking-wider font-bold transition-all ${
                      isSelected ? 'bg-[#E8B84A] text-[#1A1206]' : 'text-[#82828A] hover:text-[#F5EFE0]'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#141418] border border-[#2A2A31] text-[10px] font-mono text-[#E8B84A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A]"></span>
              <span>SEDE: {user?.sucursal?.nombre?.toUpperCase() || 'MI SUCURSAL'}</span>
            </div>
          )}

          {/* Method */}
          <div className="flex bg-[#141418] border border-[#2A2A31] p-0.5">
            {['TODOS', 'EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMetodo(m)}
                className={`px-2.5 py-1 text-[10px] tracking-wider font-bold transition-all ${
                  filterMetodo === m ? 'bg-[#E8B84A] text-[#1A1206]' : 'text-[#82828A] hover:text-[#F5EFE0]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={fetchPagos}
          className="text-[#82828A] hover:text-[#E8B84A] flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Table of Payments */}
      <div className="bg-[#1B1B21] border border-[#2A2A31] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#3A3A42] text-[10px] tracking-[0.2em] text-[#82828A] uppercase bg-[#141418]">
                <th className="py-3 px-6">RECIBO</th>
                <th className="py-3 px-6">SOCIO / CÉDULA</th>
                <th className="py-3 px-6">PLAN DE BOXEO</th>
                <th className="py-3 px-6">SUCURSAL</th>
                <th className="py-3 px-6">MÉTODO / REF.</th>
                <th className="py-3 px-6">FECHA Y CAJERO</th>
                <th className="py-3 px-6 text-right">MONTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A31]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#82828A]">
                    <RefreshCw className="animate-spin inline mr-2" size={16} />
                    Cargando transacciones desde MySQL...
                  </td>
                </tr>
              ) : filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#82828A]">
                    No se encontraron cobros registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredPagos.map((p) => (
                  <tr key={p.id} className="hover:bg-[#141418] transition-colors">
                    <td className="py-3.5 px-6 font-bold text-[#E8B84A]">
                      {p.reciboNumero}
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="font-sans font-semibold text-sm text-[#F5EFE0]">
                        {p.socio}
                      </div>
                      <div className="text-[10px] text-[#82828A]">
                        CI: {p.cedula}
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-[#B8B8BE]">
                      {p.plan}
                    </td>

                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 text-[9px] border ${
                        p.sucursalCode === 'NORTE'
                          ? 'border-[#A6822D] text-[#E8B84A]'
                          : 'border-[#4A6899] text-[#8DB4FF]'
                      }`}>
                        {p.sucursalCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="text-[#F5EFE0]">{p.metodoPago}</div>
                      <div className="text-[10px] text-[#82828A]">{p.referencia}</div>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="text-[#F5EFE0]">
                        {new Date(p.fechaPago).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-[#82828A]">Cajero: {p.cajero}</div>
                    </td>

                    <td className="py-3.5 px-6 text-right font-display text-xl text-[#F5EFE0]">
                      ${Number(p.monto).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
