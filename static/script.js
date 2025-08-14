const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const scoreDiv = document.getElementById("score");
const captureBtn = document.getElementById("captureBtn");

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => alert("Camera access denied: " + err));

function getFrameDataURL() {
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
}

// Live confidence updater
// setInterval(() => {
//     const imageData = getFrameDataURL();
//     fetch("/live_confidence", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ image: imageData })
//     })
//     .then(res => res.json())
//     .then(data => {
//         if (data.confidence) {
//             scoreDiv.innerHTML = `Confidence: <b>${data.confidence}%</b>`;
//         }
//     });
// }, 500); // Update every 500ms

// Capture button to save image
captureBtn.addEventListener("click", () => {
    const imageData = getFrameDataURL(); // your existing function
    fetch("/capture_with_score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData })
    })
    .then(res => res.json())
    .then(data => {
        if (data.filename) {
            const resultDiv = document.getElementById("capture-result");
            resultDiv.innerHTML = `
                <img src="/static/captured/${data.filename}" style="max-width:500px; border:1px solid #ccc;"/>
            `;
        }
    });
});

const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {
    const resultDiv = document.getElementById("capture-result");
    resultDiv.innerHTML = ""; // Clear all captured images
});
