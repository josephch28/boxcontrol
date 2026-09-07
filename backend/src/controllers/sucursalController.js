const { Sucursal, Usuario } = require('../models');

// Listar todas las sucursales (RF-W10)
const getSucursales = async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll({
      order: [['id', 'ASC']],
    });
    return res.status(200).json({
      success: true,
      count: sucursales.length,
      data: sucursales,
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
    const { nombre, direccion, telefono, email, estado } = req.body;

    if (!nombre || !direccion || !telefono) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, dirección y teléfono son campos obligatorios.',
      });
    }

    const nuevaSucursal = await Sucursal.create({
      nombre,
      direccion,
      telefono,
      email,
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
    const { nombre, direccion, telefono, email, estado } = req.body;

    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: `Sucursal con ID ${id} no encontrada.`,
      });
    }

    await sucursal.update({
      nombre: nombre || sucursal.nombre,
      direccion: direccion || sucursal.direccion,
      telefono: telefono || sucursal.telefono,
      email: email !== undefined ? email : sucursal.email,
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
