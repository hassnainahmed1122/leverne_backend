'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('RefundRequests', 'condition');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('RefundRequests', 'condition', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
