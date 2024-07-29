'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add unique constraint to salla_customer_id in Customers table
    await queryInterface.addConstraint('Customers', {
      fields: ['salla_customer_id'],
      type: 'unique',
      name: 'unique_salla_customer_id'
    });

    // Add unique constraint to salla_order_id in Orders table
    await queryInterface.addConstraint('Orders', {
      fields: ['salla_order_id'],
      type: 'unique',
      name: 'unique_salla_order_id'
    });

    // Add unique constraint to salla_product_id in Products table
    await queryInterface.addConstraint('Products', {
      fields: ['salla_product_id'],
      type: 'unique',
      name: 'unique_salla_product_id'
    });

    // Add unique constraint to combination of product_id and order_id in OrderItems table
    await queryInterface.addConstraint('OrderItems', {
      fields: ['product_id', 'order_id'],
      type: 'unique',
      name: 'unique_product_order_combination'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove unique constraint from salla_customer_id in Customers table
    await queryInterface.removeConstraint('Customers', 'unique_salla_customer_id');

    // Remove unique constraint from salla_order_id in Orders table
    await queryInterface.removeConstraint('Orders', 'unique_salla_order_id');

    // Remove unique constraint from salla_product_id in Products table
    await queryInterface.removeConstraint('Products', 'unique_salla_product_id');

    // Remove unique constraint from combination of product_id and order_id in OrderItems table
    await queryInterface.removeConstraint('OrderItems', 'unique_product_order_combination');
  }
};
