-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id to expenses table if not exists
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);

-- Create recurring_expenses table if not exists
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    paid_by INTEGER REFERENCES people(id) NOT NULL,
    category_id INTEGER REFERENCES categories(id) NOT NULL,
    split_type VARCHAR(20) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    last_processed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to recurring_expenses if table already exists
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) NOT NULL DEFAULT 'monthly';
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS last_processed_date DATE;

-- Create recurring_expense_splits table
CREATE TABLE IF NOT EXISTS recurring_expense_splits (
    id SERIAL PRIMARY KEY,
    recurring_expense_id INTEGER REFERENCES recurring_expenses(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recurring_expense_id, person_id)
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
    ('Food'),
    ('Travel'),
    ('Utilities'),
    ('Entertainment'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

-- Create indexes (after columns are ensured)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'expenses' AND indexname = 'idx_expenses_category') THEN
        CREATE INDEX idx_expenses_category ON expenses(category_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'recurring_expenses' AND indexname = 'idx_recurring_expenses_category') THEN
        CREATE INDEX idx_recurring_expenses_category ON recurring_expenses(category_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'recurring_expenses' AND indexname = 'idx_recurring_expenses_frequency') THEN
        CREATE INDEX idx_recurring_expenses_frequency ON recurring_expenses(frequency);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'recurring_expenses' AND indexname = 'idx_recurring_expenses_dates') THEN
        CREATE INDEX idx_recurring_expenses_dates ON recurring_expenses(start_date, end_date, last_processed_date);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'recurring_expense_splits' AND indexname = 'idx_recurring_expense_splits_expense') THEN
        CREATE INDEX idx_recurring_expense_splits_expense ON recurring_expense_splits(recurring_expense_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'recurring_expense_splits' AND indexname = 'idx_recurring_expense_splits_person') THEN
        CREATE INDEX idx_recurring_expense_splits_person ON recurring_expense_splits(person_id);
    END IF;
END$$; 