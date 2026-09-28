const { Op } = require('sequelize');
const { sequelize, Cliente, Usuario, Sucursal, Membresia, TipoMembresia, Pago, Asistencia, Rol } = require('../models');

// Helper para calcular diferencia de días entre fechas
const calcularDiasRestantes = (fechaFin) => {
  if (!fechaFin) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin + 'T00:00:00');
  const diffTiempo = fin.getTime() - hoy.getTime();
  return Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
};

// Helper para formatear etiqueta de vencimiento
const getVenceLabel = (diasRestantes, fechaFin) => {
  if (diasRestantes === null) return 'SIN MEMBRESÍA';
  if (diasRestantes < 0) return `VENCIDA (${Math.abs(diasRestantes)}d)`;
  if (diasRestantes === 0) return 'VENCE HOY';
  if (diasRestantes === 1) return 'MAÑANA';
  if (diasRestantes <= 7) return `${diasRestantes} DÍAS`;
  return new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
};

// Listar clientes con filtros (RF-W02)
const getClientes = async (req, res) => {
  try {
    const { q, sucursalId, estado } = req.query;

    const whereUsuario = {};
    const whereCliente = {};

    // Filtro por búsqueda de texto (nombre, apellido, email, teléfono, cédula)
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      whereCliente[Op.or] = [
        { cedula: { [Op.like]: term } },
        sequelize.where(sequelize.col('usuario.nombre'), { [Op.like]: term }),
        sequelize.where(sequelize.col('usuario.apellido'), { [Op.like]: term }),
        sequelize.where(sequelize.col('usuario.email'), { [Op.like]: term }),
        sequelize.where(sequelize.col('usuario.telefono'), { [Op.like]: term }),
      ];
    }

    // Filtro por sucursal de origen
    if (sucursalId && sucursalId !== 'TODAS') {
      whereCliente.sucursalOrigenId = sucursalId;
    }

    const clientes = await Cliente.findAll({
      where: whereCliente,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          where: whereUsuario,
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono', 'estado', 'createdAt'],
        },
        {
          model: Sucursal,
          as: 'sucursalOrigen',
          attributes: ['id', 'nombre'],
        },
        {
          model: Membresia,
          as: 'membresias',
          include: [
            {
              model: TipoMembresia,
              as: 'tipoMembresia',
              attributes: ['id', 'nombre', 'precio', 'duracionDias'],
            },
          ],
        },
      ],
      order: [['id', 'DESC']],
    });

    const hoyStr = new Date().toISOString().split('T')[0];

    // Procesar cada cliente para calcular el estado de su última membresía
    let resultados = clientes.map((cli) => {
      const plain = cli.toJSON();
      
      // Ordenar membresías por fecha_fin descendente
      const membresias = (plain.membresias || []).sort((a, b) => new Date(b.fechaFin) - new Date(a.fechaFin));
      const ultimaMembresia = membresias[0] || null;

      let estadoMembresia = 'SIN_MEMBRESIA';
      let diasRestantes = null;
      let venceLabel = 'SIN MEMBRESÍA';
      let planActual = null;
      let precioPlan = null;

      if (ultimaMembresia) {
        diasRestantes = calcularDiasRestantes(ultimaMembresia.fechaFin);
        planActual = ultimaMembresia.tipoMembresia?.nombre || 'PLAN';
        precioPlan = ultimaMembresia.tipoMembresia?.precio || 0;

        if (ultimaMembresia.estado === 'ACTIVA' && diasRestantes >= 0) {
          estadoMembresia = 'ACTIVO';
        } else {
          estadoMembresia = 'VENCIDO';
        }
        venceLabel = getVenceLabel(diasRestantes, ultimaMembresia.fechaFin);
      }

      // Validar si es nuevo socio (registrado en los últimos 30 días)
      const creado = new Date(plain.usuario?.createdAt || plain.createdAt);
      const diasDesdeRegistro = Math.floor((new Date() - creado) / (1000 * 60 * 60 * 24));
      const esNuevo = diasDesdeRegistro <= 30;

      return {
        id: plain.id,
        usuarioId: plain.usuarioId,
        nombre: plain.usuario?.nombre,
        apellido: plain.usuario?.apellido,
        nombreCompleto: `${plain.usuario?.nombre} ${plain.usuario?.apellido}`,
        email: plain.usuario?.email,
        telefono: plain.usuario?.telefono,
        cedula: plain.cedula,
        genero: plain.genero,
        fechaNacimiento: plain.fechaNacimiento,
        codigoQr: plain.codigoQr,
        sucursal: plain.sucursalOrigen?.nombre || 'SIN SUCURSAL',
        sucursalId: plain.sucursalOrigenId,
        sucursalCode: plain.sucursalOrigen?.nombre?.toUpperCase().includes('SUR') ? 'SUR' : 'NORTE',
        estadoUsuario: plain.usuario?.estado,
        estadoMembresia,
        diasRestantes,
        venceLabel,
        fechaVencimiento: ultimaMembresia?.fechaFin || null,
        planActual,
        precioPlan,
        esNuevo,
        membresiaActiva: estadoMembresia === 'ACTIVO' ? ultimaMembresia : null,
      };
    });

    // Filtro por pestaña de estado
    if (estado && estado !== 'TODOS') {
      if (estado === 'ACTIVOS') {
        resultados = resultados.filter((c) => c.estadoMembresia === 'ACTIVO');
      } else if (estado === 'VENCIDOS') {
        resultados = resultados.filter((c) => c.estadoMembresia === 'VENCIDO' || c.estadoMembresia === 'SIN_MEMBRESIA');
      } else if (estado === 'NUEVOS') {
        resultados = resultados.filter((c) => c.esNuevo);
      }
    }

    return res.status(200).json({
      success: true,
      count: resultados.length,
      data: resultados,
    });
  } catch (error) {
    console.error('Error al listar clientes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar clientes.',
      error: error.message,
    });
  }
};

