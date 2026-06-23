const express = require("express");
const router = express.Router();

const Student =
    require("../models/Student");
const passport = require("passport");

// ======================
// SIGNUP
// ======================

router.post("/signup", async (req, res) => {

    try {

        const {
            username,
            email,
            password,
            gender,
            learningPath
        } = req.body;

        const existingStudent =
            await Student.findOne({
                email
            });

        if (existingStudent) {

            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });

        }

 const avatar =

    gender === "female"

        ? "/assets/avatars/female-beginner.png"

        : "/assets/avatars/male-beginner.png";

        const student =
             new Student({
             username,
             email,
             password,
             gender,
              learningPath,
             avatar
          });

       await student.save();

// Automatically log in the student
req.login(student, (err) => {

    if (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });

    }

    return res.json({
        success: true,
        student
    });

});

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});


// ======================
// LOGIN
// ======================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const student =
            await Student.findOne({
                email
            });

        if (!student) {

            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        if (student.password !== password) {

            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });

        }

       req.login(student, (err) => {

    if (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });

    }

    return res.json({

        success: true,

        student

    });

});

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});
// ======================
// CURRENT LOGGED-IN STUDENT
// ======================

router.get("/me", (req, res) => {

    if (!req.isAuthenticated()) {

        return res.json({
            success: false
        });

    }

    res.json({

        success: true,

        student: req.user

    });

});

module.exports = router;