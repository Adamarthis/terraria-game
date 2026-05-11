export class NetworkManager {
  constructor(game) {
    this.game = game;
    this.ws = null;
    this.connected = false;
    this.reconnectTimer = 0;
    this.serverUrl = null;
    this.otherPlayers = []; // { id, x, y, vx, vy, name, color, health, maxHealth }
    this.latency = 0;
    this.pingTimer = 0;
  }

  connect(serverUrl) {
    if (this.ws) this.disconnect();
    this.serverUrl = serverUrl;

    try {
      this.ws = new WebSocket(serverUrl);

      this.ws.onopen = () => {
        this.connected = true;
        console.log('Connected to server');

        // Send join message
        this.send({
          type: 'join',
          name: this.game.playerName || 'Player',
          class: this.game.player ? this.game.player.gameClass : 'melee'
        });
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.reconnectTimer = 300;
        console.log('Disconnected from server');
      };

      this.ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };
    } catch (e) {
      console.error('Failed to connect:', e);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.otherPlayers = [];
  }

  send(data) {
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify(data));
    }
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'init':
        // Receive world seed and initial state
        if (msg.seed && this.game.world) {
          this.game.world.seed = msg.seed;
        }
        this.playerId = msg.id;
        break;

      case 'playerList':
        // Update other players
        this.otherPlayers = msg.players || [];
        break;

      case 'playerUpdate':
        // Update specific player position
        this.updatePlayerPosition(msg);
        break;

      case 'blockUpdate':
        // Block was mined/placed by another player
        if (this.game.world && this.game.world.tileSystem) {
          if (msg.action === 'mine') {
            this.game.world.tileSystem.setTile(msg.col, msg.row, 0);
          } else if (msg.action === 'place') {
            this.game.world.tileSystem.setTile(msg.col, msg.row, msg.tileId);
          }
        }
        break;

      case 'chat':
        if (this.game.hud) {
          this.game.hud.addNotification(`[${msg.sender}] ${msg.text}`, 180);
        }
        break;

      case 'pong':
        this.latency = Date.now() - this.pingTimer;
        break;
    }
  }

  updatePlayerPosition(msg) {
    const existing = this.otherPlayers.find(p => p.id === msg.id);
    if (existing) {
      existing.x = msg.x;
      existing.y = msg.y;
      existing.vx = msg.vx || 0;
      existing.vy = msg.vy || 0;
      existing.health = msg.health;
    } else if (msg.id !== this.playerId) {
      this.otherPlayers.push({
        id: msg.id,
        x: msg.x,
        y: msg.y,
        vx: 0,
        vy: 0,
        name: msg.name || 'Unknown',
        color: msg.color || '#4A90D9',
        health: msg.health || 100,
        maxHealth: 100
      });
    }
  }

  sendPlayerUpdate(player) {
    if (!this.connected) return;
    this.send({
      type: 'playerUpdate',
      x: Math.floor(player.x),
      y: Math.floor(player.y),
      vx: Math.round(player.vx * 10) / 10,
      vy: Math.round(player.vy * 10) / 10,
      health: Math.ceil(player.health),
      facingRight: player.facingRight
    });
  }

  sendBlockAction(col, row, action, tileId) {
    if (!this.connected) return;
    this.send({
      type: 'blockUpdate',
      col,
      row,
      action,
      tileId: tileId || 0
    });
  }

  sendChat(text) {
    if (!this.connected) return;
    this.send({ type: 'chat', text });
  }

  update(dt) {
    // Reconnect logic
    if (!this.connected && this.serverUrl) {
      this.reconnectTimer -= dt * 60;
      if (this.reconnectTimer <= 0) {
        this.reconnectTimer = 600; // Try again in 10 seconds
        this.connect(this.serverUrl);
      }
    }

    // Send ping periodically
    if (this.connected && this.game.player) {
      this.pingTimer += dt * 60;
      if (this.pingTimer >= 120) {
        this.pingTimer = 0;
        this.send({ type: 'ping' });
      }
    }
  }

  renderOtherPlayers(ctx, camera) {
    if (!this.connected) return;

    for (const p of this.otherPlayers) {
      if (p.id === this.playerId) continue;
      const sp = camera.worldToScreen(p.x, p.y);

      // Player body
      ctx.fillStyle = p.color || '#4A90D9';
      ctx.fillRect(sp.x, sp.y, 22, 44);

      // Head
      ctx.fillStyle = '#F5D0A9';
      ctx.fillRect(sp.x + 2, sp.y - 8, 18, 12);

      // Name
      ctx.fillStyle = '#FFF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.name || 'Player', sp.x + 11, sp.y - 14);
      ctx.textAlign = 'left';

      // Health bar
      if (p.health !== undefined) {
        const barW = 28;
        const barH = 3;
        const barX = sp.x - 3;
        const barY = sp.y - 18;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#4C4';
        ctx.fillRect(barX, barY, barW * (p.health / (p.maxHealth || 100)), barH);
      }
    }
  }

  clear() {
    this.disconnect();
    this.otherPlayers = [];
  }
}