const db = require('../config/database');
const { calculateBalances } = require('../utils/settlementCalculator');

const getBalances = async (req, res) => {
  try {
    // Get all expenses with their splits
    const expenses = await db.getMany(`
      SELECT 
        e.*,
        p.name as paid_by_name,
        json_agg(
          json_build_object(
            'person_id', es.person_id,
            'person_name', p2.name,
            'amount', es.amount
          )
        ) as splits
      FROM expenses e
      JOIN people p ON e.paid_by = p.id
      LEFT JOIN expense_splits es ON e.id = es.expense_id
      LEFT JOIN people p2 ON es.person_id = p2.id
      GROUP BY e.id, p.name
    `);

    // Calculate balances for each person
    const balances = calculateBalances(expenses);

    res.json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error('Error calculating balances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate balances'
    });
  }
};

module.exports = {
  getBalances
}; 