'use strict';

module.exports = (sequelize, DataTypes) => {
    const TamaraRequest = sequelize.define('TamaraRequest', {
        return_request_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: false
        },
        refund_request_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'RefundRequests',
                key: 'id'
            }
        }
    }, {
        tableName: 'tamara_requests',
        timestamps: false
    });

    TamaraRequest.associate = function (models) {
        // Define the association with RefundRequest
        TamaraRequest.belongsTo(models.RefundRequest, {
            foreignKey: 'refund_request_id',
            as: 'refundRequest'
        });
    };

    return TamaraRequest;
};
