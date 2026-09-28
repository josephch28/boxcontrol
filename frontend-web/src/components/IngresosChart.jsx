import React, { useState, useId } from 'react';
import { TrendingUp, BarChart2, Calendar, DollarSign, Award, Layers } from 'lucide-react';

export default function IngresosChart({ datosGrafico = [], activeBranch = 'TODAS' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [viewMode, setViewMode] = useState('BARRAS_TENDENCIA'); // 'BARRAS_TENDENCIA' | 'SOLO_CURVA'
  const filterId = useId();

  if (!datosGrafico || datosGrafico.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#141418] border border-[#33333C]">
        <BarChart2 className="text-[#A5A5AF] mb-2" size={32} />
        <span className="text-sm font-semibold text-[#F5EFE0]">No hay registros de cobros en los últimos 30 días</span>
        <span className="text-xs text-[#A5A5AF] mt-1">Los ingresos aparecerán aquí automáticamente tras registrar cobros en caja.</span>
      </div>
    );
  }

  // Cálculos estadísticos y métricas del período
  const totalPeriodo = datosGrafico.reduce((sum, d) => sum + (d.total || 0), 0);
  const totalNorte = datosGrafico.reduce((sum, d) => sum + (d.norte || 0), 0);
  const totalSur = datosGrafico.reduce((sum, d) => sum + (d.sur || 0), 0);
  const promedioDiario = totalPeriodo / Math.max(1, datosGrafico.length);
  const diaPico = datosGrafico.reduce((max, d) => (d.total > (max.total || 0) ? d : max), datosGrafico[0] || {});
  const diasConIngresos = datosGrafico.filter((d) => (d.total || 0) > 0).length;

  // Parámetros de lienzo SVG
  const chartWidth = 680;
  const chartHeight = 280;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 42;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Escala Y dinámica basada en el valor máximo real (con redondeo amigable hacia arriba)
  const maxRaw = Math.max(
    80,
    ...datosGrafico.map((d) => d.total || 0)
  );
  const maxVal = Math.ceil(maxRaw / 20) * 20;

  // Coordenadas de días
  const n = datosGrafico.length;
  const stepX = plotWidth / Math.max(1, n);
  const barWidth = Math.max(7, Math.min(14, stepX * 0.65));

  // Puntos para la curva de tendencia
  const trendPoints = datosGrafico.map((d, i) => {
    const val = d.total || 0;
    const x = paddingLeft + (i + 0.5) * stepX;
    const y = paddingTop + plotHeight - (Math.min(val, maxVal) / maxVal) * plotHeight;
    return { x, y, val, dia: d };
  });

  const trendPolyline = trendPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const trendArea = trendPoints.length > 0
    ? `M ${trendPoints[0].x},${paddingTop + plotHeight} L ${trendPolyline.replace(/ /g, ' L ')} L ${trendPoints[trendPoints.length - 1].x},${paddingTop + plotHeight} Z`
    : '';

  // Índices para etiquetas del eje X distribuidas dinámicamente
  const xLabelIndices = [
    0,
    Math.floor(n * 0.25),
    Math.floor(n * 0.5),
    Math.floor(n * 0.75),
    n - 1,
  ];

  const currentHovered = hoveredIdx !== null && datosGrafico[hoveredIdx] ? datosGrafico[hoveredIdx] : null;

  return (
    <div className="space-y-4 select-none">
      {/* Selector de modo y leyendas */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#33333C]">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#E8B84A] rounded-xs inline-block"></span>
            <span className="text-[#F5EFE0] font-semibold">RECAUDACIÓN DIARIA</span>
            <span className="text-[#A5A5AF]">(${totalPeriodo.toLocaleString()} USD)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#4ADE80] inline-block"></span>
            <span className="text-[#4ADE80] font-semibold">TENDENCIA</span>
          </span>
        </div>

        {/* Toggle de Visualización */}
        <div className="flex bg-[#141418] border border-[#33333C] p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('BARRAS_TENDENCIA')}
            className={`px-2.5 py-1 font-mono text-[10px] tracking-wider transition-colors ${
              viewMode === 'BARRAS_TENDENCIA'
                ? 'bg-[#E8B84A] text-[#1A1206] font-bold'
                : 'text-[#A5A5AF] hover:text-[#F5EFE0]'
            }`}
          >
            BARRAS + TENDENCIA
          </button>
          <button
            type="button"
            onClick={() => setViewMode('SOLO_CURVA')}
            className={`px-2.5 py-1 font-mono text-[10px] tracking-wider transition-colors ${
              viewMode === 'SOLO_CURVA'
                ? 'bg-[#E8B84A] text-[#1A1206] font-bold'
                : 'text-[#A5A5AF] hover:text-[#F5EFE0]'
            }`}
          >
            SOLO CURVA
          </button>
        </div>
      </div>

      {/* SVG Canvas Interactivo */}
      <div className="relative overflow-visible">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-64 md:h-72 overflow-visible"
          role="img"
          aria-label="Gráfico de evolución de ingresos diarios de los últimos 30 días"
        >
          <defs>
            <linearGradient id={`goldGrad-${filterId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8B84A" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#E8B84A" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id={`blueGrad-${filterId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C8DD6" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#6C8DD6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id={`totalGrad-${filterId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Líneas de Grilla Horizontal y Etiquetas del Eje Y (WCAG contrast compliant #A5A5AF) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + plotHeight * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#2E2E38"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="#A5A5AF"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                  fontWeight="500"
                >
                  ${val}
                </text>
              </g>
            );
          })}

          {/* Área de tendencia de fondo */}
          {trendArea && (
            <path
              d={trendArea}
              fill={activeBranch === 'SUR' ? `url(#blueGrad-${filterId})` : `url(#goldGrad-${filterId})`}
            />
          )}

          {/* BARRAS DIARIAS (Interactivas por día) */}
          {viewMode === 'BARRAS_TENDENCIA' &&
            datosGrafico.map((d, i) => {
              const xCenter = paddingLeft + (i + 0.5) * stepX;
              const xBar = xCenter - barWidth / 2;
              const isHovered = hoveredIdx === i;

              const norteVal = d.norte || 0;
              const surVal = d.sur || 0;
              const totalVal = d.total || 0;

              const hNorte = (Math.min(norteVal, maxVal) / maxVal) * plotHeight;
              const hSur = (Math.min(surVal, maxVal) / maxVal) * plotHeight;
              const hTotal = (Math.min(totalVal, maxVal) / maxVal) * plotHeight;

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Zona de hover invisible amplia */}
                  <rect
                    x={xCenter - stepX / 2}
                    y={paddingTop}
                    width={stepX}
                    height={plotHeight}
                    fill="transparent"
                  />

                  {/* Resaltado vertical de fondo al pasar el cursor */}
                  {isHovered && (
                    <rect
                      x={xCenter - stepX / 2}
                      y={paddingTop}
                      width={stepX}
                      height={plotHeight}
                      fill="#FFFFFF"
                      fillOpacity="0.06"
                    />
                  )}

                  {/* Barras según datos de recaudación */}
                  {totalVal > 0 ? (
                    <rect
                      x={xBar}
                      y={paddingTop + plotHeight - hTotal}
                      width={barWidth}
                      height={Math.max(2, hTotal)}
                      fill={isHovered ? '#FFD566' : '#E8B84A'}
                      rx="2"
                    />
                  ) : (
                    <rect
                      x={xBar}
                      y={paddingTop + plotHeight - 2}
                      width={barWidth}
                      height={2}
                      fill="#232329"
                      rx="1"
                    />
                  )}
                </g>
              );
            })}

          {/* Línea de Curva de Tendencia Continua */}
          {trendPolyline && (
            <polyline
              points={trendPolyline}
              fill="none"
              stroke={activeBranch === 'SUR' ? '#8DB4FF' : activeBranch === 'NORTE' ? '#E8B84A' : '#4ADE80'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Puntos de datos destacados con valores mayores a cero */}
          {trendPoints.map((p, i) => {
            if (p.val === 0 && hoveredIdx !== i) return null;
            const isHovered = hoveredIdx === i;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5.5 : 2.5}
                fill={isHovered ? '#FFFFFF' : '#E8B84A'}
                stroke={isHovered ? '#E8B84A' : '#141418'}
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all"
              />
            );
          })}

          {/* Cursor Vertical Interactivo */}
          {hoveredIdx !== null && trendPoints[hoveredIdx] && (
            <line
              x1={trendPoints[hoveredIdx].x}
              y1={paddingTop}
              x2={trendPoints[hoveredIdx].x}
              y2={paddingTop + plotHeight}
              stroke="#E8B84A"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              strokeOpacity="0.8"
            />
          )}

          {/* Etiquetas del Eje X (Fechas dinámicas calculadas desde los datos reales) */}
          {xLabelIndices.map((idxVal) => {
            const item = datosGrafico[idxVal];
            if (!item) return null;
            const x = paddingLeft + (idxVal + 0.5) * stepX;
            return (
              <text
                key={idxVal}
                x={x}
                y={chartHeight - 12}
                fill="#A5A5AF"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="500"
                textAnchor={idxVal === 0 ? 'start' : idxVal === n - 1 ? 'end' : 'middle'}
              >
                {item.diaEtiqueta}
              </text>
            );
          })}
        </svg>

        {/* TOOLTIP FLOTANTE INTERACTIVO */}
        {hoveredIdx !== null && currentHovered && (
          <div
            className="absolute z-20 pointer-events-none p-3 bg-[#1B1B21] border border-[#E8B84A] shadow-xl text-xs font-mono transition-all transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(paddingLeft + (hoveredIdx + 0.5) * stepX) * (100 / chartWidth)}%`,
              top: `${Math.max(10, trendPoints[hoveredIdx]?.y || 40)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-[#33333C] mb-1.5">
              <span className="text-[#F5EFE0] font-bold text-[11px]">{currentHovered.diaEtiqueta}</span>
              <span className="text-[#A5A5AF] text-[10px]">{currentHovered.fecha}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-[#A5A5AF]">TOTAL DIARIO:</span>
                <span className="text-[#E8B84A] font-bold text-sm">
                  ${(currentHovered.total || 0).toLocaleString()} USD
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-[10px]">
                <span className="text-[#E8B84A]">SEDE NORTE:</span>
                <span className="text-[#F5EFE0] font-semibold">${currentHovered.norte || 0}</span>
              </div>

              <div className="flex items-center justify-between gap-4 text-[10px]">
                <span className="text-[#8DB4FF]">SEDE SUR:</span>
                <span className="text-[#F5EFE0] font-semibold">${currentHovered.sur || 0}</span>
              </div>

              {currentHovered.transacciones !== undefined && (
                <div className="flex items-center justify-between gap-4 text-[9px] pt-1 border-t border-[#33333C] text-[#A5A5AF]">
                  <span>COBROS REGISTRADOS:</span>
                  <span className="text-[#4ADE80] font-bold">{currentHovered.transacciones}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TIRA DE MÉTRICAS ESTADÍSTICAS DEL PERÍODO (WCAG AA & AAA Compliant) */}
      <div className="pt-3 border-t border-[#33333C] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-2.5 bg-[#141418] border border-[#33333C]">
          <div className="text-[10px] tracking-wider text-[#A5A5AF] uppercase">TOTAL 30 DÍAS</div>
          <div className="text-base font-bold text-[#E8B84A] font-display mt-0.5">
            ${totalPeriodo.toLocaleString()} <span className="text-[10px] font-mono text-[#A5A5AF]">USD</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#141418] border border-[#33333C]">
          <div className="text-[10px] tracking-wider text-[#A5A5AF] uppercase">PROMEDIO DIARIO</div>
          <div className="text-base font-bold text-[#F5EFE0] font-display mt-0.5">
            ${promedioDiario.toFixed(1)} <span className="text-[10px] font-mono text-[#A5A5AF]">USD/DÍA</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#141418] border border-[#33333C]">
          <div className="text-[10px] tracking-wider text-[#A5A5AF] uppercase">DÍA PICO</div>
          <div className="text-base font-bold text-[#4ADE80] font-display mt-0.5">
            ${diaPico.total || 0} <span className="text-[10px] font-mono text-[#A5A5AF]">({diaPico.diaEtiqueta || '—'})</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#141418] border border-[#33333C]">
          <div className="text-[10px] tracking-wider text-[#A5A5AF] uppercase">DÍAS CON COBRO</div>
          <div className="text-base font-bold text-[#8DB4FF] font-display mt-0.5">
            {diasConIngresos} / {datosGrafico.length} <span className="text-[10px] font-mono text-[#A5A5AF]">DÍAS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
