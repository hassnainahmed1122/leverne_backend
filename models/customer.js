'use strict';

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    salla_customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
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
      allowNull: false,
      unique: true
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true // Set to true if the city is optional, false otherwise
    },
    address: { // New column added here
      type: DataTypes.STRING,
      allowNull: true // Set to true if the address is optional, false otherwise
    }
  }, {});

  Customer.associate = function(models) {
    Customer.hasMany(models.Order, { foreignKey: 'customer_id' });
    Customer.hasMany(models.RefundRequest, { foreignKey: 'customer_id', as: 'refundRequests' });
  };

  return Customer;
};
