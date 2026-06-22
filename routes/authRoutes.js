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

    req.session.save(() => {

      res.redirect("/student.html");

    });

  }
);


router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/student-login.html"
  }),
  (req, res) => {

    req.session.save(() => {

      res.redirect("/student.html");

    });

  }
);
module.exports = router;