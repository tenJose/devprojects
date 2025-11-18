// Funciones para validar datos

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarContraseña = (password: string): boolean => {
  // Mínimo 8 caracteres
  return password.length >= 8;
};

export const validarNombre = (nombre: string): boolean => {
  return nombre.length >= 2 && nombre.length <= 50;
};

export const validarFechaNacimiento = (fecha: string): boolean => {
  const date = new Date(fecha);
  const hoy = new Date();
  const edad = hoy.getFullYear() - date.getFullYear();
  return edad >= 18; // Mayor de edad
};

export const validarCodigoVerificacion = (codigo: string): boolean => {
  return /^\d{6}$/.test(codigo);
};
