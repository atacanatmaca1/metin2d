// ============================================================
// METIN2D - Player Entity  (v3 - full skills, no undefined errors)
// ============================================================

class Player {
  constructor(classId, name) {
    const cls = GAME_DATA.classes[classId];
    this.classId   = classId;
    this.className = cls.name;
    this.name      = name || cls.name;
    this.color     = cls.color;
    this.icon      = cls.icon;

    // Position
    this.px  = 14 * 40;
    this.py  = 14 * 40;
    this.dir = 1;

    // Progression
    this.level = 1;
    this.xp    = 0;
    this.yang  = 500;

    // Base stats (from class)
    this.baseHp  = cls.stats.hp;
    this.baseMp  = cls.stats.mp;
    this.baseAtk = cls.stats.atk;
    this.baseDef = cls.stats.def;
    this.baseSpd = cls.stats.spd;
    this.statGrowth = cls.statGrowth;

    // Equipment — MUST be set before any getter is called
    this.equipment = { weapon: null, armor: null, ring: null };

    // Buff/debuff lists — MUST be set before maxHp getter
    this.buffs    = [];
    this.poisoned = 0;

    // NOW safe to read maxHp/maxMp
    this.hp = this.maxHp;
    this.mp = this.maxMp;

    // Timed effects
    this.berserkTimer  = 0;
    this.stealthed     = false;
    this.stealthTimer  = 0;
    this.invincible    = 0;

    // Skills
    this.skillIds    = cls.skills;
    this.skillTimers = {};
    this.skillIds.forEach(s => { this.skillTimers[s] = 0; });

    // Combat
    this.atkTimer    = 0;
    this.atkCooldown = 45;
    this.frame       = 0;

    // Inventory
    this.inventory = [
      { itemId: 'hp_potion_s', qty: 5 },
      { itemId: 'mp_potion_s', qty: 3 }
    ];

    // Stats tracking
    this.totalKills      = 0;
    this.totalMetins     = 0;
    this.totalYangEarned = 0;
  }

  // ── Computed stats ──────────────────────────────────
  get maxHp() {
    // Guard: equipment may not exist yet during construction chain
    const eq  = this.equipment || {};
    const buf = this.buffs     || [];
    let v = this.baseHp + (this.level - 1) * this.statGrowth.hp;
    if (eq.armor && GAME_DATA && GAME_DATA.items[eq.armor]) v += (GAME_DATA.items[eq.armor].hp || 20);
    for (const b of buf) if (b.stat === 'hp') v += b.value;
    return v;
  }
  get maxMp() {
    const buf = this.buffs || [];
    let v = this.baseMp + (this.level - 1) * this.statGrowth.mp;
    for (const b of buf) if (b.stat === 'mp') v += b.value;
    return v;
  }
  get atk() {
    const eq  = this.equipment || {};
    const buf = this.buffs     || [];
    let v = this.baseAtk + (this.level - 1) * this.statGrowth.atk;
    if (eq.weapon && GAME_DATA.items[eq.weapon]) v += (GAME_DATA.items[eq.weapon].atk || 0);
    if (eq.ring   && GAME_DATA.items[eq.ring])   v += (GAME_DATA.items[eq.ring].atk   || 0);
    if (this.berserkTimer > 0) v = Math.floor(v * 1.5);
    for (const b of buf) if (b.stat === 'atk') v += b.value;
    return v;
  }
  get def() {
    const eq  = this.equipment || {};
    const buf = this.buffs     || [];
    let v = this.baseDef + (this.level - 1) * this.statGrowth.def;
    if (eq.armor && GAME_DATA.items[eq.armor]) v += (GAME_DATA.items[eq.armor].def || 0);
    if (eq.ring  && GAME_DATA.items[eq.ring])  v += (GAME_DATA.items[eq.ring].def  || 0);
    for (const b of buf) if (b.stat === 'def') v += b.value;
    return v;
  }
  get spd() {
    const buf = this.buffs || [];
    let v = this.baseSpd;
    for (const b of buf) if (b.stat === 'spd') v += b.value;
    return v;
  }

  // ── XP / Level ──────────────────────────────────────
  getXpNeeded() {
    const t = GAME_DATA.expTable;
    const idx = Math.min(this.level, t.length - 1);
    return t[idx] || (t[t.length - 1] * (this.level - t.length + 2));
  }

