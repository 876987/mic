// audio-analyzer.js

let ws;
const WS_URL = "wss://fyt-interview-fa9bf3d3321e.herokuapp.com/";
const CONNECT_TIMEOUT = 5000;

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

      const meter = document.getElementById("meter");
      const levelText = document.getElementById("level-text");

      function analyzeAudio() {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / bufferLength;
        const normalized = avg / 255;

        const percent = (normalized * 100).toFixed(1);
        meter.style.width = `${percent}%`;
        levelText.textContent = `Audio Level: ${normalized.toFixed(3)}`;

        if (ws.readyState === WebSocket.OPEN) {
          const payload = { level: normalized };
          ws.send(JSON.stringify(payload));
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
