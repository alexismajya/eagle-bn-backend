'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Roles',{
      id: {allowNull: false,autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      roleName: {type:Sequelize.STRING, allowNull:false},
      roleValue: {type: Sequelize.STRING, allowNull:false},
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Roles');
  }
};
