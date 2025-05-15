let ws;
const WS_URL = "wss://fyt-interview-fa9bf3d3321e.herokuapp.com/";
const CONNECT_TIMEOUT = 5000; // ms

const levelDisplay = document.createElement("div");
levelDisplay.style.position = "fixed";
levelDisplay.style.top = "20px";
levelDisplay.style.left = "20px";
levelDisplay.style.fontSize = "24px";
levelDisplay.style.color = "lime";
levelDisplay.style.fontFamily = "monospace";
levelDisplay.innerText = "Level: --";
document.body.appendChild(levelDisplay);

async function startAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("✅ Microphone access granted");

    ws = new WebSocket(WS_URL);

    const timeoutId = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.error("❌ WebSocket connection timeout");
        ws.close();
      }
    }, CONNECT_TIMEOUT);

    ws.onopen = () => {
      clearTimeout(timeoutId);
      console.log("✅ WebSocket connected");

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const mic = audioContext.createMediaStreamSource(stream);
      mic.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function analyzeAudio() {
        analyser.getByteFrequencyData(dataArray);

        const spectrum = Array.from(dataArray);
        const avg = spectrum.reduce((sum, v) => sum + v, 0) / spectrum.length;
        const normalized = (avg / 255).toFixed(3);
        levelDisplay.innerText = `Level: ${normalized}`;

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ spectrum }));
        }

        requestAnimationFrame(analyzeAudio);
      }

      analyzeAudio();
    };

    ws.onerror = (err) => {
      clearTimeout(timeoutId);
      console.error("❌ WebSocket error:", err);
    };

    ws.onclose = () => {
      clearTimeout(timeoutId);
      console.log("⚠️ WebSocket closed");
    };

  } catch (err) {
    console.error("❌ Microphone access denied or unavailable:", err);
    alert("Microphone access is required to continue.");
  }
}

startAudio();

