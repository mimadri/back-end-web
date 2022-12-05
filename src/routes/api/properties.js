/* eslint-disable no-param-reassign */
const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const PropertySerializer = new JSONAPISerializer('property', {
  attributes: ['location', 'name', 'state', 'price', 'description'],
  keyForAttribute: 'camelCase',
});

const MeetingSerializer = new JSONAPISerializer('meetings', {
  attributes: ['date', 'hour'],
  keyForAttribute: 'camelCase',
});

const CommentSerializer = new JSONAPISerializer('Comments', {
  attributes: ['content'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

const { Op } = require('sequelize');

function validateHour(hour) {
  const re = /^\d{2}:\d{2} \w{2}$/;
  return re.test(hour);
}

router.get('api.properties.list', '/', async (ctx) => {
  const properties = await ctx.orm.property.findAll({
    where: {
      [Op.or]: [
        { state: 'on sale' },
        { state: 'rent' },
      ],
    },
  });
  ctx.body = PropertySerializer.serialize(properties);
});

router.get('api.properties.show', '/:id', async (ctx) => {
  const property = await ctx.orm.property.findByPk(ctx.params.id);
  if (!property) {
    ctx.throw(404, 'The property you are looking for it does not exists');
  }
  ctx.body = PropertySerializer.serialize(property);
});

router.post('api.properties.create', '/', async (ctx) => {
  const { currentUser } = ctx.state;

  if (!Number.isInteger(ctx.request.body.price)) {
    ctx.throw(400, 'The value of price is invalid');
  }

  try {
    ctx.request.body.userId = currentUser.id;
    const property = ctx.orm.property.build(ctx.request.body);
    await property.save({ fields: ['location', 'name', 'state', 'userId', 'price', 'description'] });
    ctx.status = 201;
    ctx.body = PropertySerializer.serialize(property);
  } catch (ValidationError) {
    ctx.throw(400, 'There is an invalid value in the request ');
  }
});

router.patch('api.properties.update', '/:id', async (ctx) => {
  const property = await ctx.orm.property.findByPk(ctx.params.id);

  if (!property) {
    ctx.throw(404, 'The property you are looking for it does not exists');
  }
  const paramsProperty = ctx.request.body;

  if (!Number.isInteger(ctx.request.body.price)) {
    ctx.throw(400, 'The value of price is invalid');
  }
  try {
    await property.update(paramsProperty, { fields: ['location', 'name', 'state', 'price', 'description'] });
    ctx.status = 201;
    ctx.body = PropertySerializer.serialize(property);
  } catch (ValidationError) {
    ctx.throw(400, 'There is an invalid value in the request ');
  }
});

router.delete('api.properties.delete', '/:id', async (ctx) => {
  const property = await ctx.orm.property.findByPk(ctx.params.id);
  if (!property) {
    ctx.throw(404, 'The property you are looking for it does not exists');
  }

  if (property.state !== 'on sale' && property.state !== 'rent') ctx.throw(404, 'The property state is not in sale or on rent');

  try {
    await property.destroy();
    ctx.status = 202;
    ctx.body = {
      request: 'Accepted',
    };
  } catch (error) {
    ctx.throw(400, error);
  }
});

// crear una reunión virtual para visitar la propiedad
router.post('api.meetings.create', '/:property_id/meetings', async (ctx) => {
  const { currentUser } = ctx.state;
  const { hour } = ctx.request.body;
  const property = await ctx.orm.property.findByPk(ctx.params.property_id, { include: ['meetings'] });
  if (!property) ctx.throw(400, 'Property does not exist');
  if (!validateHour(hour)) ctx.throw(400, 'Invalid hour format');
  if (currentUser.id === property.userId) ctx.throw(400, 'You can not create a meeting with yourself');
  ctx.request.body.buyerId = currentUser.id;
  ctx.request.body.sellerId = property.userId;
  ctx.request.body.propertyId = property.id;
  try {
    const meeting = ctx.orm.meeting.build(ctx.request.body);
    await meeting.save({ fields: ['buyerId', 'sellerId', 'propertyId', 'date', 'hour'] });
    ctx.status = 201;
    ctx.body = MeetingSerializer.serialize(meeting);
  } catch (ValidationError) {
    ctx.throw(404, 'There is an invalid value in the request');
  }
});

// obtener colección de reuniones de una propiedad
router.get('api.meetings.show', '/:property_id/meetings', async (ctx) => {
  const property = await ctx.orm.property.findByPk(ctx.params.property_id, { include: ['meetings'] });
  const meetings = await ctx.orm.meeting.findAll({ where: { propertyId: property.id } });
  if (meetings.length === 0) {
    ctx.throw(404, 'The meeting you are looking for does not exist');
  }
  ctx.body = MeetingSerializer.serialize(meetings);
});

// obtener colección de comentarios de una propiedad
router.get('api.comments.show', '/:property_id/comments', async (ctx) => {
  const property = await ctx.orm.property.findByPk(ctx.params.property_id, { include: ['Comments'] });
  if (!property) ctx.throw(400, 'Property does not exist');
  const comments = await ctx.orm.Comment.findAll({ where: { propertyId: property.id } });
  if (comments.length === 0) {
    ctx.throw(404, 'The comment you are looking for does not exist');
  }
  ctx.body = CommentSerializer.serialize(comments); // Hacer un serializer para los comentarios
});

// crear un comentario para una propiedad
router.post('api.comments.create', '/:property_id/comments', async (ctx) => {
  const { currentUser } = ctx.state;
  const property = await ctx.orm.property.findByPk(ctx.params.property_id, { include: ['Comments'] });
  if (!property) ctx.throw(400, 'Property does not exist');
  ctx.request.body.userId = currentUser.id;
  ctx.request.body.propertyId = property.id;
  try {
    const comment = ctx.orm.Comment.build(ctx.request.body);
    await comment.save({ fields: ['userId', 'propertyId', 'content'] });
    ctx.status = 201;
    ctx.body = CommentSerializer.serialize(comment);
  } catch (ValidationError) {
    ctx.throw(404, 'There is an invalid value in the request');
  }
});

// borrar un comentario de una propiedad
router.delete('api.comments.delete', '/:property_id/comments/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  const property = await ctx.orm.property.findByPk(ctx.params.property_id, { include: ['Comments'] });
  const { id } = ctx.params;
  if (!property) {
    ctx.throw(404, 'The property you are looking for it does not exists');
  }
  const commentToDelete = await ctx.orm.Comment.findByPk(id);
  if (!commentToDelete) {
    ctx.throw(404, 'The comment you are looking for it does not exists');
  }
  if (currentUser.id !== commentToDelete.userId) {
    ctx.throw(401, 'You can not delete a comment that you did not create');
  }
  try {
    await commentToDelete.destroy();
    ctx.status = 202;
    ctx.body = {
      message: 'The comment has been deleted.',
    };
  } catch (error) {
    ctx.throw(400, error);
  }
});

// modificar un comentario de una propiedad
router.patch('api.comments.update', '/:property_id/comments/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  // eslint-disable-next-line camelcase
  const { id, property_id } = ctx.params;
  const property = await ctx.orm.property.findByPk(property_id);
  const commentToModify = await ctx.orm.Comment.findByPk(id);
  if (!property) ctx.throw(404, 'The property you are looking for does not exist');
  if (!commentToModify) ctx.throw(404, 'The comment you are looking for does not exist');
  if (currentUser.id !== commentToModify.userId) {
    ctx.throw(404, 'You can not modify a comment that you did not create');
  }
  const newContent = ctx.request.body;
  if (newContent.content === undefined) {
    ctx.throw(400, 'You must enter new content');
  }
  try {
    await commentToModify.update(newContent, { fields: ['content'] });
    ctx.status = 201;
    ctx.body = CommentSerializer.serialize(commentToModify);
  } catch (ValidationError) {
    ctx.throw(400, 'There is an invalid value in the request ');
  }
});

module.exports = router;
