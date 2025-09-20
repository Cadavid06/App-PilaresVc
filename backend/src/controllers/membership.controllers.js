import calcularDeuda from "../libs/calculateDebt.js";
import MemberShip from "../models/memberShip.models.js";

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

    const MONTHLY_FEE = 20000;
    const now = new Date();

    const parsedAmount = Number(amount); // 🔹 Asegurar que es número

    if (parsedAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Debe realizar al menos un abono" });
    }
    if (parsedAmount > MONTHLY_FEE) {
      return res.status(400).json({
        message: `El valor máximo de la mensualidad es ${MONTHLY_FEE}`,
      });
    }

    let status = "Pendiente";
    if (parsedAmount === MONTHLY_FEE) status = "Activa";

    const newMemberShip = new MemberShip({
      clientName,
      documentType,
      clientDocument,
      clientPhone,
      clientEmail,
      birthdate,
      status,
      payments: [
        {
          amount: parsedAmount,
          date: now,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      ],
      totalPaid: parsedAmount,
      admin: req.admin.id,
    });

    const saved = await newMemberShip.save();
    res.json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar jugador" });
  }
};

export const getMemberships = async (req, res) => {
  const memberShipsFound = await MemberShip.find().sort({ clientName: 1 });
  if (!memberShipsFound)
    return res.status(404).json({ message: "Membresía no encontrada" });
  res.json(memberShipsFound);
};

export const getMembershipById = async (req, res) => {
  try {
    const member = await MemberShip.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    // Calcula la deuda usando la función corregida
    const deuda = calcularDeuda(member);

    return res.json({
      ...member.toObject(),
      deuda,
    });
  } catch (error) {
    console.error("Error al obtener la membresía:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

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

  if (
    !clientName &&
    !documentType &&
    !clientDocument &&
    !clientPhone &&
    !clientEmail &&
    !birthdate
  ) {
    return res.status(400).json({
      message: "No se enviaron datos válidos para actualizar.",
    });
  }

  try {
    const updatedUser = await MemberShip.findByIdAndUpdate(
      id,
      {
        ...(clientName && { clientName }),
        ...(documentType && { documentType }),
        ...(clientDocument && { clientDocument }),
        ...(clientPhone && { clientPhone }),
        ...(clientEmail && { clientEmail }),
        ...(birthdate && { birthdate }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    res.json({
      message: "Datos del jugador actualizados correctamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el jugador", error });
  }
};

export const renewMembership = async (req, res) => {
  try {
    const { id } = req.params;
    let { amount } = req.body;
    const MONTHLY_FEE = 20000;

    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > MONTHLY_FEE) {
      return res.status(400).json({
        message: "Monto de renovación inválido. Debe ser entre $1 y $20,000",
      });
    }

    const member = await MemberShip.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    if (member.status !== "Expirada") {
      return res.status(400).json({
        message: "No se puede renovar. La membresía no está expirada.",
      });
    }

    const now = new Date();
    const deuda = calcularDeuda(member, now, MONTHLY_FEE);

    if (deuda > 0) {
      return res.status(400).json({
        message: `No puede renovar, aún debe $${deuda} de meses anteriores.`,
      });
    }

    // Borrón y cuenta nueva, si no tiene deuda atrasada.
    // This is the "start of a new cycle" functionality.
    member.payments = [];
    member.totalPaid = 0;

    member.payments.push({
      amount,
      date: now,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    member.totalPaid = amount;
    member.status = amount === MONTHLY_FEE ? "Activa" : "Pendiente";

    await member.save();
    return res.json({
      ...member.toObject(),
      deuda,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al renovar la mensualidad" });
  }
};

export const addPayments = async (req, res) => {
  try {
    let { amount } = req.body;
    const MONTHLY_FEE = 20000;

    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Monto inválido" });
    }

    const member = await MemberShip.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const deudaAtrasada = calcularDeuda(member, now, MONTHLY_FEE);

    // ➡️ NUEVA VALIDACIÓN: Si el jugador está expirado y no tiene deuda pendiente,
    // se debe usar el botón de renovar, no de pagos.
    if (member.status === "Expirada" && deudaAtrasada <= 0) {
      return res.status(400).json({
        message:
          "El jugador debe renovar su membresía, no se pueden agregar pagos.",
      });
    }

    if (deudaAtrasada > 0) {
      // Player has an outstanding debt. The payment must not be greater than the debt.
      if (amount > deudaAtrasada) {
        return res.status(400).json({
          message: `El pago no puede ser mayor a la deuda total ($${deudaAtrasada}).`,
        });
      }
    } else {
      // Player is caught up on past debts. This payment is for the current month.
      const totalPaidThisMonth = member.payments
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

    // Register the payment
    member.payments.push({
      amount,
      date: now,
      month: currentMonth,
      year: currentYear,
    });

    member.totalPaid = (member.totalPaid || 0) + amount;

    // The key change: Update status only if the player was already 'Pendiente'
    // and this payment makes them 'Activa'.
    if (member.status === "Pendiente") {
      const newDebt = calcularDeuda(member, now, MONTHLY_FEE);

      if (newDebt <= 0) {
        const totalPaidThisMonth = member.payments
          .filter((p) => p.month === currentMonth && p.year === currentYear)
          .reduce((sum, p) => sum + p.amount, 0);

        if (totalPaidThisMonth >= MONTHLY_FEE) {
          member.status = "Activa";
        }
      }
    }

    await member.save();
    const deuda = calcularDeuda(member, now, MONTHLY_FEE);
    return res.json({
      ...member.toObject(),
      deuda,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error agregando pago" });
  }
};

export const deleteMembership = async (req, res) => {
  const memberShipFound = await MemberShip.findByIdAndDelete(req.params.id);
  if (!memberShipFound)
    return res.status(404).json({ message: "Membresía no encontrada" });
  res.json(memberShipFound);
};
