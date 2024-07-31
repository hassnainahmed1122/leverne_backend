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
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    condition: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});

  RefundRequest.associate = function(models) {
    RefundRequest.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    RefundRequest.hasMany(models.RefundItem, { foreignKey: 'refund_request_id' });
  };

  return RefundRequest;
};
