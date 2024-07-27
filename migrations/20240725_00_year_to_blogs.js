const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('blogs', 'year', {
      type: DataTypes.INTEGER,
      validate: {
        customValidator(value) {
          if (value > new Date().getFullYear() || value < 1991) {
            throw new Error('invalid year')
          }
        }
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('users', 'year')
  },
}