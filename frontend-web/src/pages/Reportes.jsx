import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Calendar, RefreshCw, Filter, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { validarRangoFechas } from '../utils/validators';
import ReporteIngresosChart from '../components/ReporteIngresosChart';

export default function Reportes({ externalBranch, sucursalesList = [] }) {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sucursales, setSucursales] = useState(sucursalesList);
  const [sucursalFilter, setSucursalFilter] = useState(() => {
    if (!isAdmin && user?.sucursal?.id) return String(user.sucursal.id);
    return 'TODAS';
  });
  const [presetFecha, setPresetFecha] = useState('MES'); // 'MES' | '30D' | '90D' | 'CUSTOM'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hoyStr = getLocalDateString();
  const dateError = validarRangoFechas(fechaInicio, fechaFin);

  useEffect(() => {
    if (sucursalesList && sucursalesList.length > 0) {
      setSucursales(sucursalesList);
    } else {
      api.get('/sucursales').then((res) => {
        if (res.data?.success) setSucursales(res.data.data);
      }).catch(console.error);
    }
  }, [sucursalesList]);

  // Configurar fechas iniciales
  useEffect(() => {
    const hoy = new Date();
    const primerDiaMes = getLocalDateString(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    setFechaInicio(primerDiaMes);
    setFechaFin(hoyStr);
  }, []);

  useEffect(() => {
    if (!isAdmin && user?.sucursal?.id) {
      setSucursalFilter(String(user.sucursal.id));
    } else if (externalBranch) {
      setSucursalFilter(externalBranch);
    }
  }, [externalBranch, isAdmin, user?.sucursal?.id]);

  const fetchReporte = async () => {
    if (dateError) return;
    try {
      setLoading(true);
      const params = {};
      if (sucursalFilter !== 'TODAS') {
        params.sucursalId = sucursalFilter;
      }
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;

      const res = await api.get('/reportes/ingresos', { params });
      if (res.data?.success) {
        setReporte(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reporte financiero:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fechaInicio && fechaFin && !dateError) {
      fetchReporte();
    }
  }, [sucursalFilter, fechaInicio, fechaFin]);

  const handlePreset = (tipo) => {
    setPresetFecha(tipo);
    const hoy = new Date();
    const hoyLocal = getLocalDateString(hoy);
    let inicioStr = '';

    if (tipo === 'MES') {
      inicioStr = getLocalDateString(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    } else if (tipo === '30D') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      inicioStr = getLocalDateString(d);
    } else if (tipo === '90D') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      inicioStr = getLocalDateString(d);
    }

    setFechaInicio(inicioStr);
    setFechaFin(hoyLocal);
  };

  // Exportar PDF profesional con jsPDF y jsPDF-AutoTable (RF-W09)
  const handleExportPDF = () => {
    if (!reporte) return;
    setPdfGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Cabecera institucional
      doc.setFillColor(14, 14, 17);
      doc.rect(0, 0, 210, 42, 'F');

      // Título
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(245, 239, 224);
      doc.text('GUANTE DORADO', 15, 19);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(232, 184, 74);
      doc.text('CLUB DE BOXEO · REPORTE FINANCIERO OFICIAL (RF-W09)', 15, 27);

      doc.setFontSize(7.5);
      doc.setTextColor(165, 165, 175);
      const fechaEmision = new Date().toLocaleString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.text(`FECHA DE EMISIÓN: ${fechaEmision}`, 15, 34);

      // Metadatos a la derecha (Alineación derecha exacta en margen 195mm)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(245, 239, 224);
      doc.text('BOXCONTROL v1.0', 195, 19, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(232, 184, 74);
      const sucursalTexto = reporte.parametros?.sucursalCorta 
        ? `SEDE: ${reporte.parametros.sucursalCorta}`
        : (reporte.parametros?.sucursalNombre || 'CONSOLIDADO');
      doc.text(sucursalTexto, 195, 27, { align: 'right' });

      doc.setFontSize(7.5);
      doc.setTextColor(165, 165, 175);
      doc.text('AUDITORÍA DE RECAUDACIÓN', 195, 34, { align: 'right' });

      // Franja dorada divisoria
      doc.setFillColor(232, 184, 74);
      doc.rect(0, 42, 210, 2, 'F');

      // Subtítulo del período
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 20, 25);
      doc.text('ESTADO CONSOLIDADO DE INGRESOS', 15, 53);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 95);
      doc.text(`PERÍODO EVALUADO: ${reporte.parametros?.periodoEtiqueta || `${fechaInicio} al ${fechaFin}`}`, 15, 59);

      // Cuadros resumen de KPIs (4 cajas simétricas de 42mm de ancho, márgenes exactos 15mm a 195mm)
      const kpisY = 64;
      doc.setDrawColor(215, 215, 222);

      // Box 1: Total Recaudado
      doc.setFillColor(248, 248, 250);
      doc.roundedRect(15, kpisY, 42, 22, 2, 2, 'FD');
      doc.setFillColor(232, 184, 74);
      doc.rect(15, kpisY, 42, 1.5, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 105);
      doc.text('TOTAL RECAUDADO', 19, kpisY + 6.5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 130, 20);
      const totalStr = `$${Number(reporte.resumen?.totalRecaudado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(totalStr, 19, kpisY + 14);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 125);
      doc.text(`${reporte.resumen?.totalTransacciones || 0} cobros auditados`, 19, kpisY + 19);

      // Box 2: Transacciones
      doc.setFillColor(248, 248, 250);
      doc.roundedRect(61, kpisY, 42, 22, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 105);
      doc.text('Nº TRANSACCIONES', 65, kpisY + 6.5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 25, 30);
      doc.text(`${reporte.resumen?.totalTransacciones || 0}`, 65, kpisY + 14);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 125);
      doc.text(`${reporte.resumen?.nuevosSocios || 0} nuevos · ${reporte.resumen?.renovaciones || 0} renov.`, 65, kpisY + 19);

      // Box 3: Tasa de Renovación
      doc.setFillColor(248, 248, 250);
      doc.roundedRect(107, kpisY, 42, 22, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 105);
      doc.text('TASA RENOVACIÓN', 111, kpisY + 6.5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 130, 60);
      doc.text(`${reporte.resumen?.tasaRenovacion || '0%'}`, 111, kpisY + 14);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 125);
      doc.text('Retención estimada', 111, kpisY + 19);

      // Box 4: Ticket Promedio
      doc.setFillColor(248, 248, 250);
      doc.roundedRect(153, kpisY, 42, 22, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 105);
      doc.text('TICKET PROMEDIO', 157, kpisY + 6.5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 25, 30);
      const ticketStr = `$${Number(reporte.resumen?.ticketPromedio || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(ticketStr, 157, kpisY + 14);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 125);
      doc.text('USD por socio', 157, kpisY + 19);

      // Tabla 1: Desglose por Plan
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 25, 30);
      doc.text('DESGLOSE DE INGRESOS POR PLAN DE BOXEO', 15, 96);

      const tablePlanRows = (reporte.desglosePorPlan || []).map((d) => [
        d.plan,
        `${d.cantidad} socios`,
        `$${Number(d.precioUnitario).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${Number(d.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ]);

      tablePlanRows.push([
        'TOTAL CONSOLIDADO',
        `${reporte.resumen?.totalTransacciones || 0} cobros`,
        '—',
        `$${Number(reporte.resumen?.totalRecaudado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ]);

      autoTable(doc, {
        startY: 100,
        margin: { left: 15, right: 15, bottom: 28, top: 22 },
        head: [['Tipo de Membresía / Plan', 'Cantidad / Ventas', 'Tarifa Ref. (USD)', 'Total Recaudado (USD)']],
        body: tablePlanRows,
        theme: 'striped',
        headStyles: {
          fillColor: [27, 27, 33],
          textColor: [245, 239, 224],
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'left',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          textColor: [35, 35, 40],
        },
        columnStyles: {
          0: { cellWidth: 80, halign: 'left' },
          1: { cellWidth: 32, halign: 'center' },
          2: { cellWidth: 34, halign: 'right' },
          3: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
        },
      });

      // Tabla 2: Transacciones Detalladas
      const finalY1 = doc.lastAutoTable.finalY;
      let nextY = finalY1 + 10;
      if (nextY > 230) {
        doc.addPage();
        nextY = 22;
      }

      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 25, 30);
      doc.text('REGISTRO DETALLADO DE COBROS AUDITADOS', 15, nextY);

      const transList = reporte.transacciones || [];
      const transRows = transList.length > 0 ? transList.map((t) => {
        let fStr = t.fechaCorta;
        if (!fStr && t.fechaRaw) {
          const d = new Date(t.fechaRaw);
          const dia = d.getDate().toString().padStart(2, '0');
          const mes = (d.getMonth() + 1).toString().padStart(2, '0');
          const anio = d.getFullYear();
          const hora = d.getHours().toString().padStart(2, '0');
          const min = d.getMinutes().toString().padStart(2, '0');
          fStr = `${dia}/${mes}/${anio} ${hora}:${min}`;
        }
        if (!fStr) fStr = t.fecha;

        let sedeStr = t.sucursalCorta;
        if (!sedeStr) {
          if (t.sucursal?.toUpperCase().includes('NORTE')) sedeStr = 'NORTE';
          else if (t.sucursal?.toUpperCase().includes('SUR')) sedeStr = 'SUR';
          else sedeStr = t.sucursal || 'SEDE';
        }

        return [
          t.reciboNumero || `R-${t.id}`,
          fStr,
          t.socio || 'Socio',
          t.plan || 'Plan Boxeo',
          sedeStr,
          t.metodoPago || 'EFECTIVO',
          `$${Number(t.monto || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ];
      }) : [
        ['—', '—', 'No se registraron cobros en el período seleccionado.', '—', '—', '—', '$0.00']
      ];

      autoTable(doc, {
        startY: nextY + 4,
        margin: { left: 15, right: 15, bottom: 28, top: 22 },
        head: [['Nº Recibo', 'Fecha / Hora', 'Socio Titular', 'Plan Adquirido', 'Sede', 'Método', 'Monto (USD)']],
        body: transRows,
        theme: 'grid',
        headStyles: {
          fillColor: [35, 35, 41],
          textColor: [232, 184, 74],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          overflow: 'linebreak',
          textColor: [35, 35, 40],
          lineColor: [220, 220, 225],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 27, halign: 'center' },
          2: { cellWidth: 44, halign: 'left' },
          3: { cellWidth: 40, halign: 'left' },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 16, halign: 'center' },
          6: { cellWidth: 18, halign: 'right', fontStyle: 'bold', textColor: [180, 130, 20] },
        },
      });

      // Pie de página oficial y numeración en todas las páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(215, 215, 222);
        doc.setLineWidth(0.3);
        doc.line(15, 282, 195, 282);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 130, 138);
        doc.text(
          `BoxControl Financial Suite v1.0 · Guante Dorado Club de Boxeo — Pág. ${i} de ${pageCount}`,
          15,
          288
        );
        doc.text(
          'Firma de Auditoría: __________________________',
          195,
          288,
          { align: 'right' }
        );
      }

      // Guardar archivo descargable
      const fileName = `Reporte_Ingresos_BoxControl_${fechaInicio}_al_${fechaFin}.pdf`;
      doc.save(fileName);

      setToastMsg(`¡Reporte PDF descargado con éxito: ${fileName}!`);
      setTimeout(() => setToastMsg(''), 5000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar archivo PDF: ' + err.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  const resumen = reporte?.resumen;
  const desglose = reporte?.desglosePorPlan || [];
  const diasGrafico = reporte?.ingresosPorDia || [];
  const maxDiaVal = Math.max(120, ...diasGrafico.map((d) => d.total));

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#0B0B0D] min-h-[calc(100vh-75px)] select-none">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3 bg-green-950/50 border-l-4 border-green-500 text-green-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Filters (Matching Mockup 07) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2A2A31]">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-[#82828A] uppercase">
            PERÍODO · {reporte?.parametros?.periodoEtiqueta || 'SELECCIÓN'}
          </div>
          <h2 className="font-display text-3xl text-[#F5EFE0] tracking-wider mt-0.5">
            REPORTES DE INGRESOS
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex bg-[#141418] border border-[#2A2A31] p-0.5 font-mono text-[10px]">
            {[
              { id: 'MES', label: 'ESTE MES' },
              { id: '30D', label: '30 DÍAS' },
              { id: '90D', label: '90 DÍAS' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                className={`px-3 py-1 font-bold transition-all ${
                  presetFecha === p.id ? 'bg-[#E8B84A] text-[#1A1206]' : 'text-[#82828A] hover:text-[#F5EFE0]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-1.5 bg-[#141418] border border-[#2A2A31] px-2 py-1 font-mono text-xs">
            <span className="text-[10px] text-[#82828A] uppercase">DEL</span>
            <input
              type="date"
              max={hoyStr}
              value={fechaInicio}
              onChange={(e) => {
                setPresetFecha('CUSTOM');
                setFechaInicio(e.target.value);
              }}
              className="bg-transparent text-[#F5EFE0] text-xs focus:outline-none"
            />
            <span className="text-[10px] text-[#82828A] uppercase">AL</span>
            <input
              type="date"
              max={hoyStr}
              value={fechaFin}
              onChange={(e) => {
                setPresetFecha('CUSTOM');
                setFechaFin(e.target.value);
              }}
              className="bg-transparent text-[#F5EFE0] text-xs focus:outline-none"
            />
          </div>

          {/* Branch Filter */}
          {isAdmin ? (
            <div className="flex bg-[#141418] border border-[#2A2A31] p-0.5 font-mono text-[10px]">
              {[
                { id: 'TODAS', label: 'TODAS' },
                ...sucursales.map((s) => ({
                  id: String(s.id),
                  label: s.nombre.toUpperCase().replace('SUCURSAL ', '').replace('SEDE ', '').trim(),
                })),
              ].map((b) => {
                const isSelected =
                  sucursalFilter === b.id ||
                  (sucursalFilter === 'NORTE' && b.id === '1') ||
                  (sucursalFilter === 'SUR' && b.id === '2');
                return (
                  <button
                    key={b.id}
                    onClick={() => setSucursalFilter(b.id)}
                    className={`px-3 py-1 font-bold transition-all ${
                      isSelected ? 'bg-[#E8B84A] text-[#1A1206]' : 'text-[#82828A] hover:text-[#F5EFE0]'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141418] border border-[#2A2A31] text-[11px] font-mono text-[#E8B84A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84A]"></span>
              <span>SEDE: {user?.sucursal?.nombre?.toUpperCase() || 'MI SUCURSAL'}</span>
            </div>
          )}

          {/* Export PDF Button (Hero Golden Button) */}
          <button
            onClick={handleExportPDF}
            disabled={pdfGenerating || !reporte || !!dateError}
            className="px-5 py-2.5 bg-[#E8B84A] hover:bg-[#D4A538] text-[#1A1206] font-display text-sm tracking-wider font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download size={16} />
            <span>{pdfGenerating ? 'GENERANDO PDF...' : '↓ EXPORTAR PDF'}</span>
          </button>
        </div>
      </div>

      {/* Date Range Error Alert */}
      {dateError && (
        <div className="p-3 bg-red-950/40 border-l-4 border-red-500 text-red-300 font-mono text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{dateError}</span>
        </div>
      )}

      {/* Main Grid: Left Financial Dash + Right PDF Canvas Preview (Matching Mockup 07) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: KPIs + Daily Chart + Breakdown Table (Col-span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* KPI ROW (Matching Mockup 07 lines 50-72) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            {/* KPI 1: Ingreso Total */}
            <div className="p-5 bg-[#1B1B21] border border-[#33333C] relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E8B84A]"></div>
              <div className="text-[10px] tracking-wider text-[#A5A5AF] uppercase">INGRESO TOTAL</div>
              <div className="font-display text-3xl xl:text-4xl text-[#E8B84A] leading-tight my-2">
                ${Number(resumen?.totalRecaudado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex justify-between text-[10px] text-[#A5A5AF] pt-2 border-t border-[#33333C]">
                <span><strong className="text-[#F5EFE0]">{resumen?.totalTransacciones || 0}</strong> COBROS</span>
                <span>USD</span>
              </div>
            </div>

            {/* KPI 2: Nuevos Socios */}
            <div className="p-5 bg-[#1B1B21] border border-[#33333C]">
              <div className="text-[10px] tracking-wider text-[#A5A5AF] uppercase">NUEVOS SOCIOS</div>
              <div className="font-display text-4xl lg:text-5xl text-[#F5EFE0] leading-none my-2">
                {resumen?.nuevosSocios || 0}
              </div>
              <div className="text-[10px] text-[#A5A5AF] pt-2 border-t border-[#33333C]">
                PROM. DÍA: <strong className="text-[#F5EFE0]">1.4</strong>
              </div>
            </div>

            {/* KPI 3: Renovaciones */}
            <div className="p-5 bg-[#1B1B21] border border-[#33333C]">
              <div className="text-[10px] tracking-wider text-[#A5A5AF] uppercase">RENOVACIONES</div>
              <div className="font-display text-4xl lg:text-5xl text-[#F5EFE0] leading-none my-2">
                {resumen?.renovaciones || 0}
              </div>
              <div className="text-[10px] text-[#A5A5AF] pt-2 border-t border-[#33333C]">
                TASA: <strong className="text-[#4ADE80]">{resumen?.tasaRenovacion || '91%'}</strong>
              </div>
            </div>

            {/* KPI 4: Ticket Promedio */}
            <div className="p-5 bg-[#1B1B21] border border-[#33333C]">
              <div className="text-[10px] tracking-wider text-[#A5A5AF] uppercase">TICKET PROMEDIO</div>
              <div className="font-display text-3xl xl:text-4xl text-[#F5EFE0] leading-tight my-2">
                ${Number(resumen?.ticketPromedio || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-[#A5A5AF] pt-2 border-t border-[#33333C]">
                POR SOCIO USD
              </div>
            </div>
          </div>

          {/* Daily Income Bar Chart (Matching Mockup 07 lines 75-137) */}
          <ReporteIngresosChart
            diasGrafico={diasGrafico}
            sucursalNombre={
              reporte?.parametros?.sucursalCorta
                ? reporte.parametros.sucursalCorta.startsWith('SEDE') || reporte.parametros.sucursalCorta.startsWith('CONSOLIDADO')
                  ? reporte.parametros.sucursalCorta
                  : `SEDE ${reporte.parametros.sucursalCorta}`
                : (reporte?.parametros?.sucursalNombre || 'SEDE NORTE')
            }
            totalRecaudado={resumen?.totalRecaudado || 0}
          />

          {/* Breakdown Table by Plan */}
          <div className="p-6 bg-[#1B1B21] border border-[#33333C]">
            <h4 className="font-display text-xl text-[#F5EFE0] tracking-wider mb-4">
              DESGLOSE POR TIPO DE MEMBRESÍA
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#33333C] text-[10px] text-[#A5A5AF] uppercase">
                    <th className="py-2.5">PLAN DE BOXEO</th>
                    <th className="py-2.5 text-center">SOCIOS / VENTAS</th>
                    <th className="py-2.5 text-right">TARIFA UNIT.</th>
                    <th className="py-2.5 text-right">TOTAL GENERADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#33333C]">
                  {desglose.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#141418]">
                      <td className="py-3 font-semibold text-[#F5EFE0]">{item.plan}</td>
                      <td className="py-3 text-center text-[#B8B8BE]">× {item.cantidad}</td>
                      <td className="py-3 text-right text-[#A5A5AF]">${Number(item.precioUnitario).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right font-display text-lg text-[#E8B84A]">
                        ${Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#E8B84A] font-bold text-sm bg-[#141418]">
                    <td className="py-3 text-[#F5EFE0]">TOTAL GENERAL</td>
                    <td className="py-3 text-center text-[#E8B84A]">{resumen?.totalTransacciones || 0}</td>
                    <td className="py-3 text-right text-[#A5A5AF]">—</td>
                    <td className="py-3 text-right font-display text-xl text-[#E8B84A]">
                      ${Number(resumen?.totalRecaudado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REALISTIC PDF PREVIEW (Col-span 4) (Matching Mockup 07 lines 138-176) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="font-mono text-[10px] tracking-[0.25em] text-[#E8B84A] uppercase">
            — VISTA PREVIA DEL PDF DESCARGABLE
          </div>

          {/* White Paper Canvas Replica */}
          <div className="bg-[#F5EFE0] text-[#111111] p-5 shadow-2xl border border-gray-400 font-sans rounded-none select-text text-xs space-y-3.5">
            {/* Header branding */}
            <div className="flex items-start justify-between pb-2.5 border-b-2 border-black">
              <div>
                <div className="font-display text-2xl tracking-wider leading-none text-black">
                  GUANTE DORADO
                </div>
                <div className="font-mono text-[8px] tracking-widest text-neutral-700 mt-1 uppercase">
                  CLUB DE BOXEO · REP. FINANCIERO (RF-W09)
                </div>
              </div>
              <div className="text-right font-mono text-[8px] text-neutral-800">
                <div className="font-bold">BOXCONTROL v1.0</div>
                <div className="text-[#8B6B1B] font-bold">
                  {reporte?.parametros?.sucursalCorta ? `SEDE ${reporte.parametros.sucursalCorta}` : (reporte?.parametros?.sucursalNombre || 'SEDE NORTE')}
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div>
              <div className="font-display text-sm tracking-wide text-black">
                ESTADO CONSOLIDADO DE INGRESOS
              </div>
              <div className="font-mono text-[8px] text-neutral-600 mt-0.5">
                PERÍODO: {reporte?.parametros?.periodoEtiqueta || `${fechaInicio} al ${fechaFin}`}
              </div>
            </div>

            {/* 4 KPI Matrix Replica in PDF Preview */}
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2 bg-white border border-neutral-300">
                <div className="text-[7.5px] text-neutral-600 uppercase font-bold">TOTAL RECAUDADO</div>
                <div className="font-display text-lg text-[#8B6B1B] font-bold mt-0.5">
                  ${Number(resumen?.totalRecaudado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[6.5px] text-neutral-500">{resumen?.totalTransacciones || 0} cobros</div>
              </div>
              <div className="p-2 bg-white border border-neutral-300">
                <div className="text-[7.5px] text-neutral-600 uppercase font-bold">TRANSACCIONES</div>
                <div className="font-display text-lg text-neutral-900 font-bold mt-0.5">
                  {resumen?.totalTransacciones || 0}
                </div>
                <div className="text-[6.5px] text-neutral-500">{resumen?.nuevosSocios || 0} nuevos · {resumen?.renovaciones || 0} renov.</div>
              </div>
              <div className="p-2 bg-white border border-neutral-300">
                <div className="text-[7.5px] text-neutral-600 uppercase font-bold">TASA RENOVACIÓN</div>
                <div className="font-display text-lg text-emerald-700 font-bold mt-0.5">
                  {resumen?.tasaRenovacion || '0%'}
                </div>
                <div className="text-[6.5px] text-neutral-500">Retención estimada</div>
              </div>
              <div className="p-2 bg-white border border-neutral-300">
                <div className="text-[7.5px] text-neutral-600 uppercase font-bold">TICKET PROMEDIO</div>
                <div className="font-display text-lg text-neutral-900 font-bold mt-0.5">
                  ${Number(resumen?.ticketPromedio || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[6.5px] text-neutral-500">USD por socio</div>
              </div>
            </div>

            {/* Breakdown section in PDF */}
            <div className="space-y-1 pt-1">
              <div className="font-display text-xs tracking-wider border-b border-black pb-0.5">
                DESGLOSE POR PLAN DE BOXEO
              </div>
              <div className="font-mono text-[8.5px] space-y-1 pt-1">
                {desglose.map((d, i) => (
                  <div key={i} className="flex justify-between border-b border-neutral-300 pb-1">
                    <span className="truncate max-w-[170px]">{d.plan} × {d.cantidad}</span>
                    <span className="font-bold">${Number(d.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 border-t-2 border-black font-bold text-[9px]">
                  <span>TOTAL CONSOLIDADO</span>
                  <span className="text-[#8B6B1B]">${Number(resumen?.totalRecaudado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Audit sample / pagination note */}
            <div className="bg-white/80 border border-neutral-300 p-2 font-mono text-[8px] space-y-1">
              <div className="font-bold text-neutral-800 flex justify-between">
                <span>REGISTRO DE COBROS AUDITADOS</span>
                <span className="text-neutral-500 font-normal">{reporte?.transacciones?.length || 0} registros</span>
              </div>
              <div className="text-[7.5px] text-neutral-600 truncate">
                Muestra: {reporte?.transacciones?.[0] ? `${reporte.transacciones[0].reciboNumero} · ${reporte.transacciones[0].socio} ($${Number(reporte.transacciones[0].monto).toFixed(2)})` : 'Sin registros'}
              </div>
            </div>

            {/* Footer stamp in PDF */}
            <div className="pt-2 border-t border-neutral-400 flex justify-between font-mono text-[7px] text-neutral-600">
              <span>PÁG. 1 DE {Math.max(1, Math.ceil((reporte?.transacciones?.length || 0) / 22))}</span>
              <span>BOXCONTROL · {new Date().toLocaleDateString('es-EC')}</span>
            </div>

            {/* Action button inside preview */}
            <div className="pt-1">
              <button
                onClick={handleExportPDF}
                disabled={pdfGenerating || !reporte}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-[#E8B84A] font-display text-xs tracking-widest font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Download size={13} />
                <span>{pdfGenerating ? 'GENERANDO ARCHIVO...' : 'DESCARGAR ESTE PDF COMPLETO'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
