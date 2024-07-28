'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'tax', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
    await queryInterface.addColumn('Products', 'discount', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'tax');
    await queryInterface.removeColumn('Products', 'discount');
  }
};
