'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('RefundRequests', 'first_name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('RefundRequests', 'last_name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('RefundRequests', 'family_name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('RefundRequests', 'email', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('RefundRequests', 'first_name');
    await queryInterface.removeColumn('RefundRequests', 'last_name');
    await queryInterface.removeColumn('RefundRequests', 'family_name');
    await queryInterface.removeColumn('RefundRequests', 'email');
  }
};
