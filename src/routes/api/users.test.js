const supertest = require('supertest');
const app = require('../../app');

const request = supertest(app.callback());

describe('API users endpoints', () => {
  let auth;
  let dbUser1;
  const userFields = {
    username: 'Test',
    email: 'test@gmail.com',
    password: 'testPassword',
    type: 'none',
  };

  beforeAll(async () => {
    dbUser1 = app.context.orm.sequelize;
    await dbUser1.sync({ force: true });
    await app.context.orm.user.create(userFields);
    const authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await dbUser1.close();
  });

  describe('POST api/users', () => {
    const newUserData = {
      username: 'newUser',
      email: 'test-user@gmail.com',
      password: 'testPassword',
      type: 'none',
    };
    const PostUser = (body) => request
      .post('/api/users')
      .set('Content-type', 'application/json')
      .send(body);

    describe('User data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await PostUser(newUserData);
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response for POST user has an id', () => {
        expect(response.body.data.id).toBeDefined();
      });

      test('response body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });

      test('post request actually created the given user', async () => {
        const user = await app.context.orm.user.findByPk(response.body.data.id);
        const {
          username,
          email,
          password,
          type,
        } = user.dataValues;
        const sanitizedUser = {
          username,
          email,
          password,
          type,
        };
        expect(sanitizedUser).toEqual(newUserData);
      });
    });

    describe('User data is invalid', () => {
      test('responds with 400 status code', async () => {
        const invalidBodies = [
          {},
          { username: 'Alan' },
          { email: 'alan@mail.cl' },
          { username: 'Alan', email: 'alanmail.cl', password: 'Secret' },
          { username: 'Alan', email: 'alan@mail.cl' },
        ];
        await Promise.all(invalidBodies.map(PostUser))
          .then((responses) => {
            responses.forEach((response) => expect(response.status).toBe(400));
          });
      });
    });
  });

  describe('GET api/users/me', () => {
    let response;
    const authorizedGetUser = () => request
      .get('/api/users/me')
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedGetUser = () => request.get('/api/users/me');

    describe('when authentication is correct and currentUser is setted', () => {
      beforeAll(async () => {
        response = await authorizedGetUser();
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
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetUser();
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH api/users', () => {
    const newUserData = {
      username: 'newUsername',
      email: userFields.email,
      password: userFields.password,
      type: userFields.type,
    };
    const PatchUser = (id, body) => request
      .patch(`/api/users/${id}`)
      .set('Content-type', 'application/json')
      .auth(auth.token, { type: 'bearer' })
      .send(body);
    describe('User is updated', () => {
      let response;
      beforeAll(async () => {
        const userBefore = await app.context.orm.user.findOne({
          where: { email: userFields.email },
        });
        response = await PatchUser(userBefore.id, newUserData);
      });
      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });
      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
      test('patch request actually updated the given user', async () => {
        const user = await app.context.orm.user.findByPk(response.body.data.id);
        const {
          username,
          email,
          password,
          type,
        } = user.dataValues;
        const sanitizedUser = {
          username,
          email,
          password,
          type,
        };
        expect(sanitizedUser).toEqual(newUserData);
      });
    });
  });

  describe('GET api/users/me/meetings', () => {
    let currentUserBuyer;
    let currentUserSeller;
    let property;
    let response;

    const authorizedGetMeeting = (currentUser) => request
      .get('/api/users/me/meetings')
      .auth(auth.token, { type: 'bearer' })
      .send({ currentUser });

    const seller = {
      username: 'newSeller',
      email: 'newseller@uc.cl',
      password: 'password',
      type: 'none',
    };

    const newPropertyData = {
      name: 'newProperty',
      location: 'santiago',
      state: 'metropolitana',
      price: 1000000,
      description: 'departamento',
      userId: 1,
    };

    const firstMeeting = {
      buyerId: null,
      sellerId: null,
      propertyId: null,
      date: '2021-01-12',
      hour: '12:30 pm',
    };

    beforeAll(async () => {
      const userBefore = await app.context.orm.user.findOne({
        where: { email: userFields.email },
      });
      currentUserSeller = await app.context.orm.user.create(seller);
      firstMeeting.sellerId = currentUserSeller.id;
      firstMeeting.buyerId = userBefore.id;
      newPropertyData.userId = userBefore.id;
      property = await app.context.orm.property.create(newPropertyData);
      firstMeeting.propertyId = property.id;
      await app.context.orm.meeting.create(firstMeeting);
    });

    describe('when authentication is correct and you can see meetings', () => {
      beforeAll(async () => {
        response = await authorizedGetMeeting(currentUserBuyer);
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('response with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });
  });

  describe('POST api/users/:user_id/reports', () => {
    let userReported;
    const userDataReport = {
      username: 'userReport',
      email: 'test-user-report@gmail.com',
      password: 'testPassword',
      type: 'none',
    };

    const reportData = {
      content: 'Test of the content of report',
    };

    const authorizedPostReport = (id, body) => request
      .post(`/api/users/${id}/reports`)
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    const unauthorizedPostReport = (id, body) => request
      .post(`/api/users/${id}/reports`)
      .set('Content-type', 'application/json')
      .send(body);

    beforeAll(async () => {
      userReported = await app.context.orm.user.create(userDataReport);
    });

    describe('report data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPostReport(userReported.id, reportData);
      });

      test('responds with 201 (created) status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response for POST report has an id (report has an id)', () => {
        expect(response.body.data.id).toBeDefined();
      });

      test('response body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });

      test('post request actually created the given property', async () => {
        const report = await app.context.orm.report.findByPk(response.body.data.id);
        const {
          content,
        } = report.dataValues;
        const sanitizedReport = {
          content,
        };
        expect(sanitizedReport).toEqual(reportData);
      });
    });

    describe('report data is invalid', () => {
      test('responds with 400 status code', async () => {
        const invalidBodies = [
          {},
          { contenido: 'Test of content' },
          { content: '' },
        ];
        await Promise.all(invalidBodies.map(authorizedPostReport))
          .then((responses) => {
            responses.forEach((response) => expect(response.status).toBe(400));
          });
      });
    });

    describe('report data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        const response = await unauthorizedPostReport(reportData);
        expect(response.status).toBe(401);
      });
    });

    describe('when passed id does not correspond to any user', () => {
      test('responds with 404 status code', async () => {
        const response = await authorizedPostReport(userReported.id * -1, reportData);
        expect(response.status).toBe(404);
      });
    });
  });
});
