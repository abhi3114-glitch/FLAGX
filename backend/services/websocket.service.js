let wss;
const clients = new Set();

export function setupWebSocket(websocketServer) {
  wss = websocketServer;

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received:', data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Feature Flag System',
      timestamp: new Date().toISOString()
    }));
  });
}

export function broadcastFlagUpdate(action, flag) {
  const message = JSON.stringify({
    type: 'flag_update',
    action,
    flag,
    timestamp: new Date().toISOString()
  });

  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

export function broadcastMessage(type, data) {
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });

  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}