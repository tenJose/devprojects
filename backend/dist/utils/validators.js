"use strict";
// Funciones para validar datos
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCodigoVerificacion = exports.validarFechaNacimiento = exports.validarNombre = exports.validarContraseña = exports.validarEmail = void 0;
const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
exports.validarEmail = validarEmail;
const validarContraseña = (password) => {
    // Mínimo 8 caracteres
    return password.length >= 8;
};
exports.validarContraseña = validarContraseña;
const validarNombre = (nombre) => {
    return nombre.length >= 2 && nombre.length <= 50;
};
exports.validarNombre = validarNombre;
const validarFechaNacimiento = (fecha) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const edad = hoy.getFullYear() - date.getFullYear();
    return edad >= 18; // Mayor de edad
};
exports.validarFechaNacimiento = validarFechaNacimiento;
const validarCodigoVerificacion = (codigo) => {
    return /^\d{6}$/.test(codigo);
};
exports.validarCodigoVerificacion = validarCodigoVerificacion;
//# sourceMappingURL=validators.js.map