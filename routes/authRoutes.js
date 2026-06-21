const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/student-login.html"
  }),
  (req, res) => {
<<<<<<< HEAD
    res.redirect("/student.html");
=======
    res.redirect("/");
>>>>>>> 799f15b94b74c72d8083a19c38c2a063ae00ff3f
  }
);

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
<<<<<<< HEAD
    res.redirect("/student.html");
=======
    res.redirect("/");
>>>>>>> 799f15b94b74c72d8083a19c38c2a063ae00ff3f
  }
);

module.exports = router;