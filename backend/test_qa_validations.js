/**
 * Test Suite de Control de Calidad (QA) para Validadores y Reglas de Negocio
 * BoxControl - Gimnasio de Boxeo "Guante Dorado"
 */

// Importación directa de la lógica de validación para testeo automatizado de unidad y estrés
function validarCedula(cedula) {
  if (!cedula) return { isValid: false, error: 'La cédula es obligatoria.' };
  const clean = cedula.toString().trim();
  if (!/^\d{10}$/.test(clean)) return { isValid: false, error: 'La cédula debe contener exactamente 10 dígitos numéricos.' };
  const provincia = parseInt(clean.substring(0, 2), 10);
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return { isValid: false, error: 'Código de provincia no válido (primeros 2 dígitos).' };
  const tercerDigito = parseInt(clean.charAt(2), 10);
  if (tercerDigito < 0 || tercerDigito > 5) return { isValid: false, error: 'Tercer dígito inválido para persona natural (debe ser de 0 a 5).' };
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(clean.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }
  const residuo = suma % 10;
  const digitoVerificadorCalculado = residuo === 0 ? 0 : 10 - residuo;
  const digitoVerificadorReal = parseInt(clean.charAt(9), 10);
  if (digitoVerificadorCalculado !== digitoVerificadorReal) return { isValid: false, error: 'Dígito verificador inválido.' };
  return { isValid: true, error: '' };
}

function validarNombreOApellido(valor, nombreCampo = 'Nombre') {
  if (!valor || !valor.trim()) return { isValid: false, error: `${nombreCampo} es obligatorio.` };
  const clean = valor.trim();
  if (clean.length < 2) return { isValid: false, error: `${nombreCampo} debe tener al menos 2 caracteres.` };
  if (clean.length > 50) return { isValid: false, error: `${nombreCampo} no puede superar los 50 caracteres.` };
  const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!regexLetras.test(clean)) return { isValid: false, error: `${nombreCampo} solo puede contener letras y espacios.` };
  return { isValid: true, error: '' };
}

function validarEmail(email) {
  if (!email || !email.trim()) return { isValid: false, error: 'El correo electrónico es obligatorio.' };
  const clean = email.trim().toLowerCase();
  if (clean.length > 100) return { isValid: false, error: 'El correo electrónico es demasiado extenso.' };
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexEmail.test(clean)) return { isValid: false, error: 'Formato de correo inválido.' };
  return { isValid: true, error: '' };
}

function validarTelefono(telefono) {
  if (!telefono || !telefono.trim()) return { isValid: false, error: 'El teléfono es obligatorio.' };
  const clean = telefono.replace(/[\s-]/g, '');
  const regexTelefono = /^(09\d{8}|0[2-7]\d{7}|\+5939\d{8})$/;
  if (!regexTelefono.test(clean)) return { isValid: false, error: 'Número inválido.' };
  return { isValid: true, error: '' };
}

function validarFechaNacimiento(fechaStr) {
  if (!fechaStr) return { isValid: true, error: '' };
  const fecha = new Date(fechaStr + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(fecha.getTime())) return { isValid: false, error: 'Fecha no válida.' };
  if (fecha >= hoy) return { isValid: false, error: 'No puede ser hoy ni futura.' };
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mesDiff = hoy.getMonth() - fecha.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fecha.getDate())) edad--;
  if (edad < 8) return { isValid: false, error: `Edad mínima: 8 años (calculada: ${edad}).` };
  if (edad > 90) return { isValid: false, error: 'Edad superior a 90 años.' };
  return { isValid: true, error: '', edad };
}

