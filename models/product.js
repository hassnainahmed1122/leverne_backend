// models/product.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    salla_product_id: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    thumbnail: DataTypes.STRING,
    SKU: DataTypes.STRING
  }, {});
  Product.associate = function(models) {
    // associations can be defined here
    Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
  };
  return Product;
};
