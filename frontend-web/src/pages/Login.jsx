import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, loading, error, setError } = useAuth();
  const [email, setEmail] = useState('admin@boxcontrol.com');
  const [password, setPassword] = useState('Admin123*');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }
    await login(email, password);
  };

  const handleQuickFill = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#0B0B0D] text-[#F5EFE0] font-sans select-none">
      {/* LEFT HERO PANEL (MATCHING MOCKUP 01-login-web.svg) */}
      <div className="w-full md:w-1/2 p-8 md:p-14 bg-gradient-to-br from-[#101014] to-[#0B0B0D] border-b md:border-b-0 md:border-r border-[#2A2A31] flex flex-col justify-between relative overflow-hidden">
        {/* Background diagonal watermark stripes */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#E8B84A_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Top Brand Tag */}
        <div className="flex items-center gap-3 relative z-10">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8 L28 8 L32 14 L32 26 L28 32 L20 34 L12 32 L8 26 L8 16 Z" fill="none" stroke="#E8B84A" strokeWidth="2"/>
            <circle cx="14" cy="18" r="1.5" fill="#E8B84A"/>
            <circle cx="26" cy="18" r="1.5" fill="#E8B84A"/>
          </svg>
          <div>
            <div className="font-mono text-xs tracking-[0.25em] font-medium text-[#F5EFE0]">GUANTE DORADO</div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-[#82828A]">CLUB DE BOXEO · EST. 2019</div>
          </div>
        </div>

        {/* Center Hero Punchlines */}
        <div className="my-12 md:my-auto relative z-10">
          <div className="font-mono text-xs tracking-[0.35em] text-[#E8B84A] mb-4">
            — PANEL ADMINISTRATIVO
          </div>
          <div className="font-display tracking-[0.04em] text-7xl sm:text-8xl lg:text-[110px] leading-[0.9] text-[#F5EFE0]">
            PELEA
          </div>
          <div className="font-display tracking-[0.04em] text-7xl sm:text-8xl lg:text-[110px] leading-[0.9] text-[#E8B84A] mb-8">
            SIN PAPEL.
          </div>
          <div className="border-l-2 border-[#A6822D] pl-4 space-y-1 text-sm md:text-base text-[#82828A] font-light max-w-md">
            <p>Deja el cuaderno y controla socios,</p>
            <p>cobros y cierres en un solo lugar.</p>
            <p className="text-[#B8B8BE]">Cada sucursal, cada ingreso, cada peso.</p>
          </div>
        </div>

        {/* Bottom Hero Stats */}
        <div className="flex items-end justify-between border-t border-[#2A2A31] pt-6 relative z-10">
          <div>
            <div className="font-display text-4xl text-[#E8B84A] leading-none">2</div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#82828A] mt-1">SUCURSALES ACTIVAS</div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#82828A]">NORTE · SUR</div>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl text-[#E8B84A] leading-none">142</div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#82828A] mt-1">SOCIOS</div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#82828A]">REGISTRADOS HOY</div>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN FORM PANEL */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center max-w-xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-[1px] bg-[#E8B84A]"></div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#82828A]">ACCESO SEGURO / JWT</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-[#F5EFE0] tracking-wider leading-none">
            BIENVENIDO
          </h2>
          <h2 className="font-display text-4xl sm:text-5xl text-[#F5EFE0] tracking-wider leading-none mb-3">
            DE VUELTA
          </h2>
          <p className="text-xs text-[#82828A] leading-relaxed">
            Ingresa con tu cuenta corporativa. Recuerda que cada sucursal opera con roles y permisos específicos.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border-l-2 border-red-500 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.25em] text-[#82828A] mb-1 uppercase">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nombre@guantedorado.ec"
              className="w-full bg-transparent border-b border-[#3A3A42] py-2.5 text-sm text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A] transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.25em] text-[#82828A] mb-1 uppercase">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full bg-transparent border-b border-[#3A3A42] py-2.5 text-sm text-[#F5EFE0] focus:outline-none focus:border-[#E8B84A] transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-lg tracking-[0.15em] font-bold flex items-center justify-center gap-4 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'INGRESANDO...' : 'INGRESAR AL RING'}</span>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </button>
            <span className="font-mono text-[10px] tracking-wider text-[#82828A] cursor-pointer hover:text-[#E8B84A] transition-colors">
              ¿OLVIDASTE TU CLAVE?
            </span>
          </div>
        </form>

        {/* Quick Demo Fill Buttons (For effortless presentation tomorrow) */}
        <div className="mt-10 p-4 border border-[#2A2A31] bg-[#141418] rounded-sm">
          <div className="font-mono text-[9px] tracking-[0.2em] text-[#E8B84A] mb-2 uppercase">
            ⚡ Acceso Rápido para Defensa / Evaluación:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@boxcontrol.com', 'Admin123*')}
              className="p-2 text-left bg-[#1B1B21] hover:bg-[#232329] border border-[#2A2A31] hover:border-[#E8B84A] transition-colors"
            >
              <div className="font-bold text-[11px] text-[#F5EFE0]">Admin General</div>
              <div className="font-mono text-[9px] text-[#82828A] truncate">admin@boxcontrol.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('recepcion.norte@boxcontrol.com', 'Recep123*')}
              className="p-2 text-left bg-[#1B1B21] hover:bg-[#232329] border border-[#2A2A31] hover:border-[#E8B84A] transition-colors"
            >
              <div className="font-bold text-[11px] text-[#F5EFE0]">Recep. Norte</div>
              <div className="font-mono text-[9px] text-[#82828A] truncate">recepcion.norte...</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('recepcion.sur@boxcontrol.com', 'Recep123*')}
              className="p-2 text-left bg-[#1B1B21] hover:bg-[#232329] border border-[#2A2A31] hover:border-[#E8B84A] transition-colors"
            >
              <div className="font-bold text-[11px] text-[#F5EFE0]">Recep. Sur</div>
              <div className="font-mono text-[9px] text-[#82828A] truncate">recepcion.sur...</div>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-[#2A2A31] flex items-center justify-between font-mono text-[10px] text-[#82828A]">
          <span>© 2026 GUANTE DORADO</span>
          <span>SOPORTE · <span className="text-[#E8B84A]">GRUPO 4</span></span>
        </div>
      </div>
    </div>
  );
}
