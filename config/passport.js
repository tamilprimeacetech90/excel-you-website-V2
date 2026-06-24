const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const Student = require("../models/Student");

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);



// ======================
// GOOGLE LOGIN
// ======================

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["user:email"]
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("========== GOOGLE LOGIN ==========");
        console.log("PROFILE ID:", profile.id);
        console.log("PROFILE NAME:", profile.displayName);
        
        const googleEmail = profile.emails?.[0]?.value || "";
        console.log("PROFILE EMAIL:", googleEmail);

        // 1. First, find by Google ID to see if they logged in with Google before
        let user = await Student.findOne({ googleId: profile.id });

        console.log("Found by Google ID:", user);

        if (user) {
          console.log("Returning existing Google user");
          return done(null, user);
        }

        // 2. If not found by ID, check if their email exists from standard email signup
        if (googleEmail) {
          user = await Student.findOne({ email: googleEmail });
          console.log("Found by Email:", user);

          if (user) {
            user.googleId = profile.id;
            user.provider = "google";
            await user.save();
            console.log("Linked Google account to existing user");
            return done(null, user);
          }
        }

        // 3. Create a brand new user if they don't exist at all
        const newUser = await Student.create({
          username: profile.displayName,
          email: googleEmail || `${profile.id}@google.com`, // Fallback string just in case
          password: "GOOGLE_AUTH",
          googleId: profile.id,
          provider: "google"
        });

        console.log("Created New User:", newUser);
        return done(null, newUser);

      } catch (error) {
        console.error("GOOGLE STRATEGY ERROR");
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
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },

    async (accessToken, refreshToken, profile, done) => {

      try {

        console.log("========== GITHUB LOGIN ==========");
        console.log("PROFILE ID:", profile.id);
        console.log("USERNAME:", profile.username);
        console.log("DISPLAY NAME:", profile.displayName);

        const email =
          profile.emails && profile.emails.length
            ? profile.emails[0].value
            : `${profile.username}@github.com`;

        console.log("EMAIL:", email);

        // Find by GitHub ID
        let user = await Student.findOne({
          githubId: profile.id
        });

        console.log("Found by GitHub ID:", user);

        if (user) {

          console.log("Returning existing GitHub user");

          return done(null, user);

        }

        // Find by Email
        user = await Student.findOne({
          email
        });

        console.log("Found by Email:", user);

        if (user) {

          user.githubId = profile.id;
          user.provider = "github";

          await user.save();

          console.log("Linked GitHub account");

          return done(null, user);

        }

        // Create new user
        const newUser = await Student.create({

          username: profile.username || profile.displayName,

          email,

          password: "GITHUB_AUTH",

          githubId: profile.id,

          provider: "github"

        });

        console.log("Created New User:", newUser);

        return done(null, newUser);

      } catch (error) {

        console.error("GITHUB STRATEGY ERROR");
        console.error(error);

        return done(error, false);

      }

    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Student.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;