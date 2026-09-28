const { Op } = require('sequelize');
const { Sucursal, Usuario, Cliente, Pago, Asistencia, sequelize } = require('../models');

// Listar todas las sucursales con métricas reales y dinámicas (RF-W10)
const getSucursales = async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll({
      order: [['id', 'ASC']],
    });

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    // Calcular métricas reales por sucursal
    const dataConMetricas = await Promise.all(
      sucursales.map(async (s) => {
        const plain = s.toJSON();

        // 1. Socios registrados en la sucursal
        const sociosCount = await Cliente.count({
          where: { sucursalOrigenId: s.id },
        });

        // 2. Ingresos recaudados en el mes actual en esta sucursal
        const pagosMes = await Pago.findAll({
          where: {
            sucursalId: s.id,
            fechaPago: { [Op.gte]: inicioMes },
          },
          attributes: [[sequelize.fn('SUM', sequelize.col('monto')), 'totalMes']],
        });
        const ingresosMesVal = Number(pagosMes[0]?.dataValues?.totalMes || 0);

        // 3. Asistencias de la última semana en esta sucursal
        const asistenciasSemana = await Asistencia.count({
          where: {
            sucursalId: s.id,
            fechaHora: { [Op.gte]: hace7Dias },
          },
        });

        return {
          ...plain,
          sociosCount,
          ingresosMes: `$${ingresosMesVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          ingresosMesVal,
          asistenciasSemana,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: dataConMetricas.length,
      data: dataConMetricas,
    });
  } catch (error) {
    console.error('Error al listar sucursales:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar sucursales.',
      error: error.message,
    });
  }
};

// Obtener sucursal por ID
const getSucursalById = async (req, res) => {
  try {
    const { id } = req.params;
    const sucursal = await Sucursal.findByPk(id);

    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: `Sucursal con ID ${id} no encontrada.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: sucursal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al consultar sucursal.',
      error: error.message,
    });
  }
};

// Crear nueva sucursal (RF-W10 - Solo Admin)
const createSucursal = async (req, res) => {
  try {
    const { nombre, direccion, telefono, email, encargado, horario, capacidad, estado } = req.body;

    if (!nombre || !direccion || !telefono) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, dirección y teléfono son campos obligatorios.',
      });
    }

    const nuevaSucursal = await Sucursal.create({
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      email: email ? email.trim() : null,
      encargado: encargado ? encargado.trim() : 'Por asignar',
      horario: horario ? horario.trim() : 'L-V · 06:00 - 22:00 | S · 07:00 - 20:00',
      capacidad: capacidad ? Number(capacidad) : 40,
      estado: estado || 'ACTIVA',
    });

    return res.status(201).json({
      success: true,
      message: 'Sucursal registrada exitosamente.',
      data: nuevaSucursal,
    });
  } catch (error) {
    console.error('Error al crear sucursal:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar la sucursal.',
      error: error.message,
    });
  }
};

// Actualizar sucursal (RF-W10 - Solo Admin)
const updateSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, email, encargado, horario, capacidad, estado } = req.body;

    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: `Sucursal con ID ${id} no encontrada.`,
      });
    }

    await sucursal.update({
      nombre: nombre ? nombre.trim() : sucursal.nombre,
      direccion: direccion ? direccion.trim() : sucursal.direccion,
      telefono: telefono ? telefono.trim() : sucursal.telefono,
      email: email !== undefined ? (email ? email.trim() : null) : sucursal.email,
      encargado: encargado !== undefined ? encargado.trim() : sucursal.encargado,
      horario: horario !== undefined ? horario.trim() : sucursal.horario,
      capacidad: capacidad !== undefined ? Number(capacidad) : sucursal.capacidad,
      estado: estado || sucursal.estado,
    });

    return res.status(200).json({
      success: true,
      message: 'Sucursal actualizada exitosamente.',
      data: sucursal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la sucursal.',
      error: error.message,
    });
  }
};

// Cambiar estado o eliminar sucursal
const deleteSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const sucursal = await Sucursal.findByPk(id);

    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: `Sucursal con ID ${id} no encontrada.`,
      });
    }

    // Desactivación lógica
    sucursal.estado = sucursal.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    await sucursal.save();

    return res.status(200).json({
      success: true,
      message: `Sucursal cambiada a estado ${sucursal.estado}.`,
      data: sucursal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de la sucursal.',
      error: error.message,
    });
  }
};

module.exports = {
  getSucursales,
  getSucursalById,
  createSucursal,
  updateSucursal,
  deleteSucursal,
};
