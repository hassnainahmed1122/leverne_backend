'use strict';

module.exports = (sequelize, DataTypes) => {
    const TamaraRequest = sequelize.define('TamaraRequest', {
        status: {
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
        },
        failure_reason: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'tamara_requests',
        timestamps: false
    });

    TamaraRequest.associate = function (models) {
        TamaraRequest.belongsTo(models.RefundRequest, {
            foreignKey: 'refund_request_id',
            as: 'refundRequest'
        });
    };

    return TamaraRequest;
};
