'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('RefundItems', 'price');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('RefundItems', 'price', {
      type: Sequelize.FLOAT,
      allowNull: false
    });
  }
};
