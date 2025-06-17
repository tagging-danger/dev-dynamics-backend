-- Insert sample people
INSERT INTO people (name) VALUES 
('Shantanu'),
('Sanket'),
('Om')
ON CONFLICT (name) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name) VALUES 
('Food'),
('Travel'),
('Utilities'),
('Entertainment'),
('Other')
ON CONFLICT (name) DO NOTHING;

-- Insert sample expense
INSERT INTO expenses (amount, description, paid_by, split_type, category_id)
SELECT 
    600.00,
    'Dinner at restaurant',
    (SELECT id FROM people WHERE name = 'Shantanu'),
    'equal',
    (SELECT id FROM categories WHERE name = 'Food')
ON CONFLICT DO NOTHING;

-- Insert expense splits
INSERT INTO expense_splits (expense_id, person_id, amount)
SELECT 
    (SELECT id FROM expenses WHERE description = 'Dinner at restaurant'),
    p.id,
    200.00
FROM people p
WHERE p.name IN ('Shantanu', 'Sanket', 'Om')
ON CONFLICT DO NOTHING;

-- Insert balances
INSERT INTO balances (person_id, expense_id, amount)
SELECT 
    p.id,
    (SELECT id FROM expenses WHERE description = 'Dinner at restaurant'),
    CASE 
        WHEN p.name = 'Shantanu' THEN 600.00
        ELSE -200.00
    END
FROM people p
WHERE p.name IN ('Shantanu', 'Sanket', 'Om')
ON CONFLICT DO NOTHING; 