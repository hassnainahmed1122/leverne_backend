'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'weight', {
      type: Sequelize.FLOAT,
      allowNull: true, // Adjust as needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'weight');
  }
};
