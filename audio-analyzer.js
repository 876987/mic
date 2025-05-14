
let ws;

function startAudio() {
  // Request microphone access
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      // Set up WebSocket connection
      ws = new WebSocket("wss://fyt-interview-fa9bf3d3321e.herokuapp.com/");

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        // Buffer for audio data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function analyzeAudio() {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;

          // Send audio data (normalized) through WebSocket
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ level: average / 255 }));
          }

          requestAnimationFrame(analyzeAudio);
        }
        
        analyzeAudio();
      };

      ws.onerror = () => {
        console.error('❌ WebSocket connection failed');
      };
    })
    .catch(err => {
      console.error('❌ Microphone access denied:', err);
    });
}
