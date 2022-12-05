module.exports = {
  up: async (queryInterface) => {
    const propertiesArray = [];
    const usersArray = await queryInterface.sequelize.query(
      'SELECT id from users;',
    );

    const userRows = usersArray[0];
    propertiesArray.push({
      location: 'Mendoza 501, Rengo',
      name: 'Casa El Convento',
      state: 'on sale',
      userId: userRows[0].id,
      price: 75000000,
      description: 'Casa amarilla de 200m2 con un gran patio, estacionamiento y piscina',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    propertiesArray.push({
      location: 'María Elena 1792, Osorno',
      name: 'Casa Esquina',
      state: 'rent',
      userId: userRows[1].id,
      price: 120000000,
      description: 'Casa de 3 habitaciones, 2 baños, cocina independiente y living comedor (incluye perro)',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    propertiesArray.push({
      location: 'Los Leones 2537, Santiago',
      name: 'Edificio Step',
      state: 'sold',
      userId: userRows[2].id,
      price: 75000000,
      description: 'Departamento ubicado en el centro de Santiago. Cuenta con dos baños y dos dormitorios, con un espacio de 69m2. El edificio cuenta con areas comunes, gimnasio y piscina.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('properties', propertiesArray);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('properties', null, {});
  },
};
