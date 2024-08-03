'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('RefundRequests', 'refund_amount', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('RefundRequests', 'payment_method', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('RefundRequests', 'refund_amount');
    await queryInterface.removeColumn('RefundRequests', 'payment_method');
  }
};
