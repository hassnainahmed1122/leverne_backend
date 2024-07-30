const { Session } = require('../models');
const { Op } = require('sequelize');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const session = await Session.findOne({
            where: {
                token: token,
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!session) {
            return res.status(401).json({ message: 'Unauthorized or session expired' });
        }

        req.customerId = session.customer_id;
        next();
    } catch (err) {
        console.error('Error in authentication middleware:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    authenticate
}
