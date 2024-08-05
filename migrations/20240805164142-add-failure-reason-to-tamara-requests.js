'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('tamara_requests', 'failure_reason', {
            type: Sequelize.STRING,
            allowNull: true // This allows the column to be empty for successful requests
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('tamara_requests', 'failure_reason');
    }
};
