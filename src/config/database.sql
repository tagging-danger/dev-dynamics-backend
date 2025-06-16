-- Create people table
CREATE TABLE IF NOT EXISTS people (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    paid_by INTEGER REFERENCES people(id),
    split_type VARCHAR(20) NOT NULL CHECK (split_type IN ('equal', 'percentage', 'exact')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create expense_splits table for detailed split information
CREATE TABLE IF NOT EXISTS expense_splits (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES people(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create balances table
CREATE TABLE IF NOT EXISTS balances (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id),
    expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create settlements table
CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY,
    from_person_id INTEGER REFERENCES people(id),
    to_person_id INTEGER REFERENCES people(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_person_id ON expense_splits(person_id);
CREATE INDEX IF NOT EXISTS idx_balances_person_id ON balances(person_id);
CREATE INDEX IF NOT EXISTS idx_balances_expense_id ON balances(expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_from_person ON settlements(from_person_id);
CREATE INDEX IF NOT EXISTS idx_settlements_to_person ON settlements(to_person_id); 