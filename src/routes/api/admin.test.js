/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const { response } = require('../../app');
const app = require('../../app');

const request = supertest(app.callback());

describe('Admin API routes', () => {
  let admin;
  let auth;
  let authNormal;
  let dbAdmin;

  const adminFields = {
    username: 'testUsernameAdmin',
    password: 'testPasswordAdmin',
    email: 'testAdmin@gmail.com',
    type: 'admin',
  };

  const userFields = {
    username: 'testUsernameUser',
    password: 'testPasswordUser',
    email: 'testUser@gmail.com',
    type: 'none',
  };

  beforeAll(async () => {
    dbAdmin = app.context.orm.sequelize;
    await dbAdmin.sync({ force: true });
    await app.context.orm.user.create(adminFields);
    await app.context.orm.user.create(userFields);

    const authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: adminFields.email, password: adminFields.password });
    auth = authResponse.body;

    const authResponseNormal = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    authNormal = authResponseNormal.body;
  });

  afterAll(async () => {
    await dbAdmin.close();
  });

  describe('GET /api/admin/reports', () => {
    let userExtra;
    let userExtraTwo;
    let property;
    let comment;
    let commentTwo;
    let reportOne;
    let reportTwo;
    let reportThree;
    let reports;

    const userDataExtra = {
      username: 'testUsernameExtra',
      password: 'testPasswordExtra',
      email: 'testExtra@gmail.com',
      type: 'none',
    };

    const userDataExtraTwo = {
      username: 'testUsernameExtraTwo',
      password: 'testPasswordExtraTwo',
      email: 'testExtraTwo@gmail.com',
      type: 'none',
    };

    const propertyData = {
      location: 'Test location',
      name: 'Test',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'this is a test of description',
    };

    const commentData = {
      content: 'Test of a Comment',
    };

    const commentDataTwo = {
      content: 'Test of a Comment two',
    };

    const reportDataOne = {
      model: 'Comment',
      content: 'Test of a report to commentary',
    };

    const reportDataTwo = {
      model: 'Comment',
      content: 'Test of a report to commentary',
    };

    const reportDataThree = {
      model: 'user',
      content: 'Test of a report to user',
    };

    const authorizedGetReports = () => request
      .get('/api/admin/reports')
      .auth(auth.token, { type: 'bearer' });

    const unauthorizedGetReports = () => request.get('/api/admin/reports');

    const unauthorizedGetReportsForAdmin = () => request
      .get('/api/admin/reports')
      .auth(authNormal.token, { type: 'bearer' });

    beforeAll(async () => {
      userExtra = await app.context.orm.user.create(userDataExtra);
      userExtraTwo = await app.context.orm.user.create(userDataExtraTwo);

      propertyData.userId = userExtra.id;
      property = await app.context.orm.property.create(propertyData);

      commentData.propertyId = property.id;
      // TODO: cambiar el nombre de la base de datos a comment
      comment = await app.context.orm.Comment.create(commentData);
      commentDataTwo.propertyId = property.id;
      // TODO: cambiar el nombre de la base de datos a comment
      commentTwo = await app.context.orm.Comment.create(commentDataTwo);

      reportDataOne.modelId = comment.id;
      reportDataOne.userId = userExtra.id;
      reportOne = await app.context.orm.report.create(reportDataOne);
      reportDataTwo.modelId = commentTwo.id;
      reportDataTwo.userId = userExtra.id;
      reportTwo = await app.context.orm.report.create(reportDataTwo);

      reportDataThree.modelId = userExtraTwo.id;
      reportDataThree.userId = userExtra.id;
      reportThree = await app.context.orm.report.create(reportDataThree);

      reports = [reportOne, reportTwo, reportThree];
    });

    describe('when recibe all the properties of the database', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetReports();
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      let response;
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetReports();
        expect(response.status).toBe(401);
      });
    });

    describe('when request is unauthorized because user is not admin', () => {
      let response;
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetReportsForAdmin();
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    let userDelete;
    let response;

    const userDataExtra = {
      username: 'testUsernameExtra',
      password: 'testPasswordExtra',
      email: 'testExtra@gmail.com',
      type: 'none',
    };

    const authorizedDeleteUserForAdmin = (id) => request
      .delete(`/api/admin/users/${id}`)
      .auth(auth.token, { type: 'bearer' });

    const unauthorizedDeleteUsersForAdmin = (id) => request.delete(`/api/admin/users/${id}`);

    const unauthorizedDeleteUsersForNormal = (id) => request
      .delete(`/api/admin/users/${id}`)
      .auth(authNormal.token, { type: 'bearer' });

    beforeAll(async () => {
      userDelete = await app.context.orm.user.create(userDataExtra);
    });

    describe('when passed id corresponds to an existing property', () => {
      beforeAll(async () => {
        response = await authorizedDeleteUserForAdmin(userDelete.id);
      });

      test('responds with 202 status code', () => {
        expect(response.status).toBe(202);
      });

      test('user does not exists in the database', async () => {
        const user = await app.context.orm.user.findByPk(userDelete.id);
        expect(user).toBeNull();
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        userDelete = await app.context.orm.user.create(userDataExtra);
      });
      test('responds with 401 status code', async () => {
        response = await unauthorizedDeleteUsersForAdmin(userDelete.id);
        expect(response.status).toBe(401);
      });
    });

    describe('when request is unauthorized because the user is not admin', () => {
      beforeAll(async () => {
        userDelete = await app.context.orm.user.create(userDataExtra);
      });
      test('responds with 401 status code', async () => {
        response = await unauthorizedDeleteUsersForNormal(userDelete.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /admin/properties/:id', () => {
    let property;
    let response;
    const propertyData = {
      location: 'Test location',
      name: 'Test',
      state: 'on sale',
      price: 10000000,
      description: 'this is a test of description',
    };

    const userDataExtra = {
      username: 'testUsernameExtra',
      password: 'testPasswordExtra',
      email: 'testExtra@gmail.com',
      type: 'none',
    };

    const authorizedDeletePropertyAdmin = (id) => request
      .delete(`/api/admin/properties/${id}`)
      .auth(auth.token, { type: 'bearer' });

    const unauthorizedDeletePropertyAdmin = (id) => request.delete(`/api/admin/properties/${id}`);

    const unauthorizedDeletePropertyNormal = (id) => request
      .delete(`/api/admin/properties/${id}`)
      .auth(authNormal.token, { type: 'bearer' });

    beforeAll(async () => {
      const userExtra = await app.context.orm.user.create(userDataExtra);
      propertyData.userId = userExtra.id;
      property = await app.context.orm.property.create(propertyData);
    });

    describe('when passed id corresponds to an existing property', () => {
      beforeAll(async () => {
        response = await authorizedDeletePropertyAdmin(property.id);
      });

      test('responds with 202 status code', () => {
        expect(response.status).toBe(202);
      });

      test('property does not exists in the database', async () => {
        const propertyDeleted = await app.context.orm.property.findByPk(property.id);
        expect(propertyDeleted).toBeNull();
      });
    });

    describe('when passed id does not correspond to any property', () => {
      beforeAll(async () => {
        property = await app.context.orm.property.create(propertyData);
      });
      test('responds with 404 status code', async () => {
        response = await authorizedDeletePropertyAdmin(property.id * -1);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        property = await app.context.orm.property.create(propertyData);
      });
      test('responds with 401 status code', async () => {
        response = await unauthorizedDeletePropertyAdmin(property.id);
        expect(response.status).toBe(401);
      });
    });

    describe('when request is unauthorized because user is not admin', () => {
      beforeAll(async () => {
        property = await app.context.orm.property.create(propertyData);
      });
      test('responds with 401 status code', async () => {
        response = await unauthorizedDeletePropertyNormal(property.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/admin/properties/:property_id/comments/:id', () => {
    let userExtra;
    let userExtraTwo;
    let property;
    let comment;
    // eslint-disable-next-line no-shadow
    let response;

    const userDataExtra = {
      username: 'testUsernameExtra',
      password: 'testPasswordExtra',
      email: 'testExtra@gmail.com',
      type: 'none',
    };

    const userDataExtraTwo = {
      username: 'testUsernameExtraTwo',
      password: 'testPasswordExtraTwo',
      email: 'testExtraTwo@gmail.com',
      type: 'none',
    };

    const propertyData = {
      location: 'Test location',
      name: 'Test',
      state: 'on sale',
      price: 10000000,
      description: 'this is a test of description',
    };

    const commentData = {
      content: 'Test of a commentary',
    };

    const authorizedDeleteCommentAdmin = (idProperty, idComment) => request
      .delete(`/api/admin/properties/${idProperty}/comments/${idComment}`)
      .auth(auth.token, { type: 'bearer' });

    // eslint-disable-next-line no-unused-vars
    const unauthorizedDeleteCommentAdmin = (idProperty, idComment) => request.delete(`/api/admin/properties/${idProperty}/comments/${idComment}`);

    const unauthorizedDeleteCommentNormal = (idProperty, idComment) => request
      .delete(`/api/admin/properties/${idProperty}/comments/${idComment}`)
      .auth(authNormal.token, { type: 'bearer' });

    beforeAll(async () => {
      userExtra = await app.context.orm.user.create(userDataExtra);
      userExtraTwo = await app.context.orm.user.create(userDataExtraTwo);
      propertyData.userId = userExtra.id;
      property = await app.context.orm.property.create(propertyData);
      commentData.userId = userExtraTwo.id;
      commentData.propertyId = property.id;
      // TODO: cambiar el nombre de la base de datos a comment
      comment = await app.context.orm.Comment.create(commentData);
    });

    describe('when passed id corresponds to an existing property and comment', () => {
      beforeAll(async () => {
        response = await authorizedDeleteCommentAdmin(property.id, comment.id);
      });

      test('responds with 202 status code', () => {
        expect(response.status).toBe(202);
      });

      // TODO: cambiar el nombre de la base de datos a comment
      test('comment does not exists in the database', async () => {
        const commentDeleted = await app.context.orm.Comment.findByPk(comment.id);
        expect(commentDeleted).toBeNull();
      });
    });
  });
});
