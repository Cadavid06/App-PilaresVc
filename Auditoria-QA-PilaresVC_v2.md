# Auditoría QA / UX — App PilaresVC (v2)

Auditoría **solo lectura** sobre los cambios ya subidos (`main`) y desplegados en `https://app-pilaresvc.onrender.com/`. Verificado en código y con navegador real (móvil 390×844 y escritorio 1280) usando las cuentas de prueba admin y entrenador. El ajuste de prueba que creé para verificar el saldo a favor fue **eliminado**; los datos quedaron como estaban.

---

## Resumen ejecutivo

| Dimensión | Nota | Cambio vs. v1 |
|---|---|---|
| **Rendimiento** | **8 / 10** | ▲ (6) |
| **UI / UX** | **8 / 10** | ▲ (6.5) |
| **Código limpio** | **7.5 / 10** | ▲ (7) |

Los tres puntos que señalé en la auditoría anterior están **resueltos**: existe vista móvil con tarjetas + hoja inferior, se eliminó la petición redundante al abrir detalles, y hay selector de filas por página con contador de resultados. Quedan tres defectos concretos, uno de ellos visible para cualquier usuario.

---

## 1. Diseño móvil: tarjetas + `PlayerBottomSheet` — 8/10

### Lo que funciona bien (verificado en producción)
- Renderizado condicional correcto: `hidden md:block` para la tabla y `md:hidden` para las tarjetas. Ya no hay scroll horizontal en móvil; deuda y estado son visibles de un vistazo.
- Cada tarjeta es un `<button>` real: accesible por teclado, con `active:scale` y buena zona táctil.
- La hoja inferior es excelente: iniciales con *fallback* seguro (`(name || "")`), *handle* de arrastre visual, resumen económico, acciones grandes en cuadrícula, botón "Condonar" con `disabled` real y motivo escrito debajo en texto visible (mejor que el tooltip de hover del escritorio, que en táctil no se ve).
- **Scroll lock activo**: con la hoja abierta, `body { overflow: hidden }`. Confirmado en el navegador.

### Defectos encontrados

**1) Scroll chaining aún posible** — el panel scrollable (`max-h-[85vh] overflow-y-auto`) tiene `overscroll-behavior: auto`. Al llegar al final del contenido, el gesto se propaga. El bloqueo del `body` lo mitiga, pero falta `overscroll-behavior: contain` en el panel.

**2) El bloqueo de scroll se libera antes de tiempo (bug real y reproducible)** — el efecto usa `document.body.style.overflow = "unset"` de forma absoluta. Flujo verificado: abrir hoja → pulsar "Ver" → la hoja se cierra y pone `overflow: unset`, pero el modal de detalles ya está abierto. Resultado medido: `body { overflow: visible }` **con el modal abierto**, es decir, el fondo vuelve a desplazarse detrás del modal. Se corrige con un contador de bloqueos compartido o restaurando el valor previo en lugar de `unset`.

**3) Accesibilidad del diálogo incompleta** — comprobado:
- **Escape no cierra la hoja** (no hay ningún `keydown` en todo el proyecto).
- El foco **no entra** en el panel al abrirlo (queda en la tarjeta) y no hay *focus trap* ni devolución del foco al cerrar.
- Falta `role="dialog"`, `aria-modal="true"` y `aria-labelledby` apuntando al nombre del jugador.
- El *overlay* de cierre es un `<div onClick>` con `aria-label="Cerrar"`: un `div` no es enfocable ni anunciable; el `aria-label` ahí no aporta nada (mejor `aria-hidden` y confiar en el botón X, que sí está bien hecho).

**4) Detalle menor** — el gesto de arrastrar hacia abajo no cierra la hoja; el *handle* lo sugiere visualmente. En escritorio, el botón de expandir fila sigue con `aria-label="Expandir fila"` fijo y sin `aria-expanded`.

---

## 2. Rendimiento y peticiones — 8/10

### Resuelto ✔
- `getMembership` ahora recibe el objeto ya presente en memoria (`getMembership(m)`), sin llamada al backend. **Medido: 0 peticiones** al abrir la hoja y 0 al pulsar "Ver". Antes había un `GET /memberShip/:id` por apertura.
- `getMembershipById` quedó **sin uso** en la UI (solo vive en el contexto). Es código muerto; conviene retirarlo o documentar por qué se conserva.
- Tiempo de login → lista con servidor caliente: **~2.7 s**. En frío (Render plan free) supera los 30 s: eso es del plan, no del código.

### Pendiente
- `filteredMemberships` se recalcula en **cada render** (sin `useMemo`), igual que los seis `membership.find(...)` de los modales. `WhatsAppListModal` sí usa `useMemo`: aplicar el mismo criterio en la tabla.
- Los **seis modales + la hoja** están montados permanentemente, abiertos o no.
- `useEffect(() => getMemberships(), [])` sigue sin `AbortController` ni bandera de cancelación → posible `setState` tras desmontar si el usuario navega durante un arranque en frío.
- Sin virtualización: con 7 jugadores la opción de 100 filas va perfecta, pero a escala real cada render construirá 100 filas + 100 tarjetas + los `find()` de los modales. Con más de ~300 registros conviene paginar en el servidor.
- Backend: `getMemberships` sigue ejecutando `applyBillingIfDue` **por jugador dentro de un GET** (lectura que escribe). Es el mayor coste del primer render y no es idempotente.

