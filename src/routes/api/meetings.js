const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const MeetingSerializer = new JSONAPISerializer('meetings', {
  attributes: ['date', 'hour'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

function validateHour(hour) {
  const re = /^\d{2}:\d{2} \w{2}$/;
  return re.test(hour);
}

router.get('api.meetings.getOne', '/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  const meeting = await ctx.orm.meeting.findByPk(ctx.params.id);
  if (!meeting) ctx.throw(404, 'The meeting you are looking for does not exist');
  if (!(meeting.buyerId === currentUser.id || meeting.sellerId === currentUser.id)) {
    ctx.throw(401, "You can't get other meetings that are not yours");
  }
  ctx.body = MeetingSerializer.serialize(meeting);
});

router.patch('api.meetings.edit', '/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  const { hour } = ctx.request.body;
  const meeting = await ctx.orm.meeting.findByPk(ctx.params.id);
  if (!meeting) ctx.throw(404, 'The meeting you are looking for does not exist');
  if (!(meeting.buyerId === currentUser.id || meeting.sellerId === currentUser.id)) {
    ctx.throw(401, "You can't edit other meetings that are not yours");
  }
  if (!validateHour(hour)) ctx.throw(400, 'Invalid hour format');
  try {
    await meeting.update(ctx.request.body, { fields: ['date', 'hour'] });
    ctx.status = 201;
    ctx.body = MeetingSerializer.serialize(meeting);
  } catch (error) {
    ctx.throw(400, 'There is an invalid value in the request');
  }
});

router.delete('api.meetings.delete', '/:id', async (ctx) => {
  const { currentUser } = ctx.state;
  const meeting = await ctx.orm.meeting.findByPk(ctx.params.id);
  if (!meeting) ctx.throw(404, 'The meeting you are looking for does not exist');
  if (!(meeting.buyerId === currentUser.id || meeting.sellerId === currentUser.id)) {
    ctx.throw(401, "You can't delete other meetings that are not yours");
  }
  try {
    await meeting.destroy();
    ctx.status = 200;
    ctx.body = { message: 'Meeting deleted successfully' };
  } catch (error) {
    ctx.throw(400, 'An error has ocurred, please try again later.');
  }
});

module.exports = router;
