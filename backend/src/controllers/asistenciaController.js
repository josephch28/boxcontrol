const { Op } = require('sequelize');
const { Asistencia, Cliente, Usuario, Membresia, TipoMembresia, Sucursal } = require('../models');

// Registrar ingreso presencial por escaneo QR o Cédula (RF-M03 / Control de Acceso)
const registrarAsistencia = async (req, res) => {
  try {
    const { codigoQr, cedula, sucursalId, metodo } = req.body;

    if (!codigoQr && !cedula) {
      return res.status(400).json({
        success: false,
        message: 'Debe ingresar el código QR o número de cédula del socio.',
      });
    }

    const whereCliente = {};
    if (codigoQr) whereCliente.codigoQr = codigoQr.trim();
    else if (cedula) whereCliente.cedula = cedula.trim();

    const cliente = await Cliente.findOne({
      where: whereCliente,
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono', 'estado'] },
        { model: Sucursal, as: 'sucursalOrigen', attributes: ['id', 'nombre'] },
        {
          model: Membresia,
          as: 'membresias',
          include: [{ model: TipoMembresia, as: 'tipoMembresia' }],
        },
      ],
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        permitido: false,
        message: 'No se encontró ningún socio registrado con ese carnet o cédula.',
      });
    }

    // Validar estado del usuario
    if (cliente.usuario?.estado === 'INACTIVO') {
      return res.status(403).json({
        success: false,
        permitido: false,
        message: `Acceso Denegado: La cuenta del socio ${cliente.usuario?.nombre} se encuentra inactiva o suspendida.`,
        socio: {
          id: cliente.id,
          nombreCompleto: `${cliente.usuario?.nombre} ${cliente.usuario?.apellido}`,
          cedula: cliente.cedula,
          estadoMembresia: 'INACTIVO',
        },
      });
    }

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    // Buscar membresía activa vigente
    const membresias = (cliente.membresias || []).sort((a, b) => new Date(b.fechaFin) - new Date(a.fechaFin));
    const membresiaActual = membresias.find(
      (m) => m.estado === 'ACTIVA' && m.fechaFin >= hoyStr
    );

    const sucursalDestinoId = sucursalId || req.usuario?.sucursalId || cliente.sucursalOrigenId || 1;
    const sucursalDestino = await Sucursal.findByPk(sucursalDestinoId);

    if (sucursalDestino && sucursalDestino.estado === 'INACTIVA') {
      return res.status(400).json({
        success: false,
        permitido: false,
        message: `Acceso Denegado: La sucursal '${sucursalDestino.nombre}' se encuentra inactiva o fuera de servicio.`,
      });
    }

    // Si la membresía está activa y vigente: verificar duplicado reciente o crear asistencia
    if (membresiaActual) {
      const hace3Min = new Date(Date.now() - 3 * 60 * 1000);
      const checkInReciente = await Asistencia.findOne({
        where: {
          clienteId: cliente.id,
          sucursalId: sucursalDestinoId,
          fechaHora: { [Op.gte]: hace3Min },
        },
        order: [['fechaHora', 'DESC']],
      });

      if (checkInReciente) {
        return res.status(200).json({
          success: true,
          permitido: true,
          yaRegistrado: true,
          message: `Ingreso previo registrado recientemente (${new Date(checkInReciente.fechaHora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}). ¡Bienvenido de nuevo, ${cliente.usuario?.nombre}!`,
          data: {
            asistenciaId: checkInReciente.id,
            fechaHora: checkInReciente.fechaHora,
            metodo: checkInReciente.metodo,
            sucursal: sucursalDestino?.nombre || 'Sede Principal',
            socio: {
              id: cliente.id,
              nombreCompleto: `${cliente.usuario?.nombre} ${cliente.usuario?.apellido}`,
              cedula: cliente.cedula,
              plan: membresiaActual.tipoMembresia?.nombre,
              estadoMembresia: 'ACTIVO',
            },
          },
        });
      }

      const nuevaAsistencia = await Asistencia.create({
        clienteId: cliente.id,
        sucursalId: sucursalDestinoId,
        fechaHora: new Date(),
        metodo: metodo || (codigoQr ? 'QR_SCAN' : 'MANUAL'),
      });

      const fFin = new Date(membresiaActual.fechaFin + 'T00:00:00');
      const diasRestantes = Math.ceil((fFin - hoy) / (1000 * 60 * 60 * 24));

      return res.status(200).json({
        success: true,
        permitido: true,
        message: `¡Acceso Concedido! Bienvenido, ${cliente.usuario?.nombre} ${cliente.usuario?.apellido}.`,
        data: {
          asistenciaId: nuevaAsistencia.id,
          fechaHora: nuevaAsistencia.fechaHora,
          metodo: nuevaAsistencia.metodo,
          sucursal: sucursalDestino?.nombre || 'Sede Norte',
          socio: {
            id: cliente.id,
            nombreCompleto: `${cliente.usuario?.nombre} ${cliente.usuario?.apellido}`,
            iniciales: `${cliente.usuario?.nombre?.[0] || 'S'}${cliente.usuario?.apellido?.[0] || 'C'}`.toUpperCase(),
            cedula: cliente.cedula,
            plan: membresiaActual.tipoMembresia?.nombre,
            diasRestantes,
            fechaVence: membresiaActual.fechaFin,
            estadoMembresia: 'ACTIVO',
          },
        },
      });
    }

    // Membresía vencida o inexistente: acceso denegado / cobro requerido
    const ultimaVencida = membresias[0] || null;
    return res.status(403).json({
      success: false,
      permitido: false,
      message: ultimaVencida
        ? `Acceso Denegado: La membresía de ${cliente.usuario?.nombre} venció el ${ultimaVencida.fechaFin}. Se requiere renovación.`
        : `Acceso Denegado: El socio ${cliente.usuario?.nombre} no tiene ninguna membresía activa asignada.`,
      socio: {
        id: cliente.id,
        nombreCompleto: `${cliente.usuario?.nombre} ${cliente.usuario?.apellido}`,
        cedula: cliente.cedula,
        estadoMembresia: 'VENCIDO',
        ultimaMembresia: ultimaVencida?.tipoMembresia?.nombre || 'Sin membresía previa',
      },
    });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el control de acceso.',
      error: error.message,
    });
  }
};

// Consultar historial de asistencias
const getAsistencias = async (req, res) => {
  try {
    const { sucursalId, clienteId, limit = 50 } = req.query;
    const where = {};
    if (sucursalId && sucursalId !== 'TODAS') where.sucursalId = Number(sucursalId);
    if (clienteId) where.clienteId = Number(clienteId);

    const asistencias = await Asistencia.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }],
        },
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
      ],
      order: [['fechaHora', 'DESC']],
      limit: Number(limit),
    });

    const resultados = asistencias.map((a) => {
      const plain = a.toJSON();
      return {
        id: plain.id,
        clienteId: plain.clienteId,
        socio: `${plain.cliente?.usuario?.nombre || 'Socio'} ${plain.cliente?.usuario?.apellido || ''}`.trim(),
        sucursal: plain.sucursal?.nombre,
        fechaHora: plain.fechaHora,
        hora: new Date(plain.fechaHora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        fecha: new Date(plain.fechaHora).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
        metodo: plain.metodo,
      };
    });

    return res.status(200).json({
      success: true,
      count: resultados.length,
      data: resultados,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al consultar asistencias.',
      error: error.message,
    });
  }
};

module.exports = {
  registrarAsistencia,
  getAsistencias,
};
