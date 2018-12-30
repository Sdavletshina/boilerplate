const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 8080; // this can be very useful if you deploy to Heroku!
const db = require('./db');
// configure and create our database store
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const dbStore = new SequelizeStore({ db: db });

// This is a global Mocha hook, used for resource cleanup.
// Otherwise, Mocha v4+ never quits after tests.
if (process.env.NODE_ENV === 'test') {
  after('close the session store', () => dbStore.stopExpiringSessions());
}
//Client Id: 36788880895-4s2mj3vs4nf8r0v1l284kh3r8c5hsovp.apps.googleusercontent.com

//Secret: hLTVQD3X4PmiR25Y4jo85Qz4
/**
 * In your development environment, you can keep all of your
 * app's secret API keys in a file called `secrets.js`, in your project
 * root. This file is included in the .gitignore - it will NOT be tracked
 * or show up on Github. On your production server, you can add these
 * keys as environment variables, so that they can still be read by the
 * Node process on process.env
 */
if (process.env.NODE_ENV !== 'production') require('../.env');

// passport registration
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.models.user.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// sync so that our session table gets created
dbStore.sync();
//logging middleware
app.use(morgan('dev'));

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a wildly insecure secret',
    store: dbStore,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//static middleware
app.use(express.static(path.join(__dirname, '../public')));

// auth and 'API' routes
app.use('/auth', require('./auth'));
app.use('/api', require('./api'));

// // 404 middleware
// app.use((req, res, next) =>
//   path.extname(req.path).length > 0 ? res.status(404).send('Not found') : next()
// );

// send index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// error handling endware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

app.listen(port, function() {
  console.log('Knock, knock');
  console.log("Who's there?");
  console.log(`Your server, listening on port ${port}`);
});
module.exports = app;
