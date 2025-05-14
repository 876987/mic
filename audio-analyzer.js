// audio-analyzer.js

let ws;
const WS_URL = "wss://fyt-interview-fa9bf3d3321e.herokuapp.com/";
const CONNECT_TIMEOUT = 5000; // ms

async function startAudio() {
  try {
    // 1) Get mic access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("✅ Microphone access granted");

    // 2) Open WebSocket
    ws = new WebSocket(WS_URL);

    // 2a) Enforce a connection timeout
    const timeoutId = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.error("❌ WebSocket connection timeout");
        ws.close();
      }
    }, CONNECT_TIMEOUT);

    ws.onopen = () => {
      clearTimeout(timeoutId);
      console.log("✅ WebSocket connected");

      // 3) Start audio analysis
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const mic = audioContext.createMediaStreamSource(stream);
      mic.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function analyzeAudio() {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / bufferLength;
        const normalized = (avg / 255).toFixed(3);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ level: normalized }));
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
