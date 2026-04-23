import { MemberShip, Payment } from "../models/memberShip.models.js";
import sequelize from "../db.js";

const MONTHLY_FEE    = 20000;
const INSCRIPTION_FEE = 15000;

// ─── Helper: convierte instancia Sequelize a objeto plano ─────────────────
const toPlain = (member) => (member ? member.get({ plain: true }) : null);

// ─── Helper: calcula la deuda real ─────────────────────────────────────────
// Ya no usamos historial de ausencias. Si se condona, se resta directamente del expected.
const calcDeuda = (plain) => {
  return Math.max(0, (plain.totalFeeExpected || 0) - (plain.totalPaid || 0));
};

// ─── Helper: estado basado en deuda real ──────────────────────────────────
const statusFromDebt = (deuda, totalPaid) => {
  if (deuda <= 0) return "Activa";
  if (totalPaid > 0) return "Pendiente"; // ha pagado algo pero aún debe
  return "Expirada";                     // no ha pagado nada
};

// ─── Helper: include estándar con pagos ───────────────────────────────────
const fullInclude = [
  { model: Payment, as: "payments", required: false },
];

// ════════════════════════════════════════════════════════════════
// CREAR MEMBRESÍA
// ════════════════════════════════════════════════════════════════
export const createMembership = async (req, res) => {
  try {
    const {
      clientName, documentType, clientDocument,
      clientPhone, clientEmail, birthdate,
    } = req.body;

    // ✅ FIX #7: isNewPlayer se normaliza explícitamente.
    // Si el frontend manda el string "false", Boolean("false")===true (bug).
    // Ahora solo es true si llega true (boolean) o "true" (string).
    const isNewPlayer =
      req.body.isNewPlayer === true || req.body.isNewPlayer === "true";

    // ✅ FIX #8: debtMonths se parsea y valida antes de usarse.
    // Antes: debtMonths podía ser "abc" => NaN * 20000 = NaN en la DB.
    const debtMonths = Math.max(0, parseInt(req.body.debtMonths, 10) || 0);

    // ✅ FIX #8: amount también se parsea de forma segura.
    const parsedAmount = Math.max(0, parseFloat(req.body.amount) || 0);

    const now = new Date();
    const currentDay   = now.getDate();
    const currentMonth = now.getMonth();      // 0-indexed
    const currentYear  = now.getFullYear();

    let totalFeeExpected = 0;
    let nextBillingDate;

    if (isNewPlayer) {
      // ── JUGADOR NUEVO ────────────────────────────────────────────────────
      // Siempre paga inscripción + mensualidad del mes actual
      totalFeeExpected = MONTHLY_FEE + INSCRIPTION_FEE;

      // Regla del Día 15:
      //   días 1–15  → siguiente cobro el 1 del mes próximo
      //   días 16–31 → se SALTA ese mes, cobra el mes subsiguiente
      if (currentDay <= 15) {
        nextBillingDate = new Date(currentYear, currentMonth + 1, 1);
      } else {
        nextBillingDate = new Date(currentYear, currentMonth + 2, 1);
      }
    } else {
      // ── JUGADOR ANTIGUO ──────────────────────────────────────────────────
      // No aplica Regla del Día 15. El cron lo factura el 1 del mes siguiente.
      nextBillingDate = new Date(currentYear, currentMonth + 1, 1);

      if (debtMonths > 0) {
        // Debe meses anteriores: se cargan como deuda histórica
        totalFeeExpected = debtMonths * MONTHLY_FEE;
      } else {
        // Al día. Registrado sin deuda histórica pero sí debe el mes en curso
        // ya que lleva tiempo entrenando (no aplica gracia del día 15).
        // ✅ FIX ambigüedad #2: en lugar de dejarlo como "Activa" sin cobrar,
        // se carga el mes actual inmediatamente porque ya está entrenando.
        totalFeeExpected = MONTHLY_FEE;
      }
    }

    const deuda  = Math.max(0, totalFeeExpected - parsedAmount);
    const status = statusFromDebt(deuda, parsedAmount);

    const newMemberShip = await MemberShip.create({
      clientName, documentType, clientDocument,
      clientPhone, clientEmail, birthdate,
      status,
      totalPaid: parsedAmount,
      totalFeeExpected,
      nextBillingDate,
      adminId: req.admin.id,
    });

    // Registrar el abono inicial solo si hubo pago
    if (parsedAmount > 0) {
      await Payment.create({
        amount: parsedAmount,
        date: now,
        month: currentMonth + 1,
        year: currentYear,
        memberShipId: newMemberShip.id,
      });
    }

    // El cron creará la asistencia del mes 1 cuando corra.
    // En el registro no se genera porque no sabemos si ya asistió este mes.

    const saved = await MemberShip.findByPk(newMemberShip.id, { include: fullInclude });
    const plain = toPlain(saved);
    plain.deuda = calcDeuda(plain);

    res.json(plain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar jugador" });
  }
};

// ════════════════════════════════════════════════════════════════
// AGREGAR PAGO
// ════════════════════════════════════════════════════════════════
export const addPayments = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ FIX #8: parseo seguro del monto
    const amount = parseFloat(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Monto inválido" });
    }

    const member = await MemberShip.findByPk(id, { include: fullInclude });
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    const plain = toPlain(member);

    // ✅ FIX #12: el pago no puede superar la deuda real pendiente
    const deudaActual = calcDeuda(plain);
    if (deudaActual > 0 && amount > deudaActual) {
      return res.status(400).json({
        message: `El pago ($${amount}) supera la deuda pendiente ($${deudaActual}). Máximo permitido: $${deudaActual}`,
      });
    }

    const now = new Date();

    await Payment.create({
      amount,
      date: now,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      memberShipId: member.id,
    });

    const newTotalPaid = member.totalPaid + amount;
    await member.update({ totalPaid: newTotalPaid });
    await member.reload({ include: fullInclude });

    const updatedPlain = toPlain(member);
    const deuda = calcDeuda(updatedPlain);
    updatedPlain.status = statusFromDebt(deuda, updatedPlain.totalPaid);
    await member.update({ status: updatedPlain.status });

    updatedPlain.deuda = deuda;
    return res.json(updatedPlain);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error agregando pago" });
  }
};

