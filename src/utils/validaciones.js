// Funciones de validación
// Aquí guardamos funciones para validar datos del usuario

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarContraseña = (contraseña) => {
  // Mínimo 8 caracteres
  return contraseña.length >= 8;
};

export const generarCodigoVerificacion = () => {
  // Generar un código aleatorio de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();
};
