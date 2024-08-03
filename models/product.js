'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    salla_product_id: DataTypes.STRING,
    price: DataTypes.FLOAT,
    thumbnail: DataTypes.STRING,
    SKU: DataTypes.STRING,
    tax: DataTypes.FLOAT,
    discount: DataTypes.FLOAT,
    gtin: DataTypes.STRING,
    name: DataTypes.STRING,
    tax_percentage: DataTypes.FLOAT,
  }, {});

  Product.associate = function(models) {
    Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
  };

  return Product;
};