// renewMembership es idéntico a addPayments (el cron gestiona el expected)
export const renewMembership = addPayments;

// ════════════════════════════════════════════════════════════════
// AJUSTAR DEUDA (Regla de negocio)
// ════════════════════════════════════════════════════════════════
// Resta `monthsToForgive` del totalFeeExpected para perdonar inasistencias.
export const adjustDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const monthsToForgive = Math.max(0, parseInt(req.body.monthsToForgive, 10) || 0);

    const member = await MemberShip.findByPk(id, { include: fullInclude });
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    if (member.status === "Activa") {
      return res.status(400).json({ message: "No se puede ajustar la deuda de un jugador activo." });
    }

    const currentDebt = member.totalFeeExpected - member.totalPaid;
    const maxMonthsToForgive = Math.max(0, Math.floor(currentDebt / MONTHLY_FEE) - 1);

    if (monthsToForgive > maxMonthsToForgive) {
      return res.status(400).json({ 
        message: `Excede el máximo de meses a condonar. Solo puedes condonar hasta ${maxMonthsToForgive} meses.` 
      });
    }

    // 1. Aplicamos la condonación permanentemente
    let newTotalFeeExpected = member.totalFeeExpected - (monthsToForgive * MONTHLY_FEE);
    
    // 2. Guardamos los cambios
    await member.update({
      totalFeeExpected: newTotalFeeExpected,
    });

    // 3. Recalcular estado
    await member.reload({ include: fullInclude });
    const plain = toPlain(member);
    const deudaFinal = calcDeuda(plain);
    const newStatus = statusFromDebt(deudaFinal, plain.totalPaid);
    await member.update({ status: newStatus });

    plain.deuda = deudaFinal;
    plain.status = newStatus;

    return res.json({
      message: `Se condonaron ${monthsToForgive} meses exitosamente.`,
      membership: plain,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al ajustar la deuda." });
  }
};

