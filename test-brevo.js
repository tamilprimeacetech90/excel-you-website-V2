
require("dotenv").config();

const {
    sendPasswordResetEmail
} = require("./services/brevoService");

sendPasswordResetEmail(
    "primeacetech21@gmail.com",
    "http://localhost:3000/test-reset-link"
)
.then(result => {
    console.log("Email sent successfully:", result);
})
.catch(error => {
    console.error("Email sending failed:", error);
});
