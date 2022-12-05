require('dotenv').config();
const koaRouter = require('koa-router');
const jwtGenerator = require('jsonwebtoken');

const router = koaRouter();

function generateToken(user) {
  return new Promise((resolve, reject) => {
    jwtGenerator.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: 3000 },
      (error, tokenResult) => (error ? reject(error) : resolve(tokenResult)),
    );
  });
}

router.post('api.auth.login', '/', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await ctx.orm.user.findOne({ where: { email } });
  if (!user) ctx.throw(404, `No user found with ${email}`);
  const authenticated = user.password === password;
  if (!authenticated) ctx.throw(401, 'Invalid password');
  try {
    const token = await generateToken(user);
    const toSendUser = { email, username: user.username };
    ctx.body = {
      ...toSendUser,
      token,
      token_type: 'Bearer',
    };
  } catch (error) {
    ctx.throw(501);
  }
});

module.exports = router;
