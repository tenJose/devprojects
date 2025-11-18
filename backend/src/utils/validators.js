"use strict";
// Funciones para validar datos
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCodigoVerificacion = exports.validarFechaNacimiento = exports.validarNombre = exports.validarContraseña = exports.validarEmail = void 0;
var validarEmail = function (email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
exports.validarEmail = validarEmail;
var validarContraseña = function (password) {
    // Mínimo 8 caracteres
    return password.length >= 8;
};
exports.validarContraseña = validarContraseña;
var validarNombre = function (nombre) {
    return nombre.length >= 2 && nombre.length <= 50;
};
exports.validarNombre = validarNombre;
var validarFechaNacimiento = function (fecha) {
    var date = new Date(fecha);
    var hoy = new Date();
    var edad = hoy.getFullYear() - date.getFullYear();
    return edad >= 18; // Mayor de edad
};
exports.validarFechaNacimiento = validarFechaNacimiento;
var validarCodigoVerificacion = function (codigo) {
    return /^\d{6}$/.test(codigo);
};
exports.validarCodigoVerificacion = validarCodigoVerificacion;
