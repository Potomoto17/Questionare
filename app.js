require('dotenv').config();
const createError       = require('http-errors');
const express           = require('express');
const path              = require('path');
const cookieParser      = require('cookie-parser');
const logger            = require('morgan');
const mongoose          = require('mongoose');
const session           = require('express-session');
const MongoStore        = require('connect-mongo');
const expressHandlebars = require('express-handlebars');

/* ---------- MongoDB ------------------------------------------------------ */
const mongoDB = 'mongodb://127.0.0.1/vaja3';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
mongoose.connection.on('error',
  console.error.bind(console, 'MongoDB connection error:'));

/* ---------- Routerji ----------------------------------------------------- */
const indexRouter     = require('./routes/index');
const usersRouter     = require('./routes/userRoutes');
const photosRouter    = require('./routes/photoRoutes');
const questionsRouter = require('./routes/questionroutes');

/* ---------- Express ------------------------------------------------------ */
const app = express();

/* ---------- Handlebars --------------------------------------------------- */
const hbsHelpers = {
  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('sl-SI', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },
  ifCond(v1, op, v2, options) {
    switch (op) {
      case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
      default:   return options.inverse(this);
    }
  }
};

app.engine('hbs', expressHandlebars.engine({
  extname: '.hbs',
  defaultLayout: 'layout',
  helpers: hbsHelpers
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/* ---------- Mid‑dle‑ware -------------------------------------------------- */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- Seja ---------------------------------------------------------- */
app.use(session({
  secret: process.env.SESSION_SECRET || 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoDB })
}));
app.use((req, res, next) => {
  res.locals.session = req.session;   // na voljo v vseh pogledih
  next();
});

/* ---------- Helper, ki pogojno vrne CSRF‑žeton --------------------------- */
app.use((req, res, next) => {
  res.locals.csrfToken = () => (req.csrfToken ? req.csrfToken() : '');
  next();
});

/* ---------- Mount routerjev ---------------------------------------------- */
app.use('/',         indexRouter);
app.use('/users',    usersRouter);
app.use('/photos',   photosRouter);
app.use('/questions', questionsRouter);

/* ---------- 404 ----------------------------------------------------------- */
app.use((req, res, next) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  next(createError(404));
});

/* ---------- Error handler ------------------------------------------------- */
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.redirect(req.originalUrl + '?error=Invalid CSRF token');
  }
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
