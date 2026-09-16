# CHANGELOG

Todas las modificaciones relevantes del proyecto quedan documentadas aquí, agrupadas por bloque/versión.

---
## Bloque 12 — Correcciones de QA Final en Producción (16/09/2026)

### Problemas resueltos

- **HTTP 500 al Registrar Pago:** El modal de pagos (`PaymentsModals`) estaba enviando el monto como un número primitivo en lugar de un objeto. Esto causaba que el backend recibiera `undefined` y el servidor fallara (`HTTP 500`). Se envolvió el monto en un objeto `{ amount }` dentro del contexto `MembershipContext` para solucionarlo.
- **Valores negativos (Jugador Antiguo):** Los campos "Deuda total" y "Abono inicial" permitían guardar valores negativos y corrompían el cálculo de deuda. Se añadió una validación estricta (`min: 0`) en React Hook Form.
- **Sanitización de caracteres especiales en tiempo real:** Los inputs de Nombre, Documento y Teléfono bloqueaban el guardado pero no borraban los caracteres inválidos (ej. `@@@`) visualmente de la pantalla. Se incorporó limpieza inmediata (`onInput`) por expresiones regulares.
- **Acciones truncadas en vista móvil:** En dispositivos móviles, a veces no se expandía la tabla al tocar una fila debido a problemas de propagación táctil. El botón del chevron móvil se configuró como el blanco exacto del toque para evitar fallas. Además, se añadió truncamiento CSS al nombre completo (evitando la anterior partición confusa de nombres).
- **Retroalimentación visual UX:** 
  - Se agregó estado de carga (`Guardando...`) en la página de Configuración al guardar valores económicos.
  - El botón "Ajustar Deuda" ahora muestra un `title` explicativo cuando se deshabilita porque el jugador no tiene meses condonables.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/context/MembershipContext.jsx` | Modificación de `addPayments` para encapsular la solicitud de red. |
| `frontend/src/pages/MembershipFormPage.jsx` | Agregadas validaciones estrictas y sanitización en vivo. |
| `frontend/src/components/MembershipsTable.jsx` | Mejoras de UX móvil y área táctil del desplegable. |
| `frontend/src/pages/SettingsPage.jsx` | Agregado estado de carga (`isSaving`) en el botón de guardar. |

---

## Bloque 11 — Fixes de QA en Producción (16/09/2026)

### Problemas resueltos

- **Configuración de Descuento en $0:** Se corrigió un bug lógico (`parsed <= 0`) en `settings.controllers.js` que impedía guardar un descuento por hermano de 0, manteniendo erróneamente el valor anterior.
- **Race Condition (HTTP 401):** El frontend (`MembershipContext`) intentaba cargar las configuraciones antes de comprobar si el usuario estaba logueado. Ahora consume `isAuthenticated` para hacer la petición de manera segura.
- **Sincronización de Modales:** Los modales de Pagos, Actualización, Condonación y Ajustes quedaban desactualizados después de ejecutar una acción porque conservaban un "snapshot" de la tabla. Ahora su estado es reactivo (buscan activamente la versión más reciente en el contexto).
- **Formatos y Mensajes en Modales:**
  - El modal de pagos ya no muestra un signo negativo antes del "Total pagado".
  - Se agregó manejo explícito de errores con estados locales, permitiendo al usuario ver de inmediato los mensajes de error del backend (HTTP 400).
  - El modal de "Ajustar Deuda" ahora desactiva el botón y oculta el input de condonación si el jugador solo debe el mes en curso (o $0), explicando visualmente que el mes actual no es condonable.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/controllers/settings.controllers.js` | Modificada validación en `parsePositiveFee` a `parsed < 0`. |
| `frontend/src/context/MembershipContext.jsx` | Agregada dependencia `isAuthenticated` para `loadSettings`. |
| `frontend/src/components/MembershipsTable.jsx` | Pase de estados derivados (`membership.find`) a los modales. Botón condonar deshabilitado dinámicamente. |
| `frontend/src/components/PaymentsModals.jsx` | Limpieza de signo negativo. Reseteo de form y mensajes locales de éxito/error. |
| `frontend/src/components/AttendanceModal.jsx` | Lógica de `maxAllowed > 0`. Mensaje visual para deudas no condonables. |

---

## Bloque 10 — Correcciones de QA y Usabilidad Móvil (16/09/2026)

### Correcciones implementadas

