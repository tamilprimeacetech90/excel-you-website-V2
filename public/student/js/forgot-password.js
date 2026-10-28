/* =========================================================
   EXCEL YOU — FORGOT PASSWORD POPUP
   Separate script: does not modify student-login.js
========================================================= */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        const forgotLink = document.getElementById("forgotPasswordLink");
        const modal = document.getElementById("forgotPasswordModal");

        // If the popup HTML has not been added yet, leave the login page alone.
        if (!forgotLink || !modal) return;

        const dialog = modal.querySelector(".forgot-modal__dialog");
        const closeButton = document.getElementById("forgotPasswordClose");
        const backButton = document.getElementById("forgotPasswordBack");
        const form = document.getElementById("forgotPasswordForm");
        const emailInput = document.getElementById("forgotPasswordEmail");
        const message = document.getElementById("forgotPasswordMessage");
        const submitButton = document.getElementById("forgotPasswordSubmit");
        const submitLabel = submitButton?.querySelector(".forgot-modal__submit-label");

        let previouslyFocusedElement = null;
        let requestInProgress = false;

        const showMessage = (text, type = "info") => {
            if (!message) return;
            message.textContent = text;
            message.dataset.state = type;
            message.hidden = false;
        };

        const clearMessage = () => {
            if (!message) return;
            message.textContent = "";
            message.hidden = true;
            delete message.dataset.state;
        };

        const openModal = () => {
            previouslyFocusedElement = document.activeElement;
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("forgot-modal-open");
            clearMessage();

            window.requestAnimationFrame(() => {
                emailInput?.focus();
                if (dialog && !emailInput) dialog.focus();
            });
        };

        const closeModal = () => {
            if (requestInProgress) return;
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("forgot-modal-open");
            clearMessage();
            previouslyFocusedElement?.focus?.();
        };

        forgotLink.addEventListener("click", (event) => {
            event.preventDefault();
            openModal();
        });

        closeButton?.addEventListener("click", closeModal);
        backButton?.addEventListener("click", closeModal);

        modal.querySelectorAll("[data-forgot-close]").forEach((element) => {
            element.addEventListener("click", closeModal);
        });

        document.addEventListener("keydown", (event) => {
            if (!modal.classList.contains("is-open")) return;

            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
                return;
            }

            // Keep keyboard focus inside the open dialog.
            if (event.key === "Tab" && dialog) {
                const focusable = [...dialog.querySelectorAll(
                    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )].filter((element) => element.offsetParent !== null);

                if (!focusable.length) {
                    event.preventDefault();
                    dialog.focus();
                    return;
                }

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
            if (submitButton) submitButton.disabled = true;
            if (submitLabel) submitLabel.textContent = "SENDING...";

            try {
                const response = await fetch("/api/student/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                if (!response.ok) {
                    throw new Error("Reset request failed");
                }

                // Use a generic response so the page does not disclose whether
                // an email address is registered with the service.
                showMessage(
                    "If an account matches that email, password-reset instructions will be sent shortly.",
                    "success"
                );
                form.reset();
            } catch (error) {
                showMessage(
                    "We couldn't process your request right now. Please try again in a moment.",
                    "error"
                );
            } finally {
                requestInProgress = false;
                if (submitButton) submitButton.disabled = false;
                if (submitLabel) submitLabel.textContent = "SEND RESET LINK";
            }
        });
    });
})();
