const request = require('supertest');
const app = require('../server');
const db = require('../config/database');

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('API Endpoints', () => {
  beforeAll(async () => {
    // Initialize database before tests
    await db.initializeDatabase();
  });

  afterAll(async () => {
    // Close database connection after tests
    await db.pool.end();
  });

  describe('People Endpoints', () => {
    it('should get all people', async () => {
      const response = await request(app).get('/api/people');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Expense Endpoints', () => {
    let createdExpenseId;

    it('should create a new expense', async () => {
      const expenseData = {
        description: 'Test Expense',
        amount: 100,
        paid_by: 'Test User',
        split_type: 'equal',
        split_details: {
          'Test User': 50,
          'Another User': 50
        }
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expenseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      createdExpenseId = response.body.data.id;
    });

    it('should get all expenses', async () => {
      const response = await request(app).get('/api/expenses');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update an expense', async () => {
      const updateData = {
        description: 'Updated Test Expense',
        amount: 150,
        paid_by: 'Test User',
        split_type: 'equal',
        split_details: {
          'Test User': 75,
          'Another User': 75
        }
      };

      const response = await request(app)
        .put(`/api/expenses/${createdExpenseId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
      expect(Number(response.body.data.amount)).toBe(updateData.amount);
    });

    it('should delete an expense', async () => {
      const response = await request(app)
        .delete(`/api/expenses/${createdExpenseId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Balance Endpoints', () => {
    it('should get current balances', async () => {
      const response = await request(app).get('/api/balances');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data === 'object').toBe(true);
    });
  });

  describe('Settlement Endpoints', () => {
    it('should get settlement summary', async () => {
      const response = await request(app).get('/api/settlements');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('balances');
      expect(response.body.data).toHaveProperty('settlements');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid expense creation', async () => {
      const invalidExpense = {
        description: 'Invalid Expense',
        amount: -100 // Invalid amount
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(invalidExpense);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle non-existent expense', async () => {
      const response = await request(app)
        .get('/api/expenses/999999');

      expect(response.status).toBe(404);
      expect(response.body.success === false || response.body.success === undefined).toBe(true);
    });
  });
}); 