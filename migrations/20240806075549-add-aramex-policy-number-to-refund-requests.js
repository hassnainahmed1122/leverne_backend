'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('RefundRequests', 'aramex_policy_number', {
      type: Sequelize.STRING,
      allowNull: true, // This allows the column to have null values
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('RefundRequests', 'aramex_policy_number');
  }
};
