import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  validarCedula, validarNombreOApellido, validarEmail, 
  validarTelefono, validarFechaNacimiento,
  handleKeyDownSoloNumeros, handleKeyDownSoloLetras 
} from '../utils/validators';
import { Search, Plus, Filter, RefreshCw, ChevronRight, User, AlertCircle, Check, X, CheckCircle2 } from 'lucide-react';

export default function Clientes({ onSelectCliente, onOpenNuevoPago, searchQuery, externalBranch, sucursalesList = [] }) {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('TODOS'); // 'TODOS' | 'ACTIVOS' | 'VENCIDOS' | 'NUEVOS'
  const [filterSucursal, setFilterSucursal] = useState('TODAS');
  const [localSearch, setLocalSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tiposMembresia, setTiposMembresia] = useState([]);
  const [sucursales, setSucursales] = useState(sucursalesList);

  // Formulario nuevo socio con validaciones en tiempo real
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: 'M',
    sucursalOrigenId: '1',
    tipoMembresiaId: '',
    metodoPago: 'EFECTIVO',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Sincronizar sucursales
  useEffect(() => {
    if (sucursalesList && sucursalesList.length > 0) {
      setSucursales(sucursalesList);
      if (!formData.sucursalOrigenId) {
        setFormData((prev) => ({ ...prev, sucursalOrigenId: String(sucursalesList[0].id) }));
      }
    } else {
      api.get('/sucursales').then((res) => {
        if (res.data?.success) {
          setSucursales(res.data.data);
          if (res.data.data.length > 0 && !formData.sucursalOrigenId) {
            setFormData((prev) => ({ ...prev, sucursalOrigenId: String(res.data.data[0].id) }));
          }
        }
      }).catch(console.error);
    }
  }, [sucursalesList]);

  // Si el usuario es recepcionista, fijar su sucursal de origen obligatoria
  useEffect(() => {
    if (user?.rol === 'RECEPCIONISTA') {
      const mySucId = String(user.sucursal?.id || user.sucursalId || '1');
      setFilterSucursal(mySucId);
      setFormData((prev) => ({ ...prev, sucursalOrigenId: mySucId }));
    }
  }, [user]);

  // Validaciones en tiempo real
  const validateField = (name, value) => {
    let res = { isValid: true, error: '' };
    switch (name) {
      case 'cedula':
        res = validarCedula(value);
        break;
      case 'nombre':
        res = validarNombreOApellido(value, 'El nombre');
        break;
      case 'apellido':
        res = validarNombreOApellido(value, 'El apellido');
        break;
      case 'email':
        res = validarEmail(value);
        break;
      case 'telefono':
        res = validarTelefono(value);
        break;
      case 'fechaNacimiento':
        res = validarFechaNacimiento(value);
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [name]: res.isValid ? '' : res.error,
    }));
    return res.isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Sincronizar sucursal externa si cambia desde el Topbar
  useEffect(() => {
    if (user?.rol === 'RECEPCIONISTA') {
      const mySucId = String(user.sucursal?.id || user.sucursalId || '1');
      setFilterSucursal(mySucId);
    } else if (externalBranch) {
      setFilterSucursal(externalBranch);
    }
  }, [externalBranch, user]);

  // Sincronizar búsqueda externa
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (localSearch.trim()) params.q = localSearch.trim();
      if (filterSucursal !== 'TODAS') {
        params.sucursalId = filterSucursal;
      }
      if (filterEstado !== 'TODOS') {
        params.estado = filterEstado;
      }

      const res = await api.get('/clientes', { params });
      if (res.data?.success) {
        setClientes(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipos = async () => {
    try {
      const res = await api.get('/tipos-membresia');
      if (res.data?.success) {
        setTiposMembresia(res.data.data.filter((t) => t.estado !== 'INACTIVA'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [filterEstado, filterSucursal, localSearch]);

  useEffect(() => {
    fetchTipos();
  }, []);

  const isFormValid = () => {
    const vCedula = validarCedula(formData.cedula).isValid;
    const vNombre = validarNombreOApellido(formData.nombre, 'Nombre').isValid;
    const vApellido = validarNombreOApellido(formData.apellido, 'Apellido').isValid;
    const vEmail = validarEmail(formData.email).isValid;
    const vTel = !formData.telefono || validarTelefono(formData.telefono).isValid;
    const vFecha = !formData.fechaNacimiento || validarFechaNacimiento(formData.fechaNacimiento).isValid;

    return vCedula && vNombre && vApellido && vEmail && vTel && vFecha;
  };

  const handleCreateSocio = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setModalError('Por favor corrija los campos marcados en rojo antes de continuar.');
      return;
    }

    setSubmitLoading(true);
    setModalError('');

    try {
      const payload = {
        ...formData,
        cedula: formData.cedula.trim(),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono ? formData.telefono.trim() : undefined,
        sucursalOrigenId: Number(formData.sucursalOrigenId),
        tipoMembresiaId: formData.tipoMembresiaId ? Number(formData.tipoMembresiaId) : undefined,
      };

      const res = await api.post('/clientes', payload);
      if (res.data?.success) {
        setShowModal(false);
        setFormData({
          nombre: '',
          apellido: '',
          cedula: '',
          email: '',
          telefono: '',
          fechaNacimiento: '',
          genero: 'M',
          sucursalOrigenId: '1',
          tipoMembresiaId: '',
          metodoPago: 'EFECTIVO',
        });
        setFieldErrors({});
        setFieldTouched({});
        setToastMsg('¡Nuevo socio registrado exitosamente con carnet digital QR verificado!');
        fetchClientes();
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al registrar nuevo socio.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#0B0B0D] min-h-[calc(100vh-75px)] select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-green-950/50 border-l-4 border-green-500 text-green-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Action Bar (Matching Mockup 03) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2A31]">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-[#82828A] uppercase">
            REGISTRO OPERATIVO · {clientes.length} SOCIOS ENCONTRADOS
          </div>
          <h2 className="font-display text-3xl text-[#F5EFE0] tracking-wider mt-0.5">
            SOCIOS DEL CLUB
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, teléfono…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-72 bg-[#141418] border border-[#2A2A31] px-3.5 py-2 pl-9 text-xs font-mono text-[#F5EFE0] placeholder-[#82828A] focus:outline-none focus:border-[#E8B84A]"
            />
            <Search size={14} className="absolute left-3 top-3 text-[#82828A]" />
          </div>

          <button
            onClick={() => {
              setFieldErrors({});
              setFieldTouched({});
              setModalError('');
              setShowModal(true);
            }}
            className="px-5 py-2 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} />
            <span>+ NUEVO SOCIO</span>
          </button>
        </div>
      </div>

      {/* Filters Row (Matching Mockup 03) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[#82828A] uppercase tracking-wider text-[10px]">FILTRAR:</span>

          {/* Status Filter */}
          <div className="flex bg-[#141418] border border-[#2A2A31] p-0.5">
            {['TODOS', 'ACTIVOS', 'VENCIDOS', 'NUEVOS'].map((est) => {
              const isSelected = filterEstado === est;
              return (
                <button
                  key={est}
                  onClick={() => setFilterEstado(est)}
                  className={`px-3 py-1 text-[10px] tracking-wider font-bold transition-all ${
                    isSelected
                      ? 'bg-[#E8B84A] text-[#1A1206]'
                      : 'text-[#82828A] hover:text-[#F5EFE0]'
                  }`}
                >
                  {est}
                </button>
              );
            })}
          </div>

          {/* Branch Filter: Admin can switch, Receptionist has locked branch badge */}
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
                  filterSucursal === b.id ||
                  (filterSucursal === 'NORTE' && b.id === '1') ||
                  (filterSucursal === 'SUR' && b.id === '2');
                return (
                  <button
                    key={b.id}
                    onClick={() => setFilterSucursal(b.id)}
                    className={`px-3 py-1 text-[10px] tracking-wider font-bold transition-all ${
                      isSelected
                        ? 'bg-[#E8B84A] text-[#1A1206]'
                        : 'text-[#82828A] hover:text-[#F5EFE0]'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#141418] border border-[#2A2A31] text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]"></span>
              <span className="text-[#82828A]">SEDE:</span>
              <span className="text-[#E8B84A] font-bold">
                {user?.sucursal?.nombre ? user.sucursal.nombre.toUpperCase().replace('SUCURSAL ', '').replace('SEDE ', '').trim() : 'ASIGNADA'}
              </span>
            </div>
          )}
        </div>

        <div className="text-[#82828A] text-right">
          MOSTRANDO <strong className="text-[#F5EFE0]">{clientes.length}</strong> SOCIOS
        </div>
      </div>

      {/* Main Table (Matching Mockup 03) */}
      <div className="bg-[#1B1B21] border border-[#2A2A31] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#3A3A42] text-[10px] tracking-[0.2em] text-[#82828A] uppercase bg-[#141418]">
                <th className="py-3 px-6">SOCIO</th>
                <th className="py-3 px-6">DOCUMENTO</th>
                <th className="py-3 px-6">MEMBRESÍA</th>
                <th className="py-3 px-6">VENCE</th>
                <th className="py-3 px-6">SUCURSAL</th>
                <th className="py-3 px-6 text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A31]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#82828A]">
                    <RefreshCw className="animate-spin inline mr-2" size={16} />
                    Cargando listado de socios desde MySQL...
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#82828A]">
                    No se encontraron socios con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => {
                  const initials = `${c.nombre?.[0] || 'S'}${c.apellido?.[0] || 'C'}`.toUpperCase();
                  const esCritico = c.diasRestantes !== null && c.diasRestantes <= 2;
                  const esAlerta = c.diasRestantes !== null && c.diasRestantes <= 5;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCliente && onSelectCliente(c.id)}
                      className="hover:bg-[#141418] cursor-pointer transition-colors group"
                    >
                      {/* SOCIO (Avatar + Nombres + Contacto) */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#232329] border border-[#3A3A42] flex items-center justify-center font-display text-sm text-[#E8B84A] shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-sans font-semibold text-sm text-[#F5EFE0] group-hover:text-[#E8B84A] transition-colors flex items-center gap-2">
                              <span>{c.nombreCompleto}</span>
                              {c.estadoUsuario === 'INACTIVO' && (
                                <span className="px-1.5 py-0.5 bg-red-950/80 border border-red-500/80 text-red-300 font-mono text-[9px] font-bold tracking-wider">
                                  DADO DE BAJA
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#82828A]">
                              {c.email} · {c.telefono || 'Sin teléfono'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* DOCUMENTO (Cédula) */}
                      <td className="py-3.5 px-6 text-[#F5EFE0] font-medium">
                        {c.cedula}
                      </td>

                      {/* MEMBRESÍA */}
                      <td className="py-3.5 px-6">
                        <div className="font-sans font-semibold text-xs text-[#F5EFE0]">
                          {c.planActual ? c.planActual.toUpperCase() : 'SIN PLAN'}
                        </div>
                        {c.precioPlan && (
                          <div className="text-[10px] text-[#E8B84A]">
                            ${Number(c.precioPlan).toFixed(0)} / PERIODO
                          </div>
                        )}
                      </td>

                      {/* VENCE (Badge Urgencia) */}
                      <td className="py-3.5 px-6">
                        <div className={`font-bold text-xs ${
                          esCritico ? 'text-[#F87171]' : esAlerta ? 'text-[#FBBF24]' : 'text-[#82828A]'
                        }`}>
                          {c.venceLabel}
                        </div>
                        {c.fechaVencimiento && (
                          <div className="text-[9px] text-[#82828A]">
                            {new Date(c.fechaVencimiento + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                          </div>
                        )}
                      </td>

                      {/* SUCURSAL */}
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-0.5 text-[9px] border ${
                          c.sucursalCode === 'NORTE'
                            ? 'border-[#A6822D] text-[#E8B84A]'
                            : 'border-[#4A6899] text-[#8DB4FF]'
                        }`}>
                          {c.sucursalCode}
                        </span>
                      </td>

                      {/* ACCIÓN */}
                      <td className="py-3.5 px-6 text-right">
                        <span className="text-xl text-[#82828A] group-hover:text-[#E8B84A] transition-colors">
                          ›
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Socio con Validaciones Estrictas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#1B1B21] border border-[#A6822D] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#2A2A31]">
              <div>
                <div className="font-mono text-[9px] tracking-[0.25em] text-[#E8B84A] uppercase">
                  REGISTRO DE CLIENTES · RF-W02
                </div>
                <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                  + REGISTRAR NUEVO SOCIO
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#82828A] hover:text-[#F5EFE0] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSocio} className="space-y-4 font-mono text-xs">
              {/* Nombres y Apellidos (Solo Letras) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">
                    Nombres * {fieldTouched.nombre && !fieldErrors.nombre && <span className="text-green-400">✓</span>}
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    placeholder="Ej: Marco Vinicio"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDownSoloLetras}
                    className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      fieldTouched.nombre && fieldErrors.nombre
                        ? 'border-red-500 focus:border-red-400'
                        : fieldTouched.nombre && !fieldErrors.nombre
                        ? 'border-green-500/70 focus:border-green-400'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {fieldTouched.nombre && fieldErrors.nombre && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">
                    Apellidos * {fieldTouched.apellido && !fieldErrors.apellido && <span className="text-green-400">✓</span>}
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    required
                    placeholder="Ej: Rivera Carrión"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDownSoloLetras}
                    className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      fieldTouched.apellido && fieldErrors.apellido
                        ? 'border-red-500 focus:border-red-400'
                        : fieldTouched.apellido && !fieldErrors.apellido
                        ? 'border-green-500/70 focus:border-green-400'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {fieldTouched.apellido && fieldErrors.apellido && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.apellido}</p>
                  )}
                </div>
              </div>

              {/* Cédula y Teléfono (Solo Números y Validación Módulo 10) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">
                    Cédula Ecuatoriana (10 dígitos) * {fieldTouched.cedula && !fieldErrors.cedula && <span className="text-green-400">✓ Válida</span>}
                  </label>
                  <input
                    type="text"
                    name="cedula"
                    required
                    maxLength="10"
                    placeholder="Ej: 1723456789"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDownSoloNumeros}
                    className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none font-bold tracking-wider transition-colors ${
                      fieldTouched.cedula && fieldErrors.cedula
                        ? 'border-red-500 focus:border-red-400 text-red-300'
                        : fieldTouched.cedula && !fieldErrors.cedula
                        ? 'border-green-500/70 focus:border-green-400 text-green-300'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {fieldTouched.cedula && fieldErrors.cedula && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      <span>{fieldErrors.cedula}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">
                    Teléfono Celular {fieldTouched.telefono && !fieldErrors.telefono && formData.telefono && <span className="text-green-400">✓</span>}
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    maxLength="13"
                    placeholder="Ej: 0991234567"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDownSoloNumeros}
                    className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      fieldTouched.telefono && fieldErrors.telefono
                        ? 'border-red-500 focus:border-red-400'
                        : fieldTouched.telefono && !fieldErrors.telefono && formData.telefono
                        ? 'border-green-500/70 focus:border-green-400'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {fieldTouched.telefono && fieldErrors.telefono && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.telefono}</p>
                  )}
                </div>
              </div>

              {/* Correo y Sucursal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">
                    Correo Electrónico * {fieldTouched.email && !fieldErrors.email && <span className="text-green-400">✓</span>}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Ej: socio@mail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      fieldTouched.email && fieldErrors.email
                        ? 'border-red-500 focus:border-red-400'
                        : fieldTouched.email && !fieldErrors.email
                        ? 'border-green-500/70 focus:border-green-400'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {fieldTouched.email && fieldErrors.email && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Sucursal de Origen *</label>
                  {isAdmin ? (
                    <select
                      name="sucursalOrigenId"
                      value={formData.sucursalOrigenId}
                      onChange={handleInputChange}
                      className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                    >
                      {sucursales.filter((s) => s.estado !== 'INACTIVA').map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} {s.direccion ? `(${s.direccion})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#E8B84A] font-mono text-xs flex items-center justify-between">
                      <span className="font-semibold">{user?.sucursal?.nombre || 'Sede Asignada'}</span>
                      <span className="text-[10px] text-[#82828A] font-normal">(Fijada a tu sede)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fecha Nacimiento y Género */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">
                    Fecha de Nacimiento {fieldTouched.fechaNacimiento && !fieldErrors.fechaNacimiento && formData.fechaNacimiento && <span className="text-green-400">✓</span>}
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      fieldTouched.fechaNacimiento && fieldErrors.fechaNacimiento
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {fieldTouched.fechaNacimiento && fieldErrors.fechaNacimiento && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.fechaNacimiento}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Género</label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              {/* Membresía Inicial Opcional */}
              <div className="pt-4 border-t border-[#2A2A31]">
                <label className="block text-[10px] text-[#E8B84A] mb-2 uppercase font-bold">
                  Asignar Membresía Inicial (Opcional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    name="tipoMembresiaId"
                    value={formData.tipoMembresiaId}
                    onChange={handleInputChange}
                    className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                  >
                    <option value="">-- Sin membresía inicial --</option>
                    {tiposMembresia.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} — ${Number(t.precio).toFixed(0)} ({t.duracionDias} días)
                      </option>
                    ))}
                  </select>

                  {formData.tipoMembresiaId && (
                    <select
                      name="metodoPago"
                      value={formData.metodoPago}
                      onChange={handleInputChange}
                      className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                    >
                      <option value="EFECTIVO">Pago en Efectivo</option>
                      <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                      <option value="TARJETA">Tarjeta de Débito / Crédito</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Acciones del Modal */}
              <div className="pt-4 border-t border-[#2A2A31] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#3A3A42] text-[#82828A] hover:text-[#F5EFE0] font-mono text-xs"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !isFormValid()}
                  className="px-6 py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitLoading ? 'GUARDANDO...' : 'GUARDAR Y GENERAR CARNET QR →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
