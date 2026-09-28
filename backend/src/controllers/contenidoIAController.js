const { ContenidoIA, Usuario } = require('../models');

// Función generadora de contenido de boxeo experto (IA Boxing Engine)
const generarContenidoInteligente = ({ tipo, nivel, duracion, foco, instrucciones }) => {
  const focoTexto = Array.isArray(foco) && foco.length > 0 ? foco.join(', ') : 'Técnica integral y resistencia';
  const duracionTexto = duracion || '45 minutos';
  const nivelTexto = nivel || 'INTERMEDIO';

  if (tipo === 'ALIMENTACION') {
    let titulo = `PLAN NUTRICIONAL · BOXEO ${nivelTexto}`;
    if (focoTexto.toLowerCase().includes('cardio') || focoTexto.toLowerCase().includes('corte')) {
      titulo = `PLAN DE CORTE Y POTENCIA AERÓBICA (${nivelTexto})`;
    } else if (focoTexto.toLowerCase().includes('fuerza') || focoTexto.toLowerCase().includes('sparring')) {
      titulo = `NUTRICIÓN PARA SPARRING Y RECUPERACIÓN (${nivelTexto})`;
    }

    const kcalMap = {
      PRINCIPIANTE: 2200,
      INTERMEDIO: 2650,
      AVANZADO: 3100,
    };
    const kcal = kcalMap[nivelTexto] || 2500;

    const descripcion = JSON.stringify({
      resumen: `Pauta alimentaria orientada a deportes de combate con énfasis en ${focoTexto.toLowerCase()}. Optimizado para sesiones de ${duracionTexto}. ${instrucciones ? 'Nota adicional: ' + instrucciones : ''}`,
      duracion: duracionTexto,
      caloriasAprox: kcal,
      macros: {
        proteinas: '2.0g/kg',
        carbohidratos: '4.5g/kg',
        grasas: '1.0g/kg',
      },
      comidas: [
        {
          momento: 'Desayuno (Pre-entrenamiento matutino)',
          plato: 'Avena con manzana, canela, mantequilla de maní y 3 claras con 1 huevo entero.',
          detalle: 'Aporte de carbohidratos de bajo índice glucémico y electrolitos para energía sostenida en el ring.',
        },
        {
          momento: 'Snack de Energía Rápida (45 min antes del entreno)',
          plato: '1 plátano con miel de abeja y 300ml de agua con pizca de sal marina.',
          detalle: 'Previene hipoglucemia reactiva durante las rondas de golpeo y shadow boxing.',
        },
        {
          momento: 'Almuerzo Post-Sparring / Recuperación',
          plato: 'Pechuga de pollo a la plancha (200g), arroz integral (1.5 tazas), aguacate y ensalada verde oscura.',
          detalle: 'Reparación de fibras musculares y reposición de glucógeno muscular.',
        },
        {
          momento: 'Cena Liviana y Antiinflamatoria',
          plato: 'Filete de pescado blanco o salmón, puré de camote y espárragos salteados en aceite de oliva.',
          detalle: 'Omega 3 y magnesio para desinflamar articulaciones y mejorar el sueño profundo reparador.',
        },
      ],
      hidratacion: 'Consumir mínimo 3.5 litros de agua al día. En sesiones intensas, añadir sales de rehidratación oral.',
    });

    return { titulo, descripcion };
  } else {
    // RUTINA DE BOXEO
    let titulo = `SHADOW BOX + CONDICIONAMIENTO (${nivelTexto})`;
    if (focoTexto.toLowerCase().includes('sparring')) {
      titulo = `PREPARACIÓN TÁCTICA PARA SPARRING (${nivelTexto})`;
    } else if (focoTexto.toLowerCase().includes('fuerza')) {
      titulo = `POTENCIA EXPLOSIVA Y GOLPEO PESADO (${nivelTexto})`;
    } else if (focoTexto.toLowerCase().includes('cardio')) {
      titulo = `CIRCUITO DE FONDO Y VELOCIDAD DE MANOS (${nivelTexto})`;
    }

    const kcalMap = {
      PRINCIPIANTE: 310,
      INTERMEDIO: 420,
      AVANZADO: 540,
    };
    const kcal = kcalMap[nivelTexto] || 400;

    const bloquesMap = {
      PRINCIPIANTE: [
        { paso: '01 · Movilidad articular y comba suave', duracion: '7 min', detalle: 'Salto de cuerda a ritmo constante y calentamiento de hombros, cuello y muñecas.' },
        { paso: '02 · Guardia, balance y pasos planos', duracion: '10 min', detalle: 'Desplazamientos adelante, atrás y giros sobre pivote manteniendo postura firme.' },
        { paso: '03 · Fundamentos de 1-2 (Jab y Cross)', duracion: '12 min', detalle: '4 rondas de 2.5 min lanzando combinaciones básicas al aire con máxima extensión.' },
        { paso: '04 · Saco liviano / técnica de impacto', duracion: '10 min', detalle: 'Golpes rectos pausados con enfoque en cerrar el puño y respirar al impactar.' },
        { paso: '05 · Vuelta a la calma y estiramiento', duracion: '6 min', detalle: 'Descompresión de columna lumbar, isquiotibiales y deltoides.' },
      ],
      INTERMEDIO: [
        { paso: '01 · Calentamiento dinámico y comba veloz', duracion: '5 min', detalle: 'Saltos dobles alternos y activación cardiovascular progresiva.' },
        { paso: '02 · Shadow × 3 rondas (Técnica y cintura)', duracion: '12 min', detalle: 'Visualización activa, esquivas circulares (roll) y contragolpes con gancho al hígado.' },
        { paso: '03 · Footwork drills (Escalera y pivotes)', duracion: '8 min', detalle: 'Velocidad lateral cortando el ring para controlar los ángulos de pegada.' },
        { paso: '04 · Heavy bag drills (Potencia)', duracion: '10 min', detalle: 'Series de 30 segundos de volumen seguidos de 30 segundos de golpes de nocaut.' },
        { paso: '05 · Core y acondicionamiento abdominal', duracion: '6 min', detalle: 'Giros rusos, planchas estáticas y elevaciones de piernas para resistencia de pegada.' },
        { paso: '06 · Enfriamiento y soltura', duracion: '4 min', detalle: 'Caminata lenta, respiración diafragmática y elongación profunda.' },
      ],
      AVANZADO: [
        { paso: '01 · Activación neuromuscular y cuerda con lastre', duracion: '6 min', detalle: 'Cuerda a alta cadencia combinada con sombras rápidas sin descansos.' },
        { paso: '02 · Shadow boxing de combate (5 rondas × 3 min)', duracion: '18 min', detalle: 'Ritmo de competencia profesional, cambios de guardia y simulación de presión contra las cuerdas.' },
        { paso: '03 · Saco pesado de 100lb (Volumen y torque)', duracion: '15 min', detalle: 'Combinaciones de 4 y 5 impactos finalizando con upper o gancho demoledor al cuerpo.' },
        { paso: '04 · Circuito de fuerza funcional y cuello', duracion: '10 min', detalle: 'Flexiones con palmada, balón medicinal contra pared y fortalecimiento cervical.' },
        { paso: '05 · Enfriamiento regenerativo y estiramientos', duracion: '5 min', detalle: 'Respiración asistida y estiramiento miofascial completo.' },
      ],
    };

    const bloques = bloquesMap[nivelTexto] || bloquesMap.INTERMEDIO;

    const descripcion = JSON.stringify({
      resumen: `Sesión de entrenamiento enfocado en ${focoTexto.toLowerCase()}. Diseñada para desarrollar velocidad, contundencia y movilidad sobre la lona. ${instrucciones ? 'Instrucciones específicas: ' + instrucciones : ''}`,
      duracion: duracionTexto,
      nivel: nivelTexto,
      caloriasAprox: kcal,
      totalBloques: bloques.length,
      foco: focoTexto,
      bloques,
    });

    return { titulo, descripcion };
  }
};

