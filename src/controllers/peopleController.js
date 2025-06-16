const db = require('../config/database');

const getAllPeople = async (req, res) => {
  try {
    const people = await db.getMany('SELECT * FROM people ORDER BY name');
    
    res.json({
      success: true,
      data: people
    });
  } catch (error) {
    console.error('Error getting people:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get people'
    });
  }
};

module.exports = {
  getAllPeople
}; 