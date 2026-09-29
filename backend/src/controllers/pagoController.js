const { Op } = require('sequelize');
const { Pago, Membresia, TipoMembresia, Cliente, Usuario, Sucursal, sequelize } = require('../models');

// Registrar pago / cobro de membresía (RF-W05)
const registrarPago = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      clienteId,
      tipoMembresiaId,
      sucursalId,
      monto,
      metodoPago,
      referencia,
      fechaInicio,
    } = req.body;

    if (!clienteId || !tipoMembresiaId || !sucursalId || monto === undefined) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'clienteId, tipoMembresiaId, sucursalId y monto son obligatorios.',
      });
    }

    const cliente = await Cliente.findByPk(clienteId, {
      include: [{ model: Usuario, as: 'usuario' }],
    });
    if (!cliente) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Cliente con ID ${clienteId} no encontrado.`,
      });
    }

    if (cliente.usuario?.estado === 'INACTIVO') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `El socio '${cliente.usuario?.nombre} ${cliente.usuario?.apellido}' se encuentra DADO DE BAJA (INACTIVO) y no puede registrar nuevos cobros.`,
      });
    }

    const tipo = await TipoMembresia.findByPk(tipoMembresiaId);
    if (!tipo) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Tipo de membresía con ID ${tipoMembresiaId} no encontrado.`,
      });
    }

    if (tipo.estado === 'INACTIVA') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `El plan de membresía '${tipo.nombre}' está desactivado y no admite nuevos cobros.`,
      });
    }

    const sucursal = await Sucursal.findByPk(sucursalId);
    if (sucursal && sucursal.estado === 'INACTIVA') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `La sucursal '${sucursal.nombre}' está inactiva y no puede recibir cobros de caja.`,
      });
    }

    // Buscar si el cliente tiene una membresía activa vigente para renovación acumulativa
    const hoyObj = new Date();
    const hoyStr = `${hoyObj.getFullYear()}-${String(hoyObj.getMonth() + 1).padStart(2, '0')}-${String(hoyObj.getDate()).padStart(2, '0')}`;
    
    const membresiaVigente = await Membresia.findOne({
      where: {
        clienteId,
        estado: 'ACTIVA',
        fechaFin: { [Op.gte]: hoyStr },
      },
      order: [['fechaFin', 'DESC']],
      transaction,
    });

    let fInicio;
    let esRenovacionAcumulada = false;

    if (membresiaVigente) {
      esRenovacionAcumulada = true;
      // Si el cajero indicó una fecha manual posterior al fin vigente, se respeta;
      // de lo contrario, el nuevo periodo inicia el día siguiente al término de la membresía activa
      if (fechaInicio && fechaInicio > membresiaVigente.fechaFin) {
        fInicio = new Date(fechaInicio + 'T00:00:00');
      } else {
        fInicio = new Date(membresiaVigente.fechaFin + 'T00:00:00');
        fInicio.setDate(fInicio.getDate() + 1);
      }
    } else {
      fInicio = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : new Date();
    }

    const fFin = new Date(fInicio);
    fFin.setDate(fFin.getDate() + Number(tipo.duracionDias));

    const fechaInicioStr = `${fInicio.getFullYear()}-${String(fInicio.getMonth() + 1).padStart(2, '0')}-${String(fInicio.getDate()).padStart(2, '0')}`;
    const fechaFinStr = `${fFin.getFullYear()}-${String(fFin.getMonth() + 1).padStart(2, '0')}-${String(fFin.getDate()).padStart(2, '0')}`;

    // Si NO es renovación acumulada (el socio estaba vencido o sin membresía), marcar membresías anteriores como VENCIDAS
    if (!esRenovacionAcumulada) {
      await Membresia.update(
        { estado: 'VENCIDA' },
        {
          where: {
            clienteId,
            estado: 'ACTIVA',
          },
          transaction,
        }
      );
    }

    // Crear nueva Membresía activa (periodo acumulativo)
    const nuevaMembresia = await Membresia.create(
      {
        clienteId,
        tipoMembresiaId,
        sucursalId,
        fechaInicio: fechaInicioStr,
        fechaFin: fechaFinStr,
        estado: 'ACTIVA',
      },
      { transaction }
    );

    // Registrar Pago
    const nuevoPago = await Pago.create(
      {
        membresiaId: nuevaMembresia.id,
        clienteId,
        monto: Number(monto),
        metodoPago: metodoPago || 'EFECTIVO',
        referencia: referencia || null,
        sucursalId,
        registradoPor: req.usuario?.id || 1,
        fechaPago: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    const reciboNumero = `R-${nuevoPago.id.toString().padStart(6, '0')}`;

    return res.status(201).json({
      success: true,
      message: esRenovacionAcumulada
        ? `Cobro registrado con éxito. Renovación acumulada: vigencia extendida del ${fechaInicioStr} al ${fechaFinStr} (el socio mantiene sus días vigentes previos).`
        : 'Cobro registrado exitosamente.',
      data: {
        pagoId: nuevoPago.id,
        reciboNumero,
        monto: nuevoPago.monto,
        metodoPago: nuevoPago.metodoPago,
        referencia: nuevoPago.referencia,
        fechaPago: nuevoPago.fechaPago,
        cliente: {
          id: cliente.id,
          nombreCompleto: `${cliente.usuario?.nombre} ${cliente.usuario?.apellido}`,
          cedula: cliente.cedula,
        },
        membresia: {
          id: nuevaMembresia.id,
          plan: tipo.nombre,
          fechaInicio: nuevaMembresia.fechaInicio,
          fechaFin: nuevaMembresia.fechaFin,
        },
        cajero: `${req.usuario?.nombre || 'Administrador'} ${req.usuario?.apellido || 'General'}`,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el cobro en caja.',
      error: error.message,
    });
  }
};

// Listar pagos con filtros (RF-W05, RF-W08)
const getPagos = async (req, res) => {
  try {
    const { sucursalId, clienteId, fechaInicio, fechaFin, metodoPago, estadoCliente = 'ACTIVO' } = req.query;

    const where = {};
    if (sucursalId && sucursalId !== 'TODAS') where.sucursalId = sucursalId;
    if (clienteId) where.clienteId = clienteId;
    if (metodoPago) where.metodoPago = metodoPago;

    if (fechaInicio && fechaFin) {
      where.fechaPago = {
        [Op.between]: [new Date(`${fechaInicio}T00:00:00`), new Date(`${fechaFin}T23:59:59`)],
      };
    }

    const pagos = await Pago.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'apellido', 'email', 'telefono', 'estado'],
            },
          ],
        },
        {
          model: Membresia,
          as: 'membresia',
          include: [{ model: TipoMembresia, as: 'tipoMembresia' }],
        },
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'cajero', attributes: ['id', 'nombre', 'apellido'] },
      ],
      order: [['id', 'DESC']],
    });

    let resultados = pagos.map((p) => {
      const plain = p.toJSON();
      return {
        id: plain.id,
        reciboNumero: `R-${plain.id.toString().padStart(6, '0')}`,
        monto: Number(plain.monto),
        metodoPago: plain.metodoPago,
        referencia: plain.referencia || '—',
        fechaPago: plain.fechaPago,
        clienteId: plain.clienteId,
        socio: `${plain.cliente?.usuario?.nombre || ''} ${plain.cliente?.usuario?.apellido || ''}`.trim(),
        estadoUsuario: plain.cliente?.usuario?.estado || 'ACTIVO',
        cedula: plain.cliente?.cedula,
        plan: plain.membresia?.tipoMembresia?.nombre || 'PLAN',
        sucursal: plain.sucursal?.nombre,
        sucursalCode: plain.sucursal?.nombre?.toUpperCase().includes('SUR') ? 'SUR' : 'NORTE',
        cajero: `${plain.cajero?.nombre || ''} ${plain.cajero?.apellido || ''}`.trim(),
      };
    });

    // Filtro por estado de cliente (por defecto solo pagos de socios activos)
    if (estadoCliente && estadoCliente !== 'TODOS') {
      if (estadoCliente === 'ACTIVO' || estadoCliente === 'ACTIVOS') {
        resultados = resultados.filter((p) => p.estadoUsuario === 'ACTIVO');
      } else if (estadoCliente === 'INACTIVO' || estadoCliente === 'DADOS DE BAJA') {
        resultados = resultados.filter((p) => p.estadoUsuario === 'INACTIVO');
      }
    } else if (!estadoCliente) {
      resultados = resultados.filter((p) => p.estadoUsuario === 'ACTIVO');
    }

    return res.status(200).json({
      success: true,
      count: resultados.length,
      data: resultados,
    });
  } catch (error) {
    console.error('Error al listar pagos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar historial de pagos.',
      error: error.message,
    });
  }
};

// Historial de pagos de un cliente específico (RF-W11)
const getHistorialPagosCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const pagos = await Pago.findAll({
      where: { clienteId },
      include: [
        {
          model: Membresia,
          as: 'membresia',
          include: [{ model: TipoMembresia, as: 'tipoMembresia' }],
        },
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'cajero', attributes: ['id', 'nombre', 'apellido'] },
      ],
      order: [['id', 'DESC']],
    });

    const resultados = pagos.map((p) => {
      const plain = p.toJSON();
      return {
        id: plain.id,
        reciboNumero: `R-${plain.id.toString().padStart(6, '0')}`,
        monto: Number(plain.monto),
        metodoPago: plain.metodoPago,
        referencia: plain.referencia || '—',
        fechaPago: plain.fechaPago,
        plan: plain.membresia?.tipoMembresia?.nombre || 'PLAN',
        sucursal: plain.sucursal?.nombre,
        cajero: `${plain.cajero?.nombre || ''} ${plain.cajero?.apellido || ''}`.trim(),
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
      message: 'Error al consultar historial de pagos del socio.',
      error: error.message,
    });
  }
};

module.exports = {
  registrarPago,
  getPagos,
  getHistorialPagosCliente,
};
