const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database with schema
const initializeDatabase = async () => {
  try {
    // Initialize schema
    const schemaPath = path.join(__dirname, 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement separately and handle errors gracefully
    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error) {
        // Ignore errors about existing objects
        if (error.code === '42710' || error.code === '42P07') {
          console.log('Object already exists, skipping:', error.message);
          continue;
        }
        throw error;
      }
    }
    
    console.log('Database schema initialized successfully');

    // Seed initial data
    const seedPath = path.join(__dirname, 'seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    // Split the seed into individual statements
    const seedStatements = seed.split(';').filter(stmt => stmt.trim());
    
    // Execute each seed statement
    for (const statement of seedStatements) {
      try {
        await pool.query(statement);
      } catch (error) {
        console.error('Error executing seed statement:', error);
        // Continue with other statements even if one fails
        continue;
      }
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Helper function to run queries
const query = async (text, params) => {
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
};

// Helper function to get a single row
const getOne = async (text, params) => {
  const res = await query(text, params);
  return res.rows[0];
};

// Helper function to get multiple rows
const getMany = async (text, params) => {
  const res = await query(text, params);
  return res.rows;
};

module.exports = {
  pool,
  query,
  getOne,
  getMany,
  initializeDatabase
}; 