const supertest = require('supertest');
const app = require('../../app');

const request = supertest(app.callback());

describe('Reports API routes', () => {
  let auth;
  let dbReports;

  const userFields = {
    username: 'testUsername',
    password: 'testPassword',
    email: 'test@gmail.com',
    type: 'none',
  };
  beforeAll(async () => {
    dbReports = app.context.orm.sequelize;
    await dbReports.sync({ force: true });
    await app.context.orm.user.create(userFields);

    const authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await dbReports.close();
  });

  describe('POST /api/comments/:comment_id/reports', () => {
    let userExtra;
    let property;
    let comment;

    const userDataExtra = {
      username: 'testUsernameExtra',
      password: 'testPasswordExtra',
      email: 'testExtra@gmail.com',
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
      content: 'Test of a comment',
    };

    const reportData = {
      content: 'Test of a report to comment',
    };

    const authorizedPostReportComment = (id, body) => request
      .post(`/api/comments/${id}/reports`)
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    const unauthorizedPostReportComment = (id, body) => request
      .post(`/api/comments/${id}/reports`)
      .set('Content-type', 'application/json')
      .send(body);

    beforeAll(async () => {
      userExtra = await app.context.orm.user.create(userDataExtra);
      propertyData.userId = userExtra.id;
      property = await app.context.orm.property.create(propertyData);
      commentData.propertyId = property.id;
      // TODO: cambiar el nombre de la base de datos a comment
      comment = await app.context.orm.Comment.create(commentData);
    });

    describe('report data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPostReportComment(comment.id, reportData);
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
        const sanitiziedReport = {
          content,
        };
        expect(sanitiziedReport).toEqual(reportData);
      });
    });

    describe('report data is invalid', () => {
      test('responds with 400 status code', async () => {
        const invalidBodies = [
          {},
          { contenido: 'Test of content' },
          { content: '' },
        ];
        await Promise.all(invalidBodies.map(authorizedPostReportComment))
          .then((responses) => {
            responses.forEach((response) => expect(response.status).toBe(400));
          });
      });
    });

    describe('report data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        const response = await unauthorizedPostReportComment(reportData);
        expect(response.status).toBe(401);
      });
    });

    describe('when passed id does not correspond to any comment', () => {
      test('responds with 404 status code', async () => {
        const response = await authorizedPostReportComment(comment.id * -1, reportData);
        expect(response.status).toBe(404);
      });
    });
  });
});
