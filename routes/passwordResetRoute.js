
const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const {
    sendPasswordResetEmail
} = require("../services/brevoService");

// =====================================================
// FORGOT PASSWORD
// POST /api/student/forgot-password
// =====================================================

router.post("/forgot-password", async (req, res) => {

    try {

        const email = req.body.email
            ?.trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email address"
            });
        }

        const student = await Student.findOne({
            email: email
        });

        // Do not reveal whether an account exists.
        const response = {
            success: true,
            message: "If an account exists, a password reset link will be sent."
        };

        if (!student) {
            return res.json(response);
        }

        // OAuth accounts cannot reset a local password.
        if (
            student.provider &&
            student.provider !== "local"
        ) {
            return res.json(response);
        }

        // Generate a cryptographically secure token.
        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        // Hash the token before storing it.
        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Store token hash and expiry.
        student.resetPasswordTokenHash = resetTokenHash;

        student.resetPasswordExpires = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await student.save();

        // Generate reset link.
        const appUrl = process.env.APP_URL;

        if (!appUrl) {
            throw new Error("APP_URL is missing");
        }

        const resetLink =
            `${appUrl.replace(/\/+$/, "")}` +
            `/student-reset-password.html` +
            `?token=${resetToken}` +
            `&email=${encodeURIComponent(email)}`;

        // Send email through Brevo.
        try {

            await sendPasswordResetEmail(
                email,
                resetLink
            );

        } catch (emailError) {

            // Invalidate token if email delivery fails.
            student.resetPasswordTokenHash = null;
            student.resetPasswordExpires = null;

            await student.save();

            throw emailError;
        }

        return res.json(response);

    } catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to process your request. Please try again."
        });

    }

});


// =====================================================
// RESET PASSWORD
// POST /api/student/reset-password
// =====================================================

router.post("/reset-password", async (req, res) => {

    try {

        const {
            email,
            token,
            newPassword
        } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Missing required information"
            });
        }

        if (
            typeof newPassword !== "string" ||
            newPassword.length < 8 ||
            Buffer.byteLength(newPassword, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8 characters or longer and no more than 72 bytes."
            });
        }

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        // Hash the submitted token.
        const resetTokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find account with matching, unexpired token.
        const student = await Student.findOne({
            email: normalizedEmail,

            resetPasswordTokenHash: resetTokenHash,

            resetPasswordExpires: {
                $gt: new Date()
            }
        });

        if (!student) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired."
            });
        }

        // OAuth accounts cannot reset local passwords.
        if (
            student.provider &&
            student.provider !== "local"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please use your linked sign-in provider."
            });
        }

        // Hash new password.
        const hashedPassword = await bcrypt.hash(
            newPassword,
            12
        );

        student.password = hashedPassword;

        // Make token single-use.
        student.resetPasswordTokenHash = null;
        student.resetPasswordExpires = null;

        await student.save();

        return res.json({
            success: true,
            message: "Password reset successfully. Please log in."
        });

    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to reset your password. Please try again."
        });

    }

});

module.exports = router;
