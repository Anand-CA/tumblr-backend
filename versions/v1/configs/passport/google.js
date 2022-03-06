const passport = require("passport");
const passportGoogle = require("passport-google-oauth");
const User = require("../../api/auth/auth.model");
require("dotenv").config();

const passportConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET_ID,
  callbackURL: "http://localhost:8000/api/v1/auth/google/redirect",
};

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new passportGoogle.OAuth2Strategy(passportConfig, async function (
      _,
      _,
      _,
      profile,
      done
    ) {
      let user = await User.findOne({
        email: profile.emails[0].value,
        source: "google",
      });
      if (!user) {
        user = await User.create({
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          source: "google",
        });
      }
      return done(null, user);
    })
  );
}
