// Fuente única del secreto JWT.
// Se lee del entorno para poder rotarlo sin tocar el código.
// ⚠️ En producción configura JWT_SECRET con un valor fuerte y desconocido.
export const TOKEN_SECRET = process.env.JWT_SECRET || "token_secret";