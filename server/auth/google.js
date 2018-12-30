const router = require('express').Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { User } = require('../db/models');
module.exports = router;

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Google client ID / secret not found. Skipping Google OAuth.');
} else {
  const googleConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  };

  const verificationCallback = async (token, refreshToken, profile, done) => {
    // console.log('---', 'in verification callback', token, 'name', '---');

    // console.log(
    //   '---',
    //   'in verification callback',
    //   profile,
    //   'profile',
    //   '---'
    // );
    // done();
    try {
      const [user] = await User.findOrCreate({
        where: {
          googleId: profile.id,
        },
        defaults: {
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          imageUrl: profile.photos ? profile.photos[0].value : undefined,
        },
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  };
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const strategy = new GoogleStrategy(googleConfig, verificationCallback);

  passport.use(strategy);

  // Google authentication and login (GET /auth/google)
  router.get(
    '/',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get(
    '/callback',
    passport.authenticate('google', {
      successRedirect: '/home',
      failureRedirect: '/',
    })
  );
}
