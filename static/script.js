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

function getConfidenceMessage(confidence) {
    const high = [
        "🔥 You look super confident today!",
        "😎 Confidence level is sky-high!",
        "💪 Keep that energy up, you’re glowing!",
        "👏 That’s the confidence we love to see!"
    ];

    const medium = [
        "🙂 Looking good, but you can shine even brighter!",
        "😉 Confidence is decent — a little boost will go a long way.",
        "👌 Almost there! Just a small step to full confidence."
    ];

    const low = [
        "🤔 You seem a bit low on confidence...",
        "😅 Confidence could use a refresh!",
        "🧴 Try a facial wash to boost your confidence!",
        "✨ A quick wash and you’ll feel brand new!"
    ];

    if (confidence >= 80) {
        return high[Math.floor(Math.random() * high.length)];
    } else if (confidence >= 70) {
        return medium[Math.floor(Math.random() * medium.length)];
    } else {
        return low[Math.floor(Math.random() * low.length)];
    }
}

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
        if (data.score) {
            const msg = getConfidenceMessage(data.score);
            const scoreDiv = document.getElementById("score");
            scoreDiv.innerHTML = `
            Confidence: <b>${data.score}%</b><br>
            <span style="font-size:0.9rem;">${msg}</span>
        `;
        }
    });
});

const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {
    const resultDiv = document.getElementById("capture-result");
    resultDiv.innerHTML = ""; // Clear all captured images
});
