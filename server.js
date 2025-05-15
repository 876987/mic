const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve index.html & audio-analyzer.js from the root
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

wss.on("connection", (ws) => {
  console.log("🔌 WebSocket client connected");
  console.log("Connected clients:", wss.clients.size);

  ws.on("message", (message) => {
    console.log("📨 Received audio data:", message);

    // Broadcast to other connected clients (e.g., TouchDesigner)
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        console.log("🔁 Forwarding to client");
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
    console.log("Remaining clients:", wss.clients.size);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
