// ============================================================
// METIN2D - Enemy & MetinStone Entities
// ============================================================

class Enemy {
  constructor(typeId, spawnX, spawnY) {
    const data = GAME_DATA.monsters[typeId];
    this.typeId   = typeId;
    this.name     = data.name;
    this.level    = data.level;
    this.maxHp    = data.hp;
    this.hp       = data.hp;
    this.atk      = data.atk;
    this.def      = data.def;
    this.xp       = data.xp;
    this.yang     = data.yang;
    this.size     = data.size;
    this.color    = data.color;
    this.speed    = data.speed || 0.9;
    this.boss     = data.boss || false;
    this.dropItem = data.drop || null;
    this.respawnTime = data.respawn || 10000;

    this.spawnX = spawnX * 40;
    this.spawnY = spawnY * 40;
    this.px = this.spawnX;
    this.py = this.spawnY;

    this.alive       = true;
    this.respawnAt   = 0;
    this.dir         = 1;
    this.frame       = 0;
    this.atkTimer    = 0;
    this.atkCooldown = this.boss ? 80 : 100;
    this.aggroRange  = this.boss ? 300 : 180;
    this.aggro       = false;
    this.poisoned    = 0;
  }

  update(player, particles, floatTexts, onKill) {
    if (!this.alive) return;
    this.frame += 0.08;
    if (this.poisoned > 0) {
      this.poisoned--;
      if (this.poisoned % 60 === 0) {
        this.hp = Math.max(0, this.hp - 2);
        if (this.hp <= 0) { this.die(player, particles, floatTexts, onKill); return; }
      }
    }

    const dx = player.px - this.px;
    const dy = player.py - this.py;
    const dist = Math.hypot(dx, dy);

    if (dist < this.aggroRange) this.aggro = true;
    if (dist > this.aggroRange * 2.5) { this.aggro = false; }

    // Move toward player
    if (this.aggro && dist > 28 && this.speed > 0) {
      this.px += (dx / dist) * this.speed;
      this.py += (dy / dist) * this.speed;
      this.dir = dx > 0 ? 1 : -1;
    }

    // Attack player
    if (dist < 35 && !player.stealthed) {
      this.atkTimer++;
      if (this.atkTimer >= this.atkCooldown) {
        this.atkTimer = 0;
        const dmg = player.takeDamage(this.atk);
        if (dmg > 0) {
          floatTexts.push({ x: player.px, y: player.py - 28, text: '-' + dmg, color: '#e74c3c', life: 60 });
          _spawnBurst(particles, player.px, player.py, '#e74c3c', 4);
        }
      }
    } else {
      this.atkTimer = Math.max(0, this.atkTimer - 0.5);
    }
  }

  takeDamage(dmg, particles, floatTexts) {
    const actual = Math.max(1, dmg - this.def);
    this.hp -= actual;
    floatTexts.push({ x: this.px, y: this.py - this.size - 4, text: '-' + actual, color: '#f39c12', life: 55 });
    _spawnBurst(particles, this.px, this.py, '#f39c12', 4);
    return actual;
  }

  die(player, particles, floatTexts, onKill) {
    this.alive = false;
    this.respawnAt = Date.now() + this.respawnTime;
    _spawnBurst(particles, this.px, this.py, '#f1c40f', this.boss ? 20 : 10);
    floatTexts.push({ x: this.px, y: this.py - 20, text: '+' + this.xp + ' XP', color: '#f1c40f', life: 90 });
    floatTexts.push({ x: this.px, y: this.py - 8,  text: '+' + this.yang + ' Yang', color: '#2ecc71', life: 90 });
    if (onKill) onKill(this);
  }

  tryRespawn() {
    if (!this.alive && Date.now() >= this.respawnAt) {
      this.hp = this.maxHp;
      this.px = this.spawnX;
      this.py = this.spawnY;
      this.alive = true;
      this.aggro = false;
      this.poisoned = 0;
    }
  }
}

// ============================================================
class MetinStone {
  constructor(stoneId, gridX, gridY) {
    const data = GAME_DATA.metinStones.find(m => m.id === stoneId);
    this.stoneId  = stoneId;
    this.name     = data.name;
    this.level    = data.level;
    this.maxHp    = data.hp;
    this.hp       = data.hp;
    this.xp       = data.xp;
    this.yang     = data.yang;
    this.color    = data.color;
    this.minLevelReq = data.minLevelReq;
    this.guardType   = data.guardType;
    this.guardCount  = data.guardCount;

    this.px    = gridX * 40;
    this.py    = gridY * 40;
    this.alive = true;
    this.guards = [];         // active guard enemies
    this.phase  = 0;          // 0-3: spawn phase (0=no guards yet)
    this.frame  = 0;

    // Respawn
    this.respawnTime = 300000; // 5 minutes
    this.respawnAt   = 0;
  }

  takeDamage(dmg, playerLevel, particles, floatTexts) {
    if (!this.alive) return { ok: false, msg: 'Bu Metin Taşı zaten yıkılmış.' };
    if (playerLevel < this.minLevelReq) return { ok: false, msg: `Seviye ${this.minLevelReq} gerekiyor!` };

    const actual = Math.max(1, dmg);
    this.hp = Math.max(0, this.hp - actual);
    floatTexts.push({ x: this.px + 14, y: this.py - 10, text: '-' + actual, color: '#ff6b35', life: 60 });
    _spawnBurst(particles, this.px + 14, this.py + 14, this.color, 5);

    // Phase check — spawn guards
    const pct = this.hp / this.maxHp;
    const newPhase = pct < 0.25 ? 3 : pct < 0.5 ? 2 : pct < 0.75 ? 1 : 0;
    return { ok: true, actual, newPhase, died: this.hp <= 0 };
  }

  die(particles, floatTexts) {
    this.alive = false;
    this.respawnAt = Date.now() + this.respawnTime;
    for (let i = 0; i < 16; i++) _spawnBurst(particles, this.px + Math.random() * 28, this.py + Math.random() * 28, this.color, 3);
    floatTexts.push({ x: this.px + 14, y: this.py - 20, text: 'YIKILDI! +' + this.xp + 'XP', color: '#f1c40f', life: 120 });
    floatTexts.push({ x: this.px + 14, y: this.py - 6,  text: '+' + this.yang + ' Yang',       color: '#2ecc71', life: 120 });
  }

  tryRespawn() {
    if (!this.alive && Date.now() >= this.respawnAt) {
      this.hp = this.maxHp;
      this.alive = true;
      this.phase = 0;
      this.guards = [];
    }
  }
}

// ============================================================
