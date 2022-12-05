require('dotenv').config();
const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const { apiSetCurrentUser } = require('../../middlewares/auth');
const auth = require('./auth');
const users = require('./users');
const properties = require('./properties');
const reports = require('./reports');
const admin = require('./admin');
const meetings = require('./meetings');

const router = new KoaRouter({ prefix: '/api' });

router.use('/auth', auth.routes());
router.use('/users', users.routes());

// Protected Routes
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);
router.use('/', reports.routes());
router.use('/admin', admin.routes());
router.use('/properties', properties.routes());
router.use('/meetings', meetings.routes());

module.exports = router;
