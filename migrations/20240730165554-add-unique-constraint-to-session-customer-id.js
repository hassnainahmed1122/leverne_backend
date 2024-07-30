'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addConstraint('Sessions', {
            fields: ['customer_id'],
            type: 'unique',
            name: 'unique_customer_id_constraint'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint('Sessions', 'unique_customer_id_constraint');
    }
};
