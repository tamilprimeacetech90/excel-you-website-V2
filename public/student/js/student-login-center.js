const video = document.getElementById("robotVideo");
const canvas = document.getElementById("robotCanvas");

if (video && canvas) {
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    let isProcessing = false;

    video.addEventListener("loadedmetadata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;


        startRobot();
    });

    function processFrame() {
        if (video.paused || video.ended) {
            isProcessing = false;
            return;
        }

        isProcessing = true;

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const frame = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const data = frame.data;

        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];

            // ORIGINAL WORKING CHROMA KEY
            if (
                green > 90 &&
                green > red * 1.3 &&
                green > blue * 1.3
            ) {
                data[i + 3] = 0;
            }
        }

        ctx.putImageData(frame, 0, 0);

        requestAnimationFrame(processFrame);
    }

    async function startRobot() {
        try {
            await video.play();

            if (!isProcessing) {
                processFrame();
            }
        } catch (error) {
            console.error("Robot autoplay failed:", error);

            // Browser may block autoplay.
            // The video remains ready to start after user interaction.
        }
    }

    video.addEventListener("play", () => {
        if (!isProcessing) {
            processFrame();
        }
    });

    video.addEventListener("error", () => {
        console.error("ERROR: robot.mp4 could not be loaded.");
    });
}