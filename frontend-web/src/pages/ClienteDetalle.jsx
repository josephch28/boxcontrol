import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ArrowLeft, Edit, CreditCard, DollarSign, Calendar, 
  Phone, Mail, MapPin, User, CheckCircle2, AlertTriangle, 
  Download, Printer, RefreshCw, X, ShieldCheck, QrCode, AlertCircle, Trash2
} from 'lucide-react';
import {
  validarCedula,
  validarNombreOApellido,
  validarEmail,
  validarTelefono,
  validarFechaNacimiento,
  handleKeyDownSoloNumeros,
  handleKeyDownSoloLetras,
} from '../utils/validators';
import { ConfirmModal, AlertModal } from '../components/ModalAlert';

export default function ClienteDetalle({ clienteId, onBack, onOpenPago, sucursalesList = [] }) {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pagos'); // 'pagos' | 'asistencias' | 'renovacion'
  
  // Modal Editar Socio
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    genero: 'M',
    fechaNacimiento: '',
    sucursalOrigenId: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [modalError, setModalError] = useState('');

  // Modal Editar / Asignar Membresía
  const [showMembresiaModal, setShowMembresiaModal] = useState(false);
  const [membresiaForm, setMembresiaForm] = useState({
    id: null,
    tipoMembresiaId: '',
    sucursalId: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'ACTIVA',
  });
  const [membresiaLoading, setMembresiaLoading] = useState(false);
  const [membresiaModalError, setMembresiaModalError] = useState('');
  const [tiposMembresia, setTiposMembresia] = useState([]);
  const [sucursales, setSucursales] = useState(sucursalesList);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', subtitle: '', message: '', type: 'error' });

  const validateField = (name, value) => {
    let res = { isValid: true, error: '' };
    switch (name) {
      case 'nombre':
        res = validarNombreOApellido(value, 'El nombre');
        break;
      case 'apellido':
        res = validarNombreOApellido(value, 'El apellido');
        break;
      case 'cedula':
        res = validarCedula(value);
        break;
      case 'email':
        res = validarEmail(value);
        break;
      case 'telefono':
        res = validarTelefono(value);
        break;
      case 'fechaNacimiento':
        if (value) {
          res = validarFechaNacimiento(value);
        }
        break;
      default:
        break;
    }
    const err = res.isValid ? '' : res.error;
    setFormErrors((prev) => ({ ...prev, [name]: err }));
    return res.isValid;
  };

  const handleFieldChange = (name, value) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, editForm[name]);
  };

  const validateAll = () => {
    const rNom = validarNombreOApellido(editForm.nombre, 'El nombre');
    const rApe = validarNombreOApellido(editForm.apellido, 'El apellido');
    const rCed = validarCedula(editForm.cedula);
    const rEma = validarEmail(editForm.email);
    const rTel = validarTelefono(editForm.telefono);
    const rFec = editForm.fechaNacimiento ? validarFechaNacimiento(editForm.fechaNacimiento) : { isValid: true, error: '' };

    const errors = {
      nombre: rNom.isValid ? '' : rNom.error,
      apellido: rApe.isValid ? '' : rApe.error,
      cedula: rCed.isValid ? '' : rCed.error,
      email: rEma.isValid ? '' : rEma.error,
      telefono: rTel.isValid ? '' : rTel.error,
      fechaNacimiento: rFec.isValid ? '' : rFec.error,
    };
    setFormErrors(errors);
    setTouched({
      nombre: true,
      apellido: true,
      cedula: true,
      email: true,
      telefono: true,
      fechaNacimiento: true,
    });
    return Object.values(errors).every((e) => e === '');
  };

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clientes/${clienteId}`);
      if (res.data?.success) {
        setCliente(res.data.data);
        setEditForm({
          nombre: res.data.data.usuario?.nombre || '',
          apellido: res.data.data.usuario?.apellido || '',
          email: res.data.data.usuario?.email || '',
          telefono: res.data.data.usuario?.telefono || '',
          cedula: res.data.data.cedula || '',
          genero: res.data.data.genero || 'M',
          fechaNacimiento: res.data.data.fechaNacimiento || '',
          sucursalOrigenId: res.data.data.sucursalOrigenId || 1,
        });
        setFormErrors({});
        setTouched({});
        setModalError('');
      }
    } catch (err) {
      console.error('Error fetching cliente detalle:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clienteId) {
      fetchDetalle();
    }
  }, [clienteId]);

  useEffect(() => {
    api.get('/tipos-membresia').then((res) => {
      if (res.data?.success) setTiposMembresia(res.data.data.filter((t) => t.estado !== 'INACTIVA'));
    }).catch(console.error);

    if (sucursalesList && sucursalesList.length > 0) {
      setSucursales(sucursalesList.filter((s) => s.estado !== 'INACTIVA'));
    } else {
      api.get('/sucursales').then((res) => {
        if (res.data?.success) setSucursales(res.data.data.filter((s) => s.estado !== 'INACTIVA'));
      }).catch(console.error);
    }
  }, [sucursalesList]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setModalError('Existen errores en el formulario. Por favor corríjalos antes de guardar.');
      return;
    }

    setEditLoading(true);
    setModalError('');
    try {
      const res = await api.put(`/clientes/${clienteId}`, editForm);
      if (res.data?.success) {
        setShowEditModal(false);
        setFeedbackMsg('Datos del socio actualizados exitosamente en MySQL.');
        fetchDetalle();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al actualizar el socio.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenEditMembresia = (m = null) => {
    const targetM = m || cliente?.membresiaActual;
    if (targetM) {
      setMembresiaForm({
        id: targetM.id,
        tipoMembresiaId: targetM.tipoMembresiaId || (tiposMembresia[0]?.id || ''),
        sucursalId: targetM.sucursalId || cliente?.sucursalOrigenId || (sucursales[0]?.id || 1),
        fechaInicio: targetM.fechaInicio ? targetM.fechaInicio.split('T')[0] : new Date().toISOString().split('T')[0],
        fechaFin: targetM.fechaFin ? targetM.fechaFin.split('T')[0] : '',
        estado: targetM.estado || 'ACTIVA',
      });
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      const tipoDef = tiposMembresia[0];
      const fin = new Date();
      fin.setDate(fin.getDate() + (tipoDef?.duracionDias || 30));
      setMembresiaForm({
        id: null,
        tipoMembresiaId: tipoDef?.id || '',
        sucursalId: cliente?.sucursalOrigenId || (sucursales[0]?.id || 1),
        fechaInicio: hoy,
        fechaFin: fin.toISOString().split('T')[0],
        estado: 'ACTIVA',
      });
    }
    setMembresiaModalError('');
    setShowMembresiaModal(true);
  };

  const handleMembresiaTipoChange = (newTipoId) => {
    const tipo = tiposMembresia.find((t) => t.id === Number(newTipoId));
    setMembresiaForm((prev) => {
      let fin = prev.fechaFin;
      if (prev.fechaInicio && tipo) {
        const d = new Date(prev.fechaInicio + 'T00:00:00');
        d.setDate(d.getDate() + Number(tipo.duracionDias));
        fin = d.toISOString().split('T')[0];
      }
      return {
        ...prev,
        tipoMembresiaId: Number(newTipoId),
        fechaFin: fin,
      };
    });
  };

  const handleSaveMembresia = async (e) => {
    e.preventDefault();
    if (!membresiaForm.tipoMembresiaId || !membresiaForm.fechaInicio || !membresiaForm.fechaFin) {
      setMembresiaModalError('Complete los campos obligatorios.');
      return;
    }

    setMembresiaLoading(true);
    setMembresiaModalError('');
    try {
      if (membresiaForm.id) {
        // Actualizar membresía existente vía PUT /api/membresias/:id
        const res = await api.put(`/membresias/${membresiaForm.id}`, {
          tipoMembresiaId: Number(membresiaForm.tipoMembresiaId),
          sucursalId: Number(membresiaForm.sucursalId),
          fechaInicio: membresiaForm.fechaInicio,
          fechaFin: membresiaForm.fechaFin,
          estado: membresiaForm.estado,
        });
        if (res.data?.success) {
          setShowMembresiaModal(false);
          setFeedbackMsg('Membresía actualizada con éxito en MySQL.');
          fetchDetalle();
          setTimeout(() => setFeedbackMsg(''), 4000);
        }
      } else {
        // Asignar nueva membresía
        const res = await api.post('/pagos', {
          clienteId: cliente.id,
          tipoMembresiaId: Number(membresiaForm.tipoMembresiaId),
          sucursalId: Number(membresiaForm.sucursalId),
          monto: Number(tiposMembresia.find((t) => t.id === Number(membresiaForm.tipoMembresiaId))?.precio || 0),
          metodoPago: 'EFECTIVO',
          referencia: 'ASIGNACIÓN_ADMIN',
          fechaInicio: membresiaForm.fechaInicio,
        });
        if (res.data?.success) {
          setShowMembresiaModal(false);
          setFeedbackMsg('Nueva membresía asignada exitosamente.');
          fetchDetalle();
          setTimeout(() => setFeedbackMsg(''), 4000);
        }
      }
    } catch (err) {
      setMembresiaModalError(err.response?.data?.message || err.message || 'Error al guardar la membresía.');
    } finally {
      setMembresiaLoading(false);
    }
  };

  const handleToggleDeleteSocio = () => {
    if (!cliente) return;
    setShowConfirmDeleteModal(true);
  };

  const executeToggleDeleteSocio = async () => {
    setShowConfirmDeleteModal(false);
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/clientes/${clienteId}`);
      if (res.data?.success) {
        setFeedbackMsg(res.data.message || `Estado del socio modificado.`);
        fetchDetalle();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'ERROR EN OPERACIÓN',
        subtitle: 'ADMINISTRACIÓN DE SOCIOS · RF-W02',
        message: err.response?.data?.message || 'Error al modificar estado del socio.',
        type: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#82828A] font-mono">
        <RefreshCw className="animate-spin inline mr-2" size={20} />
        Cargando perfil completo del socio desde MySQL...
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-red-400 font-mono text-sm">Socio no encontrado</div>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-[#A6822D] text-[#E8B84A] font-mono text-xs"
        >
          ← Volver al listado
        </button>
      </div>
    );
  }

  const initials = `${cliente.usuario?.nombre?.[0] || 'S'}${cliente.usuario?.apellido?.[0] || 'C'}`.toUpperCase();
  const membresia = cliente.membresiaActual;
  const esActivo = cliente.estadoMembresia === 'ACTIVO';
  const asistencias = cliente.asistencias || [];
  const pagos = cliente.pagos || [];
  const ultIngreso = asistencias[0]
    ? `${new Date(asistencias[0].fechaHora).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }).toUpperCase()} · ${new Date(asistencias[0].fechaHora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`
    : 'SIN REGISTRO';

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#0B0B0D] min-h-[calc(100vh-75px)] select-none">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="p-3 bg-green-950/50 border-l-4 border-green-500 text-green-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Breadcrumb Navigation (Matching Mockup 04) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2A2A31]">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={onBack}
            className="text-[#82828A] hover:text-[#E8B84A] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>SOCIOS</span>
          </button>
          <span className="text-[#E8B84A]">/</span>
          <span className="text-[#F5EFE0] font-bold uppercase">{cliente.nombreCompleto}</span>
        </div>

        <div className="font-mono text-[10px] tracking-wider text-[#82828A]">
          ÚLT. INGRESO: <strong className="text-[#F5EFE0]">{ultIngreso}</strong>
        </div>
      </div>

      {/* Profile Header Block (Matching Mockup 04) */}
      <div className="p-6 bg-[#141418] border border-[#2A2A31] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Big Avatar */}
          <div className="w-20 h-20 bg-[#232329] border-2 border-[#E8B84A] flex items-center justify-center font-display text-4xl text-[#E8B84A] shrink-0">
            {initials}
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-[#E8B84A] uppercase">
              — SOCIO #GD-{cliente.id.toString().padStart(4, '0')}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#F5EFE0] tracking-wider mt-0.5">
              {cliente.nombreCompleto}
            </h2>
            <div className="font-mono text-xs text-[#82828A] flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span>CI: <strong className="text-[#F5EFE0]">{cliente.cedula}</strong></span>
              <span>·</span>
              <span>{cliente.usuario?.telefono || 'Sin teléfono'}</span>
              <span>·</span>
              <span>{cliente.usuario?.email}</span>
              <span>·</span>
              <span className="text-[#E8B84A] font-bold">{cliente.sucursalOrigen?.nombre?.toUpperCase() || 'SEDE NORTE'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <div className={`px-3 py-1.5 border font-mono text-[10px] tracking-wider text-center flex items-center justify-center gap-1.5 ${
            cliente.usuario?.estado === 'INACTIVO'
              ? 'bg-[#2E1818] border-red-500 text-red-400'
              : esActivo
              ? 'bg-[#0F1F14] border-[#4ADE80]/40 text-[#4ADE80]'
              : 'bg-[#2E1818] border-[#F87171]/40 text-[#F87171]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${cliente.usuario?.estado === 'INACTIVO' ? 'bg-red-500' : esActivo ? 'bg-[#4ADE80]' : 'bg-[#F87171]'}`}></span>
            <span>
              {cliente.usuario?.estado === 'INACTIVO'
                ? 'SOCIO DADO DE BAJA'
                : esActivo
                ? 'MEMBRESÍA ACTIVA'
                : 'MEMBRESÍA VENCIDA'}
            </span>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 border border-[#A6822D] text-[#E8B84A] hover:bg-[#1B1B21] font-mono text-xs tracking-wider transition-colors"
          >
            EDITAR SOCIO
          </button>

          <button
            onClick={() => onOpenPago && onOpenPago(cliente.id)}
            className="px-4 py-2 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold transition-colors"
          >
            + REGISTRAR PAGO
          </button>

          <button
            onClick={handleToggleDeleteSocio}
            disabled={deleteLoading}
            className={`px-4 py-1.5 border font-mono text-[11px] tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              cliente.usuario?.estado === 'INACTIVO'
                ? 'border-green-600/60 text-green-400 hover:bg-green-950/40'
                : 'border-red-600/60 text-red-400 hover:bg-red-950/40'
            }`}
          >
            <Trash2 size={13} />
            <span>{cliente.usuario?.estado === 'INACTIVO' ? 'REACTIVAR SOCIO' : 'ELIMINAR / DAR DE BAJA'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de socio inactivo */}
      {cliente.usuario?.estado === 'INACTIVO' && (
        <div className="p-3 bg-red-950/60 border border-red-500 text-red-300 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span><strong>SOCIO DADO DE BAJA:</strong> Este cliente se encuentra inactivo. Se han revocado sus accesos en torniquetes y cajas.</span>
          </div>
          <button
            onClick={handleToggleDeleteSocio}
            className="px-3 py-1 bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-400 font-bold text-[10px]"
          >
            REACTIVAR
          </button>
        </div>
      )}

      {/* Two Column Grid (Matching Mockup 04) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Membership Card + Stats + Personal Data (Col-span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Membresía Actual */}
          {!membresia ? (
            <div className="p-6 bg-[#1B1B21] border border-[#33333C] relative space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">
                  MEMBRESÍA ACTUAL
                </div>
                <span className="px-2 py-0.5 bg-[#2E1818] text-[#F87171] border border-[#F87171]/30 font-mono text-[9px] font-bold">
                  SIN PLAN ACTIVO
                </span>
              </div>
              <div>
                <div className="font-display text-2xl text-[#82828A] tracking-wider">
                  SIN MEMBRESÍA ASIGNADA
                </div>
                <div className="font-mono text-xs text-[#82828A] mt-1">
                  El socio no cuenta con una membresía registrada o activa.
                </div>
              </div>
              <button
                onClick={() => handleOpenEditMembresia(null)}
                className="w-full py-2 bg-[#E8B84A] text-[#1A1206] font-display text-xs font-bold tracking-wider hover:bg-[#D4A538] transition-colors"
              >
                + ASIGNAR MEMBRESÍA
              </button>
            </div>
          ) : (
            <div className="p-6 bg-[#1B1B21] border border-[#A6822D] relative space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">
                  MEMBRESÍA ACTUAL
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEditMembresia(membresia)}
                  className="px-2.5 py-1 bg-[#141418] border border-[#A6822D] text-[#E8B84A] hover:bg-[#E8B84A] hover:text-[#1A1206] font-mono text-[10px] tracking-wider font-bold transition-all flex items-center gap-1"
                  title="Editar fechas, plan, sede o estado"
                >
                  <Edit size={11} />
                  <span>EDITAR PLAN</span>
                </button>
              </div>
              <div>
                <div className="font-display text-3xl text-[#E8B84A] tracking-wider">
                  {membresia.tipoMembresia?.nombre || 'PLAN BOXEO'}
                </div>
                <div className="font-mono text-xs text-[#F5EFE0] mt-0.5">
                  ${Number(membresia.tipoMembresia?.precio || 0).toFixed(0)} / {membresia.tipoMembresia?.duracionDias || 30} DÍAS · {membresia.sucursal?.nombre || 'Sede'}
                </div>
              </div>

              <div className="pt-3 border-t border-[#2A2A31] grid grid-cols-2 gap-4 font-mono">
                <div>
                  <div className="text-[9px] text-[#82828A] tracking-wider uppercase">INICIO</div>
                  <div className="text-sm text-[#F5EFE0] mt-0.5">
                    {new Date(membresia.fechaInicio + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#F87171] tracking-wider uppercase">VENCE</div>
                  <div className="text-sm text-[#F87171] font-bold mt-0.5">
                    {new Date(membresia.fechaFin + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()}
                  </div>
                </div>
              </div>

              {cliente.diasRestantes !== null && (
                <div className="pt-2 flex justify-between items-center">
                  <span className={`px-2 py-0.5 font-mono text-[10px] rounded ${
                    cliente.diasRestantes >= 0
                      ? 'bg-[#1E2E1E] text-[#4ADE80]'
                      : 'bg-[#2E1818] text-[#F87171]'
                  }`}>
                    {cliente.diasRestantes >= 0
                      ? `● Vigente (${cliente.diasRestantes} días restantes)`
                      : `● Vencida hace ${Math.abs(cliente.diasRestantes)} días`}
                  </span>
                  <span className="font-mono text-[10px] text-[#82828A] uppercase">
                    ESTADO: <strong className={membresia.estado === 'ACTIVA' ? 'text-[#4ADE80]' : 'text-red-400'}>{membresia.estado}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Card: Estadísticas del Socio */}
          <div className="p-6 bg-[#1B1B21] border border-[#2A2A31] space-y-4">
            <div className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase">
              ESTADÍSTICAS OPERATIVAS
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#141418] border border-[#2A2A31]">
                <div className="font-display text-4xl text-[#E8B84A] leading-none">
                  {cliente.estadisticas?.asistenciasMes || 0}
                </div>
                <div className="font-mono text-[9px] tracking-wider text-[#82828A] mt-1 uppercase">
                  ASIST. MES
                </div>
              </div>

              <div className="p-3 bg-[#141418] border border-[#2A2A31]">
                <div className="font-display text-4xl text-[#F5EFE0] leading-none">
                  {cliente.estadisticas?.asistenciasTotal || 0}
                </div>
                <div className="font-mono text-[9px] tracking-wider text-[#82828A] mt-1 uppercase">
                  TOTAL HIST.
                </div>
              </div>

              <div className="p-3 bg-[#141418] border border-[#2A2A31]">
                <div className="font-display text-4xl text-[#F5EFE0] leading-none">
                  ${cliente.estadisticas?.totalPagadoAnio || 0}
                </div>
                <div className="font-mono text-[9px] tracking-wider text-[#82828A] mt-1 uppercase">
                  PAGADO 2026
                </div>
              </div>

              <div className="p-3 bg-[#141418] border border-[#2A2A31]">
                <div className="font-display text-4xl text-[#F5EFE0] leading-none">
                  {cliente.estadisticas?.mesesActivo || 1}
                </div>
                <div className="font-mono text-[9px] tracking-wider text-[#82828A] mt-1 uppercase">
                  MESES ACTIVO
                </div>
              </div>
            </div>
          </div>

          {/* Card: Carnet Digital QR y Datos Personales */}
          <div className="p-6 bg-[#1B1B21] border border-[#2A2A31] space-y-3 font-mono text-xs">
            <div className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase pb-2 border-b border-[#2A2A31]">
              CARNET QR Y DATOS PERSONALES
            </div>

            {/* QR Visualizer */}
            <div className="p-4 bg-white text-black text-center space-y-2 rounded-sm">
              <div className="w-36 h-36 mx-auto bg-black p-2 flex items-center justify-center">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                  <rect x="0" y="0" width="30" height="30" fill="white" />
                  <rect x="5" y="5" width="20" height="20" fill="black" />
                  <rect x="10" y="10" width="10" height="10" fill="white" />

                  <rect x="70" y="0" width="30" height="30" fill="white" />
                  <rect x="75" y="5" width="20" height="20" fill="black" />
                  <rect x="80" y="10" width="10" height="10" fill="white" />

                  <rect x="0" y="70" width="30" height="30" fill="white" />
                  <rect x="5" y="75" width="20" height="20" fill="black" />
                  <rect x="10" y="80" width="10" height="10" fill="white" />

                  <rect x="40" y="20" width="20" height="10" fill="white" />
                  <rect x="45" y="45" width="15" height="15" fill="white" />
                  <rect x="70" y="60" width="20" height="20" fill="white" />
                  <rect x="25" y="45" width="15" height="15" fill="white" />
                </svg>
              </div>
              <div className="font-bold text-xs tracking-wider">{cliente.codigoQr}</div>
              <div className="text-[10px] text-gray-600">Carnet Digital Oficial · Guante Dorado</div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#82828A]">Fecha Nacimiento:</span>
                <span className="text-[#F5EFE0]">{cliente.fechaNacimiento || 'No registrada'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82828A]">Género:</span>
                <span className="text-[#F5EFE0]">{cliente.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82828A]">Alta de socio:</span>
                <span className="text-[#F5EFE0]">
                  {new Date(cliente.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TABS (Historial de Pagos, Asistencias, Renovaciones) (Col-span 8) */}
        <div className="lg:col-span-8 p-6 bg-[#1B1B21] border border-[#2A2A31] flex flex-col justify-between">
          <div>
            {/* Tabs Header (Matching Mockup 04) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2A2A31]">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('pagos')}
                  className={`font-display text-xl tracking-wider pb-1 transition-all ${
                    activeTab === 'pagos'
                      ? 'text-[#E8B84A] border-b-2 border-[#E8B84A]'
                      : 'text-[#82828A] hover:text-[#F5EFE0]'
                  }`}
                >
                  HISTORIAL DE PAGOS ({pagos.length})
                </button>
                <button
                  onClick={() => setActiveTab('asistencias')}
                  className={`font-display text-xl tracking-wider pb-1 transition-all ${
                    activeTab === 'asistencias'
                      ? 'text-[#E8B84A] border-b-2 border-[#E8B84A]'
                      : 'text-[#82828A] hover:text-[#F5EFE0]'
                  }`}
                >
                  ASISTENCIAS ({asistencias.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1 border border-[#A6822D] text-[#E8B84A] font-mono text-[10px] tracking-wider font-bold hover:bg-[#E8B84A] hover:text-[#1A1206] transition-colors"
              >
                ↓ EXPORTAR REGISTRO
              </button>
            </div>

            {/* TAB CONTENT: PAGOS (RF-W11) */}
            {activeTab === 'pagos' && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#2A2A31] text-[10px] text-[#82828A] uppercase">
                      <th className="py-2.5">RECIBO</th>
                      <th className="py-2.5">FECHA</th>
                      <th className="py-2.5">CONCEPTO / PLAN</th>
                      <th className="py-2.5">MÉTODO</th>
                      <th className="py-2.5">CAJERO</th>
                      <th className="py-2.5 text-right">MONTO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A31]">
                    {pagos.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#82828A]">
                          No hay pagos registrados para este socio.
                        </td>
                      </tr>
                    ) : (
                      pagos.map((p) => (
                        <tr key={p.id} className="hover:bg-[#141418] transition-colors">
                          <td className="py-3 font-bold text-[#E8B84A]">{p.reciboNumero || `R-${p.id}`}</td>
                          <td className="py-3 text-[#F5EFE0]">
                            {new Date(p.fechaPago).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 text-[#B8B8BE]">
                            {p.membresia?.tipoMembresia?.nombre || 'Membresía Boxeo'}
                          </td>
                          <td className="py-3">
                            <span className="px-1.5 py-0.5 bg-[#232329] border border-[#3A3A42] text-[10px] text-[#F5EFE0]">
                              {p.metodoPago}
                            </span>
                          </td>
                          <td className="py-3 text-[#82828A]">
                            {p.cajero?.nombre || 'Admin'}
                          </td>
                          <td className="py-3 text-right font-display text-base text-[#F5EFE0]">
                            ${Number(p.monto).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: ASISTENCIAS (RF-M06) */}
            {activeTab === 'asistencias' && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#2A2A31] text-[10px] text-[#82828A] uppercase">
                      <th className="py-2.5">FECHA</th>
                      <th className="py-2.5">HORA</th>
                      <th className="py-2.5">SUCURSAL</th>
                      <th className="py-2.5 text-right">MÉTODO DE ACCESO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A31]">
                    {asistencias.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-[#82828A]">
                          No hay asistencias registradas aún.
                        </td>
                      </tr>
                    ) : (
                      asistencias.map((a) => (
                        <tr key={a.id} className="hover:bg-[#141418] transition-colors">
                          <td className="py-3 text-[#F5EFE0]">
                            {new Date(a.fechaHora).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 text-[#E8B84A]">
                            {new Date(a.fechaHora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 text-[#B8B8BE]">
                            {a.sucursal?.nombre || 'Sucursal Norte'}
                          </td>
                          <td className="py-3 text-right">
                            <span className="px-2 py-0.5 bg-[#141418] border border-[#3A3A42] text-[10px] text-[#4ADE80]">
                              {a.metodo || 'QR_SCAN'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#2A2A31] flex justify-between items-center text-xs font-mono text-[#82828A]">
            <span>REGISTROS AUDITADOS POR SEQUELIZE ORM</span>
            <button
              onClick={() => onOpenPago && onOpenPago(cliente.id)}
              className="text-[#E8B84A] hover:underline"
            >
              + REGISTRAR NUEVO PAGO PARA ESTE SOCIO →
            </button>
          </div>
        </div>
      </div>

      {/* Modal Editar Socio con Validación en Tiempo Real */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#1B1B21] border border-[#A6822D] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#2A2A31]">
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-[#E8B84A] uppercase">
                  EDICIÓN DE SOCIO · RF-W02
                </div>
                <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider mt-0.5">
                  EDITAR DATOS: {cliente.nombreCompleto}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
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

            <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs">
              {/* Nombres y Apellidos con validación de solo letras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#82828A] uppercase">Nombres *</label>
                    {touched.nombre && !formErrors.nombre && (
                      <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={editForm.nombre}
                    onChange={(e) => handleFieldChange('nombre', e.target.value)}
                    onBlur={() => handleFieldBlur('nombre')}
                    onKeyDown={handleKeyDownSoloLetras}
                    className={`w-full bg-[#141418] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.nombre && formErrors.nombre
                        ? 'border-red-500 bg-red-950/10'
                        : touched.nombre
                        ? 'border-[#4ADE80]/60'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.nombre && formErrors.nombre && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.nombre}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#82828A] uppercase">Apellidos *</label>
                    {touched.apellido && !formErrors.apellido && (
                      <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={editForm.apellido}
                    onChange={(e) => handleFieldChange('apellido', e.target.value)}
                    onBlur={() => handleFieldBlur('apellido')}
                    onKeyDown={handleKeyDownSoloLetras}
                    className={`w-full bg-[#141418] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.apellido && formErrors.apellido
                        ? 'border-red-500 bg-red-950/10'
                        : touched.apellido
                        ? 'border-[#4ADE80]/60'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.apellido && formErrors.apellido && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.apellido}
                    </span>
                  )}
                </div>
              </div>

              {/* Cédula y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#82828A] uppercase">Cédula Ecuatoriana (10 d) *</label>
                    {touched.cedula && !formErrors.cedula && (
                      <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Válida (M10)
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    value={editForm.cedula}
                    onChange={(e) => handleFieldChange('cedula', e.target.value)}
                    onBlur={() => handleFieldBlur('cedula')}
                    onKeyDown={handleKeyDownSoloNumeros}
                    className={`w-full bg-[#141418] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.cedula && formErrors.cedula
                        ? 'border-red-500 bg-red-950/10'
                        : touched.cedula
                        ? 'border-[#4ADE80]/60'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.cedula && formErrors.cedula && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.cedula}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#82828A] uppercase">Teléfono Móvil (09...) *</label>
                    {touched.telefono && !formErrors.telefono && (
                      <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    value={editForm.telefono}
                    onChange={(e) => handleFieldChange('telefono', e.target.value)}
                    onBlur={() => handleFieldBlur('telefono')}
                    onKeyDown={handleKeyDownSoloNumeros}
                    className={`w-full bg-[#141418] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.telefono && formErrors.telefono
                        ? 'border-red-500 bg-red-950/10'
                        : touched.telefono
                        ? 'border-[#4ADE80]/60'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.telefono && formErrors.telefono && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.telefono}
                    </span>
                  )}
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-[#82828A] uppercase">Correo Electrónico Corporativo / Personal *</label>
                  {touched.email && !formErrors.email && (
                    <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> RFC Válido
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={`w-full bg-[#141418] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                    touched.email && formErrors.email
                      ? 'border-red-500 bg-red-950/10'
                      : touched.email
                      ? 'border-[#4ADE80]/60'
                      : 'border-[#3A3A42] focus:border-[#E8B84A]'
                  }`}
                />
                {touched.email && formErrors.email && (
                  <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                    <AlertCircle size={10} /> {formErrors.email}
                  </span>
                )}
              </div>

              {/* Género y Fecha Nacimiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Género</label>
                  <select
                    value={editForm.genero}
                    onChange={(e) => handleFieldChange('genero', e.target.value)}
                    className="w-full bg-[#141418] border border-[#3A3A42] px-3 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#82828A] uppercase">Fecha Nacimiento (8-90 años)</label>
                    {touched.fechaNacimiento && !formErrors.fechaNacimiento && editForm.fechaNacimiento && (
                      <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Edad válida
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={editForm.fechaNacimiento}
                    onChange={(e) => handleFieldChange('fechaNacimiento', e.target.value)}
                    onBlur={() => handleFieldBlur('fechaNacimiento')}
                    className={`w-full bg-[#141418] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.fechaNacimiento && formErrors.fechaNacimiento
                        ? 'border-red-500 bg-red-950/10'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.fechaNacimiento && formErrors.fechaNacimiento && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.fechaNacimiento}
                    </span>
                  )}
                </div>
              </div>

              {/* Sucursal Asignada */}
              <div>
                <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Sucursal / Sede Asignada *</label>
                <select
                  value={editForm.sucursalOrigenId}
                  onChange={(e) => handleFieldChange('sucursalOrigenId', Number(e.target.value))}
                  className="w-full bg-[#141418] border border-[#3A3A42] px-3 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                >
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} {s.direccion ? `(${s.direccion})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 border-t border-[#2A2A31] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#3A3A42] text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={editLoading || (touched.nombre && formErrors.nombre) || (touched.apellido && formErrors.apellido) || (touched.cedula && formErrors.cedula) || (touched.email && formErrors.email) || (touched.telefono && formErrors.telefono)}
                  className="px-6 py-2 bg-[#E8B84A] text-[#1A1206] font-display text-sm font-bold tracking-wider hover:bg-[#D4A538] transition-colors disabled:opacity-50"
                >
                  {editLoading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar / Asignar Membresía */}
      {showMembresiaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#1B1B21] border border-[#A6822D] shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A2A31]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1F1810] border border-[#E8B84A] text-[#E8B84A]">
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.25em] text-[#E8B84A] uppercase">
                    — GESTIÓN DE PLAN · RF-W03
                  </div>
                  <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                    {membresiaForm.id ? 'EDITAR MEMBRESÍA' : 'ASIGNAR MEMBRESÍA'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowMembresiaModal(false)}
                className="p-1.5 text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {membresiaModalError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{membresiaModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMembresia} className="space-y-4 font-mono text-xs">
              {/* Tipo de Membresía */}
              <div>
                <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Tipo de Plan / Tarifa *</label>
                <select
                  value={membresiaForm.tipoMembresiaId}
                  onChange={(e) => handleMembresiaTipoChange(e.target.value)}
                  className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2.5 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                >
                  {tiposMembresia.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} — ${Number(t.precio).toFixed(2)} ({t.duracionDias} días)
                    </option>
                  ))}
                </select>
              </div>

              {/* Sede / Sucursal */}
              <div>
                <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Sede Asignada *</label>
                <select
                  value={membresiaForm.sucursalId}
                  onChange={(e) => setMembresiaForm((prev) => ({ ...prev, sucursalId: Number(e.target.value) }))}
                  className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2.5 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                >
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Fecha Inicio *</label>
                  <input
                    type="date"
                    required
                    value={membresiaForm.fechaInicio}
                    onChange={(e) => {
                      const newIni = e.target.value;
                      const tipo = tiposMembresia.find((t) => t.id === Number(membresiaForm.tipoMembresiaId));
                      let fin = membresiaForm.fechaFin;
                      if (newIni && tipo) {
                        const d = new Date(newIni + 'T00:00:00');
                        d.setDate(d.getDate() + Number(tipo.duracionDias));
                        fin = d.toISOString().split('T')[0];
                      }
                      setMembresiaForm((prev) => ({ ...prev, fechaInicio: newIni, fechaFin: fin }));
                    }}
                    className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Fecha Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={membresiaForm.fechaFin}
                    onChange={(e) => setMembresiaForm((prev) => ({ ...prev, fechaFin: e.target.value }))}
                    className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Estado de la Membresía *</label>
                <select
                  value={membresiaForm.estado}
                  onChange={(e) => setMembresiaForm((prev) => ({ ...prev, estado: e.target.value }))}
                  className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                >
                  <option value="ACTIVA">ACTIVA (Permite acceso al club)</option>
                  <option value="VENCIDA">VENCIDA (Bloquea acceso en torniquete)</option>
                  <option value="CANCELADA">CANCELADA (Anulada por administración)</option>
                </select>
              </div>

              {/* Botones */}
              <div className="pt-4 border-t border-[#2A2A31] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMembresiaModal(false)}
                  className="px-4 py-2 border border-[#3A3A42] text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={membresiaLoading}
                  className="px-6 py-2 bg-[#E8B84A] text-[#1A1206] font-display text-sm font-bold tracking-wider hover:bg-[#D4A538] transition-colors disabled:opacity-50"
                >
                  {membresiaLoading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para dar de baja o reactivar socio (RF-W02) */}
      <ConfirmModal
        isOpen={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={executeToggleDeleteSocio}
        title={cliente?.usuario?.estado === 'INACTIVO' ? 'REACTIVAR SOCIO' : 'DAR DE BAJA SOCIO'}
        subtitle="ADMINISTRACIÓN DE SOCIOS · RF-W02"
        variant={cliente?.usuario?.estado === 'INACTIVO' ? 'success' : 'danger'}
        confirmText={cliente?.usuario?.estado === 'INACTIVO' ? 'REACTIVAR SOCIO' : 'CONFIRMAR BAJA'}
        loading={deleteLoading}
        message={
          cliente?.usuario?.estado === 'INACTIVO'
            ? `¿Deseas REACTIVAR la cuenta del socio ${cliente?.nombreCompleto}?\n\nEl socio podrá ingresar nuevamente al club y registrar pagos y asistencias con normalidad.`
            : `¿Estás seguro de que deseas DAR DE BAJA al socio ${cliente?.nombreCompleto}?\n\nSu cuenta pasará a estado INACTIVO y se bloqueará inmediatamente su acceso en torniquete y caja.\n\n(El historial contable y médico se preservará intacto para efectos de auditoría).`
        }
      />

      {/* Modal de Notificación / Alerta para errores */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        subtitle={alertModal.subtitle}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
