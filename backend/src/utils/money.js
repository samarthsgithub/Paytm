// Balances are stored as integer paise so arithmetic is exact (no floating point drift).
const toPaise = (rupees) => Math.round(rupees * 100);
const toRupees = (paise) => paise / 100;

module.exports = { toPaise, toRupees };
