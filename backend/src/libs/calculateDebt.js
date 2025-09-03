// backend/utils/calcularDeuda.js
const MONTHLY_FEE = 20000;

function calcularDeuda(member) {
  const payments = member.payments || [];
  const totalPaid = member.totalPaid || 0;
  const now = new Date();

  // Si no hay pagos, la fecha de referencia es la fecha de creación de la membresía
  const referenceDate = payments.length > 0
    ? new Date(payments[0].date)
    : new Date(member.createdAt);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refYear = referenceDate.getFullYear();

  // Calcula los meses completos que han pasado, redondeando hacia arriba
  let monthsPassed = (currentYear - refYear) * 12 + (currentMonth - refMonth);
  if (now.getDate() > referenceDate.getDate()) {
    monthsPassed++;
  }
  
  // Si el mes de creación no ha terminado, el total esperado es la cuota mensual
  if (monthsPassed === 0) {
    monthsPassed = 1;
  }

  const totalExpectedPayment = monthsPassed * MONTHLY_FEE;
  const debt = Math.max(0, totalExpectedPayment - totalPaid);

  return debt;
}

export default calcularDeuda;