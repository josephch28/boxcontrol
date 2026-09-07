import React from 'react';
import { Search, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Topbar({ title, subtitle, activeBranch, setActiveBranch }) {
  const currentDate = new Date().toLocaleDateString('es-EC', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).toUpperCase();

  return (
    <header className="px-8 py-5 border-b border-[#2A2A31] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0B0D]">
      <div>
        <div className="font-mono text-[10px] tracking-[0.25em] text-[#82828A] uppercase">
          {subtitle || `VISTA GENERAL · ${currentDate}`}
        </div>
        <h1 className="font-display tracking-[0.08em] text-3xl text-[#F5EFE0] mt-0.5">
          {title || 'PANEL OPERATIVO'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar socio, cédula o carnet…"
            className="w-64 bg-[#141418] border border-[#2A2A31] px-3.5 py-1.5 pl-9 text-xs font-mono text-[#F5EFE0] placeholder-[#82828A] focus:outline-none focus:border-[#E8B84A] transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#82828A]" />
        </div>

        {/* Branch Filter Segmented Controls */}
        <div className="flex bg-[#141418] border border-[#2A2A31] p-1">
          {['TODAS', 'NORTE', 'SUR'].map((branch) => {
            const isSelected = activeBranch === branch;
            return (
              <button
                key={branch}
                onClick={() => setActiveBranch(branch)}
                className={`px-3 py-1 font-mono text-[10px] tracking-wider font-bold transition-all ${
                  isSelected
                    ? 'bg-[#E8B84A] text-[#1A1206]'
                    : 'text-[#82828A] hover:text-[#F5EFE0]'
                }`}
              >
                {branch}
              </button>
            );
          })}
        </div>

        {/* Swagger Docs Link Button */}
        <a
          href="http://localhost:4000/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          title="Ver documentación en Swagger UI"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#3A3A42] bg-[#1B1B21] text-[#E8B84A] hover:border-[#E8B84A] font-mono text-[10px] tracking-wider font-bold transition-colors"
        >
          <ExternalLink size={12} />
          <span>SWAGGER UI</span>
        </a>
      </div>
    </header>
  );
}
