const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const csrf     = require('csurf');
const csrfProtection = csrf();

const upload = multer({ dest: 'public/images/' });
const photoCtrl = require('../controllers/photoController.js');

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.redirect('/users/login?error=You must be logged in');
}

/* ---------- GET ---------------------------------------------------------- */
router.get('/',            photoCtrl.list);
router.get('/publish',
  requiresLogin,
  csrfProtection,
  photoCtrl.publish
);
router.get('/:id',         photoCtrl.show);

/* ---------- file upload:  multer -> csrf -> controller ------------------- */
router.post(
  '/',
  requiresLogin,
  upload.single('image'),
  csrfProtection,
  photoCtrl.create
);

/* ---------- update / delete --------------------------------------------- */
router.put('/:id',    csrfProtection, photoCtrl.update);
router.delete('/:id', csrfProtection, photoCtrl.remove);

module.exports = router;