  gainXp(amount) {
    this.xp += amount;
    const events = [];
    while (this.xp >= this.getXpNeeded() && this.level < 40) {
      this.xp -= this.getXpNeeded();
      this.level++;
      this.hp = this.maxHp;
      this.mp = this.maxMp;
      events.push('levelup');
    }
    return events;
  }

  // ── Per-frame update ────────────────────────────────
  update() {
    this.frame += 0.1;
    if (this.atkTimer   > 0) this.atkTimer--;
    if (this.invincible > 0) this.invincible--;
    if (this.berserkTimer  > 0) this.berserkTimer--;
    if (this.stealthTimer  > 0) { this.stealthTimer--; if (this.stealthTimer === 0) this.stealthed = false; }

    // Poison tick (every 60 frames = 1 sec)
    if (this.poisoned > 0) {
      this.poisoned--;
      if (this.poisoned % 60 === 0) this.hp = Math.max(1, this.hp - 3);
    }

    // Buff timers
    this.buffs = this.buffs.filter(b => { b.timer--; return b.timer > 0; });

    // Skill cooldowns
    for (const k in this.skillTimers) if (this.skillTimers[k] > 0) this.skillTimers[k]--;

    // Passive MP regen
    if (Math.floor(this.frame) % 3 === 0 && this.mp < this.maxMp) {
      this.mp = Math.min(this.maxMp, this.mp + 1);
    }
  }

