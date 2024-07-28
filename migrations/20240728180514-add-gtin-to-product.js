'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'gtin', {
      type: Sequelize.STRING,
      allowNull: true // Adjust according to your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'gtin');
  }
};
