import Setting from "../models/settings.models.js";
import { getSettings, SETTINGS_ID } from "../services/billing.service.js";

const parsePositiveFee = (value, fallback) => {
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
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
    const monthlyFee = parsePositiveFee(req.body.monthlyFee, current.monthlyFee);
    const inscriptionFee = parsePositiveFee(req.body.inscriptionFee, current.inscriptionFee);
    const reactivationFee = parsePositiveFee(req.body.reactivationFee, current.reactivationFee);

    const [setting] = await Setting.findOrCreate({
      where: { id: SETTINGS_ID },
      defaults: current,
    });

    await setting.update({
      monthlyFee,
      inscriptionFee,
      reactivationFee,
      updatedBy: req.user.id,
    });

    res.json({
      monthlyFee: setting.monthlyFee,
      inscriptionFee: setting.inscriptionFee,
      reactivationFee: setting.reactivationFee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la configuración" });
  }
};