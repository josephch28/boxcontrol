const { Op } = require('sequelize');
const { Cliente, Usuario, Sucursal, Membresia, TipoMembresia, Pago, Asistencia, sequelize } = require('../models');

// Helper para calcular diferencia de días
const calcularDiasRestantes = (fechaFin) => {
  if (!fechaFin) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin + 'T00:00:00');
  const diffTiempo = fin.getTime() - hoy.getTime();
  return Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
};

const formatLocalDate = (d = new Date()) => {
  const dateObj = new Date(d);
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Métricas completas para el Dashboard (RF-W06, RF-W07)
const getDashboardMetrics = async (req, res) => {
  try {
    const { sucursalId } = req.query;
    const branchFilter = sucursalId && sucursalId !== 'TODAS' ? Number(sucursalId) : null;

    const hoy = new Date();
    const hoyStr = formatLocalDate(hoy);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const limite7d = new Date();
    limite7d.setDate(limite7d.getDate() + 7);
    const limite7dStr = formatLocalDate(limite7d);

    // 1. Obtener todas las sucursales para mapeo dinámico
    const sucursales = await Sucursal.findAll();
    const sucursalNorte = sucursales.find((s) => s.nombre.toLowerCase().includes('norte')) || sucursales[0];
    const sucursalSur = sucursales.find((s) => s.nombre.toLowerCase().includes('sur')) || sucursales[1];

    // 2. Socios Activos (con membresía ACTIVA y fecha_fin >= hoy)
    const membresiasActivas = await Membresia.findAll({
      where: {
        estado: 'ACTIVA',
        fechaFin: { [Op.gte]: hoyStr },
      },
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'sucursalOrigenId'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'estado'], where: { estado: 'ACTIVO' } }],
        },
        { model: TipoMembresia, as: 'tipoMembresia', attributes: ['id', 'nombre'] },
      ],
    });

    const sociosActivosTotal = branchFilter
      ? membresiasActivas.filter((m) => m.sucursalId === branchFilter).length
      : membresiasActivas.length;

    const desgloseSocios = sucursales.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      codigo: s.nombre.toUpperCase().includes('SUR') ? 'SUR' : s.nombre.toUpperCase().includes('NORTE') ? 'NORTE' : s.nombre.slice(0, 5).toUpperCase(),
      count: membresiasActivas.filter((m) => m.sucursalId === s.id).length,
    }));

    const sociosActivosNorte = sucursalNorte ? membresiasActivas.filter((m) => m.sucursalId === sucursalNorte.id).length : 0;
    const sociosActivosSur = sucursalSur ? membresiasActivas.filter((m) => m.sucursalId === sucursalSur.id).length : 0;

    // 3. Membresías por vencer en 7 días (RF-W07)
    const wherePorVencer = {
      estado: 'ACTIVA',
      fechaFin: {
        [Op.between]: [hoyStr, limite7dStr],
      },
    };
    if (branchFilter) wherePorVencer.sucursalId = branchFilter;

    const porVencerQuery = await Membresia.findAll({
      where: wherePorVencer,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }],
        },
        { model: TipoMembresia, as: 'tipoMembresia', attributes: ['nombre'] },
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
      ],
      order: [['fechaFin', 'ASC']],
    });

    const porVencerLista = porVencerQuery.slice(0, 6).map((m) => {
      const plain = m.toJSON();
      const dias = calcularDiasRestantes(plain.fechaFin);
      let urgencia = `${dias} DÍAS`;
      if (dias === 0) urgencia = 'HOY';
      else if (dias === 1) urgencia = 'MAÑANA';

      const nombre = plain.cliente?.usuario?.nombre || 'Socio';
      const apellido = plain.cliente?.usuario?.apellido || '';
      return {
        id: plain.id,
        clienteId: plain.clienteId,
        nombre: `${nombre} ${apellido}`.trim(),
        iniciales: `${nombre[0] || 'S'}${apellido[0] || 'C'}`.toUpperCase(),
        codigo: `#GD-${plain.clienteId.toString().padStart(4, '0')}`,
        plan: plain.tipoMembresia?.nombre || 'MENSUAL',
        sucursal: plain.sucursal?.nombre || 'SEDE NORTE',
        sucursalCode: plain.sucursal?.nombre?.toUpperCase().includes('SUR') ? 'SUR' : 'NORTE',
        diasRestantes: dias,
        urgencia,
        fechaVence: new Date(plain.fechaFin + 'T00:00:00').toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'short',
        }).toUpperCase(),
      };
    });

    const porVencerTotal = porVencerQuery.length;
    const porVencerNorte = sucursalNorte ? porVencerQuery.filter((m) => m.sucursalId === sucursalNorte.id).length : 0;
    const porVencerSur = sucursalSur ? porVencerQuery.filter((m) => m.sucursalId === sucursalSur.id).length : 0;

    // 4. Ingresos del Mes (total y desglose por sede)
    const pagosMes = await Pago.findAll({
      where: {
        fechaPago: { [Op.gte]: inicioMes },
      },
    });

    const ingresosTotal = branchFilter
      ? pagosMes.filter((p) => p.sucursalId === branchFilter).reduce((sum, p) => sum + Number(p.monto), 0)
      : pagosMes.reduce((sum, p) => sum + Number(p.monto), 0);

    const desgloseIngresos = sucursales.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      codigo: s.nombre.toUpperCase().includes('SUR') ? 'SUR' : s.nombre.toUpperCase().includes('NORTE') ? 'NORTE' : s.nombre.slice(0, 5).toUpperCase(),
      monto: pagosMes.filter((p) => p.sucursalId === s.id).reduce((sum, p) => sum + Number(p.monto), 0),
    }));

    const ingresosNorte = sucursalNorte
      ? pagosMes.filter((p) => p.sucursalId === sucursalNorte.id).reduce((sum, p) => sum + Number(p.monto), 0)
      : 0;
    const ingresosSur = sucursalSur
      ? pagosMes.filter((p) => p.sucursalId === sucursalSur.id).reduce((sum, p) => sum + Number(p.monto), 0)
      : 0;

    // 5. Ingresos Hoy
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const pagosHoy = await Pago.findAll({
      where: {
        fechaPago: { [Op.gte]: inicioHoy },
        ...(branchFilter ? { sucursalId: branchFilter } : {}),
      },
    });
    const totalIngresosHoy = pagosHoy.reduce((sum, p) => sum + Number(p.monto), 0);
    const countPagosHoy = pagosHoy.length;

    // 6. Asistencias Hoy y Aforo
    const asistenciasHoy = await Asistencia.findAll({
      where: {
        fechaHora: { [Op.gte]: inicioHoy },
      },
    });

    const asistenciasTotal = branchFilter
      ? asistenciasHoy.filter((a) => a.sucursalId === branchFilter).length
      : asistenciasHoy.length;

    const desgloseAsistencias = sucursales.map((s) => {
      const asistCount = asistenciasHoy.filter((a) => a.sucursalId === s.id).length;
      const capacidad = s.capacidad || 60;
      const aforoPct = Math.min(100, Math.round((asistCount / capacidad) * 100));
      return {
        id: s.id,
        nombre: s.nombre,
        codigo: s.nombre.toUpperCase().includes('SUR') ? 'SUR' : s.nombre.toUpperCase().includes('NORTE') ? 'NORTE' : s.nombre.slice(0, 5).toUpperCase(),
        asistencias: asistCount,
        capacidad,
        aforo: `${aforoPct}%`,
      };
    });

    const asistenciasNorte = sucursalNorte ? asistenciasHoy.filter((a) => a.sucursalId === sucursalNorte.id).length : 0;
    const asistenciasSur = sucursalSur ? asistenciasHoy.filter((a) => a.sucursalId === sucursalSur.id).length : 0;

    // 7. Últimos ingresos en vivo
    const ultimosIngresos = await Asistencia.findAll({
      where: branchFilter ? { sucursalId: branchFilter } : {},
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            { model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] },
            {
              model: Membresia,
              as: 'membresias',
              where: { estado: 'ACTIVA' },
              required: false,
              include: [{ model: TipoMembresia, as: 'tipoMembresia' }],
            },
          ],
        },
        { model: Sucursal, as: 'sucursal', attributes: ['nombre'] },
      ],
      order: [['fechaHora', 'DESC']],
      limit: 6,
    });

    const checkInsEnVivo = ultimosIngresos.map((a) => {
      const plain = a.toJSON();
      const horaStr = new Date(plain.fechaHora).toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        id: plain.id,
        socio: `${plain.cliente?.usuario?.nombre || 'Socio'} ${plain.cliente?.usuario?.apellido || ''}`.trim(),
        plan: plain.cliente?.membresias?.[0]?.tipoMembresia?.nombre || 'Plan de Boxeo',
        sucursal: plain.sucursal?.nombre || 'Sede Principal',
        hora: horaStr,
        metodo: plain.metodo || 'QR_SCAN',
        estado: 'ACTIVO',
      };
    });

    // 8. Gráfico de ingresos de los últimos 30 días
    const hace30d = new Date();
    hace30d.setDate(hace30d.getDate() - 30);
    hace30d.setHours(0, 0, 0, 0);

    const wherePagos30d = {
      fechaPago: { [Op.gte]: hace30d },
    };
    if (branchFilter) wherePagos30d.sucursalId = branchFilter;

    const pagos30d = await Pago.findAll({
      where: wherePagos30d,
      order: [['fechaPago', 'ASC']],
    });

    // Agrupar por día
    const mapaDias = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = formatLocalDate(d);
      const diaEtiqueta = d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }).toUpperCase();
      mapaDias[key] = {
        fecha: key,
        diaEtiqueta,
        norte: 0,
        sur: 0,
        total: 0,
        transacciones: 0,
      };
    }

    pagos30d.forEach((p) => {
      const fechaKey = formatLocalDate(p.fechaPago);
      if (mapaDias[fechaKey]) {
        const monto = Number(p.monto);
        if (p.sucursalId === sucursalNorte?.id) {
          mapaDias[fechaKey].norte += monto;
        } else {
          mapaDias[fechaKey].sur += monto;
        }
        mapaDias[fechaKey].total += monto;
        mapaDias[fechaKey].transacciones += 1;
      }
    });

    const datosGrafico = Object.values(mapaDias);

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          sociosActivos: {
            total: sociosActivosTotal,
            desglose: desgloseSocios,
            norte: sociosActivosNorte,
            sur: sociosActivosSur,
          },
          porVencer: {
            total: porVencerTotal,
            norte: porVencerNorte,
            sur: porVencerSur,
          },
          ingresosMes: {
            total: `$${ingresosTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
            totalNumero: ingresosTotal,
            desglose: desgloseIngresos,
            norte: `$${(ingresosNorte / 1000).toFixed(1)}K`,
            sur: `$${(ingresosSur / 1000).toFixed(1)}K`,
          },
          ingresosHoy: {
            total: `$${totalIngresosHoy.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
            transacciones: countPagosHoy,
          },
          asistenciasHoy: {
            total: asistenciasTotal,
            desglose: desgloseAsistencias,
            norte: asistenciasNorte,
            sur: asistenciasSur,
            aforoNorte: desgloseAsistencias[0]?.aforo || '68%',
            aforoSur: desgloseAsistencias[1]?.aforo || '52%',
          },
        },
        porVencerLista,
        datosGrafico,
        checkInsEnVivo,
      },
    });
  } catch (error) {
    console.error('Error al generar métricas de dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar métricas del dashboard.',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardMetrics,
};