  // ── Skill use ──────────────────────────────────────
  useSkill(skillId, enemies, particles, floatTexts) {
    if (this.skillTimers[skillId] > 0)
      return { ok: false, msg: 'Bekliyorsunuz... (' + Math.ceil(this.skillTimers[skillId] / 60) + 's)' };
    const sk = GAME_DATA.skills[skillId];
    if (!sk) return { ok: false, msg: 'Bilinmeyen skill' };
    if (this.mp < sk.mp) return { ok: false, msg: 'Yeterli MP yok! (' + sk.mp + ' MP gerekli)' };

    this.mp -= sk.mp;
    this.skillTimers[skillId] = sk.cd;

    // ── HEAL ──
    if (sk.type === 'heal') {
      const heal = Math.floor(this.maxHp * 0.35);
      this.hp = Math.min(this.maxHp, this.hp + heal);
      floatTexts.push({ x: this.px, y: this.py - 34, text: '+' + heal + ' HP', color: '#2ecc71', life: 80 });
      _spawnBurst(particles, this.px, this.py, '#2ecc71', 8);
      return { ok: true, msg: sk.name + '! +' + heal + ' HP iyileşti' };
    }

    // ── BUFF ──
    if (sk.type === 'buff') {
      switch (skillId) {
        case 'berserk':
          this.berserkTimer = 180;
          floatTexts.push({ x: this.px, y: this.py - 34, text: 'BERSERK!', color: '#e74c3c', life: 90 });
          break;
        case 'stealth':
          this.stealthed   = true;
          this.stealthTimer = 180;
          floatTexts.push({ x: this.px, y: this.py - 34, text: 'GİZLİLİK', color: '#8e44ad', life: 90 });
          break;
        case 'swift':
          this.buffs.push({ stat: 'spd', value: 1.5, timer: 300 });
          floatTexts.push({ x: this.px, y: this.py - 34, text: 'HIZ!', color: '#3498db', life: 80 });
          break;
        case 'aura':
          this.buffs.push({ stat: 'def', value: 10, timer: 600 });
          floatTexts.push({ x: this.px, y: this.py - 34, text: 'AURA!', color: '#f39c12', life: 80 });
          break;
        case 'dark_protection':
          this.buffs.push({ stat: 'def', value: 14, timer: 480 });
          floatTexts.push({ x: this.px, y: this.py - 34, text: 'KALKANI', color: '#2c3e50', life: 80 });
          break;
      }
      _spawnBurst(particles, this.px, this.py, sk.color, 10);
      return { ok: true, msg: sk.name + ' aktif!' };
    }

    // ── ATTACK SKILLS (aoe / single / dot / projectile) ──
    const dmg  = Math.floor(this.atk * sk.dmgMult);
    let hits   = 0;

    if (sk.type !== 'projectile') {
      enemies.forEach(e => {
        if (!e.alive) return;
        const dist = Math.hypot(e.px - this.px, e.py - this.py);
        if (dist < sk.range) {
          const dealt = Math.max(1, dmg - Math.floor(e.def * 0.5));
          e.takeDamage(dealt, particles, floatTexts);
          if (sk.type === 'dot') e.poisoned = 300;
          hits++;
        }
      });
      _spawnBurst(particles, this.px, this.py, sk.color, hits > 0 ? 12 : 6);
    }

    // Dash skill
    if (sk.type === 'dash') {
      const nearest = enemies.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.px-this.px,a.py-this.py)-Math.hypot(b.px-this.px,b.py-this.py))[0];
      if(nearest){const dx=nearest.px-this.px,dy=nearest.py-this.py,d=Math.hypot(dx,dy)||1;this.px+=dx/d*Math.min(d,110);this.py+=dy/d*Math.min(d,110);const dealt=Math.max(1,dmg-Math.floor(nearest.def*0.5));nearest.takeDamage(dealt,particles,floatTexts);_spawnBurst(particles,this.px,this.py,sk.color,8);}
      return {ok:true,msg:sk.name+' — atıldı!'};
    }
    // Big heal
    if (sk.type === 'heal_big') {
      const heal = Math.floor(this.maxHp * 0.70);
      this.hp = Math.min(this.maxHp, this.hp + heal);
      // 5 sec regen buff
      this.buffs.push({stat:'hp_regen',value:3,timer:300});
      floatTexts.push({x:this.px,y:this.py-34,text:'+'+heal+' HP',color:'#2ecc71',life:90});
      _spawnBurst(particles,this.px,this.py,'#2ecc71',16);
      return {ok:true,msg:sk.name+'! +'+heal+' HP + regen'};
    }
    // Projectile handled in game.js (_useSkill)
    if (sk.type === 'projectile') {
      _spawnBurst(particles, this.px, this.py, sk.color, 8);
      return { ok: true, msg: sk.name + ' fırlatıldı!', projectile: true, dmg };
    }

    return {
      ok: true,
      msg: sk.name + (hits > 0 ? ` — ${hits} düşmana ${dmg} hasar!` : ' — ıskaladı')
    };
  }

  // ── Combat ─────────────────────────────────────────
  takeDamage(dmg) {
    if (this.invincible > 0 || this.stealthed) return 0;
    const actual = Math.max(1, dmg - Math.floor(this.def * 0.7));
    this.hp = Math.max(0, this.hp - actual);
    this.invincible = 40;
    return actual;
  }

  // ── Inventory ──────────────────────────────────────
  useItem(itemId) {
    const slot = this.inventory.find(i => i.itemId === itemId);
    if (!slot || slot.qty <= 0) return { ok: false, msg: 'Envanterde yok' };
    const item = GAME_DATA.items[itemId];
    if (!item) return { ok: false, msg: 'Bilinmeyen eşya' };

    if (item.type === 'potion') {
      if (item.effect === 'hp') this.hp = Math.min(this.maxHp, this.hp + item.value);
      if (item.effect === 'mp') this.mp = Math.min(this.maxMp, this.mp + item.value);
      slot.qty--;
      if (slot.qty <= 0) this.inventory = this.inventory.filter(i => i.itemId !== itemId);
      return { ok: true, msg: item.name + ' kullanıldı (+' + item.value + ')' };
    }

    if (['weapon','armor','accessory'].includes(item.type)) {
      const slotName = item.slot;
      const prev = this.equipment[slotName];
      this.equipment[slotName] = itemId;
      slot.qty--;
      if (slot.qty <= 0) this.inventory = this.inventory.filter(i => i.itemId !== itemId);
      if (prev) this.addItem(prev, 1);
      return { ok: true, msg: item.name + ' kuşanıldı!' };
    }

    return { ok: false, msg: 'Bu eşya kullanılamaz' };
  }

  addItem(itemId, qty = 1) {
    const ex = this.inventory.find(i => i.itemId === itemId);
    if (ex) ex.qty += qty;
    else this.inventory.push({ itemId, qty });
  }

  isDead() { return this.hp <= 0; }
}

// Shared burst helper (also used by enemies.js)
function _spawnBurst(particles, x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 0.8 + Math.random() * 2.5;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 25 + Math.random() * 20, color });
  }
}
