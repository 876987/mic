
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');

  ws.on('message', (message) => {
    console.log('📨 Received audio data:', message);
    // Here you would forward the message to TouchDesigner
    // For now, just log it
  });

  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
