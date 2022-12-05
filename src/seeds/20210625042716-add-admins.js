module.exports = {
  up: async (queryInterface) => {
    const adminsArray = [];

    adminsArray.push({
      username: 'admin-oscars',
      password: 'admin-oscars12345',
      email: 'admin-oscars@uc.cl',
      type: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    adminsArray.push({
      username: 'admin-benito',
      password: 'admin-benito123',
      email: 'admin-benito@uc.cl',
      type: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('users', adminsArray);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
