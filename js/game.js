// ============================================================
// METIN2D - Main Game Controller
// ============================================================

class Game {
  constructor() {
    this.state     = 'select';
    this.player    = null;
    this.world     = null;
    this.renderer  = null;
    this.hud       = null;
    this.keys      = {};
    this._setupInput();
  }

  _setupInput() {
    document.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      if (this.state !== 'playing') return;
      const p = this.player;
      if (e.key === '1') this._useSkill(0);
      if (e.key === '2') this._useSkill(1);
      if (e.key === '3') this._useSkill(2);
      if (e.key === '4') this._useSkill(3);
      if (e.key === '5') this._useSkill(4);
      if (e.key === '6') this._useSkill(5);
      if (e.key === 'h' || e.key === 'H') this._quickPotion('hp');
      if (e.key === 'm' || e.key === 'M') this._quickPotion('mp');
      if (e.key === 'i' || e.key === 'I') this._toggleInventory();
      if (e.key === 'c' || e.key === 'C') this._toggleStats();
      if (e.key === 'f' || e.key === 'F') this._interactNpc();
      if ((e.key === 'r' || e.key === 'R') && p && p.isDead()) this._respawn();
    });
    document.addEventListener('keyup', e => { this.keys[e.key] = false; });
  }

  startGame(classId) {
    try {
      const nameInput = document.getElementById('charName');
      const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : GAME_DATA.classes[classId].name;
      
      this.player   = new Player(classId, name);
      this.world    = new GameWorld(this.player);
      this.renderer = new Renderer(document.getElementById('gameCanvas'));
      this.hud      = new HUD(this.world);
      this.state    = 'playing';

      this._buildSkillBar();

      document.getElementById('classSelect').style.display = 'none';
      document.getElementById('gameWrapper').style.display = 'flex';

      this._loop();
    } catch(err) {
      console.error('startGame error:', err);
      alert('Hata: ' + err.message);
    }
  }

  _buildSkillBar() {
    const p = this.player;
    // Hide all first
    for(let i=0;i<6;i++){const b=document.getElementById('skill'+i);if(b)b.style.display='none';}
    p.skillIds.forEach((skId, i) => {
      const sk  = GAME_DATA.skills[skId];
      if(!sk) return;
      const btn = document.getElementById('skill' + i);
      if (!btn) return;
      btn.style.display = '';
      const idx = i;
      btn.innerHTML = `<span class="sk-name">${sk.name}</span><span class="sk-key">${i+1}</span><span class="sk-mp">${sk.mp}MP</span><span class="cd-text"></span>`;
      btn.onclick = () => this._useSkill(idx);
      btn.title = sk.desc || '';
    });
  }

  _loop() {
    const loop = () => {
      if (this.state === 'playing' || this.state === 'dead') {
        if (!this.player.isDead()) {
          this.world.update(this.keys, {});
          this.state = 'playing';
        } else {
          this.state = 'dead';
        }
        this.renderer.render(this.world);
        this.hud.update();
        if (this.world.showInventory) this.hud.renderInventory();
        if (this.world.showStats)     this.hud.renderStats();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _useSkill(idx) {
    const p    = this.player;
    const skId = p.skillIds[idx];
    const res  = p.useSkill(skId, this.world.enemies, this.world.particles, this.world.floatTexts);
    if (res.msg) this.world.addMsg(res.ok ? '✨ ' + res.msg : '⚠ ' + res.msg, res.ok ? '#f1c40f' : '#e74c3c');
    const sk = GAME_DATA.skills[skId];
    if (sk.type === 'projectile' && res.ok) {
      const nearest = this._nearestEnemy(300);
      if (nearest) {
        const dx = nearest.px - p.px, dy = nearest.py - p.py;
        const dist = Math.hypot(dx, dy) || 1;
        this.world.projectiles.push({
          x: p.px, y: p.py,
          vx: dx / dist * 5, vy: dy / dist * 5,
          dmg: Math.floor(p.atk * sk.dmgMult),
          color: sk.color, life: 80
        });
      }
    }
  }

  _nearestEnemy(maxDist) {
    let best = null, bestD = maxDist;
    this.world.enemies.forEach(e => {
      if (!e.alive) return;
      const d = Math.hypot(e.px - this.player.px, e.py - this.player.py);
      if (d < bestD) { bestD = d; best = e; }
    });
    return best;
  }

  _quickPotion(type) {
    const p = this.player;
    const itemId = type === 'hp'
      ? (p.inventory.find(i => i.itemId === 'hp_potion_m') ? 'hp_potion_m' : 'hp_potion_s')
      : 'mp_potion_s';
    const res = p.useItem(itemId);
    this.world.addMsg(res.ok ? '🧪 ' + res.msg : '⚠ ' + res.msg, res.ok ? '#2ecc71' : '#e74c3c');
    if (res.ok) {
      this.world.floatTexts.push({ x: p.px, y: p.py - 30,
        text: type === 'hp' ? '+HP' : '+MP', color: type === 'hp' ? '#e74c3c' : '#3498db', life: 60 });
    }
  }

  _toggleInventory() {
    this.world.showInventory = !this.world.showInventory;
    this.world.showStats = false;
    document.getElementById('invPanel').style.display   = this.world.showInventory ? 'block' : 'none';
    document.getElementById('statsPanel').style.display = 'none';
    if (this.world.showInventory) this.hud.renderInventory();
  }

  _toggleStats() {
    this.world.showStats     = !this.world.showStats;
    this.world.showInventory = false;
    document.getElementById('statsPanel').style.display = this.world.showStats ? 'block' : 'none';
    document.getElementById('invPanel').style.display   = 'none';
    if (this.world.showStats) this.hud.renderStats();
  }

  _interactNpc() {
    const npc = this.world.checkNpc();
    if (!npc) return;
    document.getElementById('shopPanel').style.display = 'block';
    this.hud.renderShop(npc);
  }

  closeNpc() {
    document.getElementById('shopPanel').style.display = 'none';
  }

  useItem(itemId) {
    const res = this.player.useItem(itemId);
    this.world.addMsg(res.ok ? '✅ ' + res.msg : '⚠ ' + res.msg, res.ok ? '#2ecc71' : '#e74c3c');
    this.hud.renderInventory();
  }

  buyItem(itemId) {
    const item = GAME_DATA.items[itemId];
    const p    = this.player;
    if (p.yang < item.price) { this.world.addMsg('⚠ Yeterli Yang yok!', '#e74c3c'); return; }
    p.yang -= item.price;
    p.addItem(itemId, 1);
    this.world.addMsg(`🛒 ${item.name} satın alındı (${item.price} Yang)`, '#2ecc71');
    this.hud.renderInventory();
    this.hud.renderShop(this.world.checkNpc());
  }

  craftItem(itemId) {
    const item = GAME_DATA.items[itemId];
    const p    = this.player;
    for (const [mat, qty] of Object.entries(item.recipe)) {
      const slot = p.inventory.find(i => i.itemId === mat);
      if (!slot || slot.qty < qty) { this.world.addMsg('⚠ Malzeme eksik!', '#e74c3c'); return; }
    }
    for (const [mat, qty] of Object.entries(item.recipe)) {
      const slot = p.inventory.find(i => i.itemId === mat);
      slot.qty -= qty;
      if (slot.qty <= 0) p.inventory = p.inventory.filter(i => i.itemId !== mat);
    }
    p.addItem(itemId, 1);
    this.world.addMsg(`⚗ ${item.name} üretildi!`, '#f39c12');
    this.hud.renderInventory();
    this.hud.renderShop(this.world.checkNpc());
  }

  _respawn() {
    const p  = this.player;
    p.hp     = p.maxHp;
    p.mp     = p.maxMp;
    p.poisoned    = 0;
    p.buffs       = [];
    p.berserkTimer = 0;
    p.stealthed   = false;
    this.world.loadMap('town');
    this.state = 'playing';
    this.world.addMsg('🔄 Köyde yeniden doğdunuz.', '#3498db');
  }
}

// Global — init as soon as scripts load
let game = null;
function _initGame() { game = new Game(); }
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initGame);
} else {
  _initGame();
}
