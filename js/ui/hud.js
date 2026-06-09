// ============================================================
// METIN2D - HUD & UI Panels
// ============================================================

class HUD {
  constructor(world) {
    this.world = world;
    this._buildDOM();
  }

  _buildDOM() {
    // Already in HTML — just cache references
    this.hpFill  = document.getElementById('hpFill');
    this.mpFill  = document.getElementById('mpFill');
    this.xpFill  = document.getElementById('xpFill');
    this.hpText  = document.getElementById('hpText');
    this.mpText  = document.getElementById('mpText');
    this.xpText  = document.getElementById('xpText');
    this.yangEl  = document.getElementById('yangDisplay');
    this.mapName = document.getElementById('mapName');
    this.lvlEl   = document.getElementById('lvlDisplay');
    this.msgBox  = document.getElementById('msgBox');
    this.skillBar= document.getElementById('skillBar');
    this.invPanel= document.getElementById('invPanel');
    this.statsPanel=document.getElementById('statsPanel');
    this.minimap = document.getElementById('minimap');
    this.minimapCtx = this.minimap ? this.minimap.getContext('2d') : null;
    this.npcPanel= document.getElementById('npcPanel');
    this.shopPanel=document.getElementById('shopPanel');
    // Skill buttons
    this.skillBtns = [0,1,2,3,4,5].map(i => document.getElementById('skill' + i));
  }

  update() {
    const p  = this.world.player;
    const sk = p.skillIds;

    // HP / MP / XP bars
    this.hpFill.style.width = (p.hp / p.maxHp * 100) + '%';
    this.mpFill.style.width = (p.mp / p.maxMp * 100) + '%';
    this.xpFill.style.width = (p.xp / p.getXpNeeded() * 100) + '%';
    this.hpText.textContent  = p.hp + ' / ' + p.maxHp;
    this.mpText.textContent  = p.mp + ' / ' + p.maxMp;
    this.xpText.textContent  = p.xp + ' / ' + p.getXpNeeded();
    this.yangEl.textContent  = p.yang.toLocaleString() + ' Yang';
    this.lvlEl.textContent   = 'Lv.' + p.level;
    this.mapName.textContent = GAME_DATA.maps[this.world.currentMapId].name;

    // Skill cooldowns
    sk.forEach((skId, i) => {
      const btn = this.skillBtns[i];
      if (!btn) return;
      const cd = p.skillTimers[skId];
      const sk_data = GAME_DATA.skills[skId];
      btn.classList.toggle('on-cd', cd > 0);
      btn.querySelector('.cd-text').textContent = cd > 0 ? Math.ceil(cd / 60) + 's' : '';
      btn.querySelector('.sk-name').textContent = sk_data.name;
      btn.querySelector('.sk-mp').textContent   = sk_data.mp + ' MP';
    });

    // Messages
    this.msgBox.innerHTML = this.world.messages.slice(0, 5).map(m =>
      `<div style="color:${m.color};opacity:${Math.min(1, m.life / 40)}">${m.text}</div>`
    ).join('');

    // Minimap
    if (this.minimapCtx) this._drawMinimap();

    // NPC prompt
    const npc = this.world.checkNpc();
    if (this.npcPanel) {
      this.npcPanel.style.display = npc ? 'block' : 'none';
      if (npc) this.npcPanel.textContent = npc.icon + ' ' + npc.name + ' — [F] Konuş';
    }
  }

  _drawMinimap() {
    const ctx  = this.minimapCtx;
    const map  = GAME_DATA.maps[this.world.currentMapId];
    const W = this.minimap.width, H = this.minimap.height;
    const scx  = W / map.width, scy = H / map.height;

    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, W, H);

    // Enemies
    this.world.enemies.forEach(e => {
      if (!e.alive) return;
      ctx.fillStyle = e.boss ? '#e74c3c' : '#e67e22';
      ctx.fillRect(e.px / 40 * scx - 1.5, e.py / 40 * scy - 1.5, 3, 3);
    });

    // Metins
    this.world.metins.forEach(m => {
      if (!m.alive) return;
      ctx.fillStyle = m.color;
      ctx.fillRect(m.px / 40 * scx - 2, m.py / 40 * scy - 2, 4, 4);
    });

