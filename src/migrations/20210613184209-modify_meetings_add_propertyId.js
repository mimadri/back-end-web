module.exports = {
  up: async (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn(
      'meetings', // table name
      'propertyId', // new field name
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'properties',
          key: 'id',
        },
        allowNull: false,
      },
    ),
  ]),

  down: async (queryInterface) => Promise.all([
    queryInterface.removeColumn('meetings', 'propertyId'),
  ]),
};
