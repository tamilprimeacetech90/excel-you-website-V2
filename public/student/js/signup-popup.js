
/* ==========================================
   EXCEL YOU — SIGNUP POPUP SERVICE
   Intercepts existing window.alert()
========================================== */

(() => {

    "use strict";

    const popup =
        document.getElementById("signupHudPopup");

    const messageBox =
        document.getElementById("signupHudMessage");

    const closeButton =
        document.getElementById("signupHudClose");

    if (!popup || !messageBox || !closeButton) {
        console.error("Signup HUD popup elements not found.");
        return;
    }

    let popupTimer = null;

    // SHOW POPUP

    function showSignupPopup(message) {

        clearTimeout(popupTimer);

        // Display the exact original alert message
        messageBox.textContent = String(message);

        popup.classList.remove("show");

        popup.setAttribute("aria-hidden", "false");

        // Restart progress animation
        const progress =
            popup.querySelector(".signup-hud-progress span");

        progress.style.animation = "none";

        void progress.offsetWidth;

        progress.style.animation = "";

        requestAnimationFrame(() => {

            popup.classList.add("show");

        });

        // Automatically close after 5 seconds
        popupTimer = setTimeout(() => {

            hideSignupPopup();

        }, 5000);

    }

    // HIDE POPUP

    function hideSignupPopup() {

        clearTimeout(popupTimer);

        popup.classList.remove("show");

        popup.setAttribute("aria-hidden", "true");

    }

    // CLOSE BUTTON

    closeButton.addEventListener("click", () => {

        hideSignupPopup();

    });

    // INTERCEPT EXISTING ALERT CALLS

    window.alert = function(message) {

        showSignupPopup(message);

    };

})();
