// ============================================================
// METIN2D - Game State / World Manager
// ============================================================

class GameWorld {
  constructor(player) {
    this.player     = player;
    this.currentMapId = 'town';
    this.enemies    = [];
    this.metins     = [];
    this.particles  = [];
    this.floatTexts = [];
    this.projectiles = [];
    this.tick       = 0;

    // Camera
    this.camera = { x: 0, y: 0 };

    // UI state
    this.messages   = [];  // [{text, color, life}]
    this.showInventory = false;
    this.showStats     = false;
    this.showShop      = false;
    this.shopNpc       = null;
    this.talkNpc       = null;
    this.portalTransition = 0; // fade timer

    // Transition
    this.transitioning = false;
    this.transitionTarget = null;
    this.transitionAlpha  = 0;

    this.loadMap('town');
  }

  loadMap(mapId, spawnPortalFrom) {
    const mapDef = GAME_DATA.maps[mapId];
    this.currentMapId = mapId;
    this.enemies  = [];
    this.metins   = [];

    // Spawn monsters
    if (mapDef.monsters) {
      mapDef.monsters.forEach(m => {
        this.enemies.push(new Enemy(m.type, m.x, m.y));
      });
    }

    // Spawn metin stones
    if (mapDef.metins) {
      mapDef.metins.forEach(m => {
        this.metins.push(new MetinStone(m.stoneId, m.x, m.y));
      });
    }

    // Place player at portal exit or default
    if (spawnPortalFrom) {
      const portal = mapDef.portals.find(p => p.toMap === spawnPortalFrom);
      if (portal) {
        this.player.px = (portal.x + 2) * 40;
        this.player.py = portal.y * 40;
      }
    } else {
      this.player.px = 14 * 40;
      this.player.py = 14 * 40;
    }

    this.particles  = [];
    this.floatTexts = [];
    this.projectiles = [];
    this.addMsg('📍 ' + mapDef.name + ' haritasına girildi', '#f1c40f');
  }

  addMsg(text, color = '#ecf0f1') {
    this.messages.unshift({ text, color, life: 200 });
    if (this.messages.length > 6) this.messages.pop();
  }

  // Returns portal if player is on one, else null
  checkPortal() {
    const mapDef = GAME_DATA.maps[this.currentMapId];
    if (!mapDef.portals) return null;
    for (const p of mapDef.portals) {
      const dx = this.player.px - p.x * 40;
      const dy = this.player.py - p.y * 40;
      if (Math.hypot(dx, dy) < 32) return p;
    }
    return null;
  }

  // Returns NPC if player is near one
  checkNpc() {
    const mapDef = GAME_DATA.maps[this.currentMapId];
    const npcs = [...(mapDef.npcs || []), ...(mapDef.resources || [])];
    for (const n of npcs) {
      const dx = this.player.px - n.x * 40;
      const dy = this.player.py - n.y * 40;
      if (Math.hypot(dx, dy) < 36) return n;
    }
    return null;
  }

