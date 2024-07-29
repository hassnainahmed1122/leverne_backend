'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    order_id: DataTypes.INTEGER, // Foreign key to Order
    product_id: DataTypes.INTEGER, // Foreign key to Product
    quantity: DataTypes.INTEGER,
  }, {});

  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
  };

  return OrderItem;
};