// ════════════════════════════════════════════════════════════════
// PERDONAR DEUDA (manual, para casos excepcionales)
// ════════════════════════════════════════════════════════════════
// ✅ FIX #15: se usa decrement atómico para evitar race condition.
// Antes: findByPk → leer expected → escribir expected-20000
// (dos requests simultáneos podían leer el mismo valor y perdonar 2 veces)
// Ahora: UPDATE SET totalFeeExpected = totalFeeExpected - 20000 WHERE id=X
// es atómico a nivel de base de datos.
export const forgiveDebt = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await MemberShip.findByPk(id);
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    // No permitir que totalFeeExpected baje de 0
    if (member.totalFeeExpected < MONTHLY_FEE) {
      return res.status(400).json({
        message: "No hay deuda suficiente para perdonar un mes",
      });
    }

    // ✅ Operación atómica: sin race condition
    await MemberShip.decrement("totalFeeExpected", {
      by: MONTHLY_FEE,
      where: { id },
    });

    await member.reload({ include: fullInclude });
    const plain = toPlain(member);
    const deuda = calcDeuda(plain);
    const status = statusFromDebt(deuda, plain.totalPaid);
    await member.update({ status });

    plain.deuda = deuda;
    return res.json(plain);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al perdonar deuda" });
  }
};

// ════════════════════════════════════════════════════════════════
// GET ALL MEMBERSHIPS
// ════════════════════════════════════════════════════════════════
export const getMemberships = async (req, res) => {
  try {
    const memberships = await MemberShip.findAll({
      include: fullInclude,
      order: [
        ["clientName", "ASC"],
        [{ model: Payment, as: "payments" }, "date", "DESC"],
      ],
    });

    res.json(
      memberships.map((m) => {
        const plain = toPlain(m);
        plain.deuda = calcDeuda(plain);
        return plain;
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener membresías" });
  }
};

// ════════════════════════════════════════════════════════════════
// GET BY ID
// ════════════════════════════════════════════════════════════════
export const getMembershipById = async (req, res) => {
  try {
    const member = await MemberShip.findByPk(req.params.id, {
      include: fullInclude,
      order: [[{ model: Payment, as: "payments" }, "date", "DESC"]],
    });

    if (!member) return res.status(404).json({ message: "Membresía no encontrada" });

    const plain = toPlain(member);
    plain.deuda = calcDeuda(plain);
    return res.json(plain);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

// ════════════════════════════════════════════════════════════════
// ACTUALIZAR DATOS DEL JUGADOR
// ════════════════════════════════════════════════════════════════
export const updateUserData = async (req, res) => {
  const { id } = req.params;
  const { clientName, documentType, clientDocument, clientPhone, clientEmail, birthdate } = req.body;

  if (!clientName && !documentType && !clientDocument && !clientPhone && !clientEmail && !birthdate) {
    return res.status(400).json({ message: "No se enviaron datos válidos para actualizar." });
  }

  try {
    const member = await MemberShip.findByPk(id);
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    await member.update({
      ...(clientName     && { clientName }),
      ...(documentType   && { documentType }),
      ...(clientDocument && { clientDocument }),
      ...(clientPhone    && { clientPhone }),
      ...(clientEmail    && { clientEmail }),
      ...(birthdate      && { birthdate }),
    });

    await member.reload({ include: fullInclude });
    const plain = toPlain(member);
    plain.deuda = calcDeuda(plain);

    res.json({ message: "Datos del jugador actualizados correctamente", user: plain });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el jugador", error });
  }
};

// ════════════════════════════════════════════════════════════════
// ELIMINAR MEMBRESÍA
// ════════════════════════════════════════════════════════════════
export const deleteMembership = async (req, res) => {
  try {
    const member = await MemberShip.findByPk(req.params.id, { include: fullInclude });
    if (!member) return res.status(404).json({ message: "Membresía no encontrada" });

    const plain = toPlain(member);
    await member.destroy(); // cascade borra payments y attendances
    res.json(plain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar membresía" });
  }
};