    // Portals
    if (map.portals) map.portals.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x * scx, p.y * scy, 3, 0, Math.PI * 2); ctx.fill();
    });

    // Player
    const px = this.world.player.px / 40 * scx;
    const py = this.world.player.py / 40 * scy;
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();

    // Border
    ctx.strokeStyle = '#34495e'; ctx.lineWidth = 1; ctx.strokeRect(0, 0, W, H);
  }

  renderInventory() {
    if (!this.invPanel) return;
    const p = this.world.player;
    const eq = p.equipment;
    let html = '<div class="panel-title">🎒 Envanter</div>';

    // Equipment slots
    html += '<div class="eq-slots">';
    ['weapon', 'armor', 'ring'].forEach(slot => {
      const item = eq[slot] ? GAME_DATA.items[eq[slot]] : null;
      html += `<div class="eq-slot" data-slot="${slot}" title="${slot}">
        ${item ? `${item.icon}<br><span>${item.name}</span>` : `<span class="empty">${slot}</span>`}
      </div>`;
    });
    html += '</div><div class="inv-grid">';

    // Inventory items
    p.inventory.forEach((slot, idx) => {
      const item = GAME_DATA.items[slot.itemId];
      if (!item) return;
      html += `<div class="inv-item" onclick="game.useItem('${slot.itemId}')" title="${item.name}">
        <div class="item-icon">${item.icon}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-qty">${slot.qty > 1 ? 'x' + slot.qty : ''}</div>
      </div>`;
    });
    html += '</div>';
    this.invPanel.innerHTML = html;
  }

  renderStats() {
    if (!this.statsPanel) return;
    const p = this.world.player;
    this.statsPanel.innerHTML = `
      <div class="panel-title">📊 Karakter</div>
      <div class="stat-row"><span>Sınıf</span><span>${p.className}</span></div>
      <div class="stat-row"><span>Seviye</span><span>${p.level}</span></div>
      <div class="stat-row"><span>HP</span><span>${p.hp}/${p.maxHp}</span></div>
      <div class="stat-row"><span>MP</span><span>${p.mp}/${p.maxMp}</span></div>
      <div class="stat-row"><span>Saldırı</span><span>${p.atk}</span></div>
      <div class="stat-row"><span>Savunma</span><span>${p.def}</span></div>
      <div class="stat-row"><span>Hız</span><span>${p.spd.toFixed(1)}</span></div>
      <div class="stat-row"><span>Yang</span><span>${p.yang.toLocaleString()}</span></div>
      <div class="stat-row"><span>Toplam Kill</span><span>${p.totalKills}</span></div>
      <div class="stat-row"><span>Metin Kırık</span><span>${p.totalMetins}</span></div>
    `;
  }

  renderShop(npc) {
    if (!this.shopPanel) return;
    const isShop = npc.role === 'shop';
    const p = this.world.player;
    let html = `<div class="panel-title">${npc.icon} ${npc.name}</div>`;

    if (isShop) {
      html += '<div class="shop-grid">';
      const forSale = ['hp_potion_s', 'hp_potion_m', 'mp_potion_s', 'iron_sword', 'leather_armor'];
      forSale.forEach(id => {
        const item = GAME_DATA.items[id];
        html += `<div class="shop-item" onclick="game.buyItem('${id}')">
          <div class="item-icon">${item.icon}</div>
          <div class="item-name">${item.name}</div>
          <div class="item-price">${item.price} Yang</div>
        </div>`;
      });
      html += '</div>';
    } else if (npc.role === 'crafter') {
      html += '<div class="craft-list">';
      Object.entries(GAME_DATA.items).filter(([, v]) => v.recipe).forEach(([id, item]) => {
        const canCraft = Object.entries(item.recipe).every(([mat, qty]) => {
          const inv = p.inventory.find(i => i.itemId === mat);
          return inv && inv.qty >= qty;
        });
        const reqText = Object.entries(item.recipe).map(([mat, qty]) => `${GAME_DATA.items[mat]?.name} x${qty}`).join(', ');
        html += `<div class="craft-item ${canCraft ? '' : 'cant-craft'}" onclick="${canCraft ? `game.craftItem('${id}')` : ''}">
          <div class="item-icon">${item.icon}</div>
          <div>
            <div class="item-name">${item.name}</div>
            <div class="craft-req">${reqText}</div>
          </div>
        </div>`;
      });
      html += '</div>';
    }

    html += '<button class="close-btn" onclick="game.closeNpc()">Kapat</button>';
    this.shopPanel.innerHTML = html;
  }
}
