
console.log("✅ authRoutes loaded");
const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get("/google/callback", (req, res) => {
    console.log("===== GOOGLE CALLBACK =====");
    console.log(req.query);

    res.json(req.query);
});

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
    req.login(req.user, (err) => {
      if (err) {
        console.error("GitHub req.login error:", err);
        return res.redirect("/student-login.html?error=session");
      }
      console.log("GitHub Success:", req.user.email);
      return res.redirect("/student.html");
    });
  }
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
