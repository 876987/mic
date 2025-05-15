let ws;

function startAudio() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      ws = new WebSocket("wss://fyt-interview-fa9bf3d3321e.herokuapp.com/");

      ws.onopen = () => {
        console.log('✅ WebSocket connected');

        // 🔧 TEST MODE: Send fake data every 2 seconds
        function sendTestData() {
          setInterval(() => {
            const testData = {
              level: Math.random(),
              spectrum: Array.from({ length: 16 }, () => Math.random())
            };
            console.log("Sending test data:", testData);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(testData));
            }
          }, 2000);
        }

        sendTestData(); // ← starts sending fake spectrum
      };

      ws.onerror = () => {
        console.error('❌ WebSocket connection failed');
      };
    })
    .catch(err => {
      console.error('❌ Microphone access denied:', err);
    });
}
