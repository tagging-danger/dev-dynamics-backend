const db = require('../config/database');

// Get all recurring expenses
const getAllRecurringExpenses = async (req, res) => {
  try {
    const expenses = await db.getMany(`
      SELECT 
        re.*,
        p.name as paid_by_name,
        c.name as category_name,
        json_agg(
          json_build_object(
            'person_id', res.person_id,
            'person_name', p2.name,
            'amount', res.amount
          )
        ) as splits
      FROM recurring_expenses re
      JOIN people p ON re.paid_by = p.id
      LEFT JOIN categories c ON re.category_id = c.id
      LEFT JOIN recurring_expense_splits res ON re.id = res.recurring_expense_id
      LEFT JOIN people p2 ON res.person_id = p2.id
      GROUP BY re.id, p.name, c.name
      ORDER BY re.created_at DESC
    `);

    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Error getting recurring expenses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recurring expenses'
    });
  }
};

// Create new recurring expense
const createRecurringExpense = async (req, res) => {
  const { amount, description, paid_by, category_id, split_type, split_details, frequency, start_date, end_date } = req.body;
  
  try {
    await db.query('BEGIN');

    // Get or create person who paid
    const paidByPerson = await db.getOne(
      'INSERT INTO people (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
      [paid_by]
    );

    // Create recurring expense
    const expense = await db.getOne(
      `INSERT INTO recurring_expenses 
        (amount, description, paid_by, category_id, split_type, frequency, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [amount, description, paidByPerson.id, category_id, split_type, frequency, start_date, end_date]
    );

    // Create recurring expense splits
    for (const [personName, splitAmount] of Object.entries(split_details)) {
      const person = await db.getOne(
        'INSERT INTO people (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [personName]
      );

      await db.query(
        'INSERT INTO recurring_expense_splits (recurring_expense_id, person_id, amount) VALUES ($1, $2, $3)',
        [expense.id, person.id, splitAmount]
      );
    }

    await db.query('COMMIT');

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Recurring expense added successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating recurring expense:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create recurring expense'
    });
  }
};

// Process recurring expenses
const processRecurringExpenses = async (req, res) => {
  try {
    const today = new Date();
    const expenses = await db.getMany(`
      SELECT * FROM recurring_expenses 
      WHERE (end_date IS NULL OR end_date >= $1)
      AND (last_processed IS NULL OR 
           (frequency = 'daily' AND last_processed < $1) OR
           (frequency = 'weekly' AND last_processed < $1 - interval '7 days') OR
           (frequency = 'monthly' AND last_processed < $1 - interval '1 month') OR
           (frequency = 'yearly' AND last_processed < $1 - interval '1 year'))
    `, [today]);

    const processed = [];
    for (const expense of expenses) {
      await db.query('BEGIN');

      // Create regular expense from recurring expense
      const newExpense = await db.getOne(
        `INSERT INTO expenses (amount, description, paid_by, category_id, split_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [expense.amount, expense.description, expense.paid_by, expense.category_id, expense.split_type]
      );

      // Copy splits
      const splits = await db.getMany(
        'SELECT * FROM recurring_expense_splits WHERE recurring_expense_id = $1',
        [expense.id]
      );

      for (const split of splits) {
        await db.query(
          'INSERT INTO expense_splits (expense_id, person_id, amount) VALUES ($1, $2, $3)',
          [newExpense.id, split.person_id, split.amount]
        );
      }

      // Update last processed date
      await db.query(
        'UPDATE recurring_expenses SET last_processed = $1 WHERE id = $2',
        [today, expense.id]
      );

      await db.query('COMMIT');
      processed.push(newExpense);
    }

    res.json({
      success: true,
      data: processed,
      message: `Processed ${processed.length} recurring expenses`
    });
  } catch (error) {
    console.error('Error processing recurring expenses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process recurring expenses'
    });
  }
};

module.exports = {
  getAllRecurringExpenses,
  createRecurringExpense,
  processRecurringExpenses
}; 