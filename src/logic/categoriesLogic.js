const getAllCategories = (req, res) => {
    const categories = require('../mock_database/categories.json')
    return res.json(categories)
}

module.exports = {getAllCategories}