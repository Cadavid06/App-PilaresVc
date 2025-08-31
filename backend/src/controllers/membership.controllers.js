import MemberShip from "../models/memberShip.models.js";
import MembershipHistory from "../models/membershipHistory.modal.js";
import MemberShipType from "../models/memberShipType.models.js";

export const createMemberShipTypes = async (req, res) => {
  const { type, durationInDays, price } = req.body;

  const newMemberShipType = new MemberShipType({
    type,
    durationInDays,
    price,
  });
  const MemberShipTypeSaved = newMemberShipType.save();
  res.json(MemberShipTypeSaved);
};

export const createMembership = async (req, res) => {
  try {
    const { clientName, clientDocument, clientPhone, memberShipType, amount } =
      req.body;

    const type = await MemberShipType.findById(memberShipType);
    if (!type)
      return res
        .status(404)
        .json({ message: "Tipo de membresía no encontrada" });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + type.durationInDays);

    const status = "Activa";

    if (amount <= 0)
      return res.status(404).json({
        message: "La cantidad no puede ser menor o igual a 0",
      });

    if (amount > type.price)
      return res.status(400).json({
        message: `La cantidad excede el valor total de la membresía: ${type.price}`,
      });

    const totalPaid = amount;

    const paymentDate = new Date();

    const newMemberShip = new MemberShip({
      clientName,
      clientDocument,
      clientPhone,
      memberShipType,
      startDate,
      endDate,
      status,
      payments: [
        {
          amount,
          date: paymentDate,
        },
      ],
      totalPaid,
      admin: req.admin.id,
    });
    const MemberShipSaved = await newMemberShip.save();
    res.json(MemberShipSaved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la membresía" });
  }
};

export const getMemberships = async (req, res) => {
  const memberShipsFound = await MemberShip.find()
    .populate("memberShipType")
    .sort({ clientName: 1 });
  if (!memberShipsFound)
    return res.status(404).json({ message: "Membresía no encontrada" });
  res.json(memberShipsFound);
};

export const getMembershipById = async (req, res) => {
  const memberShipFound = await MemberShip.findById(req.params.id).populate(
    "memberShipType"
  );
  if (!memberShipFound)
    return res.status(404).json({ message: "Membresía no encontrada" });
  res.json(memberShipFound);
};

export const getDaysLeft = async (req, res) => {
  const memberShipFound = await MemberShip.findById(req.params.id);
  if (!memberShipFound)
    return res.status(404).json({ message: "Membresía no encontrada" });

  const today = new Date();
  const endDate = memberShipFound.endDate;
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  if (today > endDate) {
    memberShipFound.status = "Expirada";
  }

  await memberShipFound.save();

  res.json({
    daysLeft,
  });
};

export const updateUserData = async (req, res) => {
  const { id } = req.params; 
  const { clientName, clientDocument, clientPhone } = req.body;

  if (!clientName && !clientDocument && !clientPhone) {
    return res.status(400).json({
      message:
        "No se permite cambiar el tipo de membresía. Utilice el apartado de renovación.",
    });
  }

  try {
    const updatedUser = await MemberShip.findByIdAndUpdate(
      id,
      {
        ...(clientName && { clientName }),
        ...(clientDocument && { clientDocument }),
        ...(clientPhone && { clientPhone }),
      },
      { new: true }
    )
    .populate('memberShipType'); // ¡Agrega esta línea!

    if (!updatedUser) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json({
      message: "Datos del cliente actualizados correctamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el cliente", error });
  }
};

export const renewMembership = async (req, res) => {
  const { memberShipType, amount } = req.body;

  const memberShipFound = await MemberShip.findById(req.params.id);
  if (!memberShipFound)
    return res.status(404).json({ message: "Membresía no encontrada" });

  const status = memberShipFound.status;
  if (status === "Activa")
    return res.status(404).json({
      message: "La membresía se encuentra activa",
    });

  const type = await MemberShipType.findById(memberShipType);
  if (!type)
    return res.status(404).json({ message: "Tipo de menbresía no encontrada" });

  if (amount <= 0)
    return res.status(404).json({
      message: "El importe no puede ser menor o igual a 0",
    });

  if (amount > type.price)
    return res.status(404).json({
      message: `La cantidad excede el valor total de la membresía: ${type.price}`,
    });

  await MembershipHistory.create({
    id: memberShipFound._id,
    type: memberShipType,
    payments: memberShipFound.payments,
  });

  memberShipFound.memberShipType = memberShipType;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + type.durationInDays);

  memberShipFound.startDate = startDate;
  memberShipFound.endDate = endDate;
  memberShipFound.status = "Activa";

  memberShipFound.payments = [{ amount, date: new Date() }];
  memberShipFound.totalPaid = amount;

  await memberShipFound.save();

  const updatedMembership = await MemberShip.findById(
    memberShipFound._id
  ).populate("memberShipType");

  res.json(updatedMembership);
};

export const addPayments = async (req, res) => {
  const { amount } = req.body;

  const memberShipFound = await MemberShip.findById(req.params.id).populate(
    "memberShipType"
  );
  if (!memberShipFound)
    return res.status(404).json({ message: "Membresía no encontrada" });

  const priceMemberShip = memberShipFound.memberShipType.price;

  if (
    memberShipFound.totalPaid === priceMemberShip &&
    memberShipFound.status === "Activa"
  )
    return res.status(404).json({
      message: "El pago mensual ya está cancelado en su totalidad.",
    });

  if (amount <= 0)
    return res.status(404).json({
      message: "La cantidad no puede ser menor o igual a 0",
    });
  const newTotal = memberShipFound.totalPaid + amount;
  if (amount > priceMemberShip - memberShipFound.totalPaid)
    return res.status(404).json({
      message: `La cantidad excede el valor total de la membresía: ${priceMemberShip}`,
    });

  memberShipFound.payments.push({ amount });

  memberShipFound.totalPaid = memberShipFound.payments.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  await memberShipFound.save();
  res.json(memberShipFound);
};

export const deleteMembership = async (req, res) => {
  const memberShipFound = await MemberShip.findByIdAndDelete(req.params.id);
  if (!memberShipFound)
    return res.status(404).json({ message: "Membresía no encontrada" });
  res.json(memberShipFound);
};
