const { TipoMembresia, Membresia, sequelize } = require('../models');

// Listar todos los tipos de membresía con socios activos (RF-W03)
const getTiposMembresia = async (req, res) => {
  try {
    const tipos = await TipoMembresia.findAll({
      order: [['precio', 'ASC']],
    });

    const hoy = new Date().toISOString().split('T')[0];

    // Obtener recuento de socios activos por tipo
    const conteoActivos = await Membresia.findAll({
      attributes: [
        'tipoMembresiaId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalActivos'],
      ],
      where: {
        estado: 'ACTIVA',
      },
      group: ['tipoMembresiaId'],
    });

    const mapaConteo = {};
    conteoActivos.forEach((c) => {
      const p = c.toJSON();
      mapaConteo[p.tipoMembresiaId] = Number(p.totalActivos || 0);
    });

    const datos = tipos.map((t) => {
      const plain = t.toJSON();
      return {
        ...plain,
        sociosActivos: mapaConteo[plain.id] || 0,
      };
    });

    return res.status(200).json({
      success: true,
      count: datos.length,
      data: datos,
    });
  } catch (error) {
    console.error('Error al listar tipos de membresía:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar catálogo de membresías.',
      error: error.message,
    });
  }
};

// Obtener un tipo de membresía por ID
const getTipoMembresiaById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await TipoMembresia.findByPk(id);

    if (!tipo) {
      return res.status(404).json({
        success: false,
        message: `Tipo de membresía con ID ${id} no encontrado.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: tipo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al consultar tipo de membresía.',
      error: error.message,
    });
  }
};

// Crear nuevo tipo de membresía (RF-W03 - Admin)
const createTipoMembresia = async (req, res) => {
  try {
    const { nombre, descripcion, precio, duracionDias, estado } = req.body;

    if (!nombre || precio === undefined || !duracionDias) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, precio y duración en días son campos obligatorios.',
      });
    }

    const nuevoTipo = await TipoMembresia.create({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      precio: Number(precio),
      duracionDias: Number(duracionDias),
      estado: estado || 'ACTIVA',
    });

    return res.status(201).json({
      success: true,
      message: 'Plan de membresía creado exitosamente.',
      data: nuevoTipo,
    });
  } catch (error) {
    console.error('Error al crear tipo de membresía:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar nuevo plan de membresía.',
      error: error.message,
    });
  }
};

// Actualizar tipo de membresía (RF-W03 - Admin)
const updateTipoMembresia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, duracionDias, estado } = req.body;

    const tipo = await TipoMembresia.findByPk(id);
    if (!tipo) {
      return res.status(404).json({
        success: false,
        message: `Plan con ID ${id} no encontrado.`,
      });
    }

    await tipo.update({
      nombre: nombre ? nombre.trim() : tipo.nombre,
      descripcion: descripcion !== undefined ? descripcion : tipo.descripcion,
      precio: precio !== undefined ? Number(precio) : tipo.precio,
      duracionDias: duracionDias !== undefined ? Number(duracionDias) : tipo.duracionDias,
      estado: estado || tipo.estado,
    });

    return res.status(200).json({
      success: true,
      message: 'Plan de membresía actualizado exitosamente.',
      data: tipo,
    });
  } catch (error) {
    console.error('Error al actualizar tipo de membresía:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al modificar plan de membresía.',
      error: error.message,
    });
  }
};

// Alternar estado activo/inactivo (RF-W03 - Admin)
const toggleEstadoTipoMembresia = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await TipoMembresia.findByPk(id);

    if (!tipo) {
      return res.status(404).json({
        success: false,
        message: `Plan con ID ${id} no encontrado.`,
      });
    }

    const nuevoEstado = tipo.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    await tipo.update({ estado: nuevoEstado });

    return res.status(200).json({
      success: true,
      message: `Plan de membresía ${nuevoEstado.toLowerCase()} exitosamente.`,
      data: tipo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del plan.',
      error: error.message,
    });
  }
};

module.exports = {
  getTiposMembresia,
  getTipoMembresiaById,
  createTipoMembresia,
  updateTipoMembresia,
  toggleEstadoTipoMembresia,
};
