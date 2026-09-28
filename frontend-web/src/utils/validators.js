/**
 * Validadores y Sanitizadores para BoxControl
 * Validación en tiempo real y reglas de negocio
 */

// 1. Validación de Cédula Ecuatoriana (Algoritmo Módulo 10)
export function validarCedula(cedula) {
  if (!cedula) {
    return { isValid: false, error: 'La cédula es obligatoria.' };
  }

  const clean = cedula.toString().trim();

  // Debe tener exactamente 10 dígitos numéricos
  if (!/^\d{10}$/.test(clean)) {
    return { isValid: false, error: 'La cédula debe contener exactamente 10 dígitos numéricos.' };
  }

  // Código de provincia (dos primeros dígitos): 01 a 24, o 30
  const provincia = parseInt(clean.substring(0, 2), 10);
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
    return { isValid: false, error: 'Código de provincia no válido (primeros 2 dígitos).' };
  }

  // Tercer dígito para personas naturales: 0 a 5
  const tercerDigito = parseInt(clean.charAt(2), 10);
  if (tercerDigito < 0 || tercerDigito > 5) {
    return { isValid: false, error: 'Tercer dígito inválido para persona natural (debe ser de 0 a 5).' };
  }

  // Algoritmo Módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(clean.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const residuo = suma % 10;
  const digitoVerificadorCalculado = residuo === 0 ? 0 : 10 - residuo;
  const digitoVerificadorReal = parseInt(clean.charAt(9), 10);

  if (digitoVerificadorCalculado !== digitoVerificadorReal) {
    return { isValid: false, error: 'Dígito verificador inválido. Cédula no existe en el Registro Civil.' };
  }

  return { isValid: true, error: '' };
}

// 2. Validación de Nombres y Apellidos
export function validarNombreOApellido(valor, nombreCampo = 'Nombre') {
  if (!valor || !valor.trim()) {
    return { isValid: false, error: `${nombreCampo} es obligatorio.` };
  }

  const clean = valor.trim();

  if (clean.length < 2) {
    return { isValid: false, error: `${nombreCampo} debe tener al menos 2 caracteres.` };
  }

  if (clean.length > 50) {
    return { isValid: false, error: `${nombreCampo} no puede superar los 50 caracteres.` };
  }

  // Solo letras, tildes, diéresis, espacios y guiones simples
  const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!regexLetras.test(clean)) {
    return { isValid: false, error: `${nombreCampo} solo puede contener letras y espacios (sin números ni símbolos).` };
  }

  return { isValid: true, error: '' };
}

// 3. Validación de Correo Electrónico
export function validarEmail(email) {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'El correo electrónico es obligatorio.' };
  }

  const clean = email.trim().toLowerCase();

  if (clean.length > 100) {
    return { isValid: false, error: 'El correo electrónico es demasiado extenso.' };
  }

  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexEmail.test(clean)) {
    return { isValid: false, error: 'Formato de correo inválido (ejemplo: socio@mail.com).' };
  }

  return { isValid: true, error: '' };
}

// 4. Validación de Teléfono Celular Ecuatoriano
export function validarTelefono(telefono) {
  if (!telefono || !telefono.trim()) {
    return { isValid: false, error: 'El teléfono es obligatorio.' };
  }

  const clean = telefono.replace(/[\s-]/g, '');

  // Formato local 09XXXXXXXX (10 dígitos) o convencional 02/03/04/07 (9 dígitos)
  const regexTelefono = /^(09\d{8}|0[2-7]\d{7}|\+5939\d{8})$/;
  if (!regexTelefono.test(clean)) {
    return {
      isValid: false,
      error: 'Número inválido. Use formato ecuatoriano (ej: 0991234567 o 022345678).',
    };
  }

  return { isValid: true, error: '' };
}

// 5. Validación de Fecha de Nacimiento (Rango de edad razonable: 8 a 90 años)
export function validarFechaNacimiento(fechaStr) {
  if (!fechaStr) {
    return { isValid: true, error: '' }; // Opcional
  }

  const fecha = new Date(fechaStr + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (isNaN(fecha.getTime())) {
    return { isValid: false, error: 'Fecha de nacimiento no válida.' };
  }

  if (fecha >= hoy) {
    return { isValid: false, error: 'La fecha de nacimiento no puede ser hoy ni estar en el futuro.' };
  }

  // Cálculo de edad
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mesDiff = hoy.getMonth() - fecha.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }

  if (edad < 8) {
    return { isValid: false, error: `La edad mínima permitida en el club de boxeo es de 8 años (edad calculada: ${edad}).` };
  }

  if (edad > 90) {
    return { isValid: false, error: 'Por favor verifique el año de nacimiento (edad calculada superior a 90 años).' };
  }

  return { isValid: true, error: '', edad };
}

