// Utilidades de categorías por edad para voleibol colombiano.
// La categoría se calcula en tiempo real a partir de la fecha de nacimiento
// y la fecha actual. No se almacena en la BD.

/**
 * Calcula la edad exacta en años cumplidos.
 */
export function calculateAge(birthdate) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Mapea la edad a la categoría de voleibol.
 *
 * Reglas (temporada 2026, mismo esquema para hombres y mujeres):
 *   <= 12  → Mini
 *   13-14  → Sub-13
 *   15-16  → Sub-15
 *   17-18  → Sub-17
 *   19-20  → Sub-19
 *   21-22  → Sub-21
 *   >= 23  → Libre
 */
export function calculateCategory(birthdate) {
  const age = calculateAge(birthdate);
  if (age === null) return null;

  if (age <= 12) return "Mini";
  if (age <= 14) return "Sub-13";
  if (age <= 16) return "Sub-15";
  if (age <= 18) return "Sub-17";
  if (age <= 20) return "Sub-19";
  if (age <= 22) return "Sub-21";
  return "Libre";
}

/**
 * Verifica si un jugador debe tener CC (mayor de 18).
 * Si tiene TI y ya cumplió 18, retorna 'CC'; de lo contrario, retorna null.
 */
export function resolveDocumentType(documentType, birthdate) {
  if (documentType !== "TI") return null;
  const age = calculateAge(birthdate);
  if (age !== null && age >= 18) return "CC";
  return null;
}

// Lista de todas las categorías (para filtros en el frontend).
export const CATEGORIES = [
  "Mini",
  "Sub-13",
  "Sub-15",
  "Sub-17",
  "Sub-19",
  "Sub-21",
  "Libre",
];

// Lista de géneros.
export const GENDERS = ["Masculino", "Femenino"];