- **Ajustes de Cobro Automáticos**: Eliminada la opción manual "Descuento por hermano" de `AdjustmentsModal.jsx`, ya que este descuento se aplica automáticamente desde las configuraciones a los miembros de un mismo "Grupo familiar".
- **Validaciones Numéricas (Prevención de negativos)**: Se añadió `min="0"` y un bloqueo estricto por teclado (`onKeyDown`) en los campos "Deuda total" y "Abono inicial" de la página de registro, así como en todos los campos de tarifas de la página de Configuración (`SettingsPage.jsx`).
- **Validaciones de Texto (Símbolos inválidos)**: Expresiones regulares agregadas al formulario de registro (`MembershipFormPage.jsx`) para Nombre (solo letras y espacios), Documento (solo letras y números) y Teléfono (solo números y signo +).
- **Mejoras Móviles (Tabla Membresías)**: Se agregó un indicador visual (`ChevronDown`) al lado del nombre del jugador en la vista móvil para indicar que la fila es desplegable. También se mejoró la accesibilidad agregando `aria-label` y `title` a todos los botones de acción (`MembershipsTable.jsx`).
- **Responsividad de Usuarios**: La tabla de `UsersPage.jsx` ahora se adapta mejor a pantallas pequeñas sin ocultar las acciones, modificando el `min-width` y el comportamiento del `whitespace`.
- **Claridad de Filtros**: El contador en la página de Membresías ahora indica explícitamente "N jugadores filtrados en el registro".
- **Limpieza**: Se eliminaron scripts temporales innecesarios (`qa-introspect.mjs` y `frontend/tmpfixqa.mjs`).

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/components/AdjustmentsModal.jsx` | Se eliminó "Descuento por hermano" de las opciones manuales. |
| `frontend/src/pages/MembershipFormPage.jsx` | Validaciones regex y prevención de valores negativos. |
| `frontend/src/components/MembershipsTable.jsx` | Indicador chevron móvil y atributos ARIA en botones. |
| `frontend/src/pages/UsersPage.jsx` | Ajustes responsive (clases CSS) en la tabla. |
| `frontend/src/pages/SettingsPage.jsx` | Prevención de escritura de valores negativos. |
| `frontend/src/pages/MembershipsPage.jsx` | Texto aclaratorio en contador de filtros. |
| (Raíz) | Eliminados scripts temporales `.mjs`. |

---

## Bloque 1 — Facturación, estados y configuración (14/09/2026)

### Reglas de negocio definidas (aprobadas por el cliente)

1. **Estados de jugador** (reemplaza la lógica anterior que usaba "¿pagó algo?"):
   - **Activa**: deuda `<= 0` (pagó el mes actual, no debe).
   - **Pendiente**: deuda `<= una mensualidad` (solo debe el mes actual).
   - **Expirada**: deuda `> una mensualidad` (debe el mes actual + anteriores).
2. **Cuota de reincorporación**: se cobra automáticamente cuando un jugador **Expirado** con deuda equivalente a **6+ mensualidades** vuelve a ponerse al día (pago que deja su deuda `<= mensualidad`).
3. **Detección de "6 meses fuera"**: por deuda acumulada (6 o más mensualidades sin cobrar). No requiere marcación manual.
4. **Condonación**: el admin elige cuántos meses perdonar al reactivar/cobrar a un expirado (flujo "Ajustar deuda" existente).

### Solución al problema del cron en Render (plan free)

El server duerme por inactividad y `node-cron` no se ejecuta mientras está dormido. Se implementó **facturación "lazy"**: ya no se depende del cron.

- Al **leer** membresías (`GET /api/memberShip`, `GET /api/memberShip/:id`) o al **pagar** (`PUT /api/memberShip/:id/payments`), el sistema revisa `nextBillingDate`. Si está vencida, suma las mensualidades faltantes (hasta 60 meses de recuperación) y recalcula estado.
- El cron local (`0 0 1 * *`) se conserva como refuerzo, pero ahora usa el mismo servicio central.
- Nuevo endpoint **`POST /api/billing/run`** protegido con header `x-cron-secret` (variable `BILLING_CRON_SECRET`) para conectar cron-job.org / GitHub Actions y despertar el server justo el día 1. Sin auth requiere la variable configurada.

### Valor de la mensualidad editable desde la app

Los valores económicos ya **no están hardcodeados** en el código. Nueva tabla `settings` (fila única `id=1`):

| Campo | Default | Descripción |
|-------|---------|-------------|
| `monthlyFee` | 20000 | Mensualidad cobrada el día 1 de cada mes |
| `inscriptionFee` | 15000 | Inscripción de jugadores nuevos |
| `reactivationFee` | 20000 | Cuota de reincorporación (6+ meses fuera) |

- `GET /api/settings` y `PUT /api/settings` (requieren login).
- Frontend: nueva página **Configuración** (`/settings`), accesible desde el Navbar (desktop y móvil).
- Se eliminó el hardcode de $20.000 en `AttendanceModal.jsx` (usa los settings).

### Seguridad

- **`POST /api/register` ahora requiere sesión**: antes cualquier persona externa podía crear admins. (Cierre de vulnerabilidad.)
- **Secreto JWT unificado**: antes `config.js` y `validateToken.js` usaban fuentes distintas (`TOKEN_SECRET` vs `process.env.JWT_SECRET`). Ahora todos usan `process.env.JWT_SECRET` desde `config.js`.
- Se generaron `JWT_SECRET` y `BILLING_CRON_SECRET` nuevos en `backend/.env`.

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `backend/src/models/settings.models.js` | Modelo Sequelize de configuración económica |
| `backend/src/services/billing.service.js` | Centro de lógica: `getSettings`, `calcDeuda`, `statusFromDebt`, `applyBillingIfDue` (lazy), `runMonthlyBilling` |
| `backend/src/controllers/settings.controllers.js` | GET/PUT de configuración |
| `backend/src/routes/settings.routes.js` | Rutas de configuración (auth) |
| `backend/src/routes/billing.routes.js` | Trigger manual de facturación (secreto) |
| `frontend/src/api/settings.js` | Cliente axios de settings |
| `frontend/src/pages/SettingsPage.jsx` | Página de configuración |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/controllers/membership.controllers.js` | Usa settings; lazy billing en lecturas y pagos; estados corregidos; cuota de reincorporación automática |
| `backend/src/cron/membership.cron.js` | Reescrito para usar `runMonthlyBilling` del servicio |
| `backend/src/config.js` | `TOKEN_SECRET` desde `process.env.JWT_SECRET` (fuente única) |
| `backend/src/middlewares/validateToken.js` | Verifica con `TOKEN_SECRET` de config.js |
| `backend/src/routes/auth.routes.js` | `/register` protegido con `authRequired` |
| `backend/src/app.js` | Monta rutas de settings y billing |
| `backend/.env` | Nuevos `JWT_SECRET` y `BILLING_CRON_SECRET` |
| `frontend/src/context/MembershipContext.jsx` | Expone `settings` y `updateSettings` |
| `frontend/src/App.jsx` | Ruta `/settings` |
| `frontend/src/components/Navbar.jsx` | Link "Configuración" (desktop y móvil) |
| `frontend/src/components/AttendanceModal.jsx` | Quita $20.000 hardcodeado, usa `settings.monthlyFee` |