**Fugas de memoria:** el `useEffect` de la hoja limpia correctamente en el `return`. No detecté suscripciones ni temporizadores huérfanos.

---

## 3. Paginación y filtros — un bug confirmado

### Funciona ✔
- `setItemsPerPage` resetea `currentPage` a 1 → no hay páginas fantasma al cambiar el tamaño.
- El contador "Mostrando 1–5 de 7 jugadores" es un acierto de UX; verificado en 5, 10 y 100.
- Con 100 filas la tabla no se rompe: `Mostrando 1–7 de 7`, 7 filas renderizadas, sin errores en consola.
- Botones de página con `aria-label` ("Ir a la página 2") y tamaño táctil de 40 px.

### Bug confirmado (reproducible)
**Buscar estando en una página distinta de la 1 muestra "No se encontraron membresías con estos filtros".** Pasos: 5 filas por página → ir a página 2 → escribir "Jose" → la lista aparece vacía, aunque Jose existe. Causa: los filtros de estado/género/categoría hacen `setCurrentPage(1)`, pero el `onChange` del buscador no. Agravante: el bloque de paginación y el contador están dentro del `else`, así que desaparecen y el usuario no tiene manera de volver a la página 1.

**Otros riesgos de la paginación**
- `[...Array(totalPages)]` pinta un botón por página: con 500 jugadores y 5 filas por página son 100 botones. Conviene una ventana (1 … 7 8 9 … 100).
- `currentPage` no se ajusta si `totalPages` baja por otro camino (por ejemplo, al eliminar el último jugador de la última página).

---

## 4. Casos límite

| Caso | Comportamiento verificado | Veredicto |
|---|---|---|
| **Saldo a favor** (probado en producción: colaboración de −$50.000 sobre un jugador con deuda 0) | La tabla muestra **`$0` en verde**, ocultando el crédito. La hoja móvil sí muestra el número negativo, pero en verde y sin etiqueta "a favor" | **Corregir**: mostrar "A favor: $50.000" en ambas vistas |
| Nombre nulo | `m.clientName.toLowerCase()` en el filtro de la página | **Crash** de la vista al buscar |
| `deuda` nula | Tabla: `m.deuda.toLocaleString()` sin guarda → **crash**. Hoja: `member.deuda \|\| 0` → protegida | Blindar la tabla igual que la hoja |
| Iniciales sin nombre | `getInitials` y la tarjeta usan `(name \|\| "")` | ✔ correcto |
| Categoría/género vacíos | Muestran "—" | ✔ correcto |
| Estado desconocido | La tarjeta cae al estilo "Expirada" y escribe el valor crudo; la tabla muestra "Desconocido" | Inconsistente, sin riesgo |
| `monthlyFee = 0` | `settings?.monthlyFee \|\| 20000` cae al valor por defecto | Usar `??` |
| Rol entrenador | La hoja móvil **no muestra "Eliminar"** | ✔ correcto |
| Fallo al eliminar | Sin aviso al usuario | Añadir mensaje de error |

---

## Puntos fuertes

1. La vista móvil es, de lejos, la mejor parte de la app: jerarquía clara, gestos naturales y acciones al alcance del pulgar.
2. Se corrigió la petición redundante y el patrón `find()` mantiene los modales sincronizados con la lista.
3. La lógica de negocio dura (reincorporación, tope de pago, condonación) vive en el servidor.
4. Detalles de producto bien pensados: contador de resultados, motivo visible del botón bloqueado, permisos por rol respetados en las dos vistas.
5. Consola limpia salvo el 401 esperado de la comprobación de sesión inicial.

---

## Sugerencias priorizadas

**Alta (afectan a usuarios hoy)**
1. `setCurrentPage(1)` en el `onChange` del buscador.
2. Mostrar el saldo a favor en la tabla y en la hoja ("A favor: $X"), no como `$0`.
3. Bloqueo de scroll compartido (contador de modales abiertos) en lugar de `overflow = "unset"`.
4. Guardas en la tabla: `(m.clientName ?? "")`, `Number(m.deuda ?? 0)`.

**Media**
5. `overscroll-behavior: contain` en el panel de la hoja.
6. Cierre con Escape, `role="dialog"` + `aria-modal`, foco inicial dentro del panel y devolución al cerrar.
7. `useMemo` para la lista filtrada y para los objetos de cada modal; montar cada modal solo cuando esté abierto.
8. Ventana de páginas en la paginación y ajuste de `currentPage` cuando `totalPages` disminuya.

**Baja / futuro**
9. Sacar `applyBillingIfDue` del `GET` de listado (cron o endpoint explícito) y pasar a paginación en servidor antes de crecer.
10. Retirar `getMembershipById` si ya no se usa; `AbortController` en la carga inicial; `??` en `monthlyFee`; `aria-expanded` en el chevron de escritorio; cierre por arrastre en la hoja.
11. Mensaje de error visible cuando falle eliminar.
