import BillingAdjustment from "../models/billingAdjustment.models.js";
import { MemberShip } from "../models/memberShip.models.js";
import { getSettings, applyBillingIfDue } from "../services/billing.service.js";

// ─── Helper: include estándar ───────────────────────────────────────────────
const fullInclude = [
  { model: MemberShip, as: "membership", attributes: ["id", "clientName", "familyId"] },
];

// ════════════════════════════════════════════════════════════════
// GET: ajustes de un jugador
// ════════════════════════════════════════════════════════════════
export const getAdjustmentsByMember = async (req, res) => {
  try {
    const { memberShipId } = req.params;

    const member = await MemberShip.findByPk(memberShipId);
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    const adjustments = await BillingAdjustment.findAll({
      where: { memberShipId },
      include: [
        { model: MemberShip, as: "membership", attributes: ["id", "clientName", "familyId"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(adjustments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener ajustes" });
  }
};

// ════════════════════════════════════════════════════════════════
// POST: crear ajuste (puede aplicar a hermanos)
// ════════════════════════════════════════════════════════════════
export const createAdjustment = async (req, res) => {
  try {
    const { memberShipId } = req.params;
    const { cycle, amount, type, description, applyToSiblings } = req.body;

    const member = await MemberShip.findByPk(memberShipId);
    if (!member) return res.status(404).json({ message: "Jugador no encontrado" });

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
      return res.status(400).json({ message: "Monto inválido" });
    }

    if (!cycle || !type) {
      return res.status(400).json({ message: "Ciclo y tipo son obligatorios" });
    }

    const settings = await getSettings();

    // Si aplica a hermanos y el jugador tiene familyId
    let membersToAdjust = [member];
    if (applyToSiblings && member.familyId) {
      const siblings = await MemberShip.findAll({
        where: { familyId: member.familyId },
      });
      membersToAdjust = siblings;
    }

    const created = [];

    for (const m of membersToAdjust) {
      // Facturación lazy antes de ajustar
      await applyBillingIfDue(m, settings);

      const adjustment = await BillingAdjustment.create({
        memberShipId: m.id,
        cycle,
        amount: parsedAmount,
        type,
        description: description || null,
        userId: req.user.id,
      });

      created.push({
        memberName: m.clientName,
        familyId: m.familyId,
        adjustment: {
          id: adjustment.id,
          cycle: adjustment.cycle,
          amount: adjustment.amount,
          type: adjustment.type,
          description: adjustment.description,
          createdAt: adjustment.createdAt,
        },
      });
    }

    const msg = membersToAdjust.length > 1
      ? `Ajuste aplicado a ${membersToAdjust.length} hermanos`
      : `Ajuste registrado para ${member.clientName}`;

    return res.json({ message: msg, created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear ajuste" });
  }
};

// ════════════════════════════════════════════════════════════════
// DELETE: eliminar ajuste
// ════════════════════════════════════════════════════════════════
export const deleteAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    const adjustment = await BillingAdjustment.findByPk(id);
    if (!adjustment) return res.status(404).json({ message: "Ajuste no encontrado" });

    await adjustment.destroy();
    return res.json({ message: "Ajuste eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar ajuste" });
  }
};

// ════════════════════════════════════════════════════════════════
// GET: total de ajustes agrupados por jugador (para el dashboard)
// ════════════════════════════════════════════════════════════════
export const getAdjustmentsSummary = async (req, res) => {
  try {
    const { Op } = await import("sequelize");
    const sequelize = (await import("../db.js")).default;

    const results = await BillingAdjustment.findAll({
      attributes: [
        "memberShipId",
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAdjustments"],
      ],
      group: ["memberShipId"],
      raw: true,
    });

    const map = {};
    for (const r of results) {
      map[r.memberShipId] = parseFloat(r.totalAdjustments) || 0;
    }

    return res.json(map);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener resumen de ajustes" });
  }
};