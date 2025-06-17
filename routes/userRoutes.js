const express  = require('express');
const router   = express.Router();

const path     = require('path');
const multer   = require('multer');

const csrf     = require('csurf');
const csrfProtection = csrf();

const userCtrl = require('../controllers/userController.js');

/* -------------------------------------------------------------------------
   Multer – shranjevanje avatarjev
------------------------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../public/images/avatars')),
  filename: (req, file, cb) =>
    cb(null, req.session.userId + path.extname(file.originalname))
});
const upload = multer({ storage });

/* -------------------------------------------------------------------------
   Helper: zahteva prijavo
------------------------------------------------------------------------- */
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.redirect('/users/login?error=You must be logged in');
}

/* -------------------------------------------------------------------------
   GET – strani z obrazci najprej dobijo CSRF‑žeton
------------------------------------------------------------------------- */
router.get('/',          csrfProtection, userCtrl.list);
router.get('/register',  csrfProtection, userCtrl.showRegister);
router.get('/login',     csrfProtection, userCtrl.showLogin);
router.get('/profile',   requiresLogin, csrfProtection, userCtrl.profile);
router.get('/:id',       csrfProtection, userCtrl.show);

/* -------------------------------------------------------------------------
   POST / PUT / DELETE – preverimo CSRF‑žeton
------------------------------------------------------------------------- */
router.post('/register', csrfProtection, userCtrl.create);
router.post('/login',    csrfProtection, userCtrl.login);
router.post('/logout',   csrfProtection, userCtrl.logout);
router.put('/:id',       csrfProtection, userCtrl.update);
router.delete('/:id',    csrfProtection, userCtrl.remove);

/* -------------------------------------------------------------------------
   NALAGANJE AVATARJA
   1. multer prebere multipart/form‑data (vključno z _csrf poljem)
   2. csrfProtection preveri žeton
   3. controller shrani pot slike v bazo
------------------------------------------------------------------------- */
router.post(
  '/profile/avatar',
  requiresLogin,
  upload.single('avatar'),
  csrfProtection,
  userCtrl.uploadAvatar
);

module.exports = router;