// Listar contenidos IA con filtro de estado (RF-W12)
const getContenidos = async (req, res) => {
  try {
    const { estado, tipo } = req.query;
    const where = {};

    if (estado && estado !== 'TODOS') {
      where.estado = estado;
    }
    if (tipo) {
      where.tipo = tipo;
    }

    const contenidos = await ContenidoIA.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido', 'email'],
        },
      ],
      order: [['id', 'DESC']],
    });

    const procesados = contenidos.map((c) => {
      const plain = c.toJSON();
      let parsed = null;
      try {
        parsed = JSON.parse(plain.descripcion);
      } catch (e) {
        parsed = { resumen: plain.descripcion };
      }

      return {
        ...plain,
        detalleEstructurado: parsed,
        autorNombre: `${plain.autor?.nombre || 'Admin'} ${plain.autor?.apellido || ''}`.trim(),
        fechaFormateada: new Date(plain.createdAt).toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });

    // Conteo por estado para los tabs
    const [pendientes, publicados, rechazados] = await Promise.all([
      ContenidoIA.count({ where: { estado: 'BORRADOR' } }),
      ContenidoIA.count({ where: { estado: 'PUBLICADO' } }),
      ContenidoIA.count({ where: { estado: 'RECHAZADO' } }),
    ]);

    return res.status(200).json({
      success: true,
      count: procesados.length,
      contadores: {
        pendientes,
        publicados,
        rechazados,
      },
      data: procesados,
    });
  } catch (error) {
    console.error('Error al listar contenidos IA:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar contenidos de entrenamiento.',
      error: error.message,
    });
  }
};

