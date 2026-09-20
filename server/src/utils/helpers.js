const CATEGORIES = ["Rent", "Food", "Transport", "Shopping", "Entertainment", "Bills", "Other"];

function round2(num) {
  return Math.round((Number(num) || 0) * 100) / 100;
}

function round1(num) {
  return Math.round((Number(num) || 0) * 10) / 10;
}

module.exports = {
  CATEGORIES,
  round2,
  round1
};
