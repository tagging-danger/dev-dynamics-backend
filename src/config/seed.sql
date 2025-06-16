-- Insert sample people
INSERT INTO people (name) VALUES 
('Shantanu'),
('Sanket'),
('Om')
ON CONFLICT (name) DO NOTHING;

-- Insert sample expense
INSERT INTO expenses (amount, description, paid_by, split_type)
SELECT 
    600.00,
    'Dinner at restaurant',
    (SELECT id FROM people WHERE name = 'Shantanu'),
    'equal'
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