function validarFechaInicioMembresia(fechaStr) {
  if (!fechaStr) return { isValid: false, error: 'Obligatoria.' };
  const fecha = new Date(fechaStr + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(fecha.getTime())) return { isValid: false, error: 'Inválida.' };
  const limitePasado = new Date(hoy);
  limitePasado.setDate(limitePasado.getDate() - 30);
  const limiteFuturo = new Date(hoy);
  limiteFuturo.setDate(limiteFuturo.getDate() + 90);
  if (fecha < limitePasado) return { isValid: false, error: 'Retroactividad máx. 30 días.' };
  if (fecha > limiteFuturo) return { isValid: false, error: 'Anticipación máx. 90 días.' };
  return { isValid: true, error: '' };
}

function validarMonto(monto, min = 1, max = 2500) {
  if (monto === undefined || monto === null || monto === '') return { isValid: false, error: 'Obligatorio.' };
  const num = Number(monto);
  if (isNaN(num)) return { isValid: false, error: 'Debe ser numérico.' };
  if (num < min) return { isValid: false, error: `Mínimo $${min}.` };
  if (num > max) return { isValid: false, error: `Máximo $${max}.` };
  return { isValid: true, error: '' };
}

function validarDuracionDias(dias, min = 1, max = 365) {
  if (!dias) return { isValid: false, error: 'Obligatorio.' };
  const num = parseInt(dias, 10);
  if (isNaN(num) || !Number.isInteger(Number(dias))) return { isValid: false, error: 'Entero requerido.' };
  if (num < min || num > max) return { isValid: false, error: `Entre ${min} y ${max} días.` };
  return { isValid: true, error: '' };
}

function validarTexto(texto, min = 3, max = 200, nombre = 'Campo') {
  if (!texto || !texto.trim()) return { isValid: false, error: `${nombre} es obligatorio.` };
  const clean = texto.trim();
  if (clean.length < min) return { isValid: false, error: `Mínimo ${min} chars.` };
  if (clean.length > max) return { isValid: false, error: `Máximo ${max} chars.` };
  if (/<script|eval\(|javascript:/i.test(clean)) return { isValid: false, error: 'Inyección detectada.' };
  return { isValid: true, error: '' };
}

function validarRangoFechas(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return null;
  const dInicio = new Date(fechaInicio + 'T00:00:00');
  const dFin = new Date(fechaFin + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  if (isNaN(dInicio.getTime()) || isNaN(dFin.getTime())) return 'Fechas no válidas.';
  if (dInicio > dFin) return 'La fecha de inicio no puede ser posterior a la fecha final.';
  if (dFin > hoy) return 'La fecha de fin no puede ser futura.';
  const diffDays = Math.ceil((dFin - dInicio) / (1000 * 60 * 60 * 24));
  if (diffDays > 366) return 'El rango no puede exceder 366 días.';
  return null;
}

// Batería de Pruebas
console.log('=== BATERÍA DE PRUEBAS DE CALIDAD UI/UX Y FORMULARIOS (BOXCONTROL) ===\n');
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    testsFailed++;
  }
}

// 1. Cédulas Ecuatorianas
assert(validarCedula('1723456784').isValid === true, 'Cédula válida M10 (1723456784)');
assert(validarCedula('1728374651').isValid === true, 'Cédula válida M10 (1728374651)');
assert(validarCedula('1723456780').isValid === false, 'Cédula inválida M10 rechazada (1723456780)');
assert(validarCedula('9923456789').isValid === false, 'Provincia 99 rechazada (> 24 y != 30)');
assert(validarCedula('1793456789').isValid === false, 'Tercer dígito 9 rechazado para persona natural');
assert(validarCedula('172345').isValid === false, 'Cédula corta rechazada (< 10 dígitos)');
assert(validarCedula('172345678901').isValid === false, 'Cédula larga rechazada (> 10 dígitos)');
assert(validarCedula('17234A6789').isValid === false, 'Cédula con letras rechazada');