### Acciones requeridas en producción (Render)

1. Actualizar variables de entorno del servicio backend con los valores de `backend/.env`:
   - `JWT_SECRET` → valor fuerte nuevo (invalida sesiones viejas, es correcto).
   - `BILLING_CRON_SECRET` → valor para el trigger externo.
2. (Opcional) Crear job en cron-job.org: URL `https://<API>/api/billing/run`, header `x-cron-secret: <secreto>`, horario día 1 a las 00:05.
3. Verificar discrepancia de URLs preexistente: backend CORS apunta a `app-pilaresvc.onrender.com`, frontend consume `app-pilaresvc-9nhl.onrender.com/api`. Confirmar la correcta.

### Verificaciones realizadas

- `node --check` en todos los archivos JS modificados.
- Arranque del backend conectando a Neon (PostgreSQL conectado, tablas sincronizadas, tabla `settings` creada).
- Pruebas: `GET /api/settings`, `POST /api/register` y `POST /api/billing/run` devuelven **401** sin token/secreto.
- Build de producción del frontend (`npm run build`) exitoso.

### Pendiente (no incluido en este bloque)

- Discrepancia de URLs CORS/API entre servicios de Render.
- Roles (admin/profesor), categorías por edad + rama (femenino/masculino), filtros combinados y rediseño visual.
- Reglas de registro de jugador nuevo/antiguo refinadas con valores configurables (Bloque 3+).

---

## Bloque 3 — Identidad visual del frontend (14/09/2026)

### Cambios realizados

- Se renovó la identidad visual del frontend para alinearla con el logo del club: rojo, negro y blanco.
- Se mejoró la jerarquía visual del acceso y del panel de membresías.
- Se reforzaron navegación responsive, estados de foco accesibles, contraste y superficies tipo glass.

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| Ninguno | Se trabajó sobre la estructura y estilos existentes. |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/index.css` | Base visual, fondo, tipografía, scrollbar y foco accesible. |
| `frontend/src/components/Navbar.jsx` | Navegación sticky con identidad del club y mejor espaciado responsive. |
| `frontend/src/pages/LoginPage.jsx` | Rediseño de acceso con jerarquía de marca y superficies contrastadas. |
| `frontend/src/pages/MembershipsPage.jsx` | Encabezado de gestión y estructura semántica del contenido. |

### Acciones manuales

- Ninguna. No se agregaron dependencias ni variables de entorno.

### Verificaciones realizadas

- Se intentó ejecutar `npm run build` en `frontend`, pero el entorno no tenía instaladas las dependencias (`vite: command not found`).

---

## Bloque 4 — Correcciones responsive para uso móvil (14/09/2026)

### Cambios realizados

- Se eliminó el panel negro extendido del navbar en pantallas pequeñas y se mantuvo una superficie compacta para logo y menú.
- Se evitó el desbordamiento horizontal accidental de la aplicación.
- Se ajustaron formularios, filtros, tablas y acciones para pantallas estrechas.
- Las tablas conservan sus columnas mediante desplazamiento horizontal controlado, evitando romper la legibilidad.

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| Ninguno | Se conservaron las extensiones y tecnologías existentes. |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/components/Navbar.jsx` | Navbar compacto, sin fondo negro extendido, con separación segura para el área superior móvil. |
| `frontend/src/index.css` | Prevención de overflow horizontal global. |
| `frontend/src/pages/MembershipsPage.jsx` | Filtros con espaciado y apilamiento mobile-first. |
| `frontend/src/components/MembershipsTable.jsx` | Ancho mínimo controlado para permitir scroll horizontal usable en móvil. |
| `frontend/src/pages/UsersPage.jsx` | Tabla de usuarios protegida contra compresión y desbordamiento visual. |
| `frontend/src/pages/MembershipFormPage.jsx` | Contenedor, padding y botones adaptados a pantallas pequeñas. |

