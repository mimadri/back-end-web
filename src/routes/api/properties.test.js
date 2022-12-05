/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const app = require('../../app');

const request = supertest(app.callback());

describe('Property API routes', () => {
  let user;
  let auth;
  let dbProperties;

  const userFields = {
    username: 'testUsername',
    password: 'testPassword',
    email: 'test@gmail.com',
    type: 'none',
  };
  beforeAll(async () => {
    dbProperties = app.context.orm.sequelize;
    await dbProperties.sync({ force: true });
    await app.context.orm.user.create(userFields);
    // await app.context.app.orm.property.create(propertyFields(user));
    const authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await dbProperties.close();
  });

  describe('GET /api/properties/:id', () => {
    let property;
    let response;
    const propertyData = {
      location: 'Test location',
      name: 'Test',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'this is a test of description',
    };
    const authorizedGetProperty = (id) => request
      .get(`/api/properties/${id}`)
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedGetProperty = (id) => request.get(`/api/properties/${id}`);

    beforeAll(async () => {
      property = await app.context.orm.property.create(propertyData);
    });

    describe('when passed id corresponds to and existing property', () => {
      beforeAll(async () => {
        response = await authorizedGetProperty(property.id);
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
        response = await authorizedGetProperty(property.id * -1);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetProperty(property.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('GET /api/properties/', () => {
    let response;
    const propertyOneData = {
      location: 'Test location one',
      name: 'Test one',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'this is a test of description one',
    };
    const propertyTwoData = {
      location: 'Test location two',
      name: 'Test two',
      state: 'on sale',
      userId: 1,
      price: 20000000,
      description: 'this is a test of description two',
    };
    const authorizedGetProperties = () => request
      .get('/api/properties/')
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedGetProperties = () => request.get('/api/properties');

    beforeAll(async () => {
      const propertyOne = await app.context.orm.property.create(propertyOneData);
      const propertyTwo = await app.context.orm.property.create(propertyTwoData);
      const properties = [propertyOne, propertyTwo];
    });

    describe('when recibe all the properties of the database', () => {
      beforeAll(async () => {
        response = await authorizedGetProperties();
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
        response = await unauthorizedGetProperties();
        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /api/properties', () => {
    const propertyData = {
      location: 'Test location one',
      name: 'Test one',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'this is a test of description one',
    };

    const authorizedPostProperty = (body) => request
      .post('/api/properties')
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    const unauthorizedPostProperty = (body) => request
      .post('/api/properties')
      .set('Content-type', 'application/json')
      .send(body);

    describe('property data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPostProperty(propertyData);
      });

      test('responds with 201 (created) status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response fot POST property has an id (property has an id)', () => {
        expect(response.body.data.id).toBeDefined();
      });

      test('response body matches snapshot', () => {
        expect(response.body).toMatchSnapshot();
      });

      test('post request actually created the given property', async () => {
        const property = await app.context.orm.property.findByPk(response.body.data.id);
        const {
          location,
          name,
          state,
          userId,
          price,
          description,
        } = property.dataValues;
        const sanitizedProperty = {
          location,
          name,
          state,
          userId,
          price,
          description,
        };
        expect(sanitizedProperty).toEqual(propertyData);
      });
    });

    describe('property data is invalid', () => {
      test('responds with 400 status code', async () => {
        const invalidBodies = [
          {},
          { location: 'Location test' },
          { name: 'Test name' },
          {
            ubicacion: 'Test location',
            nombre: 'Test',
            estado: 'on sale',
            usuarioId: 1,
            precio: 10000000,
            descripcion: 'this is a test of description',
          },
          {
            location: 'Test location',
            name: 'Test',
            state: 'on sale',
            userId: 1,
            price: '10000000abc',
            description: 'this is a test of description',
          },
        ];
        await Promise.all(invalidBodies.map(authorizedPostProperty))
          .then((responses) => {
            responses.forEach((response) => expect(response.status).toBe(400));
          });
      });
    });

    describe('property data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        const response = await unauthorizedPostProperty(propertyData);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /api/properties/:id', () => {
    let property;
    let propertyNew;
    let response;
    const propertyData = {
      location: 'Test location one',
      name: 'Test one',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'this is a test of description one',
    };
    const newPropertyData = {
      location: 'Test location two',
      name: 'Test two',
      state: 'on sale',
      userId: 1,
      price: 20000000,
      description: 'this is a test of description two',
    };
    const authorizedPatchProperty = (id, body) => request
      .patch(`/api/properties/${id}`)
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    const unauthorizedPatchProperty = (id, body) => request
      .patch(`/api/properties/${id}`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('when passed id corresponds to an existing property', () => {
      beforeAll(async () => {
        property = await app.context.orm.property.create(propertyData);
        response = await authorizedPatchProperty(property.id, newPropertyData);
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });

      test('response with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('patch request actually update the  given property', async () => {
        const propertyUpdated = await app.context.orm.property.findByPk(response.body.data.id);
        const {
          location,
          name,
          state,
          userId,
          price,
          description,
        } = propertyUpdated.dataValues;
        const sanitizedProperty = {
          location,
          name,
          state,
          userId,
          price,
          description,
        };
        expect(sanitizedProperty).toEqual(newPropertyData);
      });
    });

    describe('property data is invalid', () => {
      test('respond with 400 status code', async () => {
        const invalidBodies = [
          {},
          {
            location: 'Test location',
            name: 'Test',
            state: 'on sale',
            userId: 1,
            price: '10000000abc',
            description: 'this is a test of description',
          },
        ];
        await Promise.all(invalidBodies.map(authorizedPatchProperty))
          .then((responses) => {
            responses.forEach((responseInvalid) => expect(responseInvalid.status).toBe(400));
          });
      });
    });

    describe('when passed id does not correspond to any property', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedPatchProperty(property.id * -1, newPropertyData);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedPatchProperty(property.id, newPropertyData);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/properties/:id', () => {
    let property;
    let response;
    const propertyData = {
      location: 'Test location',
      name: 'Test',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'this is a test of description',
    };
    const authorizedDeleteProperty = (id) => request
      .delete(`/api/properties/${id}`)
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedDeleteProperty = (id) => request.delete(`/api/properties/${id}`);

    beforeAll(async () => {
      property = await app.context.orm.property.create(propertyData);
    });

    describe('when passed id corresponds to an existing property', () => {
      beforeAll(async () => {
        response = await authorizedDeleteProperty(property.id);
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
        response = await authorizedDeleteProperty(property.id * -1);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        property = await app.context.orm.property.create(propertyData);
      });
      test('responds with 401 status code', async () => {
        response = await unauthorizedDeleteProperty(property.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /api/properties/:property_id/meetings', () => {
    let property;
    let meeting;
    let response;
    let currentProperty;
    let newUserForPropertyId;
    const propertyData = {
      location: 'Beach',
      name: 'Beach house',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'Nice place in the beach',
    };
    const wantedMeeting = {
      date: '2021-01-12',
      hour: '12:30 pm',
    };
    const newPropertyData = {
      name: 'newProperty',
      location: 'santiago',
      state: 'metropolitana',
      price: 1000000,
      description: 'departamento',
      userId: 1,
    };
    const newUser = {
      username: 'newUser',
      email: 'newuser@uc.cl',
      password: 'password',
      type: 'none',
    };
    const authorizedPostMeeting = (id, body) => request
      .post(`/api/properties/${id}/meetings`)
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPostMeeting = (id, body) => request
      .post(`/api/properties/${id}/meetings`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('expect valid response', () => {
      beforeAll(async () => {
        const userBefore = await app.context.orm.user.findOne({
          where: { email: userFields.email },
        });
        newUserForPropertyId = await app.context.orm.user.create(newUser);
        newPropertyData.userId = newUserForPropertyId.id;
        property = await app.context.orm.property.create(newPropertyData);
        response = await authorizedPostMeeting(property.id, wantedMeeting);
      });
      test('responds with 201 (created) status code', () => {
        expect(response.status).toBe(201);
      });
      test('response with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
      test('post request actually created the given meeting', async () => {
        const meetingcreated = await app.context.orm.meeting.findByPk(response.body.data.id);
        const {
          date,
          hour,
        } = meetingcreated.dataValues;
        const sanitizedMeeting = {
          date,
          hour,
        };
        expect(sanitizedMeeting).toEqual(wantedMeeting);
      });
    });
  });

  describe('GET /api/properties/:property_id/meetings', () => {
    let property;
    let meeting;
    let response;
    const propertyData = {
      location: 'Beach',
      name: 'Beach house',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'Nice place in the beach',
    };
    const wantedMeetings = {
      buyerId: 1,
      sellerId: 1,
      propertyId: 1,
      date: '2021-01-12',
      hour: '12:30 pm',
    };
    const authorizedGetMeetings = (id, body) => request
      .get(`/api/properties/${id}/meetings`)
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedGetMeetings = (id, body) => request.get(`/api/properties/${id}/meetings`);

    beforeAll(async () => {
      property = await app.context.orm.property.create(propertyData);
      wantedMeetings.propertyId = property.id;
      meeting = await app.context.orm.meeting.create(wantedMeetings);
    });
    describe('when passed property_id has an existing meeting', () => {
      beforeAll(async () => {
        response = await authorizedGetMeetings(property.id, {});
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetMeetings(property.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('GET /api/properties/:property_id/comments', () => {
    let property;
    let comment;
    let response;
    const propertyData = {
      location: 'Beach',
      name: 'Beach house',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'Nice place in the beach',
    };
    const wantedComments = {
      userId: 1,
      propertyId: 1,
      content: 'Very nice place',
    };
    const authorizedGetComments = (id, body) => request
      .get(`/api/properties/${id}/comments`)
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedGetComments = (id, body) => request.get(`/api/properties/${id}/comments`);

    beforeAll(async () => {
      property = await app.context.orm.property.create(propertyData);
      wantedComments.propertyId = property.id;
      comment = await app.context.orm.Comment.create(wantedComments);
    });
    describe('when passed property_id has an existing comment', () => {
      beforeAll(async () => {
        response = await authorizedGetComments(property.id, {});
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedGetComments(property.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /api/properties/:property_id/comments', () => {
    let property;
    let comment;
    let response;
    let currentProperty;
    let newUserForPropertyId;
    const propertyData = {
      location: 'Beach',
      name: 'Beach house',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'Nice place in the beach',
    };
    const wantedComment = {
      content: 'Big house with nice view',
    };
    const newPropertyData = {
      name: 'newProperty',
      location: 'santiago',
      state: 'metropolitana',
      price: 1000000,
      description: 'departamento',
      userId: 1,
    };
    const newUser = {
      username: 'newUser',
      email: 'newuser@uc.cl',
      password: 'password',
      type: 'none',
    };
    const authorizedPostComment = (id, body) => request
      .post(`/api/properties/${id}/comments`)
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPostComment = (id, body) => request
      .post(`/api/properties/${id}/comments`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('expect valid response', () => {
      beforeAll(async () => {
        const userBefore = await app.context.orm.user.findOne({
          where: { email: userFields.email },
        });
        newUserForPropertyId = await app.context.orm.user.create(newUser);
        newPropertyData.userId = newUserForPropertyId.id;
        property = await app.context.orm.property.create(newPropertyData);
        response = await authorizedPostComment(property.id, wantedComment);
      });
      test('responds with 201 (created) status code', () => {
        expect(response.status).toBe(201);
      });
      test('response with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
      test('post request actually created the given comment', async () => {
        const commentcreated = await app.context.orm.Comment.findByPk(response.body.data.id);
        const {
          content,
        } = commentcreated.dataValues;
        const sanitizedComment = {
          content,
        };
        expect(sanitizedComment).toEqual(wantedComment);
      });
    });
  });

  describe('PATCH /api/properties/:property_id/comments/:id', () => {
    let property;
    let response;
    let comment;
    let newUserForCommentId;
    const propertyData = {
      location: 'Test location one',
      name: 'Test one',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'this is a test of description one',
    };
    const firstComment = {
      content: 'First big house with nice view',
    };
    const secondComment = {
      content: 'Second big house with nice view',
    };
    const newUser = {
      username: 'newUser',
      email: 'newuser@uc.cl',
      password: 'password',
      type: 'none',
    };
    const authorizedPatchComment = (propertyId, id, body) => request
      .patch(`/api/properties/${propertyId}/comments/${id}`)
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    const unauthorizedPatchComment = (propertyId, id, body) => request
      .patch(`/api/properties/${propertyId}/comments/${id}`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('when passed id corresponds to an existing property', () => {
      beforeAll(async () => {
        const currentUser = await app.context.orm.user.findOne({
          where: { email: userFields.email },
        });
        property = await app.context.orm.property.create(propertyData);
        newUserForCommentId = await app.context.orm.user.create(newUser);
        firstComment.userId = currentUser.id;
        firstComment.propertyId = property.id;
        comment = await app.context.orm.Comment.create(firstComment);
        response = await authorizedPatchComment(property.id, comment.id, secondComment);
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });

      test('response with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('patch request actually update the  given comment', async () => {
        const commentUpdated = await app.context.orm.Comment.findByPk(response.body.data.id);
        const {
          content,
        } = commentUpdated.dataValues;
        const sanitizedComment = {
          content,
        };
        expect(sanitizedComment).toEqual(secondComment);
      });
    });

    describe('comment data is invalid', () => {
      test('respond with 400 status code', async () => {
        const invalidBodies = [
          {},
          {
            context: 5,
          },
        ];
        await Promise.all(
          invalidBodies.map(
            (body) => authorizedPatchComment(property.id, comment.id, body),
          ),
        ).then((responses) => {
          responses.forEach((responseInvalid) => expect(responseInvalid.status).toBe(400));
        });
      });
    });

    describe('when passed id does not correspond to any property', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedPatchComment(property.id * -1, comment.id, secondComment);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedPatchComment(property.id, comment.id, secondComment);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/properties/:property_id/comments/:id', () => {
    let property;
    let comment;
    let response;
    const propertyData = {
      location: 'Test location',
      name: 'Test',
      state: 'on sale',
      userId: 1,
      price: 10000000,
      description: 'this is a test of description',
    };
    const anyComment = {
      content: 'Any big house with nice view',
    };
    const authorizedDeleteComment = (propertyId, id) => request
      .delete(`/api/properties/${propertyId}/comments/${id}`)
      .auth(auth.token, { type: 'bearer' });
    const unauthorizedDeleteComment = (propertyId, id) => request.delete(`/api/properties/${propertyId}/comments/${id}`);

    beforeAll(async () => {
      const currentUser = await app.context.orm.user.findOne({
        where: { email: userFields.email },
      });
      property = await app.context.orm.property.create(propertyData);
      anyComment.userId = currentUser.id;
      anyComment.propertyId = property.id;
      comment = await app.context.orm.Comment.create(anyComment);
    });

    describe('when passed id corresponds to an existing property', () => {
      beforeAll(async () => {
        response = await authorizedDeleteComment(property.id, comment.id);
      });

      test('responds with 202 status code', () => {
        expect(response.status).toBe(202);
      });

      test('property does not exists in the database', async () => {
        const commentDeleted = await app.context.orm.Comment.findByPk(comment.id);
        expect(commentDeleted).toBeNull();
      });
    });

    describe('when passed id does not correspond to any property', () => {
      beforeAll(async () => {
        property = await app.context.orm.property.create(propertyData);
        comment = await app.context.orm.Comment.create(anyComment);
      });
      test('responds with 404 status code', async () => {
        response = await authorizedDeleteComment(property.id * -1, comment.id);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        property = await app.context.orm.property.create(propertyData);
        comment = await app.context.orm.Comment.create(anyComment);
      });
      test('responds with 401 status code', async () => {
        response = await unauthorizedDeleteComment(property.id, comment.id);
        expect(response.status).toBe(401);
      });
    });
  });
});
