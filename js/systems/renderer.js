// ============================================================
// METIN2D - Renderer v6  (Metin2-style visuals)
// ============================================================

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.W      = canvas.width;
    this.H      = canvas.height;
    this.T      = 40;
  }

  clear() { this.ctx.clearRect(0, 0, this.W, this.H); }

  // ── TILE MAP ──────────────────────────────────────────────
  drawMap(world) {
    const ctx = this.ctx, T = this.T, cam = world.camera;
    const mapDef = GAME_DATA.maps[world.currentMapId];
    const mapId  = world.currentMapId;
    const sx0 = Math.max(0, Math.floor(cam.x / T));
    const sy0 = Math.max(0, Math.floor(cam.y / T));
    const sx1 = Math.min(mapDef.width,  sx0 + Math.ceil(this.W / T) + 2);
    const sy1 = Math.min(mapDef.height, sy0 + Math.ceil(this.H / T) + 2);

    for (let ty = sy0; ty < sy1; ty++)
      for (let tx = sx0; tx < sx1; tx++)
        this._tile(ctx, tx * T - cam.x, ty * T - cam.y, T, tx, ty, mapId, world.tick);

    this._drawPortals(ctx, mapDef, cam, T, world.tick);
    this._drawNpcs(ctx, mapDef, cam, T);
  }

  _tile(ctx, sx, sy, T, tx, ty, mapId, tick) {
    // Base colour per map
    const base = {
      town:      ['#3a6b34','#446e3a','#325c2e','#4a7540'],
      exp_map:   ['#1e3d1a','#263f1e','#182f14','#2a4520'],
      metin_map: ['#4a3018','#52361c','#3e2812','#5a3e20'],
      craft_map: ['#1a3a10','#22461a','#143008','#2a5020'],
    }[mapId] || ['#3a6b34','#446e3a','#325c2e','#4a7540'];

    const n = (tx * 7919 + ty * 6271) % 4;
    ctx.fillStyle = base[n];
    ctx.fillRect(sx, sy, T, T);

    // Map-specific decorations
    const seed = (tx * 374761393 + ty * 1234567) >>> 0;
    if (mapId === 'town' || mapId === 'craft_map') this._tileGrass(ctx, sx, sy, T, seed);
    if (mapId === 'exp_map')   this._tileDark(ctx, sx, sy, T, seed);
    if (mapId === 'metin_map') this._tileSand(ctx, sx, sy, T, seed, tick);

    // Subtle grid
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth   = 0.5;
    ctx.strokeRect(sx, sy, T, T);
  }

  _tileGrass(ctx, sx, sy, T, seed) {
    if (seed % 12 === 0) { // tree
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(sx+20, sy+36, 9, 3, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(sx+18, sy+26, 4, 12);
      ctx.fillStyle = '#1a5c10';
      ctx.beginPath(); ctx.arc(sx+20, sy+20, 12, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#267318';
      ctx.beginPath(); ctx.arc(sx+20, sy+15, 8, 0, Math.PI*2); ctx.fill();
    } else if (seed % 8 === 0) { // rock
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath(); ctx.ellipse(sx+20, sy+34, 7, 2, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#8a8070';
      ctx.beginPath(); ctx.ellipse(sx+20, sy+30, 6, 4, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#a09888';
      ctx.beginPath(); ctx.ellipse(sx+19, sy+28, 4, 3, 0, 0, Math.PI*2); ctx.fill();
    } else if (seed % 5 === 0) { // flower/bush
      ctx.fillStyle = '#1a6610';
      ctx.beginPath(); ctx.arc(sx+20, sy+30, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = seed%3===0 ? '#e74c3c' : '#f1c40f';
      ctx.beginPath(); ctx.arc(sx+20, sy+27, 3, 0, Math.PI*2); ctx.fill();
    }
  }

  _tileDark(ctx, sx, sy, T, seed) {
    if (seed % 10 === 0) { // dead tree
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(sx+19, sy+18, 3, 18);
      ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx+21, sy+24); ctx.lineTo(sx+28, sy+20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+21, sy+22); ctx.lineTo(sx+14, sy+18); ctx.stroke();
    } else if (seed % 7 === 0) { // skull/bone
      ctx.fillStyle = '#c8c0a8';
      ctx.beginPath(); ctx.arc(sx+20, sy+28, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0f1a0a';
      ctx.beginPath(); ctx.arc(sx+19, sy+27, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx+22, sy+27, 1.2, 0, Math.PI*2); ctx.fill();
    }
  }

  _tileSand(ctx, sx, sy, T, seed, tick) {
    if (seed % 9 === 0) { // cracked rock / metin fragment
      ctx.fillStyle = '#6a4020';
      ctx.fillRect(sx+14, sy+20, 12, 10);
      ctx.strokeStyle = '#3a1a08'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx+16, sy+22); ctx.lineTo(sx+22, sy+28); ctx.stroke();
      // glow pulse
      const g = 0.08 + Math.sin(tick*0.05+seed)*0.05;
      ctx.fillStyle = `rgba(200,80,20,${g})`;
      ctx.fillRect(sx+14, sy+20, 12, 10);
    } else if (seed % 6 === 0) { // bone pile
      ctx.fillStyle = '#c8b898';
      ctx.fillRect(sx+16, sy+28, 10, 3);
      ctx.fillRect(sx+14, sy+30, 14, 2);
    }
  }

  _drawPortals(ctx, mapDef, cam, T, tick) {
    if (!mapDef.portals) return;
    mapDef.portals.forEach(p => {
      const sx = p.x * T - cam.x, sy = p.y * T - cam.y;
      const pulse = 0.6 + Math.sin(tick * 0.06) * 0.4;
      // Outer glow
      ctx.globalAlpha = pulse * 0.4;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(sx + T/2, sy + T/2, T * 0.9, 0, Math.PI*2); ctx.fill();
      // Inner ring
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = p.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx + T/2, sy + T/2, T * 0.5, 0, Math.PI*2); ctx.stroke();
      // Core
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(sx + T/2, sy + T/2, 6, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText('⬡ ' + p.label, sx + T/2, sy + T + 14);
      ctx.shadowBlur = 0;
    });
  }

  _drawNpcs(ctx, mapDef, cam, T) {
    const npcs = [...(mapDef.npcs||[]), ...(mapDef.resources||[])];
    npcs.forEach(n => {
      const sx = n.x * T - cam.x, sy = n.y * T - cam.y;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(sx+T/2, sy+T-4, 12, 4, 0, 0, Math.PI*2); ctx.fill();
      // Body
      ctx.fillStyle = '#c9a84c';
      ctx.beginPath(); ctx.arc(sx+T/2, sy+T/2-2, 16, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#8b6914';
      ctx.lineWidth = 2; ctx.strokeStyle = '#8b6914';
      ctx.beginPath(); ctx.arc(sx+T/2, sy+T/2-2, 16, 0, Math.PI*2); ctx.stroke();
      // Icon
      ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(n.icon, sx+T/2, sy+T/2+6);
      // Name
      ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 9px sans-serif';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
      ctx.fillText(n.name, sx+T/2, sy+T+14);
      ctx.shadowBlur = 0;
      // ! indicator
      ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText('!', sx+T/2+12, sy+T/2-14);
    });
  }

  // ── ENEMY ────────────────────────────────────────────────
  drawEnemy(ctx, e, cam, tick) {
    if (!e.alive) return;
    const sx = e.px - cam.x, sy = e.py - cam.y;
    if (sx < -80 || sx > this.W+80 || sy < -80 || sy > this.H+80) return;
    const bob = Math.sin(e.frame * 1.2) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(sx+e.size, sy+e.size*2+4, e.size*0.9, 4, 0, 0, Math.PI*2); ctx.fill();

    if (e.boss) this._drawBoss(ctx, e, sx, sy, bob, tick);
    else        this._drawMob(ctx, e, sx, sy, bob, tick);

    this._drawEnemyHUD(ctx, e, sx, sy, bob);
  }

  _drawMob(ctx, e, sx, sy, bob, tick) {
    const s = e.size, d = e.dir;
    // Legs (walking anim)
    const lp = Math.sin(e.frame*2) * 4;
    ctx.fillStyle = this._darken(e.color, 0.6);
    ctx.beginPath(); ctx.ellipse(sx+s*0.6, sy+s*1.9+bob+lp, s*0.3, s*0.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx+s*1.2, sy+s*1.9+bob-lp, s*0.3, s*0.5, 0, 0, Math.PI*2); ctx.fill();
    // Boots
    ctx.fillStyle = '#2c1a08';
    ctx.beginPath(); ctx.ellipse(sx+s*0.6, sy+s*2.2+bob+lp, s*0.4, s*0.3, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx+s*1.2, sy+s*2.2+bob-lp, s*0.4, s*0.3, 0, 0, Math.PI*2); ctx.fill();
    // Body
    ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.ellipse(sx+s, sy+s*1.3+bob, s*0.75, s, 0, 0, Math.PI*2); ctx.fill();
    // Belt
    ctx.fillStyle = this._darken(e.color, 0.5);
    ctx.fillRect(sx+s*0.3, sy+s*1.7+bob, s*1.4, s*0.2);
    // Arm with weapon
    const armX = d>0 ? sx+s*1.7 : sx+s*0.3;
    ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.ellipse(armX, sy+s*1.1+bob, s*0.3, s*0.55, d>0?-0.3:0.3, 0, Math.PI*2); ctx.fill();
    // Weapon
    ctx.strokeStyle = '#c8c0a0'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (d>0) { ctx.moveTo(sx+s*1.6, sy+s*0.9+bob); ctx.lineTo(sx+s*2.4, sy+s*0.3+bob); }
    else     { ctx.moveTo(sx+s*0.4, sy+s*0.9+bob); ctx.lineTo(sx-s*0.4, sy+s*0.3+bob); }
    ctx.stroke();
    // Head
    ctx.fillStyle = this._darken(e.color, 0.85);
    ctx.beginPath(); ctx.arc(sx+s + (d>0?s*0.15:-s*0.15), sy+s*0.5+bob, s*0.6, 0, Math.PI*2); ctx.fill();
    // Eyes
    const ex = d>0 ? sx+s*1.2 : sx+s*0.65;
    ctx.fillStyle = '#ff2020';
    ctx.beginPath(); ctx.arc(ex, sy+s*0.45+bob, s*0.18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(ex+(d>0?s*0.06:-s*0.06), sy+s*0.45+bob, s*0.1, 0, Math.PI*2); ctx.fill();
    // Poison
    if (e.poisoned>0) {
      ctx.fillStyle = 'rgba(39,174,96,0.3)';
      ctx.beginPath(); ctx.arc(sx+s, sy+s+bob, s*1.2, 0, Math.PI*2); ctx.fill();
    }
  }

  _drawBoss(ctx, e, sx, sy, bob, tick) {
    const s = e.size;
    // Aura
    const glow = 0.2 + Math.sin(tick*0.05)*0.15;
    ctx.fillStyle = e.color + '55';
    ctx.beginPath(); ctx.arc(sx+s, sy+s+bob, s*2, 0, Math.PI*2); ctx.fill();
    // Body
    ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.ellipse(sx+s, sy+s+bob, s*1.1, s*1.3, 0, 0, Math.PI*2); ctx.fill();
    // Armor plate
    ctx.fillStyle = this._darken(e.color, 0.6);
    ctx.beginPath(); ctx.ellipse(sx+s, sy+s*0.8+bob, s*0.9, s*0.6, 0, 0, Math.PI*2); ctx.fill();
    // Head
    ctx.fillStyle = this._darken(e.color, 0.8);
    ctx.beginPath(); ctx.arc(sx+s, sy+s*-0.1+bob, s*0.8, 0, Math.PI*2); ctx.fill();
    // Horns
    ctx.fillStyle = '#c9a84c';
    ctx.beginPath(); ctx.moveTo(sx+s*0.4, sy+s*-0.5+bob); ctx.lineTo(sx+s*0.1, sy+s*-1.3+bob); ctx.lineTo(sx+s*0.7, sy+s*-0.6+bob); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx+s*1.6, sy+s*-0.5+bob); ctx.lineTo(sx+s*1.9, sy+s*-1.3+bob); ctx.lineTo(sx+s*1.3, sy+s*-0.6+bob); ctx.fill();
    // Eyes
    ctx.fillStyle = '#ff4400';
    ctx.beginPath(); ctx.arc(sx+s*0.65, sy+s*-0.15+bob, s*0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx+s*1.35, sy+s*-0.15+bob, s*0.2, 0, Math.PI*2); ctx.fill();
    // Weapon
    ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx+s*2.1, sy+s*0.2+bob); ctx.lineTo(sx+s*2.8, sy-s+bob); ctx.stroke();
    ctx.fillStyle = '#c9a84c';
    ctx.beginPath(); ctx.arc(sx+s*2.1, sy+s*0.2+bob, 6, 0, Math.PI*2); ctx.fill();
  }

  _drawEnemyHUD(ctx, e, sx, sy, bob) {
    const s = e.size;
    const bw = Math.max(40, s*3), bh = e.boss ? 8 : 5;
    const bx = sx + s - bw/2, by = sy - 18 + bob;
    // BG
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(bx-1, by-1, bw+2, bh+2);
    ctx.fillStyle = '#111';    ctx.fillRect(bx, by, bw, bh);
    // Fill
    const pct = e.hp / e.maxHp;
    const hcol = pct > 0.6 ? '#2ecc71' : pct > 0.3 ? '#f39c12' : '#e74c3c';
    ctx.fillStyle = hcol; ctx.fillRect(bx, by, bw*pct, bh);
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(bx, by, bw*pct, bh/2);
    // Name
    ctx.fillStyle = e.boss ? '#f1c40f' : '#ddd';
    ctx.font = e.boss ? 'bold 11px sans-serif' : '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
    ctx.fillText(e.name + ' Lv.' + e.level, sx+s, by-3);
    ctx.shadowBlur = 0;
  }

  // ── METIN STONE ───────────────────────────────────────────
  drawMetin(ctx, m, cam, tick) {
    if (!m.alive) return;
    const sx = m.px - cam.x, sy = m.py - cam.y;
    if (sx < -100 || sx > this.W+100 || sy < -100 || sy > this.H+100) return;

    const bob  = Math.sin(tick * 0.035) * 3;
    const glow = 0.25 + Math.sin(tick * 0.07) * 0.15;
    const pct  = m.hp / m.maxHp;

    // Ground glow
    ctx.fillStyle = m.color + '33';
    ctx.beginPath(); ctx.ellipse(sx+20, sy+52+bob, 28, 8, 0, 0, Math.PI*2); ctx.fill();

    // Outer glow ring
    ctx.strokeStyle = m.color; ctx.lineWidth = 2;
    ctx.globalAlpha = glow;
    ctx.beginPath(); ctx.arc(sx+20, sy+22+bob, 32, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;

    // Stone base (darker)
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(sx+2, sy+50+bob);
    ctx.lineTo(sx+0, sy+22+bob);
    ctx.lineTo(sx+8, sy+4+bob);
    ctx.lineTo(sx+22, sy+0+bob);
    ctx.lineTo(sx+36, sy+6+bob);
    ctx.lineTo(sx+40, sy+24+bob);
    ctx.lineTo(sx+38, sy+50+bob);
    ctx.closePath(); ctx.fill();

    // Stone surface
    ctx.fillStyle = m.color;
    ctx.beginPath();
    ctx.moveTo(sx+4, sy+48+bob);
    ctx.lineTo(sx+2, sy+22+bob);
    ctx.lineTo(sx+10, sy+6+bob);
    ctx.lineTo(sx+22, sy+2+bob);
    ctx.lineTo(sx+34, sy+8+bob);
    ctx.lineTo(sx+38, sy+24+bob);
    ctx.lineTo(sx+36, sy+48+bob);
    ctx.closePath(); ctx.fill();

    // Lighter face
    ctx.fillStyle = this._lighten(m.color, 1.3);
    ctx.beginPath();
    ctx.moveTo(sx+6, sy+44+bob);
    ctx.lineTo(sx+4, sy+24+bob);
    ctx.lineTo(sx+12, sy+8+bob);
    ctx.lineTo(sx+22, sy+4+bob);
    ctx.lineTo(sx+30, sy+10+bob);
    ctx.closePath(); ctx.fill();

    // Rune symbols (glowing)
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = glow * 1.5;
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('⊕', sx+20, sy+28+bob);
    ctx.globalAlpha = 1;

    // Cracks as hp drops
    ctx.strokeStyle = '#1a0a00'; ctx.lineWidth = 1.5;
    if (pct < 0.75) {
      ctx.beginPath(); ctx.moveTo(sx+8, sy+12+bob); ctx.lineTo(sx+18, sy+30+bob); ctx.stroke();
    }
    if (pct < 0.5) {
      ctx.beginPath(); ctx.moveTo(sx+28, sy+8+bob); ctx.lineTo(sx+16, sy+32+bob); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+16, sy+32+bob); ctx.lineTo(sx+24, sy+46+bob); ctx.stroke();
    }
    if (pct < 0.25) {
      ctx.beginPath(); ctx.moveTo(sx+4, sy+28+bob); ctx.lineTo(sx+36, sy+34+bob); ctx.stroke();
      ctx.fillStyle = '#ff4400';
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.arc(sx+20, sy+22+bob, 28, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Floating rune particles
    for (let i = 0; i < 3; i++) {
      const px2 = sx + 8 + i*12;
      const py2 = sy + 16 + bob + Math.sin(tick*0.1+i*2)*5;
      ctx.fillStyle = this._lighten(m.color, 1.6);
      ctx.globalAlpha = glow + 0.2;
      ctx.beginPath(); ctx.arc(px2, py2, 2.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // HP bar
    const bw = 52, bh = 7;
    const bx = sx + 20 - bw/2, by2 = sy - 22 + bob;
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(bx-1, by2-1, bw+2, bh+2);
    ctx.fillStyle = '#111';    ctx.fillRect(bx, by2, bw, bh);
    ctx.fillStyle = pct > 0.5 ? m.color : '#e74c3c';
    ctx.fillRect(bx, by2, bw*pct, bh);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(bx, by2, bw*pct, bh/2);
    // Names
    ctx.fillStyle = m.color; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    ctx.fillText(m.name, sx+20, by2-4);
    ctx.fillStyle = '#aaa'; ctx.font = '8px sans-serif';
    ctx.fillText('Min Lv.' + m.minLevelReq, sx+20, by2-14);
    ctx.shadowBlur = 0;
  }

  // ── PLAYER ────────────────────────────────────────────────
  drawPlayer(ctx, p, cam, tick) {
    const sx = p.px - cam.x, sy = p.py - cam.y;
    const bob = Math.sin(p.frame * 1.4) * 2.5;
    const moving = Object.values({}).length; // always draw full

    if (p.stealthed) ctx.globalAlpha = 0.3;

    // Effect rings
    if (p.berserkTimer > 0) {
      ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.6 + Math.sin(tick*0.15)*0.3;
      ctx.beginPath(); ctx.arc(sx+12, sy+20, 26, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = p.stealthed ? 0.3 : 1;
    }
    if (p.buffs.find(b=>b.stat==='spd')) {
      ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.3 - i*0.08;
        ctx.beginPath(); ctx.arc(sx+12, sy+20, 22+i*5, 0, Math.PI*2); ctx.stroke();
      }
      ctx.globalAlpha = p.stealthed ? 0.3 : 1;
    }
    if (p.buffs.find(b=>b.stat==='def')) {
      ctx.strokeStyle = '#f39c12'; ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.arc(sx+12, sy+20, 24, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = p.stealthed ? 0.3 : 1;
    }

    // Shadow
    ctx.globalAlpha = p.stealthed ? 0.1 : 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(sx+12, sy+40, 12, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = p.stealthed ? 0.3 : 1;

    this._drawPlayerBody(ctx, p, sx, sy, bob, tick);

    ctx.globalAlpha = 1;

    // Poison overlay
    if (p.poisoned > 0) {
      ctx.fillStyle = 'rgba(39,174,96,0.2)';
      ctx.beginPath(); ctx.arc(sx+12, sy+20, 22, 0, Math.PI*2); ctx.fill();
    }

    // Name tag with class color background
    const label = p.name + ' Lv.' + p.level;
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    const lw = ctx.measureText(label).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx+12-lw/2, sy-18+bob, lw, 13);
    ctx.fillStyle = p.color;
    ctx.fillText(label, sx+12, sy-8+bob);
  }

  _drawPlayerBody(ctx, p, sx, sy, bob, tick) {
    const d   = p.dir;
    const col = p.color;
    const flash = p.invincible > 0 && Math.floor(p.invincible/4)%2===0;
    if (flash) return;

    // Walking animation
    const lp = Math.sin(p.frame * 2.2) * 5;

    // Legs
    ctx.fillStyle = this._darken(col, 0.55);
    ctx.beginPath(); ctx.ellipse(sx+8,  sy+32+bob+lp, 4, 7, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx+16, sy+32+bob-lp, 4, 7, 0, 0, Math.PI*2); ctx.fill();

    // Boots
    ctx.fillStyle = '#2c1a08';
    ctx.beginPath(); ctx.ellipse(sx+8,  sy+38+bob+lp, 5, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx+16, sy+38+bob-lp, 5, 3, 0, 0, Math.PI*2); ctx.fill();

    // Body / armor
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(sx+12, sy+22+bob, 10, 12, 0, 0, Math.PI*2); ctx.fill();
    // Armor plate
    if (p.equipment.armor) {
      ctx.fillStyle = 'rgba(200,200,220,0.35)';
      ctx.beginPath(); ctx.ellipse(sx+12, sy+20+bob, 9, 9, 0, 0, Math.PI*2); ctx.fill();
    }
    // Belt
    ctx.fillStyle = this._darken(col, 0.5);
    ctx.fillRect(sx+3, sy+29+bob, 18, 3);

    // Arms
    const armSwing = Math.sin(p.frame*2.2) * 8;
    const offArm = d>0 ? sx+19 : sx+5;
    const swordArm = d>0 ? sx+5 : sx+19;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(offArm, sy+22+bob+armSwing, 4, 9, d>0?0.3:-0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(swordArm, sy+20+bob-armSwing, 4, 9, d>0?-0.3:0.3, 0, Math.PI*2); ctx.fill();

    // Weapon
    const hasWeapon = p.equipment.weapon;
    ctx.strokeStyle = hasWeapon ? '#e8d080' : '#b0b0b0';
    ctx.lineWidth   = hasWeapon ? 3.5 : 2.5;
    ctx.lineCap = 'round';
    if (d>0) {
      ctx.beginPath(); ctx.moveTo(sx+4, sy+22+bob); ctx.lineTo(sx-6, sy+8+bob); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(sx+20, sy+22+bob); ctx.lineTo(sx+30, sy+8+bob); ctx.stroke();
    }
    ctx.lineCap = 'butt';
    // Guard
    const gx = d>0 ? sx+4 : sx+20;
    ctx.fillStyle = hasWeapon ? '#c9a84c' : '#888';
    ctx.beginPath(); ctx.arc(gx, sy+22+bob, 4, 0, Math.PI*2); ctx.fill();

    // Neck
    ctx.fillStyle = '#d4a882';
    ctx.beginPath(); ctx.ellipse(sx+12, sy+11+bob, 5, 4, 0, 0, Math.PI*2); ctx.fill();

    // Head
    ctx.fillStyle = '#d4a882';
    ctx.beginPath(); ctx.arc(sx+12+(d>0?1:-1), sy+6+bob, 9, 0, Math.PI*2); ctx.fill();

    // Hair
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(sx+12+(d>0?1:-1), sy+2+bob, 9, Math.PI, 0); ctx.fill();
    // Class-specific hair detail
    if (p.classId==='ninja') {
      ctx.fillStyle = '#1a0a2e';
      ctx.beginPath(); ctx.arc(sx+12, sy+2+bob, 9, Math.PI, 0); ctx.fill();
      // Ponytail
      ctx.beginPath(); ctx.moveTo(sx+(d>0?20:4), sy+4+bob); ctx.lineTo(sx+(d>0?26:-2), sy+16+bob); ctx.stroke();
    }

    // Eyes
    const eyeX = d>0 ? sx+15 : sx+9;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(eyeX, sy+6+bob, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = p.classId==='sura' ? '#cc2200' : '#1a1a2e';
    ctx.beginPath(); ctx.arc(eyeX+(d>0?0.5:-0.5), sy+6+bob, 1.8, 0, Math.PI*2); ctx.fill();
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(eyeX+(d>0?1:-0.5), sy+5+bob, 0.7, 0, Math.PI*2); ctx.fill();
  }

  // ── PARTICLES / FX ───────────────────────────────────────
  drawParticles(ctx, particles, cam) {
    particles.forEach(pt => {
      if (pt.life <= 0) return;
      ctx.globalAlpha = Math.min(1, pt.life / 25);
      ctx.fillStyle   = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x - cam.x, pt.y - cam.y, 2.5, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  drawProjectiles(ctx, projectiles, cam) {
    projectiles.forEach(p => {
      // Trail
      for (let i = 1; i <= 3; i++) {
        ctx.globalAlpha = 0.2 * (4-i) / 3;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x-cam.x-p.vx*i, p.y-cam.y-p.vy*i, 3-i*0.5, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Core
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(p.x-cam.x, p.y-cam.y, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x-cam.x, p.y-cam.y, 3.5, 0, Math.PI*2); ctx.fill();
    });
  }

  drawFloatTexts(ctx, floatTexts, cam) {
    floatTexts.forEach(f => {
      const alpha = Math.min(1, f.life/20);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillStyle   = f.color;
      ctx.font        = 'bold 13px sans-serif';
      ctx.textAlign   = 'center';
      ctx.fillText(f.text, f.x - cam.x, f.y - cam.y);
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
  }

  drawTransition(alpha) {
    this.ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  drawDeathScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(0, 0, this.W, this.H);
    // Red vignette
    const grad = ctx.createRadialGradient(this.W/2,this.H/2,0,this.W/2,this.H/2,this.W/2);
    grad.addColorStop(0, 'rgba(150,0,0,0)');
    grad.addColorStop(1, 'rgba(150,0,0,0.5)');
    ctx.fillStyle = grad; ctx.fillRect(0,0,this.W,this.H);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 40px serif'; ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 20;
    ctx.fillText('☠ ÖLDÜNÜZ ☠', this.W/2, this.H/2-20);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#bdc3c7'; ctx.font = '16px sans-serif';
    ctx.fillText('R tuşuna basarak köyde yeniden doğun', this.W/2, this.H/2+20);
  }

  render(world) {
    const ctx = this.ctx;
    this.clear();
    this.drawMap(world);
    world.metins.forEach(m  => this.drawMetin(ctx, m,  world.camera, world.tick));
    world.enemies.forEach(e => this.drawEnemy(ctx, e,  world.camera, world.tick));
    this.drawParticles(ctx, world.particles, world.camera);
    this.drawPlayer(ctx, world.player, world.camera, world.tick);
    this.drawProjectiles(ctx, world.projectiles, world.camera);
    this.drawFloatTexts(ctx, world.floatTexts, world.camera);
    if (world.transitioning)    this.drawTransition(world.transitionAlpha);
    if (world.player.isDead())  this.drawDeathScreen();
  }

  // ── Helpers ──────────────────────────────────────────────
  _darken(hex, factor) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgb(${Math.floor(r*factor)},${Math.floor(g*factor)},${Math.floor(b*factor)})`;
  }
  _lighten(hex, factor) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgb(${Math.min(255,Math.floor(r*factor))},${Math.min(255,Math.floor(g*factor))},${Math.min(255,Math.floor(b*factor))})`;
  }
}