### Acciones manuales requeridas

- Ninguna.

### Verificaciones realizadas

- Revisión de las vistas principales y componentes responsive del frontend.
- Compilación del frontend pendiente de ejecutar tras estos cambios.

---

## Bloque 2 — Roles Admin/Entrenador (14/09/2026)

### Reglas de negocio definidas (aprobadas por el cliente)

| Rol | Permisos |
|-----|----------|
| **Admin** | Todo: crear usuarios (admin/entrenador), eliminar jugadores, cambiar valores económicos, ver, pagar, condonar deudas |
| **Entrenador** | Ver jugadores, registrar pagos, condonar meses. **NO** puede: crear usuarios, eliminar jugadores, cambiar valores de configuración |

### Backend

- **Modelo `Admin`**: nuevo campo `role` (ENUM: `admin`, `entrenador`), default `entrenador`.
- **Middleware `requireRole()`**: verifica que el usuario tenga el rol requerido para acceder a ciertas rutas.
- **Rutas protegidas por rol**:
  - `POST /api/register` → solo `admin` (crear nuevos usuarios)
  - `PUT /api/settings` → solo `admin` (cambiar valores económicos)
  - `DELETE /api/memberShip/:id` → solo `admin` (eliminar jugadores)
- **Controlador de registro**: acepta parámetro `role` en el body (solo admin puede elegir; default `entrenador`).
- **Login/VerifyToken**: ahora devuelven el `role` del usuario en la respuesta.

### Frontend

- **Navbar**: muestra el rol del usuario logueado (badge "Admin" o "Entrenador").
- **Navbar**: botones "Añadir admin" y "Configuración" solo visibles para admin (desktop y móvil).
- **MembershipsTable**: botón "Eliminar" solo visible para admin (próximo paso).

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `backend/src/middlewares/requireRole.js` | Middleware para verificar roles |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/models/admin.models.js` | Agregado campo `role` (enum: admin, entrenador) |
| `backend/src/controllers/auth.controllers.js` | Registro acepta `role`; login/verify devuelven `role` |
| `backend/src/routes/auth.routes.js` | `/register` protegido con `requireRole("admin")` |
| `backend/src/routes/settings.routes.js` | `PUT /settings` protegido con `requireRole("admin")` |
| `backend/src/routes/memberShip.routes.js` | `DELETE /memberShip/:id` protegido con `requireRole("admin")` |
| `frontend/src/components/Navbar.jsx` | Muestra rol; oculta botones según rol |

### Verificaciones realizadas

- `node --check` en todos los archivos backend modificados.
- Build de producción del frontend (`npm run build`) exitoso.
- Sequelize agregará la columna `role` automáticamente al siguiente arranque (no requiere migración manual).

### Pendiente

- Ocultar botón "Eliminar" en `MembershipsTable.jsx` para entrenadores.
- Página de registro: permitir elegir rol (solo visible para admin).

---

## Bloque 2c — Gestión de usuarios y protección de roles (14/09/2026)

### Funcionalidad

- **RegisterPage**: selector de rol (Admin/Entrenador) solo visible para admin.
- **UsersPage** (`/users`): tabla con todos los usuarios, mostrar email, rol y fecha de creación.
  - Cambiar rol de un usuario (toggle admin/entrenador).
  - Eliminar usuario con confirmación.
  - **Protección**: no se puede eliminar ni degradar al último admin.
  - **Protección**: no se puede cambiar tu propio rol.
  - **Protección**: no se puede eliminar tu propia cuenta.
- **MembershipsTable**: botón "Eliminar" oculto para entrenadores.
- **Navbar**: enlace "Usuarios" (solo admin) reemplaza "Añadir admin".
- **CORS**: `app.js` ahora usa `FRONTEND_URL` del entorno, soporta múltiples orígenes separados por coma (resuelve el problema de CORS al cambiar entre dev y producción).

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `backend/src/controllers/user.controllers.js` | CRUD de usuarios: listar, cambiar rol, eliminar (con protecciones) |
| `backend/src/routes/user.routes.js` | Rutas protegidas por admin |
| `frontend/src/api/users.js` | Cliente axios para gestión de usuarios |
| `frontend/src/pages/UsersPage.jsx` | Página de administración de usuarios |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/app.js` | CORS configurable por entorno, monta rutas de usuarios |
| `backend/src/schemas/auth.schemas.js` | Acepta campo `role` opcional en registro |
| `frontend/src/context/AuthContext.jsx` | `signUp` devuelve `true/false` |
| `frontend/src/App.jsx` | Ruta `/users` |
| `frontend/src/pages/RegisterPage.jsx` | Selector de rol, botón "Crear usuario" |
| `frontend/src/components/Navbar.jsx` | Enlace "Usuarios" reemplaza "Añadir admin" |
| `frontend/src/components/MembershipsTable.jsx` | Botón "Eliminar" solo visible para admin |

