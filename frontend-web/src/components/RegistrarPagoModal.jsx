import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { X, Check, DollarSign, Calendar, CreditCard, User, AlertCircle, CheckCircle2, Printer, Search, RefreshCw, UserCheck } from 'lucide-react';
import {
  validarFechaInicioMembresia,
  validarTexto,
} from '../utils/validators';

export default function RegistrarPagoModal({ isOpen, onClose, preselectedClienteId, onSuccess }) {
  const { user } = useAuth();

  const [clientes, setClientes] = useState([]);
  const [tiposMembresia, setTiposMembresia] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedTipoId, setSelectedTipoId] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaInicioError, setFechaInicioError] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [referenciaError, setReferenciaError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reciboEmitido, setReciboEmitido] = useState(null);

  // Estados del Buscador de Socios en Tiempo Real
  const [searchSocioText, setSearchSocioText] = useState('');
  const [isSearchingSocio, setIsSearchingSocio] = useState(false);
  const [socioError, setSocioError] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchContainerRef = useRef(null);

  // Date bounds for UX
  const minDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  // Cerrar menú de búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchingSocio(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setReciboEmitido(null);
      setErrorMsg('');
      setReferencia('');
      setMetodoPago('EFECTIVO');
      setFechaInicio(new Date().toISOString().split('T')[0]);
      setSearchSocioText('');
      setSocioError(null);
      setHighlightedIndex(0);
    }
  }, [isOpen, preselectedClienteId]);

  const loadData = async () => {
    try {
      const [resCli, resTipos, resSuc] = await Promise.all([
        api.get('/clientes'),
        api.get('/tipos-membresia'),
        api.get('/sucursales'),
      ]);

      if (resCli.data?.success) {
        setClientes(resCli.data.data);
        const cliId = preselectedClienteId ? Number(preselectedClienteId) : '';
        setSelectedClienteId(cliId);
        if (cliId) {
          const targetCli = resCli.data.data.find((c) => c.id === cliId);
          if (targetCli) {
            if (targetCli.sucursalId) {
              setSelectedSucursalId(targetCli.sucursalId);
            }
            const hoyStr = new Date().toISOString().split('T')[0];
            if (targetCli.fechaVencimiento && targetCli.fechaVencimiento >= hoyStr && targetCli.estadoMembresia === 'ACTIVO') {
              const fVigente = new Date(targetCli.fechaVencimiento + 'T00:00:00');
              fVigente.setDate(fVigente.getDate() + 1);
              setFechaInicio(fVigente.toISOString().split('T')[0]);
            } else {
              setFechaInicio(hoyStr);
            }
          }
          setIsSearchingSocio(false);
        } else {
          setIsSearchingSocio(true);
        }
      }

      if (resTipos.data?.success) {
        // Solo ofrecer planes de membresía activos para nuevos cobros
        const planesActivos = resTipos.data.data.filter((t) => t.estado !== 'INACTIVA');
        setTiposMembresia(planesActivos);
        if (planesActivos.length > 0) {
          setSelectedTipoId(planesActivos[0].id);
        }
      }

      if (resSuc.data?.success) {
        // Solo ofrecer sucursales activas como sede operativa de caja
        const sucursalesActivas = resSuc.data.data.filter((s) => s.estado !== 'INACTIVA');
        setSucursales(sucursalesActivas);
        if (!selectedSucursalId && sucursalesActivas.length > 0) {
          setSelectedSucursalId(sucursalesActivas[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading data for pago modal:', err);
    }
  };

  // Filtrado reactivo en tiempo real de socios (nombre, apellido, cédula, teléfono, sucursal)
  const filteredClientes = useMemo(() => {
    if (!clientes || clientes.length === 0) return [];
    if (!searchSocioText.trim()) return clientes.slice(0, 10);
    const q = searchSocioText.toLowerCase().trim();
    return clientes.filter((c) => {
      if (c.estadoUsuario === 'INACTIVO') return false;
      const nombreCompleto = (c.nombreCompleto || `${c.nombre || ''} ${c.apellido || ''}`).toLowerCase();
      const cedula = (c.cedula || '').toLowerCase();
      const telefono = (c.telefono || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const sucursal = (c.sucursal || c.sucursalCode || '').toLowerCase();
      return (
        nombreCompleto.includes(q) ||
        cedula.includes(q) ||
        telefono.includes(q) ||
        email.includes(q) ||
        sucursal.includes(q)
      );
    }).slice(0, 20);
  }, [clientes, searchSocioText]);

  const handleSelectCliente = (cliente) => {
    setSelectedClienteId(cliente.id);
    setIsSearchingSocio(false);
    setSearchSocioText('');
    setSocioError(null);
    if (cliente.sucursalId) {
      setSelectedSucursalId(cliente.sucursalId);
    }

    const hoyStr = new Date().toISOString().split('T')[0];
    if (cliente.fechaVencimiento && cliente.fechaVencimiento >= hoyStr && cliente.estadoMembresia === 'ACTIVO') {
      const fVigente = new Date(cliente.fechaVencimiento + 'T00:00:00');
      fVigente.setDate(fVigente.getDate() + 1);
      setFechaInicio(fVigente.toISOString().split('T')[0]);
      setFechaInicioError(null);
    } else {
      setFechaInicio(hoyStr);
      setFechaInicioError(null);
    }
  };

  const handleDeselectCliente = () => {
    setSelectedClienteId('');
    setIsSearchingSocio(true);
    setSearchSocioText('');
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!isSearchingSocio || filteredClientes.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredClientes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredClientes.length) % filteredClientes.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredClientes[highlightedIndex]) {
        handleSelectCliente(filteredClientes[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchingSocio(false);
    }
  };

  if (!isOpen) return null;

  const currentCliente = clientes.find((c) => c.id === Number(selectedClienteId));
  const currentTipo = tiposMembresia.find((t) => t.id === Number(selectedTipoId));

  const hoyStr = new Date().toISOString().split('T')[0];
  const esRenovacionAcumulada =
    currentCliente &&
    currentCliente.estadoMembresia === 'ACTIVO' &&
    currentCliente.fechaVencimiento &&
    currentCliente.fechaVencimiento >= hoyStr;

  // Calcular fecha de vencimiento automática
  const calcularVencimiento = () => {
    if (!fechaInicio || !currentTipo) return '—';
    const f = new Date(fechaInicio + 'T00:00:00');
    f.setDate(f.getDate() + Number(currentTipo.duracionDias));
    return f.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  };

  const handleFechaInicioChange = (val) => {
    setFechaInicio(val);
    const res = validarFechaInicioMembresia(val);
    setFechaInicioError(res.isValid ? null : res.error);
  };

  const handleReferenciaChange = (val) => {
    const sanitized = val.replace(/[^A-Za-z0-9\-_\/.]/g, '');
    setReferencia(sanitized);
    if (metodoPago !== 'EFECTIVO') {
      if (!sanitized.trim()) {
        setReferenciaError('El número de comprobante o referencia es obligatorio');
      } else if (sanitized.trim().length < 3) {
        setReferenciaError('La referencia debe contener al menos 3 caracteres alfanuméricos');
      } else {
        setReferenciaError(null);
      }
    } else {
      setReferenciaError(null);
    }
  };

  const handleMetodoChange = (met) => {
    setMetodoPago(met);
    if (met === 'EFECTIVO') {
      setReferenciaError(null);
    } else {
      if (!referencia.trim() || referencia.trim().length < 3) {
        setReferenciaError('El número de comprobante/referencia es obligatorio para ' + met.toLowerCase());
      } else {
        setReferenciaError(null);
      }
    }
  };

  const handleConfirmarCobro = async (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      setSocioError('Debe buscar y seleccionar un socio para registrar el cobro.');
      setIsSearchingSocio(true);
      setErrorMsg('Por favor busque y seleccione un socio antes de continuar.');
      return;
    }
    if (!selectedTipoId) {
      setErrorMsg('Por favor seleccione un plan de membresía.');
      return;
    }

    const resFec = validarFechaInicioMembresia(fechaInicio);
    const fechaErr = resFec.isValid ? null : resFec.error;
    setFechaInicioError(fechaErr);

    let refErr = null;
    if (metodoPago !== 'EFECTIVO') {
      if (!referencia.trim() || referencia.trim().length < 3) {
        refErr = 'Debe indicar un comprobante o número de transferencia válido (mín. 3 caracteres)';
        setReferenciaError(refErr);
      }
    }

    if (fechaErr || refErr) {
      setErrorMsg('Corrija los campos señalados antes de procesar el cobro.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        clienteId: Number(selectedClienteId),
        tipoMembresiaId: Number(selectedTipoId),
        sucursalId: Number(selectedSucursalId) || currentCliente?.sucursalId || user?.sucursal?.id || 1,
        monto: Number(currentTipo?.precio || 0),
        metodoPago,
        referencia: referencia.trim() || undefined,
        fechaInicio,
      };

      const res = await api.post('/pagos', payload);
      if (res.data?.success) {
        setReciboEmitido(res.data.data);
        if (onSuccess) onSuccess(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al procesar el cobro.');
    } finally {
      setLoading(false);
    }
  };

  const sucursalNombre = user?.sucursal?.nombre || currentCliente?.sucursal || 'Sucursal Norte';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#1B1B21] border border-[#A6822D] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#2A2A31] flex items-center justify-between bg-[#141418]">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-[#E8B84A] uppercase">
              — NUEVO REGISTRO / CAJA
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-[#F5EFE0] tracking-wider mt-0.5">
              REGISTRAR PAGO Y MEMBRESÍA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {reciboEmitido ? (
          /* PANTALLA DE COMPROBANTE / ÉXITO */
          <div className="p-8 space-y-6 overflow-y-auto">
            <div className="p-6 bg-[#0F1F14] border border-[#4ADE80]/50 text-center space-y-3">
              <CheckCircle2 size={48} className="mx-auto text-[#4ADE80]" />
              <h3 className="font-display text-3xl text-[#4ADE80] tracking-wider">
                ¡COBRO REGISTRADO CON ÉXITO!
              </h3>
              <p className="text-sm text-[#F5EFE0]">
                El pago ha sido acreditado en MySQL y la membresía del socio fue activada automáticamente.
              </p>
            </div>

            {/* Recibo Card */}
            <div className="p-6 bg-[#141418] border border-[#3A3A42] max-w-md mx-auto font-mono text-xs space-y-3">
              <div className="text-center pb-3 border-b border-[#2A2A31]">
                <div className="font-bold text-[#F5EFE0] text-sm">CLUB DE BOXEO GUANTE DORADO</div>
                <div className="text-[10px] text-[#82828A]">RECIBO DE CAJA {reciboEmitido.reciboNumero}</div>
              </div>

              <div className="flex justify-between py-1 border-b border-[#2A2A31]">
                <span className="text-[#82828A]">Socio:</span>
                <span className="text-[#F5EFE0] font-bold">{reciboEmitido.cliente?.nombreCompleto}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A2A31]">
                <span className="text-[#82828A]">Cédula:</span>
                <span className="text-[#F5EFE0]">{reciboEmitido.cliente?.cedula}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A2A31]">
                <span className="text-[#82828A]">Plan Asignado:</span>
                <span className="text-[#E8B84A] font-bold">{reciboEmitido.membresia?.plan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A2A31]">
                <span className="text-[#82828A]">Vigencia:</span>
                <span className="text-[#4ADE80]">{reciboEmitido.membresia?.fechaInicio} al {reciboEmitido.membresia?.fechaFin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A2A31]">
                <span className="text-[#82828A]">Método de Pago:</span>
                <span className="text-[#F5EFE0]">{reciboEmitido.metodoPago}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-[#E8B84A] text-sm font-bold">
                <span className="text-[#E8B84A]">TOTAL COBRADO:</span>
                <span className="text-[#E8B84A] text-base">${Number(reciboEmitido.monto).toFixed(2)} USD</span>
              </div>
              <div className="text-[10px] text-[#82828A] text-center pt-2">
                Atendido por: {reciboEmitido.cajero}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 border border-[#A6822D] bg-[#1F1810] text-[#E8B84A] hover:bg-[#E8B84A] hover:text-[#1A1206] font-display text-sm tracking-wider font-bold flex items-center gap-2 transition-colors"
              >
                <Printer size={16} />
                <span>IMPRIMIR COMPROBANTE</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#E8B84A] text-[#1A1206] font-display text-sm tracking-wider font-bold hover:bg-[#D4A538] transition-colors"
              >
                FINALIZAR
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE COBRO SPLIT (MATCHING MOCKUP 05) */
          <form onSubmit={handleConfirmarCobro} className="flex-1 flex flex-col md:flex-row overflow-y-auto">
            {/* Columna Izquierda: Parámetros del Cobro */}
            <div className="flex-1 p-6 md:p-8 space-y-6 border-b md:border-b-0 md:border-r border-[#2A2A31]">
              {/* Buscador de Socio en Tiempo Real */}
              <div>
                {currentCliente ? (
                  /* SOCIO SELECCIONADO (Tarjeta Dorada) */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">
                        SOCIO SELECCIONADO *
                      </label>
                      <button
                        type="button"
                        onClick={handleDeselectCliente}
                        className="font-mono text-[10px] text-[#E8B84A] hover:text-[#FFD770] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Search size={12} />
                        <span>BUSCAR OTRO SOCIO</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-[#141418] border-2 border-[#E8B84A] shadow-lg flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-[#232329] border border-[#E8B84A] flex items-center justify-center font-display text-base text-[#E8B84A] shrink-0">
                          {currentCliente.nombre?.[0] || 'S'}{currentCliente.apellido?.[0] || 'C'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-[#F5EFE0] truncate">
                              {currentCliente.nombreCompleto}
                            </span>
                            <span className={`px-2 py-0.5 font-mono text-[9px] font-bold border ${
                              currentCliente.estadoMembresia === 'ACTIVO'
                                ? 'border-[#4ADE80]/40 text-[#4ADE80] bg-[#0F1F14]'
                                : 'border-[#F87171]/40 text-[#F87171] bg-[#2E1818]'
                            }`}>
                              {currentCliente.estadoMembresia || currentCliente.estado || 'SIN PLAN'}
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-[#A5A5AF] mt-0.5 truncate">
                            CI: <strong className="text-[#E8B84A]">{currentCliente.cedula}</strong>
                            {currentCliente.telefono && ` · Tel: ${currentCliente.telefono}`}
                            {' · '}{currentCliente.sucursal || `Sede ${currentCliente.sucursalCode || ''}`}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeselectCliente}
                        className="px-2.5 py-1.5 border border-[#3A3A42] bg-[#232329] hover:bg-[#E8B84A] hover:text-[#1A1206] text-[#A5A5AF] font-mono text-[10px] font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                        title="Cambiar de socio"
                      >
                        <RefreshCw size={12} />
                        <span>CAMBIAR</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* BUSCADOR EN TIEMPO REAL */
                  <div ref={searchContainerRef} className="relative">
                    <label className="block font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase mb-2">
                      BUSCAR SOCIO A COBRAR *
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#82828A]" />
                      <input
                        type="text"
                        value={searchSocioText}
                        onChange={(e) => {
                          setSearchSocioText(e.target.value);
                          setIsSearchingSocio(true);
                          setHighlightedIndex(0);
                          if (socioError) setSocioError(null);
                        }}
                        onFocus={() => setIsSearchingSocio(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escriba nombre, apellido, cédula (CI) o teléfono..."
                        className={`w-full bg-[#141418] border ${
                          socioError ? 'border-red-500 ring-1 ring-red-500' : 'border-[#3A3A42]'
                        } pl-10 pr-10 py-2.5 font-mono text-xs text-[#F5EFE0] placeholder-[#66666E] focus:outline-none focus:border-[#E8B84A] transition-colors`}
                        autoFocus={!preselectedClienteId}
                      />
                      {searchSocioText && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchSocioText('');
                            setIsSearchingSocio(true);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#82828A] hover:text-[#F5EFE0] p-1"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {socioError && (
                      <div className="text-[11px] text-red-400 font-mono mt-1.5 flex items-center gap-1.5">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{socioError}</span>
                      </div>
                    )}

                    {/* Menú Flotante Autocomplete */}
                    {isSearchingSocio && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[#18181E] border border-[#E8B84A] shadow-2xl z-40 max-h-64 overflow-y-auto divide-y divide-[#2A2A33]">
                        {filteredClientes.length > 0 ? (
                          filteredClientes.map((c, idx) => {
                            const isHighlighted = idx === highlightedIndex;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelectCliente(c)}
                                onMouseEnter={() => setHighlightedIndex(idx)}
                                className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors cursor-pointer ${
                                  isHighlighted ? 'bg-[#262633]' : 'hover:bg-[#202029]'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-xs bg-[#232329] border border-[#3A3A42] flex items-center justify-center font-display text-xs text-[#E8B84A] shrink-0">
                                  {c.nombre?.[0] || 'S'}{c.apellido?.[0] || 'C'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-xs text-[#F5EFE0] truncate flex items-center gap-1.5">
                                    <span>{c.nombreCompleto}</span>
                                    <span className="text-[10px] text-[#A5A5AF] font-mono font-normal">
                                      · {c.sucursal || `Sede ${c.sucursalCode || ''}`}
                                    </span>
                                  </div>
                                  <div className="font-mono text-[10px] text-[#82828A] truncate">
                                    CI: <strong className="text-[#F5EFE0]">{c.cedula}</strong>
                                    {c.telefono && ` · Tel: ${c.telefono}`}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold border ${
                                    c.estadoMembresia === 'ACTIVO'
                                      ? 'border-[#4ADE80]/30 text-[#4ADE80] bg-[#0F1F14]'
                                      : 'border-[#F87171]/30 text-[#F87171] bg-[#291415]'
                                  }`}>
                                    {c.estadoMembresia || c.estado || 'SIN PLAN'}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center font-mono text-xs text-[#82828A]">
                            No se encontraron socios que coincidan con &ldquo;{searchSocioText}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selector de Sede / Sucursal */}
              {sucursales.length > 0 && (
                <div>
                  <label className="block font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase mb-1.5">
                    SEDE / SUCURSAL DEL COBRO
                  </label>
                  {user?.rol === 'ADMINISTRADOR' ? (
                    <select
                      value={selectedSucursalId}
                      onChange={(e) => setSelectedSucursalId(e.target.value)}
                      className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 font-mono text-xs text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A] transition-colors"
                    >
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} {s.direccion ? `(${s.direccion})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#E8B84A] font-mono text-xs flex items-center justify-between">
                      <span className="font-semibold">{user?.sucursal?.nombre || 'Tu Sede Operativa'}</span>
                      <span className="text-[10px] text-[#82828A]">(Caja de tu sede)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Selector de Tipo de Membresía (Cards) */}
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase mb-2">
                  TIPO DE MEMBRESÍA
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tiposMembresia.map((t) => {
                    const isSelected = Number(selectedTipoId) === t.id;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTipoId(t.id)}
                        className={`p-3.5 border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1F1810] border-[#E8B84A] shadow-md'
                            : 'bg-[#141418] border-[#3A3A42] hover:border-[#82828A]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-display text-lg tracking-wider ${isSelected ? 'text-[#E8B84A]' : 'text-[#F5EFE0]'}`}>
                            {t.nombre.toUpperCase()}
                          </span>
                          {isSelected && <span className="font-mono text-xs text-[#E8B84A]">✓</span>}
                        </div>
                        <div className="font-mono text-[10px] text-[#82828A] my-1">
                          {t.duracionDias} DÍAS
                        </div>
                        <div className="font-display text-2xl text-[#F5EFE0] mt-1">
                          ${Number(t.precio).toFixed(0)}
                          <span className="font-mono text-[10px] text-[#82828A] ml-1">USD</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notificación visual de Renovación Acumulativa */}
              {esRenovacionAcumulada && (
                <div className="p-3 bg-[#1F1810] border-l-4 border-[#E8B84A] text-[#E8B84A] font-mono text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#E8B84A]" />
                  <div>
                    <span className="font-bold tracking-wider">RENOVACIÓN ACUMULATIVA:</span> El socio cuenta con una membresía activa hasta el{' '}
                    <strong className="text-[#F5EFE0]">
                      {new Date(currentCliente.fechaVencimiento + 'T00:00:00').toLocaleDateString('es-EC', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).toUpperCase()}
                    </strong>.
                    <div className="text-[11px] text-[#CAC6B9] mt-0.5">
                      El nuevo periodo iniciará automáticamente a continuación (<strong>{fechaInicio}</strong>) conservando íntegros sus días vigentes restantes.
                    </div>
                  </div>
                </div>
              )}

              {/* Fechas de Vigencia con validación de rango */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">
                      FECHA DE INICIO *
                    </label>
                    {!fechaInicioError && (
                      <span className="text-[#4ADE80] font-mono text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Válida
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={fechaInicio}
                    onChange={(e) => handleFechaInicioChange(e.target.value)}
                    className={`w-full bg-[#141418] border px-3.5 py-2 font-mono text-xs text-[#F5EFE0] focus:outline-none transition-colors ${
                      fechaInicioError ? 'border-red-500 bg-red-950/20' : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {fechaInicioError && (
                    <span className="text-red-400 font-mono text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {fechaInicioError}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-[0.2em] text-[#E8B84A] uppercase mb-1.5">
                    VENCE (CÁLCULO AUTO)
                  </label>
                  <div className="w-full bg-[#141418] border border-[#A6822D]/60 px-3.5 py-2 font-mono text-xs text-[#E8B84A] font-bold">
                    {calcularVencimiento()}
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase mb-2">
                  MÉTODO DE PAGO
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].map((met) => {
                    const isSelected = metodoPago === met;
                    return (
                      <button
                        key={met}
                        type="button"
                        onClick={() => handleMetodoChange(met)}
                        className={`py-2 px-3 border font-mono text-xs tracking-wider transition-all ${
                          isSelected
                            ? 'bg-[#1F1810] border-[#E8B84A] text-[#E8B84A] font-bold'
                            : 'bg-[#141418] border-[#3A3A42] text-[#82828A] hover:text-[#F5EFE0]'
                        }`}
                      >
                        {isSelected ? `✓ ${met}` : met}
                      </button>
                    );
                  })}
                </div>

                {metodoPago !== 'EFECTIVO' && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-mono text-[#82828A] uppercase">
                        Nº de Comprobante / Referencia ({metodoPago}) *
                      </label>
                      {!referenciaError && referencia.trim().length >= 3 && (
                        <span className="text-[#4ADE80] font-mono text-[10px] flex items-center gap-0.5">
                          <CheckCircle2 size={10} /> Válido
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Ej: DEP-948274 ó TRANSF-0012"
                      value={referencia}
                      onChange={(e) => handleReferenciaChange(e.target.value)}
                      className={`w-full bg-[#141418] border px-3.5 py-2 font-mono text-xs text-[#F5EFE0] focus:outline-none transition-colors ${
                        referenciaError ? 'border-red-500 bg-red-950/20' : 'border-[#3A3A42] focus:border-[#E8B84A]'
                      }`}
                    />
                    {referenciaError && (
                      <span className="text-red-400 font-mono text-[10px] mt-1 block flex items-center gap-1">
                        <AlertCircle size={10} /> {referenciaError}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Resumen de Caja (Matching Mockup 05) */}
            <div className="w-full md:w-80 p-6 md:p-8 bg-[#141418] flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-[#82828A] uppercase pb-3 border-b border-[#2A2A31]">
                  RESUMEN DE COBRO
                </div>

                <div className="space-y-3 py-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#82828A]">Socio:</span>
                    <span className={`font-bold truncate max-w-[150px] ${currentCliente ? 'text-[#F5EFE0]' : 'text-[#E8B84A] italic'}`}>
                      {currentCliente?.nombreCompleto || 'Sin seleccionar'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#82828A]">Membresía:</span>
                    <span className="text-[#F5EFE0] font-bold">
                      ${Number(currentTipo?.precio || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#82828A]">Cargo por sucursal:</span>
                    <span className="text-[#82828A]">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#82828A]">Descuento aplicado:</span>
                    <span className="text-[#82828A]">—</span>
                  </div>

                  <div className="pt-4 border-t border-[#3A3A42]">
                    <div className="font-mono text-[10px] tracking-wider text-[#82828A] uppercase">
                      TOTAL A COBRAR
                    </div>
                    <div className="font-display text-5xl text-[#E8B84A] leading-none mt-1">
                      ${Number(currentTipo?.precio || 0).toFixed(0)}
                      <span className="font-mono text-sm text-[#82828A] ml-2">USD</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2A2A31] space-y-1 font-mono text-[10px] text-[#82828A]">
                  <div>RECIBO PROVISIONAL: Nº R-AUTO</div>
                  <div>CAJA: {sucursalNombre.toUpperCase()}</div>
                  <div>CAJERO: {user?.nombre?.toUpperCase()} {user?.apellido?.toUpperCase()}</div>
                </div>

                {errorMsg && (
                  <div className="mt-4 p-2.5 bg-red-950/40 border border-red-500/50 text-red-300 font-mono text-[11px] flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Botón de Confirmación con Deshabilitación Reactiva */}
              <div className="pt-6 border-t border-[#2A2A31]">
                <button
                  type="submit"
                  disabled={loading || !currentTipo || !currentCliente || !!fechaInicioError || !!referenciaError}
                  className="w-full py-3.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-lg tracking-wider font-bold transition-all disabled:opacity-50"
                >
                  {loading
                    ? 'PROCESANDO COBRO...'
                    : `CONFIRMAR COBRO · $${Number(currentTipo?.precio || 0).toFixed(0)} →`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
