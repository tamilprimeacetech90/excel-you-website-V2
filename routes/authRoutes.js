console.log("✅ authRoutes loaded");

const express = require("express");
const passport = require("passport");

const router = express.Router();


// =======================================
// GOOGLE LOGIN
// =======================================

router.get(
"/google",
(req,res,next)=>{

    req.session.authMode="login";

    next();

},
passport.authenticate("google",{
    scope:["profile","email"],
    prompt:"select_account"
})
);

router.get(
    "/google/callback",
    (req, res, next) => {

        passport.authenticate(
            "google",
            (err, user, info) => {

                if (err) {
                    return res.redirect("/student-login.html?error=session");
                }

                // Existing email tried to sign up
                if (!user && info?.message === "EMAIL_EXISTS") {
                    return res.redirect(
                        "/student-login.html?error=email_exists"
                    );
                }

                if (!user) {
                    return res.redirect("/student-login.html");
                }

                req.login(user, err => {

                    if (err) {
                        return res.redirect("/student-login.html?error=session");
                    }

                    return res.redirect("/student.html");

                });

            }
        )(req, res, next);

    }
);

// =======================================
// GOOGLE SIGNUP
// =======================================

router.get(
    "/google-signup",
    (req, res, next) => {

        req.session.authMode = "signup";

 console.log("SET AUTH MODE:", req.session.authMode);

        next();

    },
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    })
);

router.get(
    "/google-signup/callback",
    (req, res, next) => {

        passport.authenticate(
            "google",
            (err, user, info) => {

                if (err) {
                    return res.redirect("/5newstudentsignupform.html?error=session");
                }

                if (!user && info?.message === "EMAIL_EXISTS") {

                    return res.redirect(
                        "/student-login.html?error=email_exists"
                    );

                }

                if (!user) {

                    return res.redirect(
                        "/5newstudentsignupform.html"
                    );

                }

                req.login(user, err => {

                    if (err) {
                        return res.redirect("/5newstudentsignupform.html?error=session");
                    }

                    return res.redirect("/student.html");

                });

            }

        )(req, res, next);

    }
);


// =======================================
// GITHUB LOGIN
// =======================================

router.get(
    "/github",
    (req, res, next) => {

        req.session.authMode = "login";

        console.log("SET AUTH MODE:", req.session.authMode);

        next();

    },
    passport.authenticate("github", {
        scope: ["user:email"]
    })
);

router.get(
    "/github/callback",
    (req, res, next) => {

        passport.authenticate(
            "github",
            (err, user, info) => {

                if (err) {
                    return res.redirect(
                        "/student-login.html?error=session"
                    );
                }

                if (!user && info?.message === "EMAIL_EXISTS") {

                    return res.redirect(
                        "/student-login.html?error=email_exists"
                    );

                }

                if (!user) {

                    return res.redirect(
                        "/student-login.html"
                    );

                }

                req.login(user, err => {

                    if (err) {
                        return res.redirect(
                            "/student-login.html?error=session"
                        );
                    }

                    return res.redirect("/student.html");

                });

            }

        )(req, res, next);

    }
);


// =======================================
// GITHUB SIGNUP
// =======================================

router.get(
    "/github-signup",
    (req, res, next) => {

        req.session.authMode = "signup";

        console.log("SET AUTH MODE:", req.session.authMode);

        next();

    },
    passport.authenticate("github", {
        scope: ["user:email"]
    })
);

router.get(
    "/github-signup/callback",
    (req, res, next) => {

        passport.authenticate(
            "github",
            (err, user, info) => {

                if (err) {

                    return res.redirect(
                        "/5newstudentsignupform.html?error=session"
                    );

                }

                if (!user && info?.message === "EMAIL_EXISTS") {

                    return res.redirect(
                        "/student-login.html?error=email_exists"
                    );

                }

                if (!user) {

                    return res.redirect(
                        "/5newstudentsignupform.html"
                    );

                }

                req.login(user, err => {

                    if (err) {

                        return res.redirect(
                            "/5newstudentsignupform.html?error=session"
                        );

                    }

                    return res.redirect("/student.html");

                });

            }

        )(req, res, next);

    }
);

// =======================================
// LOGOUT
// =======================================

router.post("/logout", (req, res) => {

    req.logout(err => {

        if (err) {
            return res.status(500).json({
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