### Verificaciones realizadas

- `node --check` en todos los archivos backend modificados.
- Build de producción del frontend (`npm run build`) exitoso.

---

### Cambio

Renombrar la tabla `admins` a `users` para reflejar que ahora tiene dos roles (admin y entrenador), no solo admins.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/models/user.models.js` | **Renombrado** desde `admin.models.js`. `tableName: "users"`, exporta `User` |
| `backend/src/models/memberShip.models.js` | Importa `User` en vez de `Admin`; FK `adminId` → `userId` |
| `backend/src/controllers/auth.controllers.js` | Usa `User` en vez de `Admin` |
| `backend/src/controllers/settings.controllers.js` | `req.admin` → `req.user` |
| `backend/src/controllers/membership.controllers.js` | `req.admin` → `req.user` |
| `backend/src/middlewares/validateToken.js` | Usa `User` en vez de `Admin`; exporta `req.user` |
| `backend/src/middlewares/requireRole.js` | Verifica `req.user.role` |

### Acción requerida en BD (pgAdmin4 o consola)

```sql
-- 1. Crear tabla users y migrar datos de admins
CREATE TABLE users AS SELECT * FROM admins;

-- 2. Agregar restricciones a la nueva tabla
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'entrenador';

-- 3. Hacer tu usuario admin
UPDATE users SET role = 'admin' WHERE id = 1;

-- 4. Agregar FK en memberships (si la tabla ya tiene datos)
-- Opcional: si quieres que la FK apunte a la nueva tabla
ALTER TABLE memberships ADD COLUMN userId INTEGER REFERENCES users(id);
UPDATE memberships SET userId = (SELECT id FROM users LIMIT 1);

-- 5. Eliminar columna adminId vieja (opcional, después de migrar)
-- ALTER TABLE memberships DROP COLUMN adminId;

-- 6. Eliminar tabla admins vieja (opcional, después de migrar)
-- DROP TABLE admins;
```

### Verificaciones realizadas

- `node --check` en todos los archivos backend modificados.
- Build de producción del frontend (`npm run build`) exitoso.

---

## Bloque 3 — Categorías por edad, género y auto-actualización de documento (14/09/2026)

### Funcionalidad

- **Categoría virtual** calculada en tiempo real desde `birthdate` (no se almacena en BD):
  - <= 12 años → Mini
  - 13-14 → Sub-13
  - 15-16 → Sub-15
  - 17-18 → Sub-17
  - 19-20 → Sub-19
  - 21-22 → Sub-21
  - >= 23 → Libre
- **Campo `gender`** (Masculino/Femenino) en tabla `memberships`, editable en registro y actualización.
- **Auto-actualización TI → CC**: cuando un jugador con TI cumple 18 años, el sistema cambia automáticamente su documento a CC al leer sus datos.
- **Filtros combinados** en MembershipsPage: estado × género × categoría (se resetea paginación al cambiar filtro).
- **Columnas "Género" y "Categoría"** visibles en la tabla de membresías.

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `backend/src/utils/category.js` | Utilidades: `calculateAge`, `calculateCategory`, `resolveDocumentType`, listas `CATEGORIES` y `GENDERS` |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/models/memberShip.models.js` | Campo `gender` (ENUM: Masculino, Femenino) |
| `backend/src/controllers/membership.controllers.js` | Acepta `gender` en create/update; retorna `category` calculada; auto-actualiza TI→CC |
| `frontend/src/pages/MembershipFormPage.jsx` | Selector de género al registrar jugador |
| `frontend/src/components/UpdateModals.jsx` | Campo género en formulario de actualización |
| `frontend/src/components/MembershipsTable.jsx` | Columnas Género y Categoría; colSpan ajustado |
| `frontend/src/pages/MembershipsPage.jsx` | Filtros de género (select) y categoría (select) |

### Acción requerida en BD

```sql
-- Agregar columna gender a la tabla memberships
ALTER TABLE memberships ADD COLUMN "gender" VARCHAR(20) NOT NULL DEFAULT 'Masculino';
```

### Verificaciones realizadas

