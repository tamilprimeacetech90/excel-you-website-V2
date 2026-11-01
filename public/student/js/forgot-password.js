
/* =========================================================
   EXCEL YOU — FORGOT PASSWORD POPUP
   Separate script: does not modify student-login.js
========================================================= */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        const forgotLink = document.getElementById("forgotPasswordLink");

        if (!forgotLink) return;

        let modal = null;
        let previouslyFocusedElement = null;
        let requestInProgress = false;
        let popupLoaded = false;

        const loadPopup = async () => {
            if (popupLoaded) return true;

            try {
                const response = await fetch("/student/forgot-password.html");

                if (!response.ok) {
                    throw new Error("Could not load forgot-password.html");
                }

                const html = await response.text();

                const container = document.createElement("div");
                container.innerHTML = html;

                document.body.appendChild(container);

                modal = document.getElementById("forgotPasswordOverlay");

                if (!modal) {
                    throw new Error("Forgot password popup HTML is missing.");
                }

                popupLoaded = true;
                initializePopup();

                return true;

            } catch (error) {
                console.error("Forgot Password:", error);
                alert("Unable to open the password reset window. Please try again.");
                return false;
            }
        };

        const initializePopup = () => {

            const dialog = modal.querySelector(".forgot-popup");
            const closeButton = document.getElementById("closeForgotPassword");
            const backButton = document.getElementById("backToLogin");
            const form = document.getElementById("forgotPasswordForm");
            const emailInput = document.getElementById("forgotEmail");
            const message = document.getElementById("forgotMessage");
            const submitButton = form?.querySelector(".forgot-submit");

            const showMessage = (text, type = "info") => {
                if (!message) return;

                message.textContent = text;
                message.dataset.state = type;
            };

            const clearMessage = () => {
                if (!message) return;

                message.textContent = "";
                delete message.dataset.state;
            };

         

            const closeModal = () => {
                if (requestInProgress) return;

                modal.classList.remove("active");
                modal.setAttribute("aria-hidden", "true");

                clearMessage();

                previouslyFocusedElement?.focus?.();
            };

            closeButton?.addEventListener("click", closeModal);
            backButton?.addEventListener("click", closeModal);

            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });

            document.addEventListener("keydown", (event) => {

                if (!modal.classList.contains("active")) return;

                if (event.key === "Escape") {
                    event.preventDefault();
                    closeModal();
                    return;
                }

                if (event.key === "Tab" && dialog) {

                    const focusable = [
                        ...dialog.querySelectorAll(
                            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
                        )
                    ].filter(element => element.offsetParent !== null);

                    if (!focusable.length) return;

                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];

                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            });

            form?.addEventListener("submit", async (event) => {

                event.preventDefault();

                if (requestInProgress || !emailInput) return;

                const email = emailInput.value.trim();

                if (!emailInput.checkValidity() || !email) {
                    emailInput.reportValidity();
                    return;
                }

                clearMessage();

                requestInProgress = true;

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "SENDING...";
                }

                try {

                    const response = await fetch(
                        "/api/student/forgot-password",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ email })
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Reset request failed");
                    }

                    showMessage(
                        "If an account matches that email, password-reset instructions will be sent shortly.",
                        "success"
                    );

                    form.reset();

                } catch (error) {

                    console.error(error);

                    showMessage(
                        "We couldn't process your request right now. Please try again in a moment.",
                        "error"
                    );

                } finally {

                    requestInProgress = false;

                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = "Send Reset Link";
                    }
                }
            });
        };
forgotLink.addEventListener("click", async (event) => {

    event.preventDefault();

    const loaded = await loadPopup();

    if (loaded && modal) {
        previouslyFocusedElement = forgotLink;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");

        const message = document.getElementById("forgotMessage");

        if (message) {
            message.textContent = "";
            delete message.dataset.state;
        }

        window.requestAnimationFrame(() => {
            document.getElementById("forgotEmail")?.focus();
        });
    }

});
    });
})();
