const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const ReportsSerializer = new JSONAPISerializer('reports', {
  attributes: ['model', 'modelId', 'userId', 'content'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

router.get('api.admin.reports.list', '/reports', async (ctx) => {
  const { currentUser } = ctx.state;
  if (currentUser.type === 'none') ctx.throw(401, 'You don´t have access of Admin');

  try {
    const reports = await ctx.orm.report.findAll();
    ctx.body = ReportsSerializer.serialize(reports);
    ctx.status = 200;
  } catch (error) {
    ctx.throw(500, 'Internal server error');
  }
});

router.delete('api.delete.users', '/users/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  if (currentUser.type !== 'admin') ctx.throw(401, 'You don´t have access of Admin');

  const userDelete = await ctx.orm.user.findByPk(ctx.params.id);

  if (!userDelete) ctx.throw(404, 'The user you are looking for it does not exists');

  try {
    await userDelete.destroy();
    ctx.status = 202;
    ctx.body = {
      request: 'Accepted',
    };
  } catch (error) {
    ctx.throw(400, error);
  }
});

router.delete('api.delete.properties', '/properties/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  if (currentUser.type === 'none') ctx.throw(401, 'You don´t have access of Admin');

  const propertyDelete = await ctx.orm.property.findByPk(ctx.params.id);

  if (!propertyDelete) ctx.throw(404, 'The property you are looking for it does not exists');

  if (propertyDelete.state !== 'on sale' && propertyDelete.state !== 'rent') ctx.throw(404, 'The property state is not in sale or on rent');

  try {
    await propertyDelete.destroy();
    ctx.status = 202;
    ctx.body = {
      request: 'Accepted',
    };
  } catch (error) {
    ctx.throw(400, error);
  }
});

router.delete('api.delete.commentaries', '/properties/:property_id/comments/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  if (currentUser.type === 'none') ctx.throw(401, 'You don´t have access of Admin');

  const property = await ctx.orm.property.findByPk(ctx.params.property_id);
  if (!property) ctx.throw(404, 'The property you are looking for it does not exists');

  // TODO: cambiar commentary a comment porque la michi cambio el nombre del modelo
  const commentDelete = await ctx.orm.Comment.findByPk(ctx.params.id);
  if (!commentDelete) ctx.throw(404, 'The comment you are looking for it does not exists');

  if (property.id !== commentDelete.propertyId) ctx.throw(404, 'The model not belongs to the property');

  try {
    await commentDelete.destroy();
    ctx.status = 202;
    ctx.body = {
      request: 'Accepted',
    };
  } catch (error) {
    ctx.throw(400, error);
  }

  // TODO: probar que elimine las cosas el admin (las ultimos 2 deletes) y testear todos los delete
});
module.exports = router;
