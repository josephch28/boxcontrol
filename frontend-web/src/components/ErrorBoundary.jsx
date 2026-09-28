import React from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.removeItem('boxcontrol_token');
    localStorage.removeItem('boxcontrol_user');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B0D] text-[#F5EFE0] flex items-center justify-center p-6 select-none">
          <div className="max-w-lg w-full bg-[#141418] border border-[#2A2A31] p-8 relative overflow-hidden">
            {/* Left gold decorative bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E8B84A]"></div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#2E1818] border border-[#F87171]/40 flex items-center justify-center text-[#F87171]">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-[#E8B84A] uppercase">
                  BOXCONTROL · SISTEMA DE RECUPERACIÓN
                </div>
                <h2 className="font-display text-2xl tracking-wider text-[#F5EFE0]">
                  GOLPE INESPERADO EN LA VISTA
                </h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#B8B8BE] font-sans leading-relaxed mb-4">
              Ha ocurrido un detalle inesperado al procesar la información de este módulo. 
              El estado de tus datos en la base de datos MySQL está protegido.
            </p>

            {/* Error Message Box */}
            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-[#0B0B0D] border border-[#2A2A31] font-mono text-[11px] text-[#F87171] break-words">
                {this.state.error.message}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={15} />
                <span>RECARGAR APLICACIÓN</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="py-3 px-4 bg-[#1B1B21] hover:bg-[#232329] border border-[#3A3A42] text-[#82828A] hover:text-[#F87171] font-mono text-xs tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={14} />
                <span>REINICIAR SESIÓN</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
