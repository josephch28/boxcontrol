const { Op } = require('sequelize');
const { Membresia, TipoMembresia, Cliente, Usuario, Sucursal, sequelize } = require('../models');

// Helper para calcular diferencia de días
const calcularDiasRestantes = (fechaFin) => {
  if (!fechaFin) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin + 'T00:00:00');
  const diffTiempo = fin.getTime() - hoy.getTime();
  return Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
};

// Asignar o renovar membresía a un socio (RF-W04)
const asignarMembresia = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { clienteId, tipoMembresiaId, sucursalId, fechaInicio } = req.body;

    if (!clienteId || !tipoMembresiaId || !sucursalId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'clienteId, tipoMembresiaId y sucursalId son obligatorios.',
      });
    }

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Cliente con ID ${clienteId} no encontrado.`,
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
        message: `El plan de membresía '${tipo.nombre}' se encuentra inactivo y no admite asignaciones.`,
      });
    }

    const sucursal = await Sucursal.findByPk(sucursalId);
    if (sucursal && sucursal.estado === 'INACTIVA') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `La sucursal '${sucursal.nombre}' está inactiva y no admite asignaciones de membresía.`,
      });
    }

    // Calcular fechas
    const fInicio = fechaInicio ? new Date(fechaInicio) : new Date();
    const fFin = new Date(fInicio);
    fFin.setDate(fFin.getDate() + Number(tipo.duracionDias));

    const fechaInicioStr = fInicio.toISOString().split('T')[0];
    const fechaFinStr = fFin.toISOString().split('T')[0];

    // Marcar membresías anteriores activas como VENCIDAS si se renueva
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

    // Crear nueva membresía
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

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Membresía asignada exitosamente.',
      data: nuevaMembresia,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al asignar membresía:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la asignación de membresía.',
      error: error.message,
    });
  }
};

// Listar membresías próximas a vencer en 7 días (RF-W07)
const getProximasAVencer = async (req, res) => {
  try {
    const { sucursalId, dias = 7 } = req.query;

    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];

    const limite = new Date();
    limite.setDate(limite.getDate() + Number(dias));
    const limiteStr = limite.toISOString().split('T')[0];

    const where = {
      estado: 'ACTIVA',
      fechaFin: {
        [Op.between]: [hoyStr, limiteStr],
      },
    };

    if (sucursalId && sucursalId !== 'TODAS') {
      where.sucursalId = sucursalId;
    }

    const membresias = await Membresia.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'apellido', 'email', 'telefono'],
            },
          ],
        },
        {
          model: TipoMembresia,
          as: 'tipoMembresia',
          attributes: ['id', 'nombre', 'precio'],
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre'],
        },
      ],
      order: [['fechaFin', 'ASC']],
    });

    const resultados = membresias.map((m) => {
      const plain = m.toJSON();
      const diasRestantes = calcularDiasRestantes(plain.fechaFin);

      let urgenciaLabel = `${diasRestantes} DÍAS`;
      if (diasRestantes === 0) urgenciaLabel = 'HOY';
      else if (diasRestantes === 1) urgenciaLabel = 'MAÑANA';

      return {
        id: plain.id,
        clienteId: plain.clienteId,
        socio: `${plain.cliente?.usuario?.nombre} ${plain.cliente?.usuario?.apellido}`,
        iniciales: `${plain.cliente?.usuario?.nombre?.[0] || 'S'}${plain.cliente?.usuario?.apellido?.[0] || 'C'}`.toUpperCase(),
        cedula: plain.cliente?.cedula,
        telefono: plain.cliente?.usuario?.telefono,
        email: plain.cliente?.usuario?.email,
        plan: plain.tipoMembresia?.nombre,
        sucursal: plain.sucursal?.nombre,
        sucursalCode: plain.sucursal?.nombre?.toUpperCase().includes('SUR') ? 'SUR' : 'NORTE',
        fechaFin: plain.fechaFin,
        diasRestantes,
        urgenciaLabel,
      };
    });

    return res.status(200).json({
      success: true,
      count: resultados.length,
      data: resultados,
    });
  } catch (error) {
    console.error('Error al listar vencimientos próximos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar membresías por vencer.',
      error: error.message,
    });
  }
};

// Listar todas las membresías
const getMembresias = async (req, res) => {
  try {
    const { clienteId, sucursalId, estado } = req.query;
    const where = {};
    if (clienteId) where.clienteId = clienteId;
    if (sucursalId && sucursalId !== 'TODAS') where.sucursalId = sucursalId;
    if (estado) where.estado = estado;

    const membresias = await Membresia.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'email'] }],
        },
        { model: TipoMembresia, as: 'tipoMembresia' },
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
      ],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: membresias.length,
      data: membresias,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al consultar membresías.',
      error: error.message,
    });
  }
};

// Editar una membresía asignada (RF-W04 - Admin)
const updateMembresia = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoMembresiaId, sucursalId, fechaInicio, fechaFin, estado } = req.body;

    const membresia = await Membresia.findByPk(id);
    if (!membresia) {
      return res.status(404).json({
        success: false,
        message: `Membresía con ID ${id} no encontrada.`,
      });
    }

    if (tipoMembresiaId) membresia.tipoMembresiaId = Number(tipoMembresiaId);
    if (sucursalId) membresia.sucursalId = Number(sucursalId);
    if (fechaInicio) membresia.fechaInicio = fechaInicio;
    if (fechaFin) membresia.fechaFin = fechaFin;
    if (estado) membresia.estado = estado;

    await membresia.save();

    const membresiaActualizada = await Membresia.findByPk(id, {
      include: [
        { model: TipoMembresia, as: 'tipoMembresia' },
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Membresía actualizada exitosamente.',
      data: membresiaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar membresía:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la membresía.',
      error: error.message,
    });
  }
};

module.exports = {
  asignarMembresia,
  getProximasAVencer,
  getMembresias,
  updateMembresia,
};
