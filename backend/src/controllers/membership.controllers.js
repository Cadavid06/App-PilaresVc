import { MemberShip, Payment } from "../models/memberShip.models.js";
import calcularDeuda from "../libs/calculateDebt.js";

const MONTHLY_FEE = 20000;

// ─── Helper: convierte una instancia Sequelize a objeto plano ─────────────
// Equivalente a .toObject() de Mongoose
const toPlain = (member) => {
  const plain = member.get({ plain: true });
  return plain;
};

// ─── Crear membresía ──────────────────────────────────────────────────────
export const createMembership = async (req, res) => {
  try {
    const {
      clientName,
      documentType,
      clientDocument,
      clientPhone,
      clientEmail,
      birthdate,
      amount,
    } = req.body;

    const now = new Date();
    const parsedAmount = Number(amount);

    if (parsedAmount <= 0) {
      return res.status(400).json({ message: "Debe realizar al menos un abono" });
    }
    if (parsedAmount > MONTHLY_FEE) {
      return res.status(400).json({
        message: `El valor máximo de la mensualidad es ${MONTHLY_FEE}`,
      });
    }

    const status = parsedAmount === MONTHLY_FEE ? "Activa" : "Pendiente";

    // Crear la membresía en la tabla memberships
    const newMemberShip = await MemberShip.create({
      clientName,
      documentType,
      clientDocument,
      clientPhone,
      clientEmail,
      birthdate,
      status,
      totalPaid: parsedAmount,
      adminId: req.admin.id,
    });

    // Crear el primer pago en la tabla payments
    await Payment.create({
      amount: parsedAmount,
      date: now,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      memberShipId: newMemberShip.id,
    });

    // Devolver la membresía con sus pagos incluidos
    const saved = await MemberShip.findByPk(newMemberShip.id, {
      include: [{ model: Payment, as: "payments" }],
    });

    res.json(toPlain(saved));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar jugador" });
  }
};

// ─── Obtener todas las membresías ─────────────────────────────────────────
export const getMemberships = async (req, res) => {
  try {
    const memberships = await MemberShip.findAll({
      include: [{ model: Payment, as: "payments" }],
      order: [["clientName", "ASC"]],
    });

    if (!memberships) {
      return res.status(404).json({ message: "Membresías no encontradas" });
    }

    res.json(memberships.map(toPlain));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener membresías" });
  }
};

