// ============================================================
// METIN2D - Game Data  (v3 - full skills)
// ============================================================

const GAME_DATA = {

  // ── CHARACTER CLASSES ────────────────────────────────────
  classes: {
    warrior: {
      name: 'Savaşçı', desc: 'Güçlü yakın dövüşçü.', color: '#c0392b', icon: '⚔',
      stats: { hp: 160, mp: 40, atk: 18, def: 14, spd: 2.0 },
      statGrowth: { hp: 28, mp: 4, atk: 4, def: 3 },
      primaryStat: 'STR',
      skills: ['sword_spin','berserk','aura','three_way_cut','bash','dash']
    },
    ninja: {
      name: 'Ninja', desc: 'Hızlı ve ölümcül.', color: '#8e44ad', icon: '🗡',
      stats: { hp: 100, mp: 65, atk: 24, def: 7, spd: 2.9 },
      statGrowth: { hp: 14, mp: 8, atk: 5, def: 2 },
      primaryStat: 'DEX',
      skills: ['ambush','poison_blade','stealth','rolling_dagger','fast_attack','feather_walk']
    },
    sura: {
      name: 'Sura', desc: 'Büyü ve kılıç ustası.', color: '#e67e22', icon: '🔥',
      stats: { hp: 115, mp: 95, atk: 21, def: 9, spd: 2.2 },
      statGrowth: { hp: 20, mp: 13, atk: 4, def: 2 },
      primaryStat: 'INT',
      skills: ['dark_orb','flame_strike','dark_protection','flame_spirit','spirit_strike','dragon_swirl']
    },
    shaman: {
      name: 'Şaman', desc: 'Destek ve büyü sınıfı.', color: '#27ae60', icon: '⚡',
      stats: { hp: 90, mp: 130, atk: 14, def: 9, spd: 2.1 },
      statGrowth: { hp: 12, mp: 16, atk: 3, def: 2 },
      primaryStat: 'INT',
      skills: ['lightning_throw','cure','swift','lightning_claw','summon_lightning','healing_rain']
    }
  },

  // ── SKILLS (full set) ────────────────────────────────────
  skills: {
    // ── WARRIOR
    sword_spin:   { name:'Kılıç Girdabı',   mp:12, cd:80,  dmgMult:1.8, range:85,  type:'aoe',        color:'#e74c3c', desc:'Çevreye dönerek tüm düşmanlara hasar ver',    key:'1' },
    berserk:      { name:'Çılgınlık',        mp:22, cd:180, dmgMult:2.5, range:55,  type:'buff',       color:'#c0392b', desc:'3 sn ATK %50 artar, hasar al',                key:'2' },
    aura:         { name:'Kılıç Aurası',     mp:16, cd:240, dmgMult:0,   range:0,   type:'buff',       color:'#f39c12', desc:'10 sn DEF +10, HP regen',                      key:'3' },
    three_way_cut:{ name:'Üçlü Kesi',        mp:18, cd:110, dmgMult:2.2, range:70,  type:'aoe',        color:'#e74c3c', desc:'Önündeki 3 düşmana güçlü darbe',              key:'4' },
    bash:         { name:'Sersemlet',        mp:10, cd:130, dmgMult:1.6, range:50,  type:'single',     color:'#c0392b', desc:'Tek hedefe sersemletme darbesi',              key:'5' },
    dash:         { name:'Atılım',           mp:8,  cd:160, dmgMult:1.4, range:120, type:'dash',       color:'#e67e22', desc:'Hızla düşmana atıl ve vur',                  key:'6' },

    // ── NINJA
    ambush:       { name:'Pusu',             mp:10, cd:70,  dmgMult:2.4, range:60,  type:'single',     color:'#9b59b6', desc:'Yüksek kritik pusu saldırısı',               key:'1' },
    poison_blade: { name:'Zehir Bıçağı',     mp:14, cd:120, dmgMult:1.4, range:55,  type:'dot',        color:'#27ae60', desc:'5 sn zehir uygular',                         key:'2' },
    stealth:      { name:'Gizlilik',         mp:25, cd:300, dmgMult:0,   range:0,   type:'buff',       color:'#8e44ad', desc:'3 sn görünmez, çıkışta kritik',              key:'3' },
    rolling_dagger:{ name:'Yuvarlan Bıçak',  mp:12, cd:100, dmgMult:1.9, range:90,  type:'aoe',        color:'#9b59b6', desc:'Yuvarlanarak çevreye bıçak atar',            key:'4' },
    fast_attack:  { name:'Hızlı Saldırı',    mp:8,  cd:55,  dmgMult:1.3, range:50,  type:'single',     color:'#8e44ad', desc:'Çok hızlı 3 ardışık darbe',                 key:'5' },
    feather_walk: { name:'Tüy Adımı',        mp:15, cd:200, dmgMult:0,   range:0,   type:'buff',       color:'#3498db', desc:'8 sn hız +80%, kaçınma +20%',               key:'6' },

    // ── SURA
    dark_orb:     { name:'Karanlık Küre',    mp:18, cd:90,  dmgMult:2.1, range:180, type:'projectile', color:'#2c3e50', desc:'Güçlü büyü mermisi fırlat',                 key:'1' },
    flame_strike: { name:'Alev Vuruşu',      mp:24, cd:140, dmgMult:2.5, range:110, type:'aoe',        color:'#e67e22', desc:'Alan ateş patlaması',                        key:'2' },
    dark_protection:{name:'Karanlık Kalkan', mp:18, cd:220, dmgMult:0,   range:0,   type:'buff',       color:'#1a252f', desc:'8 sn DEF +14, hasar yutma',                 key:'3' },
    flame_spirit: { name:'Ateş Ruhu',        mp:20, cd:160, dmgMult:1.7, range:140, type:'aoe',        color:'#e74c3c', desc:'Ateş ruhu çağır, alan hasar',               key:'4' },
    spirit_strike:{ name:'Ruh Darbesi',      mp:15, cd:95,  dmgMult:2.0, range:130, type:'projectile', color:'#8e44ad', desc:'Ruhsal güç mermisi',                        key:'5' },
    dragon_swirl: { name:'Ejder Girdabı',    mp:30, cd:280, dmgMult:3.2, range:130, type:'aoe',        color:'#c0392b', desc:'En güçlü saldırı — büyük AoE',             key:'6' },

    // ── SHAMAN
    lightning_throw:{ name:'Şimşek Atışı',  mp:15, cd:75,  dmgMult:2.0, range:200, type:'projectile', color:'#f1c40f', desc:'Hızlı şimşek mermisi',                      key:'1' },
    cure:         { name:'Tedavi',           mp:22, cd:150, dmgMult:0,   range:0,   type:'heal',       color:'#2ecc71', desc:'HP %35 iyileştirir',                         key:'2' },
    swift:        { name:'Çeviklik',         mp:14, cd:180, dmgMult:0,   range:0,   type:'buff',       color:'#3498db', desc:'5 sn hız +60%',                              key:'3' },
    lightning_claw:{ name:'Şimşek Pençesi', mp:20, cd:120, dmgMult:2.2, range:100, type:'aoe',        color:'#f39c12', desc:'Elektrik yüklü pençe darbesi',               key:'4' },
    summon_lightning:{name:'Şimşek Çağır',  mp:28, cd:200, dmgMult:2.8, range:160, type:'aoe',        color:'#f1c40f', desc:'Gökten şimşek çağır',                       key:'5' },
    healing_rain: { name:'İyileştirme Yağmuru',mp:35,cd:400,dmgMult:0,  range:0,   type:'heal_big',   color:'#2ecc71', desc:'HP %70 iyileştirir + 5 sn regen',           key:'6' }
  },

  // ── MONSTERS ────────────────────────────────────────────
  monsters: {
    wolf:        { name:'Kurt',           level:3,  hp:45,   atk:8,  def:2,  xp:12,  yang:8,   size:14, color:'#7f8c8d', respawn:8000  },
    orc:         { name:'Ork',            level:6,  hp:80,   atk:14, def:4,  xp:22,  yang:18,  size:16, color:'#27ae60', respawn:10000 },
    skeleton:    { name:'İskelet',        level:10, hp:120,  atk:20, def:6,  xp:35,  yang:28,  size:15, color:'#bdc3c7', respawn:12000 },
    soldier:     { name:'Şeytan Asker',   level:14, hp:160,  atk:26, def:9,  xp:50,  yang:40,  size:17, color:'#e74c3c', respawn:14000 },
    stone_guard: { name:'Taş Bekçi',      level:8,  hp:100,  atk:18, def:7,  xp:15,  yang:12,  size:15, color:'#95a5a6', respawn:6000  },
    fire_guard:  { name:'Ateş Bekçi',     level:15, hp:180,  atk:30, def:12, xp:28,  yang:22,  size:16, color:'#e67e22', respawn:6000  },
    dark_guard:  { name:'Karanlık Bekçi', level:20, hp:240,  atk:38, def:15, xp:42,  yang:35,  size:17, color:'#2c3e50', respawn:6000  },
    spider:      { name:'Örümcek',        level:2,  hp:30,   atk:6,  def:1,  xp:8,   yang:5,   size:12, color:'#8e44ad', respawn:7000,  drop:'silk'  },
    stone_golem: { name:'Taş Golem',      level:8,  hp:90,   atk:12, def:8,  xp:18,  yang:15,  size:18, color:'#7f8c8d', respawn:15000, drop:'stone' },
    boss_serpent:{ name:'Kral Yılan',     level:20, hp:800,  atk:45, def:20, xp:300, yang:500, size:24, color:'#27ae60', respawn:120000, boss:true },
    boss_demon:  { name:'Şeytan Lordu',   level:35, hp:2000, atk:80, def:35, xp:800, yang:1500,size:28, color:'#c0392b', respawn:300000, boss:true }
  },

  // ── METIN STONES ─────────────────────────────────────────
  metinStones: [
    { id:'mt1', name:'İhanet Metini',  level:5,  hp:300,  xp:80,  yang:120,  color:'#8b4513', minLevelReq:1,  guardType:'stone_guard', guardCount:3 },
    { id:'mt2', name:'Gurur Metini',   level:10, hp:600,  xp:150, yang:250,  color:'#a04000', minLevelReq:5,  guardType:'stone_guard', guardCount:4 },
    { id:'mt3', name:'Ateş Metini',    level:18, hp:1000, xp:280, yang:450,  color:'#e67e22', minLevelReq:12, guardType:'fire_guard',  guardCount:5 },
    { id:'mt4', name:'Karanlık Metin', level:25, hp:1500, xp:450, yang:700,  color:'#2c3e50', minLevelReq:18, guardType:'dark_guard',  guardCount:5 },
    { id:'mt5', name:'Lanet Metini',   level:35, hp:2500, xp:800, yang:1200, color:'#c0392b', minLevelReq:28, guardType:'dark_guard',  guardCount:6 }
  ],

  // ── ITEMS ────────────────────────────────────────────────
  items: {
    hp_potion_s:   { name:'Küçük Şifa İksiri',  type:'potion',    effect:'hp', value:50,  color:'#e74c3c', icon:'🧪', price:50   },
    hp_potion_m:   { name:'Şifa İksiri',         type:'potion',    effect:'hp', value:150, color:'#e74c3c', icon:'🧪', price:150  },
    hp_potion_l:   { name:'Büyük Şifa İksiri',   type:'potion',    effect:'hp', value:400, color:'#c0392b', icon:'🧪', price:400  },
    mp_potion_s:   { name:'Küçük Mana İksiri',   type:'potion',    effect:'mp', value:30,  color:'#3498db', icon:'🧪', price:40   },
    mp_potion_m:   { name:'Mana İksiri',          type:'potion',    effect:'mp', value:80,  color:'#2980b9', icon:'🧪', price:120  },
    iron_sword:    { name:'Demir Kılıç',          type:'weapon',    slot:'weapon', atk:8,            color:'#bdc3c7', icon:'⚔', price:200  },
    steel_sword:   { name:'Çelik Kılıç',          type:'weapon',    slot:'weapon', atk:18,           color:'#7f8c8d', icon:'⚔', price:800  },
    magic_blade:   { name:'Büyülü Bıçak',         type:'weapon',    slot:'weapon', atk:32,           color:'#9b59b6', icon:'⚔', price:3000 },
    leather_armor: { name:'Deri Zırh',            type:'armor',     slot:'armor',  def:6,  hp:20,    color:'#e67e22', icon:'🛡', price:300  },
    iron_armor:    { name:'Demir Zırh',           type:'armor',     slot:'armor',  def:14, hp:50,    color:'#95a5a6', icon:'🛡', price:1200 },
    plate_armor:   { name:'Plaka Zırh',           type:'armor',     slot:'armor',  def:24, hp:100,   color:'#7f8c8d', icon:'🛡', price:4000 },
    silk:          { name:'İpek',                 type:'material',                          color:'#f8c8d4', icon:'🧵', price:30   },
    stone:         { name:'Taş Parçası',          type:'material',                          color:'#95a5a6', icon:'🪨', price:25   },
    metin_shard:   { name:'Metin Kırığı',         type:'material',                          color:'#e67e22', icon:'💎', price:200  },
    enchanted_ring:{ name:'Büyülü Yüzük',         type:'accessory', slot:'ring', atk:6, def:6, color:'#f39c12', icon:'💍', price:2000,
                     recipe:{ silk:3, metin_shard:2 } }
  },

  // ── MAPS ─────────────────────────────────────────────────
  maps: {
    town: {
      id:'town', name:'Köy', bgColor:'#2d5a27', width:30, height:22,
      portals:[
        { x:14, y:2,  toMap:'exp_map',   label:'EXP Haritası',   color:'#3498db' },
        { x:4,  y:11, toMap:'metin_map', label:'Metin Haritası', color:'#e74c3c' },
        { x:24, y:11, toMap:'craft_map', label:'Üretim Haritası',color:'#27ae60' }
      ],
      npcs:[
        { x:14, y:11, name:'Demirci',       role:'blacksmith', icon:'🔨' },
        { x:8,  y:11, name:'Tüccar',        role:'shop',       icon:'🛒' },
        { x:20, y:11, name:'Savaş Ustası',  role:'trainer',    icon:'📜' }
      ]
    },
    exp_map: {
      id:'exp_map', name:'Ejderha Vadisi', bgColor:'#1a3a18', width:40, height:30,
      portals:[{ x:2, y:15, toMap:'town', label:'Köye Dön', color:'#95a5a6' }],
      monsters:[
        {type:'wolf',     x:8,  y:6 }, {type:'wolf',     x:12, y:8 },
        {type:'wolf',     x:20, y:5 }, {type:'wolf',     x:25, y:10},
        {type:'orc',      x:15, y:12}, {type:'orc',      x:22, y:18},
        {type:'orc',      x:30, y:8 }, {type:'orc',      x:35, y:15},
        {type:'skeleton', x:10, y:20}, {type:'skeleton', x:18, y:22},
        {type:'skeleton', x:28, y:22}, {type:'soldier',  x:34, y:25},
        {type:'soldier',  x:38, y:10}, {type:'boss_serpent', x:20, y:26}
      ]
    },
    metin_map: {
      id:'metin_map', name:'Metin Çölü', bgColor:'#3d2b1f', width:40, height:30,
      portals:[{ x:2, y:15, toMap:'town', label:'Köye Dön', color:'#95a5a6' }],
      metins:[
        {stoneId:'mt1', x:10, y:8 }, {stoneId:'mt2', x:30, y:6 },
        {stoneId:'mt3', x:8,  y:22}, {stoneId:'mt4', x:32, y:22},
        {stoneId:'mt5', x:20, y:14}
      ]
    },
    craft_map: {
      id:'craft_map', name:'Orman Toprakları', bgColor:'#1a3a0f', width:35, height:28,
      portals:[{ x:2, y:14, toMap:'town', label:'Köye Dön', color:'#95a5a6' }],
      monsters:[
        {type:'spider',     x:8,  y:6 }, {type:'spider',     x:14, y:10},
        {type:'spider',     x:20, y:8 }, {type:'spider',     x:26, y:12},
        {type:'stone_golem',x:10, y:18}, {type:'stone_golem',x:22, y:20},
        {type:'stone_golem',x:30, y:16}
      ],
      resources:[
        { x:12, y:5,  name:'Ot',    role:'gather', icon:'🌿' },
        { x:28, y:8,  name:'Ot',    role:'gather', icon:'🌿' },
        { x:16, y:20, name:'Maden', role:'mine',   icon:'⛏'  },
        { x:30, y:22, name:'Maden', role:'mine',   icon:'⛏'  }
      ],
      npcs:[
        { x:17, y:14, name:'Üretici', role:'crafter', icon:'⚗' }
      ]
    }
  },

  // ── EXP TABLE (lvl 1-40) ─────────────────────────────────
  expTable: [
    0,100,220,380,600,900,1300,1800,2500,3400,
    4600,6100,8000,10400,13400,17000,21400,26800,33400,41200,
    50800,62400,76400,93200,113200,137000,165200,198400,237400,283000,
    336800,399800,473000,557800,656000,769000,899000,1049000,1221000,1419000
  ]
};
