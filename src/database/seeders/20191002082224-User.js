import helpers from '../../utils/helper';
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.bulkInsert('Users', [{
      fullname: 'alexis',
      email: 'alexismajyambere@gmail.com',
      password: helpers.hashPassword('12345678UUi@'),
      isverified: true,
      RoleId:6,
      rememberMe: false,
      lastSeen: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      fullname: 'admin',
      email: 'andelaeagle@gmail.com',
      password: helpers.hashPassword('eagle123!'),
      isverified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      RoleId:1,
      rememberMe: false,
      lastSeen: null,
    },{
      fullname: 'requester',
      email: 'requester@gmail.com',
      password: helpers.hashPassword('eagle123!'),
      isverified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      RoleId:5,
      rememberMe: false,
      lastSeen: null,
    },{
      fullname: 'dummy',
      email: 'dummy@gmail.com',
      password: helpers.hashPassword('eagle123!'),
      isverified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      RoleId:5,
      rememberMe: false,
      lastSeen: null,
    },{
      fullname: 'Tadmin',
      email: 'tadmin@gmail.com',
      password: helpers.hashPassword('eagle123!'),
      isverified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      RoleId:2,
      rememberMe: false,
      lastSeen: null,
    },
    {
      fullname: 'manager',
      email: 'manager@gmail.com',
      password: helpers.hashPassword('eagle123!'),
      isverified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      RoleId: 4,
      rememberMe: false,
      lastSeen: null,
  }])
  ]),
  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.bulkDelete('Users', null, {})
  ])
};
