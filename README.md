# Expense Splitter Backend

A robust backend system for splitting expenses between groups of people. This system helps track shared expenses, calculate settlements, and manage group finances efficiently.

## Features

- Expense tracking with detailed information
- Automatic person management
- Settlement calculations with optimized transactions
- Data validation and error handling
- RESTful API endpoints

## Tech Stack

- Node.js with Express
- PostgreSQL database
- Express Validator for input validation
- CORS enabled for cross-origin requests

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DATABASE_URL=your_postgresql_connection_string
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Expense Management

#### List All Expenses
- **GET** `/expenses`
- Returns all expenses with complete details

#### Add New Expense
- **POST** `/expenses`
- Request Body:
  ```json
  {
    "amount": 60.00,
    "description": "Dinner at restaurant",
    "paid_by": "Shantanu",
    "split_type": "equal", // or "percentage", "exact"
    "split_details": {
      "Shantanu": 20,
      "Sanket": 20,
      "Om": 20
    }
  }
  ```

#### Update Expense
- **PUT** `/expenses/:id`
- Updates an existing expense

#### Delete Expense
- **DELETE** `/expenses/:id`
- Removes an expense

### Settlement Calculations

#### Get Settlement Summary
- **GET** `/settlements`
- Returns optimized settlement transactions

#### Get Balances
- **GET** `/balances`
- Shows each person's current balance

#### List All People
- **GET** `/people`
- Returns all people involved in expenses

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error

All error responses follow the format:
```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional additional error details
}
```

## Testing

Run tests using:
```bash
npm test
```

## Deployment

The application is configured for deployment on Railway.app or Render.com. Make sure to set up the environment variables in your deployment platform.

## License

MIT 