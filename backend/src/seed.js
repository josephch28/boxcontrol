const { sequelize, Rol, Sucursal, Usuario, Cliente, TipoMembresia, Membresia, Pago, Asistencia, ContenidoIA } = require('./models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('--- Iniciando Seeders Completos de BoxControl ---');
    await sequelize.authenticate();
    console.log('✓ Conexión a MySQL exitosa.');

    // Sincronizar esquemas (crea las tablas automáticamente en MySQL si no existen)
    await sequelize.sync();
    console.log('✓ Estructura de tablas sincronizada mediante Sequelize ORM.');

    // 1. Roles
    const [rolAdmin] = await Rol.findOrCreate({
      where: { nombre: 'ADMINISTRADOR' },
      defaults: { descripcion: 'Acceso total y configuración del sistema en todas las sedes' }
    });
    const [rolRecep] = await Rol.findOrCreate({
      where: { nombre: 'RECEPCIONISTA' },
      defaults: { descripcion: 'Gestión diaria de clientes, cobros y asistencia en sucursal' }
    });
    const [rolCliente] = await Rol.findOrCreate({
      where: { nombre: 'CLIENTE' },
      defaults: { descripcion: 'Acceso móvil, carnet QR y rutinas' }
    });
    console.log('✓ Roles verificados.');

    // 2. Sucursales (RF-W10)
    const [sucNorte] = await Sucursal.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'Sucursal Norte - Gym Central',
        direccion: 'Av. 10 de Agosto N24-30 y Cordero, Edif. Boxing Norte, Quito',
        telefono: '0991234567',
        email: 'norte@boxcontrol.com',
        estado: 'ACTIVA'
      }
    });

    const [sucSur] = await Sucursal.findOrCreate({
      where: { id: 2 },
      defaults: {
        nombre: 'Sucursal Sur - Boxing Club',
        direccion: 'Av. Maldonado S12-80 y Moraspungo, CC El Recreo, Quito',
        telefono: '0987654321',
        email: 'sur@boxcontrol.com',
        estado: 'ACTIVA'
      }
    });
    console.log('✓ Sucursales verificadas (Norte y Sur).');

    // 3. Usuarios de Administración y Recepción
    const passAdmin = await bcrypt.hash('Admin123*', 10);
    const passRecep = await bcrypt.hash('Recep123*', 10);

    const [userAdmin] = await Usuario.findOrCreate({
      where: { email: 'admin@boxcontrol.com' },
      defaults: {
        nombre: 'Joseph',
        apellido: 'Chachalo',
        email: 'admin@boxcontrol.com',
        password: passAdmin,
        telefono: '0999999999',
        rolId: rolAdmin.id,
        sucursalId: sucNorte.id,
        estado: 'ACTIVO'
      }
    });
    userAdmin.password = passAdmin;
    userAdmin.nombre = 'Joseph';
    userAdmin.apellido = 'Chachalo';
    await userAdmin.save();

    const [userRecepNorte] = await Usuario.findOrCreate({
      where: { email: 'recepcion.norte@boxcontrol.com' },
      defaults: {
        nombre: 'Robert',
        apellido: 'Paredes',
        email: 'recepcion.norte@boxcontrol.com',
        password: passRecep,
        telefono: '0988888888',
        rolId: rolRecep.id,
        sucursalId: sucNorte.id,
        estado: 'ACTIVO'
      }
    });
    userRecepNorte.password = passRecep;
    userRecepNorte.nombre = 'Robert';
    userRecepNorte.apellido = 'Paredes';
    await userRecepNorte.save();

    const [userRecepSur] = await Usuario.findOrCreate({
      where: { email: 'recepcion.sur@boxcontrol.com' },
      defaults: {
        nombre: 'Jonathan',
        apellido: 'Jiron',
        email: 'recepcion.sur@boxcontrol.com',
        password: passRecep,
        telefono: '0977777777',
        rolId: rolRecep.id,
        sucursalId: sucSur.id,
        estado: 'ACTIVO'
      }
    });
    userRecepSur.password = passRecep;
    userRecepSur.nombre = 'Jonathan';
    userRecepSur.apellido = 'Jiron';
    await userRecepSur.save();
    console.log('✓ Usuarios del sistema actualizados.');

    // 4. Tipos de Membresía (RF-W03 - Mockup 06)
    const [tipoMensual] = await TipoMembresia.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'Plan Mensual Boxeo Full',
        descripcion: 'Acceso ilimitado a entrenamientos de boxeo de lunes a sábado en ambas sedes.',
        precio: 30.00,
        duracionDias: 30,
        estado: 'ACTIVA'
      }
    });
    await tipoMensual.update({ precio: 30.00, duracionDias: 30, nombre: 'Plan Mensual Boxeo Full' });

    const [tipoTrimestral] = await TipoMembresia.findOrCreate({
      where: { id: 2 },
      defaults: {
        nombre: 'Plan Trimestral Boxeo Pro',
        descripcion: 'Acceso por 3 meses con 10% de descuento, sesión de valoración y prioridad en sparring.',
        precio: 80.00,
        duracionDias: 90,
        estado: 'ACTIVA'
      }
    });
    await tipoTrimestral.update({ precio: 80.00, duracionDias: 90, nombre: 'Plan Trimestral Boxeo Pro' });

    const [tipoClases] = await TipoMembresia.findOrCreate({
      where: { id: 3 },
      defaults: {
        nombre: 'Pase Clases Sueltas (10 Clases)',
        descripcion: 'Bono flexible de 10 clases canjeables en 45 días sin renovación obligatoria.',
        precio: 35.00,
        duracionDias: 45,
        estado: 'ACTIVA'
      }
    });
    await tipoClases.update({ precio: 35.00, duracionDias: 45, nombre: 'Pase Clases Sueltas (10 Clases)' });
    console.log('✓ Catálogo de membresías sincronizado con mockups.');

    // 5. Socios Oficiales (Clientes de los mockups 02, 03, 04)
    const sociosMockup = [
      {
        nombre: 'Marco',
        apellido: 'Rivera Carrión',
        email: 'marco.rivera@mail.com',
        cedula: '1723456784',
        telefono: '0998431290',
        sucursalId: sucNorte.id,
        tipoMembresiaId: tipoMensual.id,
        diasRestantes: 1, // Vence MAÑANA (Mockup 02/03)
        genero: 'M',
        fechaNacimiento: '1998-03-14',
      },
      {
        nombre: 'Lucía',
        apellido: 'Paredes Kolb',
        email: 'lucia.pk@mail.com',
        cedula: '1718452129',
        telefono: '0982214820',
        sucursalId: sucSur.id,
        tipoMembresiaId: tipoTrimestral.id,
        diasRestantes: 2, // Vence en 2 DÍAS
        genero: 'F',
        fechaNacimiento: '2000-07-22',
      },
      {
        nombre: 'Diego',
        apellido: 'Vaca Salgado',
        email: 'diego.vaca@mail.com',
        cedula: '1712498235',
        telefono: '0991123456',
        sucursalId: sucNorte.id,
        tipoMembresiaId: tipoMensual.id,
        diasRestantes: 4, // Vence en 4 DÍAS
        genero: 'M',
        fechaNacimiento: '1995-11-05',
      },
      {
        nombre: 'Sofía',
        apellido: 'Núñez Paz',
        email: 'sofia.nunez@mail.com',
        cedula: '1721384756',
        telefono: '0994432198',
        sucursalId: sucSur.id,
        tipoMembresiaId: tipoMensual.id,
        diasRestantes: 5, // Vence en 5 DÍAS
        genero: 'F',
        fechaNacimiento: '1999-01-30',
      },
      {
        nombre: 'Andrés',
        apellido: 'Cabrera Morales',
        email: 'andres.cabrera@mail.com',
        cedula: '1714893201',
        telefono: '0987765432',
        sucursalId: sucNorte.id,
        tipoMembresiaId: tipoClases.id,
        diasRestantes: 6, // Vence en 6 DÍAS
        genero: 'M',
        fechaNacimiento: '1993-09-18',
      },
      {
        nombre: 'Valeria',
        apellido: 'Jiron Prado',
        email: 'valeria.jiron@mail.com',
        cedula: '1728291046',
        telefono: '0983345567',
        sucursalId: sucSur.id,
        tipoMembresiaId: tipoTrimestral.id,
        diasRestantes: 7, // Vence en 7 DÍAS
        genero: 'F',
        fechaNacimiento: '2001-04-12',
      },
      {
        nombre: 'Mateo',
        apellido: 'Morales Alarcón',
        email: 'mateo.morales@mail.com',
        cedula: '1718291030',
        telefono: '0993216549',
        sucursalId: sucNorte.id,
        tipoMembresiaId: tipoMensual.id,
        diasRestantes: 20,
        genero: 'M',
        fechaNacimiento: '1997-06-15',
      },
      {
        nombre: 'Estefanía',
        apellido: 'Loor Cedeño',
        email: 'estefania.loor@mail.com',
        cedula: '1725432197',
        telefono: '0989081234',
        sucursalId: sucSur.id,
        tipoMembresiaId: tipoMensual.id,
        diasRestantes: 18,
        genero: 'F',
        fechaNacimiento: '1996-12-08',
      },
      {
        nombre: 'David',
        apellido: 'Benítez Herrera',
        email: 'david.benitez@mail.com',
        cedula: '1719283747',
        telefono: '0996547890',
        sucursalId: sucNorte.id,
        tipoMembresiaId: tipoClases.id,
        diasRestantes: 25,
        genero: 'M',
        fechaNacimiento: '1994-08-20',
      },
      {
        nombre: 'Camila',
        apellido: 'Reyes Villacís',
        email: 'camila.reyes@mail.com',
        cedula: '1720918273',
        telefono: '0981239876',
        sucursalId: sucSur.id,
        tipoMembresiaId: tipoTrimestral.id,
        diasRestantes: 45,
        genero: 'F',
        fechaNacimiento: '2002-02-14',
      },
      {
        nombre: 'Carlos',
        apellido: 'Mendoza Zambrano',
        email: 'carlos.mendoza@mail.com',
        cedula: '1728374651',
        telefono: '0998765432',
        sucursalId: sucNorte.id,
        tipoMembresiaId: tipoMensual.id,
        diasRestantes: -3, // VENCIDO
        genero: 'M',
        fechaNacimiento: '1990-10-10',
      },
      {
        nombre: 'Gabriela',
        apellido: 'Torres Figueroa',
        email: 'gabriela.torres@mail.com',
        cedula: '1720493822',
        telefono: '0984561234',
        sucursalId: sucSur.id,
        tipoMembresiaId: tipoMensual.id,
        diasRestantes: -10, // VENCIDO
        genero: 'F',
        fechaNacimiento: '1997-05-25',
      },
    ];

    const passCliente = await bcrypt.hash('Socio123*', 10);

    for (const s of sociosMockup) {
      let user = await Usuario.findOne({ where: { email: s.email } });
      if (!user) {
        user = await Usuario.create({
          nombre: s.nombre,
          apellido: s.apellido,
          email: s.email,
          password: passCliente,
          telefono: s.telefono,
          rolId: rolCliente.id,
          sucursalId: s.sucursalId,
          estado: 'ACTIVO',
        });
      }

      let cliente = await Cliente.findOne({ where: { usuarioId: user.id } });
      if (!cliente) {
        cliente = await Cliente.create({
          usuarioId: user.id,
          cedula: s.cedula,
          fechaNacimiento: s.fechaNacimiento,
          genero: s.genero,
          codigoQr: `GD-SOCIO-${s.cedula}`,
          sucursalOrigenId: s.sucursalId,
        });
      }

      // Membresía activa o vencida según diasRestantes
      const hoy = new Date();
      const fFin = new Date(hoy);
      fFin.setDate(fFin.getDate() + s.diasRestantes);

      const tipo = await TipoMembresia.findByPk(s.tipoMembresiaId);
      const fInicio = new Date(fFin);
      fInicio.setDate(fInicio.getDate() - (tipo ? tipo.duracionDias : 30));

      const estadoMembresia = s.diasRestantes >= 0 ? 'ACTIVA' : 'VENCIDA';

      let memb = await Membresia.findOne({
        where: { clienteId: cliente.id },
      });

      if (!memb) {
        memb = await Membresia.create({
          clienteId: cliente.id,
          tipoMembresiaId: s.tipoMembresiaId,
          sucursalId: s.sucursalId,
          fechaInicio: fInicio.toISOString().split('T')[0],
          fechaFin: fFin.toISOString().split('T')[0],
          estado: estadoMembresia,
        });
      } else {
        await memb.update({
          tipoMembresiaId: s.tipoMembresiaId,
          fechaInicio: fInicio.toISOString().split('T')[0],
          fechaFin: fFin.toISOString().split('T')[0],
          estado: estadoMembresia,
        });
      }

      // Registrar Pago inicial
      const pagoExistente = await Pago.findOne({ where: { membresiaId: memb.id } });
      if (!pagoExistente) {
        await Pago.create({
          membresiaId: memb.id,
          clienteId: cliente.id,
          monto: tipo.precio,
          metodoPago: s.sucursalId === sucNorte.id ? 'EFECTIVO' : 'TRANSFERENCIA',
          referencia: `REC-${cliente.id.toString().padStart(4, '0')}`,
          sucursalId: s.sucursalId,
          registradoPor: userAdmin.id,
          fechaPago: fInicio,
        });
      }

      // Registrar asistencias de prueba
      const asistenciasPrevias = await Asistencia.count({ where: { clienteId: cliente.id } });
      if (asistenciasPrevias === 0) {
        for (let i = 1; i <= 6; i++) {
          const dAsist = new Date();
          dAsist.setDate(dAsist.getDate() - i * 2);
          dAsist.setHours(8 + (i % 5) * 2, 15 + (i * 7) % 45, 0);
          await Asistencia.create({
            clienteId: cliente.id,
            sucursalId: s.sucursalId,
            fechaHora: dAsist,
            metodo: i % 4 === 0 ? 'MANUAL' : 'QR_SCAN',
          });
        }
      }
    }
    console.log('✓ Socios, membresías, asistencias y cobros iniciales sembrados.');

    // 6. Sembrar pagos de los últimos 30 días para alimentar el gráfico de ingresos
    const pagos30dExistentes = await Pago.count();
    if (pagos30dExistentes < 30) {
      console.log('Sembrando histórico de 30 días de pagos para los gráficos...');
      const clientesList = await Cliente.findAll({ limit: 10 });
      for (let dia = 28; dia >= 1; dia--) {
        const fechaPago = new Date();
        fechaPago.setDate(fechaPago.getDate() - dia);
        fechaPago.setHours(10 + (dia % 8), (dia * 13) % 60);

        const cli = clientesList[dia % clientesList.length];
        const esNorte = dia % 2 === 0;
        const monto = (dia % 5 === 0) ? 80.00 : (dia % 3 === 0 ? 35.00 : 30.00);

        await Pago.create({
          membresiaId: 1,
          clienteId: cli.id,
          monto,
          metodoPago: dia % 3 === 0 ? 'TARJETA' : dia % 2 === 0 ? 'TRANSFERENCIA' : 'EFECTIVO',
          referencia: `HIST-${dia.toString().padStart(3, '0')}`,
          sucursalId: esNorte ? sucNorte.id : sucSur.id,
          registradoPor: esNorte ? userRecepNorte.id : userRecepSur.id,
          fechaPago,
        });
      }
    }

    // 7. Contenido Asistido por IA (RF-W12 - Mockup 09)
    const contenidosExistentes = await ContenidoIA.count();
    if (contenidosExistentes === 0) {
      console.log('Sembrando contenidos generados por IA (Rutinas y Nutrición)...');

      // 1. Borrador Pendiente de Revisión (Mockup 09)
      const rutinaBorrador = {
        resumen: '5 rondas de shadow, trabajo de piernas y core. Ideal para calentar antes de sparring ligero. Se enfoca en técnica de guardia y desplazamientos.',
        duracion: '45 MINUTOS',
        nivel: 'INTERMEDIO',
        caloriasAprox: 380,
        totalBloques: 5,
        foco: 'Shadow Box, Cardio',
        bloques: [
          { paso: '01 · Calentamiento', duracion: '5 min', detalle: 'Comba suave, rotaciones articulares de cuello, hombros y muñecas.' },
          { paso: '02 · Shadow ×3 rondas', duracion: '12 min', detalle: 'Trabajo libre con énfasis en jab doble, salida en ángulo y esquiva rotativa.' },
          { paso: '03 · Footwork drills', duracion: '8 min', detalle: 'Desplazamientos laterales, cortes de ring y pasos de pivote.' },
          { paso: '04 · Core & abs', duracion: '10 min', detalle: 'Giros rusos, planchas dinámicas y toque de talones para blindar la zona media.' },
          { paso: '05 · Enfriamiento', duracion: '10 min', detalle: 'Estiramiento estático profundo y regulación respiratoria.' },
        ],
      };

      await ContenidoIA.create({
        tipo: 'RUTINA',
        titulo: 'SHADOW BOX + CONDICIONAMIENTO',
        descripcion: JSON.stringify(rutinaBorrador),
        nivel: 'INTERMEDIO',
        estado: 'BORRADOR',
        creadoPor: userAdmin.id,
      });

      // 2. Rutina Publicada
      const rutinaPublicada = {
        resumen: 'Circuito intensivo de golpeo al saco pesado enfocado en transferir torque desde los pies hasta los nudillos.',
        duracion: '50 MINUTOS',
        nivel: 'AVANZADO',
        caloriasAprox: 520,
        totalBloques: 4,
        foco: 'Saco Pesado, Potencia, Sparring',
        bloques: [
          { paso: '01 · Activación con comba veloz', duracion: '8 min', detalle: 'Saltos dobles alternados para despertar fibras rápidas.' },
          { paso: '02 · Heavy bag power rounds (4 × 3 min)', duracion: '15 min', detalle: 'Combinaciones de impacto máximo: Jab-Cross-Gancho zurdo al hígado.' },
          { paso: '03 · Defensa y counter-punching', duracion: '12 min', detalle: 'Bloqueo con antebrazo y réplica inmediata con cruzado de derecha.' },
          { paso: '04 · Vuelta a la calma', duracion: '7 min', detalle: 'Descompresión espinal y masaje miofascial con rodillo.' },
        ],
      };

      await ContenidoIA.create({
        tipo: 'RUTINA',
        titulo: 'POTENCIA EXPLOSIVA EN SACO PESADO',
        descripcion: JSON.stringify(rutinaPublicada),
        nivel: 'AVANZADO',
        estado: 'PUBLICADO',
        creadoPor: userAdmin.id,
      });

      // 3. Nutrición Publicada
      const nutricionPublicada = {
        resumen: 'Pauta deportiva de carga de carbohidratos complejos y reposición de aminoácidos para boxeadores en periodo de entrenamiento regular.',
        duracion: 'Plan Diario',
        caloriasAprox: 2700,
        macros: { proteinas: '2.2g/kg', carbohidratos: '4.8g/kg', grasas: '1.0g/kg' },
        comidas: [
          { momento: 'Desayuno', plato: 'Pancake de avena, 3 claras de huevo y 1 fruta entera.', detalle: 'Aporte de carbohidratos limpios.' },
          { momento: 'Almuerzo', plato: 'Filete de pechuga (180g), quinoa cocida y verduras al vapor.', detalle: 'Proteína magra para síntesis proteica.' },
          { momento: 'Cena', plato: 'Lomo de atún sellado con ensalada verde y aceite de oliva.', detalle: 'Grasas saludables y digestión liviana.' },
        ],
        hidratacion: 'Mínimo 3.5 litros de agua natural al día.',
      };

      await ContenidoIA.create({
        tipo: 'ALIMENTACION',
        titulo: 'NUTRICIÓN DEPORTIVA PARA ALTO RENDIMIENTO',
        descripcion: JSON.stringify(nutricionPublicada),
        nivel: 'INTERMEDIO',
        estado: 'PUBLICADO',
        creadoPor: userAdmin.id,
      });

      // 4. Contenido Rechazado de Muestra
      await ContenidoIA.create({
        tipo: 'RUTINA',
        titulo: 'SPARRING EXTREMO SIN PROTECCIÓN',
        descripcion: JSON.stringify({ resumen: 'Propuesta descartada por seguridad y salud de los boxeadores novatos.' }),
        nivel: 'AVANZADO',
        estado: 'RECHAZADO',
        creadoPor: userAdmin.id,
      });
      console.log('✓ Contenidos de IA sembrados (Borradores, Publicados y Rechazados).');
    }

    console.log('\n==================================================');
    console.log('🥊 SEED COMPLETO DE BOXCONTROL FINALIZADO CON ÉXITO');
    console.log('==================================================');
    console.log('Credenciales de acceso:');
    console.log('  • Admin:              admin@boxcontrol.com / Admin123*');
    console.log('  • Recepción Norte:    recepcion.norte@boxcontrol.com / Recep123*');
    console.log('  • Recepción Sur:      recepcion.sur@boxcontrol.com / Recep123*');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
}

seedDatabase();