// 2. Nombres y Apellidos
assert(validarNombreOApellido('Carlos').isValid === true, 'Nombre simple válido');
assert(validarNombreOApellido('María José').isValid === true, 'Nombre con tildes y espacios válido');
assert(validarNombreOApellido('Carlos123').isValid === false, 'Nombre con números rechazado');
assert(validarNombreOApellido('Juan<script>').isValid === false, 'Nombre con símbolos/script rechazado');
assert(validarNombreOApellido('A').isValid === false, 'Nombre menor a 2 letras rechazado');

// 3. Correo Electrónico
assert(validarEmail('admin@boxcontrol.com').isValid === true, 'Email corporativo válido');
assert(validarEmail('usuario.prueba+1@gmail.ec').isValid === true, 'Email con subdominio válido');
assert(validarEmail('admin@boxcontrol').isValid === false, 'Email sin TLD rechazado');
assert(validarEmail('adminboxcontrol.com').isValid === false, 'Email sin @ rechazado');

// 4. Teléfono
assert(validarTelefono('0991234567').isValid === true, 'Celular ecuatoriano 10 dígitos válido');
assert(validarTelefono('022345678').isValid === true, 'Convencional Pichincha 9 dígitos válido');
assert(validarTelefono('1234567').isValid === false, 'Teléfono muy corto rechazado');
assert(validarTelefono('099123456789').isValid === false, 'Teléfono muy largo rechazado');

// 5. Fechas de Nacimiento
assert(validarFechaNacimiento('2000-05-15').isValid === true, 'Edad 25 años válida');
assert(validarFechaNacimiento('2025-01-01').isValid === false, 'Bebé de 1 año rechazado (< 8 años)');
assert(validarFechaNacimiento('1910-01-01').isValid === false, 'Edad extrema 116 años rechazada (> 90 años)');
assert(validarFechaNacimiento('2028-10-10').isValid === false, 'Fecha futura rechazada');

// 6. Fechas de Membresía
const hoy = new Date().toISOString().split('T')[0];
assert(validarFechaInicioMembresia(hoy).isValid === true, 'Membresía hoy válida');
assert(validarFechaInicioMembresia('2020-01-01').isValid === false, 'Membresía hace 6 años rechazada (> 30d pasado)');
assert(validarFechaInicioMembresia('2028-01-01').isValid === false, 'Membresía en 2028 rechazada (> 90d futuro)');

// 7. Montos y Precios
assert(validarMonto(35).isValid === true, 'Precio $35 válido');
assert(validarMonto(0).isValid === false, 'Precio $0 rechazado');
assert(validarMonto(-15).isValid === false, 'Precio negativo rechazado');
assert(validarMonto(5000).isValid === false, 'Precio superior a $2500 rechazado');

// 8. Duraciones
assert(validarDuracionDias(30).isValid === true, 'Plan 30 días válido');
assert(validarDuracionDias(365).isValid === true, 'Plan 365 días válido');
assert(validarDuracionDias(0).isValid === false, 'Plan 0 días rechazado');
assert(validarDuracionDias(400).isValid === false, 'Plan 400 días rechazado');

// 9. Sanitización de Textos
assert(validarTexto('Sede Cumbayá Valles').isValid === true, 'Dirección normal válida');
assert(validarTexto('<script>alert("xss")</script>').isValid === false, 'Inyección XSS bloqueada');

// 10. Rango de Fechas
assert(validarRangoFechas('2026-09-01', '2026-09-27') === null, 'Rango de fechas septiembre 2026 válido');
assert(validarRangoFechas('2026-09-27', '2026-09-01') !== null, 'Rango invertido (inicio > fin) rechazado');
assert(validarRangoFechas('2026-09-01', '2027-10-01') !== null, 'Rango > 1 año rechazado');

console.log(`\n======================================================`);
console.log(`TOTAL PRUEBAS: ${testsPassed + testsFailed} | EXITOSAS: ${testsPassed} | FALLIDAS: ${testsFailed}`);
console.log(`======================================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('¡TODAS LAS REGLAS DE VALIDACIÓN PASARON EXITOSAMENTE!');
  process.exit(0);
}