// 6. Validación de Fecha de Inicio de Membresía
export function validarFechaInicioMembresia(fechaStr) {
  if (!fechaStr) {
    return { isValid: false, error: 'La fecha de inicio es obligatoria.' };
  }

  const fecha = new Date(fechaStr + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (isNaN(fecha.getTime())) {
    return { isValid: false, error: 'Fecha de inicio inválida.' };
  }

  const limitePasado = new Date(hoy);
  limitePasado.setDate(limitePasado.getDate() - 30); // Máximo 30 días atrás

  const limiteFuturo = new Date(hoy);
  limiteFuturo.setDate(limiteFuturo.getDate() + 90); // Máximo 90 días adelante

  if (fecha < limitePasado) {
    return { isValid: false, error: 'La fecha no puede tener más de 30 días de retroactividad.' };
  }

  if (fecha > limiteFuturo) {
    return { isValid: false, error: 'No se pueden registrar membresías con más de 90 días de anticipación.' };
  }

  return { isValid: true, error: '' };
}

// 7. Validación de Precios y Montos (Admite firmas flexibles)
export function validarMonto(monto, arg2 = 1, arg3 = 2500, arg4 = 'El monto') {
  let min = 1;
  let max = 2500;
  let nombreCampo = 'El monto';

  if (typeof arg2 === 'string') {
    nombreCampo = arg2;
    if (typeof arg3 === 'number') min = arg3;
    if (typeof arg4 === 'number') max = arg4;
  } else {
    if (typeof arg2 === 'number') min = arg2;
    if (typeof arg3 === 'number') max = arg3;
    if (typeof arg4 === 'string') nombreCampo = arg4;
  }

  if (monto === undefined || monto === null || monto === '') {
    return { isValid: false, error: `${nombreCampo} es obligatorio.` };
  }

  const num = Number(monto);

  if (isNaN(num)) {
    return { isValid: false, error: `${nombreCampo} debe ser un valor numérico.` };
  }

  if (num < min) {
    return { isValid: false, error: `${nombreCampo} mínimo es de $${min}.00 USD.` };
  }

  if (num > max) {
    return { isValid: false, error: `${nombreCampo} no puede exceder $${max}.00 USD.` };
  }

  return { isValid: true, error: '' };
}

// 8. Validación de Duración en Días
export function validarDuracionDias(dias, min = 1, max = 365) {
  if (!dias) {
    return { isValid: false, error: 'La duración en días es obligatoria.' };
  }

  const num = parseInt(dias, 10);

  if (isNaN(num) || !Number.isInteger(Number(dias))) {
    return { isValid: false, error: 'La duración debe ser un número entero de días.' };
  }

  if (num < min || num > max) {
    return { isValid: false, error: `La duración debe estar entre ${min} y ${max} días.` };
  }

  return { isValid: true, error: '' };
}

// 9. Validación de Texto Genérico (Admite firmas flexibles)
export function validarTexto(texto, arg2 = 3, arg3 = 200, arg4 = 'Campo') {
  let min = 3;
  let max = 200;
  let nombreCampo = 'Campo';

  if (typeof arg2 === 'string') {
    nombreCampo = arg2;
    if (typeof arg3 === 'number') min = arg3;
    if (typeof arg4 === 'number') max = arg4;
  } else {
    if (typeof arg2 === 'number') min = arg2;
    if (typeof arg3 === 'number') max = arg3;
    if (typeof arg4 === 'string') nombreCampo = arg4;
  }

  if (!texto || !texto.trim()) {
    return { isValid: false, error: `${nombreCampo} es obligatorio.` };
  }

  const clean = texto.trim();

  if (clean.length < min) {
    return { isValid: false, error: `${nombreCampo} debe tener al menos ${min} caracteres.` };
  }

  if (clean.length > max) {
    return { isValid: false, error: `${nombreCampo} no puede exceder ${max} caracteres.` };
  }

  // Prevenir inyección de scripts
  if (/<script|eval\(|javascript:/i.test(clean)) {
    return { isValid: false, error: 'Texto con caracteres no permitidos.' };
  }

  return { isValid: true, error: '' };
}

// 10. Validación de Rango de Fechas
export function validarRangoFechas(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return null;
  const dInicio = new Date(fechaInicio + 'T00:00:00');
  const dFin = new Date(fechaFin + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  if (isNaN(dInicio.getTime()) || isNaN(dFin.getTime())) {
    return 'Fechas no válidas.';
  }

  if (dInicio > dFin) {
    return 'La fecha de inicio no puede ser posterior a la fecha final.';
  }

  if (dFin > hoy) {
    return 'La fecha de fin no puede ser futura.';
  }

  // Máximo 1 año de rango
  const diffDays = Math.ceil((dFin - dInicio) / (1000 * 60 * 60 * 24));
  if (diffDays > 366) {
    return 'El rango del reporte no puede exceder 366 días (1 año).';
  }

  return null;
}

// 11. Handlers de Teclado (Bloqueo en tiempo real)
export const handleKeyDownSoloNumeros = (e) => {
  if (
    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) ||
    (e.ctrlKey || e.metaKey)
  ) {
    return;
  }
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const handleKeyDownDecimal = (e, valorActual = '') => {
  if (
    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) ||
    (e.ctrlKey || e.metaKey)
  ) {
    return;
  }

  if (e.key === '.') {
    if (valorActual.includes('.')) {
      e.preventDefault();
    }
    return;
  }

  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const handleKeyDownSoloLetras = (e) => {
  if (
    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', ' '].includes(e.key) ||
    (e.ctrlKey || e.metaKey)
  ) {
    return;
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'-]$/.test(e.key)) {
    e.preventDefault();
  }
};
