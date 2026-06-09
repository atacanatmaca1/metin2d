// ============================================================
// METIN2D - Renderer
// ============================================================

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.W      = canvas.width;
    this.H      = canvas.height;
    this.TILE   = 40;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.W, this.H);
  }

  drawMap(world) {
    const ctx = this.ctx;
    const T = this.TILE;
    const mapDef = GAME_DATA.maps[world.currentMapId];
    const cam = world.camera;

    const startX = Math.max(0, Math.floor(cam.x / T));
    const startY = Math.max(0, Math.floor(cam.y / T));
    const endX   = Math.min(mapDef.width,  startX + Math.ceil(this.W / T) + 2);
    const endY   = Math.min(mapDef.height, startY + Math.ceil(this.H / T) + 2);

    const mapId = world.currentMapId;

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const sx = tx * T - cam.x;
        const sy = ty * T - cam.y;
        this._drawTile(ctx, sx, sy, T, tx, ty, mapId, world.tick);
      }
    }

    // Draw portals
    if (mapDef.portals) {
      mapDef.portals.forEach(p => {
        const sx = p.x * T - cam.x, sy = p.y * T - cam.y;
        const pulse = 0.7 + Math.sin(world.tick * 0.05) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx + T / 2, sy + T / 2, T * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, sx + T / 2, sy + T + 14);
      });
    }

    // Draw NPCs
    const npcs = [...(mapDef.npcs || []), ...(mapDef.resources || [])];
    npcs.forEach(n => {
      const sx = n.x * T - cam.x, sy = n.y * T - cam.y;
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(sx + T / 2, sy + T / 2 - 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.icon, sx + T / 2, sy + T / 2 + 5);
      ctx.fillStyle = '#f1c40f';
      ctx.font = '9px sans-serif';
      ctx.fillText(n.name, sx + T / 2, sy + T + 12);
    });
  }

  _drawTile(ctx, sx, sy, T, tx, ty, mapId, tick) {
    const colors = {
      town:      { base: '#2d5a27', path: '#c49a2d', water: '#1a5276' },
      exp_map:   { base: '#1a3a18', path: '#3d2b1f', dark: '#0f2009'  },
      metin_map: { base: '#3d2b1f', path: '#5a3a1a', sand: '#8b6914'  },
      craft_map: { base: '#1a3a0f', path: '#2d5a18', moss: '#0f2009'  }
    }[mapId] || { base: '#2d5a27' };

    // Simple pseudo-random tile variety
    const noise = ((tx * 7 + ty * 13) % 4);
    const bases = [colors.base, colors.base, colors.base,
                   mapId === 'metin_map' ? '#4a3020' : '#243d20'];
    ctx.fillStyle = bases[noise];
    ctx.fillRect(sx, sy, T, T);

    // Decorative grass/sand tiles
    if (noise === 0 && mapId !== 'metin_map') {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(sx + 6, sy + 6, 8, 3);
    }

    // Borders / grid
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.3;
    ctx.strokeRect(sx, sy, T, T);

    // Trees / rocks for variety
    if ((tx * 3 + ty * 7) % 15 === 0 && mapId !== 'metin_map') {
      // small rock
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(sx + 20, sy + 34, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath(); ctx.ellipse(sx + 20, sy + 30, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if ((tx * 11 + ty * 5) % 20 === 0) {
      // small flower / cactus
      ctx.fillStyle = mapId === 'metin_map' ? '#5d8a3c' : '#2ecc71';
      ctx.fillRect(sx + 18, sy + 28, 3, 8);
      ctx.beginPath(); ctx.arc(sx + 19, sy + 26, 5, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawEnemy(ctx, e, cam, tick) {
    if (!e.alive) return;
    const sx = e.px - cam.x, sy = e.py - cam.y;
    if (sx < -60 || sx > this.W + 60 || sy < -60 || sy > this.H + 60) return;

    const bob = Math.sin(e.frame) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(sx + 8, sy + e.size * 2 + 2, e.size * 0.8, 4, 0, 0, Math.PI * 2); ctx.fill();

    if (e.boss) {
      // Boss: big glowing form
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.rect(sx, sy + bob, e.size * 2, e.size * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,0,0.3)';
      ctx.beginPath(); ctx.arc(sx + e.size, sy + e.size + bob, e.size * 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${e.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('👹', sx + e.size, sy + e.size * 1.5 + bob);
    } else {
      // Body
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.ellipse(sx + 8, sy + e.size + bob, e.size * 0.7, e.size * 0.9, 0, 0, Math.PI * 2); ctx.fill();
      // Head
      ctx.beginPath(); ctx.arc(sx + 8 + (e.dir > 0 ? 2 : -2), sy + e.size * 0.55 + bob, e.size * 0.55, 0, Math.PI * 2); ctx.fill();
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(sx + 8 + (e.dir > 0 ? 6 : -2), sy + e.size * 0.5 + bob, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(sx + 8 + (e.dir > 0 ? 7 : -1), sy + e.size * 0.5 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
      // Weapon stub
      ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + 8 + (e.dir > 0 ? 8 : -8), sy + e.size * 0.7 + bob);
      ctx.lineTo(sx + 8 + (e.dir > 0 ? 18 : -18), sy + e.size * 0.4 + bob);
      ctx.stroke();
    }

    // Poison tint
    if (e.poisoned > 0) {
      ctx.fillStyle = 'rgba(39,174,96,0.25)';
      ctx.beginPath(); ctx.arc(sx + 8, sy + e.size + bob, e.size, 0, Math.PI * 2); ctx.fill();
    }

    // HP bar
    const bw = Math.max(32, e.size * 2.5), bh = 5;
    const bx = sx + 8 - bw / 2, by = sy - 10 + bob;
    ctx.fillStyle = '#333'; ctx.fillRect(bx, by, bw, bh);
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = e.boss ? '#c0392b' : pct > 0.5 ? '#27ae60' : pct > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(bx, by, bw * pct, bh);
    // Name
    ctx.fillStyle = '#ddd'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(e.name + ' Lv.' + e.level, sx + 8, by - 2);
  }

  drawMetin(ctx, m, cam, tick) {
    if (!m.alive) return;
    const sx = m.px - cam.x, sy = m.py - cam.y;
    if (sx < -80 || sx > this.W + 80 || sy < -80 || sy > this.H + 80) return;

    const bob = Math.sin(tick * 0.04) * 3;
    const glow = 0.15 + Math.sin(tick * 0.06) * 0.1;

    // Glow
    ctx.fillStyle = m.color + '44';
    ctx.beginPath(); ctx.arc(sx + 14, sy + 14 + bob, 30, 0, Math.PI * 2); ctx.fill();

    // Stone body
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(sx, sy + bob, 28, 28);
    ctx.fillStyle = m.color;
    ctx.fillRect(sx + 2, sy + 2 + bob, 24, 5);
    // Cracks
    ctx.strokeStyle = '#1a0f08'; ctx.lineWidth = 1.5;
    const hp_pct = m.hp / m.maxHp;
    if (hp_pct < 0.75) { ctx.beginPath(); ctx.moveTo(sx + 6, sy + 8 + bob); ctx.lineTo(sx + 14, sy + 20 + bob); ctx.stroke(); }
    if (hp_pct < 0.5)  { ctx.beginPath(); ctx.moveTo(sx + 20, sy + 6 + bob); ctx.lineTo(sx + 10, sy + 22 + bob); ctx.stroke(); }
    if (hp_pct < 0.25) { ctx.beginPath(); ctx.moveTo(sx + 4, sy + 15 + bob); ctx.lineTo(sx + 24, sy + 18 + bob); ctx.stroke(); }

    // Rune glow particles
    ctx.fillStyle = m.color;
    ctx.globalAlpha = glow + 0.3;
    for (let i = 0; i < 3; i++) {
      const rx = sx + 6 + i * 8, ry = sy + 10 + bob + Math.sin(tick * 0.08 + i) * 3;
      ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // HP bar
    const bw = 40, bh = 6;
    const bx = sx - 6, by = sy - 14 + bob;
    ctx.fillStyle = '#222'; ctx.fillRect(bx, by, bw, bh);
    const pct = m.hp / m.maxHp;
    ctx.fillStyle = pct > 0.5 ? m.color : '#e74c3c';
    ctx.fillRect(bx, by, bw * pct, bh);
    // Name
    ctx.fillStyle = m.color; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(m.name, sx + 14, by - 3);
    ctx.fillStyle = '#aaa'; ctx.font = '9px sans-serif';
    ctx.fillText(`Lv.${m.level} — Min Lv.${m.minLevelReq}`, sx + 14, by - 13);
  }

  drawPlayer(ctx, p, cam, tick) {
    const sx = p.px - cam.x, sy = p.py - cam.y;
    const bob = Math.sin(p.frame) * 2.5;
    const isMoving = p.frame % 0.1 < 0.05;

    if (p.stealthed) { ctx.globalAlpha = 0.35; }

    // Stealth / berserk ring
    if (p.berserkTimer > 0) {
      ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx + 8, sy + 16, 22, 0, Math.PI * 2); ctx.stroke();
    }
    if (p.buffs.find(b => b.stat === 'spd')) {
      ctx.strokeStyle = '#3498db'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(sx + 8, sy + 16, 20, 0, Math.PI * 2); ctx.stroke();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(sx + 8, sy + 34, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Invincible flash
    if (p.invincible % 4 < 2) {
      // Cloak / body
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.ellipse(sx + 8, sy + 22 + bob, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
      // Armor tint if equipped
      if (p.equipment.armor) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.ellipse(sx + 8, sy + 22 + bob, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
      }
      // Head
      ctx.fillStyle = '#f0d9c0';
      ctx.beginPath(); ctx.arc(sx + 8 + (p.dir > 0 ? 2 : -2), sy + 10 + bob, 8, 0, Math.PI * 2); ctx.fill();
      // Hair (class color)
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(sx + 8 + (p.dir > 0 ? 2 : -2), sy + 6 + bob, 8, Math.PI, 0); ctx.fill();
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(sx + 8 + (p.dir > 0 ? 4 : -2), sy + 9.5 + bob, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath(); ctx.arc(sx + 8 + (p.dir > 0 ? 5 : -1), sy + 10 + bob, 2, 0, Math.PI * 2); ctx.fill();
      // Weapon
      ctx.strokeStyle = p.equipment.weapon ? '#f39c12' : '#aaa'; ctx.lineWidth = 3;
      const wx = p.dir > 0 ? sx + 15 : sx + 1;
      const ex = p.dir > 0 ? sx + 28 : sx - 12;
      ctx.beginPath(); ctx.moveTo(wx, sy + 16 + bob); ctx.lineTo(ex, sy + 9 + bob); ctx.stroke();
      // Weapon guard
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(wx, sy + 16 + bob, 3.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Poison tint
    if (p.poisoned > 0) {
      ctx.fillStyle = 'rgba(39,174,96,0.2)';
      ctx.beginPath(); ctx.arc(sx + 8, sy + 16, 20, 0, Math.PI * 2); ctx.fill();
    }

    // Name tag
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p.icon + ' ' + p.name + ' Lv.' + p.level, sx + 8, sy - 4 + bob);
  }

  drawParticles(ctx, particles, cam) {
    particles.forEach(pt => {
      ctx.globalAlpha = Math.max(0, pt.life / 40);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x - cam.x, pt.y - cam.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  drawProjectiles(ctx, projectiles, cam) {
    projectiles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x - cam.x, p.y - cam.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(p.x - cam.x - p.vx, p.y - cam.y - p.vy, 2, 0, Math.PI * 2); ctx.fill();
    });
  }

  drawFloatTexts(ctx, floatTexts, cam) {
    floatTexts.forEach(f => {
      ctx.globalAlpha = Math.min(1, f.life / 20);
      ctx.fillStyle   = f.color;
      ctx.font        = 'bold 13px sans-serif';
      ctx.textAlign   = 'center';
      ctx.fillText(f.text, f.x - cam.x, f.y - cam.y);
    });
    ctx.globalAlpha = 1;
  }

  drawTransition(alpha) {
    this.ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  drawDeathScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ÖLDÜNÜZ', this.W / 2, this.H / 2 - 24);
    ctx.fillStyle = '#bdc3c7';
    ctx.font = '16px sans-serif';
    ctx.fillText('R tuşuna basarak köyde yeniden doğun', this.W / 2, this.H / 2 + 14);
  }

  render(world) {
    const ctx = this.ctx;
    this.clear();
    this.drawMap(world);
    // Draw metins behind enemies
    world.metins.forEach(m => this.drawMetin(ctx, m, world.camera, world.tick));
    world.enemies.forEach(e => this.drawEnemy(ctx, e, world.camera, world.tick));
    this.drawParticles(ctx, world.particles, world.camera);
    this.drawPlayer(ctx, world.player, world.camera, world.tick);
    this.drawProjectiles(ctx, world.projectiles, world.camera);
    this.drawFloatTexts(ctx, world.floatTexts, world.camera);
    if (world.transitioning) this.drawTransition(world.transitionAlpha);
    if (world.player.isDead()) this.drawDeathScreen();
  }
}
