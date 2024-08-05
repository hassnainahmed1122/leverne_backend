'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the family_name column from the RefundRequest table
    await queryInterface.removeColumn('RefundRequests', 'family_name');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the family_name column back in case of rollback
    await queryInterface.addColumn('RefundRequests', 'family_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
