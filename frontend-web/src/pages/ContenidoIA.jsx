import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Sparkles, Check, X, RefreshCw, Edit3, Smartphone, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContenidoIA() {
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('BORRADOR'); // 'BORRADOR' | 'PUBLICADO' | 'RECHAZADO'
  const [contadores, setContadores] = useState({ pendientes: 3, publicados: 24, rechazados: 1 });
  const [selectedContenido, setSelectedContenido] = useState(null);

  // Parámetros del Generador IA (Matching Mockup 09)
  const [tipo, setTipo] = useState('RUTINA'); // 'RUTINA' | 'ALIMENTACION'
  const [nivel, setNivel] = useState('INTERMEDIO'); // 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO'
  const [duracion, setDuracion] = useState('45 MINUTOS');
  const [focosSeleccionados, setFocosSeleccionados] = useState(['SHADOW BOX', 'CARDIO']);
  const [instrucciones, setInstrucciones] = useState('Enfocado en preparar al socio antes de un sparring ligero. Maximizar movilidad y balance.');
  const [generating, setGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modal de Edición Curatorial
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editResumen, setEditResumen] = useState('');

  const focosDisponiblesRutina = ['SHADOW BOX', 'CARDIO', 'SPARRING', 'CORE', 'FUERZA', 'VELOCIDAD'];
  const focosDisponiblesNutricion = ['CORTE DE PESO', 'POTENCIA', 'VOLUMEN', 'RECUPERACIÓN', 'ANTIINFLAMATORIO'];

  const fetchContenidos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contenido-ia', {
        params: { estado: filterEstado },
      });

      if (res.data?.success) {
        setContenidos(res.data.data);
        if (res.data.contadores) {
          setContadores(res.data.contadores);
        }
        if (res.data.data.length > 0) {
          setSelectedContenido(res.data.data[0]);
        } else {
          setSelectedContenido(null);
        }
      }
    } catch (err) {
      console.error('Error fetching contenidos IA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContenidos();
  }, [filterEstado]);

  const toggleFoco = (foco) => {
    if (focosSeleccionados.includes(foco)) {
      setFocosSeleccionados(focosSeleccionados.filter((f) => f !== foco));
    } else {
      setFocosSeleccionados([...focosSeleccionados, foco]);
    }
  };

  const handleGenerar = async (e) => {
    if (e) e.preventDefault();
    if (focosSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un foco de entrenamiento o nutrición.');
      return;
    }
    if (!instrucciones.trim() || instrucciones.trim().length < 10) {
      alert('Por favor redacta al menos 10 caracteres con las especificaciones para la IA.');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        tipo,
        nivel,
        duracion,
        foco: focosSeleccionados,
        instrucciones,
      };

      const res = await api.post('/contenido-ia/generar', payload);
      if (res.data?.success) {
        setToastMsg('¡Nuevo contenido generado por IA con éxito! Revisar en el simulador móvil.');
        setFilterEstado('BORRADOR');
        await fetchContenidos();
        setSelectedContenido(res.data.data);
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al generar contenido con IA.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!selectedContenido) return;
    try {
      const res = await api.patch(`/contenido-ia/${selectedContenido.id}/estado`, {
        estado: nuevoEstado,
      });

      if (res.data?.success) {
        const msg = nuevoEstado === 'PUBLICADO'
          ? '✓ Contenido aprobado y publicado en la App Móvil con éxito.'
          : '✕ Contenido rechazado y descartado.';
        setToastMsg(msg);
        fetchContenidos();
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar estado.');
    }
  };

  const handleOpenEdit = () => {
    if (!selectedContenido) return;
    setEditTitle(selectedContenido.titulo);
    setEditResumen(selectedContenido.detalleEstructurado?.resumen || selectedContenido.descripcion);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedContenido) return;
    try {
      const parsed = {
        ...(selectedContenido.detalleEstructurado || {}),
        resumen: editResumen,
      };

      await api.put(`/contenido-ia/${selectedContenido.id}`, {
        titulo: editTitle,
        descripcion: parsed,
      });

      setShowEditModal(false);
      setToastMsg('Contenido editado con éxito.');
      fetchContenidos();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert('Error al guardar cambios.');
    }
  };

  const detalle = selectedContenido?.detalleEstructurado || {};
  const bloques = detalle.bloques || [];
  const comidas = detalle.comidas || [];

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#0B0B0D] min-h-[calc(100vh-75px)] select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-green-950/50 border-l-4 border-green-500 text-green-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Segmented Tabs (Matching Mockup 09 lines 32-45) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2A2A31]">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-[#82828A] uppercase">
            BORRADORES IA · {contadores.pendientes} PENDIENTES DE REVISAR (RF-W12)
          </div>
          <h2 className="font-display text-3xl text-[#F5EFE0] tracking-wider mt-0.5">
            CONTENIDO POR INTELIGENCIA ARTIFICIAL
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Filter (Matching Mockup 09) */}
          <div className="flex bg-[#141418] border border-[#2A2A31] p-0.5 font-mono text-xs">
            <button
              onClick={() => setFilterEstado('BORRADOR')}
              className={`px-3 py-1.5 font-bold transition-all ${
                filterEstado === 'BORRADOR'
                  ? 'bg-[#E8B84A] text-[#1A1206]'
                  : 'text-[#82828A] hover:text-[#F5EFE0]'
              }`}
            >
              PENDIENTES · {contadores.pendientes}
            </button>
            <button
              onClick={() => setFilterEstado('PUBLICADO')}
              className={`px-3 py-1.5 font-bold transition-all ${
                filterEstado === 'PUBLICADO'
                  ? 'bg-[#E8B84A] text-[#1A1206]'
                  : 'text-[#82828A] hover:text-[#F5EFE0]'
              }`}
            >
              PUBLICADOS · {contadores.publicados}
            </button>
            <button
              onClick={() => setFilterEstado('RECHAZADO')}
              className={`px-3 py-1.5 font-bold transition-all ${
                filterEstado === 'RECHAZADO'
                  ? 'bg-[#E8B84A] text-[#1A1206]'
                  : 'text-[#82828A] hover:text-[#F5EFE0]'
              }`}
            >
              RECHAZADOS ({contadores.rechazados})
            </button>
          </div>

          <button
            onClick={handleGenerar}
            disabled={generating}
            className="px-5 py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{generating ? 'GENERANDO...' : '✨ GENERAR NUEVO'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left Generator Panel + Right Phone Preview & Curatorship (Matching Mockup 09) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PARAMETER GENERATOR (Col-span 4) */}
        <div className="lg:col-span-4 p-6 bg-[#1B1B21] border border-[#2A2A31] flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] text-[#E8B84A] uppercase">
                — GENERADOR
              </div>
              <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider mt-0.5">
                PARÁMETROS DEL MOTOR
              </h3>
            </div>

            {/* Selector de Tipo (Rutina vs Alimentación) */}
            <div>
              <label className="block font-mono text-[10px] tracking-wider text-[#82828A] uppercase mb-2">
                TIPO DE CONTENIDO
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTipo('RUTINA');
                    setFocosSeleccionados(['SHADOW BOX', 'CARDIO']);
                  }}
                  className={`py-2 px-3 border font-mono text-xs tracking-wider transition-all ${
                    tipo === 'RUTINA'
                      ? 'bg-[#1F1810] border-[#E8B84A] text-[#E8B84A] font-bold'
                      : 'bg-[#141418] border-[#3A3A42] text-[#82828A]'
                  }`}
                >
                  {tipo === 'RUTINA' ? '✓ RUTINA' : 'RUTINA'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipo('ALIMENTACION');
                    setFocosSeleccionados(['POTENCIA', 'RECUPERACIÓN']);
                  }}
                  className={`py-2 px-3 border font-mono text-xs tracking-wider transition-all ${
                    tipo === 'ALIMENTACION'
                      ? 'bg-[#1F1810] border-[#E8B84A] text-[#E8B84A] font-bold'
                      : 'bg-[#141418] border-[#3A3A42] text-[#82828A]'
                  }`}
                >
                  {tipo === 'ALIMENTACION' ? '✓ ALIMENTACIÓN' : 'ALIMENTACIÓN'}
                </button>
              </div>
            </div>

            {/* Selector de Nivel */}
            <div>
              <label className="block font-mono text-[10px] tracking-wider text-[#82828A] uppercase mb-2">
                NIVEL DE EXIGENCIA
              </label>
              <div className="flex bg-[#141418] border border-[#2A2A31] p-0.5 font-mono text-xs">
                {['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNivel(n)}
                    className={`flex-1 py-1.5 font-bold transition-all text-center ${
                      nivel === n ? 'bg-[#E8B84A] text-[#1A1206]' : 'text-[#82828A] hover:text-[#F5EFE0]'
                    }`}
                  >
                    {n.slice(0, 6)}.
                  </button>
                ))}
              </div>
            </div>

            {/* Duración */}
            <div>
              <label className="block font-mono text-[10px] tracking-wider text-[#82828A] uppercase mb-1.5">
                DURACIÓN ESTIMADA
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-[#141418] border border-[#3A3A42] px-3.5 py-2 font-mono text-xs text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A]"
              >
                <option value="30 MINUTOS">30 MINUTOS (SESIÓN FLASH)</option>
                <option value="45 MINUTOS">45 MINUTOS (SESIÓN ESTÁNDAR)</option>
                <option value="60 MINUTOS">60 MINUTOS (SESIÓN PRO)</option>
              </select>
            </div>

            {/* Foco (Tags / Pills) */}
            <div>
              <label className="block font-mono text-[10px] tracking-wider text-[#82828A] uppercase mb-2">
                FOCO DE LA SESIÓN
              </label>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {(tipo === 'RUTINA' ? focosDisponiblesRutina : focosDisponiblesNutricion).map((f) => {
                  const isSelected = focosSeleccionados.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFoco(f)}
                      className={`px-2.5 py-1 border transition-all ${
                        isSelected
                          ? 'bg-[#1F1810] border-[#A6822D] text-[#E8B84A] font-bold'
                          : 'bg-transparent border-[#3A3A42] text-[#82828A] hover:text-[#F5EFE0]'
                      }`}
                    >
                      {isSelected ? `✓ ${f}` : `+ ${f}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instrucciones Adicionales con Validación */}
            <div>
              <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                <label className="tracking-wider text-[#82828A] uppercase">
                  INSTRUCCIONES ADICIONALES (PROMPT IA) *
                </label>
                <span className={instrucciones.trim().length >= 10 ? 'text-[#4ADE80]' : 'text-red-400'}>
                  {instrucciones.trim().length}/350 (mín. 10)
                </span>
              </div>
              <textarea
                rows="3"
                maxLength={350}
                value={instrucciones}
                onChange={(e) => setInstrucciones(e.target.value)}
                placeholder="Ej: Enfatizar técnica de piernas antes de un sparring ligero..."
                className={`w-full bg-[#141418] border p-3 font-sans text-xs text-[#F5EFE0] focus:outline-none transition-colors ${
                  instrucciones.trim().length > 0 && instrucciones.trim().length < 10
                    ? 'border-red-500'
                    : 'border-[#3A3A42] focus:border-[#E8B84A]'
                }`}
              ></textarea>
              {focosSeleccionados.length === 0 && (
                <div className="text-red-400 font-mono text-[10px] mt-1">
                  * Debes seleccionar al menos 1 foco
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerar}
            disabled={generating || focosSeleccionados.length === 0 || instrucciones.trim().length < 10}
            className="w-full py-3.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-base tracking-wider font-bold transition-all disabled:opacity-50"
          >
            {generating ? 'GENERANDO CON MOTOR IA...' : '✨ REGENERAR / CREAR CONTENIDO'}
          </button>
        </div>

        {/* RIGHT COLUMN: PREVIEW + CURATORSHIP CONTROLS (Col-span 8) */}
        <div className="lg:col-span-8 p-6 bg-[#1B1B21] border border-[#2A2A31] flex flex-col justify-between space-y-6">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2A2A31]">
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-[#E8B84A] uppercase">
                  — BORRADOR IA
                </div>
                <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider mt-0.5">
                  VISTA PREVIA · SIMULADOR APP MÓVIL
                </h3>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-[#82828A]">
                  GENERADO: <strong className="text-[#E8B84A]">{selectedContenido?.fechaFormateada || '07 SEP · 10:12'}</strong>
                </span>
                <span className={`px-2.5 py-1 border text-[10px] font-bold ${
                  selectedContenido?.estado === 'PUBLICADO'
                    ? 'bg-[#0F1F14] border-[#4ADE80]/40 text-[#4ADE80]'
                    : selectedContenido?.estado === 'RECHAZADO'
                    ? 'bg-[#2E1818] border-[#F87171]/40 text-[#F87171]'
                    : 'bg-[#2E2818] border-[#FBBF24]/40 text-[#FBBF24]'
                }`}>
                  {selectedContenido?.estado === 'PUBLICADO'
                    ? '● PUBLICADO EN APP'
                    : selectedContenido?.estado === 'RECHAZADO'
                    ? '✕ RECHAZADO'
                    : '◐ PENDIENTE REVISIÓN'}
                </span>
              </div>
            </div>

            {/* Split: Smartphone Mockup on Left + Curatorship Form on Right */}
            {selectedContenido ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-start">
                {/* Smartphone Preview Frame (Matching Mockup 09 lines 107-146) */}
                <div className="md:col-span-5 bg-[#0B0B0D] border-2 border-[#232329] p-5 shadow-2xl space-y-4">
                  <div className="w-16 h-1 bg-[#232329] mx-auto rounded-full mb-3"></div>

                  <div className="font-mono text-[9px] tracking-wider text-[#E8B84A] uppercase">
                    {tipo === 'RUTINA' ? `SESIÓN DE HOY · ${selectedContenido.nivel}` : `NUTRICIÓN · ${selectedContenido.nivel}`}
                  </div>

                  <h4 className="font-display text-2xl text-[#F5EFE0] tracking-wide leading-tight">
                    {selectedContenido.titulo}
                  </h4>

                  <p className="text-xs text-[#82828A] leading-relaxed">
                    {detalle.resumen || selectedContenido.descripcion}
                  </p>

                  {/* Badges strip (45 MIN | 5 BLOQUES | 380 KCAL) */}
                  <div className="pt-3 border-t border-[#2A2A31] grid grid-cols-3 gap-2 text-center font-mono">
                    <div>
                      <div className="font-display text-2xl text-[#E8B84A] leading-none">
                        {detalle.duracion ? detalle.duracion.split(' ')[0] : '45'}
                      </div>
                      <div className="text-[8px] text-[#82828A]">MIN</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl text-[#E8B84A] leading-none">
                        {tipo === 'RUTINA' ? (bloques.length || 5) : (comidas.length || 4)}
                      </div>
                      <div className="text-[8px] text-[#82828A]">
                        {tipo === 'RUTINA' ? 'BLOQUES' : 'TIEMPOS'}
                      </div>
                    </div>
                    <div>
                      <div className="font-display text-2xl text-[#E8B84A] leading-none">
                        {detalle.caloriasAprox || 380}
                      </div>
                      <div className="text-[8px] text-[#82828A]">KCAL</div>
                    </div>
                  </div>

                  {/* Blocks List */}
                  <div className="pt-2">
                    <div className="font-mono text-[9px] tracking-wider text-[#82828A] uppercase mb-2">
                      — {tipo === 'RUTINA' ? 'BLOQUES DE TRABAJO' : 'PLAN DE COMIDAS'}
                    </div>

                    <div className="divide-y divide-[#2A2A31] text-xs">
                      {tipo === 'RUTINA' ? (
                        bloques.map((b, i) => (
                          <div key={i} className="py-2 flex justify-between items-start gap-2">
                            <div>
                              <div className="font-sans text-[#F5EFE0] font-medium">{b.paso}</div>
                              {b.detalle && (
                                <div className="text-[10px] text-[#82828A] mt-0.5">{b.detalle}</div>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-[#E8B84A] shrink-0">
                              {b.duracion}
                            </span>
                          </div>
                        ))
                      ) : (
                        comidas.map((c, i) => (
                          <div key={i} className="py-2 space-y-0.5">
                            <div className="font-bold text-[#E8B84A] text-[11px]">{c.momento}</div>
                            <div className="text-[#F5EFE0] text-xs">{c.plato}</div>
                            {c.detalle && (
                              <div className="text-[10px] text-[#82828A]">{c.detalle}</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Curatorship Controls on Right (Matching Mockup 09 lines 148-180) */}
                <div className="md:col-span-7 space-y-5 font-mono text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] tracking-wider text-[#82828A] uppercase">TÍTULO PROPUESTO</span>
                      <button
                        onClick={handleOpenEdit}
                        className="text-[#E8B84A] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Edit3 size={13} />
                        <span>EDITAR</span>
                      </button>
                    </div>
                    <div className="p-3 bg-[#141418] border border-[#2A2A31] font-display text-xl text-[#F5EFE0] tracking-wide">
                      {selectedContenido.titulo}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] tracking-wider text-[#82828A] uppercase mb-1">
                      DESCRIPCIÓN CURADA
                    </span>
                    <div className="p-3 bg-[#141418] border border-[#2A2A31] font-sans text-xs text-[#B8B8BE] leading-relaxed">
                      {detalle.resumen || selectedContenido.descripcion}
                    </div>
                  </div>

                  {/* Motor IA Card */}
                  <div className="p-3.5 bg-[#141418] border border-[#2A2A31] flex items-center gap-3">
                    <div className="p-2 bg-[#1F1810] border border-[#E8B84A] text-[#E8B84A] rounded-full">
                      <Bot size={20} />
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-[#F5EFE0]">
                        OpenAI GPT-4 / Boxing Domain Intelligence
                      </div>
                      <div className="text-[10px] text-[#82828A] mt-0.5">
                        TOKENS: 842 · ESTADO: CONECTADO · ID: #IA-{selectedContenido.id}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons (Matching Mockup 09 lines 170-179) */}
                  <div className="pt-4 border-t border-[#2A2A31] flex flex-wrap gap-2.5">
                    {selectedContenido.estado !== 'RECHAZADO' && (
                      <button
                        onClick={() => handleCambiarEstado('RECHAZADO')}
                        className="px-4 py-3 border border-[#F87171] text-[#F87171] hover:bg-[#F87171] hover:text-white font-display text-sm tracking-wider font-bold transition-colors"
                      >
                        ✕ RECHAZAR
                      </button>
                    )}

                    <button
                      onClick={handleGenerar}
                      disabled={generating}
                      className="px-4 py-3 border border-[#FBBF24] text-[#FBBF24] hover:bg-[#FBBF24] hover:text-[#1A1206] font-display text-sm tracking-wider font-bold transition-colors"
                    >
                      ↻ REGENERAR
                    </button>

                    {selectedContenido.estado !== 'PUBLICADO' && (
                      <button
                        onClick={() => handleCambiarEstado('PUBLICADO')}
                        className="flex-1 py-3 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-base tracking-wider font-bold transition-all shadow-md"
                      >
                        ✓ APROBAR Y PUBLICAR EN APP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-[#82828A] font-mono">
                No hay contenidos en el estado seleccionado ({filterEstado}).
                <div className="mt-3">
                  <button
                    onClick={handleGenerar}
                    className="px-4 py-2 bg-[#E8B84A] text-[#1A1206] font-display text-xs font-bold"
                  >
                    + Generar primer borrador
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Editar Título / Resumen */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#1B1B21] border border-[#A6822D] shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A2A31]">
              <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                EDITAR CONTENIDO CURADO
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-[#82828A] hover:text-[#F5EFE0]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-[#82828A] uppercase">Título del Contenido (mín. 3) *</label>
                  {editTitle.trim().length >= 3 && (
                    <span className="text-[#4ADE80] text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Válido
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full bg-[#141418] border px-3 py-2 text-[#F5EFE0] focus:outline-none transition-colors ${
                    editTitle.trim().length < 3 ? 'border-red-500' : 'border-[#3A3A42] focus:border-[#E8B84A]'
                  }`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-[#82828A] uppercase">Descripción / Resumen (mín. 10) *</label>
                  <span className={editResumen.trim().length >= 10 ? 'text-[#4ADE80]' : 'text-red-400'}>
                    {editResumen.trim().length}/500
                  </span>
                </div>
                <textarea
                  rows="4"
                  maxLength={500}
                  required
                  value={editResumen}
                  onChange={(e) => setEditResumen(e.target.value)}
                  className={`w-full bg-[#141418] border p-3 text-[#F5EFE0] font-sans focus:outline-none transition-colors ${
                    editResumen.trim().length < 10 ? 'border-red-500' : 'border-[#3A3A42] focus:border-[#E8B84A]'
                  }`}
                ></textarea>
              </div>

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
                  disabled={editTitle.trim().length < 3 || editResumen.trim().length < 10}
                  className="px-5 py-2 bg-[#E8B84A] text-[#1A1206] font-display text-sm font-bold tracking-wider hover:bg-[#D4A538] transition-colors disabled:opacity-50"
                >
                  GUARDAR EDICIÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