// Obtener detalle completo de un cliente (RF-W11, RF-M04)
const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: { exclude: ['password'] },
        },
        {
          model: Sucursal,
          as: 'sucursalOrigen',
        },
        {
          model: Membresia,
          as: 'membresias',
          include: [
            { model: TipoMembresia, as: 'tipoMembresia' },
            { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
          ],
        },
        {
          model: Pago,
          as: 'pagos',
          include: [
            { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
            { model: Usuario, as: 'cajero', attributes: ['id', 'nombre', 'apellido'] },
            {
              model: Membresia,
              as: 'membresia',
              include: [{ model: TipoMembresia, as: 'tipoMembresia' }],
            },
          ],
        },
        {
          model: Asistencia,
          as: 'asistencias',
          include: [{ model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] }],
        },
      ],
      order: [
        [{ model: Membresia, as: 'membresias' }, 'id', 'DESC'],
        [{ model: Pago, as: 'pagos' }, 'id', 'DESC'],
        [{ model: Asistencia, as: 'asistencias' }, 'id', 'DESC'],
      ],
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: `Cliente con ID ${id} no encontrado.`,
      });
    }

    const plain = cliente.toJSON();
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Calcular estadísticas
    const asistencias = plain.asistencias || [];
    const asistenciasMes = asistencias.filter(
      (a) => new Date(a.fechaHora) >= inicioMes
    ).length;
    const asistenciasTotal = asistencias.length;

    const pagos = plain.pagos || [];
    const anioActual = hoy.getFullYear();
    const totalPagadoAnio = pagos
      .filter((p) => new Date(p.fechaPago).getFullYear() === anioActual)
      .reduce((sum, p) => sum + Number(p.monto || 0), 0);

    const fechaAlta = new Date(plain.usuario?.createdAt || plain.createdAt);
    const mesesActivo = Math.max(
      1,
      Math.floor((hoy - fechaAlta) / (1000 * 60 * 60 * 24 * 30.4))
    );

    // Membresía activa más reciente
    const membresias = plain.membresias || [];
    const membresiaActual = membresias.find((m) => {
      const dias = calcularDiasRestantes(m.fechaFin);
      return m.estado === 'ACTIVA' && dias >= 0;
    }) || membresias[0] || null;

    let diasRestantes = null;
    let venceLabel = 'SIN MEMBRESÍA';
    let estadoMembresia = 'SIN_MEMBRESIA';

    if (membresiaActual) {
      diasRestantes = calcularDiasRestantes(membresiaActual.fechaFin);
      if (membresiaActual.estado === 'ACTIVA' && diasRestantes >= 0) {
        estadoMembresia = 'ACTIVO';
      } else {
        estadoMembresia = 'VENCIDO';
      }
      venceLabel = getVenceLabel(diasRestantes, membresiaActual.fechaFin);
    }

    return res.status(200).json({
      success: true,
      data: {
        ...plain,
        nombreCompleto: `${plain.usuario?.nombre} ${plain.usuario?.apellido}`,
        estadoMembresia,
        diasRestantes,
        venceLabel,
        membresiaActual,
        estadisticas: {
          asistenciasMes,
          asistenciasTotal,
          totalPagadoAnio,
          mesesActivo,
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar datos del socio.',
      error: error.message,
    });
  }
};

