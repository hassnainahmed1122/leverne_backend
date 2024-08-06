'use strict';

module.exports = (sequelize, DataTypes) => {
  const RefundRequest = sequelize.define('RefundRequest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'id'
      }
    },
    uuid: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      validate: {
        len: [8, 8],
        isNumeric: true
      }
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    refund_amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true
    },
    return_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },
    bank_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    aramex_policy_number: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {});

  RefundRequest.associate = function(models) {
    RefundRequest.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    RefundRequest.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    RefundRequest.hasMany(models.RefundItem, { foreignKey: 'refund_request_id', as: 'refundItems' });
    RefundRequest.hasMany(models.TamaraRequest, { foreignKey: 'refund_request_id', as: 'tamaraRequests' });
  };

  return RefundRequest;
};
