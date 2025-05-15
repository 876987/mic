let ws;

function startAudio() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      ws = new WebSocket("wss://fyt-interview-fa9bf3d3321e.herokuapp.com/");

/*      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
*/

              ws.onopen = () => {
          console.log('✅ WebSocket connected');
        
          // TEMP TEST FUNCTION - sends fake spectrum every 2s
          function analyzeAudio() {
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
        
          analyzeAudio(); // ← make sure this is called here
        };

      
        function analyzeAudio() {
          setInterval(() => {
            const testData = {
              level: Math.random(),
              spectrum: Array.from({ length: 16 }, () => Math.random()) // 16 fake spectrum values
            };
            console.log("Sending test data:", testData);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(testData));
            }
          }, 2000);
        }

        
       /* function analyzeAudio() {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;

          const spectrum = Array.from(dataArray).map(v => v / 255);

          const payload = {
            level: average / 255,
            spectrum: spectrum
          };

          if (ws.readyState === WebSocket.OPEN) {
            console.log("Sent spectrum data:", JSON.stringify(payload));
            ws.send(JSON.stringify(payload));
          }
*/
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
