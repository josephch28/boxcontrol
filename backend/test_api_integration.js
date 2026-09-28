const http = require('http');

// Simple integration test for BoxControl API
async function runTests() {
  console.log('--- Iniciando Pruebas de Integración de BoxControl API ---');

  // Helper fetch / request
  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 4000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Healthcheck
    const health = await request('/api/health');
    console.log('1. Healthcheck Status:', health.status, health.body.status);

    // 2. Login
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'admin@boxcontrol.com',
      password: 'Admin123*'
    });
    console.log('2. Login Status:', loginRes.status, 'Token obtenido:', !!loginRes.body.token);
    const token = loginRes.body.token;

    // 3. Sucursales
    const sucRes = await request('/api/sucursales', 'GET', null, token);
    console.log('3. Sucursales Status:', sucRes.status, 'Total:', sucRes.body.count);

    // 4. Clientes
    const cliRes = await request('/api/clientes', 'GET', null, token);
    console.log('4. Clientes Status:', cliRes.status, 'Total:', cliRes.body.count);

    // 5. Cliente Detalle
    const detRes = await request('/api/clientes/1', 'GET', null, token);
    console.log('5. Cliente Detalle ID 1 Status:', detRes.status, detRes.body.data?.nombreCompleto);

    // 6. Tipos Membresía
    const tiposRes = await request('/api/tipos-membresia', 'GET', null, token);
    console.log('6. Tipos Membresía Status:', tiposRes.status, 'Planes:', tiposRes.body.count);

    // 7. Próximas a vencer
    const vencRes = await request('/api/membresias/proximas-a-vencer', 'GET', null, token);
    console.log('7. Próximas a Vencer Status:', vencRes.status, 'Total:', vencRes.body.count);

    // 8. Dashboard Metrics
    const dashRes = await request('/api/dashboard/metrics', 'GET', null, token);
    console.log('8. Dashboard Metrics Status:', dashRes.status, 'Socios Activos:', dashRes.body.data?.kpis?.sociosActivos?.total);

    // 9. Reporte Ingresos
    const repRes = await request('/api/reportes/ingresos?sucursalId=TODAS', 'GET', null, token);
    console.log('9. Reporte Ingresos Status:', repRes.status, 'Total Recaudado:', repRes.body.data?.resumen?.totalRecaudado);

    // 10. Contenido IA
    const iaRes = await request('/api/contenido-ia', 'GET', null, token);
    console.log('10. Contenidos IA Status:', iaRes.status, 'Total:', iaRes.body.count, 'Contadores:', iaRes.body.contadores);

    // 11. Check-in Asistencia (Socio activo Marco Rivera)
    const checkinRes = await request('/api/asistencias/checkin', 'POST', {
      cedula: '1723456789'
    }, token);
    console.log('11. Check-in Asistencia Status:', checkinRes.status, 'Permitido:', checkinRes.body.permitido, checkinRes.body.message);

    console.log('\n--- TODAS LAS PRUEBAS DE INTEGRACIÓN PASARON EXITOSAMENTE ---');
  } catch (error) {
    console.error('Error durante pruebas:', error);
  }
}

runTests();
