const db = require('../config/database');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await db.getMany('SELECT * FROM categories ORDER BY name');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  const { name } = req.body;
  
  try {
    const category = await db.getOne(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category added successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
};

// Get category-wise summary
const getCategorySummary = async (req, res) => {
  try {
    const summary = await db.getMany(`
      SELECT 
        c.name as category,
        COUNT(e.id) as expense_count,
        SUM(e.amount) as total_amount,
        AVG(e.amount) as average_amount
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
      GROUP BY c.id, c.name
      ORDER BY total_amount DESC NULLS LAST
    `);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting category summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get category summary'
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  getCategorySummary
}; 