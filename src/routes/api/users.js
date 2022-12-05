const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const jwt = require('koa-jwt');
const { Op } = require('sequelize');
const { apiSetCurrentUser } = require('../../middlewares/auth');

const UserSerializer = new JSONAPISerializer('user', {
  attributes: ['id', 'username', 'password', 'email'],
  keyForAttribute: 'camelCase',
});

const MeetingSerializer = new JSONAPISerializer('meetings', {
  attributes: ['date', 'hour'],
  keyForAttribute: 'camelCase',
});

const ReportSerializer = new JSONAPISerializer('request', {
  attributes: ['model', 'modelId', 'userId', 'content'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

router.post('api.users.sign_up', '/', async (ctx) => {
  const user = ctx.orm.user.build(ctx.request.body);
  if (!validateEmail(user.email)) ctx.throw(400, 'Invalid email format');
  const userExists = await ctx.orm.user.findOne({ where: { email: user.email } });
  user.type = 'none';
  if (userExists) ctx.throw(400, 'User already exists');
  try {
    await user.save({ fields: ['username', 'email', 'password', 'type'] });
    ctx.status = 201;
    ctx.body = UserSerializer.serialize(user);
  } catch (validationError) {
    ctx.throw(400, 'There is an invalid value in the request ');
  }
});

router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);

router.get('api.users.info', '/me', async (ctx) => {
  const { currentUser } = ctx.state;
  ctx.body = UserSerializer.serialize(currentUser);
});

router.patch('api.users.edit', '/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  const { id } = ctx.params;
  if (Number(id) !== currentUser.id) ctx.throw(401, "You can't edit another user");
  if (!validateEmail(ctx.request.body.email)) ctx.throw(400, 'Invalid email format');
  try {
    await currentUser.update(ctx.request.body, { fields: ['username', 'email', 'password'] });
    ctx.status = 201;
    ctx.body = UserSerializer.serialize(currentUser);
  } catch (validationError) {
    ctx.throw(400, 'There is an invalid value in the request ');
  }
});

router.get('api.meetings.show', '/me/meetings', async (ctx) => {
  const { currentUser } = ctx.state;
  const meetings = await ctx.orm.meeting.findAll({
    where: {
      [Op.or]: [
        { buyerId: currentUser.id },
        { sellerId: currentUser.id },
      ],
    },
  });
  if (meetings.length === 0) {
    ctx.throw(404, 'The meeting you are looking for does not exist');
  }
  ctx.body = MeetingSerializer.serialize(meetings);
});

router.post('api.users.reports.create', '/:user_id/reports', async (ctx) => {
  const { currentUser } = ctx.state;
  const userReports = await ctx.orm.user.findByPk(ctx.params.user_id);
  if (!userReports) ctx.throw(404, 'The user to report is not found');
  if (userReports.id === currentUser.id) ctx.throw(400, 'You can´t create a report of yourself');
  if (!ctx.request.body.content) ctx.throw(404, 'The content of the report can´t be empty');
  const reportBuild = {
    model: 'user',
    modelId: userReports.id,
    userId: currentUser.id,
    content: ctx.request.body.content,
  };
  try {
    const report = await ctx.orm.report.build(reportBuild);
    await report.save({ fields: ['model', 'modelId', 'userId', 'content'] });
    ctx.status = 201;
    ctx.body = ReportSerializer.serialize(report);
  } catch (ValidationError) {
    ctx.throw(400, 'There is an invalid value in the request');
  }
});

module.exports = router;
