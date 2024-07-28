'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    salla_product_id: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    thumbnail: DataTypes.STRING,
    SKU: DataTypes.STRING,
    tax: DataTypes.DECIMAL,
    discount: DataTypes.DECIMAL,
    gtin: DataTypes.STRING // Added gtin column
  }, {});

  Product.associate = function(models) {
    // associations can be defined here
    Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
  };

  Product.createProduct = async function(productDetails) {
    // Find if the product already exists
    const existingProduct = await Product.findOne({ where: { salla_product_id: productDetails.salla_product_id } });

    if (existingProduct) {
      return existingProduct;
    }

    const newProduct = await Product.create({
      salla_product_id: productDetails.salla_product_id,
      price: productDetails.price,
      thumbnail: productDetails.thumbnail,
      SKU: productDetails.SKU,
      tax: productDetails.tax,
      discount: productDetails.discount,
      gtin: productDetails.gtin
    });

    return newProduct;
  };

  return Product;
};
