# Expense Splitter Backend

A robust backend system for splitting expenses between groups of people. This system helps track shared expenses, calculate settlements, and manage group finances efficiently.

## Features

### Core Features
- ✅ Expense tracking with detailed information
- ✅ Automatic person management
- ✅ Settlement calculations with optimized transactions
- ✅ Data validation and error handling
- ✅ RESTful API endpoints

### Optional Features (Coming Soon)
- 🔜 User authentication
- 🔜 Multiple groups support
- 🔜 Expense categories
- 🔜 Recurring expenses
- 🔜 Export functionality

## Tech Stack

- Node.js with Express
- PostgreSQL database
- Express Validator for input validation
- CORS enabled for cross-origin requests

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/tagging-danger/dev-dynamics-backend.git
   cd dev-dynamics-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Base URL
```
https://dev-dynamics-backend-1.onrender.com
```

### Authentication
Currently, the API is public and doesn't require authentication.

### Endpoints

#### People Management

##### List All People
- **GET** `/api/people`
- Returns all people involved in expenses
- Response:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Shantanu",
        "created_at": "2025-06-16T23:09:55.732Z"
      }
    ]
  }
  ```

#### Expense Management

##### List All Expenses
- **GET** `/api/expenses`
- Returns all expenses with complete details
- Response:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "amount": "600.00",
        "description": "Dinner at restaurant",
        "paid_by": 1,
        "split_type": "equal",
        "created_at": "2025-06-16T23:09:55.733Z",
        "updated_at": "2025-06-16T23:09:55.733Z",
        "paid_by_name": "Shantanu",
        "splits": [
          {
            "person_id": 1,
            "person_name": "Shantanu",
            "amount": 200
          }
        ]
      }
    ]
  }
  ```

##### Add New Expense
- **POST** `/api/expenses`
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

##### Update Expense
- **PUT** `/api/expenses/:id`
- Updates an existing expense
- Request Body: Same as Add New Expense

##### Delete Expense
- **DELETE** `/api/expenses/:id`
- Removes an expense

#### Settlement Calculations

##### Get Current Balances
- **GET** `/api/balances`
- Shows each person's current balance
- Response:
  ```json
  {
    "success": true,
    "data": {
      "Shantanu": 400,
      "Sanket": -200,
      "Om": -200
    }
  }
  ```

##### Get Settlement Summary
- **GET** `/api/settlements`
- Returns optimized settlement transactions
- Response:
  ```json
  {
    "success": true,
    "data": {
      "balances": {
        "Shantanu": 400,
        "Sanket": -200,
        "Om": -200
      },
      "settlements": [
        {
          "from": "Sanket",
          "to": "Shantanu",
          "amount": 200
        },
        {
          "from": "Om",
          "to": "Shantanu",
          "amount": 200
        }
      ]
    }
  }
  ```

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
  "details": {} // Only in development mode
}
```

## Testing

### Using Postman
1. Import the provided Postman collection (`expense_splitter.postman_collection.json`)
2. Set the environment variable `base_url` to `https://dev-dynamics-backend-1.onrender.com`
3. Run the collection to test all endpoints

### Using cURL
Example requests are provided in the API documentation above.

## Deployment

The application is deployed on Render:
- Backend URL: https://dev-dynamics-backend-1.onrender.com
- Database: PostgreSQL on Railway

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 