- `node --check` en todos los archivos backend modificados.
- Build de producción del frontend (`npm run build`) exitoso.

---

## Bloque 2d — Fix: crear usuario no sobreescribe sesión del admin (14/09/2026)

### Problema

Cuando un admin creaba un usuario (admin o entrenador), el endpoint `/register` generaba un token para el **nuevo usuario** y lo guardaba en la cookie, sobreescribiendo la sesión del admin. El admin perdía su sesión, no podía crear más usuarios (403) y al recargar veía el dashboard del nuevo usuario.

### Solución

- **Backend** (`register`): si `req.user` existe (admin creando otro usuario), no genera token ni cookie. Solo retorna `{ id, email, role }`.
- **Frontend** (`registerRequest`): no guarda token en localStorage.
- **Frontend** (`signUp` en AuthContext): solo actualiza sesión si hay token (auto-registro).
- **Frontend** (`RegisterPage`): redirige a `/users` al crear exitosamente.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/controllers/auth.controllers.js` | Register no crea sesión si `req.user` existe |
| `frontend/src/api/auth.js` | `registerRequest` no guarda token en localStorage |
| `frontend/src/context/AuthContext.jsx` | `signUp` solo actualiza sesión si hay token |
| `frontend/src/pages/RegisterPage.jsx` | Redirige a `/users` al crear usuario |

### Verificaciones realizadas

- `node --check` en todos los archivos backend modificados.
- Build de producción del frontend (`npm run build`) exitoso.

---

## Bloque 5 — Deuda histórica por monto directo + condonación por monto (14/09/2026)

### Problema

El sistema calculaba deuda histórica como `meses × mensualidad actual`. Si el valor de la mensualidad cambió durante el periodo de deuda, el jugador era cobrado de más o de menos. Ejemplo: si debía 3 meses a $20.000 y el fee subió a $30.000, el sistema cobraba $90.000 en vez de $60.000.

### Solución

**1. Registro de jugador antiguo:**
- Admin ingresa **"Meses de deuda"** (solo para el umbral de 6 meses que activa la cuota de reincorporación).
- Admin ingresa **"Monto de deuda en pesos"** (la deuda real, según lo que sabe el admin).
- El sistema NO calcula `meses × fee actual`. Usa el monto que el admin ingresó.
- Si `debtMonths >= 6`: se agrega la cuota de reincorporación (desde settings).
- Se muestra resumen de cobro en tiempo real (deuda + reincorporación si aplica).

**2. Condonación (Ajustar Deuda):**
- Admin ingresa **"Monto a condonar en pesos"** (no meses).
- Restricción: la deuda no puede bajar de 1 mensualidad (el mes actual no se condona).
- Se muestra deuda restante proyectada en tiempo real.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/controllers/membership.controllers.js` | `createMembership`: usa `debtAmount` en vez de `debtMonths × fee`. `adjustDebt`: usa `amountToForgive` en vez de `monthsToForgive × fee` |
| `frontend/src/pages/MembershipFormPage.jsx` | Dos inputs: "Meses de deuda" (threshold) + "Monto de deuda" (pesos). Resumen usa monto directo |
| `frontend/src/components/AttendanceModal.jsx` | Input de monto a condonar en vez de meses. Validación de que no baje de 1 mensualidad |

### Verificaciones realizadas

- `node --check` en todos los archivos backend modificados.
- Build de producción del frontend (`npm run build`) exitoso.

### Funcionalidad

**1. Registro de jugador antiguo con cuota de reincorporación:**
- **Jugador nuevo**: paga inscripción + mensualidad (desde settings). Regla del día 15 aplicada.
- **Jugador antiguo sin deuda**: se le cobra la mensualidad del mes actual.
- **Jugador antiguo con deuda < 6 meses**: se carga deuda histórica = meses × mensualidad.
- **Jugador antiguo con deuda ≥ 6 meses**: se carga deuda histórica + **cuota de reincorporación** (desde settings, $20.000 por defecto).
- El frontend muestra un **resumen de cobro en tiempo real** al registrar jugador antiguo (deuda, reincorporación si aplica, total).
- Ya no se hardcodea `data.amount = 35000`: el backend calcula todo desde settings.

