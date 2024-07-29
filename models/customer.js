'use strict';

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    salla_customer_id: DataTypes.INTEGER,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile_number: DataTypes.STRING
  }, {});

  Customer.associate = function(models) {
    Customer.hasMany(models.Order, { foreignKey: 'customer_id' });
  };

  return Customer;
};
