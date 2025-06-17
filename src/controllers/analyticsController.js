const db = require('../config/database');

// Get monthly spending summary
const getMonthlySummary = async (req, res) => {
  try {
    const summary = await db.getMany(`
      SELECT 
        DATE_TRUNC('month', e.created_at) as month,
        COUNT(e.id) as expense_count,
        SUM(e.amount) as total_amount,
        AVG(e.amount) as average_amount
      FROM expenses e
      GROUP BY DATE_TRUNC('month', e.created_at)
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting monthly summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monthly summary'
    });
  }
};

// Get individual spending patterns
const getIndividualSpending = async (req, res) => {
  try {
    const patterns = await db.getMany(`
      SELECT 
        p.name as person,
        COUNT(e.id) as expense_count,
        SUM(e.amount) as total_spent,
        AVG(e.amount) as average_spent,
        COUNT(DISTINCT e.category_id) as categories_used
      FROM people p
      LEFT JOIN expenses e ON p.id = e.paid_by
      GROUP BY p.id, p.name
      ORDER BY total_spent DESC NULLS LAST
    `);

    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Error getting individual spending:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get individual spending'
    });
  }
};

// Get most expensive transactions
const getMostExpensiveTransactions = async (req, res) => {
  try {
    const transactions = await db.getMany(`
      SELECT 
        e.id,
        e.amount,
        e.description,
        p.name as paid_by,
        c.name as category,
        e.created_at
      FROM expenses e
      JOIN people p ON e.paid_by = p.id
      LEFT JOIN categories c ON e.category_id = c.id
      ORDER BY e.amount DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error getting most expensive transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get most expensive transactions'
    });
  }
};

// Get category-wise spending patterns
const getCategorySpending = async (req, res) => {
  try {
    const patterns = await db.getMany(`
      SELECT 
        c.name as category,
        COUNT(e.id) as expense_count,
        SUM(e.amount) as total_amount,
        AVG(e.amount) as average_amount,
        MAX(e.amount) as highest_amount,
        MIN(e.amount) as lowest_amount
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
      GROUP BY c.id, c.name
      ORDER BY total_amount DESC NULLS LAST
    `);

    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Error getting category spending:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get category spending'
    });
  }
};

module.exports = {
  getMonthlySummary,
  getIndividualSpending,
  getMostExpensiveTransactions,
  getCategorySpending
}; 