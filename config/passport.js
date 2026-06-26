const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const Student = require("../models/Student");

// ======================
// GOOGLE LOGIN
// ======================

passport.use(
 new GoogleStrategy(
{
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},

async (req, accessToken, refreshToken, profile, done) => {
      try {

console.log("========== GOOGLE AUTH ==========");
console.log("AUTH MODE:", req.session.authMode);
        const googleEmail =
          profile.emails?.[0]?.value || "";

        console.log("EMAIL:", googleEmail);

        // Existing Google account
        let user = await Student.findOne({
          googleId: profile.id
        });

        if (user) {

          console.log("GOOGLE USER EXISTS");

          return done(null, user);

        }

        // Existing email account
user = await Student.findOne({
    email: googleEmail
});

if (user) {

    if (req.session.authMode === "login") {

        console.log("LOGIN -> Existing Email");

        if (!user.googleId) {

            user.googleId = profile.id;
            user.provider = "google";

            await user.save();

        }

        return done(null, user);

    }

    if (req.session.authMode === "signup") {

        console.log("SIGNUP -> Email Already Exists");

        return done(
            null,
            false,
            {
                message: "EMAIL_EXISTS"
            }
        );

    }

}

        // Create new student
        const newUser = await Student.create({

          username: profile.displayName,

          email: googleEmail,

          password: "GOOGLE_AUTH",

          googleId: profile.id,

          provider: "google",

          rank: "Beginner",

          xp: 0

        });

        console.log("NEW USER CREATED");

        return done(null, newUser);

      }
      catch (error) {

        console.error(error);

        return done(error, false);

      }

    }

  )
);

// ======================
// GITHUB LOGIN
// ======================

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      passReqToCallback: true
    },

async (req, accessToken, refreshToken, profile, done) => {
      try {

        const email =
          profile.emails?.length
            ? profile.emails[0].value
            : `${profile.username}@github.com`;

        let user = await Student.findOne({
          githubId: profile.id
        });

        if (user) {

          return done(null, user);

        }



     // Existing email account
user = await Student.findOne({
    email
});

if (user) {

    // LOGIN MODE
    if (req.session.authMode === "login") {

        console.log("LOGIN -> Existing GitHub Email");

        if (!user.githubId) {

            user.githubId = profile.id;
            user.provider = "github";

            await user.save();

        }

        return done(null, user);

    }

    // SIGNUP MODE
    if (req.session.authMode === "signup") {

        console.log("SIGNUP -> GitHub Email Already Exists");

        return done(
            null,
            false,
            {
                message: "EMAIL_EXISTS"
            }
        );

    }

}




        const newUser = await Student.create({

          username:
            profile.username || profile.displayName,

          email,

          password: "GITHUB_AUTH",

          githubId: profile.id,

          provider: "github",

          rank: "Beginner",

          xp: 0

        });

        return done(null, newUser);

      }
      catch (error) {

        console.error(error);

        return done(error, false);

      }

    }

  )
);

// ======================
// SESSION
// ======================

passport.serializeUser((user, done) => {

  done(null, user.id);

});

passport.deserializeUser(async (id, done) => {

  try {

    const user = await Student.findById(id);

    done(null, user);

  }
  catch (err) {

    done(err, null);

  }

});

module.exports = passport;