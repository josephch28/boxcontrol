import React, { useState, useId } from 'react';
import { BarChart2, TrendingUp, Calendar, DollarSign, Award, Layers } from 'lucide-react';

/**
 * ReporteIngresosChart
 * Componente gráfico SVG de recaudación diaria para el módulo de Reportes (Mockup 07, RF-W08, RF-W09).
 * Soluciona el colapso de altura en CSS flexbox y brinda interactividad con tooltips y curva de tendencia.
 */
export default function ReporteIngresosChart({
  diasGrafico = [],
  sucursalNombre = 'CONSOLIDADO',
  totalRecaudado = 0,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [viewMode, setViewMode] = useState('BARRAS_TENDENCIA'); // 'BARRAS' | 'BARRAS_TENDENCIA'
  const filterId = useId().replace(/:/g, '');

  const n = diasGrafico.length;

  if (!diasGrafico || n === 0) {
    return (
      <div className="p-8 bg-[#1B1B21] border border-[#33333C] text-center flex flex-col items-center justify-center min-h-[280px]">
        <BarChart2 className="text-[#82828A] mb-3" size={36} />
        <p className="font-display text-lg text-[#F5EFE0] tracking-wider">
          NO HAY REGISTROS EN ESTE PERÍODO
        </p>
        <p className="font-mono text-xs text-[#82828A] mt-1 max-w-sm">
          No se encontraron transacciones en las fechas o sede seleccionada. Selecciona otro rango o sede en los filtros superiores.
        </p>
      </div>
    );
  }

  // Cálculos estadísticos del período
  const totalCalculado = diasGrafico.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
  const totalDisplay = totalRecaudado > 0 ? totalRecaudado : totalCalculado;
  const promedioDiario = totalDisplay / Math.max(1, n);
  const diaPico = diasGrafico.reduce(
    (max, d) => (Number(d.total) > (Number(max.total) || 0) ? d : max),
    diasGrafico[0] || { total: 0, dia: '01' }
  );
  const diasConCobro = diasGrafico.filter((d) => Number(d.total) > 0).length;

  // Lienzo SVG
  const chartWidth = 760;
  const chartHeight = 250;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 26;
  const paddingBottom = 38;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Escala Y dinámica
  const maxRaw = Math.max(80, ...diasGrafico.map((d) => Number(d.total) || 0));
  const maxVal = Math.ceil(maxRaw / 20) * 20;

  // Coordenadas X
  const stepX = plotWidth / Math.max(1, n);
  // Ancho de barra adaptativo según cantidad de días
  let barWidth = Math.max(3, Math.min(18, stepX * 0.68));
  if (n > 40) barWidth = Math.max(2.5, Math.min(10, stepX * 0.75));

  // Puntos para curva de tendencia
  const trendPoints = diasGrafico.map((d, i) => {
    const val = Number(d.total) || 0;
    const x = paddingLeft + (i + 0.5) * stepX;
    const y = paddingTop + plotHeight - (Math.min(val, maxVal) / maxVal) * plotHeight;
    return { x, y, val, dia: d };
  });

  const trendPolyline = trendPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const trendArea =
    trendPoints.length > 0
      ? `M ${trendPoints[0].x.toFixed(1)},${paddingTop + plotHeight} L ${trendPolyline.replace(
          / /g,
          ' L '
        )} L ${trendPoints[trendPoints.length - 1].x.toFixed(1)},${paddingTop + plotHeight} Z`
      : '';

  // Distribución de etiquetas del Eje X para evitar superposición
  let xLabelStep = 1;
  if (n > 60) xLabelStep = 10;
  else if (n > 35) xLabelStep = 5;
  else if (n > 16) xLabelStep = 3;
  else if (n > 8) xLabelStep = 2;

  const currentHovered = hoveredIdx !== null && diasGrafico[hoveredIdx] ? diasGrafico[hoveredIdx] : null;

  return (
    <div className="p-6 bg-[#1B1B21] border border-[#33333C] space-y-5 select-none">
      {/* Cabecera del Gráfico (Mockup 07 lines 75-80) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#33333C]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-2xl text-[#F5EFE0] tracking-wider">
              INGRESO DIARIO · {sucursalNombre}
            </h3>
          </div>
          <div className="font-mono text-[10px] tracking-wider text-[#A5A5AF] mt-0.5">
            BARRAS TRANSACCIONALES · {n} DÍAS DEL PERÍODO SELECCIONADO
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle de Modo */}
          <div className="flex bg-[#141418] border border-[#33333C] p-0.5 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode('BARRAS')}
              className={`px-2.5 py-1 font-bold transition-colors ${
                viewMode === 'BARRAS' ? 'bg-[#E8B84A] text-[#1A1206]' : 'text-[#82828A] hover:text-[#F5EFE0]'
              }`}
            >
              BARRAS
            </button>
            <button
              type="button"
              onClick={() => setViewMode('BARRAS_TENDENCIA')}
              className={`px-2.5 py-1 font-bold transition-colors ${
                viewMode === 'BARRAS_TENDENCIA'
                  ? 'bg-[#E8B84A] text-[#1A1206]'
                  : 'text-[#82828A] hover:text-[#F5EFE0]'
              }`}
            >
              + TENDENCIA
            </button>
          </div>

          {/* Gran Total en Oro */}
          <div className="text-right">
            <div className="font-display text-2xl lg:text-3xl text-[#E8B84A] leading-none">
              ${Number(totalDisplay).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="font-mono text-[9px] text-[#82828A] uppercase">TOTAL PERÍODO USD</div>
          </div>
        </div>
      </div>

      {/* SVG Canvas Interactivo */}
      <div className="relative w-full overflow-visible">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-64 md:h-72 overflow-visible block"
          role="img"
          aria-label={`Gráfico de ingresos diarios para ${sucursalNombre}`}
        >
          <defs>
            <linearGradient id={`goldArea-${filterId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8B84A" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#E8B84A" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id={`barGold-${filterId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD770" />
              <stop offset="100%" stopColor="#E8B84A" />
            </linearGradient>
          </defs>

          {/* Líneas de Grilla Horizontal y Etiquetas del Eje Y */}
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
                  stroke="#2A2A33"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  fill="#82828A"
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
          {viewMode === 'BARRAS_TENDENCIA' && trendArea && (
            <path d={trendArea} fill={`url(#goldArea-${filterId})`} pointerEvents="none" />
          )}

          {/* BARRAS DIARIAS */}
          {diasGrafico.map((dia, idx) => {
            const val = Number(dia.total) || 0;
            const xCenter = paddingLeft + (idx + 0.5) * stepX;
            const xBar = xCenter - barWidth / 2;
            const barHeight = maxVal > 0 ? (val / maxVal) * plotHeight : 0;
            const yBar = paddingTop + plotHeight - barHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Zona de hover vertical completa */}
                <rect
                  x={xCenter - stepX / 2}
                  y={paddingTop}
                  width={stepX}
                  height={plotHeight}
                  fill="transparent"
                />

                {/* Resaltado vertical en hover */}
                {isHovered && (
                  <rect
                    x={xCenter - stepX / 2}
                    y={paddingTop}
                    width={stepX}
                    height={plotHeight}
                    fill="#FFFFFF"
                    fillOpacity="0.05"
                  />
                )}

                {/* Barra */}
                {val > 0 ? (
                  <rect
                    x={xBar}
                    y={yBar}
                    width={barWidth}
                    height={Math.max(3, barHeight)}
                    fill={isHovered ? '#FFEA80' : `url(#barGold-${filterId})`}
                    rx={Math.min(2, barWidth / 2)}
                    className="transition-colors duration-150"
                  />
                ) : (
                  /* Tick sutil en día con 0 ingresos */
                  <rect
                    x={xBar}
                    y={paddingTop + plotHeight - 2}
                    width={barWidth}
                    height={2}
                    fill="#26262E"
                    rx="1"
                  />
                )}
              </g>
            );
          })}

          {/* Curva de Tendencia (Línea verde esmeralda / dorado) */}
          {viewMode === 'BARRAS_TENDENCIA' && trendPolyline && (
            <polyline
              points={trendPolyline}
              fill="none"
              stroke="#4ADE80"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}

          {/* Puntos destacados sobre la línea de tendencia */}
          {viewMode === 'BARRAS_TENDENCIA' &&
            trendPoints.map((p, idx) => {
              if (p.val === 0 && hoveredIdx !== idx) return null;
              const isHovered = hoveredIdx === idx;
              return (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 2}
                  fill={isHovered ? '#FFFFFF' : '#4ADE80'}
                  stroke={isHovered ? '#4ADE80' : '#141418'}
                  strokeWidth={isHovered ? 2 : 1}
                  pointerEvents="none"
                />
              );
            })}

          {/* Cursor vertical dashed en hover */}
          {hoveredIdx !== null && trendPoints[hoveredIdx] && (
            <line
              x1={trendPoints[hoveredIdx].x}
              y1={paddingTop}
              x2={trendPoints[hoveredIdx].x}
              y2={paddingTop + plotHeight}
              stroke="#E8B84A"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              strokeOpacity="0.75"
              pointerEvents="none"
            />
          )}

          {/* Etiquetas del Eje X (Días) */}
          {diasGrafico.map((d, idx) => {
            const shouldShow =
              idx === 0 ||
              idx === n - 1 ||
              idx % xLabelStep === 0;

            if (!shouldShow) return null;

            const x = paddingLeft + (idx + 0.5) * stepX;
            return (
              <text
                key={idx}
                x={x}
                y={chartHeight - 14}
                fill={hoveredIdx === idx ? '#F5EFE0' : '#82828A'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight={hoveredIdx === idx ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {d.dia}
              </text>
            );
          })}
        </svg>

        {/* TOOLTIP FLOTANTE */}
        {hoveredIdx !== null && currentHovered && (
          <div
            className="absolute z-20 pointer-events-none p-3 bg-[#141418] border border-[#E8B84A] shadow-2xl font-mono text-xs transition-all transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${Math.max(
                12,
                Math.min(
                  88,
                  ((paddingLeft + (hoveredIdx + 0.5) * stepX) / chartWidth) * 100
                )
              )}%`,
              top: `${Math.max(12, trendPoints[hoveredIdx]?.y || 40)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-[#2A2A31] mb-1.5">
              <span className="text-[#F5EFE0] font-bold text-[11px]">
                {currentHovered.diaEtiqueta || `DÍA ${currentHovered.dia}`}
              </span>
              <span className="text-[#82828A] text-[10px]">{currentHovered.fecha}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#82828A] text-[10px]">TOTAL:</span>
                <span className="text-[#E8B84A] font-bold text-sm">
                  ${Number(currentHovered.total || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  USD
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-[10px] text-[#A5A5AF]">
                <span>PAGOS REGISTRADOS:</span>
                <span className="text-[#4ADE80] font-bold">
                  {currentHovered.transacciones || 0} transacciones
                </span>
              </div>

              {/* Desglose por sede si aplica */}
              {currentHovered.norte !== undefined && currentHovered.sur !== undefined && (
                <div className="pt-1.5 mt-1 border-t border-[#2A2A31] grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <span className="text-[#82828A]">NORTE: </span>
                    <span className="text-[#F5EFE0] font-semibold">${currentHovered.norte}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#82828A]">SUR: </span>
                    <span className="text-[#F5EFE0] font-semibold">${currentHovered.sur}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TIRA DE MÉTRICAS INFERIOR (Estadísticas del Período) */}
      <div className="pt-3 border-t border-[#33333C] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-2.5 bg-[#141418] border border-[#2A2A31]">
          <div className="text-[10px] tracking-wider text-[#82828A] uppercase">TOTAL PERÍODO</div>
          <div className="text-base font-bold text-[#E8B84A] font-display mt-0.5">
            ${Number(totalDisplay).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-[10px] font-mono text-[#82828A]">USD</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#141418] border border-[#2A2A31]">
          <div className="text-[10px] tracking-wider text-[#82828A] uppercase">PROMEDIO DIARIO</div>
          <div className="text-base font-bold text-[#F5EFE0] font-display mt-0.5">
            ${promedioDiario.toFixed(2)}{' '}
            <span className="text-[10px] font-mono text-[#82828A]">USD/DÍA</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#141418] border border-[#2A2A31]">
          <div className="text-[10px] tracking-wider text-[#82828A] uppercase">DÍA PICO</div>
          <div className="text-base font-bold text-[#4ADE80] font-display mt-0.5">
            ${Number(diaPico.total || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-[10px] font-mono text-[#82828A]">
              ({diaPico.dia ? `Día ${diaPico.dia}` : '—'})
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-[#141418] border border-[#2A2A31]">
          <div className="text-[10px] tracking-wider text-[#82828A] uppercase">DÍAS CON COBRO</div>
          <div className="text-base font-bold text-[#8DB4FF] font-display mt-0.5">
            {diasConCobro} / {n}{' '}
            <span className="text-[10px] font-mono text-[#82828A]">DÍAS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
