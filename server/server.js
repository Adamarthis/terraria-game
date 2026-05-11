const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const WORLD_WIDTH = 8400;
const WORLD_HEIGHT = 2400;

// Game state
const players = new Map(); // id -> { ws, x, y, vx, vy, name, color, health, maxHealth, class, facingRight }
const worldSeed = Math.floor(Math.random() * 2147483647);
let nextPlayerId = 1;

// Tile changes are tracked per chunk for syncing
const tileChanges = new Map(); // "col,row" -> { action, tileId, timestamp }

console.log(`Starting Wryzmkvn server on port ${PORT}...`);

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  const playerId = nextPlayerId++;
  const player = {
    id: playerId,
    ws,
    x: 8400 * 16 / 2, // center of world
    y: 200 * 16,
    vx: 0,
    vy: 0,
    name: 'Player ' + playerId,
    color: '#4A90D9',
    health: 100,
    maxHealth: 100,
    gameClass: 'melee',
    facingRight: true,
    lastUpdate: Date.now()
  };

  players.set(playerId, player);
  console.log(`Player ${playerId} connected (${players.size} total)`);

  // Send init data
  sendTo(player, {
    type: 'init',
    id: playerId,
    seed: worldSeed,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT
  });

  // Sync tile changes from last 30 seconds
  const now = Date.now();
  for (const [key, change] of tileChanges) {
    if (now - change.timestamp < 30000) {
      const [col, row] = key.split(',').map(Number);
      sendTo(player, {
        type: 'blockUpdate',
        col,
        row,
        action: change.action,
        tileId: change.tileId
      });
    }
  }

  // Send current player list to new player
  sendPlayerList();

  // Notify others of new player
  broadcast({
    type: 'chat',
    sender: 'System',
    text: `${player.name} joined the game`
  }, playerId);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(player, msg);
    } catch (e) {
      console.error('Invalid message from player', playerId, e.message);
    }
  });

  ws.on('close', () => {
    players.delete(playerId);
    console.log(`Player ${playerId} disconnected (${players.size} total)`);
    sendPlayerList();
    broadcast({
      type: 'chat',
      sender: 'System',
      text: `${player.name} left the game`
    });
  });

  ws.on('error', (err) => {
    console.error('WebSocket error for player', playerId, err.message);
    players.delete(playerId);
  });
});

function handleMessage(player, msg) {
  switch (msg.type) {
    case 'join':
      player.name = msg.name || player.name;
      player.gameClass = msg.class || player.gameClass;
      console.log(`Player ${player.id} set name: ${player.name}`);
      break;

    case 'playerUpdate':
      // Validate position (basic anti-cheat)
      const dx = Math.abs((msg.x || player.x) - player.x);
      const dy = Math.abs((msg.y || player.y) - player.y);
      const maxMove = 20; // max tiles per frame

      if (dx > maxMove * 16 || dy > maxMove * 16) {
        // Suspicious movement, reject
        sendTo(player, { type: 'chat', sender: 'System', text: 'Movement rejected (possible cheat)' });
        return;
      }

      player.x = msg.x;
      player.y = msg.y;
      player.vx = msg.vx || 0;
      player.vy = msg.vy || 0;
      player.health = msg.health || player.health;
      player.facingRight = msg.facingRight !== undefined ? msg.facingRight : player.facingRight;
      player.lastUpdate = Date.now();

      // Broadcast position to other players
      broadcast({
        type: 'playerUpdate',
        id: player.id,
        x: player.x,
        y: player.y,
        vx: player.vx,
        vy: player.vy,
        health: player.health,
        name: player.name,
        color: player.color,
        facingRight: player.facingRight
      }, player.id);
      break;

    case 'blockUpdate':
      // Validate block coordinates
      const col = msg.col;
      const row = msg.row;
      if (col < 0 || col >= WORLD_WIDTH || row < 0 || row >= WORLD_HEIGHT) return;

      // Rate limit block actions
      const now = Date.now();
      const changeKey = `${col},${row}`;
      const lastChange = tileChanges.get(changeKey);
      if (lastChange && now - lastChange.timestamp < 100) {
        return; // Too fast
      }

      tileChanges.set(changeKey, {
        action: msg.action,
        tileId: msg.tileId || 0,
        timestamp: now
      });

      // Broadcast to all other players
      broadcast({
        type: 'blockUpdate',
        col,
        row,
        action: msg.action,
        tileId: msg.tileId || 0
      }, player.id);
      break;

    case 'chat':
      broadcast({
        type: 'chat',
        sender: player.name,
        text: msg.text
      });
      break;

    case 'ping':
      sendTo(player, { type: 'pong' });
      break;
  }
}

function sendTo(player, data) {
  try {
    if (player.ws && player.ws.readyState === 1) {
      player.ws.send(JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error sending to player', player.id);
  }
}

function broadcast(data, excludeId = null) {
  const msg = JSON.stringify(data);
  for (const [id, player] of players) {
    if (id === excludeId) continue;
    try {
      if (player.ws && player.ws.readyState === 1) {
        player.ws.send(msg);
      }
    } catch (e) {
      // Ignore
    }
  }
}

function sendPlayerList() {
  const playerList = [];
  for (const [id, player] of players) {
    playerList.push({
      id,
      x: player.x,
      y: player.y,
      name: player.name,
      color: player.color,
      health: player.health,
      maxHealth: player.maxHealth
    });
  }

  broadcast({ type: 'playerList', players: playerList });
}

// Clean up old tile changes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, change] of tileChanges) {
    if (now - change.timestamp > 300000) {
      tileChanges.delete(key);
    }
  }
}, 300000);

console.log('Server is ready!');