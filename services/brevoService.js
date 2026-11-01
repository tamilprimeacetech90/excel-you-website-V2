
async function sendPasswordResetEmail(recipientEmail, resetLink) {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is missing");
    }

    const response = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
            method: "POST",

            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },

            body: JSON.stringify({
                sender: {
                    name: process.env.BREVO_SENDER_NAME,
                    email: process.env.BREVO_SENDER_EMAIL
                },

                to: [
                    { email: recipientEmail }
                ],

                subject: "Reset Your EXCEL YOU Password",

                htmlContent: `
                    <div style="font-family:Arial,sans-serif;padding:25px;">
                        <h2>EXCEL YOU</h2>

                        <h3>Password Reset Request</h3>

                        <p>We received a request to reset your password.</p>

                        <p>
                            <a href="${resetLink}"
                               style="background:#0284c7;
                                      color:white;
                                      padding:12px 22px;
                                      text-decoration:none;
                                      border-radius:6px;">
                                Reset Password
                            </a>
                        </p>

                        <p>This link expires in 30 minutes.</p>

                        <p>If you did not request this, ignore this email.</p>
                    </div>
                `
            })
        }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            `Brevo email error (${response.status}): ${
                result.message || JSON.stringify(result)
            }`
        );
    }

    return result;
}

module.exports = { sendPasswordResetEmail };
