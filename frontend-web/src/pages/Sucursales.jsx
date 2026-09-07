import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { MapPin, Phone, User, Clock, Users, Plus, Check, RefreshCw, X, AlertCircle } from 'lucide-react';

export default function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

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

  const handleToggleEstado = async (id) => {
    try {
      await api.patch(`/sucursales/${id}/toggle-estado`);
      setFeedbackMsg('Estado de sucursal actualizado con éxito.');
      fetchSucursales();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert('Error al modificar estado: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateSucursal = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.post('/sucursales', formData);
      setShowModal(false);
      setFormData({ nombre: '', direccion: '', telefono: '', email: '' });
      setFeedbackMsg('Nueva sucursal registrada exitosamente en MySQL.');
      fetchSucursales();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert('Error al crear sucursal: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#0B0B0D] min-h-[calc(100vh-85px)] select-none">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A31]">
        <div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#82828A] uppercase">
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
            className="p-2 border border-[#3A3A42] bg-[#141418] hover:border-[#E8B84A] text-[#82828A] hover:text-[#F5EFE0] transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowModal(true)}
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
          const encargado = isNorte ? 'Robert Paredes' : 'Jonathan Jiron';
          const sociosCount = isNorte ? 84 : 58;
          const ingresos = isNorte ? '$4,300' : '$2,410';
          const asistencias = isNorte ? '218' : '164';

          return (
            <div
              key={suc.id}
              className="bg-[#1B1B21] border border-[#2A2A31] overflow-hidden flex flex-col justify-between shadow-xl"
            >
              {/* Banner Header */}
              <div>
                <div className={`p-8 border-b ${isNorte ? 'bg-gradient-to-br from-[#1F1F26] to-[#0F0F12] border-[#A6822D]' : 'bg-gradient-to-br from-[#16172A] to-[#0D0D14] border-[#4A6899]'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-mono text-xs tracking-[0.25em] uppercase ${isNorte ? 'text-[#E8B84A]' : 'text-[#8DB4FF]'}`}>
                      — SUCURSAL 0{idx + 1} {isNorte ? '· MATRIZ' : '· SUR'}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#0F1F14] border border-[#4ADE80]/40 rounded-sm">
                      <span className={`w-2 h-2 rounded-full ${suc.estado === 'ACTIVA' ? 'bg-[#4ADE80] animate-pulse' : 'bg-red-500'}`}></span>
                      <span className="font-mono text-[10px] tracking-widest text-[#4ADE80] font-bold">
                        {suc.estado === 'ACTIVA' ? 'ABIERTO' : 'CERRADO'}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display tracking-widest text-4xl sm:text-5xl text-[#F5EFE0] leading-tight uppercase">
                    {suc.nombre}
                  </h3>
                </div>

                {/* Details Data Grid */}
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase mb-1 flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#E8B84A]" />
                      <span>DIRECCIÓN</span>
                    </div>
                    <div className="text-[#F5EFE0] font-medium leading-relaxed">
                      {suc.direccion}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase mb-1 flex items-center gap-1.5">
                      <User size={12} className="text-[#E8B84A]" />
                      <span>ENCARGADO</span>
                    </div>
                    <div className="text-[#F5EFE0] font-semibold">{encargado}</div>
                    <div className="font-mono text-[#82828A] text-[11px]">{suc.telefono}</div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase mb-1 flex items-center gap-1.5">
                      <Clock size={12} className="text-[#E8B84A]" />
                      <span>HORARIO</span>
                    </div>
                    <div className="text-[#F5EFE0] font-mono">L-V · 06:00 - 22:00</div>
                    <div className="text-[#82828A] font-mono">S · 07:00 - 20:00</div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[#82828A] uppercase mb-1 flex items-center gap-1.5">
                      <Users size={12} className="text-[#E8B84A]" />
                      <span>CAPACIDAD</span>
                    </div>
                    <div className="text-[#F5EFE0] font-medium">40 atletas</div>
                    <div className="text-[#82828A]">por sesión de sparring</div>
                  </div>
                </div>

                {/* Micro Stats Bar */}
                <div className="mx-8 py-4 border-t border-[#2A2A31] grid grid-cols-3 text-center">
                  <div>
                    <div className="font-display text-2xl text-[#E8B84A] leading-none">{sociosCount}</div>
                    <div className="font-mono text-[9px] tracking-wider text-[#82828A] mt-1">SOCIOS</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl text-[#F5EFE0] leading-none">{ingresos}</div>
                    <div className="font-mono text-[9px] tracking-wider text-[#82828A] mt-1">ING. MES</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl text-[#F5EFE0] leading-none">{asistencias}</div>
                    <div className="font-mono text-[9px] tracking-wider text-[#82828A] mt-1">ASIST. SEM.</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => alert(`Detalles de ${suc.nombre}:\nEmail: ${suc.email || 'N/A'}\nTeléfono: ${suc.telefono}\nRegistrada en MySQL con ID #${suc.id}`)}
                  className="flex-1 py-2.5 border border-[#A6822D] hover:bg-[#E8B84A]/10 text-[#E8B84A] font-mono text-xs tracking-widest font-bold text-center transition-colors"
                >
                  VER DETALLE
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleEstado(suc.id)}
                  className={`flex-1 py-2.5 border font-mono text-xs tracking-widest font-bold text-center transition-colors ${
                    suc.estado === 'ACTIVA'
                      ? 'border-[#3A3A42] text-[#82828A] hover:text-red-400 hover:border-red-500'
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

      {/* MODAL: REGISTRAR NUEVA SUCURSAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-[#E8B84A] max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#82828A] hover:text-[#F5EFE0]"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#E8B84A] uppercase">
                FORMULARIO OPERATIVO
              </span>
              <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider mt-1">
                REGISTRAR NUEVA SUCURSAL
              </h3>
            </div>

            <form onSubmit={handleCreateSucursal} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-[#82828A] uppercase mb-1">Nombre de la Sede</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sucursal Valles - Cumbayá"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-[#1B1B21] border border-[#2A2A31] px-3 py-2 text-xs text-[#F5EFE0] focus:border-[#E8B84A] outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#82828A] uppercase mb-1">Dirección Completa</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Av. Interoceánica km 12"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full bg-[#1B1B21] border border-[#2A2A31] px-3 py-2 text-xs text-[#F5EFE0] focus:border-[#E8B84A] outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#82828A] uppercase mb-1">Teléfono / Celular</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 0998877665"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full bg-[#1B1B21] border border-[#2A2A31] px-3 py-2 text-xs text-[#F5EFE0] focus:border-[#E8B84A] outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#82828A] uppercase mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  placeholder="valles@boxcontrol.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1B1B21] border border-[#2A2A31] px-3 py-2 text-xs text-[#F5EFE0] focus:border-[#E8B84A] outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#3A3A42] text-[#82828A] hover:text-[#F5EFE0] font-mono text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-widest font-bold uppercase disabled:opacity-50"
                >
                  {submitLoading ? 'GUARDANDO...' : 'GUARDAR EN BD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
