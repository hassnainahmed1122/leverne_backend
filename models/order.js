'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    salla_order_id: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    status: DataTypes.STRING,
    date: DataTypes.DATE,
    sub_total: DataTypes.FLOAT,
    shipping_cost: DataTypes.FLOAT,
    cash_on_delivery: DataTypes.FLOAT,
    tax_amount: DataTypes.FLOAT,
    discount_amount: DataTypes.FLOAT,
    salla_reference_id: DataTypes.STRING,
    customer_id: DataTypes.INTEGER,
  }, {});

  Order.associate = function(models) {
    Order.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
  };

  return Order;
};
