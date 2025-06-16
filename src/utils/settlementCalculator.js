// Calculate settlements between people
const calculateSettlements = (balances) => {
  // Convert balances to array of [person, amount] pairs
  const balanceArray = Object.entries(balances).map(([person, amount]) => ({
    person,
    amount: parseFloat(amount)
  }));

  // Separate debtors and creditors
  const debtors = balanceArray.filter(b => b.amount < 0).sort((a, b) => a.amount - b.amount);
  const creditors = balanceArray.filter(b => b.amount > 0).sort((a, b) => b.amount - a.amount);

  const settlements = [];

  // Process each debtor
  for (const debtor of debtors) {
    let remainingDebt = Math.abs(debtor.amount);

    // Try to settle with each creditor
    for (const creditor of creditors) {
      if (remainingDebt === 0 || creditor.amount === 0) continue;

      const settlementAmount = Math.min(remainingDebt, creditor.amount);
      
      if (settlementAmount > 0) {
        settlements.push({
          from: debtor.person,
          to: creditor.person,
          amount: settlementAmount
        });

        remainingDebt -= settlementAmount;
        creditor.amount -= settlementAmount;
      }
    }
  }

  return settlements;
};

// Calculate balances for each person
const calculateBalances = (expenses) => {
  const balances = {};

  // Initialize balances for all people
  expenses.forEach(expense => {
    if (!balances[expense.paid_by_name]) {
      balances[expense.paid_by_name] = 0;
    }
    expense.splits.forEach(split => {
      if (!balances[split.person_name]) {
        balances[split.person_name] = 0;
      }
    });
  });

  // Calculate net balances
  expenses.forEach(expense => {
    // Add amount paid to payer's balance
    balances[expense.paid_by_name] += parseFloat(expense.amount);

    // Subtract split amounts from each person's balance
    expense.splits.forEach(split => {
      balances[split.person_name] -= parseFloat(split.amount);
    });
  });

  return balances;
};

module.exports = {
  calculateSettlements,
  calculateBalances
}; 