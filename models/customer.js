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

  Customer.createOrUpdateCustomer = async function(customerDetails) {
    let customer = await Customer.findOne({ where: { salla_customer_id: customerDetails.salla_customer_id } });

    if (!customer) {
      customer = await Customer.create({
        salla_customer_id: customerDetails.salla_customer_id,
        first_name: customerDetails.first_name,
        last_name: customerDetails.last_name,
        email: customerDetails.email,
        mobile_number: customerDetails.mobile_number
      });
    }

    return customer;
  };

  return Customer;
};
