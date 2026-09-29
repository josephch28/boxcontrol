import React from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle2, Info, RefreshCw } from 'lucide-react';

/**
 * Modal de confirmación para acciones críticas (ej: dar de baja socio, eliminar, desactivar)
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'CONFIRMAR ACCIÓN',
  subtitle = 'CONTROL OPERATIVO · BOXCONTROL',
  message,
  confirmText = 'CONFIRMAR',
  cancelText = 'CANCELAR',
  variant = 'warning', // 'danger' | 'warning' | 'primary' | 'success'
  loading = false,
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle size={22} className="text-red-400" />,
          iconBg: 'bg-red-950/40 border-red-500/40 text-red-400',
          btnClass: 'bg-red-600 hover:bg-red-700 text-white',
          borderModal: 'border-red-500/50',
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={22} className="text-green-400" />,
          iconBg: 'bg-green-950/40 border-green-500/40 text-green-400',
          btnClass: 'bg-green-600 hover:bg-green-700 text-white',
          borderModal: 'border-green-500/50',
        };
      case 'primary':
      case 'warning':
      default:
        return {
          icon: <AlertTriangle size={22} className="text-[#E8B84A]" />,
          iconBg: 'bg-[#1F1810] border-[#E8B84A] text-[#E8B84A]',
          btnClass: 'bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206]',
          borderModal: 'border-[#A6822D]',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-md bg-[#1B1B21] border ${vStyles.borderModal} shadow-2xl p-6 md:p-8 animate-scaleUp`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A2A31]">
          <div className="flex items-center gap-3">
            <div className={`p-2 border ${vStyles.iconBg}`}>
              {vStyles.icon}
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[0.25em] text-[#E8B84A] uppercase">
                {subtitle}
              </div>
              <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje */}
        <div className="py-2 text-[#CAC6B9] font-mono text-xs leading-relaxed whitespace-pre-line">
          {message}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#2A2A31]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-[#33333C] hover:border-[#82828A] text-[#A5A5AF] hover:text-[#F5EFE0] font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 font-display text-sm tracking-widest font-bold flex items-center gap-2 transition-all disabled:opacity-50 ${vStyles.btnClass}`}
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal de notificación / advertencia / error que reemplaza alert()
 */
export function AlertModal({
  isOpen,
  onClose,
  title = 'AVISO DEL SISTEMA',
  subtitle = 'MENSAJE OPERATIVO',
  message,
  type = 'warning', // 'warning' | 'error' | 'info' | 'success'
  buttonText = 'ENTENDIDO',
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertCircle size={22} className="text-red-400" />,
          iconBg: 'bg-red-950/40 border-red-500/40 text-red-400',
          borderModal: 'border-red-500/50',
          btnClass: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'info':
        return {
          icon: <Info size={22} className="text-[#38BDF8]" />,
          iconBg: 'bg-sky-950/40 border-[#38BDF8]/40 text-[#38BDF8]',
          borderModal: 'border-[#38BDF8]/50',
          btnClass: 'bg-[#38BDF8] hover:bg-sky-500 text-[#0B0B0D]',
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={22} className="text-green-400" />,
          iconBg: 'bg-green-950/40 border-green-500/40 text-green-400',
          borderModal: 'border-green-500/50',
          btnClass: 'bg-green-600 hover:bg-green-700 text-white',
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle size={22} className="text-[#E8B84A]" />,
          iconBg: 'bg-[#1F1810] border-[#E8B84A] text-[#E8B84A]',
          borderModal: 'border-[#A6822D]',
          btnClass: 'bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206]',
        };
    }
  };

  const tStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-md bg-[#1B1B21] border ${tStyles.borderModal} shadow-2xl p-6 md:p-8 animate-scaleUp`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A2A31]">
          <div className="flex items-center gap-3">
            <div className={`p-2 border ${tStyles.iconBg}`}>
              {tStyles.icon}
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[0.25em] text-[#E8B84A] uppercase">
                {subtitle}
              </div>
              <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#82828A] hover:text-[#F5EFE0] hover:bg-[#232329] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje */}
        <div className="py-2 text-[#CAC6B9] font-mono text-xs leading-relaxed whitespace-pre-line">
          {message}
        </div>

        {/* Acción */}
        <div className="flex items-center justify-end mt-6 pt-4 border-t border-[#2A2A31]">
          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2 font-display text-sm tracking-widest font-bold transition-all ${tStyles.btnClass}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default { ConfirmModal, AlertModal };
