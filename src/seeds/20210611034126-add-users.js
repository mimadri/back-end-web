module.exports = {
  up: async (queryInterface) => {
    const usersArray = [];

    usersArray.push({
      username: 'oscars810',
      password: 'oscar123',
      email: 'oscars810@uc.cl',
      type: 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    usersArray.push({
      username: 'benito_29',
      password: 'benito123',
      email: 'benito_29@uc.cl',
      type: 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    usersArray.push({
      username: 'mi_madrid',
      password: 'michelle123',
      email: 'mi_madrid@uc.cl',
      type: 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('users', usersArray);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
