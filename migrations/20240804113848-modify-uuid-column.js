'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the column type of 'uuid' to STRING(8) and add validation
    await queryInterface.changeColumn('RefundRequests', 'uuid', {
      type: Sequelize.STRING(8),
      allowNull: false,
      unique: true,
      validate: {
        len: [8, 8], // Ensures the uuid is exactly 8 characters long
        isNumeric: true // Ensures uuid contains only digits
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the column type of 'uuid' back to UUID if necessary
    await queryInterface.changeColumn('RefundRequests', 'uuid', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true
    });
  }
};
