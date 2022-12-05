module.exports = {
  up: async (queryInterface) => {
    const commentsArray = [];
    const usersArray = await queryInterface.sequelize.query(
      'SELECT id from users;',
    );

    const propertiesArray = await queryInterface.sequelize.query(
      'SELECT id from properties;',
    );

    const userRows = usersArray[0];
    const propertyRows = propertiesArray[0];

    commentsArray.push({
      userId: userRows[1].id,
      propertyId: propertyRows[2].id,
      content: 'Esta propiedad es muy linda y con mucho espacio',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    commentsArray.push({
      userId: userRows[2].id,
      propertyId: propertyRows[2].id,
      content: 'Sii a mi también me encantó esta propiedad',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    commentsArray.push({
      userId: userRows[0].id,
      propertyId: propertyRows[1].id,
      content: 'Esta propiedad la visité el otro día y el patio era muy pequeño',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    commentsArray.push({
      userId: userRows[1].id,
      propertyId: propertyRows[0].id,
      content: 'Esta propiedad es pequeña pero muy acojedora, estoy muy interesado en ella',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('Comments', commentsArray);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Comments', null, {});
  },
};
