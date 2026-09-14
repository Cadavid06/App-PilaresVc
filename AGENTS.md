# Instrucciones del proyecto

## Documentación de cambios (obligatorio)

- **Siempre** documentar cada cambio realizado en el código (nuevas features, fixes, refactors, configuraciones) en `CHANGELOG.md` en la raíz del proyecto.
- El registro debe incluir: fecha, reglas de negocio tocadas (si aplica), archivos creados, archivos modificados, acciones manuales que deba hacer el usuario (p. ej. variables de entorno en Render) y verificaciones realizadas.
- Formato: tabla de archivos creados/modificados, y secciones por bloque de trabajo.

## Contexto del proyecto

App web de gestión de pagos de membresías de un club de voleibol ("Pilares Voleibol Club").

- **Backend**: `backend/` — Express 5 + Sequelize 6 + PostgreSQL (Neon serverless). Auth JWT + cookies httpOnly. Desplegado en Render (plan free: el server duerme con inactividad → la facturación es "lazy", ver `backend/src/services/billing.service.js`).
- **Frontend**: `frontend/` — React 19 + Vite + Tailwind CSS 4, axios, react-router (HashRouter).
- **Raíz**: `main.js` es un shell de Electron (legado, no es el deploy principal).
- **Tablas BD**: `users` (admin/entrenador), `memberships`, `payments`, `settings`.

## Reglas de negocio vigentes (aprobadas)

1. Estados: **Activa** (deuda `<= 0`), **Pendiente** (deuda `<= mensualidad`), **Expirada** (deuda `> mensualidad`).
2. **Cuota de reincorporación** automática al reactivar un expirado con 6+ mensualidades de deuda.
3. Valores económicos editables (mensualidad, inscripción, reincorporación) en tabla `settings`; solo admin.
4. Condonación de meses (por inasistencia) manual por el admin.
5. Roles: **admin** (todo), **entrenador** (ver/pagar/condonar, no crear usuarios ni eliminar).

Para más detalle ver `CHANGELOG.md`.