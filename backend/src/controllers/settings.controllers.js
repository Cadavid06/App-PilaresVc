import Setting from "../models/settings.models.js";
import { getSettings } from "../services/billing.service.js";

const parseNonNegativeFee = (value, fallback) => {
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
};

export const getSettingsController = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la configuración" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const current = await getSettings();
    const monthlyFee = parseNonNegativeFee(req.body.monthlyFee, current.monthlyFee);
    const inscriptionFee = parseNonNegativeFee(req.body.inscriptionFee, current.inscriptionFee);
    const reactivationFee = parseNonNegativeFee(req.body.reactivationFee, current.reactivationFee);
    const defaultSiblingDiscount = parseNonNegativeFee(req.body.defaultSiblingDiscount, current.defaultSiblingDiscount);

    const [setting] = await Setting.findOrCreate({
      where: { id: 1 },
      defaults: current,
    });

    await setting.update({
      monthlyFee,
      inscriptionFee,
      reactivationFee,
      defaultSiblingDiscount,
      updatedBy: req.user.id,
    });

    res.json({
      monthlyFee: setting.monthlyFee,
      inscriptionFee: setting.inscriptionFee,
      reactivationFee: setting.reactivationFee,
      defaultSiblingDiscount: setting.defaultSiblingDiscount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la configuración" });
  }
};