// ─── Obtener membresía por ID ─────────────────────────────────────────────
export const getMembershipById = async (req, res) => {
  try {
    // findByPk() reemplaza a findById()
    const member = await MemberShip.findByPk(req.params.id, {
      include: [{ model: Payment, as: "payments" }],
    });

    if (!member) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    const plain = toPlain(member);
    const deuda = calcularDeuda(plain);

    return res.json({ ...plain, deuda });
  } catch (error) {
    console.error("Error al obtener la membresía:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

// ─── Actualizar datos del jugador ─────────────────────────────────────────
export const updateUserData = async (req, res) => {
  const { id } = req.params;
  const {
    clientName,
    documentType,
    clientDocument,
    clientPhone,
    clientEmail,
    birthdate,
  } = req.body;

  if (!clientName && !documentType && !clientDocument && !clientPhone && !clientEmail && !birthdate) {
    return res.status(400).json({ message: "No se enviaron datos válidos para actualizar." });
  }

  try {
    const member = await MemberShip.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    // Sequelize: update() con objeto de campos a cambiar
    await member.update({
      ...(clientName && { clientName }),
      ...(documentType && { documentType }),
      ...(clientDocument && { clientDocument }),
      ...(clientPhone && { clientPhone }),
      ...(clientEmail && { clientEmail }),
      ...(birthdate && { birthdate }),
    });

    // Recargar con pagos para devolver objeto completo
    await member.reload({ include: [{ model: Payment, as: "payments" }] });

    res.json({
      message: "Datos del jugador actualizados correctamente",
      user: toPlain(member),
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el jugador", error });
  }
};

// ─── Renovar membresía ────────────────────────────────────────────────────
export const renewMembership = async (req, res) => {
  try {
    const { id } = req.params;
    let { amount } = req.body;

    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > MONTHLY_FEE) {
      return res.status(400).json({
        message: "Monto de renovación inválido. Debe ser entre $1 y $20,000",
      });
    }

    const member = await MemberShip.findByPk(id, {
      include: [{ model: Payment, as: "payments" }],
    });

    if (!member) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    if (member.status !== "Expirada") {
      return res.status(400).json({
        message: "No se puede renovar. La membresía no está expirada.",
      });
    }

    const now = new Date();
    const deuda = calcularDeuda(toPlain(member), now, MONTHLY_FEE);

    if (deuda > 0) {
      return res.status(400).json({
        message: `No puede renovar, aún debe $${deuda} de meses anteriores.`,
      });
    }

    // Borrar todos los pagos anteriores (borrón y cuenta nueva)
    await Payment.destroy({ where: { memberShipId: id } });

    // Crear el nuevo pago
    await Payment.create({
      amount,
      date: now,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      memberShipId: id,
    });

    const newStatus = amount === MONTHLY_FEE ? "Activa" : "Pendiente";

    await member.update({
      totalPaid: amount,
      status: newStatus,
    });

    await member.reload({ include: [{ model: Payment, as: "payments" }] });

    const plain = toPlain(member);
    return res.json({ ...plain, deuda: 0 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al renovar la mensualidad" });
  }
};

// ─── Agregar pago ─────────────────────────────────────────────────────────
export const addPayments = async (req, res) => {
  try {
    let { amount } = req.body;

    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Monto inválido" });
    }

    const member = await MemberShip.findByPk(req.params.id, {
      include: [{ model: Payment, as: "payments" }],
    });

    if (!member) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const plain = toPlain(member);
    const deudaAtrasada = calcularDeuda(plain, now, MONTHLY_FEE);

    if (member.status === "Expirada" && deudaAtrasada <= 0) {
      return res.status(400).json({
        message: "El jugador debe renovar su membresía, no se pueden agregar pagos.",
      });
    }

    if (deudaAtrasada > 0) {
      if (amount > deudaAtrasada) {
        return res.status(400).json({
          message: `El pago no puede ser mayor a la deuda total ($${deudaAtrasada}).`,
        });
      }
    } else {
      const totalPaidThisMonth = plain.payments
        .filter((p) => p.month === currentMonth && p.year === currentYear)
        .reduce((sum, p) => sum + p.amount, 0);

      const remainingThisMonth = MONTHLY_FEE - totalPaidThisMonth;

      if (remainingThisMonth <= 0) {
        return res.status(400).json({
          message: "La mensualidad del mes actual ya ha sido cubierta.",
        });
      }

      if (amount > remainingThisMonth) {
        return res.status(400).json({
          message: `El pago no puede ser mayor a la cantidad restante para el mes actual ($${remainingThisMonth}).`,
        });
      }
    }

    // Registrar el pago
    await Payment.create({
      amount,
      date: now,
      month: currentMonth,
      year: currentYear,
      memberShipId: member.id,
    });

    const newTotalPaid = (member.totalPaid || 0) + amount;

    // Recargar pagos para recalcular estado
    await member.reload({ include: [{ model: Payment, as: "payments" }] });
    const updatedPlain = toPlain(member);

    let newStatus = member.status;
    if (member.status === "Pendiente") {
      const newDebt = calcularDeuda(updatedPlain, now, MONTHLY_FEE);
      if (newDebt <= 0) {
        const totalPaidThisMonth = updatedPlain.payments
          .filter((p) => p.month === currentMonth && p.year === currentYear)
          .reduce((sum, p) => sum + p.amount, 0);
        if (totalPaidThisMonth >= MONTHLY_FEE) {
          newStatus = "Activa";
        }
      }
    }

    await member.update({ totalPaid: newTotalPaid, status: newStatus });
    await member.reload({ include: [{ model: Payment, as: "payments" }] });

    const finalPlain = toPlain(member);
    const deuda = calcularDeuda(finalPlain, now, MONTHLY_FEE);

    return res.json({ ...finalPlain, deuda });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error agregando pago" });
  }
};

// ─── Eliminar membresía ───────────────────────────────────────────────────
export const deleteMembership = async (req, res) => {
  try {
    const member = await MemberShip.findByPk(req.params.id, {
      include: [{ model: Payment, as: "payments" }],
    });

    if (!member) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    const plain = toPlain(member);

    // Los pagos se eliminan en cascada gracias a onDelete: 'CASCADE' en el modelo
    await member.destroy();

    res.json(plain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar membresía" });
  }
};
