const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const csrf     = require('csurf');
const csrfProtection = csrf();

const questionCtrl = require('../controllers/questionController.js');
const answerCtrl   = require('../controllers/answerController.js');

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.redirect('/users/login?error=You must be logged in');
}

/* ---------- CSRF za vse poti -------------------------------------------- */
router.use(csrfProtection);

/* ---------- GET ---------------------------------------------------------- */
router.get('/',         questionCtrl.list);
router.get('/publish',  requiresLogin, questionCtrl.publish);
router.get('/:id',      questionCtrl.show);

/* ---------- POST --------------------------------------------------------- */
router.post(
  '/',
  requiresLogin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  questionCtrl.create
);

router.post(
  '/:questionId/answers',
  requiresLogin,
  answerCtrl.create
);
router.post(
  '/:questionId/answers/:answerId/accept',
  requiresLogin,
  answerCtrl.accept
);

module.exports = router;