**2. Condonación integrada al pagar expirados:**
- Al abrir el modal de pago de un jugador **Expirado con 6+ meses de deuda**, aparece un aviso: "Si este jugador estuvo fuera del equipo y no asistió, puedes condonar meses antes de cobrar usando 'Ajustar Deuda'".
- El modal muestra la deuda actual del jugador.
- La funcionalidad de condonación ("Ajustar Deuda") ya existía; ahora se integra visualmente con el flujo de pago.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/controllers/membership.controllers.js` | Aplica `reactivationFee` a jugador antiguo con 6+ meses de deuda |
| `frontend/src/pages/MembershipFormPage.jsx` | Quita hardcode de $35.000; muestra resumen de cobro en tiempo real; usa settings |
| `frontend/src/components/PaymentsModals.jsx` | Muestra deuda actual + aviso de condonación para expirados con 6+ meses |

### Verificaciones realizadas

- `node --check` en todos los archivos backend modificados.
- Build de producción del frontend (`npm run build`) exitoso.

---

## Bloque 6 — Rediseño visual (14/09/2026)

### Cambios

**Fondo:**
- Eliminada la imagen de fondo (`fondo4.jpg`) que causaba movimiento e inconsistencia visual.
- Nuevo fondo: gradiente sólido oscuro (`zinc-800/900`) que no se mueve.
- Scrollbar personalizada en tonos grises.

**Navbar:**
- Diseño más limpio: fondo sólido `zinc-800`, bordes sutiles.
- Logo simplificado (ícono rojo + texto "Pilares VC").
- Links horizontales en desktop, menú colapsable en móvil.
- Muestra email del usuario logueado.
- Botón "Configuración" simplificado (solo ícono).

**Login:**
- Fondo sólido sin imagen.
- Card centrada con ícono de voleibol.
- Labels en cada campo.

**Registro:**
- Fondo sólido sin imagen.
- Card centrada con ícono.
- Labels en cada campo.

**Membresías (dashboard):**
- Título más compacto ("Membresías" + conteo).
- Filtros dentro de un card.
- Botones de filtro más compactos.
- Paginación mejorada: solo muestra si hay más de 1 página.

**General:**
- Colores del escudo: rojo (`red-600`), blanco, gris oscuro (`zinc-800`).
- Eliminados todos los `backdrop-blur` innecesarios.
- Tamaños de fuente y espaciados más consistentes.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/index.css` | Nuevo fondo gradiente sólido + scrollbar personalizada |
| `frontend/src/pages/LoginPage.jsx` | Fondo sólido, card con ícono, labels |
| `frontend/src/pages/RegisterPage.jsx` | Fondo sólido, card con ícono, labels |
| `frontend/src/components/Navbar.jsx` | Diseño limpio con colores del escudo |
| `frontend/src/pages/MembershipsPage.jsx` | Filtros compactos, paginación mejorada |
| `frontend/src/pages/SettingsPage.jsx` | Card consistente |

### Verificaciones realizadas

- Build de producción del frontend (`npm run build`) exitoso.

---

## Bloque 7 — Fix: rutas de usuarios no montadas (14/09/2026)

### Problema

Al crear la gestión de usuarios (Bloque 2c), se renombró `admin.models` → `user.models` y se crearon `user.routes.js` y `user.controllers.js`, pero **nunca se montaron las rutas en `app.js`**. Por eso `/api/users` devolvía 404 y el frontend mostraba "Error al cargar usuarios".

### Solución

Se importó y montó `userRoutes` en `backend/src/app.js`.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/app.js` | Se agregó `import userRoutes` y `app.use("/api", userRoutes)` |

### Verificaciones realizadas

- `node --check` en `app.js`, `auth.controllers.js`, `user.controllers.js`.
- Verificado que todos los imports usan `user.models.js` / modelo `User`.

---

## Bloque 8 — IDs enteros → UUID (14/09/2026)

### Cambio estructural

Cambio de los IDs numéricos autoincrementales a **UUID (v4)** en las 4 tablas: `users`, `memberships`, `payments` y `settings`. Se preservan todos los datos y relaciones. Además se **elimina la tabla legada `attendances`** (3 filas, sin uso en el código actual).

Motivo: los UUID evitan enumerar registros por ID (ajuste de seguridad) y facilitan futuras integraciones.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/models/user.models.js` | `id` pasa de `INTEGER autoIncrement` a `UUID UuidV4` |
| `backend/src/models/settings.models.js` | `id` → UUID; `updatedBy` pasa de `INTEGER` a `UUID` |
| `backend/src/models/memberShip.models.js` | `id` de `MemberShip` y `Payment` → UUID; `userId` y `memberShipId` (FK) → UUID |
| `backend/src/services/billing.service.js` | Nuevo `SETTINGS_ID` (UUID fijo `00000000-0000-4000-8000-000000000001`); `findOrCreate settings` usa ese constante |
| `backend/src/controllers/settings.controllers.js` | `findOrCreate settings` usa `SETTINGS_ID` |

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `backend/migrations/2026-09-14_ids_a_uuid.sql` | Script migratorio para pgAdmin (transaccional, conserva datos y FKs) |

### Acciones manuales requeridas (usuario)

1. Ejecutar **`backend/migrations/2026-09-14_ids_a_uuid.sql`** completo en pgAdmin (BD de Neon). El script además borra la tabla `attendances`.
2. Desplegar el backend actualizado (los modelos nuevos son compatibles con el esquema migrado; `sequelize.sync({force:false})` no re-altera nada).
3. La tabla `admins` quedó como legado vacío en la BD y no la toca la migración; se puede borrar con `DROP TABLE IF EXISTS "admins";` si se desea.

