const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const ReportSerializer = new JSONAPISerializer('report', {
  attributes: ['model', 'modelId', 'userId', 'content'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

router.post('comment.report.create', 'comments/:comment_id/reports', async (ctx) => {
  const { currentUser } = ctx.state;
  const commentReports = await ctx.orm.Comment.findByPk(ctx.params.comment_id);
  if (!commentReports) ctx.throw(404, 'The comment is not exists');
  if (commentReports.userId === currentUser.id) ctx.throw(404, 'You can´t create a report of your comment');
  if (!ctx.request.body.content) ctx.throw(404, 'The content of the report can´t be empty');
  const reportBuild = {
    model: 'Comment',
    modelId: commentReports.id,
    userId: currentUser.id,
    content: ctx.request.body.content,
  };
  try {
    const report = await ctx.orm.report.build(reportBuild);
    await report.save({ fields: ['model', 'modelId', 'userId', 'content'] });
    ctx.status = 201;
    ctx.body = ReportSerializer.serialize(report);
  } catch (error) {
    ctx.throw(500, 'Internal server error');
  }
});

// TODO: create seeds for commentaries

module.exports = router;
