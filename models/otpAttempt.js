const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const OtpAttempt = sequelize.define('OtpAttempt', {
        mobile_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: false
        },
        otp_expiration: {
            type: DataTypes.DATE,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Customers',
                key: 'id'
            }
        }
    }, {
        tableName: 'OtpAttempts',
        timestamps: true
    });

    OtpAttempt.associate = function (models) {
        OtpAttempt.belongsTo(models.Customer, { foreignKey: 'user_id', as: 'customer' });
    };

    OtpAttempt.checkAttemptLimit = async function (mobile_number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('Checking attempts for mobile number:', mobile_number);
        console.log('Date range:', today.toISOString(), endOfDay.toISOString());

        try {
            const attemptCount = await this.count({
                where: {
                    mobile_number: mobile_number,
                    createdAt: {
                        [Op.between]: [today, endOfDay]
                    }
                }
            });

            return attemptCount >= 10;
        } catch (err) {
            console.error('Error checking attempt limit:', err);
            throw err;
        }
    };

    OtpAttempt.checkOtpExpiration = function (otpExpiration) {
        return new Date() > new Date(otpExpiration);
    };

    return OtpAttempt;
};
