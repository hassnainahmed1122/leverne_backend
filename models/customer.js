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
    }
  }, {});

  Customer.associate = function(models) {
    Customer.hasMany(models.Order, { foreignKey: 'customer_id' });
  };

  return Customer;
};
