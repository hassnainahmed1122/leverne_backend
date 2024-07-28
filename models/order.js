'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    salla_order_id: DataTypes.INTEGER,
    payment_method: DataTypes.STRING,
    status: DataTypes.STRING,
    date: DataTypes.DATE,
    sub_total: DataTypes.DECIMAL,
    shipping_cost: DataTypes.DECIMAL,
    cash_on_delivery: DataTypes.DECIMAL,
    tax_amount: DataTypes.DECIMAL,
    discount_amount: DataTypes.DECIMAL,
    salla_reference_id: DataTypes.STRING,
    customer_id: DataTypes.INTEGER
  }, {});

  Order.associate = function(models) {
    Order.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
  };

  Order.createOrUpdateOrder = async function(orderData) {
    let order = await Order.findOne({ where: { salla_order_id: orderData.salla_order_id } });

    if (!order) {
      order = await Order.create(orderData);
    }

    return order;
  };

  return Order;
};
