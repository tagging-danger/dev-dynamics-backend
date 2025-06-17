# Expense Splitter Backend

A comprehensive backend system for splitting expenses between groups of people, built with Node.js, Express, and PostgreSQL.

## 🚀 Features

### Core Features
- ✅ **Expense Tracking**: Add, update, delete, and list expenses
- ✅ **Settlement Calculations**: Automatically calculate who owes what to whom
- ✅ **Data Validation**: Comprehensive input validation and error handling
- ✅ **Balance Management**: Track current balances for all users

### Optional Features (Extra Credit)
- ✅ **Expense Categories**: Organize expenses by categories (Food, Travel, Utilities, Entertainment, Other)
- ✅ **Recurring Transactions**: Set up recurring expenses with different frequencies (daily, weekly, monthly, yearly)
- ✅ **Enhanced Analytics**: 
  - Monthly spending summaries
  - Individual spending patterns
  - Top 10 most expensive transactions
  - Category-wise spending analysis
- 🔄 **Web Interface**: Ready for frontend integration

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Validation**: Express-validator
- **Testing**: Jest, Supertest
- **Deployment**: Render

## 📋 API Endpoints

### Core Endpoints

#### People Management
- `GET /api/people` - Get all people
- `POST /api/people` - Add a new person

#### Expense Management
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

#### Balance & Settlement
- `GET /api/balances` - Get current balances
- `GET /api/settlements` - Get settlement summary

### Optional Features Endpoints

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/summary` - Get category summary

#### Recurring Expenses
- `GET /api/recurring-expenses` - Get all recurring expenses
- `POST /api/recurring-expenses` - Create a new recurring expense
- `POST /api/recurring-expenses/process` - Process recurring expenses

#### Analytics
- `GET /api/analytics/monthly` - Monthly spending summary
- `GET /api/analytics/individual` - Individual spending patterns
- `GET /api/analytics/top-expenses` - Top 10 most expensive transactions
- `GET /api/analytics/categories` - Category-wise spending analysis

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd expense-splitter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/expense_splitter
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npm run migrate
   
   # Start the server
   npm start
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

## 📊 Database Schema

### Core Tables
- `people` - Store user information
- `expenses` - Store expense details
- `expense_splits` - Store how expenses are split
- `balances` - Track current balances
- `settlements` - Store settlement transactions

### Optional Features Tables
- `categories` - Expense categories
- `recurring_expenses` - Recurring expense details
- `recurring_expense_splits` - Recurring expense splits

## 🔧 API Usage Examples

### Create an Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 600.00,
    "description": "Dinner at restaurant",
    "paid_by": "Shantanu",
    "split_type": "equal",
    "split_details": {
      "Shantanu": 200,
      "Sanket": 200,
      "Om": 200
    }
  }'
```

### Get Settlement Summary
```bash
curl -X GET http://localhost:3000/api/settlements
```

### Create a Recurring Expense
```bash
curl -X POST http://localhost:3000/api/recurring-expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000.00,
    "description": "Monthly rent",
    "paid_by": "Shantanu",
    "category_id": 1,
    "split_type": "equal",
    "split_details": {
      "Shantanu": 333.33,
      "Sanket": 333.33,
      "Om": 333.34
    },
    "frequency": "monthly",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'
```

### Get Analytics
```bash
# Monthly summary
curl -X GET http://localhost:3000/api/analytics/monthly

# Individual spending
curl -X GET http://localhost:3000/api/analytics/individual

# Top expenses
curl -X GET http://localhost:3000/api/analytics/top-expenses

# Category analysis
curl -X GET http://localhost:3000/api/analytics/categories
```

## 🧪 Testing

The project includes comprehensive tests for all endpoints:

```bash
# Run all tests
npm test

# Test results should show:
# ✓ 9 tests passing
# - People endpoints
# - Expense endpoints (CRUD operations)
# - Balance endpoints
# - Settlement endpoints
# - Error handling
```

## 🚀 Deployment

### Deploy to Render

1. **Connect your GitHub repository to Render**
2. **Set environment variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: production
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

### Deploy to Railway

1. **Connect your GitHub repository to Railway**
2. **Add PostgreSQL service**
3. **Set environment variables**
4. **Deploy automatically**

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js          # Database configuration
│   ├── database.sql         # Database schema
│   ├── seed.sql            # Sample data
│   └── migrations/         # Database migrations
├── controllers/
│   ├── balanceController.js
│   ├── expenseController.js
│   ├── peopleController.js
│   ├── settlementController.js
│   ├── categoryController.js
│   ├── recurringExpenseController.js
│   └── analyticsController.js
├── middleware/
│   └── validateRequest.js
├── routes/
│   ├── balances.js
│   ├── expenses.js
│   ├── people.js
│   ├── settlements.js
│   ├── categories.js
│   ├── recurringExpenses.js
│   └── analytics.js
├── utils/
│   └── settlementCalculator.js
├── tests/
│   └── api.test.js
└── server.js
```

## 🔍 Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

All errors return consistent JSON responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 📈 Performance

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Optimized SQL queries for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test cases for usage examples

---

**Status**: ✅ All core and optional features implemented and tested
**Last Updated**: June 2024
**Version**: 1.0.0 