  update(keys, input) {
    this.tick++;
    const p = this.player;

    // Transition
    if (this.transitioning) {
      this.transitionAlpha += 0.04;
      if (this.transitionAlpha >= 1) {
        this.loadMap(this.transitionTarget.toMap, this.currentMapId);
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.transitionTarget = null;
      }
      return;
    }

    p.update();

    // Movement
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) { dx -= p.spd; p.dir = -1; }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) { dx += p.spd; p.dir =  1; }
    if (keys['ArrowUp']    || keys['w'] || keys['W'])   dy -= p.spd;
    if (keys['ArrowDown']  || keys['s'] || keys['S'])   dy += p.spd;
    if (dx && dy) { dx *= 0.707; dy *= 0.707; }

    const TILE = 40;
    const mapDef = GAME_DATA.maps[this.currentMapId];
    const mw = mapDef.width * TILE, mh = mapDef.height * TILE;

    p.px = Math.max(0, Math.min(mw - TILE, p.px + dx));
    p.py = Math.max(0, Math.min(mh - TILE, p.py + dy));

    // Camera
    const CW = 640, CH = 420;
    this.camera.x = Math.round(Math.max(0, Math.min(mw - CW, p.px - CW / 2 + TILE / 2)));
    this.camera.y = Math.round(Math.max(0, Math.min(mh - CH, p.py - CH / 2 + TILE / 2)));

    // Portal check
    if (!this.transitioning) {
      const portal = this.checkPortal();
      if (portal && !this._lastPortal) {
        this._lastPortal = portal;
        this.addMsg('🌀 ' + portal.label + ' — geçiş hazır!', portal.color);
        this.transitioning = true;
        this.transitionTarget = portal;
      } else if (!portal) {
        this._lastPortal = null;
      }
    }

    // Enemy updates
    this.enemies.forEach(e => {
      e.tryRespawn();
      e.update(p, this.particles, this.floatTexts, (dead) => {
        const events = p.gainXp(dead.xp);
        p.yang += dead.yang;
        p.totalKills++;
        p.totalYangEarned += dead.yang;
        if (dead.dropItem) {
          p.addItem(dead.dropItem, 1);
          this.addMsg('💎 ' + GAME_DATA.items[dead.dropItem].name + ' düştü!', '#f39c12');
        }
        this.addMsg(`☠ ${dead.name} öldürüldü +${dead.xp}XP +${dead.yang}Yang`, '#ecf0f1');
        if (events.includes('levelup')) {
          this.addMsg(`✨ SEVİYE ${p.level} ATLANDI!`, '#f1c40f');
        }
      });
    });

    // Metin stone updates
    this.metins.forEach(m => m.tryRespawn());

    // Player auto-attack nearest enemy
    if (p.atkTimer === 0 && !p.isDead()) {
      let nearest = null, nearDist = 42;
      this.enemies.forEach(e => {
        if (!e.alive) return;
        const d = Math.hypot(e.px - p.px, e.py - p.py);
        if (d < nearDist) { nearDist = d; nearest = e; }
      });
      if (nearest) {
        p.atkTimer = p.atkCooldown;
        const dmg = Math.max(1, p.atk - nearest.def + Math.floor(Math.random() * 5));
        nearest.takeDamage(dmg, this.particles, this.floatTexts);
        if (nearest.hp <= 0) {
          nearest.die(p, this.particles, this.floatTexts, (dead) => {
            const events = p.gainXp(dead.xp);
            p.yang += dead.yang;
            p.totalKills++;
            p.totalYangEarned += dead.yang;
            if (dead.dropItem) { p.addItem(dead.dropItem, 1); this.addMsg('💎 ' + GAME_DATA.items[dead.dropItem].name + ' düştü!', '#f39c12'); }
            this.addMsg(`☠ ${dead.name} öldürüldü +${dead.xp}XP +${dead.yang}Yang`, '#ecf0f1');
            if (events.includes('levelup')) this.addMsg(`✨ SEVİYE ${p.level} ATLANDI!`, '#f1c40f');
          });
        }
      }

      // Metin stone auto-attack
      let nearMetin = null, nearMetinDist = 42;
      this.metins.forEach(m => {
        if (!m.alive) return;
        const d = Math.hypot((m.px + 14) - p.px, (m.py + 14) - p.py);
        if (d < nearMetinDist) { nearMetinDist = d; nearMetin = m; }
      });
      if (nearMetin) {
        p.atkTimer = p.atkCooldown;
        const dmg = Math.max(1, p.atk + Math.floor(Math.random() * 8));
        const res = nearMetin.takeDamage(dmg, p.level, this.particles, this.floatTexts);
        if (res.ok) {
          // Spawn guards at new phase
          if (res.newPhase > nearMetin.phase) {
            nearMetin.phase = res.newPhase;
            for (let i = 0; i < nearMetin.guardCount; i++) {
              const gx = (nearMetin.px / 40) + (Math.random() * 4 - 2);
              const gy = (nearMetin.py / 40) + (Math.random() * 4 - 2);
              this.enemies.push(new Enemy(nearMetin.guardType, Math.round(gx), Math.round(gy)));
            }
            this.addMsg(`⚠ ${nearMetin.name} bekçiler çağırdı!`, '#e74c3c');
          }
          if (res.died) {
            nearMetin.die(this.particles, this.floatTexts);
            const events = p.gainXp(nearMetin.xp);
            p.yang += nearMetin.yang;
            p.totalMetins++;
            p.addItem('metin_shard', 1 + Math.floor(Math.random() * 3));
            this.addMsg(`💥 ${nearMetin.name} YIKILDI! +${nearMetin.xp}XP`, '#f1c40f');
            if (events.includes('levelup')) this.addMsg(`✨ SEVİYE ${p.level} ATLANDI!`, '#f1c40f');
          }
        } else if (res.msg) {
          this.addMsg('⛔ ' + res.msg, '#e74c3c');
        }
      }
    }

    // Projectiles
    this.projectiles = this.projectiles.filter(proj => {
      proj.x += proj.vx; proj.y += proj.vy; proj.life--;
      this.enemies.forEach(e => {
        if (!e.alive) return;
        if (Math.hypot(e.px - proj.x, e.py - proj.y) < e.size + 8) {
          e.takeDamage(proj.dmg, this.particles, this.floatTexts);
          if (e.hp <= 0) e.die(p, this.particles, this.floatTexts, (dead) => {
            const events = p.gainXp(dead.xp);
            p.yang += dead.yang;
            p.totalKills++;
            if (events.includes('levelup')) this.addMsg(`✨ SEVİYE ${p.level} ATLANDI!`, '#f1c40f');
          });
          proj.life = 0;
        }
      });
      return proj.life > 0;
    });

    // Particles
    this.particles = this.particles.filter(pt => {
      if (pt.burst) { pt.count = 0; return false; } // single frame
      pt.x += pt.vx; pt.y += pt.vy; pt.life--; return pt.life > 0;
    });
    // Expand burst particles
    const newPt = [];
    this.particles.forEach(pt => {
      if (pt.burst) {
        for (let i = 0; i < pt.count; i++) {
          const a = Math.random() * Math.PI * 2, s = 0.8 + Math.random() * 2.2;
          newPt.push({ x: pt.x, y: pt.y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 28 + Math.random()*20, color: pt.color });
        }
      }
    });
    this.particles = this.particles.filter(p => !p.burst).concat(newPt);

    // Float texts
    this.floatTexts = this.floatTexts.filter(f => { f.y -= 0.6; f.life--; return f.life > 0; });
    // Messages
    this.messages = this.messages.filter(m => { m.life--; return m.life > 0; });
  }
}
