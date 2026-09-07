const { sequelize, Rol, Sucursal, Usuario, TipoMembresia } = require('./models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('--- Iniciando Seeders de BoxControl ---');
    await sequelize.authenticate();
    console.log('Conexión a MySQL exitosa.');

    // 1. Roles
    const [rolAdmin] = await Rol.findOrCreate({
      where: { nombre: 'ADMINISTRADOR' },
      defaults: { descripcion: 'Acceso total y configuración del sistema' }
    });
    const [rolRecep] = await Rol.findOrCreate({
      where: { nombre: 'RECEPCIONISTA' },
      defaults: { descripcion: 'Gestión diaria de clientes, cobros y asistencia' }
    });
    const [rolCliente] = await Rol.findOrCreate({
      where: { nombre: 'CLIENTE' },
      defaults: { descripcion: 'Acceso móvil, carnet QR y rutinas' }
    });
    console.log('✓ Roles creados/verificados.');

    // 2. Sucursales (RF-W10)
    const [sucNorte] = await Sucursal.findOrCreate({
      where: { nombre: 'Sucursal Norte - Gym Central' },
      defaults: {
        direccion: 'Av. Amazonas y Naciones Unidas, Edif. Boxing Norte',
        telefono: '0991234567',
        email: 'norte@boxcontrol.com',
        estado: 'ACTIVA'
      }
    });

    const [sucSur] = await Sucursal.findOrCreate({
      where: { nombre: 'Sucursal Sur - Boxing Club' },
      defaults: {
        direccion: 'Av. Maldonado y Moraspungo, CC El Recreo',
        telefono: '0987654321',
        email: 'sur@boxcontrol.com',
        estado: 'ACTIVA'
      }
    });
    console.log('✓ Sucursales creadas/verificadas.');

    // 3. Usuarios de Prueba
    const passwordAdmin = await bcrypt.hash('Admin123*', 10);
    const passwordRecep = await bcrypt.hash('Recep123*', 10);

    const [userAdmin] = await Usuario.findOrCreate({
      where: { email: 'admin@boxcontrol.com' },
      defaults: {
        nombre: 'Administrador',
        apellido: 'General',
        email: 'admin@boxcontrol.com',
        password: passwordAdmin,
        telefono: '0999999999',
        rolId: rolAdmin.id,
        sucursalId: sucNorte.id,
        estado: 'ACTIVO'
      }
    });
    userAdmin.password = passwordAdmin;
    await userAdmin.save();

    const [userRecepNorte] = await Usuario.findOrCreate({
      where: { email: 'recepcion.norte@boxcontrol.com' },
      defaults: {
        nombre: 'Carlos',
        apellido: 'Mendoza',
        email: 'recepcion.norte@boxcontrol.com',
        password: passwordRecep,
        telefono: '0988888888',
        rolId: rolRecep.id,
        sucursalId: sucNorte.id,
        estado: 'ACTIVO'
      }
    });
    userRecepNorte.password = passwordRecep;
    await userRecepNorte.save();

    const [userRecepSur] = await Usuario.findOrCreate({
      where: { email: 'recepcion.sur@boxcontrol.com' },
      defaults: {
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'recepcion.sur@boxcontrol.com',
        password: passwordRecep,
        telefono: '0977777777',
        rolId: rolRecep.id,
        sucursalId: sucSur.id,
        estado: 'ACTIVO'
      }
    });
    userRecepSur.password = passwordRecep;
    await userRecepSur.save();
    console.log('✓ Usuarios creados/verificados:');
    console.log('   - Admin: admin@boxcontrol.com / Admin123*');
    console.log('   - Recepcionista Norte: recepcion.norte@boxcontrol.com / Recep123*');
    console.log('   - Recepcionista Sur: recepcion.sur@boxcontrol.com / Recep123*');

    // 4. Tipos de Membresía (RF-W03)
    await TipoMembresia.findOrCreate({
      where: { nombre: 'Plan Mensual Boxeo Full' },
      defaults: {
        descripcion: 'Acceso ilimitado a entrenamientos de boxeo de lunes a sábado.',
        precio: 45.00,
        duracionDias: 30,
        estado: 'ACTIVA'
      }
    });

    await TipoMembresia.findOrCreate({
      where: { nombre: 'Plan Trimestral Boxeo Pro' },
      defaults: {
        descripcion: 'Acceso por 3 meses con descuento y asesoría técnica de combate.',
        precio: 120.00,
        duracionDias: 90,
        estado: 'ACTIVA'
      }
    });

    await TipoMembresia.findOrCreate({
      where: { nombre: 'Pase 10 Clases Sueltas' },
      defaults: {
        descripcion: 'Bono de 10 clases canjeables en 45 días en cualquiera de las 2 sedes.',
        precio: 35.00,
        duracionDias: 45,
        estado: 'ACTIVA'
      }
    });
    console.log('✓ Tipos de membresía creados.');

    console.log('\n--- Seed completado con éxito! ---');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
}

seedDatabase();
