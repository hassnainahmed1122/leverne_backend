'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'total');
    await queryInterface.addColumn('Orders', 'sub_total', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'shipping_cost', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'cash_on_delivery', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'tax_amount', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'discount_amount', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'salla_reference_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'total', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
    await queryInterface.removeColumn('Orders', 'sub_total');
    await queryInterface.removeColumn('Orders', 'shipping_cost');
    await queryInterface.removeColumn('Orders', 'cash_on_delivery');
    await queryInterface.removeColumn('Orders', 'tax_amount');
    await queryInterface.removeColumn('Orders', 'discount_amount');
    await queryInterface.removeColumn('Orders', 'salla_reference_id');
  }
};
