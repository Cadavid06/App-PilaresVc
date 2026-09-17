import { MemberShip, Payment } from "../models/memberShip.models.js";
import {
  getSettings,
  calcDeuda,
  statusFromDebt,
  applyBillingIfDue,
  getAdjustmentsTotal,
  getAllAdjustmentsTotal,
} from "../services/billing.service.js";
import { calculateCategory, resolveDocumentType } from "../utils/category.js";

// ─── Helper: convierte instancia Sequelize a objeto plano ─────────────────
const toPlain = (member) => (member ? member.get({ plain: true }) : null);

// ─── Helper: agrega categoría calculada (ligero, sin DB write) ─────────────
const addCategory = (plain) => {
  if (!plain) return null;
  plain.category = calculateCategory(plain.birthdate);
  return plain;
};

// ─── Helper: agrega categoría + auto-actualiza TI → CC (con DB write) ─────
const enrichMember = async (plain) => {
  if (!plain) return null;
  plain.category = calculateCategory(plain.birthdate);
  const newDocType = resolveDocumentType(plain.documentType, plain.birthdate);
  if (newDocType) {
    await MemberShip.update(
      { documentType: newDocType },
      { where: { id: plain.id } }
    );
    plain.documentType = newDocType;
  }
  return plain;
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
      clientPhone, clientEmail, birthdate, gender, familyId,
    } = req.body;

    const isNewPlayer =
      req.body.isNewPlayer === true || req.body.isNewPlayer === "true";

    const debtMonths = Math.max(0, parseInt(req.body.debtMonths, 10) || 0);
    const debtAmount = Math.max(0, parseFloat(req.body.debtAmount) || 0);
    const parsedAmount = Math.max(0, parseFloat(req.body.amount) || 0);

    const settings = await getSettings();
    const { monthlyFee, inscriptionFee } = settings;

    const now = new Date();
    const currentDay   = now.getDate();
    const currentMonth = now.getMonth();      // 0-indexed
    const currentYear  = now.getFullYear();

    let totalFeeExpected = 0;
    let nextBillingDate;

    if (isNewPlayer) {
      // ── JUGADOR NUEVO ────────────────────────────────────────────────────
      totalFeeExpected = monthlyFee + inscriptionFee;

      if (currentDay <= 15) {
        nextBillingDate = new Date(currentYear, currentMonth + 1, 1);
      } else {
        nextBillingDate = new Date(currentYear, currentMonth + 2, 1);
      }
    } else {
      // ── JUGADOR ANTIGUO ──────────────────────────────────────────────────
      nextBillingDate = new Date(currentYear, currentMonth + 1, 1);

      // Deuda que el admin digitó + mes actual automático
      totalFeeExpected = debtAmount + monthlyFee;
    }

    const deuda  = Math.max(0, totalFeeExpected - parsedAmount);
    const status = statusFromDebt(deuda, monthlyFee);

    const newMemberShip = await MemberShip.create({
      clientName, documentType, clientDocument,
      clientPhone, clientEmail, birthdate,
      gender: gender === "Femenino" ? "Femenino" : "Masculino",
      familyId: familyId || null,
      status,
      totalPaid: parsedAmount,
      totalFeeExpected,
      nextBillingDate,
      userId: req.user.id,
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

    const saved = await MemberShip.findByPk(newMemberShip.id, { include: fullInclude });
    const plain = await enrichMember(toPlain(saved));
    const adj = await getAdjustmentsTotal(newMemberShip.id);
    const discount = (plain.familyId && settings.siblingDiscount > 0) ? settings.siblingDiscount : 0;
    plain.deuda = calcDeuda(plain, adj, discount);

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

    const amount = parseFloat(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Monto inválido" });
    }

    const member = await MemberShip.findByPk(id, { include: fullInclude });
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    // 1. Facturación lazy: recupera meses perdidos si el server estuvo dormido
    const settings = await getSettings();
    await applyBillingIfDue(member, settings);
    const plain = toPlain(member);

    const totalAdj = await getAdjustmentsTotal(member.id);
    const discount = (member.familyId && settings.siblingDiscount > 0) ? settings.siblingDiscount : 0;
    const deudaActual = calcDeuda(plain, totalAdj, discount);

    // 2. Cuota de reincorporación automática:
    //    si un expirado debe 6+ mensualidades y este pago lo devuelve a
    //    "current" (deuda <= mensualidad), el sistema suma la cuota.
    let reactivationFee = 0;
    const wasExpired = plain.status === "Expirada";
    if (
      wasExpired &&
      deudaActual >= 6 * settings.monthlyFee &&
      deudaActual - amount <= settings.monthlyFee
    ) {
      reactivationFee = settings.reactivationFee;
    }

    // 3. Validación de tope de pago
    const maxAllowed = deudaActual + reactivationFee;
    if (amount > maxAllowed) {
      const extra = reactivationFee
        ? ` (incluye cuota de reincorporación de $${reactivationFee})`
        : "";
      return res.status(400).json({
        message: `El pago ($${amount}) supera el monto pendiente ($${deudaActual}${extra}). Máximo permitido: $${maxAllowed}`,
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

    await member.update({
      totalPaid: (member.totalPaid || 0) + amount,
    });

    if (reactivationFee > 0) {
      await member.increment("totalFeeExpected", { by: reactivationFee });
    }

    await member.reload({ include: fullInclude });

    const updatedPlain = toPlain(member);
    const newAdj = await getAdjustmentsTotal(member.id);
    const newDiscount = (member.familyId && settings.siblingDiscount > 0) ? settings.siblingDiscount : 0;
    const deuda = calcDeuda(updatedPlain, newAdj, newDiscount);
    updatedPlain.status = statusFromDebt(deuda, settings.monthlyFee);
    await member.update({ status: updatedPlain.status });

    updatedPlain.deuda = deuda;
    updatedPlain.totalAdjustments = newAdj;
    updatedPlain.siblingDiscount = newDiscount;
    return res.json(addCategory(updatedPlain));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error agregando pago" });
  }
};

// renewMembership es idéntico a addPayments (el cron/lazy gestiona el expected)
export const renewMembership = addPayments;

// ════════════════════════════════════════════════════════════════
// AJUSTAR DEUDA (Regla de negocio)
// ════════════════════════════════════════════════════════════════
export const adjustDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const amountToForgive = Math.max(0, parseFloat(req.body.amountToForgive) || 0);

    const member = await MemberShip.findByPk(id, { include: fullInclude });
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    const settings = await getSettings();
    const { monthlyFee } = settings;

    await applyBillingIfDue(member, settings);
    await member.reload({ include: fullInclude });
    const plain = toPlain(member);

    const totalAdj = await getAdjustmentsTotal(member.id);
    const discount = (member.familyId && settings.siblingDiscount > 0) ? settings.siblingDiscount : 0;

    if (plain.status === "Activa") {
      return res.status(400).json({ message: "No se puede ajustar la deuda de un jugador activo." });
    }

    const currentDebt = calcDeuda(plain, totalAdj, discount);

    if (amountToForgive <= 0) {
      return res.status(400).json({ message: "El monto a condonar debe ser mayor a 0." });
    }

    if (amountToForgive > currentDebt) {
      return res.status(400).json({
        message: `El monto a condonar ($${amountToForgive.toLocaleString()}) excede la deuda actual ($${currentDebt.toLocaleString()}).`,
      });
    }

    // No permitir que baje de 1 mensualidad (el mes actual no se condona)
    const newDebt = currentDebt - amountToForgive;
    if (newDebt < monthlyFee) {
      return res.status(400).json({
        message: `No se puede condonar tanto. La deuda no puede bajar de una mensualidad ($${monthlyFee.toLocaleString()}) porque el mes actual no se condona.`,
      });
    }

    const newTotalFeeExpected = plain.totalFeeExpected - amountToForgive;

    await member.update({ totalFeeExpected: newTotalFeeExpected });

    const deudaFinal = calcDeuda({ ...plain, totalFeeExpected: newTotalFeeExpected }, totalAdj, discount);
    const newStatus = statusFromDebt(deudaFinal, monthlyFee);
    await member.update({ status: newStatus });

    const updatedPlain = { ...plain, totalFeeExpected: newTotalFeeExpected, status: newStatus };
    updatedPlain.deuda = deudaFinal;
    updatedPlain.totalAdjustments = totalAdj;
    updatedPlain.siblingDiscount = discount;

    return res.json({
      message: `Se condonaron $${amountToForgive.toLocaleString()} exitosamente.`,
      membership: addCategory(updatedPlain),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al ajustar la deuda." });
  }
};

// ════════════════════════════════════════════════════════════════
// PERDONAR DEUDA (manual, para casos excepcionales)
// ════════════════════════════════════════════════════════════════
export const forgiveDebt = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await MemberShip.findByPk(id);
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    const settings = await getSettings();
    const { monthlyFee } = settings;

    await applyBillingIfDue(member, settings);
    await member.reload({ include: fullInclude });
    const plain = toPlain(member);

    const totalAdj = await getAdjustmentsTotal(member.id);
    const discount = (member.familyId && settings.siblingDiscount > 0) ? settings.siblingDiscount : 0;

    // No permitir que totalFeeExpected baje de 0
    if (plain.totalFeeExpected < monthlyFee) {
      return res.status(400).json({
        message: "No hay deuda suficiente para perdonar un mes",
      });
    }

    // Operación atómica: sin race condition
    await MemberShip.decrement("totalFeeExpected", {
      by: monthlyFee,
      where: { id },
    });

    await member.reload({ include: fullInclude });
    const updatedPlain = toPlain(member);
    const deuda = calcDeuda(updatedPlain, totalAdj, discount);
    const status = statusFromDebt(deuda, monthlyFee);
    await member.update({ status });

    updatedPlain.deuda = deuda;
    updatedPlain.totalAdjustments = totalAdj;
    updatedPlain.siblingDiscount = discount;
    return res.json(updatedPlain);
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

    const settings = await getSettings();
    const adjustmentsMap = await getAllAdjustmentsTotal();
    const { siblingDiscount } = settings;

    // Facturación lazy: cualquier miembro con nextBillingDate <= hoy se
    // pone al día en el momento de la lectura (aunque el server haya dormido)
    for (const member of memberships) {
      await applyBillingIfDue(member, settings);
    }

    res.json(
      memberships.map((m) => {
        const plain = addCategory(toPlain(m));
        const adj = adjustmentsMap[m.id] || 0;
        const discount = (m.familyId && siblingDiscount > 0) ? siblingDiscount : 0;
        plain.deuda = calcDeuda(plain, adj, discount);
        plain.status = statusFromDebt(plain.deuda, settings.monthlyFee);
        plain.totalAdjustments = adj;
        plain.siblingDiscount = discount;
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

    const settings = await getSettings();
    await applyBillingIfDue(member, settings);

    const plain = await enrichMember(toPlain(member));
    const adj = await getAdjustmentsTotal(member.id);
    const discount = (member.familyId && settings.siblingDiscount > 0) ? settings.siblingDiscount : 0;
    plain.deuda = calcDeuda(plain, adj, discount);
    plain.status = statusFromDebt(plain.deuda, settings.monthlyFee);
    plain.totalAdjustments = adj;
    plain.siblingDiscount = discount;
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
  const { clientName, documentType, clientDocument, clientPhone, clientEmail, birthdate, gender, familyId } = req.body;

  if (!clientName && !documentType && !clientDocument && !clientPhone && !clientEmail && !birthdate && !gender && familyId === undefined) {
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
      ...(gender         && { gender }),
      ...(familyId !== undefined && { familyId: familyId || null }),
    });

    await member.reload({ include: fullInclude });
    const plain = await enrichMember(toPlain(member));
    
    const settings = await getSettings();
    const adj = await getAdjustmentsTotal(member.id);
    const discount = (member.familyId && settings.siblingDiscount > 0) ? settings.siblingDiscount : 0;
    
    plain.deuda = calcDeuda(plain, adj, discount);
    plain.status = statusFromDebt(plain.deuda, settings.monthlyFee);
    plain.totalAdjustments = adj;
    plain.siblingDiscount = discount;

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
    await member.destroy(); // cascade borra payments
    res.json(plain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar membresía" });
  }
};