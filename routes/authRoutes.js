
console.log("✅ authRoutes loaded");
const express = require("express");
const passport = require("passport");

const router = express.Router();

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
    failureRedirect: "/student-login.html?error=email_exists"
  }),
  (req, res) => {
    req.login(req.user, (err) => {
      if (err) {
        console.error("Google req.login error:", err);
        return res.redirect("/student-login.html?error=session");
      }

      console.log("✅ Google Success:", req.user.email);

      return res.redirect("/student.html");
    });
  }
);


router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    allow_signup: true
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/student-login.html"
  }),
  (req, res) => {
    req.login(req.user, (err) => {
      if (err) {
        console.error("GitHub req.login error:", err);
        return res.redirect("/student-login.html?error=session");
      }
      console.log("GitHub Success:", req.user.email);
      return res.redirect("/student");
    });
  }
);

router.get(
  "/google-signup",
  (req, res, next) => {

    req.session.authMode = "signup";

    next();

  },
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

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


// Add logout for students - separate from admin logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
});

module.exports = router;