// Generar nuevo contenido mediante IA / Motor Boxeo (RF-W12)
const generarContenido = async (req, res) => {
  try {
    const { tipo = 'RUTINA', nivel = 'INTERMEDIO', duracion = '45 MINUTOS', foco = [], instrucciones = '' } = req.body;

    const { titulo, descripcion } = generarContenidoInteligente({
      tipo,
      nivel,
      duracion,
      foco,
      instrucciones,
    });

    const nuevoContenido = await ContenidoIA.create({
      tipo,
      titulo,
      descripcion,
      nivel,
      estado: 'BORRADOR',
      creadoPor: req.usuario?.id || 1,
    });

    let detalleEstructurado = null;
    try {
      detalleEstructurado = JSON.parse(descripcion);
    } catch (e) {
      detalleEstructurado = { resumen: descripcion };
    }

    return res.status(201).json({
      success: true,
      message: 'Borrador generado con éxito por el motor de IA.',
      data: {
        ...nuevoContenido.toJSON(),
        detalleEstructurado,
      },
    });
  } catch (error) {
    console.error('Error al generar contenido con IA:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la generación de contenido.',
      error: error.message,
    });
  }
};

// Actualizar contenido (curaduría del administrador) (RF-W12)
const actualizarContenido = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, nivel, estado } = req.body;

    const contenido = await ContenidoIA.findByPk(id);
    if (!contenido) {
      return res.status(404).json({
        success: false,
        message: `Contenido con ID ${id} no encontrado.`,
      });
    }

    await contenido.update({
      titulo: titulo ? titulo.trim() : contenido.titulo,
      descripcion: descripcion !== undefined ? (typeof descripcion === 'object' ? JSON.stringify(descripcion) : descripcion) : contenido.descripcion,
      nivel: nivel || contenido.nivel,
      estado: estado || contenido.estado,
    });

    return res.status(200).json({
      success: true,
      message: 'Contenido actualizado exitosamente.',
      data: contenido,
    });
  } catch (error) {
    console.error('Error al actualizar contenido IA:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al modificar contenido.',
      error: error.message,
    });
  }
};

// Cambiar estado (Aprobar y Publicar, Rechazar o Volver a Borrador) (RF-W12)
const cambiarEstadoContenido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // 'PUBLICADO', 'RECHAZADO', 'BORRADOR'

    if (!['BORRADOR', 'PUBLICADO', 'RECHAZADO'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Debe ser BORRADOR, PUBLICADO o RECHAZADO.',
      });
    }

    const contenido = await ContenidoIA.findByPk(id);
    if (!contenido) {
      return res.status(404).json({
        success: false,
        message: `Contenido con ID ${id} no encontrado.`,
      });
    }

    await contenido.update({ estado });

    const accionMsg = estado === 'PUBLICADO'
      ? 'Contenido aprobado y publicado en la App Móvil con éxito.'
      : estado === 'RECHAZADO'
      ? 'Contenido descartado y marcado como rechazado.'
      : 'Contenido retornado a borrador.';

    return res.status(200).json({
      success: true,
      message: accionMsg,
      data: contenido,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del contenido.',
      error: error.message,
    });
  }
};

// Eliminar contenido
const eliminarContenido = async (req, res) => {
  try {
    const { id } = req.params;
    const contenido = await ContenidoIA.findByPk(id);
    if (!contenido) {
      return res.status(404).json({
        success: false,
        message: `Contenido con ID ${id} no encontrado.`,
      });
    }

    await contenido.destroy();
    return res.status(200).json({
      success: true,
      message: 'Contenido eliminado de la base de datos.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar contenido.',
      error: error.message,
    });
  }
};

module.exports = {
  getContenidos,
  generarContenido,
  actualizarContenido,
  cambiarEstadoContenido,
  eliminarContenido,
};
