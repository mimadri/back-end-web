const supertest = require('supertest');
const app = require('../../app');

const request = supertest(app.callback());

describe('Meeting API routes', () => {
  let auth;
  let db;
  let meeting;
  let property;
  let currentUser;

  const userFields = {
    username: 'testUsername',
    password: 'testPassword',
    email: 'test@gmail.com',
    type: 'none',
  };
  const propertyData = {
    location: 'Test location',
    name: 'Test',
    state: 'on sale',
    userId: null,
    price: 10000000,
    description: 'this is a test of description',
  };
  const meetingData = {
    date: '2021-01-12',
    hour: '12:30 pm',
  };

  beforeAll(async () => {
    db = app.context.orm.sequelize;
    await db.sync({ force: true });
    await app.context.orm.user.create(userFields);

    const authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;

    currentUser = await app.context.orm.user.findOne({
      where: { email: userFields.email },
    });
    propertyData.userId = currentUser.id;
    meetingData.buyerId = currentUser.id;
    meetingData.sellerId = currentUser.id;
    property = await app.context.orm.property.create(propertyData);
    meetingData.propertyId = property.id;
    meeting = await app.context.orm.meeting.create(meetingData);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('GET /api/meetings/:id', () => {
    let response;

    const authorizedGetMeeting = (id) => request
      .get(`/api/meetings/${id}`)
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedGetMeeting = (id) => request.get(`/api/meetings/${id}`);

    describe('when passed id corresponds to and existing meeting', () => {
      beforeAll(async () => {
        response = await authorizedGetMeeting(meeting.id);
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

    describe('when passed id does not correspond to any author', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedGetMeeting(meeting.id * -1);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetMeeting(meeting.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /api/meetings/:id', () => {
    let response;

    const newMeetingData = {
      date: '2021-01-12',
      hour: '05:30 am',
    };
    const authorizedPatchMeeting = (id, body) => request
      .patch(`/api/meetings/${id}`)
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    const unauthorizedPatchMeeting = (id, body) => request
      .patch(`/api/meetings/${id}`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('when passed id corresponds to an existing meeting', () => {
      beforeAll(async () => {
        response = await authorizedPatchMeeting(meeting.id, newMeetingData);
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });

      test('response with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('patch request actually update the  given meeting', async () => {
        const meetingUpdated = await app.context.orm.meeting.findByPk(response.body.data.id);
        const {
          date,
          hour,
        } = meetingUpdated.dataValues;
        const sanitizedMeeting = {
          date,
          hour,
        };
        expect(sanitizedMeeting).toEqual(newMeetingData);
      });
    });

    describe('meeting data is invalid', () => {
      test('respond with 400 status code', async () => {
        const invalidBodies = [
          {},
          {
            date: '2021-01-12',
            hour: '05:30',
          },
        ];
        await Promise.all(invalidBodies.map(authorizedPatchMeeting))
          .then((responses) => {
            responses.forEach((responseInvalid) => expect(responseInvalid.status).toBe(400));
          });
      });
    });

    describe('when passed id does not correspond to any meeting', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedPatchMeeting(meeting.id * -1, newMeetingData);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedPatchMeeting(meeting.id, newMeetingData);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/meeting/:id', () => {
    let response;
    let forDeleteMeeting;

    const authorizedDeleteMeeting = (id) => request
      .delete(`/api/meetings/${id}`)
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedDeleteMeeting = (id) => request.delete(`/api/meetings/${id}`);

    describe('when passed id corresponds to an existing meeting', () => {
      beforeAll(async () => {
        forDeleteMeeting = await app.context.orm.meeting.create(meetingData);
        response = await authorizedDeleteMeeting(forDeleteMeeting.id);
      });

      test('responds with 202 status code', () => {
        expect(response.status).toBe(200);
      });

      test('meeting does not exists in the database', async () => {
        const meetingDeleted = await app.context.orm.meeting.findByPk(forDeleteMeeting.id);
        expect(meetingDeleted).toBeNull();
      });
    });

    describe('when passed id does not correspond to any meeting', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedDeleteMeeting(meeting.id * -1);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedDeleteMeeting(meeting.id);
        expect(response.status).toBe(401);
      });
    });
  });
});
