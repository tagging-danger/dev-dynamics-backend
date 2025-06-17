const db = require('../config/database');
const { calculateSettlements } = require('../utils/settlementCalculator');

// Get all expenses with their splits
const getAllExpenses = async (req, res) => {
  try {
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
      ORDER BY e.created_at DESC
    `);

    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expenses'
    });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  const { amount, description, paid_by, split_type = 'equal', split_details } = req.body;
  
  try {
    // Start transaction
    await db.query('BEGIN');

    // Get or create person who paid
    const paidByPerson = await db.getOne(
      'INSERT INTO people (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
      [paid_by]
    );

    // Create expense
    const expense = await db.getOne(
      'INSERT INTO expenses (amount, description, paid_by, split_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [amount, description, paidByPerson.id, split_type]
    );

    // Handle split details
    let finalSplitDetails = split_details;
    
    // If no split_details provided, automatically split equally among all people
    if (!split_details) {
      // Get all people from the database
      const allPeople = await db.getMany('SELECT id, name FROM people ORDER BY name');
      
      if (allPeople.length === 0) {
        // If no people exist, just add the person who paid
        finalSplitDetails = { [paid_by]: amount };
      } else {
        // Split equally among all people
        const splitAmount = amount / allPeople.length;
        finalSplitDetails = {};
        
        allPeople.forEach((person, index) => {
          // Handle rounding for the last person
          if (index === allPeople.length - 1) {
            finalSplitDetails[person.name] = amount - (splitAmount * (allPeople.length - 1));
          } else {
            finalSplitDetails[person.name] = splitAmount;
          }
        });
      }
    }

    // Create expense splits
    for (const [personName, splitAmount] of Object.entries(finalSplitDetails)) {
      const person = await db.getOne(
        'INSERT INTO people (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [personName]
      );

      await db.query(
        'INSERT INTO expense_splits (expense_id, person_id, amount) VALUES ($1, $2, $3)',
        [expense.id, person.id, splitAmount]
      );
    }

    await db.query('COMMIT');

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense added successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create expense'
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, description, paid_by, split_type = 'equal', split_details } = req.body;

  try {
    await db.query('BEGIN');

    // Get or create person who paid
    const paidByPerson = await db.getOne(
      'INSERT INTO people (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
      [paid_by]
    );

    // Update expense
    const expense = await db.getOne(
      'UPDATE expenses SET amount = $1, description = $2, paid_by = $3, split_type = $4 WHERE id = $5 RETURNING *',
      [amount, description, paidByPerson.id, split_type, id]
    );

    if (!expense) {
      await db.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    // Delete existing splits
    await db.query('DELETE FROM expense_splits WHERE expense_id = $1', [id]);

    // Handle split details
    let finalSplitDetails = split_details;
    
    // If no split_details provided, automatically split equally among all people
    if (!split_details) {
      // Get all people from the database
      const allPeople = await db.getMany('SELECT id, name FROM people ORDER BY name');
      
      if (allPeople.length === 0) {
        // If no people exist, just add the person who paid
        finalSplitDetails = { [paid_by]: amount };
      } else {
        // Split equally among all people
        const splitAmount = amount / allPeople.length;
        finalSplitDetails = {};
        
        allPeople.forEach((person, index) => {
          // Handle rounding for the last person
          if (index === allPeople.length - 1) {
            finalSplitDetails[person.name] = amount - (splitAmount * (allPeople.length - 1));
          } else {
            finalSplitDetails[person.name] = splitAmount;
          }
        });
      }
    }

    // Create new splits
    for (const [personName, splitAmount] of Object.entries(finalSplitDetails)) {
      const person = await db.getOne(
        'INSERT INTO people (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [personName]
      );

      await db.query(
        'INSERT INTO expense_splits (expense_id, person_id, amount) VALUES ($1, $2, $3)',
        [id, person.id, splitAmount]
      );
    }

    await db.query('COMMIT');

    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update expense'
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete expense'
    });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense
}; 