### Verificaciones realizadas

- `node --check` en todos los modelos y servicios modificados.
- Smoke test de imports (`app.js` carga modelos/controllers sin errores).
- Build de producción del frontend exitoso (el frontend usa IDs como strings; no se requirió cambio).

---

## Bloque 9 — Ajustes de cobro y grupos familiares (15/09/2026)

### Concepto

Nuevo sistema de **ajustes de facturación** que permite al admin registrar descuentos (hermanos, colaboraciones), penalidades y ajustes manuales **con trazabilidad completa**. Se separa de la condonación (que perdona deuda histórica).

### Cambios en el backend

**Nuevo modelo `BillingAdjustment`:**
- `memberShipId` (FK → memberships)
- `cycle` (ej. "2026-10")
- `amount` (negativo = descuento, positivo = penalidad)
- `type`: `descuento_hermano`, `penalidad`, `colaboracion`, `manual`
- `description` (texto libre)
- `userId` (quién lo hizo)

**Nuevo campo `familyId` en memberships:**
- Texto nullable que agrupa hermanos (ej. "Hermanos García")

**Modificaciones en `billing.service.js`:**
- `calcDeuda` ahora acepta `totalAdjustments` como segundo parámetro
- Nuevos helpers: `getAdjustmentsTotal(memberShipId)` y `getAllAdjustmentsTotal()`
- `applyBillingIfDue` considera ajustes al calcular estado

**Modificaciones en `membership.controllers.js`:**
- `getMemberships`: retorna `totalAdjustments` por jugador
- `getMembershipById`: retorna `totalAdjustments`
- `addPayments`: considera ajustes al calcular deuda y tope de pago
- `adjustDebt`: considera ajustes al calcular deuda actual
- `forgiveDebt`: considera ajustes al calcular deuda
- `createMembership`: acepta `familyId` opcional
- `updateUserData`: permite actualizar `familyId`

**Nuevas rutas (`/api/adjustments`):**
- `GET /adjustments/summary` → mapa de totales por jugador
- `GET /adjustments/:memberShipId` → ajustes de un jugador
- `POST /adjustments/:memberShipId` → crear ajuste (con opción `applyToSiblings`)
- `DELETE /adjustments/:id` → eliminar ajuste (admin only)

### Cambios en el frontend

**Nuevo componente `AdjustmentsModal`:**
- Lista de ajustes existentes del jugador
- Formulario para crear nuevos (ciclo, monto, tipo, descripción)
- Checkbox "Aplicar a hermanos" cuando el jugador tiene `familyId`
- Botón de eliminar por ajuste

**`PaymentsModals`:**
- Ahora muestra desglose: facturado, ajustes, pagado, deuda total

**`MembershipsTable`:**
- Nuevo botón "Ajustes" (ícono `SlidersHorizontal`) por jugador

**`MembershipFormPage`:**
- Nuevo campo opcional "Grupo familiar" (text input)

**Nuevo API client `billingAdjustments.js`:**
- `getAdjustmentsByMemberRequest`, `createAdjustmentRequest`, `deleteAdjustmentRequest`, `getAdjustmentsSummaryRequest`

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `backend/src/models/billingAdjustment.models.js` | Modelo de ajustes de facturación |
| `backend/src/controllers/billingAdjustment.controllers.js` | CRUD de ajustes |
| `backend/src/routes/billingAdjustment.routes.js` | Rutas protegidas |
| `frontend/src/api/billingAdjustments.js` | Cliente axios |
| `frontend/src/components/AdjustmentsModal.jsx` | Modal de gestión de ajustes |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/models/memberShip.models.js` | Nuevo campo `familyId` |
| `backend/src/services/billing.service.js` | Import de BillingAdjustment, helpers de ajustes, `calcDeuda` con ajustes |
| `backend/src/controllers/membership.controllers.js` | Todos los cálculos de deuda consideran ajustes; `createMembership` acepta `familyId` |
| `backend/src/app.js` | Monta `billingAdjustmentRoutes` |
| `frontend/src/components/MembershipsTable.jsx` | Botón "Ajustes" + import de AdjustmentsModal |
| `frontend/src/components/PaymentsModals.jsx` | Desglose de deuda con ajustes |
| `frontend/src/pages/MembershipFormPage.jsx` | Campo "Grupo familiar" |

### Acciones manuales requeridas

1. Ejecutar en pgAdmin (Neon):
```sql
ALTER TABLE "memberships" ADD COLUMN "familyId" VARCHAR(255);
```
2. Render desplegará automáticamente el backend y frontend.

### Verificaciones realizadas

- `node --check` en todos los archivos backend nuevos/modificados.
- Build de producción del frontend exitoso.

---

## Legado (anterior al Bloque 1)

Registro git existente: migración de Mongo a PostgreSQL, cron inicial en Render, mejoras de estilos. No documentado formalmente.
