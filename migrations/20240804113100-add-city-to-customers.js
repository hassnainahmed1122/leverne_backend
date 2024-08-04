'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Customers', 'city', {
      type: Sequelize.STRING,
      allowNull: true // Set to true if the city is optional, false otherwise
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Customers', 'city');
  }
};
