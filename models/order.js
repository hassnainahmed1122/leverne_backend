// models/order.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    salla_order_id: DataTypes.INTEGER,
    payment_method: DataTypes.STRING,
    status: DataTypes.STRING,
    date: DataTypes.DATE,
    total: DataTypes.DECIMAL,
    customer_id: DataTypes.INTEGER
  }, {});
  Order.associate = function(models) {
    // associations can be defined here
    Order.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
  };
  return Order;
};
