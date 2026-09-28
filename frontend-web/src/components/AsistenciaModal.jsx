import React, { useState } from 'react';
import api from '../api/axios';
import { X, QrCode, CheckCircle2, AlertTriangle, User, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function AsistenciaModal({ isOpen, onClose, onCheckInSuccess, onOpenPago }) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!codigo.trim()) return;

    setLoading(true);
    setResultado(null);
    setErrorMsg('');

    try {
      const isQr = codigo.startsWith('GD-') || codigo.includes('QR');
      const payload = isQr
        ? { codigoQr: codigo.trim(), metodo: 'QR_SCAN' }
        : { cedula: codigo.trim(), metodo: 'MANUAL' };

      const res = await api.post('/asistencias/checkin', payload);
      if (res.data?.success) {
        setResultado({
          tipo: 'EXITO',
          mensaje: res.data.message,
          socio: res.data.data?.socio,
          sucursal: res.data.data?.sucursal,
          hora: new Date(res.data.data?.fechaHora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        });
        if (onCheckInSuccess) onCheckInSuccess();
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp && resp.permitido === false) {
        setResultado({
          tipo: 'DENEGADO',
          mensaje: resp.message,
          socio: resp.socio,
        });
      } else {
        setErrorMsg(resp?.message || 'Error al procesar el acceso del socio.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = (valor) => {
    setCodigo(valor);
    setTimeout(() => {
      // auto submit
      handleSubmitQuick(valor);
    }, 100);
  };

  const handleSubmitQuick = async (val) => {
    setLoading(true);
    setResultado(null);
    setErrorMsg('');
    try {
      const isQr = val.startsWith('GD-');
      const payload = isQr
        ? { codigoQr: val, metodo: 'QR_SCAN' }
        : { cedula: val, metodo: 'MANUAL' };

      const res = await api.post('/asistencias/checkin', payload);
      setResultado({
        tipo: 'EXITO',
        mensaje: res.data.message,
        socio: res.data.data?.socio,
        sucursal: res.data.data?.sucursal,
        hora: new Date(res.data.data?.fechaHora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      });
      if (onCheckInSuccess) onCheckInSuccess();
    } catch (err) {
      const resp = err.response?.data;
      if (resp && resp.permitido === false) {
        setResultado({
          tipo: 'DENEGADO',
          mensaje: resp.message,
          socio: resp.socio,
        });
      } else {
        setErrorMsg(resp?.message || 'Error al procesar el acceso del socio.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCodigo('');
    setResultado(null);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#1B1B21] border border-[#A6822D] shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#2A2A31]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1F1810] border border-[#E8B84A] text-[#E8B84A]">
              <QrCode size={22} />
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[0.25em] text-[#E8B84A] uppercase">
                CONTROL DE ACCESO · RF-M03
              </div>
              <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                VALIDAR ASISTENCIA EN VIVO
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario de Entrada */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
              <label className="tracking-wider text-[#82828A] uppercase">
                Escanea el código QR o digita la cédula del socio:
              </label>
              {codigo.trim().length === 10 && /^\d{10}$/.test(codigo.trim()) && (
                <span className="text-[#4ADE80] flex items-center gap-1">
                  <CheckCircle2 size={11} /> Cédula (10d)
                </span>
              )}
              {codigo.trim().startsWith('GD-') && (
                <span className="text-[#E8B84A] flex items-center gap-1">
                  <QrCode size={11} /> Carnet QR Oficial
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Ej: GD-SOCIO-1723456789 ó 1723456789"
                value={codigo}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase();
                  setCodigo(cleaned);
                }}
                className="flex-1 bg-[#141418] border border-[#3A3A42] px-3.5 py-2.5 font-mono text-sm text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A] transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !codigo.trim() || (codigo.trim().length < 6)}
                className="px-5 py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold transition-colors disabled:opacity-50"
              >
                {loading ? 'VALIDANDO...' : 'REGISTRAR'}
              </button>
            </div>
            <div className="text-[10px] font-mono text-[#82828A] mt-1">
              Filtro de teclado activo: solo caracteres alfanuméricos y guiones permitidos.
            </div>
          </div>
        </form>

        {/* Acceso Rápido para Demostración */}
        <div className="mt-4 pt-3 border-t border-[#2A2A31]">
          <div className="font-mono text-[9px] tracking-wider text-[#82828A] mb-2 uppercase">
            Prueba rápida de demostración (1-clic):
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickTest('1723456784')}
              className="px-2.5 py-1.5 bg-[#141418] border border-[#3A3A42] hover:border-[#4ADE80] text-left transition-colors"
            >
              <div className="font-mono text-[10px] text-[#4ADE80] font-bold">✓ Marco Rivera</div>
              <div className="font-mono text-[8px] text-[#82828A]">CI: 1723456784 · ACTIVO</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest('1728374651')}
              className="px-2.5 py-1.5 bg-[#141418] border border-[#3A3A42] hover:border-[#F87171] text-left transition-colors"
            >
              <div className="font-mono text-[10px] text-[#F87171] font-bold">✕ Carlos Mendoza</div>
              <div className="font-mono text-[8px] text-[#82828A]">CI: 1728374651 · VENCIDO</div>
            </button>
          </div>
        </div>

        {/* Error genérico */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Resultado en Vivo */}
        {resultado && (
          <div
            className={`mt-6 p-5 border ${
              resultado.tipo === 'EXITO'
                ? 'bg-[#0F1F14] border-[#4ADE80]/50'
                : 'bg-[#2E1818] border-[#F87171]/50'
            } animate-fadeIn`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full shrink-0 ${
                  resultado.tipo === 'EXITO'
                    ? 'bg-[#1E2E1E] text-[#4ADE80]'
                    : 'bg-[#3D1A1A] text-[#F87171]'
                }`}
              >
                {resultado.tipo === 'EXITO' ? (
                  <CheckCircle2 size={32} />
                ) : (
                  <AlertTriangle size={32} />
                )}
              </div>

              <div className="flex-1">
                <div
                  className={`font-display text-xl tracking-wider ${
                    resultado.tipo === 'EXITO' ? 'text-[#4ADE80]' : 'text-[#F87171]'
                  }`}
                >
                  {resultado.tipo === 'EXITO' ? '¡ACCESO CONCEDIDO!' : '¡ACCESO DENEGADO!'}
                </div>
                <div className="text-xs text-[#F5EFE0] font-sans mt-0.5">
                  {resultado.mensaje}
                </div>

                {resultado.socio && (
                  <div className="mt-3 pt-3 border-t border-current/20 space-y-1 font-mono text-[11px] text-[#B8B8BE]">
                    <div>
                      Socio:{' '}
                      <strong className="text-[#F5EFE0]">
                        {resultado.socio.nombreCompleto}
                      </strong>
                    </div>
                    <div>
                      Cédula: <strong>{resultado.socio.cedula}</strong>
                    </div>
                    {resultado.socio.plan && (
                      <div>
                        Plan: <strong className="text-[#E8B84A]">{resultado.socio.plan}</strong>
                      </div>
                    )}
                    {resultado.socio.diasRestantes !== undefined && (
                      <div>
                        Vigencia:{' '}
                        <strong className="text-[#4ADE80]">
                          {resultado.socio.diasRestantes} días restantes
                        </strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Botón de cobro si está denegado */}
                {resultado.tipo === 'DENEGADO' && onOpenPago && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPago(resultado.socio?.id);
                      }}
                      className="w-full py-2 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>⚡ RENOVAR MEMBRESÍA Y COBRAR EN CAJA</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-current/20 flex justify-between items-center text-[10px] font-mono text-[#82828A]">
              <span>MÉTODO: {codigo.startsWith('GD-') ? 'CÓDIGO QR' : 'CÉDULA MANUAL'}</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[#E8B84A] hover:underline"
              >
                + Validar siguiente socio
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#2A2A31] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#3A3A42] bg-[#141418] hover:border-[#82828A] text-[#82828A] hover:text-[#F5EFE0] font-mono text-xs tracking-wider transition-colors"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
}
