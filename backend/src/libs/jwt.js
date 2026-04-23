import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// ✅ FIX #11: Se usa TOKEN_SECRET desde config.js (misma fuente que validateToken.js)
// Antes: jwt.js firmaba con TOKEN_SECRET pero validateToken verificaba con
// process.env.JWT_SECRET directamente — si diferían, todos los tokens eran inválidos.
export function createdAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}
