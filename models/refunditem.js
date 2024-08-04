'use strict';

module.exports = (sequelize, DataTypes) => {
  const RefundItem = sequelize.define('RefundItem', {
    refund_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'RefundRequests',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});

  RefundItem.associate = function(models) {
    RefundItem.belongsTo(models.RefundRequest, { foreignKey: 'refund_request_id', as: 'refundRequest' });
    RefundItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return RefundItem;
};
