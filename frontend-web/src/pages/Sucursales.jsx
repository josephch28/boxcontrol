import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { MapPin, Phone, User, Clock, Users, Plus, Check, RefreshCw, X, AlertCircle, CheckCircle2, Edit } from 'lucide-react';
import {
  validarTexto,
  validarTelefono,
  validarEmail,
  handleKeyDownSoloNumeros,
} from '../utils/validators';
import { AlertModal } from '../components/ModalAlert';

export default function Sucursales({ onSucursalesChange, onSucursalUpdated }) {
  const notifyChange = () => {
    if (onSucursalesChange) onSucursalesChange();
    if (onSucursalUpdated) onSucursalUpdated();
  };

  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', subtitle: '', message: '', type: 'error' });

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    encargado: '',
    horario: 'L-V · 06:00 - 22:00 | S · 07:00 - 20:00',
    capacidad: '40',
    estado: 'ACTIVA',
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [modalError, setModalError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const validateField = (name, value) => {
    let res = { isValid: true, error: '' };
    switch (name) {
      case 'nombre':
        res = validarTexto(value, 3, 80, 'El nombre de la sucursal');
        break;
      case 'direccion':
        res = validarTexto(value, 5, 150, 'La dirección');
        break;
      case 'telefono':
        res = validarTelefono(value);
        break;
      case 'email':
        if (value && value.trim()) {
          res = validarEmail(value);
        }
        break;
      case 'encargado':
        if (value && value.trim()) {
          res = validarTexto(value, 3, 60, 'El encargado');
        }
        break;
      case 'horario':
        if (value && value.trim()) {
          res = validarTexto(value, 4, 100, 'El horario');
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
    const rNom = validarTexto(formData.nombre, 3, 80, 'El nombre de la sucursal');
    const rDir = validarTexto(formData.direccion, 5, 150, 'La dirección');
    const rTel = validarTelefono(formData.telefono);
    const rEma = formData.email && formData.email.trim()
      ? validarEmail(formData.email)
      : { isValid: true, error: '' };

    const errors = {
      nombre: rNom.isValid ? '' : rNom.error,
      direccion: rDir.isValid ? '' : rDir.error,
      telefono: rTel.isValid ? '' : rTel.error,
      email: rEma.isValid ? '' : rEma.error,
    };
    setFormErrors(errors);
    setTouched({
      nombre: true,
      direccion: true,
      telefono: true,
      email: true,
    });
    return Object.values(errors).every((e) => e === '');
  };

  const fetchSucursales = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sucursales');
      if (res.data?.success) {
        setSucursales(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching sucursales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  const handleOpenCreate = () => {
    setEditingSucursal(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      encargado: '',
      horario: 'L-V · 06:00 - 22:00 | S · 07:00 - 20:00',
      capacidad: '40',
      estado: 'ACTIVA',
    });
    setFormErrors({});
    setTouched({});
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (suc) => {
    setEditingSucursal(suc);
    setFormData({
      nombre: suc.nombre || '',
      direccion: suc.direccion || '',
      telefono: suc.telefono || '',
      email: suc.email || '',
      encargado: suc.encargado || '',
      horario: suc.horario || 'L-V · 06:00 - 22:00 | S · 07:00 - 20:00',
      capacidad: suc.capacidad ? String(suc.capacidad) : '40',
      estado: suc.estado || 'ACTIVA',
    });
    setFormErrors({});
    setTouched({});
    setModalError('');
    setShowModal(true);
  };

  const handleToggleEstado = async (id) => {
    try {
      await api.patch(`/sucursales/${id}/toggle-estado`);
      setFeedbackMsg('Estado de sucursal actualizado con éxito.');
      fetchSucursales();
      notifyChange();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: 'ERROR AL MODIFICAR ESTADO',
        subtitle: 'CONFIGURACIÓN DE SEDES · RF-W10',
        message: err.response?.data?.message || err.message || 'Error al modificar estado de la sucursal.',
        type: 'error',
      });
    }
  };

  const handleSaveSucursal = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setModalError('Complete los campos obligatorios sin errores.');
      return;
    }

    setSubmitLoading(true);
    setModalError('');
    try {
      const payload = {
        ...formData,
        capacidad: formData.capacidad ? Number(formData.capacidad) : 40,
      };

      if (editingSucursal) {
        await api.put(`/sucursales/${editingSucursal.id}`, payload);
        setFeedbackMsg(`Sucursal "${formData.nombre}" actualizada con éxito en la base de datos.`);
      } else {
        await api.post('/sucursales', payload);
        setFeedbackMsg('Nueva sucursal registrada exitosamente en MySQL.');
      }

      setShowModal(false);
      fetchSucursales();
      notifyChange();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Error al guardar la sucursal.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#0B0B0D] min-h-[calc(100vh-85px)] select-none">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#33333C]">
        <div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#A5A5AF] uppercase">
            CONFIGURACIÓN OPERATIVA · RF-W10
          </span>
          <h2 className="font-display text-3xl text-[#F5EFE0] tracking-wider mt-0.5">
            GESTIÓN DE SUCURSALES
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSucursales}
            title="Recargar datos desde MySQL"
            className="p-2 border border-[#33333C] bg-[#141418] hover:border-[#E8B84A] text-[#A5A5AF] hover:text-[#F5EFE0] transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-base tracking-widest font-bold flex items-center gap-2 transition-all"
          >
            <Plus size={18} />
            <span>+ NUEVA SUCURSAL</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="p-3 bg-green-950/50 border-l-4 border-green-500 text-green-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <Check size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Sucursales Cards Grid (Matching Mockup 08-sucursales.svg) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sucursales.map((suc, idx) => {
          const isNorte = suc.nombre.toLowerCase().includes('norte');
          const planIndex = (idx + 1).toString().padStart(2, '0');

          return (
            <div
              key={suc.id}
              className="bg-[#1B1B21] border border-[#33333C] overflow-hidden flex flex-col justify-between shadow-xl"
            >
              {/* Banner Header */}
              <div>
                <div className={`p-8 border-b ${isNorte ? 'bg-gradient-to-br from-[#1F1F26] to-[#0F0F12] border-[#A6822D]' : 'bg-gradient-to-br from-[#16172A] to-[#0D0D14] border-[#4A6899]'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-mono text-xs tracking-[0.25em] uppercase ${isNorte ? 'text-[#E8B84A]' : 'text-[#8DB4FF]'}`}>
                      — SUCURSAL {planIndex} · {suc.nombre.split(' - ')[1] || suc.nombre.toUpperCase()}
                    </span>
                    <div className={`flex items-center gap-2 px-3 py-1 border rounded-sm ${
                      suc.estado === 'ACTIVA'
                        ? 'bg-[#0F1F14] border-[#4ADE80]/40'
                        : 'bg-[#2E1818] border-red-500/40'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${suc.estado === 'ACTIVA' ? 'bg-[#4ADE80] animate-pulse' : 'bg-red-500'}`}></span>
                      <span className={`font-mono text-[10px] tracking-widest font-bold ${
                        suc.estado === 'ACTIVA' ? 'text-[#4ADE80]' : 'text-red-400'
                      }`}>
                        {suc.estado === 'ACTIVA' ? 'ABIERTO' : 'CERRADO'}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display tracking-widest text-3xl sm:text-4xl text-[#F5EFE0] leading-tight uppercase">
                    {suc.nombre}
                  </h3>
                </div>

                {/* Details Data Grid */}
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#A5A5AF] uppercase mb-1 flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#E8B84A]" />
                      <span>DIRECCIÓN</span>
                    </div>
                    <div className="text-[#F5EFE0] font-medium leading-relaxed">
                      {suc.direccion}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#A5A5AF] uppercase mb-1 flex items-center gap-1.5">
                      <User size={12} className="text-[#E8B84A]" />
                      <span>ENCARGADO</span>
                    </div>
                    <div className="text-[#F5EFE0] font-semibold">{suc.encargado || 'Por asignar'}</div>
                    <div className="font-mono text-[#A5A5AF] text-[11px] mt-0.5">{suc.telefono}</div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#A5A5AF] uppercase mb-1 flex items-center gap-1.5">
                      <Clock size={12} className="text-[#E8B84A]" />
                      <span>HORARIO</span>
                    </div>
                    <div className="text-[#F5EFE0] font-mono leading-relaxed">
                      {suc.horario || 'L-V · 06:00 - 22:00 | S · 07:00 - 20:00'}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#A5A5AF] uppercase mb-1 flex items-center gap-1.5">
                      <Users size={12} className="text-[#E8B84A]" />
                      <span>CAPACIDAD</span>
                    </div>
                    <div className="text-[#F5EFE0] font-medium">{suc.capacidad || 40} atletas</div>
                    <div className="text-[#A5A5AF]">por sesión de combate/sparring</div>
                  </div>
                </div>

                {/* Real Live Metrics Bar from Database */}
                <div className="mx-8 py-4 border-t border-[#33333C] grid grid-cols-3 text-center">
                  <div>
                    <div className="font-display text-2xl text-[#E8B84A] leading-none">
                      {suc.sociosCount ?? 0}
                    </div>
                    <div className="font-mono text-[9px] tracking-wider text-[#A5A5AF] mt-1">SOCIOS REG.</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl text-[#F5EFE0] leading-none">
                      {suc.ingresosMes || '$0'}
                    </div>
                    <div className="font-mono text-[9px] tracking-wider text-[#A5A5AF] mt-1">ING. MES REAL</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl text-[#F5EFE0] leading-none">
                      {suc.asistenciasSemana ?? 0}
                    </div>
                    <div className="font-mono text-[9px] tracking-wider text-[#A5A5AF] mt-1">ASIST. 7 DÍAS</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Full Edit Functionality */}
              <div className="p-8 pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(suc)}
                  className="flex-1 py-2.5 border border-[#A6822D] bg-[#E8B84A]/10 hover:bg-[#E8B84A] text-[#E8B84A] hover:text-[#1A1206] font-mono text-xs tracking-widest font-bold text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit size={14} />
                  <span>EDITAR SEDE</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleEstado(suc.id)}
                  className={`flex-1 py-2.5 border font-mono text-xs tracking-widest font-bold text-center transition-colors ${
                    suc.estado === 'ACTIVA'
                      ? 'border-[#3A3A42] text-[#A5A5AF] hover:text-red-400 hover:border-red-500'
                      : 'border-green-600 text-green-400 hover:bg-green-950/30'
                  }`}
                >
                  {suc.estado === 'ACTIVA' ? 'INACTIVAR' : 'ACTIVAR'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: REGISTRAR / EDITAR SUCURSAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-[#E8B84A] max-w-lg w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#A5A5AF] hover:text-[#F5EFE0]"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#E8B84A] uppercase">
                FORMULARIO OPERATIVO · SEDES
              </span>
              <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider mt-1">
                {editingSucursal ? 'EDITAR SUCURSAL EXISTENTE' : 'REGISTRAR NUEVA SUCURSAL'}
              </h3>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSucursal} className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-[#A5A5AF] uppercase">Nombre de la Sede *</label>
                  {touched.nombre && !formErrors.nombre && (
                    <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Válido
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sucursal Valles - Cumbayá"
                  value={formData.nombre}
                  onChange={(e) => handleFieldChange('nombre', e.target.value)}
                  onBlur={() => handleFieldBlur('nombre')}
                  className={`w-full bg-[#1B1B21] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                    touched.nombre && formErrors.nombre
                      ? 'border-red-500 bg-red-950/10'
                      : touched.nombre
                      ? 'border-[#4ADE80]/60'
                      : 'border-[#33333C] focus:border-[#E8B84A]'
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
                  <label className="text-[10px] text-[#A5A5AF] uppercase">Dirección Completa *</label>
                  {touched.direccion && !formErrors.direccion && (
                    <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Válido
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ej. Av. Interoceánica km 12, Edif. Boxing Valles"
                  value={formData.direccion}
                  onChange={(e) => handleFieldChange('direccion', e.target.value)}
                  onBlur={() => handleFieldBlur('direccion')}
                  className={`w-full bg-[#1B1B21] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                    touched.direccion && formErrors.direccion
                      ? 'border-red-500 bg-red-950/10'
                      : touched.direccion
                      ? 'border-[#4ADE80]/60'
                      : 'border-[#33333C] focus:border-[#E8B84A]'
                  }`}
                />
                {touched.direccion && formErrors.direccion && (
                  <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                    <AlertCircle size={10} /> {formErrors.direccion}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#A5A5AF] uppercase">Teléfono Móvil (09...) *</label>
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
                    placeholder="Ej. 0998877665"
                    value={formData.telefono}
                    onChange={(e) => handleFieldChange('telefono', e.target.value)}
                    onBlur={() => handleFieldBlur('telefono')}
                    onKeyDown={handleKeyDownSoloNumeros}
                    className={`w-full bg-[#1B1B21] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.telefono && formErrors.telefono
                        ? 'border-red-500 bg-red-950/10'
                        : touched.telefono
                        ? 'border-[#4ADE80]/60'
                        : 'border-[#33333C] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.telefono && formErrors.telefono && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.telefono}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#A5A5AF] uppercase">Correo Electrónico</label>
                    {touched.email && !formErrors.email && formData.email && (
                      <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    placeholder="valles@boxcontrol.com"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    className={`w-full bg-[#1B1B21] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                      touched.email && formErrors.email
                        ? 'border-red-500 bg-red-950/10'
                        : touched.email && formData.email
                        ? 'border-[#4ADE80]/60'
                        : 'border-[#33333C] focus:border-[#E8B84A]'
                    }`}
                  />
                  {touched.email && formErrors.email && (
                    <span className="text-red-400 text-[10px] mt-1 block flex items-center gap-1">
                      <AlertCircle size={10} /> {formErrors.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Encargado y Capacidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#A5A5AF] uppercase mb-1">Encargado / Head Coach</label>
                  <input
                    type="text"
                    placeholder="Ej. Robert Paredes"
                    value={formData.encargado}
                    onChange={(e) => handleFieldChange('encargado', e.target.value)}
                    className="w-full bg-[#1B1B21] border border-[#33333C] px-3 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#A5A5AF] uppercase mb-1">Capacidad Máxima (Atletas)</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="Ej. 40"
                    value={formData.capacidad}
                    onChange={(e) => handleFieldChange('capacidad', e.target.value)}
                    onKeyDown={handleKeyDownSoloNumeros}
                    className="w-full bg-[#1B1B21] border border-[#33333C] px-3 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                  />
                </div>
              </div>

              {/* Horario de Atención */}
              <div>
                <label className="block text-[10px] text-[#A5A5AF] uppercase mb-1">Horarios de Atención</label>
                <input
                  type="text"
                  placeholder="Ej. L-V · 06:00 - 22:00 | S · 07:00 - 20:00"
                  value={formData.horario}
                  onChange={(e) => handleFieldChange('horario', e.target.value)}
                  className="w-full bg-[#1B1B21] border border-[#33333C] px-3 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                />
              </div>

              {/* Estado Operativo */}
              <div>
                <label className="block text-[10px] text-[#A5A5AF] uppercase mb-1">Estado de Operación</label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleFieldChange('estado', e.target.value)}
                  className="w-full bg-[#1B1B21] border border-[#33333C] px-3 py-2 text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
                >
                  <option value="ACTIVA">ACTIVA (En operación continua)</option>
                  <option value="INACTIVA">INACTIVA (Mantenimiento / Pausada)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#3A3A42] text-[#A5A5AF] hover:text-[#F5EFE0] hover:bg-[#232329] font-mono text-xs uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || (touched.nombre && formErrors.nombre) || (touched.direccion && formErrors.direccion) || (touched.telefono && formErrors.telefono) || (touched.email && formErrors.email)}
                  className="flex-1 py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-widest font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {submitLoading ? 'GUARDANDO...' : (editingSucursal ? 'ACTUALIZAR SEDE' : 'GUARDAR EN BD')}
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
