const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Local authentication strategy
passport.use(new LocalStrategy({ 
    usernameField: 'email' 
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findByEmail(email);
      
      // If user not found
      if (!user) {
        return done(null, false, { message: 'Email not registered' });
      }
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }
      
      // Authentication successful
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Google authentication strategy - only if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_BASE}${process.env.GOOGLE_CALLBACK_URL}`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in database
        let user = await User.findByProviderId('google', profile.id);
      
        if (!user) {
          // Create new user if it doesn't exist
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: 'google',
            providerId: profile.id
          });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

// Facebook authentication strategy - only if credentials are available
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.API_BASE}${process.env.FACEBOOK_CALLBACK_URL}`,
      profileFields: ['id', 'displayName', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in database
        let user = await User.findByProviderId('facebook', profile.id);
        
        if (!user) {
          // Create new user if it doesn't exist
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          user = await User.create({
            name: profile.displayName,
            email: email,
            provider: 'facebook',
            providerId: profile.id
          });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

// Serialization and deserialization of user for session
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