// Crear nuevo socio/cliente (RF-W02)
const createCliente = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      telefono,
      cedula,
      fechaNacimiento,
      genero,
      sucursalOrigenId,
      tipoMembresiaId,
      metodoPago,
      referencia,
    } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !cedula || !sucursalOrigenId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellido, email, cédula y sucursal de origen son obligatorios.',
      });
    }

    // Verificar que la sucursal de origen esté activa
    const sucOrigen = await Sucursal.findByPk(sucursalOrigenId);
    if (sucOrigen && sucOrigen.estado === 'INACTIVA') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `La sucursal '${sucOrigen.nombre}' se encuentra inactiva y no admite nuevas inscripciones.`,
      });
    }

    // Verificar email único
    const existeEmail = await Usuario.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existeEmail) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya se encuentra registrado.',
      });
    }

    // Verificar cédula única
    const existeCedula = await Cliente.findOne({ where: { cedula: cedula.trim() } });
    if (existeCedula) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'La cédula ya se encuentra registrada para otro socio.',
      });
    }

    // Rol de CLIENTE
    const rolCliente = await Rol.findOne({ where: { nombre: 'CLIENTE' } });
    const rolId = rolCliente ? rolCliente.id : 3;

    // Crear Usuario
    const nuevoUsuario = await Usuario.create(
      {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        password: password || `${cedula.trim()}*`,
        telefono: telefono ? telefono.trim() : null,
        rolId,
        sucursalId: sucursalOrigenId,
        estado: 'ACTIVO',
      },
      { transaction }
    );

    // Generar código QR único para carnet digital (RF-M02)
    const codigoQr = `GD-SOCIO-${cedula.trim()}-${Date.now().toString(36).toUpperCase()}`;

    // Crear registro Cliente
    const nuevoCliente = await Cliente.create(
      {
        usuarioId: nuevoUsuario.id,
        cedula: cedula.trim(),
        fechaNacimiento: fechaNacimiento || null,
        genero: genero || 'M',
        codigoQr,
        sucursalOrigenId,
      },
      { transaction }
    );

    // Asignar membresía inicial si se especificó
    let membresiaCreada = null;
    let pagoCreado = null;
    if (tipoMembresiaId) {
      const tipo = await TipoMembresia.findByPk(tipoMembresiaId);
      if (tipo) {
        if (tipo.estado === 'INACTIVA') {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `El plan de membresía '${tipo.nombre}' se encuentra inactivo y no admite nuevas afiliaciones.`,
          });
        }
        const fechaInicio = new Date();
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + Number(tipo.duracionDias));

        membresiaCreada = await Membresia.create(
          {
            clienteId: nuevoCliente.id,
            tipoMembresiaId: tipo.id,
            sucursalId: sucursalOrigenId,
            fechaInicio: fechaInicio.toISOString().split('T')[0],
            fechaFin: fechaFin.toISOString().split('T')[0],
            estado: 'ACTIVA',
          },
          { transaction }
        );

        pagoCreado = await Pago.create(
          {
            membresiaId: membresiaCreada.id,
            clienteId: nuevoCliente.id,
            monto: tipo.precio,
            metodoPago: metodoPago || 'EFECTIVO',
            referencia: referencia || `INSCRIPCIÓN-${Date.now().toString().slice(-6)}`,
            sucursalId: sucursalOrigenId,
            registradoPor: req.usuario?.id || 1,
            fechaPago: new Date(),
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Socio registrado exitosamente con su carnet QR digital.',
      data: {
        clienteId: nuevoCliente.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        cedula: nuevoCliente.cedula,
        codigoQr: nuevoCliente.codigoQr,
        membresia: membresiaCreada,
        pago: pagoCreado,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar el socio en la base de datos.',
      error: error.message,
    });
  }
};

