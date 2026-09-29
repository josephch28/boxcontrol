import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, X, CreditCard, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  validarTexto,
  validarMonto,
  validarDuracionDias,
  handleKeyDownSoloNumeros,
  handleKeyDownDecimal,
} from '../utils/validators';
import { AlertModal } from '../components/ModalAlert';

export default function TiposMembresia() {
  const { user } = useAuth();
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', subtitle: '', message: '', type: 'error' });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracionDias: '30',
    estado: 'ACTIVA',
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [modalError, setModalError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const validateField = (name, value) => {
    let res = { isValid: true, error: '' };
    switch (name) {
      case 'nombre':
        res = validarTexto(value, 3, 60, 'El nombre del plan');
        break;
      case 'precio':
        res = validarMonto(value, 1, 2000, 'El precio');
        break;
      case 'duracionDias':
        res = validarDuracionDias(value);
        break;
      case 'descripcion':
        if (value && value.trim()) {
          res = validarTexto(value, 5, 300, 'La descripción');
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateAll = () => {
    const rNom = validarTexto(formData.nombre, 3, 60, 'El nombre del plan');
    const rPre = validarMonto(formData.precio, 1, 2000, 'El precio');
    const rDur = validarDuracionDias(formData.duracionDias);
    const rDes = formData.descripcion && formData.descripcion.trim()
      ? validarTexto(formData.descripcion, 5, 300, 'La descripción')
      : { isValid: true, error: '' };

    const errors = {
      nombre: rNom.isValid ? '' : rNom.error,
      precio: rPre.isValid ? '' : rPre.error,
      duracionDias: rDur.isValid ? '' : rDur.error,
      descripcion: rDes.isValid ? '' : rDes.error,
    };
    setFormErrors(errors);
    setTouched({
      nombre: true,
      precio: true,
      duracionDias: true,
      descripcion: true,
    });
    return Object.values(errors).every((e) => e === '');
  };

  const fetchTipos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tipos-membresia');
      if (res.data?.success) {
        setTipos(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching planes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const handleOpenCreate = () => {
    setEditingTipo(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      duracionDias: '30',
      estado: 'ACTIVA',
    });
    setFormErrors({});
    setTouched({});
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (tipo) => {
    setEditingTipo(tipo);
    setFormData({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || '',
      precio: tipo.precio,
      duracionDias: tipo.duracionDias,
      estado: tipo.estado,
    });
    setFormErrors({});
    setTouched({});
    setModalError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setModalError('Por favor complete los campos obligatorios sin errores.');
      return;
    }

    setSubmitLoading(true);
    setModalError('');
    try {
      if (editingTipo) {
        await api.put(`/tipos-membresia/${editingTipo.id}`, formData);
        setToastMsg('Plan de membresía actualizado exitosamente en MySQL.');
      } else {
        await api.post('/tipos-membresia', formData);
        setToastMsg('Nuevo plan de membresía registrado en el catálogo oficial.');
      }
      setShowModal(false);
      fetchTipos();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al guardar el plan de membresía.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      await api.patch(`/tipos-membresia/${id}/toggle-estado`);
      setToastMsg('Estado del plan modificado.');
      fetchTipos();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'ERROR AL MODIFICAR ESTADO',
        subtitle: 'PLANES DE MEMBRESÍA · RF-W03',
        message: err.response?.data?.message || 'No se pudo actualizar el estado del plan de membresía.',
        type: 'error',
      });
    }
  };

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#0B0B0D] min-h-[calc(100vh-75px)] select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-green-950/50 border-l-4 border-green-500 text-green-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <Check size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header (Matching Mockup 06) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A31]">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-[#82828A] uppercase">
            CONFIGURACIÓN · {tipos.filter((t) => t.estado === 'ACTIVA').length} PLANES ACTIVOS
          </div>
          <h2 className="font-display text-3xl text-[#F5EFE0] tracking-wider mt-0.5">
            TIPOS DE MEMBRESÍA
          </h2>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            <span>+ NUEVO PLAN</span>
          </button>
        )}
      </div>

      {/* Cards Grid (Matching Mockup 06) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tipos.map((tipo, idx) => {
          const planIndex = (idx + 1).toString().padStart(2, '0');
          const isActiva = tipo.estado === 'ACTIVA';

          return (
            <div
              key={tipo.id}
              className={`bg-[#1B1B21] border p-6 flex flex-col justify-between relative transition-all ${
                isActiva
                  ? 'border-[#A6822D] shadow-lg shadow-[#E8B84A]/5'
                  : 'border-[#33333C] hover:border-[#40404C] opacity-80'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs tracking-[0.25em] text-[#A5A5AF]">
                    — PLAN {planIndex}
                  </span>
                  <span className={`px-2 py-0.5 font-mono text-[9px] font-bold ${
                    isActiva
                      ? 'bg-[#0F1F14] text-[#4ADE80] border border-[#4ADE80]/30'
                      : 'bg-[#2E1818] text-[#F87171] border border-red-500/30'
                  }`}>
                    {tipo.estado}
                  </span>
                </div>

                {/* Real Dynamic Name - Never burned */}
                <h3 className="font-display text-3xl xl:text-4xl tracking-wider mb-3 text-[#F5EFE0] uppercase">
                  {tipo.nombre}
                </h3>

                <div className="pb-4 border-b border-[#33333C]">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl xl:text-6xl text-[#E8B84A] leading-none">
                      ${Number(tipo.precio).toFixed(2)}
                    </span>
                    <span className="font-mono text-xs text-[#A5A5AF]">
                      USD / {tipo.duracionDias} DÍAS
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[#A5A5AF] mt-2">
                    VIGENCIA: {tipo.duracionDias} DÍAS CALENDARIO · SIN RECARGOS
                  </div>
                </div>

                {/* Dynamic Features List based on actual plan description */}
                <div className="py-5 space-y-2.5 font-sans text-xs text-[#F5EFE0]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#E8B84A] font-bold">✓</span>
                    <span>Acceso habilitado a todas las sedes del club</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#E8B84A] font-bold">✓</span>
                    <span>Carnet digital QR con acceso biométrico</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#E8B84A] font-bold">✓</span>
                    <span>Seguimiento de asistencias y cobros en tiempo real</span>
                  </div>
                  {tipo.descripcion && (
                    <div className="flex items-start gap-2.5 pt-2 text-[#A5A5AF] border-t border-[#33333C] text-[11px]">
                      <span className="text-[#E8B84A] font-bold mt-0.5">★</span>
                      <span className="leading-relaxed text-[#F5EFE0]">{tipo.descripcion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Real Active Members Count */}
              <div className="pt-4 border-t border-[#33333C] flex items-center justify-between">
                <div>
                  <div className="font-display text-2xl text-[#E8B84A] leading-none">
                    {tipo.sociosActivos ?? 0}
                  </div>
                  <div className="font-mono text-[9px] tracking-wider text-[#A5A5AF] uppercase">
                    SOCIOS ACTIVOS
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEstado(tipo.id)}
                      className="px-2.5 py-1 border border-[#3A3A42] text-[#A5A5AF] hover:text-[#F5EFE0] font-mono text-[10px]"
                      title="Alternar estado"
                    >
                      {tipo.estado === 'ACTIVA' ? 'PAUSAR' : 'ACTIVAR'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(tipo)}
                      className="px-4 py-1.5 border border-[#A6822D] text-[#E8B84A] hover:bg-[#E8B84A] hover:text-[#1A1206] font-mono text-xs tracking-wider font-bold transition-colors"
                    >
                      EDITAR
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Plan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#1B1B21] border border-[#A6822D] shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#2A2A31]">
              <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                {editingTipo ? 'EDITAR PLAN DE MEMBRESÍA' : 'NUEVO PLAN DE MEMBRESÍA'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#82828A] hover:text-[#F5EFE0]"
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

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-[#82828A] uppercase">Nombre del Plan *</label>
                  {touched.nombre && !formErrors.nombre && (
                    <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Válido
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ej: Plan Anual Sparring Pro"
                  value={formData.nombre}
                  onChange={(e) => handleFieldChange('nombre', e.target.value)}
                  onBlur={() => handleFieldBlur('nombre')}
                  className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#82828A] uppercase">Precio ($1 - $2000 USD) *</label>
                    {touched.precio && !formErrors.precio && (
                      <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 45.00"
                    value={formData.precio}
                    onChange={(e) => handleFieldChange('precio', e.target.value)}
                    onBlur={() => handleFieldBlur('precio')}
                    onKeyDown={handleKeyDownDecimal}
                    className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.precio && formErrors.precio
                        ? 'border-red-500 bg-red-950/10'
                        : touched.precio
                        ? 'border-[#4ADE80]/60'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.precio && formErrors.precio && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.precio}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#82828A] uppercase">Duración (1 - 365 Días) *</label>
                    {touched.duracionDias && !formErrors.duracionDias && (
                      <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={3}
                    required
                    placeholder="Ej: 30"
                    value={formData.duracionDias}
                    onChange={(e) => handleFieldChange('duracionDias', e.target.value)}
                    onBlur={() => handleFieldBlur('duracionDias')}
                    onKeyDown={handleKeyDownSoloNumeros}
                    className={`w-full bg-[#141418] border px-3.5 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.duracionDias && formErrors.duracionDias
                        ? 'border-red-500 bg-red-950/10'
                        : touched.duracionDias
                        ? 'border-[#4ADE80]/60'
                        : 'border-[#3A3A42] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.duracionDias && formErrors.duracionDias && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.duracionDias}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#82828A] mb-1 uppercase">Descripción y Beneficios</label>
                <textarea
                  rows="3"
                  maxLength={300}
                  placeholder="Beneficios incluidos, horarios o acceso a sparring..."
                  value={formData.descripcion}
                  onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                  onBlur={() => handleFieldBlur('descripcion')}
                  className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                ></textarea>
                <div className="text-right text-[10px] text-[#82828A] mt-0.5">
                  {(formData.descripcion || '').length}/300
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A2A31] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#3A3A42] text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || (touched.nombre && formErrors.nombre) || (touched.precio && formErrors.precio) || (touched.duracionDias && formErrors.duracionDias)}
                  className="px-6 py-2 bg-[#E8B84A] text-[#1A1206] font-display text-sm font-bold tracking-wider hover:bg-[#D4A538] transition-colors disabled:opacity-50"
                >
                  {submitLoading ? 'GUARDANDO...' : 'GUARDAR PLAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Alerta para errores */}
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
