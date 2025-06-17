const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Create a single pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'database.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    const schemaStatements = schemaSQL.split(';').filter(stmt => stmt.trim());

    for (const statement of schemaStatements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          // Ignore errors about existing objects
          if (error.code === '42710' || error.code === '42P07' || error.code === '23505') {
            console.log('Object already exists, continuing...');
          } else {
            throw error;
          }
        }
      }
    }

    // Create trigger function
    const triggerFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_balances()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Delete existing balances for this expense
        DELETE FROM balances WHERE expense_id = NEW.id;

        -- Insert new balances for each person in expense_splits
        INSERT INTO balances (person_id, expense_id, amount)
        SELECT
          es.person_id,
          NEW.id,
          CASE WHEN es.person_id = NEW.paid_by THEN NEW.amount ELSE -es.amount END
        FROM expense_splits es
        WHERE es.expense_id = NEW.id;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    try {
      await pool.query(triggerFunctionSQL);
    } catch (error) {
      console.log('Error creating trigger function:', error.message);
    }

    // Create trigger
    const triggerSQL = `
      DROP TRIGGER IF EXISTS expense_balances_trigger ON expenses;
      CREATE TRIGGER expense_balances_trigger
      AFTER INSERT OR UPDATE ON expenses
      FOR EACH ROW
      EXECUTE FUNCTION update_balances();
    `;

    try {
      await pool.query(triggerSQL);
    } catch (error) {
      console.log('Error creating trigger:', error.message);
    }

    // Read and execute seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSQL = await fs.readFile(seedPath, 'utf8');
    const seedStatements = seedSQL.split(';').filter(stmt => stmt.trim());

    for (const statement of seedStatements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          // Ignore errors about duplicate keys
          if (error.code === '23505') {
            console.log('Duplicate key, continuing...');
          } else {
            console.log('Error executing seed statement:', error.message);
          }
        }
      }
    }

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Helper function to run queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// Helper function to get one row
async function getOne(text, params) {
  const res = await query(text, params);
  return res.rows[0];
}

// Helper function to get many rows
async function getMany(text, params) {
  const res = await query(text, params);
  return res.rows;
}

module.exports = {
  pool,
  query,
  getOne,
  getMany,
  initializeDatabase
}; 