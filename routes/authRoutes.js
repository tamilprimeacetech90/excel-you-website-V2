console.log("✅ authRoutes loaded");

const express = require("express");
const passport = require("passport");

const router = express.Router();

// =========================
// GOOGLE LOGIN
// =========================

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/student-login.html"
  }),
  (req, res) => {

    req.session.authMode = null;

    req.login(req.user, (err) => {

      if (err) {
        console.error(err);
        return res.redirect(
          "/student-login.html?error=session"
        );
      }

      return res.redirect("/student.html");
    });

  }
);

// =========================
// GOOGLE SIGNUP
// =========================

router.get(
  "/google-signup",
  (req, res, next) => {

    req.session.authMode = "signup";

    next();

  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

router.get(
  "/google-signup/callback",
  passport.authenticate("google", {
    failureRedirect:
      "/student-login.html?error=email_exists"
  }),
  (req, res) => {

    req.session.authMode = null;

    req.login(req.user, (err) => {

      if (err) {
        return res.redirect(
          "/student-login.html?error=session"
        );
      }

      return res.redirect("/student.html");
    });

  }
);

// =========================
// GITHUB LOGIN
// =========================

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"]
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/student-login.html"
  }),
  (req, res) => {

    req.session.authMode = null;

    req.login(req.user, (err) => {

      if (err) {
        return res.redirect(
          "/student-login.html?error=session"
        );
      }

      return res.redirect("/student.html");
    });

  }
);

// =========================
// GITHUB SIGNUP
// =========================

router.get(
  "/github-signup",
  (req, res, next) => {

    req.session.authMode = "signup";

    next();

  },
  passport.authenticate("github", {
    scope: ["user:email"]
  })
);

router.get(
  "/github-signup/callback",
  passport.authenticate("github", {
    failureRedirect:
      "/student-login.html?error=email_exists"
  }),
  (req, res) => {

    req.session.authMode = null;

    req.login(req.user, (err) => {

      if (err) {
        return res.redirect(
          "/student-login.html?error=session"
        );
      }

      return res.redirect("/student.html");
    });

  }
);

// =========================
// LOGOUT
// =========================

router.post("/logout", (req, res) => {

  req.logout((err) => {

    if (err) {
      return res
        .status(500)
        .json({
          error: "Logout failed"
        });
    }

    req.session.destroy(() => {

      res.clearCookie("connect.sid");

      res.json({
        success: true
      });

    });

  });

});

module.exports = router;