// Editar socio/cliente (RF-W02)
const updateCliente = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      cedula,
      fechaNacimiento,
      genero,
      sucursalOrigenId,
    } = req.body;

    const cliente = await Cliente.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }],
    });

    if (!cliente) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Cliente con ID ${id} no encontrado.`,
      });
    }

    // Validar si la cédula cambió y si ya existe
    if (cedula && cedula !== cliente.cedula) {
      const existeCedula = await Cliente.findOne({
        where: {
          cedula: cedula.trim(),
          id: { [Op.ne]: id },
        },
      });
      if (existeCedula) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'La nueva cédula ya pertenece a otro socio.',
        });
      }
      cliente.cedula = cedula.trim();
    }

    // Actualizar campos de Cliente
    if (fechaNacimiento !== undefined) cliente.fechaNacimiento = fechaNacimiento;
    if (genero !== undefined) cliente.genero = genero;
    if (sucursalOrigenId) cliente.sucursalOrigenId = sucursalOrigenId;
    await cliente.save({ transaction });

    // Actualizar Usuario asociado
    if (cliente.usuario) {
      if (email && email.toLowerCase().trim() !== cliente.usuario.email) {
        const existeEmail = await Usuario.findOne({
          where: {
            email: email.toLowerCase().trim(),
            id: { [Op.ne]: cliente.usuario.id },
          },
        });
        if (existeEmail) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'El correo electrónico ya pertenece a otro usuario.',
          });
        }
        cliente.usuario.email = email.toLowerCase().trim();
      }

      if (nombre) cliente.usuario.nombre = nombre.trim();
      if (apellido) cliente.usuario.apellido = apellido.trim();
      if (telefono !== undefined) cliente.usuario.telefono = telefono ? telefono.trim() : null;
      if (sucursalOrigenId) cliente.usuario.sucursalId = sucursalOrigenId;

      await cliente.usuario.save({ transaction });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Datos del socio actualizados exitosamente.',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar datos del socio.',
      error: error.message,
    });
  }
};

// Eliminar socio/cliente (RF-W02)
const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }],
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: `Cliente con ID ${id} no encontrado.`,
      });
    }

    // Soft delete: cambiar estado de usuario a INACTIVO
    if (cliente.usuario) {
      cliente.usuario.estado = cliente.usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      await cliente.usuario.save();
    }

    return res.status(200).json({
      success: true,
      message: `Estado del socio modificado a: ${cliente.usuario.estado}.`,
      nuevoEstado: cliente.usuario.estado,
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al modificar estado del socio.',
      error: error.message,
    });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
};
