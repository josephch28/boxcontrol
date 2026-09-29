import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50],
  itemName = 'registros',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 bg-[#141418] border-t border-[#2A2A31] font-mono text-xs text-[#82828A]">
      {/* Selector de Items por Página e Info de Rango */}
      <div className="flex items-center gap-3">
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#82828A]">Ver:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-[#1B1B21] border border-[#3A3A42] hover:border-[#E8B84A] px-2 py-1 text-[#F5EFE0] text-xs font-mono focus:outline-none focus:border-[#E8B84A] transition-colors cursor-pointer"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#141418] text-[#F5EFE0]">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <span>
          Mostrando <strong className="text-[#F5EFE0]">{startItem}</strong>-
          <strong className="text-[#F5EFE0]">{endItem}</strong> de{' '}
          <strong className="text-[#E8B84A]">{totalItems}</strong> {itemName}
        </span>
      </div>

      {/* Controles de Navegación */}
      <div className="flex items-center gap-1.5">
        {/* Ir al inicio */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage <= 1}
          className="p-1.5 border border-[#2A2A31] bg-[#1B1B21] hover:border-[#E8B84A] hover:text-[#F5EFE0] text-[#82828A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Primera página"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Anterior */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="flex items-center gap-1 px-3 py-1.5 border border-[#2A2A31] bg-[#1B1B21] hover:border-[#E8B84A] hover:text-[#F5EFE0] text-[#82828A] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold tracking-wider transition-colors"
        >
          <ChevronLeft size={14} />
          <span>ANT</span>
        </button>

        {/* Indicador de Páginas */}
        <div className="flex items-center px-3 py-1 bg-[#1B1B21] border border-[#2A2A31] font-mono text-xs">
          <span className="text-[#E8B84A] font-bold">{safeCurrentPage}</span>
          <span className="mx-1.5 text-[#55555F]">/</span>
          <span className="text-[#A5A5AF]">{totalPages}</span>
        </div>

        {/* Siguiente */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 border border-[#2A2A31] bg-[#1B1B21] hover:border-[#E8B84A] hover:text-[#F5EFE0] text-[#82828A] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold tracking-wider transition-colors"
        >
          <span>SIG</span>
          <ChevronRight size={14} />
        </button>

        {/* Ir al final */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage >= totalPages}
          className="p-1.5 border border-[#2A2A31] bg-[#1B1B21] hover:border-[#E8B84A] hover:text-[#F5EFE0] text-[#82828A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Última página"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
