(() => {
    "use strict";

    const VIEW_W = 1100, VIEW_H = 700;
    const WORLD_W = 3200, WORLD_H = 2000;
    const TOTAL_PAPERS = 8;
    const COMBAT_CAPTURE_TIME = 8;
    let ENEMY_RESPAWN_INTERVAL = 6;
    let MAX_ENEMIES = 12;
    const PACK_SPAWN_INTERVAL = 15;
    const MAX_PACKS = 8;
    const DOWNED_TIME = 15;

    const VISION_RANGE = 320;
    const VISION_ANGLE = 1.15;
    const PERIPHERAL_RANGE = 160;
    const PERIPHERAL_ANGLE = 2.0;
    const CLOSE_RANGE_360 = 55;

    const PLAYER_WALK_SPEED = 125;
    const PLAYER_RUN_SPEED = 220;
    const BOT_IDLE_SPEED = 40;
    const BOT_ALERT_SPEED = 130;
    const CAR_PATROL_SPEED = 70;
    const CAR_CHASE_SPEED = 230;
    const SMOKE_RADIUS = 220;
    const SMOKE_LIFE = 9;

    const SHADOW_DX = -0.55;
    const SHADOW_DY = 0.9;

    const MINE_TRIGGER_RADIUS = 32;
    const MINE_ARM_TIME = 1.0;
    const MINE_DAMAGE = 100;
    const MINE_EXPLOSION_RADIUS = 140;

    const EXTRACTION_RUSH_TIME = 48;
    const PRISON_GUARD_COUNT = 7;

    const MAX_INVESTIGATORS_PER_EVENT = 3;
    const NOISE_EVENT_COOLDOWN = 1500;
    const ENEMY_CALL_COOLDOWN = 3000;
    const STONE_NOISE_RADIUS = 300;
    const STUCK_THRESHOLD = 4.0;
    const BACKSTAB_TIME = 0.7;
    const BACKSTAB_RANGE = 55;
    const CORPSE_VISION_MULT = 1.35;
    const CORPSE_CONFIRM_RANGE = 100;
    const RUN_NOISE_RADIUS = 280;
    const FOOTSTEP_INTERVAL = 0.32;

    const TREE_BURN_TIME = 20;
    const TREE_EXTINGUISH_RADIUS = 400;
    const MAX_TREE_EXTINGUISHERS = 8;
    const NAIL_TRIGGER_RADIUS = 22;
    const RC_CAR_HP = 60;
    const RC_CAR_MAX_CHASERS = 5;
    const RC_SIGNAL_FULL = 400;
    const RC_SIGNAL_LOST = 800;
    const RC_SIGNAL_GRACE = 2.5;
    const RC_ZOOM = 1.45;

    const CABIN = {
        x: 2000, y: 380, w: 180, h: 140,
        doorY1: 395, doorY2: 505,
    };
    const EAT_SPOT = { x: 2085, y: 450 };
    const CABIN_GUARD_POS = { x: 1965, y: 505 };

    const VIP_CORPSE_DISCOVER_DELAY = 10;
    const VIP_CORPSE_NOTICE_RANGE = 80;
    const CABIN_CHECK_PATROL_TIME = 10;

    const LIGHTER_TREE_RANGE = 55;

    const VIP_PATH = [
        { x: 1625, y: 550 },
        { x: 1625, y: 605 },
        { x: 1720, y: 620 },
        { x: 1850, y: 620 },
        { x: 1950, y: 560 },
        { x: 1970, y: 450 },
        { x: 2020, y: 450 },
        { x: EAT_SPOT.x, y: EAT_SPOT.y },
    ];

    const ITEM_ORDER = ["pistol", "frag", "smoke", "ham", "choripan", "roastbeef", "parrillada", "mine", "lighter", "nails", "rc_car"];
    const ITEM_DISPLAY = {
        pistol: { key: "1", name: "PISTOLA", color: "#fbbf24" },
        frag: { key: "2", name: "GRANADA FRAG", color: "#22c55e" },
        smoke: { key: "3", name: "GRANADA HUMO", color: "#94a3b8" },
        ham: { key: "4", name: "JAMÓN", color: "#fbbf24" },
        choripan: { key: "5", name: "CHORIPÁN", color: "#c2410c" },
        roastbeef: { key: "6", name: "ROAST BEEF", color: "#7f1d1d" },
        parrillada: { key: "7", name: "PARRILLADA", color: "#dc2626" },
        mine: { key: "8", name: "MINA CLAYMORE", color: "#dc2626" },
        lighter: { key: "9", name: "ENCENDEDOR+NAFTA", color: "#f97316" },
        nails: { key: "0", name: "CLAVOS OXIDADOS", color: "#78716c" },
        rc_car: { key: "P", name: "AUTO RC", color: "#8b5cf6" },
    };

    const INVENTORY_SLOT_ORDER = ["knife", "stone", "pistol", "frag", "smoke", "ham", "choripan", "roastbeef", "parrillada", "mine", "lighter", "nails", "rc_car"];
    const INVENTORY_PER_PAGE = 4;

    const FALLBACK_CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #05080e;
      font-family: "Segoe UI", system-ui, sans-serif; color: #e6edf3;
      overflow: hidden; display: grid; place-items: center; }
    .game-wrap { position: relative; width: min(1100px, 96vw, 92vh * 1100 / 700);
      aspect-ratio: 1100 / 700; border-radius: 12px; overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,.9), 0 0 0 1px rgba(34,211,238,.15);
      user-select: none; }
    canvas { display: block; width: 100%; height: 100%; }
    .hud { position: absolute; inset: 0; pointer-events: none;
      font-family: "Segoe UI", system-ui, sans-serif;
      text-shadow: 0 1px 3px rgba(0,0,0,0.9); color: #fff; }
    .hud-top { position: absolute; top: 12px; left: 16px; right: 16px;
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 16px; background: rgba(0,0,0,0.55);
      border-top: 2px solid #22d3ee; border-bottom: 1px solid rgba(255,255,255,0.08);
      font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; gap: 10px; }
    .hud-player { color: #fff; }
    .hud-player .badge { display: inline-block; padding: 2px 8px;
      background: #22d3ee; color: #000; margin-right: 8px;
      font-size: 10px; border-radius: 2px; }
    .hud-objective { color: #22d3ee; font-size: 11px; }
    .hud-money { color: #fbbf24; font-family: monospace; font-size: 15px; font-weight: 900; }
    .hud-timer { color: #22d3ee; font-family: monospace; font-size: 15px;
      font-weight: 900; letter-spacing: 0.1em; padding: 3px 10px;
      background: rgba(34,211,238,0.12); border: 1px solid rgba(34,211,238,0.4); border-radius: 3px; }
    .hud-timer.low { color: #ef4444; background: rgba(239,68,68,0.18);
      border-color: rgba(239,68,68,0.55); animation: nvgPulse 0.6s infinite; }
    @keyframes nvgPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    .hud-rush { position: absolute; top: 100px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.9); color: #ef4444; padding: 8px 22px;
      border: 2px solid #ef4444; border-radius: 4px; font-family: monospace;
      font-size: 22px; font-weight: 900; letter-spacing: 0.1em;
      text-shadow: 0 0 10px rgba(239,68,68,0.8); box-shadow: 0 0 30px rgba(239,68,68,0.5); }
    .hud-rush.hidden { display: none; }
    .hud-rush.urgent { animation: rushPulse 0.5s infinite; }
    @keyframes rushPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .hud-left { position: absolute; bottom: 20px; left: 20px;
      display: flex; align-items: flex-end; gap: 10px; }
    .health-bar { width: 10px; height: 110px; background: rgba(0,0,0,0.7);
      border: 1px solid rgba(255,255,255,0.15); position: relative; overflow: hidden; }
    .health-fill { position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(180deg, #22d3ee, #0891b2);
      transition: height 0.15s ease, background 0.3s ease; }
    .health-fill.low { background: linear-gradient(180deg, #ef4444, #991b1b); }
    .health-fill.medium { background: linear-gradient(180deg, #eab308, #a16207); }
    .health-block { display: flex; flex-direction: column; gap: 4px; }
    .health-num { font-size: 30px; font-weight: 900; font-family: monospace;
      color: #fff; line-height: 1; text-shadow: 0 0 8px rgba(34,211,238,0.4); }
    .health-label { font-size: 9px; letter-spacing: 0.2em; color: #8b98a8; font-weight: 700; }
    .hud-bottom-center { position: absolute; bottom: 20px; left: 50%;
      transform: translateX(-50%); display: flex; flex-direction: column;
      align-items: center; gap: 6px; min-width: 380px; }
    .weapon-line { display: none !important; }
    .gadgets { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
      padding: 8px 12px; background: rgba(0,0,0,0.55);
      border: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #cbd5e1;
      font-family: monospace; font-weight: 700; border-radius: 6px; max-width: 700px; }
    .gadgets .slot { padding: 3px 8px; border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.02); transition: all 0.15s ease;
      min-width: 54px; text-align: center; }
    .gadgets .slot.selected { background: rgba(34, 211, 238, 0.25);
      border-color: #22d3ee; color: #fff; box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
    .gadgets .slot.empty { opacity: 0.35; }
    .gadgets .slot.page-hidden { display: none; }
    .shop-hint { position: absolute; bottom: 130px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.85); color: #fbbf24; padding: 8px 22px;
      border-radius: 6px; border: 1px solid rgba(251, 191, 36, 0.4);
      font-size: 14px; font-weight: bold; letter-spacing: 0.1em;
      text-transform: uppercase; box-shadow: 0 0 20px rgba(251,191,36,0.3); }
    .shop-hint.hidden { display: none; }
    .hud-code { position: absolute; top: 55px; left: 16px; padding: 5px 10px;
      background: rgba(0,0,0,0.85); border: 2px solid #22c55e; color: #22c55e;
      font-family: monospace; font-size: 13px; font-weight: 900;
      letter-spacing: 0.12em; box-shadow: 0 0 20px rgba(34,197,94,0.4); }
    .hud-code.hidden { display: none; }
    .hud-help { position: absolute; top: 55px; right: 16px; width: 34px; height: 34px;
      display: grid; place-items: center; background: rgba(0,0,0,0.7);
      border: 1px solid #22d3ee; color: #22d3ee; border-radius: 50%;
      font-weight: 900; font-size: 17px; pointer-events: auto; cursor: pointer;
      user-select: none; transition: all 0.15s ease; }
    .hud-help:hover { background: #22d3ee; color: #000; }
    .shop-overlay { position: absolute; inset: 0; display: grid; place-items: center;
      background: rgba(0,0,0,0.9); backdrop-filter: blur(6px);
      z-index: 20; padding: 30px; pointer-events: auto; }
    .shop-overlay.hidden { display: none; }
    .shop-panel { width: min(560px, 100%); max-height: 100%; overflow-y: auto;
      background: rgba(10, 15, 20, 0.98); border: 2px solid #22d3ee; padding: 24px; }
    .shop-header { display: flex; justify-content: space-between;
      align-items: baseline; margin-bottom: 18px; padding-bottom: 12px;
      border-bottom: 1px solid rgba(34,211,238,0.3); }
    .shop-header h2 { font-size: 20px; letter-spacing: 0.15em;
      color: #22d3ee; font-weight: 800; }
    .shop-money { font-size: 13px; color: #8b98a8; font-family: monospace;
      text-transform: uppercase; letter-spacing: 0.1em; }
    .shop-money span { color: #fbbf24; font-weight: 900; font-size: 16px; }
    .shop-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .shop-item { display: grid; grid-template-columns: 44px 1fr auto auto;
      gap: 14px; align-items: center; padding: 12px 14px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      cursor: pointer; transition: all 0.15s ease; font-size: 13px; }
    .shop-item:hover { background: rgba(34,211,238,0.1);
      border-color: #22d3ee; transform: translateX(3px); }
    .shop-item.disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
    .item-icon { font-size: 26px; text-align: center; }
    .item-name { font-weight: 600; color: #e6edf3; }
    .item-desc { font-size: 10px; color: #8b98a8; letter-spacing: 0.06em; margin-top: 2px; }
    .item-price { color: #fbbf24; font-family: monospace; font-weight: 800;
      text-align: right; font-size: 14px; }
    .item-stock { color: #8b98a8; font-size: 11px; text-align: center;
      font-family: monospace; padding: 2px 6px; background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.1); min-width: 32px; }
    .shop-close { width: 100%; padding: 14px; background: rgba(34,211,238,0.15);
      border: 1px solid #22d3ee; color: #22d3ee; font: inherit; font-weight: 800;
      letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px;
      cursor: pointer; transition: all 0.15s ease; }
    .shop-close:hover { background: #22d3ee; color: #000; }
    .help-overlay { position: absolute; inset: 0; display: grid; place-items: center;
      background: rgba(0,0,0,0.92); backdrop-filter: blur(6px);
      z-index: 25; padding: 30px; pointer-events: auto; }
    .help-overlay.hidden { display: none; }
    .help-panel { width: min(480px, 100%); background: rgba(10,15,20,0.98);
      border: 2px solid #22d3ee; padding: 24px; }
    .help-panel h2 { font-size: 20px; letter-spacing: 0.15em; color: #22d3ee;
      font-weight: 800; margin-bottom: 18px; text-align: center; }
    .help-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      margin-bottom: 20px; font-size: 13px; color: #cbd5e1; }
    .help-grid strong { color: #22d3ee; font-family: monospace; }
    .overlay { position: absolute; inset: 0; display: grid; place-items: center;
      padding: 24px; text-align: center; background: rgba(5,8,12,0.92);
      backdrop-filter: blur(6px); z-index: 10; }
    .overlay.hidden { display: none; }
    .panel h1 { font-size: 32px; margin-bottom: 14px; line-height: 1.2; }
    .panel p { font-size: 14px; line-height: 1.8; color: #9aa8b8; margin-bottom: 24px; }
    .panel p strong { color: #22d3ee; }
    .panel button { font: inherit; font-weight: 800; letter-spacing: 0.1em;
      text-transform: uppercase; font-size: 13px; padding: 14px 40px;
      border: 0; border-radius: 4px; cursor: pointer; color: #04141a;
      background: linear-gradient(180deg, #5ee7f7, #22d3ee);
      box-shadow: 0 8px 24px rgba(34,211,238,0.3); transition: all 0.15s ease; }
    .panel button:hover { transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(34,211,238,0.5); }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      text-align: left; margin: 18px 0 24px; font-size: 13px; color: #cbd5e1; }
    .stats-grid .lbl { color: #8b98a8; }
    .stats-grid .val { color: #22d3ee; font-weight: 900; font-family: monospace; text-align: right; }
    body.pro-mode .hud { display: none !important; }
    body.pro-mode .shop-overlay { display: none !important; }
    body.pro-mode .help-overlay { display: none !important; }
  `;

    const SoundFX = {
        ctx: null, musicPlaying: false, musicTimeout: null, musicGain: null,
        currentMusicVolume: 0.5, currentLoop: null,
        _musicNodes: [],
        _snareBuffer: null,

        init() {
            if (!this.ctx) {
                const w = /** @type {any} */ (window);
                const AC = w.AudioContext || w.webkitAudioContext;
                if (AC) this.ctx = new AC();
            }
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        },

        _ensureMusicGain() {
            if (!this.musicGain && this.ctx) {
                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.value = this.currentMusicVolume;
                this.musicGain.connect(this.ctx.destination);
            }
        },

        _getSnareBuffer() {
            if (this._snareBuffer) return this._snareBuffer;
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
            }
            this._snareBuffer = buffer;
            return buffer;
        },

        _registerMusicNode(node) {
            this._musicNodes.push(node);
            node.onended = () => {
                const i = this._musicNodes.indexOf(node);
                if (i >= 0) this._musicNodes.splice(i, 1);
            };
        },

        _stopAllMusicNodes(graceTime = 0) {
            if (!this.ctx) return;
            const t = this.ctx.currentTime + graceTime;
            const nodes = this._musicNodes;
            this._musicNodes = [];
            for (const node of nodes) {
                try { node.stop(t); } catch (e) { }
            }
        },

        _startNewMusic(newVolume, loopName) {
            this.init();
            if (!this.ctx) return;
            this.musicPlaying = false;
            if (this.musicTimeout) { clearTimeout(this.musicTimeout); this.musicTimeout = null; }
            this._stopAllMusicNodes(0.15);
            const oldGain = this.musicGain;
            this.musicGain = null;
            if (oldGain) {
                try {
                    oldGain.gain.cancelScheduledValues(this.ctx.currentTime);
                    oldGain.gain.setValueAtTime(oldGain.gain.value, this.ctx.currentTime);
                    oldGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
                } catch (e) { }
                setTimeout(() => { try { oldGain.disconnect(); } catch (e) { } }, 200);
            }
            this._ensureMusicGain();
            this.musicGain.gain.value = newVolume;
            this.currentMusicVolume = newVolume;
            this.musicPlaying = true;
            this.currentLoop = loopName;
        },

        _scheduleTone(when, freq, type, duration, vol, slideFreq = null, dest = null) {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, when);
            if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, when + duration);
            gain.gain.setValueAtTime(0, when);
            gain.gain.linearRampToValueAtTime(vol, when + Math.min(0.05, duration * 0.1));
            gain.gain.setValueAtTime(vol, when + duration * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
            osc.connect(gain);
            gain.connect(dest || this.ctx.destination);
            osc.start(when);
            osc.stop(when + duration + 0.05);
            if (dest) this._registerMusicNode(osc);
        },

        _scheduleKick(when, vol, dest = null) {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, when);
            osc.frequency.exponentialRampToValueAtTime(40, when + 0.12);
            gain.gain.setValueAtTime(vol, when);
            gain.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
            osc.connect(gain);
            gain.connect(dest || this.ctx.destination);
            osc.start(when);
            osc.stop(when + 0.25);
            if (dest) this._registerMusicNode(osc);
        },

        _scheduleSnare(when, vol, dest = null) {
            if (!this.ctx) return;
            const src = this.ctx.createBufferSource();
            src.buffer = this._getSnareBuffer();
            const gain = this.ctx.createGain();
            gain.gain.value = vol;
            src.connect(gain);
            gain.connect(dest || this.ctx.destination);
            src.start(when);
            if (dest) this._registerMusicNode(src);
        },

        _schedulePiano(when, freq, duration, vol, dest = null) {
            if (!this.ctx) return;
            const d = dest || this.ctx.destination;
            const osc1 = this.ctx.createOscillator();
            const g1 = this.ctx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(freq, when);
            g1.gain.setValueAtTime(0, when);
            g1.gain.linearRampToValueAtTime(vol, when + 0.03);
            g1.gain.exponentialRampToValueAtTime(vol * 0.35, when + duration * 0.4);
            g1.gain.exponentialRampToValueAtTime(0.001, when + duration);
            osc1.connect(g1); g1.connect(d);
            osc1.start(when); osc1.stop(when + duration + 0.05);
            if (dest) this._registerMusicNode(osc1);
            const osc2 = this.ctx.createOscillator();
            const g2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 2, when);
            g2.gain.setValueAtTime(0, when);
            g2.gain.linearRampToValueAtTime(vol * 0.35, when + 0.04);
            g2.gain.exponentialRampToValueAtTime(0.001, when + duration * 0.6);
            osc2.connect(g2); g2.connect(d);
            osc2.start(when); osc2.stop(when + duration * 0.65);
            if (dest) this._registerMusicNode(osc2);
            const osc3 = this.ctx.createOscillator();
            const g3 = this.ctx.createGain();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(freq * 3, when);
            g3.gain.setValueAtTime(0, when);
            g3.gain.linearRampToValueAtTime(vol * 0.12, when + 0.05);
            g3.gain.exponentialRampToValueAtTime(0.001, when + duration * 0.3);
            osc3.connect(g3); g3.connect(d);
            osc3.start(when); osc3.stop(when + duration * 0.35);
            if (dest) this._registerMusicNode(osc3);
        },

        playTone(freq, type, duration, vol = 0.1, slideFreq = null) {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        },

        playNoise(duration, vol = 0.2) {
            if (!this.ctx) return;
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            noise.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        },

        shoot() { this.playTone(400, 'square', 0.1, 0.15, 50); this.playNoise(0.1, 0.1); },
        enemyShoot() { this.playTone(300, 'square', 0.1, 0.08, 40); },
        explosion() { this.playNoise(0.4, 0.4); this.playTone(100, 'sawtooth', 0.4, 0.3, 20); },
        slash() { this.playTone(800, 'sine', 0.1, 0.1, 300); },
        spark() { this.playTone(1500, 'square', 0.05, 0.1, 2000); this.playNoise(0.08, 0.08); },
        bark() { this.playTone(300, 'sawtooth', 0.1, 0.15, 150); setTimeout(() => this.playTone(350, 'sawtooth', 0.1, 0.15, 150), 120); },
        bite() { this.playNoise(0.1, 0.2); this.playTone(200, 'sawtooth', 0.1, 0.15, 100); },
        pickup() { this.playTone(600, 'sine', 0.1, 0.1, 900); },
        pickupPaper(index) {
            const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
            const freq = notes[Math.max(0, Math.min(index, notes.length - 1))];
            this.playTone(freq, 'sine', 0.12, 0.13);
            setTimeout(() => this.playTone(freq * 1.5, 'triangle', 0.1, 0.10), 85);
        },
        throwSound() { this.playNoise(0.15, 0.05); },
        placeMine() { this.playTone(1000, 'sine', 0.05, 0.1); setTimeout(() => this.playTone(1200, 'sine', 0.1, 0.1), 60); },
        lastBeepTime: 0,
        beepTimeout: null,
        beep() {
            const now = performance.now();
            if (now - this.lastBeepTime < 5000) return;
            this.lastBeepTime = now;
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(440.00, t);
            gain1.gain.setValueAtTime(0.05, t);
            gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(t);
            osc1.stop(t + 0.05);
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880.00, t + 0.06);
            gain2.gain.setValueAtTime(0.05, t + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(t + 0.06);
            osc2.stop(t + 0.18);
        },
        footstep() { this.playNoise(0.06, 0.04); this.playTone(90, 'sine', 0.04, 0.03); },
        fire() { this.playNoise(0.2, 0.08); this.playTone(180, 'sawtooth', 0.2, 0.06, 100); },
        rcGlitch() { this.playNoise(0.08, 0.06); this.playTone(1400, 'square', 0.03, 0.04); },
        codeDigit(index) {
            const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
            const freq = notes[Math.max(0, Math.min(index, notes.length - 1))];
            this.playTone(freq, 'sine', 0.10, 0.10);
            setTimeout(() => this.playTone(freq * 1.5, 'triangle', 0.06, 0.055), 55);
        },
        selectItem() { this.playTone(880, 'sine', 0.06, 0.08); },
        shopEnter() { this.playTone(500, 'sine', 0.1, 0.1, 750); },
        shopNavigate() { this.playTone(850, 'sine', 0.03, 0.05); },
        shopExit() { this.playTone(700, 'sine', 0.1, 0.1, 400); },
        lastEmergencyTime: 0,
        emergency() {
            const now = performance.now();
            if (now - this.lastEmergencyTime < 3000) return;
            this.lastEmergencyTime = now;
            this.playTone(220, 'sawtooth', 0.4, 0.2, 440);
            setTimeout(() => this.playTone(440, 'sawtooth', 0.4, 0.2, 220), 450);
            setTimeout(() => this.playTone(220, 'sawtooth', 0.4, 0.2, 440), 900);
        },
        sirenBeep() { },
        codeCorrect() {
            this.playTone(660, 'sine', 0.12, 0.15);
            setTimeout(() => this.playTone(880, 'sine', 0.12, 0.15), 120);
            setTimeout(() => this.playTone(1320, 'sine', 0.3, 0.15), 260);
        },
        codeWrong() { this.playTone(180, 'square', 0.3, 0.15, 120); },
        lastRadioCallTime: 0,
        radioCall() {
            const now = performance.now();
            if (now - this.lastRadioCallTime < 1500) return;
            this.lastRadioCallTime = now;
            this.playTone(880, 'square', 0.08, 0.1);
            setTimeout(() => this.playTone(1200, 'square', 0.08, 0.1), 100);
            setTimeout(() => this.playTone(880, 'square', 0.08, 0.1), 200);
        },
        keypadClick() { this.playTone(600, 'square', 0.04, 0.08, 800); },
        honk() {
            this.playTone(400, 'sawtooth', 0.12, 0.12);
            setTimeout(() => this.playTone(500, 'sawtooth', 0.15, 0.12), 60);
            setTimeout(() => this.playTone(400, 'sawtooth', 0.12, 0.12), 180);
        },

        startSuspenseMusic(volume = 0.55) {
            this._startNewMusic(volume, 'suspense');
            if (this.musicPlaying) this._playAveMariaLoop();
        },

        startChaseMusic(volume = 1.0) {
            this._startNewMusic(volume, 'chase');
            if (this.musicPlaying) this._playChaseLoop();
        },

        _playAveMariaLoop() {
            if (!this.musicPlaying || this.currentLoop !== 'suspense' || !this.ctx) return;
            const now = this.ctx.currentTime + 0.15;
            const dest = this.musicGain;
            const G1 = 49.00, D2 = 73.42, E2 = 82.41, Fs2 = 92.50, G2 = 98.00, A2 = 110.00, B2 = 123.47;
            const C3 = 130.81, Cs3 = 138.59, D3 = 146.83, E3 = 164.81, Fs3 = 185.00, G3 = 196.00, Gs3 = 207.65, A3 = 220.00, As3 = 233.08, B3 = 246.94;
            const C4 = 261.63, Cs4 = 277.18, D4 = 293.66, Ds4 = 311.13, E4 = 329.63, Fs4 = 369.99;
            const G4 = 392.00, Gs4 = 415.30, A4 = 440.00, As4 = 466.16, B4 = 493.88;
            const C5 = 523.25, Cs5 = 554.37, D5 = 587.33, Ds5 = 622.25;
            const BPM = 45;
            const beat = 60 / BPM;
            const melodyNote = (beatOffset, freq, beatsDuration, vol = 0.35) => {
                const t = beatOffset * beat;
                const dur = beatsDuration * beat;
                this._schedulePiano(now + t, freq, dur, vol, dest);
            };
            const bassNote = (beatOffset, freqLow, freqHigh, beatsDuration, vol = 0.22) => {
                const t = beatOffset * beat;
                const dur = beatsDuration * beat;
                this._schedulePiano(now + t, freqLow, dur, vol, dest);
                this._schedulePiano(now + t, freqHigh, dur, vol * 0.75, dest);
                this._scheduleTone(now + t, freqLow, 'sine', dur, vol * 0.6, null, dest);
            };
            const arpeggioPattern = (startBeat, beatsTotal, notes, vol = 0.05) => {
                const step = 1 / 6;
                const count = Math.round(beatsTotal / step);
                for (let i = 0; i < count; i++) {
                    const note = notes[i % notes.length];
                    const t = (startBeat + i * step) * beat;
                    this._schedulePiano(now + t, note, step * beat * 3.5, vol, dest);
                }
            };
            bassNote(0, G1, G2, 8, 0.24); arpeggioPattern(0, 8, [D3, G3, B3, D4, B3, G3]);
            bassNote(8, D2, D3, 8, 0.23); arpeggioPattern(8, 8, [D3, Fs3, A3, C4, A3, Fs3]);
            bassNote(16, E2, E3, 4, 0.23); arpeggioPattern(16, 4, [E3, G3, B3, E4, B3, G3]);
            bassNote(20, Fs2, Fs3, 4, 0.24); arpeggioPattern(20, 4, [Cs3, Fs3, As3, Cs4, As3, Fs3]);
            bassNote(24, B2, B3, 4, 0.23); arpeggioPattern(24, 4, [D3, Fs3, B3, D4, B3, Fs3]);
            bassNote(28, D2, D3, 4, 0.23); arpeggioPattern(28, 4, [C3, Fs3, A3, C4, A3, Fs3]);
            bassNote(32, G1, G2, 4, 0.24); arpeggioPattern(32, 4, [D3, G3, B3, D4, B3, G3]);
            bassNote(36, E2, E3, 4, 0.25); arpeggioPattern(36, 4, [D3, Gs3, B3, E4, B3, Gs3]);
            bassNote(40, A2, A3, 2, 0.24); arpeggioPattern(40, 2, [C3, E3, A3, C4, A3, E3]);
            bassNote(42, C3, C4, 4, 0.23); arpeggioPattern(42, 4, [C3, E3, G3, C4, G3, E3]);
            bassNote(46, A2, A3, 2, 0.23); arpeggioPattern(46, 2, [C3, E3, A3, C4, A3, E3]);
            bassNote(48, D2, D3, 8, 0.25); arpeggioPattern(48, 8, [D3, Fs3, A3, D4, A3, Fs3]);
            melodyNote(0.0, G4, 1.5); melodyNote(1.5, Fs4, 0.5); melodyNote(2.0, G4, 1.0);
            melodyNote(3.0, B4, 1.5); melodyNote(4.5, A4, 0.5); melodyNote(5.0, G4, 3.0);
            melodyNote(8.0, A4, 1.0); melodyNote(9.0, B4, 0.5); melodyNote(9.5, A4, 0.5);
            melodyNote(10.0, G4, 1.0); melodyNote(11.0, Fs4, 0.5); melodyNote(11.5, E4, 0.5);
            melodyNote(12.0, Fs4, 0.5); melodyNote(12.5, G4, 3.5);
            melodyNote(16.0, B4, 1.5); melodyNote(17.5, B4, 0.5); melodyNote(18.0, B4, 1.0);
            melodyNote(19.0, A4, 0.5); melodyNote(19.5, G4, 0.5); melodyNote(20.0, Fs4, 0.5);
            melodyNote(20.5, E4, 0.5); melodyNote(21.0, B4, 0.5); melodyNote(21.5, Cs5, 0.5);
            melodyNote(22.0, B4, 0.5); melodyNote(22.5, As4, 1.5);
            melodyNote(24.0, Fs4, 1.5); melodyNote(25.5, A4, 0.5); melodyNote(26.0, G4, 1.0);
            melodyNote(27.0, Fs4, 0.5); melodyNote(27.5, A4, 0.5); melodyNote(28.0, B4, 0.5);
            melodyNote(28.5, C5, 0.5); melodyNote(29.0, C5, 0.5); melodyNote(29.5, A4, 0.5);
            melodyNote(30.0, Fs4, 0.5); melodyNote(30.5, G4, 1.5);
            melodyNote(32.0, C5, 1.5); melodyNote(33.5, B4, 0.5); melodyNote(34.0, A4, 1.0);
            melodyNote(35.0, Fs4, 1.0); melodyNote(36.0, E4, 1.0); melodyNote(37.0, Gs4, 1.0);
            melodyNote(38.0, B4, 0.5); melodyNote(38.5, D5, 0.5); melodyNote(39.0, B4, 0.5);
            melodyNote(39.5, Gs4, 0.5); melodyNote(40.0, A4, 2.0);
            melodyNote(42.0, E4, 1.0); melodyNote(43.0, Fs4, 1.0); melodyNote(44.0, G4, 1.0);
            melodyNote(45.0, A4, 1.5); melodyNote(46.5, G4, 0.5); melodyNote(47.0, Fs4, 0.5);
            melodyNote(47.5, E4, 0.5); melodyNote(48.0, D4, 4.0);
            const TOTAL_BEATS = 56;
            this.musicTimeout = setTimeout(() => this._playAveMariaLoop(), TOTAL_BEATS * beat * 1000);
        },

        _playChaseLoop() {
            if (!this.musicPlaying || this.currentLoop !== 'chase' || !this.ctx) return;

            // 🛠️ FIX ANTI-LAG: Damos 150ms al navegador para agendar los nodos sin "trabarse"
            const now = this.ctx.currentTime + 0.15;
            const dest = this.musicGain;

            // 🏁 TEMPO PRO (128 BPM - Groove potente, hipnótico y estable)
            const bpm = 128;
            const beat = 60 / bpm;              // 0.46875s (Duración de una negra)
            const sixteenth = beat / 4;         // 0.1171875s (Duración de una semicorchea)
            const totalBars = 32;               // 32 compases = 128 beats = 60.0 segundos clavados

            // 🎵 NOTAS (Escala Mi Menor / E Minor - Tonalidad Cyberpunk/Acción)
            const E2 = 82.41, G2 = 98.00, C3 = 130.81, D3 = 146.83, E3 = 164.81;
            const D4 = 293.66, E4 = 329.63, FS4 = 369.99, G4 = 392.00, A4 = 440.00, B4 = 493.88;
            const C5 = 523.25, D5 = 587.33, E5 = 659.25, FS5 = 739.99, G5 = 783.99;

            // 🥁 1. BOMBO (KICK) Y CAJA (SNARE) DINÁMICOS
            for (let i = 0; i < totalBars * 4; i++) {
                const bar = Math.floor(i / 4);
                const isClimax = (bar >= 16 && bar < 24); // Compases 17 al 24 es EL PICO

                // Bombo 4/4 (Más fuerte en el clímax)
                this._scheduleKick(now + i * beat, isClimax ? 0.22 : 0.16, dest);

                // Caja en los contratiempos (beats 2 y 4)
                if (i % 2 === 1) {
                    this._scheduleSnare(now + i * beat, isClimax ? 0.1 : 0.08, dest);
                }

                // Redobles para subir la adrenalina antes del Pico (Compases 13 al 15)
                if (bar >= 13 && bar < 16) {
                    if (i % 2 === 0) this._scheduleSnare(now + i * beat + beat / 2, 0.06, dest);
                    if (bar === 15) { // Aceleración final
                        this._scheduleSnare(now + i * beat + beat * 0.75, 0.09, dest);
                    }
                }
            }

            // 🥁 2. HI-HATS OFF-BEAT (Estilo House, muy ligero para la CPU)
            for (let i = 0; i < totalBars * 8; i++) {
                if (i % 2 === 1) {
                    this._scheduleTone(now + i * (beat / 2), 6000, 'square', 0.04, 0.025, null, dest);
                }
            }

            // 🛠️ 3. MOTOR DE PATRONES (Evita crear nodos de silencio, eliminando el lag)
            const playPattern = (pattern, bar, waveform, duration, vol) => {
                const barStart = now + bar * 4 * beat;
                pattern.forEach((note, step) => {
                    if (note !== 0) {
                        this._scheduleTone(barStart + step * sixteenth, note, waveform, duration, vol, null, dest);
                    }
                });
            };

            // 🎸 4. LÍNEAS DE BAJO (Sincopadas y con silencios para dar Groove)
            const bassE = [E2, 0, 0, E2, 0, E2, 0, 0, E2, 0, E2, 0, 0, G2, 0, D3];
            const bassC = [C3, 0, 0, C3, 0, C3, 0, 0, C3, 0, C3, 0, 0, D3, 0, E3];

            for (let bar = 0; bar < totalBars; bar++) {
                if (bar === 31) continue; // El último compás se queda sin bajo para un corte dramático
                const bPattern = (Math.floor(bar / 2) % 2 === 0) ? bassE : bassC;
                // En el pico, el bajo es más largo y agresivo
                const bDur = (bar >= 16 && bar < 24) ? sixteenth * 1.8 : sixteenth * 1.2;
                playPattern(bPattern, bar, 'sawtooth', bDur, 0.075);
            }

            // 🎹 5. MELODÍAS EVOLUTIVAS (El alma de la pista)
            const leadTension = [E4, 0, 0, G4, 0, A4, 0, 0, B4, 0, 0, A4, 0, G4, 0, D4];
            const leadClimax1 = [E5, 0, B4, 0, D5, 0, A4, 0, E5, 0, B4, 0, G5, 0, FS5, D5];
            const leadClimax2 = [E5, 0, B4, 0, D5, 0, A4, 0, C5, 0, B4, 0, A4, 0, G4, FS4];

            for (let bar = 0; bar < totalBars; bar++) {
                // Fase 1 y 2: Intro y Build-up (Compases 4 al 15)
                if (bar >= 4 && bar < 16) {
                    if (bar % 2 === 0) playPattern(leadTension, bar, 'triangle', sixteenth * 1.5, 0.05);
                }

                // Fase 3: 🔥 EL PICO / DROP 🔥 (Compases 16 al 23)
                if (bar >= 16 && bar < 24) {
                    const cPattern = (bar % 2 === 0) ? leadClimax1 : leadClimax2;
                    // Capa 1: Sintetizador cuadrado cortante
                    playPattern(cPattern, bar, 'square', sixteenth * 0.8, 0.09);
                    // Capa 2: Diente de sierra denso para engordar el sonido (Doble capa Pro)
                    playPattern(cPattern, bar, 'sawtooth', sixteenth * 1.5, 0.06);
                }

                // Fase 4: Descenso (Compases 24 al 30) - Baja la adrenalina para preparar el Loop
                if (bar >= 24 && bar < 30) {
                    if (bar % 2 === 0) playPattern(leadTension, bar, 'triangle', sixteenth * 2, 0.04);
                }
            }

            // ⏱️ REINICIO PERFECTO A LOS 60 SEGUNDOS (60.000 ms)
            // El buffer inicial más el compás vacío al final aseguran que el puente sea invisible
            this.musicTimeout = setTimeout(() => this._playChaseLoop(), 60000);
        },

        stopMusic(silent = false) {
            this.musicPlaying = false;
            if (this.musicTimeout) { clearTimeout(this.musicTimeout); this.musicTimeout = null; }
            if (this.musicGain && this.ctx) {
                if (!silent) {
                    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
                    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
                    this.musicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
                } else {
                    this.musicGain.gain.value = 0;
                }
            }
            this._stopAllMusicNodes(silent ? 0 : 0.45);
            const oldGain = this.musicGain;
            this.musicGain = null;
            if (oldGain) {
                setTimeout(() => {
                    try { oldGain.disconnect(); } catch (e) { }
                }, silent ? 0 : 500);
            }
        },
    };
    function ensureDOM() {
        if (document.getElementById("game")) return;
        const style = document.createElement("style");
        style.textContent = FALLBACK_CSS;
        document.head.appendChild(style);
        const wrap = document.createElement("div");
        wrap.className = "game-wrap";
        wrap.innerHTML = `
      <canvas id="game" width="${VIEW_W}" height="${VIEW_H}"></canvas>
      <div class="hud">
        <div class="hud-top">
          <div class="hud-player"><span class="badge">PICHMAN</span>RESCATE DEL PICHON</div>
          <div class="hud-objective" id="objective">OBJETIVOS</div>
          <div class="hud-timer" id="missionTimer">10:00</div>
          <div class="hud-money">$ <span id="money">200</span></div>
        </div>
        <div class="hud-rush hidden" id="rushTimer">⏱️ 0:48</div>
        <div class="hud-code hidden" id="codeDisplay">CÓDIGO: · · · · · · · ·</div>
        <div class="hud-left">
          <div class="health-bar"><div class="health-fill" id="hpFill"></div></div>
          <div class="health-block">
            <div class="health-num" id="hp">100</div>
            <div class="health-label">VIDA</div>
          </div>
        </div>
        <div class="shop-hint hidden" id="shopHint">E — Entrar en la PichShop</div>
        <div class="hud-bottom-center">
          <div class="weapon-line" id="selectedItemLine">
            <span class="key" id="selKey">—</span>
            <span class="weapon-name" id="selName">SIN ARMA</span>
            <span class="ammo" id="selCount">—</span>
          </div>
          <div class="gadgets" id="gadgetsRow">
            <span class="slot" data-slot="knife" title="Cuchillo (F)">F 🔪</span>
            <span class="slot" data-slot="stone" title="Piedra (R)">R 🪨 <span id="stoneCount">10</span></span>
            <span class="slot" data-slot="pistol" title="Pistola (1)">1 🔫 <span id="pistolCount">—</span></span>
            <span class="slot" data-slot="frag" title="Granada Frag (2)">2 💣 <span id="fragCount">0</span></span>
            <span class="slot" data-slot="smoke" title="Granada Humo (3)">3 💨 <span id="smokeCount">0</span></span>
            <span class="slot" data-slot="ham" title="Jamón (4)">4 🍖 <span id="hamCount">0</span></span>
            <span class="slot" data-slot="choripan" title="Choripán (5)">5 🌭 <span id="choripanCount">0</span></span>
            <span class="slot" data-slot="roastbeef" title="Roast Beef (6)">6 🥩 <span id="roastbeefCount">0</span></span>
            <span class="slot" data-slot="parrillada" title="Parrillada (7)">7 🍢 <span id="parrilladaCount">0</span></span>
            <span class="slot" data-slot="mine" title="Mina (8)">8 💥 <span id="mineCount">0</span></span>
            <span class="slot" data-slot="lighter" title="Encendedor+Nafta (9)">9 🔥 <span id="lighterCount">0</span></span>
            <span class="slot" data-slot="nails" title="Clavos (0)">0 🔩 <span id="nailsCount">0</span></span>
            <span class="slot" data-slot="rc_car" title="Auto RC (P)">P 🚗 <span id="rcCarCount">0</span></span>
          </div>
        </div>
        <div class="hud-help" id="helpBtn" title="Ver controles">?</div>
      </div>
      <div class="shop-overlay hidden" id="shopOverlay">
        <div class="shop-panel">
          <div class="shop-header">
            <h2>ARMERÍA</h2>
            <div class="shop-money">FONDOS: <span id="shopMoney">$200</span></div>
          </div>
          <div class="shop-items" id="shopItems"></div>
          <button class="shop-close" id="shopClose">CERRAR [E]</button>
        </div>
      </div>
      <div class="help-overlay hidden" id="helpOverlay">
        <div class="help-panel">
          <h2>CONTROLES</h2>
          <div class="help-grid">
            <div><strong>WASD</strong> Caminar (sigiloso)</div>
            <div><strong>SHIFT</strong> Correr (hace ruido)</div>
            <div><strong>Mouse</strong> Apuntar</div>
            <div><strong>Click</strong> Usar ítem</div>
            <div><strong>Scroll</strong> Cambiar ítem</div>
            <div><strong>Espacio</strong> Patada</div>
            <div><strong>F</strong> Cuchillo</div>
            <div><strong>Q</strong> Arrastrar cuerpo</div>
            <div><strong>R</strong> Piedra</div>
            <div><strong>E</strong> Tienda / Interactuar</div>
            <div><strong>Backspace</strong> Borrar dígito</div>
          </div>
          <button class="shop-close" id="helpClose">CERRAR</button>
        </div>
      </div>
     <div class="overlay" id="overlay">
  <div class="panel">
    <h1 id="ovTitle">PichMan Series:<br><strong><em>El Rescate del Pichón</em></strong></h1>
    <p id="ovText">
      <strong>MISIÓN:</strong> Eliminá al Objetivo, recolectá los 8 documentos, tomá la bandera y rescatá al Pichón.<br><br>
      <strong>Tenés 10 minutos para completar la misión.</strong>
    </p>
    <button id="ovBtn">Iniciar Misión: Rescate del Pichón</button>
  </div>
</div>
    `;
        document.body.appendChild(wrap);
    }

    function boot() {
        const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("game"));
        const ctx = canvas.getContext("2d");
        const hpEl = document.getElementById("hp");
        const hpFillEl = document.getElementById("hpFill");
        const moneyEl = document.getElementById("money");
        const shopMoneyEl = document.getElementById("shopMoney");
        const objectiveEl = document.getElementById("objective");
        const codeDisplayEl = document.getElementById("codeDisplay");
        const shopHintEl = document.getElementById("shopHint");
        const fragEl = document.getElementById("fragCount");
        const smokeEl = document.getElementById("smokeCount");
        const stoneEl = document.getElementById("stoneCount");
        const hamEl = document.getElementById("hamCount");
        const choripanEl = document.getElementById("choripanCount");
        const roastbeefEl = document.getElementById("roastbeefCount");
        const parrilladaEl = document.getElementById("parrilladaCount");
        const mineEl = document.getElementById("mineCount");
        const lighterEl = document.getElementById("lighterCount");
        const nailsEl = document.getElementById("nailsCount");
        const rcCarEl = document.getElementById("rcCarCount");
        const pistolCountEl = document.getElementById("pistolCount");
        const selKeyEl = document.getElementById("selKey");
        const selNameEl = document.getElementById("selName");
        const selCountEl = document.getElementById("selCount");
        const shopOverlay = document.getElementById("shopOverlay");
        const shopItemsEl = document.getElementById("shopItems");
        const shopCloseBtn = document.getElementById("shopClose");
        const overlay = document.getElementById("overlay");
        const ovTitle = document.getElementById("ovTitle");
        const ovText = document.getElementById("ovText");
        const ovBtn = document.getElementById("ovBtn");
        const helpBtn = document.getElementById("helpBtn");
        const helpOverlay = document.getElementById("helpOverlay");
        const helpClose = document.getElementById("helpClose");
        const missionTimerEl = document.getElementById("missionTimer");
        const rushTimerEl = document.getElementById("rushTimer");

        const keys = {};
        const mouse = { x: VIEW_W / 2, y: VIEW_H / 2, down: false };
        const camera = { x: 0, y: 0 };

        let phase = "menu";
        let cheatBuffer = "";
        let usedCheats = { carrefour: false, bucks: false, modopro: false };

        let shake = 0;
        let onClickAction = () => { };
        let knifeCooldown = 0;
        let knifeFlash = 0;
        let kickCooldown = 0;
        let kickFlash = 0;
        let noShootHintTimer = 0;
        let packSpawnTimer = 15;
        let shopOpen = false;
        let helpOpen = false;
        let emergencyProtocol = false;
        let itemLegend = { text: "", color: "", life: 0, maxLife: 1 };
        let missionTimeLeft = 600;
        let lastNoiseEventTime = 0;
        let footstepTimer = 0;
        let rcGlitchSoundTimer = 0;
        let rcHonkCooldown = 0;

        let vipDeathTimer = 0;
        let vipDeathPos = null;
        let cabinCheckBot = null;
        let cabinCheckReassignTimer = 0;
        let reinforcementCalledTimer = 0;

        const extraction = { active: false, paused: false, input: "", wrongFlash: 0 };
        const rushTimer = { active: false, timeLeft: 0, maxTime: EXTRACTION_RUSH_TIME, warned30: false, warned10: false };
        const prisonPuzzle = { active: false, input: "", wrongFlash: 0 };
        const chestPuzzle = { active: false, input: "", wrongFlash: 0 };
        const chestState = { opened: false };

        const stats = {
            startTime: 0, endTime: 0, detections: 0, kills: 0, vipKilled: false,
            foodThrown: 0, shots: 0, grenadesThrown: 0, stonesThrown: 0,
        };

        const player = {
            x: 250, y: 1800, r: 14, hp: 100, maxHp: 100,
            angle: -Math.PI / 2, shootCooldown: 0, hurtFlash: 0, throwCooldown: 0,
            money: 815, hasPistol: false, hasSilencer: false, pistolAmmo: 0,
            selectedItem: null, grenades: { frag: 0, smoke: 0 }, stones: 10,
            hams: 0, choripanes: 0, roastbeefs: 0, parrilladas: 0, mines: 0,
            lighters: 0, nails: 0, rcCars: 0,
            draggingBody: null, backstab: null,
        };

        let prisoner = null, prisonDoor = null, prisonUnlocked = false;
        let bullets = [], projectiles = [], droppedStones = [], droppedFoods = [], droppedAmmo = [], moneyPacks = [];
        let grills = [], placedMines = [], explosions = [], smokes = [];
        let enemies = [], enemyCars = [], dogs = [], bunkerPosts = [];
        let effects = [], walls = [], houses = [], trees = [], rocks = [], statues = [], shadows = [];
        let combatFlags = [], papers = [], papersCollected = 0;
        let exitCode = "", exitCodeRevealed = false, vipDead = false;
        let packs = [], enemyRespawnTimer = 0, shopPos = null, exitZone = null;
        let floatingTexts = [], notifications = [];
        let bodyCamera = { active: false, bot: null, timer: 0, duration: 4, isCabinCheck: false };
        let bodyAlertSoundTimer = 0;
        const bodyAlertSoundPlayed = new WeakSet();
        const bodyCameraShown = new WeakSet();

        let burningTrees = [];
        let placedNails = [];
        let skidmarks = [];
        const rcCar = {
            active: false, x: 0, y: 0, vx: 0, vy: 0, angle: 0,
            hp: RC_CAR_HP, maxHp: RC_CAR_HP, exploded: false, explodeTimer: 0,
            signal: 1, signalLostTimer: 0, wasDestroyed: false,
            parked: false, honkFlash: 0,
        };

        let keypadLayout = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let keypadPressed = -1;
        let keypadPressTimer = 0;

        function randomKeypad() {
            const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function isInsideCabin(x, y) {
            return x > CABIN.x && x < CABIN.x + CABIN.w &&
                y > CABIN.y && y < CABIN.y + CABIN.h;
        }
        function getCabinEntryWaypoint(e) {
            let bestIdx = 0, bestD = Infinity;
            for (let i = 0; i < VIP_PATH.length; i++) {
                if (isInsideCabin(VIP_PATH[i].x, VIP_PATH[i].y)) continue;
                const d = dist(e.x, e.y, VIP_PATH[i].x, VIP_PATH[i].y);
                if (d < bestD) { bestD = d; bestIdx = i; }
            }
            return VIP_PATH[Math.min(bestIdx + 1, VIP_PATH.length - 1)];
        }
        function getCabinExitWaypoint(e) {
            let bestIdx = VIP_PATH.length - 1, bestD = Infinity;
            for (let i = 0; i < VIP_PATH.length; i++) {
                if (!isInsideCabin(VIP_PATH[i].x, VIP_PATH[i].y)) continue;
                const d = dist(e.x, e.y, VIP_PATH[i].x, VIP_PATH[i].y);
                if (d < bestD) { bestD = d; bestIdx = i; }
            }
            return VIP_PATH[Math.max(bestIdx - 1, 0)];
        }

        function getItemCount(id) {
            if (id === "pistol") return player.pistolAmmo;
            if (id === "frag") return player.grenades.frag;
            if (id === "smoke") return player.grenades.smoke;
            if (id === "ham") return player.hams;
            if (id === "choripan") return player.choripanes;
            if (id === "roastbeef") return player.roastbeefs;
            if (id === "parrillada") return player.parrilladas;
            if (id === "mine") return player.mines;
            if (id === "lighter") return player.lighters > 0 ? -1 : 0;
            if (id === "nails") return player.nails;
            if (id === "rc_car") return player.rcCars;
            return 0;
        }
        function itemAvailable(id) {
            if (id === "pistol") return player.hasPistol && player.pistolAmmo > 0;
            if (id === "lighter") return player.lighters > 0;
            if (id === "rc_car" && rcCar.active) return false;
            if (id === "rc_car" && rcCar.parked) return true;
            return getItemCount(id) > 0;
        }
        function showItemLegend(text, color) { itemLegend = { text, color, life: 1.5, maxLife: 1.5 }; }
        function selectItem(id) {
            if (extraction.active || shopOpen || helpOpen || prisonPuzzle.active) return;
            if (!ITEM_DISPLAY[id]) return;
            if (!itemAvailable(id)) { showItemLegend("SIN " + ITEM_DISPLAY[id].name, "#ef4444"); SoundFX.codeWrong(); return; }
            player.selectedItem = id;
            const cnt = getItemCount(id);
            const cntStr = cnt === -1 ? "∞" : String(cnt);
            showItemLegend(ITEM_DISPLAY[id].name + " · " + cntStr, ITEM_DISPLAY[id].color);
            SoundFX.selectItem();
            updateHUD();
        }
        function cycleItem(dir) {
            if (extraction.active || shopOpen || helpOpen || prisonPuzzle.active) return;
            const available = ITEM_ORDER.filter(id => itemAvailable(id));
            if (available.length === 0) { showItemLegend("NO TENÉS ARMAS", "#ef4444"); return; }
            let idx = available.indexOf(player.selectedItem);
            if (idx === -1) idx = dir > 0 ? 0 : available.length - 1;
            else idx = (idx + dir + available.length) % available.length;
            selectItem(available[idx]);
        }
        function useSelectedItem() {
            if (extraction.active || shopOpen || helpOpen || prisonPuzzle.active) return;
            if (player.backstab || rcCar.active) return;
            if (!player.selectedItem) return;
            const id = player.selectedItem;
            if (id === "pistol") tryShoot();
            else if (id === "frag") throwFrag();
            else if (id === "smoke") throwSmoke();
            else if (id === "ham") throwFood("ham");
            else if (id === "choripan") throwFood("choripan");
            else if (id === "roastbeef") throwFood("roastbeef");
            else if (id === "parrillada") throwFood("parrillada");
            else if (id === "mine") placeMine();
            else if (id === "lighter") useLighter();
            else if (id === "nails") placeNails();
            else if (id === "rc_car") activateRcCar();
        }

        function getChestCode() {
            if (!exitCodeRevealed) return null;
            return exitCode.slice(-4);
        }
        function openChestPuzzle() {
            if (chestState.opened) {
                showNotification("¡Cofre abierto!", "#94a3b8", 2);
                return;
            }
            if (!exitCodeRevealed) {
                showNotification("Reuní los documentos para abrir el cofre", "#fbbf24", 3);
                return;
            }
            chestPuzzle.active = true;
            chestPuzzle.input = "";
            chestPuzzle.wrongFlash = 0;
            keypadLayout = randomKeypad();
            SoundFX.beep();
        }
        function giveChestReward() {
            chestState.opened = true;
            player.money += 500;
            player.grenades.frag += 1;
            player.grenades.smoke += 1;
            player.mines += 1;
            if (player.hasPistol) player.pistolAmmo += 15;
            else player.money += 100;
            const c = level1.chest;
            spawnParticles(c.x, c.y, "#fbbf24", 30);
            addFloatingText(c.x, c.y - 30, "¡COFRE ABIERTO!", "#fbbf24");
            let msg = "💰 +$500 · 💣 +1 frag · 💨 +1 humo · 💥 +1 mina";
            if (player.hasPistol) msg += " · 🔫 +15 balas";
            showNotification(msg, "#fbbf24", 5);
            SoundFX.codeCorrect();
            updateHUD();
        }

        function getPrisonCode() { return exitCode.split("").reverse().join(""); }
        function openPrisonPuzzle() {
            if (prisonUnlocked) return;
            if (!exitCodeRevealed) { showNotification("Necesitás los 8 documentos primero", "#fbbf24", 3); return; }
            prisonPuzzle.active = true;
            prisonPuzzle.input = "";
            prisonPuzzle.wrongFlash = 0;
            keypadLayout = randomKeypad();
            SoundFX.beep();
        }
        function unlockPrisonDoor() {
            if (prisonUnlocked) return;
            prisonUnlocked = true;
            walls = walls.filter(w => !w.isPrisonDoor);
            rebuildShadows();
            for (const e of enemies) {
                if (e.prisonGuard && !e.downed) {
                    e.state = "suspicious";
                    e.suspicionPoint = prisonDoor ? { x: prisonDoor.x + prisonDoor.w / 2, y: prisonDoor.y + prisonDoor.h / 2 } : { x: player.x, y: player.y };
                    e.stateTimer = 6;
                }
            }
        }

        function getKeypadButtons() {
            const btnW = 62, btnH = 62, gap = 12;
            const totalW = 5 * btnW + 4 * gap;
            const startX = VIEW_W / 2 - totalW / 2;
            const startY = 340;
            const buttons = [];
            for (let i = 0; i < 10; i++) {
                const row = Math.floor(i / 5);
                const col = i % 5;
                buttons.push({
                    x: startX + col * (btnW + gap),
                    y: startY + row * (btnH + gap),
                    w: btnW, h: btnH, value: keypadLayout[i], type: "digit",
                });
            }
            const ctrlY = startY + 2 * (btnH + gap) + 10;
            const ctrlW = (totalW - gap) / 2;
            buttons.push({ x: startX, y: ctrlY, w: ctrlW, h: 46, type: "backspace" });
            buttons.push({ x: startX + ctrlW + gap, y: ctrlY, w: ctrlW, h: 46, type: "enter" });
            return buttons;
        }
        function handleKeypadClick(mx, my) {
            if (!prisonPuzzle.active && !chestPuzzle.active && !(extraction.active && !extraction.paused)) return false;
            const buttons = getKeypadButtons();
            for (let i = 0; i < buttons.length; i++) {
                const b = buttons[i];
                if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                    keypadPressed = i;
                    keypadPressTimer = 0.12;
                    SoundFX.keypadClick();
                    let target, expected, maxLen;
                    if (chestPuzzle.active) { target = chestPuzzle; expected = getChestCode(); maxLen = 4; }
                    else if (prisonPuzzle.active) { target = prisonPuzzle; expected = getPrisonCode(); maxLen = 8; }
                    else { target = extraction; expected = exitCode; maxLen = 8; }
                    if (b.type === "digit") {
                        if (target.input.length < maxLen) {
                            const idx = target.input.length;
                            target.input += String(b.value);
                            SoundFX.codeDigit(idx);
                        }
                    } else if (b.type === "backspace") {
                        target.input = target.input.slice(0, -1);
                    } else if (b.type === "enter") {
                        if (target.input === expected) {
                            if (chestPuzzle.active) {
                                chestPuzzle.active = false;
                                giveChestReward();
                            } else if (prisonPuzzle.active) {
                                prisonPuzzle.active = false;
                                unlockPrisonDoor();
                                SoundFX.codeCorrect();
                                showNotification("Puerta abierta, preparate para sacar al Pichón!", "#22c55e", 3);
                            } else {
                                extraction.active = false;
                                rushTimer.active = false;
                                SoundFX.codeCorrect();
                                SoundFX.stopMusic(false);
                                winGame();
                            }
                        } else {
                            target.input = "";
                            target.wrongFlash = 1;
                            SoundFX.codeWrong();
                            if (chestPuzzle.active) showNotification("Ese no es el código, revisá los papeles", "#ef4444", 2);
                            else if (!prisonPuzzle.active) showNotification("Hmmm no, ese código está", "#ef4444", 2);
                        }
                    }
                    return true;
                }
            }
            return false;
        }

        window.addEventListener("keydown", (e) => {
            if (e.key && e.key.length === 1 && e.key.match(/[a-z]/i)) {
                cheatBuffer += e.key.toLowerCase();
                if (cheatBuffer.length > 30) cheatBuffer = cheatBuffer.slice(-30);

                if (cheatBuffer.endsWith("findesemanacarrefour")) {
                    if (!usedCheats.carrefour) {
                        player.hams += 1;
                        player.choripanes += 1;
                        player.roastbeefs += 1;
                        usedCheats.carrefour = true;
                        updateHUD();
                        showNotification("¡Fin de Semana Carrefour! +1 Jamón, +1 Choripán, +1 Roast Beef", "#22c55e", 3);
                        SoundFX.pickup();
                    } else {
                        showNotification("Truco ya utilizado...Tampoco para abusar viste?", "#ef4444", 2);
                    }
                    cheatBuffer = "";
                }
                else if (cheatBuffer.endsWith("givememybucks")) {
                    if (!usedCheats.bucks) {
                        player.money += 500;
                        usedCheats.bucks = true;
                        updateHUD();
                        showNotification("Bueno bueno, tranquilo, ahí tenés tus 500 pavos tio... Ya", "#fbbf24", 3);
                        SoundFX.pickup();
                    } else {
                        showNotification("Truco ya utilizado...Tampoco para abusar viste?", "#ef4444", 2);
                    }
                    cheatBuffer = "";
                }
                else if (cheatBuffer.endsWith("modopro")) {
                    if (!usedCheats.modopro) {
                        usedCheats.modopro = true;
                        document.body.classList.add("pro-mode");
                        showNotification("ModoPro, sólo para los pro, salvo que no seas pro... Noob", "#22c55e", 3);
                        SoundFX.selectItem();
                    } else {
                        if (document.body.classList.contains("pro-mode")) {
                            document.body.classList.remove("pro-mode");
                            showNotification("Modo Pro Desactivado, era obvio, sos Noob...", "#94a3b8", 3);
                        } else {
                            document.body.classList.add("pro-mode");
                            showNotification("ModoPro, sólo para los pro, salvo que no seas pro... Noob", "#22c55e", 3);
                        }
                        SoundFX.selectItem();
                    }
                    cheatBuffer = "";
                }
            }
            if (extraction.active && !extraction.paused) {
                if (e.code.startsWith("Digit") && e.code.length === 6) { e.preventDefault(); return; }
                if (e.code === "Backspace") { extraction.input = extraction.input.slice(0, -1); e.preventDefault(); return; }
                if (e.code === "Enter") {
                    if (extraction.input === exitCode) {
                        extraction.active = false;
                        rushTimer.active = false;
                        SoundFX.codeCorrect();
                        SoundFX.stopMusic(false);
                        winGame();
                    } else {
                        extraction.input = "";
                        extraction.wrongFlash = 1;
                        SoundFX.codeWrong();
                        showNotification("Casi, pero ese código no es", "#ef4444", 2);
                    }
                    e.preventDefault(); return;
                }
                if (e.code === "KeyE") { extraction.paused = true; e.preventDefault(); return; }
                if (e.code === "Escape") { e.preventDefault(); return; }
                e.preventDefault(); return;
            }
            if (extraction.active && extraction.paused) {
                if (e.code === "KeyE") { extraction.paused = false; e.preventDefault(); return; }
            }
            if (prisonPuzzle.active) {
                if (e.code.startsWith("Digit") && e.code.length === 6) { e.preventDefault(); return; }
                if (e.code === "Backspace") { prisonPuzzle.input = prisonPuzzle.input.slice(0, -1); e.preventDefault(); return; }
                if (e.code === "Enter") {
                    if (prisonPuzzle.input === getPrisonCode()) {
                        prisonPuzzle.active = false;
                        unlockPrisonDoor();
                        SoundFX.codeCorrect();
                        showNotification("La puerta se abrió, preparete para sacar al Pichón!", "#22c55e", 3);
                    } else {
                        prisonPuzzle.input = "";
                        prisonPuzzle.wrongFlash = 1;
                        SoundFX.codeWrong();
                    }
                    e.preventDefault(); return;
                }
                if (e.code === "Escape" || e.code === "KeyE") {
                    prisonPuzzle.active = false;
                    e.preventDefault(); return;
                }
                e.preventDefault(); return;
            }
            if (chestPuzzle.active) {
                if (e.code.startsWith("Digit") && e.code.length === 6) { e.preventDefault(); return; }
                if (e.code === "Backspace") { chestPuzzle.input = chestPuzzle.input.slice(0, -1); e.preventDefault(); return; }
                if (e.code === "Enter") {
                    if (chestPuzzle.input === getChestCode()) {
                        chestPuzzle.active = false;
                        giveChestReward();
                    } else {
                        chestPuzzle.input = "";
                        chestPuzzle.wrongFlash = 1;
                        SoundFX.codeWrong();
                        showNotification("Ese no es el código, revisá los papeles", "#ef4444", 2);
                    }
                    e.preventDefault(); return;
                }
                if (e.code === "Escape" || e.code === "KeyE") {
                    chestPuzzle.active = false;
                    e.preventDefault(); return;
                }
                e.preventDefault(); return;
            }
            if (shopOpen) {
                if (e.code === "KeyE" || e.code === "Escape") { e.preventDefault(); closeShop(); }
                return;
            }
            if (helpOpen) {
                if (e.code === "KeyE" || e.code === "Escape") { e.preventDefault(); closeHelp(); }
                return;
            }
            SoundFX.init();
            keys[e.code] = true;
            if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "KeyE", "KeyF", "KeyQ", "KeyR",
                "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8",
                "Digit9", "Digit0"].includes(e.code)) e.preventDefault();

            if (rcCar.active) {
                if (e.code === "KeyE") { exitRcCar(); }
                return;
            }

            if (e.code === "KeyE") handleInteract();
            if (e.code === "KeyF") handleKnife();
            if (e.code === "KeyQ") handleDrag();
            if (e.code === "KeyR") throwStone();
            if (e.code === "Space") handleKick();
            if (e.code === "Digit1") selectItem("pistol");
            if (e.code === "Digit2") selectItem("frag");
            if (e.code === "Digit3") selectItem("smoke");
            if (e.code === "Digit4") selectItem("ham");
            if (e.code === "Digit5") selectItem("choripan");
            if (e.code === "Digit6") selectItem("roastbeef");
            if (e.code === "Digit7") selectItem("parrillada");
            if (e.code === "Digit8") selectItem("mine");
            if (e.code === "Digit9") selectItem("lighter");
            if (e.code === "Digit0") selectItem("nails");
        });
        window.addEventListener("keyup", (e) => { keys[e.code] = false; });
        canvas.addEventListener("mousemove", (e) => {
            const r = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - r.left) / r.width * VIEW_W;
            mouse.y = (e.clientY - r.top) / r.height * VIEW_H;
        });
        canvas.addEventListener("mousedown", (e) => {
            SoundFX.init();
            if (prisonPuzzle.active || chestPuzzle.active || (extraction.active && !extraction.paused)) {
                if (e.button === 0 && handleKeypadClick(mouse.x, mouse.y)) return;
                return;
            }
            if (extraction.active || shopOpen || helpOpen || prisonPuzzle.active || chestPuzzle.active) return;
            if (rcCar.active) {
                if (e.button === 0 && !rcCar.exploded) honkRcCar();
                return;
            }
            if (e.button === 0) { mouse.down = true; useSelectedItem(); }
        });
        window.addEventListener("mouseup", (e) => { if (e.button === 0) mouse.down = false; });
        canvas.addEventListener("wheel", (e) => {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active || chestPuzzle.active || rcCar.active) return;
            e.preventDefault();
            cycleItem(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });
        canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        ovBtn.addEventListener("click", () => { SoundFX.init(); onClickAction(); });
        shopCloseBtn.addEventListener("click", closeShop);
        helpBtn.addEventListener("click", () => { if (!shopOpen && !prisonPuzzle.active) openHelp(); });
        helpClose.addEventListener("click", closeHelp);

        const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
        const worldMouseX = () => mouse.x + camera.x;
        const worldMouseY = () => mouse.y + camera.y;
        function circleRect(cx, cy, r, rect) {
            const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
            const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
            const dx = cx - nx, dy = cy - ny;
            return dx * dx + dy * dy < r * r;
        }
        function lineRectIntersection(x1, y1, x2, y2, rect) {
            const dx = x2 - x1, dy = y2 - y1;
            let tmin = 0, tmax = 1;
            if (Math.abs(dx) < 0.0001) { if (x1 < rect.x || x1 > rect.x + rect.w) return null; }
            else {
                const t1 = (rect.x - x1) / dx, t2 = (rect.x + rect.w - x1) / dx;
                const tlow = Math.min(t1, t2), thigh = Math.max(t1, t2);
                tmin = Math.max(tmin, tlow); tmax = Math.min(tmax, thigh);
            }
            if (Math.abs(dy) < 0.0001) { if (y1 < rect.y || y1 > rect.y + rect.h) return null; }
            else {
                const t1 = (rect.y - y1) / dy, t2 = (rect.y + rect.h - y1) / dy;
                const tlow = Math.min(t1, t2), thigh = Math.max(t1, t2);
                tmin = Math.max(tmin, tlow); tmax = Math.min(tmax, thigh);
            }
            if (tmin > tmax || tmax < 0 || tmin > 1) return null;
            return tmin >= 0 ? tmin : tmax;
        }
        function clampProjectileToWalls(startX, startY, endX, endY) {
            let closestT = 1;
            for (const w of walls) {
                const t = lineRectIntersection(startX, startY, endX, endY, w);
                if (t !== null && t < closestT) closestT = t;
            }
            if (closestT < 1) {
                const tSafe = Math.max(0, closestT - 0.04);
                return { x: startX + (endX - startX) * tSafe, y: startY + (endY - startY) * tSafe, bounced: true };
            }
            return { x: endX, y: endY, bounced: false };
        }
        function segIntersectsRect(x1, y1, x2, y2, r) { return lineRectIntersection(x1, y1, x2, y2, r) !== null; }
        function segCircleDist(x1, y1, x2, y2, cx, cy) {
            const dx = x2 - x1, dy = y2 - y1;
            const len2 = dx * dx + dy * dy;
            if (len2 === 0) return Math.hypot(cx - x1, cy - y1);
            let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
            t = Math.max(0, Math.min(1, t));
            return Math.hypot(cx - (x1 + t * dx), cy - (y1 + t * dy));
        }
        function hasLineOfSight(x1, y1, x2, y2) {
            for (const w of walls) if (segIntersectsRect(x1, y1, x2, y2, w)) return false;
            for (const h of houses) if (segIntersectsRect(x1, y1, x2, y2, h)) return false;
            for (const t of trees) if (segIntersectsRect(x1, y1, x2, y2, t)) return false;
            for (const s of smokes) if (segCircleDist(x1, y1, x2, y2, s.x, s.y) < s.r) return false;
            return true;
        }
        function hasLineOfSightMelee(x1, y1, x2, y2) {
            for (const w of walls) if (segIntersectsRect(x1, y1, x2, y2, w)) return false;
            for (const h of houses) if (segIntersectsRect(x1, y1, x2, y2, h)) return false;
            for (const t of trees) if (segIntersectsRect(x1, y1, x2, y2, t)) return false;
            return true;
        }
        function bulletHitsSolid(b) {
            if (b.x < 20 || b.x > WORLD_W - 20 || b.y < 20 || b.y > WORLD_H - 20) return true;
            for (const w of walls) if (circleRect(b.x, b.y, b.r, w)) return true;
            for (const h of houses) if (circleRect(b.x, b.y, b.r, h)) return true;
            for (const r of rocks) if (circleRect(b.x, b.y, b.r, r)) return true;
            return false;
        }
        function bounceBullet(b, rect) {
            const x1 = rect.x - b.r, y1 = rect.y - b.r;
            const x2 = rect.x + rect.w + b.r, y2 = rect.y + rect.h + b.r;
            if (b.x <= x1 || b.x >= x2 || b.y <= y1 || b.y >= y2) return false;
            const pl = b.x - x1, pr = x2 - b.x, pt = b.y - y1, pb = y2 - b.y;
            const m = Math.min(pl, pr, pt, pb);
            if (m === pl) { b.x = x1; b.vx = -Math.abs(b.vx); }
            else if (m === pr) { b.x = x2; b.vx = Math.abs(b.vx); }
            else if (m === pt) { b.y = y1; b.vy = -Math.abs(b.vy); }
            else { b.y = y2; b.vy = Math.abs(b.vy); }
            return true;
        }
        function spawnParticles(x, y, color, count = 6) {
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2;
                const s = 60 + Math.random() * 180;
                effects.push({
                    x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                    life: 0.4 + Math.random() * 0.3, maxLife: 0.7, color, size: 2 + Math.random() * 2
                });
            }
        }
        function addFloatingText(x, y, text, color) { floatingTexts.push({ x, y, text, color, life: 1.6, maxLife: 1.6 }); }
        function showNotification(text, color, duration = 3) { notifications.push({ text, color, life: duration, maxLife: duration }); }
        function updateCamera() {
            if (rcCar.active && !rcCar.exploded) {
                camera.x = rcCar.x - VIEW_W / 2;
                camera.y = rcCar.y - VIEW_H / 2;
                return;
            }
            camera.x = Math.max(0, Math.min(WORLD_W - VIEW_W, player.x - VIEW_W / 2));
            camera.y = Math.max(0, Math.min(WORLD_H - VIEW_H, player.y - VIEW_H / 2));
        }
        function makeShadow(obj, height) {
            const dx = height * SHADOW_DX, dy = height * SHADOW_DY;
            return {
                poly: [
                    { x: obj.x, y: obj.y + obj.h }, { x: obj.x + obj.w, y: obj.y + obj.h },
                    { x: obj.x + obj.w + dx, y: obj.y + obj.h + dy }, { x: obj.x + dx, y: obj.y + obj.h + dy },
                ]
            };
        }
        function pointInPolygon(px, py, poly) {
            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
                const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }
        function isInShadow(px, py) { for (const s of shadows) if (pointInPolygon(px, py, s.poly)) return true; return false; }
        function rebuildShadows() {
            shadows = [];
            for (const h of houses) shadows.push(makeShadow(h, 90));
            for (const t of trees) shadows.push(makeShadow(t, 70));
            for (const r of rocks) shadows.push(makeShadow(r, 25));
        }
        function playerInSmoke() {
            for (const s of smokes) if (dist(player.x, player.y, s.x, s.y) < s.r * 0.85) return true;
            return false;
        }
        function isPlayerHidden() { return isInShadow(player.x, player.y) || playerInSmoke(); }
        function isBodyHidden(x, y) {
            if (isInShadow(x, y)) return true;
            for (const s of smokes) if (dist(x, y, s.x, s.y) < s.r * 0.85) return true;
            return false;
        }
        function isRcActive() { return rcCar.active && !rcCar.exploded; }

        function findClearDirection(entity, targetAngle, lookAhead) {
            const offsets = [0, 0.3, -0.3, 0.6, -0.6, 1.0, -1.0, 1.5, -1.5, 2.0, -2.0, 2.5, -2.5, Math.PI];
            for (const offset of offsets) {
                const testAngle = targetAngle + offset;
                let blocked = false;
                for (const t of [0.4, 0.75, 1.0]) {
                    const tx = entity.x + Math.cos(testAngle) * lookAhead * t;
                    const ty = entity.y + Math.sin(testAngle) * lookAhead * t;
                    for (const s of getSolids()) {
                        if (circleRect(tx, ty, entity.r, s)) { blocked = true; break; }
                    }
                    if (blocked) break;
                }
                if (!blocked) return testAngle;
            }
            return targetAngle;
        }

        function getSafeSteeringAngle(entity, targetAngle, maxDist) {
            let bestAngle = targetAngle;
            let bestScore = -Infinity;
            const lookDist = Math.max(50, maxDist);

            for (let offset = -Math.PI; offset <= Math.PI; offset += Math.PI / 12) {
                const testAngle = targetAngle + offset;
                let score = -Math.abs(offset) * 10;
                let blocked = false;

                for (let t = 20; t <= lookDist; t += 20) {
                    const tx = entity.x + Math.cos(testAngle) * t;
                    const ty = entity.y + Math.sin(testAngle) * t;
                    for (const s of getSolids()) {
                        if (circleRect(tx, ty, entity.r + 10, s)) {
                            score -= (lookDist - t) * 5;
                            blocked = true;
                            break;
                        }
                    }
                    if (blocked) break;
                }

                for (const other of enemies) {
                    if (other === entity || other.downed) continue;
                    const tx = entity.x + Math.cos(testAngle) * 45;
                    const ty = entity.y + Math.sin(testAngle) * 45;
                    if (Math.hypot(tx - other.x, ty - other.y) < entity.r + other.r + 18) {
                        score -= 150;
                        blocked = true;
                        break;
                    }
                }

                if (!blocked && score > bestScore) {
                    bestScore = score;
                    bestAngle = testAngle;
                }
            }
            return bestAngle;
        }

        function pickOpenFacing(entity) {
            const testDist = 220;
            for (let i = 0; i < 16; i++) {
                const a = Math.random() * Math.PI * 2;
                const tx = entity.x + Math.cos(a) * testDist;
                const ty = entity.y + Math.sin(a) * testDist;
                let clear = true;
                for (const w of walls) if (segIntersectsRect(entity.x, entity.y, tx, ty, w)) { clear = false; break; }
                if (clear) for (const h of houses) if (segIntersectsRect(entity.x, entity.y, tx, ty, h)) { clear = false; break; }
                if (clear) for (const r of rocks) if (segIntersectsRect(entity.x, entity.y, tx, ty, r)) { clear = false; break; }
                if (clear) return a;
            }
            return Math.random() * Math.PI * 2;
        }

        function allFlagsCaptured() { return combatFlags.every(f => f.owner === "player"); }
        function allPapersCollected() { return papersCollected >= TOTAL_PAPERS; }
        function allCoreObjectivesComplete() { return allFlagsCaptured() && allPapersCollected() && vipDead; }
        function prisonerSecured() {
            if (!prisoner) return false;
            if (prisoner.atBase) return true;
            if (!prisoner.following) return false;
            if (!exitZone) return false;
            return dist(prisoner.x, prisoner.y, exitZone.x, exitZone.y) < exitZone.r + 40;
        }
        function prisonerAtBase() { return prisonerSecured(); }
        function allObjectivesComplete() {
            return allCoreObjectivesComplete() && prisoner && (prisoner.following || prisoner.atBase);
        }
        function extractionReady() { return allObjectivesComplete() && prisonerAtBase(); }

        function setupBunkerPosts() {
            bunkerPosts = [
                { x: 1585, y: 590, idx: 0, occupiedBy: null },
                { x: 1665, y: 590, idx: 1, occupiedBy: null },
                { x: 1400, y: 320, idx: 2, occupiedBy: null },
                { x: 1580, y: 320, idx: 3, occupiedBy: null },
                { x: 1750, y: 320, idx: 4, occupiedBy: null },
                { x: 1400, y: 480, idx: 5, occupiedBy: null },
                { x: 1580, y: 480, idx: 6, occupiedBy: null },
                { x: 1750, y: 480, idx: 7, occupiedBy: null },
            ];
        }
        function updateBunkerPosts(dt) {
            if (emergencyProtocol) return;
            for (const post of bunkerPosts) {
                if (post.occupiedBy) {
                    const stillAlive = enemies.includes(post.occupiedBy) && !post.occupiedBy.downed;
                    if (!stillAlive) post.occupiedBy = null;
                }
                if (!post.occupiedBy) {
                    let best = null, bestD = Infinity;
                    for (const e of enemies) {
                        if (e.downed || e.bunkerGuard || e.prisonGuard || e.exBunkerGuard || e.cabinGuard) continue;
                        if (e.special === "vip" || e.escorting) continue;
                        const d = dist(e.x, e.y, post.x, post.y);
                        if (d < bestD) { bestD = d; best = e; }
                    }
                    if (best) {
                        best.bunkerGuard = true;
                        best.bunkerPostIdx = post.idx;
                        best.patrolCenter = { x: post.x, y: post.y };
                        best.sweepPhase = Math.random() * Math.PI * 2;
                        const isInside = (best.x > 1350 && best.x < 1830 && best.y > 250 && best.y < 560);
                        best.bunkerWaypoint = isInside ? null : { x: 1625, y: 600 };
                        post.occupiedBy = best;
                    }
                }
            }
        }

        function triggerVIPEscort() {
            return;
        }
        function checkVIPThreat(sourceX, sourceY, radius = 400) {
            return;
        }
        function updateEscortState(dt) {
            const vip = enemies.find(e => e.special === "vip" && !e.downed);
            if (!vip || !vip.escorting) return;
            vip.escorting = false;
            vip.escortTimer = 0;
        }

        function activateEmergencyProtocol() {
            if (emergencyProtocol) return;
            emergencyProtocol = true;
            for (const en of enemies) en.mapWideSearch = false;
            MAX_ENEMIES = 38;
            ENEMY_RESPAWN_INTERVAL = 1.2;
            for (const e of enemies) {
                e.mapWideSearch = false;
                e.checkingCabin = false;
                e.bunkerGuard = false;
                e.cabinGuard = false;
                e.prisonGuard = false;
                e.bunkerPostIdx = undefined;
                e.bunkerWaypoint = null;
                e.state = "idle";
                e.stateTimer = 0;
                e.detectionLevel = 0;
                e.suspicionPoint = null;
                e.lastSeen = null;
                e.wanderTarget = null;
                e.speedMod = (Math.random() * 40) - 20;
            }
            if (bodyCamera.isCabinCheck) {
                bodyCamera.active = false;
                bodyCamera.bot = null;
            }
            const basePos = level1.base;
            let carSpawn = { x: 2800, y: 300 };
            for (let i = 0; i < 40; i++) {
                const cx = 200 + Math.random() * (WORLD_W - 400);
                const cy = 200 + Math.random() * (WORLD_H - 400);
                if (dist(cx, cy, basePos.x, basePos.y) > 1400) { carSpawn = { x: cx, y: cy }; break; }
            }
            enemyCars.push({
                x: carSpawn.x, y: carSpawn.y, r: 20, heading: Math.PI, vLong: 0,
                hp: 100, maxHp: 100, cooldown: 2, hurtFlash: 0,
                waypointIdx: 2, state: "patrol", canSee: false,
                stuckTimer: 0, stuckDir: 1, speedMul: 1.4, disabled: false,
                sirenOn: true, sirenFlash: 0, sirenSoundTimer: 0,
            });

            const corpseTarget = vipDeathPos || { x: player.x, y: player.y };
            const candidates = enemies.filter(e =>
                !e.special && !e.downed &&
                e.state !== "alert" &&
                !e.bunkerGuard && !e.cabinGuard && !e.prisonGuard && !e.escorting && !e.checkingCabin
            );
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }
            const investigators = candidates.slice(0, 3);
            const searchers = candidates.slice(3);
            for (const e of investigators) {
                e.state = "suspicious";
                e.detectionLevel = 0.7;
                e.stateTimer = 20;
                e.suspicionPoint = { ...corpseTarget };
            }
            for (const e of searchers) {
                e.state = "idle";
                e.stateTimer = 0;
                e.detectionLevel = 0;
                e.wanderTarget = {
                    x: 200 + Math.random() * (WORLD_W - 400),
                    y: 200 + Math.random() * (WORLD_H - 400),
                };
            }

            const currentCount = enemies.filter(e => !e.downed).length;
            const toSpawn = Math.max(0, 33 - currentCount);
            const gridCols = 6, gridRows = 4, margin = 200;
            const cellW = (WORLD_W - margin * 2) / gridCols;
            const cellH = (WORLD_H - margin * 2) / gridRows;
            const cells = [];
            for (let gy = 0; gy < gridRows; gy++) for (let gx = 0; gx < gridCols; gx++) {
                cells.push({ cx: margin + cellW * (gx + 0.5), cy: margin + cellH * (gy + 0.5), cw: cellW, ch: cellH });
            }
            for (let i = cells.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cells[i], cells[j]] = [cells[j], cells[i]];
            }
            let cellIdx = 0;
            for (let i = 0; i < toSpawn; i++) {
                let spawned = false;
                for (let attempt = 0; attempt < 8 && !spawned; attempt++) {
                    const cell = cells[cellIdx % cells.length];
                    cellIdx++;
                    for (let t = 0; t < 10; t++) {
                        const px = cell.cx + (Math.random() - 0.5) * cell.cw * 0.85;
                        const py = cell.cy + (Math.random() - 0.5) * cell.ch * 0.85;
                        if (px < 100 || px > WORLD_W - 100 || py < 100 || py > WORLD_H - 100) continue;
                        if (dist(px, py, player.x, player.y) < 600) continue;
                        let blocked = false;
                        for (const w of [...walls, ...houses, ...rocks]) {
                            if (px + 40 > w.x && px - 40 < w.x + w.w && py + 40 > w.y && py - 40 < w.y + w.h) { blocked = true; break; }
                        }
                        if (blocked) continue;
                        let tooClose = false;
                        for (const e of enemies) {
                            if (e.downed) continue;
                            if (dist(px, py, e.x, e.y) < 130) { tooClose = true; break; }
                        }
                        if (tooClose) continue;
                        spawnEnemyAtPos(px, py);
                        spawned = true;
                        break;
                    }
                }
            }
            for (const d of dogs) {
                d.state = "patrolling";
                d.patrolCenter = { x: 100 + Math.random() * (WORLD_W - 200), y: 100 + Math.random() * (WORLD_H - 200) };
            }
            SoundFX.startChaseMusic(1.0);
            SoundFX.emergency();
            showNotification("¡Protocolo de Emergencia ACTIVADO!", "#ef4444", 5);
        }

        function getVipBodyPos() {
            const statue = statues.find(s => s.isVipCorpse);
            if (statue) return { x: statue.x + statue.w / 2, y: statue.y + statue.h / 2 };
            return vipDeathPos;
        }

        function assignCabinCheckBot() {
            if (emergencyProtocol || !vipDeathPos) return;
            if (reinforcementCalledTimer > 0) return;

            let candidates = enemies.filter(e =>
                !e.downed &&
                e.bunkerGuard &&
                !e.checkingCabin
            );

            if (candidates.length === 0) {
                candidates = enemies.filter(e =>
                    !e.downed &&
                    !e.special &&
                    e.special !== "guard" &&
                    !e.prisonGuard &&
                    !e.cabinGuard &&
                    !e.escorting &&
                    !e.checkingCabin
                );
            }

            if (candidates.length === 0) return;

            const bot = candidates[Math.floor(Math.random() * candidates.length)];
            bot.checkingCabin = true;
            bot.cabinCheckTarget = { x: vipDeathPos.x, y: vipDeathPos.y };
            bot.cabinCheckPhase = 'walking';
            bot.cabinCheckWaypointIdx = 0;
            bot.cabinCheckReturnIdx = VIP_PATH.length - 1;
            bot.cabinCheckPhaseTimer = 0;
            bot.cabinPatrolPoint = null;
            bot.state = "idle";
            bot.detectionLevel = 0;
            bot.canSee = false;
            bot.suspicionPoint = null;
            bot.lastSeen = null;
            bot.searchPoint = null;
            cabinCheckBot = bot;

            if (!bot.bunkerGuard) {
                bot.role = "patrol";
                bot.patrolCenter = { x: bot.x, y: bot.y };
            }

            showNotification("Un guardia va a revisar la cabaña...", "#fbbf24", 3);
        }

        function callBunkerReinforcements(sourceBot) {
            const candidates = enemies.filter(e =>
                e.bunkerGuard && !e.downed && e !== sourceBot && !e.checkingCabin
            ).sort((a, b) =>
                dist(a.x, a.y, sourceBot.x, sourceBot.y) - dist(b.x, b.y, sourceBot.x, sourceBot.y)
            );

            const selected = candidates.slice(0, 3);
            const allSearchers = [sourceBot, ...selected];

            for (const bot of allSearchers) {
                bot.bunkerGuard = false;
                bot.exBunkerGuard = true;
                bot.bunkerPostIdx = undefined;
                bot.bunkerWaypoint = null;
                bot.checkingCabin = false;
                bot.cabinCheckPhase = null;
                bot.state = "alert";
                bot.stateTimer = 999;
                bot.detectionLevel = 1;
                bot.mapWideSearch = true;
                bot.wanderTarget = {
                    x: 200 + Math.random() * (WORLD_W - 400),
                    y: 200 + Math.random() * (WORLD_H - 400),
                };
            }

            reinforcementCalledTimer = CABIN_CHECK_PATROL_TIME;
            if (bodyCamera.isCabinCheck) { bodyCamera.active = false; bodyCamera.bot = null; }

            showNotification(`${allSearchers.length} Guardias te están buscando`, "#fbbf24", 4);
        }

        function cancelCabinCheckSequence() {
            for (const en of enemies) {
                en.checkingCabin = false;
                if (en.bunkerGuard && en.state !== "alert") {
                    en.state = "idle";
                    en.stateTimer = 0;
                    en.detectionLevel = 0;
                    en.suspicionPoint = null;
                    en.lastSeen = null;
                }
            }
            if (bodyCamera.isCabinCheck) { bodyCamera.active = false; bodyCamera.bot = null; }
            cabinCheckBot = null;
            reinforcementCalledTimer = 0;
            showNotification("", "#22c55e", 3);
        }

        function spawnDog(x, y, homeX, homeY) {
            dogs.push({
                x, y, r: 12, angle: 0, state: "searching", homeX, homeY,
                biteCooldown: 0, eatTimer: 0, searchTimer: 0, barkTimer: 0,
                targetX: 0, targetY: 0, eatGrill: null,
                leapActive: false, leapTimer: 0.1, leapStartX: x, leapStartY: y,
                leapToX: x, leapToY: y, leapProgress: 0, leapDur: 0.22, leapArc: 0,
                patrolCenter: null, patrolPhase: 0,
            });
        }
        function releaseDog() {
            if (dogs.length >= 8) return;
            const vip = enemies.find(e => e.special === "vip" && !e.downed);
            const origin = vip ? { x: vip.x, y: vip.y } : { x: CABIN.x + CABIN.w / 2, y: CABIN.y + CABIN.h / 2 };

            let spawnX = origin.x;
            let spawnY = origin.y;

            if (dist(spawnX, spawnY, level1.base.x, level1.base.y) < 500) {
                let valid = false;
                for (let tries = 0; tries < 30; tries++) {
                    spawnX = 200 + Math.random() * (WORLD_W - 400);
                    spawnY = 200 + Math.random() * (WORLD_H - 400);
                    if (dist(spawnX, spawnY, level1.base.x, level1.base.y) < 500) continue;
                    let blocked = false;
                    for (const w of [...walls, ...houses, ...rocks]) {
                        if (spawnX + 30 > w.x && spawnX - 30 < w.x + w.w && spawnY + 30 > w.y && spawnY - 30 < w.y + w.h) {
                            blocked = true; break;
                        }
                    }
                    if (!blocked) { valid = true; break; }
                }
                if (!valid) { spawnX = origin.x; spawnY = origin.y; }
            }

            spawnDog(spawnX, spawnY, spawnX, spawnY);
            showNotification("¡Soltaron al Perrooo!", "#ef4444", 3);
            spawnParticles(spawnX, spawnY, "#000000", 20);
            SoundFX.bark();
        }
        function dogSeesPlayer(d) {
            if (isPlayerHidden()) return false;
            const distance = dist(d.x, d.y, player.x, player.y);
            const maxRange = emergencyProtocol ? 420 : 300;
            if (distance > maxRange) return false;
            return hasLineOfSight(d.x, d.y, player.x, player.y);
        }
        function updateDogs(dt) {
            for (const d of dogs) {
                if (d.biteCooldown > 0) d.biteCooldown -= dt;
                if (d.leapActive) {
                    d.leapProgress += dt;
                    const p = Math.min(1, d.leapProgress / d.leapDur);
                    d.x = d.leapStartX + (d.leapToX - d.leapStartX) * p;
                    d.y = d.leapStartY + (d.leapToY - d.leapStartY) * p;
                    d.leapArc = Math.sin(p * Math.PI) * 22;
                    if (p >= 1) { d.leapActive = false; d.leapTimer = 0.08; d.leapArc = 0; }
                    continue;
                }
                if (d.state === "eating") {
                    const dToFood = dist(d.x, d.y, d.targetX, d.targetY);
                    if (dToFood < 25) {
                        if (!d.eatGrill) {
                            d.eatTimer -= dt;
                            if (d.eatTimer <= 0) {
                                d.state = "patrolling";
                                d.searchTimer = 0;
                                const scatterAngle = Math.random() * Math.PI * 2;
                                const scatterDist = 100 + Math.random() * 150;
                                d.patrolCenter = {
                                    x: Math.max(50, Math.min(WORLD_W - 50, d.x + Math.cos(scatterAngle) * scatterDist)),
                                    y: Math.max(50, Math.min(WORLD_H - 50, d.y + Math.sin(scatterAngle) * scatterDist))
                                };
                                d.patrolPhase = scatterAngle;
                            }
                        }
                        continue;
                    }
                } else if (dogSeesPlayer(d) && d.state !== "searching") {
                    d.state = "searching";
                    d.searchTimer = 0;
                    d.barkTimer = 0.5;
                    SoundFX.bark();
                }
                if (d.state === "searching") {
                    d.barkTimer = (d.barkTimer || 0) - dt;
                    if (d.barkTimer <= 0 && dist(d.x, d.y, player.x, player.y) < 500) {
                        d.barkTimer = 2.5 + Math.random() * 1.5;
                        SoundFX.bark();
                    }
                }
                d.leapTimer -= dt;
                if (d.leapTimer > 0) continue;
                let tx, ty;
                if (d.state === "eating") { tx = d.targetX; ty = d.targetY; }
                else if (d.state === "searching") { tx = player.x; ty = player.y; }
                else if (d.state === "patrolling") {
                    if (emergencyProtocol) {
                        if (!d.patrolCenter || dist(d.x, d.y, d.patrolCenter.x, d.patrolCenter.y) < 100) {
                            d.patrolCenter = { x: 100 + Math.random() * (WORLD_W - 200), y: 100 + Math.random() * (WORLD_H - 200) };
                        }
                        tx = d.patrolCenter.x; ty = d.patrolCenter.y;
                    } else {
                        if (!d.patrolCenter) { d.patrolCenter = { x: d.x, y: d.y }; d.patrolPhase = Math.random() * Math.PI * 2; }
                        d.patrolPhase += dt * 0.8;
                        tx = d.patrolCenter.x + Math.cos(d.patrolPhase) * 60;
                        ty = d.patrolCenter.y + Math.sin(d.patrolPhase) * 60;
                    }
                } else {
                    tx = d.homeX; ty = d.homeY;
                    if (dist(d.x, d.y, tx, ty) < 25) { d.state = "searching"; d.searchTimer = 0; continue; }
                }
                const dd = dist(d.x, d.y, tx, ty);
                if (dd < 20 && d.state !== "searching" && d.state !== "eating") continue;
                const leapDist = Math.min(100, dd);
                const a = Math.atan2(ty - d.y, tx - d.x);
                d.angle = a;
                d.leapStartX = d.x; d.leapStartY = d.y;
                d.leapToX = d.x + Math.cos(a) * leapDist;
                d.leapToY = d.y + Math.sin(a) * leapDist;
                d.leapProgress = 0; d.leapActive = true;
                if (d.state === "searching" && d.biteCooldown <= 0) {
                    if (dist(d.x, d.y, player.x, player.y) < d.r + player.r + 6) {
                        player.hp -= 10;
                        player.hurtFlash = 0.4;
                        shake = Math.max(shake, 0.3);
                        d.biteCooldown = 1.5;
                        addFloatingText(player.x, player.y - 30, "¡MORDIDA! -10 HP", "#ef4444");
                        spawnParticles(player.x, player.y, "#000", 12);
                        SoundFX.bite();
                        updateHUD();
                        if (player.hp <= 0) { gameOver(); return; }
                    }
                }
                if (d.state === "searching") {
                    d.searchTimer += dt;
                    const loseThreshold = emergencyProtocol ? 15 : 8;
                    const distToPlayerNow = dist(d.x, d.y, player.x, player.y);
                    if (d.searchTimer > loseThreshold || distToPlayerNow > 450 || dist(d.x, d.y, d.homeX, d.homeY) > 1200) {
                        d.state = "patrolling";
                        d.patrolCenter = { x: d.x, y: d.y };
                        d.patrolPhase = Math.random() * Math.PI * 2;
                        d.searchTimer = 0;
                    }
                }
                d.x = Math.max(20 + d.r, Math.min(WORLD_W - 20 - d.r, d.x));
                d.y = Math.max(20 + d.r, Math.min(WORLD_H - 20 - d.r, d.y));
            }
        }

        function throwFood(foodType) {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.throwCooldown > 0 || player.backstab) return;
            const counts = { ham: player.hams, choripan: player.choripanes, roastbeef: player.roastbeefs, parrillada: player.parrilladas };
            if (counts[foodType] <= 0) { addFloatingText(player.x, player.y - 30, "Sin " + foodType, "#ef4444"); return; }
            player.throwCooldown = 0.5;
            if (foodType === "ham") player.hams--;
            else if (foodType === "choripan") player.choripanes--;
            else if (foodType === "roastbeef") player.roastbeefs--;
            else if (foodType === "parrillada") player.parrilladas--;
            stats.foodThrown++;
            const dx = worldMouseX() - player.x, dy = worldMouseY() - player.y;
            const d = Math.min(400, Math.hypot(dx, dy));
            const a = Math.atan2(dy, dx);
            const clamped = clampProjectileToWalls(player.x, player.y, player.x + Math.cos(a) * d, player.y + Math.sin(a) * d);
            projectiles.push({
                x: player.x, y: player.y, tx: clamped.x, ty: clamped.y,
                startX: player.x, startY: player.y, t: 0, dur: 0.6, type: "food",
                foodType, thrown: false, bounced: clamped.bounced
            });
            SoundFX.throwSound();
            updateHUD();
        }
        function handleFoodLanding(proj) {
            const x = proj.tx, y = proj.ty;
            const foodType = proj.foodType;
            if (proj.bounced) { addFloatingText(x, y - 20, "¡Rebotó!", "#94a3b8"); spawnParticles(x, y, "#94a3b8", 8); }
            if (foodType === "parrillada") handleParrilladaLanding(x, y);
            else handleSimpleFoodLanding(x, y, foodType);
        }
        function handleSimpleFoodLanding(x, y, foodType) {
            const eatTime = foodType === "ham" ? 2.5 : foodType === "choripan" ? 6 : 10;
            droppedFoods.push({ x, y, life: 30, maxLife: 30, foodType });
            for (const d of dogs) {
                if (d.state === "eating") continue;
                if (dist(d.x, d.y, x, y) > 450) continue;
                d.state = "eating";
                const angle = Math.random() * Math.PI * 2;
                const offsetDist = 5 + Math.random() * 10;
                d.targetX = x + Math.cos(angle) * offsetDist;
                d.targetY = y + Math.sin(angle) * offsetDist;
                d.eatTimer = eatTime; d.eatGrill = null; d.leapActive = false; d.leapTimer = 0;
                addFloatingText(x, y - 30, "¡A comer!", "#fbbf24");
                spawnParticles(x, y, "#fbbf24", 10);
            }
        }
        function handleParrilladaLanding(x, y) {
            const grill = { x, y, charges: 3, maxCharges: 3, eatTimer: 0, eatPerCharge: 12, regenTimer: 0, regenTotal: 30, pulse: 0 };
            grills.push(grill);
            for (const d of dogs) {
                if (dist(d.x, d.y, x, y) > 500) continue;
                d.state = "eating";
                const angle = Math.random() * Math.PI * 2;
                const offsetDist = 5 + Math.random() * 10;
                d.targetX = x + Math.cos(angle) * offsetDist;
                d.targetY = y + Math.sin(angle) * offsetDist;
                d.eatTimer = 999; d.eatGrill = grill; d.leapActive = false; d.leapTimer = 0;
            }
            addFloatingText(x, y - 30, "¡Parrillada!", "#fbbf24");
            spawnParticles(x, y, "#dc2626", 20);
        }
        function updateGrills(dt) {
            for (const g of grills) {
                g.pulse += dt;
                if (g.regenTimer > 0) {
                    g.regenTimer -= dt;
                    if (g.regenTimer <= 0) {
                        g.charges = g.maxCharges;
                        g.regenTimer = 0;
                        for (const d of dogs) {
                            if (d.eatGrill === g && d.state !== "searching" && !dogSeesPlayer(d)) {
                                d.state = "eating"; d.targetX = g.x; d.targetY = g.y;
                                d.eatTimer = 999; d.leapActive = false; d.leapTimer = 0;
                            }
                        }
                    }
                    continue;
                }
                let eatingDogs = 0;
                for (const d of dogs) if (d.eatGrill === g && d.state === "eating" && dist(d.x, d.y, g.x, g.y) < 40) eatingDogs++;
                if (eatingDogs > 0 && g.charges > 0) {
                    g.eatTimer += dt;
                    if (g.eatTimer >= g.eatPerCharge) {
                        g.eatTimer = 0;
                        g.charges--;
                        if (g.charges <= 0) {
                            g.charges = 0;
                            g.regenTimer = g.regenTotal;
                            for (const d of dogs) if (d.eatGrill === g) { d.state = "searching"; d.searchTimer = 0; }
                        }
                    }
                }
            }
        }

        function placeMine() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.mines <= 0) { addFloatingText(player.x, player.y - 30, "Sin minas", "#ef4444"); return; }
            if (player.throwCooldown > 0 || player.backstab) return;
            player.mines--;
            player.throwCooldown = 0.5;
            placedMines.push({ x: player.x, y: player.y, armDelay: MINE_ARM_TIME, pulse: 0 });
            spawnParticles(player.x, player.y, "#dc2626", 8);
            addFloatingText(player.x, player.y - 25, "💥 Mina colocada", "#dc2626");
            SoundFX.placeMine();
            updateHUD();
        }

        function useLighter() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.lighters <= 0) { addFloatingText(player.x, player.y - 30, "Sin combo", "#ef4444"); return; }
            if (player.throwCooldown > 0 || player.backstab) return;
            let nearest = null, nearestD = LIGHTER_TREE_RANGE;
            for (const t of trees) {
                if (t.burning || t.burned) continue;
                const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
                const d = dist(player.x, player.y, cx, cy);
                if (d < nearestD) { nearestD = d; nearest = t; }
            }
            if (!nearest) {
                addFloatingText(player.x, player.y - 30, "Acercate a un árbol", "#94a3b8");
                return;
            }
            player.throwCooldown = 0.6;
            igniteTree(nearest);
            addFloatingText(nearest.x + nearest.w / 2, nearest.y - 20, "🔥 ¡INCENDIO!", "#f97316");
            SoundFX.fire();
        }
        function handleLighterLanding(x, y) {
            let nearest = null, nearestD = LIGHTER_TREE_RANGE;
            for (const t of trees) {
                if (t.burning || t.burned) continue;
                const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
                const d = dist(x, y, cx, cy);
                if (d < nearestD) { nearestD = d; nearest = t; }
            }
            if (nearest) {
                igniteTree(nearest);
                addFloatingText(nearest.x + nearest.w / 2, nearest.y - 20, "🔥 ¡INCENDIO!", "#f97316");
                SoundFX.fire();
            } else {
                addFloatingText(x, y - 20, "Sin árbol cerca", "#94a3b8");
                spawnParticles(x, y, "#f97316", 8);
            }
        }
        function igniteTree(tree) {
            if (tree.burning || tree.burned) return;
            tree.burning = true;
            tree.burnTimer = TREE_BURN_TIME;
            burningTrees.push({ tree, timer: TREE_BURN_TIME });
            spawnParticles(tree.x + tree.w / 2, tree.y + tree.h / 2, "#f97316", 25);
            spawnParticles(tree.x + tree.w / 2, tree.y + tree.h / 2, "#ef4444", 15);
            SoundFX.fire();
        }
        function updateBurningTrees(dt) {
            for (let i = burningTrees.length - 1; i >= 0; i--) {
                const bt = burningTrees[i];
                bt.timer -= dt;
                bt.tree.burnTimer = Math.max(0, bt.timer);
                if (Math.random() < 0.35) {
                    spawnParticles(
                        bt.tree.x + bt.tree.w / 2 + (Math.random() - 0.5) * 30,
                        bt.tree.y + bt.tree.h / 2 + (Math.random() - 0.5) * 20,
                        Math.random() < 0.5 ? "#f97316" : "#ef4444", 2
                    );
                }
                const cx = bt.tree.x + bt.tree.w / 2;
                const cy = bt.tree.y + bt.tree.h / 2;
                let assigned = 0;
                const nearby = enemies
                    .filter(e => !e.downed && dist(e.x, e.y, cx, cy) < TREE_EXTINGUISH_RADIUS && (e.state === "idle" || e.extinguishing))
                    .sort((a, b) => dist(a.x, a.y, cx, cy) - dist(b.x, b.y, cx, cy));
                for (const e of nearby) {
                    if (assigned >= MAX_TREE_EXTINGUISHERS) break;
                    e.extinguishing = true;
                    assigned++;
                    if (dist(e.x, e.y, cx, cy) < 90) {
                        if (Math.random() < 0.5) {
                            const angle = Math.atan2(cy - e.y, cx - e.x);
                            effects.push({
                                x: e.x + Math.cos(angle) * 15, y: e.y + Math.sin(angle) * 15,
                                vx: Math.cos(angle) * 120, vy: Math.sin(angle) * 120,
                                life: 0.4, maxLife: 0.4,
                                color: Math.random() < 0.5 ? "#93c5fd" : "#f8fafc", size: 2.5,
                            });
                        }
                    }
                }
                if (bt.timer <= 0) {
                    bt.tree.burning = false;
                    bt.tree.burned = true;
                    for (const e of enemies) if (e.extinguishing) { e.extinguishing = false; if (e.state !== "alert") { e.state = "idle"; e.stateTimer = 0; } }
                    burningTrees.splice(i, 1);
                    addFloatingText(cx, cy - 20, "🔥 Apagado", "#94a3b8");
                }
            }
        }

        function placeNails() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.nails <= 0) { addFloatingText(player.x, player.y - 30, "Sin clavos", "#ef4444"); return; }
            if (player.throwCooldown > 0 || player.backstab) return;
            player.nails--;
            player.throwCooldown = 0.5;
            placedNails.push({ x: player.x, y: player.y, life: 60 });
            spawnParticles(player.x, player.y, "#78716c", 8);
            addFloatingText(player.x, player.y - 25, "🔩 Clavos colocados", "#78716c");
            SoundFX.placeMine();
            updateHUD();
        }
        function updateNails(dt) {
            for (let i = placedNails.length - 1; i >= 0; i--) {
                const n = placedNails[i];
                n.life -= dt;
                if (n.life <= 0) { placedNails.splice(i, 1); continue; }
                for (const car of enemyCars) {
                    if (car.disabled) continue;
                    if (dist(car.x, car.y, n.x, n.y) < car.r + NAIL_TRIGGER_RADIUS) {
                        car.hp = 0;
                        car.disabled = true;
                        for (let k = 0; k < 4; k++) {
                            const a = (k / 4) * Math.PI * 2;
                            const px = car.x + Math.cos(a) * (car.r + 15);
                            const py = car.y + Math.sin(a) * (car.r + 15);
                            spawnEnemyAtPos(px, py);
                            const spawned = enemies[enemies.length - 1];
                            if (spawned) {
                                spawned.purple = true;
                                spawned.hp = 60; spawned.maxHp = 60;
                                spawned.state = "alert";
                                spawned.stateTimer = 10;
                                spawned.detectionLevel = 1;
                                spawned.lastSeen = { x: player.x, y: player.y };
                            }
                        }
                        showNotification("Funcionaron los clavos! Pero salieron 4 soldados!", "#78716c", 3);
                        spawnParticles(car.x, car.y, "#78716c", 20);
                        SoundFX.explosion();
                        shake = Math.max(shake, 0.3);
                        placedNails.splice(i, 1);
                        break;
                    }
                }
            }
        }

        function activateRcCar() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (rcCar.active) return;

            if (rcCar.parked && !rcCar.exploded) {
                const d = dist(player.x, player.y, rcCar.x, rcCar.y);
                if (d <= RC_SIGNAL_FULL) {
                    rcCar.active = true;
                    rcCar.parked = false;
                    rcCar.signal = 1;
                    rcCar.signalLostTimer = 0;
                    rcCar.hp = Math.max(rcCar.hp, RC_CAR_HP * 0.3);
                    for (const e of enemies) e.rcChasing = false;
                    canvas.style.transition = 'filter 0.4s ease';
                    canvas.style.filter = 'grayscale(100%) contrast(1.15) brightness(0.9)';
                    showNotification("Auto RC reactivado · E para salir · Click = bocina", "#8b5cf6", 3);
                    SoundFX.pickup();
                    updateHUD();
                    return;
                } else {
                    showNotification("Acercate al RC aparcado para reactivarlo, tampoco es que tiene mucha señal viste?", "#fbbf24", 2);
                    return;
                }
            }

            if (player.rcCars <= 0) { addFloatingText(player.x, player.y - 30, "Sin Auto RC :(", "#ef4444"); return; }
            player.rcCars--;
            rcCar.active = true;
            rcCar.parked = false;
            rcCar.x = player.x;
            rcCar.y = player.y;
            rcCar.vx = 0;
            rcCar.vy = 0;
            rcCar.angle = player.angle;
            rcCar.hp = RC_CAR_HP;
            rcCar.maxHp = RC_CAR_HP;
            rcCar.exploded = false;
            rcCar.explodeTimer = 0;
            rcCar.signal = 1;
            rcCar.signalLostTimer = 0;
            rcCar.wasDestroyed = false;
            rcCar.honkFlash = 0;
            for (const e of enemies) e.rcChasing = false;
            canvas.style.transition = 'filter 0.4s ease';
            canvas.style.filter = 'grayscale(100%) contrast(1.15) brightness(0.9)';
            showNotification("Auto RC activado! Clic para Bocina, E para salir", "#8b5cf6", 4);
            SoundFX.pickup();
            updateHUD();
        }
        function exitRcCar() {
            if (!rcCar.active) return;
            rcCar.active = false;
            rcCar.exploded = false;
            rcCar.parked = !rcCar.wasDestroyed;
            if (rcCar.wasDestroyed) {
                rcCar.parked = false;
            }
            for (const e of enemies) {
                if (e.rcChasing) {
                    e.rcChasing = false;
                    if (e.state === "alert" && (!e.lastSeen || (e.lastSeen.x === rcCar.x && e.lastSeen.y === rcCar.y))) {
                        e.state = "idle";
                        e.stateTimer = 0;
                        e.lastSeen = null;
                    }
                }
            }
            canvas.style.filter = '';
            if (rcCar.wasDestroyed) {
                showNotification(" ", "#ef4444", 2);
            } else {
                showNotification("Auto RC estacionado", "#8b5cf6", 2);
            }
            updateHUD();
        }
        function honkRcCar() {
            if (!rcCar.active || rcCar.exploded) return;
            if (rcHonkCooldown > 0) return;
            rcHonkCooldown = 0.8;
            rcCar.honkFlash = 0.5;
            makeNoise(rcCar.x, rcCar.y, 700, null, true);
            SoundFX.honk();
            showNotification("Beeep XD", "#8b5cf6", 1.2);
        }
        function explodeRcCar() {
            if (rcCar.exploded || !rcCar.active) return;
            rcCar.exploded = true;
            rcCar.wasDestroyed = true;
            smokes.push({ x: rcCar.x, y: rcCar.y, r: SMOKE_RADIUS, life: SMOKE_LIFE, maxLife: SMOKE_LIFE });
            spawnParticles(rcCar.x, rcCar.y, "#fbbf24", 30);
            spawnParticles(rcCar.x, rcCar.y, "#ef4444", 20);
            explosions.push({ x: rcCar.x, y: rcCar.y, life: 0.5, maxLife: 0.5, r: 100 });
            shake = Math.max(shake, 0.5);
            SoundFX.explosion();
            showNotification("El autito explotó! Aprovechá el humo", "#ef4444", 3);
            exitRcCar();
        }
        function updateRcCar(dt) {
            if (!rcCar.active) return;
            if (rcCar.exploded) { exitRcCar(); return; }
            if (rcCar.honkFlash > 0) rcCar.honkFlash -= dt;
            if (rcHonkCooldown > 0) rcHonkCooldown -= dt;
            const playerDist = dist(player.x, player.y, rcCar.x, rcCar.y);
            if (playerDist <= RC_SIGNAL_FULL) rcCar.signal = 1;
            else if (playerDist >= RC_SIGNAL_LOST) rcCar.signal = 0;
            else rcCar.signal = 1 - (playerDist - RC_SIGNAL_FULL) / (RC_SIGNAL_LOST - RC_SIGNAL_FULL);
            if (rcCar.signal <= 0) {
                rcCar.signalLostTimer += dt;
                if (rcCar.signalLostTimer > RC_SIGNAL_GRACE) { exitRcCar(); return; }
            } else rcCar.signalLostTimer = 0;
            if (rcCar.signal < 0.7) {
                rcGlitchSoundTimer -= dt;
                if (rcGlitchSoundTimer <= 0) {
                    rcGlitchSoundTimer = 0.15 + Math.random() * 0.3;
                    SoundFX.rcGlitch();
                }
            }
            let accel = 0;
            if (keys.KeyW) accel += 400;
            if (keys.KeyS) accel -= 250;
            let steer = 0;
            if (keys.KeyA) steer -= 1;
            if (keys.KeyD) steer += 1;
            const fwdX = Math.cos(rcCar.angle);
            const fwdY = Math.sin(rcCar.angle);
            rcCar.vx += fwdX * accel * dt;
            rcCar.vy += fwdY * accel * dt;
            const friction = 0.95;
            rcCar.vx *= friction;
            rcCar.vy *= friction;
            const speed = Math.hypot(rcCar.vx, rcCar.vy);
            if (speed > 15) {
                const turnRate = steer * 3.2 * dt * Math.min(1, speed / 180);
                rcCar.angle += turnRate;
                if (Math.abs(steer) > 0 && speed > 130 && Math.random() < 0.6) {
                    skidmarks.push({ x: rcCar.x, y: rcCar.y, angle: rcCar.angle, life: 4, maxLife: 4 });
                }
            }
            const nx = rcCar.x + rcCar.vx * dt;
            const ny = rcCar.y + rcCar.vy * dt;
            let blockedX = false, blockedY = false;
            for (const s of getSolids()) {
                if (circleRect(nx, rcCar.y, 12, s)) blockedX = true;
                if (circleRect(rcCar.x, ny, 12, s)) blockedY = true;
            }
            if (!blockedX) rcCar.x = nx; else rcCar.vx *= -0.4;
            if (!blockedY) rcCar.y = ny; else rcCar.vy *= -0.4;
            rcCar.x = Math.max(20, Math.min(WORLD_W - 20, rcCar.x));
            rcCar.y = Math.max(20, Math.min(WORLD_H - 20, rcCar.y));
            let chasers = enemies.filter(e => e.rcChasing && !e.downed).length;
            for (const e of enemies) {
                if (e.downed) continue;
                const d = dist(e.x, e.y, rcCar.x, rcCar.y);
                if (e.rcChasing) {
                    if (d > 800) {
                        e.rcChasing = false;
                    } else {
                        e.lastSeen = { x: rcCar.x, y: rcCar.y };
                        if (e.state !== "alert") { e.state = "alert"; e.stateTimer = 8; }
                        e.stateTimer = Math.max(e.stateTimer, 3);
                    }
                } else if (chasers < RC_CAR_MAX_CHASERS && d < 500) {
                    if (e.state !== "alert" && e.special !== "vip" && !e.bunkerGuard) {
                        const angleToRc = Math.atan2(rcCar.y - e.y, rcCar.x - e.x);
                        let fovDiff = angleToRc - e.facing;
                        while (fovDiff > Math.PI) fovDiff -= Math.PI * 2;
                        while (fovDiff < -Math.PI) fovDiff += Math.PI * 2;
                        const seesRc = Math.abs(fovDiff) < VISION_ANGLE / 2 && hasLineOfSight(e.x, e.y, rcCar.x, rcCar.y);
                        if (seesRc) {
                            e.rcChasing = true;
                            e.state = "alert";
                            e.lastSeen = { x: rcCar.x, y: rcCar.y };
                            e.stateTimer = 8;
                            chasers++;
                        }
                    }
                }
            }
            for (const e of enemies) {
                if (!e.rcChasing || e.downed) continue;
                if (e.cooldown <= 0 && dist(e.x, e.y, rcCar.x, rcCar.y) < 400) {
                    if (hasLineOfSight(e.x, e.y, rcCar.x, rcCar.y)) {
                        e.cooldown = 1.6;
                        rcCar.hp -= 8;
                        spawnParticles(rcCar.x, rcCar.y, "#fbbf24", 3);
                        if (rcCar.hp <= 0) { explodeRcCar(); return; }
                    }
                }
            }
            for (let i = skidmarks.length - 1; i >= 0; i--) {
                skidmarks[i].life -= dt;
                if (skidmarks[i].life <= 0) skidmarks.splice(i, 1);
            }
        }

        function explodeMine(x, y) {
            const R = MINE_EXPLOSION_RADIUS;
            for (const e of enemies) {
                if (e.downed) continue;
                if (dist(e.x, e.y, x, y) < R + e.r) {
                    e.hp -= MINE_DAMAGE; e.hurtFlash = 0.3;
                    e.state = "alert";
                    e.lastSeen = { x: player.x, y: player.y };
                    e.detectionLevel = 1; e.stateTimer = 3;
                }
            }
            for (const car of enemyCars) if (!car.disabled && dist(car.x, car.y, x, y) < R + car.r) { car.hp -= MINE_DAMAGE * 2; car.hurtFlash = 0.3; }
            if (prisoner && prisoner.following && dist(prisoner.x, prisoner.y, x, y) < R + prisoner.r) damagePrisoner(40);
            spawnParticles(x, y, "#fbbf24", 30); spawnParticles(x, y, "#ef4444", 30);
            explosions.push({ x, y, life: 0.5, maxLife: 0.5, r: R });
            shake = Math.max(shake, 0.5);
            makeNoise(x, y, 500);
            SoundFX.explosion();
            updateHUD();
        }
        function updateMines(dt) {
            for (let i = placedMines.length - 1; i >= 0; i--) {
                const m = placedMines[i];
                m.armDelay -= dt; m.pulse += dt;
                if (m.armDelay <= 0) {
                    let trig = false;
                    for (const e of enemies) {
                        if (e.downed) continue;
                        if (dist(e.x, e.y, m.x, m.y) < MINE_TRIGGER_RADIUS + e.r) { trig = true; break; }
                    }
                    if (!trig) for (const car of enemyCars) if (!car.disabled && dist(car.x, car.y, m.x, m.y) < MINE_TRIGGER_RADIUS + car.r) { trig = true; break; }
                    if (trig) { explodeMine(m.x, m.y); placedMines.splice(i, 1); }
                }
            }
        }

        function damagePrisoner(amount) {
            if (!prisoner || (!prisoner.following && !prisoner.atBase) || prisoner.atBase) return;
            prisoner.hp -= amount;
            prisoner.hurtFlash = 0.4;
            addFloatingText(prisoner.x, prisoner.y - 22, `-${amount}`, "#ef4444");
            spawnParticles(prisoner.x, prisoner.y, "#ef4444", 6);
            if (prisoner.hp <= 0) {
                prisoner.hp = 0;
                showNotification("El Pichón murió :,(", "#ef4444", 4);
                gameOver();
            }
        }

        function loseAPaper() {
            const collected = papers.filter(p => p.collected);
            if (collected.length === 0) {
                showNotification("¡Tiempo agotado!", "#fbbf24", 4);
                return false;
            }
            const lost = collected[Math.floor(Math.random() * collected.length)];
            const oldDigit = lost.digit;
            let newDigit = oldDigit;
            while (newDigit === oldDigit) newDigit = Math.floor(Math.random() * 10);
            lost.collected = false;
            lost.digit = newDigit;
            papersCollected--;
            exitCodeRevealed = false;
            exitCode = "";
            for (let tries = 0; tries < 60; tries++) {
                const px = 100 + Math.random() * (WORLD_W - 200);
                const py = 100 + Math.random() * (WORLD_H - 200);
                let blocked = false;
                for (const w of [...walls, ...houses, ...rocks]) {
                    if (px + 20 > w.x && px - 20 < w.x + w.w && py + 20 > w.y && py - 20 < w.y + w.h) { blocked = true; break; }
                }
                if (dist(px, py, player.x, player.y) < 250) blocked = true;
                for (const other of papers) {
                    if (other === lost || other.collected) continue;
                    if (dist(px, py, other.x, other.y) < 50) { blocked = true; break; }
                }
                if (!blocked) { lost.x = px; lost.y = py; break; }
            }
            showNotification("¡Tiempo agotado! Un documento se perdió...", "#ef4444", 5);
            addFloatingText(player.x, player.y - 50, "📄 Documento perdido", "#ef4444");
            SoundFX.codeWrong();
            updateHUD();
            return true;
        }

        function updateHUD() {
            hpEl.textContent = String(Math.max(0, Math.ceil(player.hp)));
            const pct = Math.max(0, player.hp / player.maxHp);
            hpFillEl.style.height = (pct * 100) + "%";
            hpFillEl.className = "health-fill";
            if (pct <= 0.3) hpFillEl.classList.add("low");
            else if (pct <= 0.6) hpFillEl.classList.add("medium");
            moneyEl.textContent = String(player.money);
            fragEl.textContent = String(player.grenades.frag);
            smokeEl.textContent = String(player.grenades.smoke);
            stoneEl.textContent = String(player.stones);
            hamEl.textContent = String(player.hams);
            choripanEl.textContent = String(player.choripanes);
            roastbeefEl.textContent = String(player.roastbeefs);
            parrilladaEl.textContent = String(player.parrilladas);
            mineEl.textContent = String(player.mines);
            lighterEl.textContent = player.lighters > 0 ? "∞" : "0";
            nailsEl.textContent = String(player.nails);
            rcCarEl.textContent = String(player.rcCars);
            pistolCountEl.textContent = player.hasPistol ? String(player.pistolAmmo) : "—";
            let invPage = 0;
            if (player.selectedItem) {
                const selIdx = INVENTORY_SLOT_ORDER.indexOf(player.selectedItem);
                if (selIdx >= 0) invPage = Math.floor(selIdx / INVENTORY_PER_PAGE);
            }
            document.querySelectorAll(".gadgets .slot").forEach(el => {
                const id = /** @type {HTMLElement} */ (el).dataset.slot;
                const idx = INVENTORY_SLOT_ORDER.indexOf(id);
                const slotPage = idx >= 0 ? Math.floor(idx / INVENTORY_PER_PAGE) : 0;
                el.classList.toggle("page-hidden", slotPage !== invPage);
                if (id === "knife" || id === "stone") return;
                el.classList.toggle("empty", !itemAvailable(id));
                el.classList.toggle("selected", player.selectedItem === id);
            });
            const sel = player.selectedItem;
            if (sel && ITEM_DISPLAY[sel]) {
                selKeyEl.textContent = ITEM_DISPLAY[sel].key;
                selNameEl.textContent = ITEM_DISPLAY[sel].name;
                const c = getItemCount(sel);
                selCountEl.textContent = c === -1 ? "∞" : String(c);
                selCountEl.style.color = ITEM_DISPLAY[sel].color;
            } else {
                selKeyEl.textContent = "—"; selNameEl.textContent = "SIN ARMA";
                selCountEl.textContent = "F / R"; selCountEl.style.color = "#8b98a8";
            }
            const flagsOwned = combatFlags.filter(f => f.owner === "player").length;
            if (extractionReady()) {
                objectiveEl.textContent = `¡Ingresá el Código en la Base!`;
                objectiveEl.style.color = "#22c55e";
            } else if (allObjectivesComplete()) {
                objectiveEl.textContent = `Llevá al Pichón a la Base!`;
                objectiveEl.style.color = "#22c55e";
            } else {
                const prisStatus = (prisoner && (prisoner.following || prisoner.atBase)) ? "🟢✓" : "🟢✗";
                objectiveEl.textContent = `🚩${flagsOwned}/1 · 📄${papersCollected}/${TOTAL_PAPERS} · ${vipDead ? "👑✓" : "👑✗"} · ${prisStatus}`;
                objectiveEl.style.color = "#22d3ee";
            }
            if (phase === "combat" && !(extraction.active && !extraction.paused) && !prisonPuzzle.active && !chestPuzzle.active) {
                const codeStr = papers.length > 0 ? papers.map(p => p.collected ? p.digit : "·").join(" ") : "· · · · · · · ·";
                codeDisplayEl.textContent = `CÓDIGO: ${codeStr}`;
                codeDisplayEl.classList.remove("hidden");
            } else codeDisplayEl.classList.add("hidden");
            const mins = Math.floor(missionTimeLeft / 60);
            const secs = Math.floor(missionTimeLeft % 60);
            missionTimerEl.textContent = `${mins}:${String(secs).padStart(2, "0")}`;
            missionTimerEl.classList.toggle("low", missionTimeLeft <= 60);
            if (rushTimer.active) {
                rushTimerEl.classList.remove("hidden");
                const secs2 = Math.max(0, Math.ceil(rushTimer.timeLeft));
                rushTimerEl.textContent = `⏱️ ${Math.floor(secs2 / 60)}:${String(secs2 % 60).padStart(2, "0")}`;
                rushTimerEl.classList.toggle("urgent", rushTimer.timeLeft <= 15);
            } else rushTimerEl.classList.add("hidden");
        }

        function tryShoot() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.selectedItem !== "pistol" || player.backstab || rcCar.active) return;
            if (player.shootCooldown > 0) return;
            if (player.pistolAmmo <= 0) { addFloatingText(player.x, player.y - 30, "Sin balas", "#ef4444"); return; }
            if (isPlayerHidden()) {
                if (noShootHintTimer <= 0) {
                    addFloatingText(player.x, player.y - 30, "En sombra/humo no podés disparar", "#22c55e");
                    noShootHintTimer = 1.5;
                }
                return;
            }
            player.pistolAmmo--;
            player.shootCooldown = player.hasSilencer ? 0.22 : 0.18;
            stats.shots++;
            const a = player.angle, sp = 700;
            const bx = player.x + Math.cos(a) * (player.r + 4);
            const by = player.y + Math.sin(a) * (player.r + 4);
            bullets.push({ x: bx, y: by, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 4, friendly: true, bounces: 0, life: 3 });
            spawnParticles(bx, by, "#fbbf24", 3);
            if (!player.hasSilencer) makeNoise(player.x, player.y, 450);
            SoundFX.shoot();
            updateHUD();
        }

        function makeNoise(x, y, radius, priorityBot = null, force = false) {
            const now = performance.now();
            if (!force && now - lastNoiseEventTime < NOISE_EVENT_COOLDOWN && !priorityBot) return;
            lastNoiseEventTime = now;
            const candidates = [];
            for (const e of enemies) {
                if (e.downed) continue;
                if (e.state === "alert") continue;
                if (e.special === "vip") continue;
                if (e.special === "guard" && e.bodyguard) continue;
                if (e.escorting) continue;
                if (e.checkingCabin) continue;
                if (e.reinforcement && e.reinforcement.timer > 0) continue;
                if (!force && e.lastCalledAt && now - e.lastCalledAt < ENEMY_CALL_COOLDOWN) continue;
                if (e.bunkerGuard) {
                    const post = bunkerPosts[e.bunkerPostIdx];
                    if (!post) continue;
                    if (dist(post.x, post.y, x, y) > 450) continue;
                }
                if (e.cabinGuard) {
                    if (dist(CABIN_GUARD_POS.x, CABIN_GUARD_POS.y, x, y) > 450) continue;
                }
                if (e === priorityBot) { candidates.push(e); continue; }
                if (dist(e.x, e.y, x, y) < radius) candidates.push(e);
            }
            const priority = priorityBot ? [priorityBot] : [];
            const others = candidates.filter(c => c !== priorityBot);
            for (let i = others.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [others[i], others[j]] = [others[j], others[i]];
            }
            const selected = [...priority, ...others.slice(0, MAX_INVESTIGATORS_PER_EVENT - priority.length)];
            for (const e of selected) {
                e.state = "suspicious";
                e.suspicionPoint = { x, y };
                e.stateTimer = 5;
                e.searchSweep = 0;
                e.lastCalledAt = now;
            }
        }

        function makeRunNoise() {
            for (const e of enemies) {
                if (e.downed) continue;
                if (e.state !== "idle") continue;
                if (e.special === "vip") continue;
                if (e.checkingCabin) continue;
                const d = dist(e.x, e.y, player.x, player.y);
                if (d > RUN_NOISE_RADIUS) continue;
                if (e.lastFootstepAlert && performance.now() - e.lastFootstepAlert < 1200) continue;
                e.state = "suspicious";
                e.suspicionPoint = {
                    x: player.x + (Math.random() - 0.5) * 100,
                    y: player.y + (Math.random() - 0.5) * 100,
                };
                e.stateTimer = 4;
                e.lastFootstepAlert = performance.now();
            }
        }

        function handleDrag() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.backstab || rcCar.active) return;
            if (player.draggingBody) {
                addFloatingText(player.x, player.y - 25, "Cuerpo soltado", "#94a3b8");
                if (player.draggingBody.draggedBy) player.draggingBody.draggedBy = null;
                player.draggingBody = null;
                SoundFX.pickup();
                return;
            }
            const GRAB_RANGE = 55;
            let bodyToGrab = null, minD = GRAB_RANGE;
            for (const e of enemies) {
                if (e.downed) {
                    const d = dist(player.x, player.y, e.x, e.y);
                    if (d < minD) { minD = d; bodyToGrab = e; }
                }
            }
            if (!bodyToGrab) {
                for (const s of statues) {
                    const sx = s.x + s.w / 2, sy = s.y + s.h / 2;
                    const d = dist(player.x, player.y, sx, sy);
                    if (d < minD) { minD = d; bodyToGrab = s; }
                }
            }
            if (bodyToGrab) {
                player.draggingBody = bodyToGrab;
                bodyToGrab.draggedBy = player;
                addFloatingText(player.x, player.y - 25, "Arrastrando cuerpo (Q soltar)", "#fbbf24");
                SoundFX.pickup();
                updateHUD();
            }
        }

        function handleKnife() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.backstab || rcCar.active) return;
            if (knifeCooldown > 0) return;
            let backstabTarget = null;
            for (const e of enemies) {
                if (e.downed) continue;
                if (e.bunkerGuard && e.state === "alert" && e.canSee) continue;
                const d = dist(player.x, player.y, e.x, e.y);
                if (d > BACKSTAB_RANGE + e.r) continue;
                if (!hasLineOfSightMelee(player.x, player.y, e.x, e.y)) continue;
                const toPlayerAngle = Math.atan2(player.y - e.y, player.x - e.x);
                const backAngle = e.facing + Math.PI;
                let diff = toPlayerAngle - backAngle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                if (Math.abs(diff) < Math.PI / 2.5) { backstabTarget = e; break; }
            }
            if (backstabTarget) {
                player.angle = Math.atan2(backstabTarget.y - player.y, backstabTarget.x - player.x);
                player.backstab = { enemy: backstabTarget, timer: BACKSTAB_TIME, duration: BACKSTAB_TIME };
                knifeCooldown = BACKSTAB_TIME;
                knifeFlash = 0.3;
                SoundFX.slash();
                return;
            }
            knifeCooldown = 0.4;
            knifeFlash = 0.3;
            SoundFX.slash();
            const RANGE = 55;
            let hit = false, sparks = false;
            for (const e of enemies) {
                if (dist(player.x, player.y, e.x, e.y) < RANGE + e.r) {
                    if (!hasLineOfSightMelee(player.x, player.y, e.x, e.y)) continue;
                    if (e.downed) {
                        finalizeEnemy(e);
                        addFloatingText(e.x, e.y - 20, "REMATADO", "#ef4444");
                        player.money += 25;
                    } else {
                        e.hp -= 20;
                        e.hurtFlash = 0.2;
                        if (e.state !== "alert") {
                            e.state = "suspicious";
                            e.suspicionPoint = { x: e.x + (Math.random() - 0.5) * 120, y: e.y + (Math.random() - 0.5) * 120 };
                            e.stateTimer = 3;
                        }
                        spawnParticles(e.x, e.y, "#fbbf24", 8);
                    }
                    hit = true;
                }
            }
            if (!hit) {
                const checkX = player.x + Math.cos(player.angle) * 45;
                const checkY = player.y + Math.sin(player.angle) * 45;
                for (const w of walls) if (circleRect(checkX, checkY, 10, w)) { sparks = true; break; }
                if (!sparks) for (const h of houses) if (circleRect(checkX, checkY, 10, h)) { sparks = true; break; }
                if (sparks) {
                    for (let i = 0; i < 12; i++) {
                        const aa = player.angle + (Math.random() - 0.5) * 1.5;
                        const ss = 100 + Math.random() * 150;
                        effects.push({
                            x: checkX, y: checkY, vx: Math.cos(aa) * ss, vy: Math.sin(aa) * ss,
                            life: 0.15 + Math.random() * 0.2, maxLife: 0.35, color: "#fbbf24", size: 1.5 + Math.random() * 2
                        });
                    }
                    SoundFX.spark();
                }
            }
            if (hit) shake = Math.max(shake, 0.1);
            updateHUD();
        }

        function handleKick() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (kickCooldown > 0 || player.backstab || rcCar.active) return;
            kickCooldown = 0.6;
            kickFlash = 0.25;
            const KICK_RANGE = 70;
            const KICK_PUSH = 140;
            let hit = false;
            for (const e of enemies) {
                if (e.downed) continue;
                if (e.pushTimer && e.pushTimer > 0) continue;
                if (dist(player.x, player.y, e.x, e.y) < KICK_RANGE + e.r) {
                    const a = Math.atan2(e.y - player.y, e.x - player.x);
                    e.pushTimer = 0.55; e.pushDur = 0.55; e.pushElapsed = 0;
                    e.pushStartX = e.x; e.pushStartY = e.y;
                    e.pushToX = e.x + Math.cos(a) * KICK_PUSH;
                    e.pushToY = e.y + Math.sin(a) * KICK_PUSH;
                    e.pushArc = 0; e.hurtFlash = 0.3;
                    e.state = "alert";
                    e.suspicionPoint = { x: player.x, y: player.y };
                    e.stateTimer = 3; e.detectionLevel = 0.5; e.canSee = false;
                    if (e.checkingCabin) { e.checkingCabin = false; }
                    if (e.bunkerGuard) {
                        for (const post of bunkerPosts) if (post.occupiedBy === e) post.occupiedBy = null;
                        e.bunkerGuard = false; e.exBunkerGuard = true;
                        e.bunkerPostIdx = undefined; e.bunkerWaypoint = null;
                        e.patrolCenter = { x: e.pushToX, y: e.pushToY };
                    }
                    spawnParticles(e.x, e.y, "#fbbf24", 8);
                    addFloatingText(e.x, e.y - 25, "¡PATADA!", "#fbbf24");
                    hit = true;
                }
            }
            for (const d of dogs) {
                if (d.leapActive) continue;
                if (dist(player.x, player.y, d.x, d.y) < KICK_RANGE + d.r) {
                    const a = Math.atan2(d.y - player.y, d.x - player.x);
                    d.leapStartX = d.x; d.leapStartY = d.y;
                    d.leapToX = d.x + Math.cos(a) * KICK_PUSH;
                    d.leapToY = d.y + Math.sin(a) * KICK_PUSH;
                    d.leapDur = 0.5; d.leapProgress = 0; d.leapActive = true;
                    d.state = "searching"; d.searchTimer = 0; d.leapTimer = 0.1;
                    spawnParticles(d.x, d.y, "#fbbf24", 6);
                    addFloatingText(d.x, d.y - 25, "¡PATADA!", "#fbbf24");
                    hit = true;
                }
            }
            if (hit) { shake = Math.max(shake, 0.15); SoundFX.bite(); }
            else SoundFX.slash();
            updateHUD();
        }

        function throwStone() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.stones <= 0 || player.throwCooldown > 0 || player.backstab || rcCar.active) return;
            player.stones--;
            player.throwCooldown = 0.5;
            stats.stonesThrown++;
            const dx = worldMouseX() - player.x, dy = worldMouseY() - player.y;
            const d = Math.min(400, Math.hypot(dx, dy));
            const a = Math.atan2(dy, dx);
            const clamped = clampProjectileToWalls(player.x, player.y, player.x + Math.cos(a) * d, player.y + Math.sin(a) * d);
            projectiles.push({
                x: player.x, y: player.y, tx: clamped.x, ty: clamped.y,
                startX: player.x, startY: player.y, t: 0, dur: 0.6, type: "stone", thrown: false, bounced: clamped.bounced
            });
            SoundFX.throwSound();
            updateHUD();
        }

        function throwFrag() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.grenades.frag <= 0 || player.throwCooldown > 0) return;
            if (isPlayerHidden() || player.backstab || rcCar.active) return;
            player.grenades.frag--;
            player.throwCooldown = 0.6;
            stats.grenadesThrown++;
            const dx = worldMouseX() - player.x, dy = worldMouseY() - player.y;
            const d = Math.min(400, Math.hypot(dx, dy));
            const a = Math.atan2(dy, dx);
            const clamped = clampProjectileToWalls(player.x, player.y, player.x + Math.cos(a) * d, player.y + Math.sin(a) * d);
            projectiles.push({
                x: player.x, y: player.y, tx: clamped.x, ty: clamped.y,
                startX: player.x, startY: player.y, t: 0, dur: 0.7, type: "frag", fuse: 1.4, thrown: false, bounced: clamped.bounced
            });
            SoundFX.throwSound();
            updateHUD();
        }

        function throwSmoke() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active) return;
            if (player.grenades.smoke <= 0 || player.throwCooldown > 0) return;
            if (isPlayerHidden() || player.backstab || rcCar.active) return;
            player.grenades.smoke--;
            player.throwCooldown = 0.6;
            stats.grenadesThrown++;
            const dx = worldMouseX() - player.x, dy = worldMouseY() - player.y;
            const d = Math.min(350, Math.hypot(dx, dy));
            const a = Math.atan2(dy, dx);
            const clamped = clampProjectileToWalls(player.x, player.y, player.x + Math.cos(a) * d, player.y + Math.sin(a) * d);
            projectiles.push({
                x: player.x, y: player.y, tx: clamped.x, ty: clamped.y,
                startX: player.x, startY: player.y, t: 0, dur: 0.7, type: "smoke", fuse: 1.0, thrown: false, bounced: clamped.bounced
            });
            SoundFX.throwSound();
            updateHUD();
        }

        function handleStoneLanding(x, y) {
            let hitBot = null;
            for (const e of enemies) {
                if (e.downed) continue;
                if (dist(x, y, e.x, e.y) < 22 + e.r) {
                    e.hp -= 12; e.hurtFlash = 0.2;
                    spawnParticles(e.x, e.y, "#ef4444", 8);
                    addFloatingText(e.x, e.y - 22, "-12", "#ef4444");
                    hitBot = e;
                    break;
                }
            }
            for (const e of enemies) {
                if (e.downed || e.special === "vip") continue;
                if (e.state === "alert" && e.canSee) continue;
                if (e.special === "guard" && e.bodyguard) continue;
                if (e.checkingCabin) continue;
                const d = dist(e.x, e.y, x, y);
                if (d < STONE_NOISE_RADIUS && d < 550) {
                    if (e.state === "suspicious") {
                        e.suspicionPoint = { x, y };
                        e.stateTimer = 4;
                        e.facing = Math.atan2(y - e.y, x - e.x);
                    }
                }
            }
            makeNoise(x, y, STONE_NOISE_RADIUS, hitBot);
            droppedStones.push({ x, y, life: 30, maxLife: 30 });
            if (hitBot) { addFloatingText(x, y - 30, "¡Impacto!", "#ef4444"); shake = Math.max(shake, 0.1); }
            else { addFloatingText(x, y - 20, "¡Ruido!", "#94a3b8"); spawnParticles(x, y, "#94a3b8", 6); }
        }

        function explodeFrag(x, y) {
            const R = 130, DMG = 70;
            for (const e of enemies) {
                if (e.downed) continue;
                if (dist(e.x, e.y, x, y) < R + e.r) {
                    e.hp -= DMG; e.hurtFlash = 0.2;
                    e.state = "alert";
                    e.lastSeen = { x: player.x, y: player.y };
                    e.detectionLevel = 1; e.stateTimer = 3;
                }
            }
            if (dist(player.x, player.y, x, y) < R + player.r) {
                player.hp -= 25; player.hurtFlash = 0.4;
                if (player.hp <= 0) gameOver();
            }
            if (prisoner && prisoner.following && dist(prisoner.x, prisoner.y, x, y) < R + prisoner.r) damagePrisoner(40);
            spawnParticles(x, y, "#fbbf24", 25); spawnParticles(x, y, "#ef4444", 25);
            explosions.push({ x, y, life: 0.4, maxLife: 0.4, r: R });
            shake = Math.max(shake, 0.4);
            makeNoise(x, y, 450);
            SoundFX.explosion();
            updateHUD();
        }

        function explodeSmoke(x, y) {
            smokes.push({ x, y, r: SMOKE_RADIUS, life: SMOKE_LIFE, maxLife: SMOKE_LIFE });
            spawnParticles(x, y, "#94a3b8", 25);
        }

        function finalizeEnemy(e) {
            const statue = { x: e.x - 12, y: e.y - 12, w: 24, h: 24 };
            if (e.bodyDiscovered) statue.bodyDiscovered = true;
            if (bodyCameraShown.has(e)) bodyCameraShown.add(statue);
            if (player.draggingBody === e) {
                player.draggingBody = statue;
                statue.draggedBy = player;
            }
            statues.push(statue);
            spawnParticles(e.x, e.y, "#6b7280", 15);
            const i = enemies.indexOf(e);
            if (i >= 0) enemies.splice(i, 1);
        }

        function callReinforcements(bx, by, source) {
            const now = performance.now();
            const candidates = enemies
                .filter(other =>
                    other !== source && !other.downed &&
                    other.special !== "vip" &&
                    !(other.special === "guard" && other.bodyguard) &&
                    !other.escorting && !other.bunkerGuard && !other.prisonGuard &&
                    !other.checkingCabin &&
                    other.state !== "alert" &&
                    !(other.reinforcement && other.reinforcement.timer > 0) &&
                    !(other.lastCalledAt && now - other.lastCalledAt < ENEMY_CALL_COOLDOWN)
                )
                .map(other => ({ other, d: dist(other.x, other.y, bx, by) }))
                .sort((a, b) => a.d - b.d)
                .slice(0, 3);
            for (const { other } of candidates) {
                other.state = "alert";
                other.stateTimer = 20;
                other.lastSeen = { x: bx, y: by };
                other.suspicionPoint = { x: bx, y: by };
                other.searchPoint = { x: bx + (Math.random() - 0.5) * 200, y: by + (Math.random() - 0.5) * 200 };
                other.searchPointTimer = 2 + Math.random() * 2;
                other.reinforcement = { timer: 15, cx: bx, cy: by };
                other.radioCallTimer = 1.5;
                other.lastCalledAt = now;
                addFloatingText(other.x, other.y - 30, "📻 ¡Copia!", "#fbbf24");
            }
        }

        function handleInteract() {
            if (phase !== "combat" || shopOpen || extraction.active || helpOpen || prisonPuzzle.active || chestPuzzle.active) return;
            if (rcCar.active) return;
            if (!chestState.opened && level1.chest) {
                if (dist(player.x, player.y, level1.chest.x, level1.chest.y) < 70) { openChestPuzzle(); return; }
            }
            if (!prisonUnlocked && prisonDoor) {
                const dx = prisonDoor.x + prisonDoor.w / 2;
                const dy = prisonDoor.y + prisonDoor.h / 2;
                if (dist(player.x, player.y, dx, dy) < 80) { openPrisonPuzzle(); return; }
            }
            if (shopPos && dist(player.x, player.y, shopPos.x, shopPos.y) < 70) openShop();
        }

        const SHOP_STOCK = { pistol: 1, silencer: 1, frag: 3, smoke: 3, ammo: 5, stone: 5, ham: 5, choripan: 3, roastbeef: 2, parrillada: 1, mine: 3, lighter: 1, nails: 5, rc_car: 1 };
        const SHOP_PRICES = { pistol: 500, silencer: 300, frag: 1000, smoke: 800, ammo: 50, stone: 20, ham: 75, choripan: 150, roastbeef: 190, parrillada: 1000, mine: 550, lighter: 815, nails: 50, rc_car: 600 };
        function canBuy(id) {
            if (SHOP_STOCK[id] <= 0) return false;
            if (player.money < SHOP_PRICES[id]) return false;
            if (id === "pistol" && player.hasPistol) return false;
            if (id === "silencer" && (!player.hasPistol || player.hasSilencer)) return false;
            if (id === "ammo" && !player.hasPistol) return false;
            if (id === "lighter" && player.lighters > 0) return false;
            return true;
        }
        function buyItem(id) {
            if (!canBuy(id)) return;
            player.money -= SHOP_PRICES[id];
            SHOP_STOCK[id]--;
            SoundFX.pickup();
            if (id === "pistol") { player.hasPistol = true; player.pistolAmmo = 15; player.selectedItem = "pistol"; showItemLegend("PISTOLA · 15", "#fbbf24"); }
            else if (id === "silencer") player.hasSilencer = true;
            else if (id === "frag") player.grenades.frag += 2;
            else if (id === "smoke") player.grenades.smoke += 2;
            else if (id === "stone") player.stones += 5;
            else if (id === "ham") player.hams += 2;
            else if (id === "choripan") player.choripanes += 1;
            else if (id === "roastbeef") player.roastbeefs += 1;
            else if (id === "parrillada") player.parrilladas += 1;
            else if (id === "mine") player.mines += 2;
            else if (id === "ammo") player.pistolAmmo += 15;
            else if (id === "lighter") player.lighters = 1;
            else if (id === "nails") player.nails += 2;
            else if (id === "rc_car") player.rcCars += 1;
            updateHUD();
            renderShop();
        }
        function renderShop() {
            shopMoneyEl.textContent = `$${player.money}`;
            const items = [
                { id: "pistol", icon: "🔫", name: "Glock 17 Réplica", desc: "Un arma automática con 15 balas \"gratis\"" },
                { id: "silencer", icon: "🎯", name: "Silenciador", desc: "No funciona muy bien, no podés comprarlo si no tenés la Glock que está arriba" },
                { id: "frag", icon: "💣", name: "Granadas de Fragmentación 2x1!", desc: "Explota hasta el núcleo de la tierra" },
                { id: "smoke", icon: "💨", name: "Granadas de Humo", desc: "No testeadas en animales" },
                { id: "mine", icon: "💥", name: "Minas Claymore", desc: "La pisás y KBOOM! Bueno, los enemigos, vos no, dah... Dios mio" },
                { id: "stone", icon: "🪨", name: "Piedras de Piedra", desc: "Para distraer enemigos, y golpearlos" },
                { id: "ham", icon: "🍖", name: "Jamón Crudo", desc: "Para el perro, no para vos" },
                { id: "choripan", icon: "🌭", name: "Choripan", desc: "Recién hechos, un manjar para el cachorro" },
                { id: "roastbeef", icon: "🥩", name: "Roast Beef", desc: "Van a estar un buen rato disfrutando" },
                { id: "parrillada", icon: "🍢", name: "Parrillada", desc: "Despreocupate de los molestos perros" },
                { id: "ammo", icon: "📦", name: "Munición x15", desc: "Balas usadas de soldados caidos" },
                { id: "lighter", icon: "🔥", name: "Encendedor + Nafta super", desc: "Usar con responsabilidad, no quemar todos los árboles" },
                { id: "nails", icon: "🔩", name: "Clavos Oxidados x2", desc: "Cansado de la patrulla? ¡Pinchale las gomas a los molestos!" },
                { id: "rc_car", icon: "🚗", name: "Auto RC de Temu", desc: "No es el mejor, pero está lindo, ah, tiene bocina!" },
            ];
            shopItemsEl.innerHTML = "";
            for (const item of items) {
                const available = canBuy(item.id);
                const div = document.createElement("div");
                div.className = "shop-item" + (available ? "" : " disabled");
                div.innerHTML = `<span class="item-icon">${item.icon}</span>
          <div><div class="item-name">${item.name}</div><div class="item-desc">${item.desc}</div></div>
          <span class="item-price">$${SHOP_PRICES[item.id]}</span>
          <span class="item-stock">x${SHOP_STOCK[item.id]}</span>`;
                if (available) {
                    div.addEventListener("click", () => buyItem(item.id));
                    div.addEventListener("mouseenter", () => SoundFX.shopNavigate());
                }
                shopItemsEl.appendChild(div);
            }
        }
        function openShop() { shopOpen = true; overlay.classList.add("hidden"); shopOverlay.classList.remove("hidden"); SoundFX.shopEnter(); renderShop(); }
        function closeShop() { shopOpen = false; shopOverlay.classList.add("hidden"); SoundFX.shopExit(); }
        function openHelp() { helpOpen = true; helpOverlay.classList.remove("hidden"); SoundFX.shopEnter(); }
        function closeHelp() { helpOpen = false; helpOverlay.classList.add("hidden"); SoundFX.shopExit(); }

        const level1 = {
            walls: [
                { x: 500, y: 400, w: 30, h: 180 }, { x: 850, y: 750, w: 200, h: 30 },
                { x: 2400, y: 350, w: 30, h: 200 }, { x: 2300, y: 950, w: 200, h: 30 },
                { x: 600, y: 1200, w: 250, h: 30 }, { x: 2000, y: 1400, w: 250, h: 30 },
                { x: 2800, y: 800, w: 30, h: 200 }, { x: 2800, y: 1450, w: 200, h: 30 },
                { x: 2950, y: 500, w: 30, h: 200 }, { x: 1000, y: 300, w: 150, h: 20 },
                { x: 1050, y: 900, w: 20, h: 150 }, { x: 1700, y: 1050, w: 150, h: 20 },
                { x: 900, y: 1550, w: 20, h: 150 }, { x: 2200, y: 600, w: 20, h: 150 },
                { x: 2600, y: 1750, w: 150, h: 20 }, { x: 500, y: 850, w: 20, h: 150 },
                { x: 150, y: 1700, w: 20, h: 200 }, { x: 150, y: 1700, w: 300, h: 20 },
                { x: 430, y: 1700, w: 20, h: 130 }, { x: 150, y: 1900, w: 100, h: 20 },
                { x: 1350, y: 250, w: 480, h: 20 }, { x: 1350, y: 250, w: 20, h: 330 },
                { x: 1810, y: 250, w: 20, h: 330 },
                { x: 1350, y: 560, w: 210, h: 20 },
                { x: 1700, y: 560, w: 130, h: 20 },
                { x: CABIN.x, y: CABIN.y, w: CABIN.w, h: 15 },
                { x: CABIN.x + CABIN.w - 15, y: CABIN.y, w: 15, h: CABIN.h },
                { x: CABIN.x, y: CABIN.y + CABIN.h - 15, w: CABIN.w, h: 15 },
                { x: CABIN.x, y: CABIN.y + 15, w: 15, h: CABIN.doorY1 - CABIN.y - 15 },
                { x: CABIN.x, y: CABIN.doorY2, w: 15, h: Math.max(0, CABIN.h - (CABIN.doorY2 - CABIN.y) - 15) },
            ],
            houses: [
                { x: 600, y: 550, w: 130, h: 90 }, { x: 2400, y: 500, w: 140, h: 100 },
                { x: 800, y: 1300, w: 120, h: 90 }, { x: 1800, y: 700, w: 130, h: 100 },
                { x: 2600, y: 1250, w: 120, h: 90 }, { x: 400, y: 1000, w: 110, h: 80 },
                { x: 2250, y: 850, w: 120, h: 90 }, { x: 1200, y: 1600, w: 140, h: 100 },
                { x: 2000, y: 1600, w: 120, h: 90 }, { x: 2900, y: 1000, w: 110, h: 80 },
            ],
            trees: [
                { x: 350, y: 500, w: 40, h: 40 }, { x: 900, y: 200, w: 40, h: 40 },
                { x: 1200, y: 550, w: 40, h: 40 }, { x: 2100, y: 300, w: 40, h: 40 },
                { x: 2500, y: 250, w: 40, h: 40 }, { x: 400, y: 750, w: 40, h: 40 },
                { x: 700, y: 950, w: 40, h: 40 }, { x: 1000, y: 1150, w: 40, h: 40 },
                { x: 1500, y: 800, w: 40, h: 40 }, { x: 2050, y: 900, w: 40, h: 40 },
                { x: 2400, y: 700, w: 40, h: 40 }, { x: 2750, y: 400, w: 40, h: 40 },
                { x: 3050, y: 700, w: 40, h: 40 }, { x: 550, y: 1450, w: 40, h: 40 },
                { x: 1350, y: 1400, w: 40, h: 40 }, { x: 1700, y: 1550, w: 40, h: 40 },
                { x: 2400, y: 1500, w: 40, h: 40 }, { x: 2850, y: 1650, w: 40, h: 40 },
                { x: 300, y: 1350, w: 40, h: 40 }, { x: 3050, y: 1300, w: 40, h: 40 },
            ],
            rocks: [
                { x: 900, y: 450, w: 30, h: 30 }, { x: 1750, y: 550, w: 30, h: 30 },
                { x: 2500, y: 900, w: 30, h: 30 }, { x: 700, y: 1150, w: 30, h: 30 },
                { x: 1300, y: 1200, w: 30, h: 30 }, { x: 1900, y: 1350, w: 30, h: 30 },
                { x: 2600, y: 1600, w: 30, h: 30 }, { x: 400, y: 600, w: 30, h: 30 },
                { x: 2850, y: 700, w: 30, h: 30 }, { x: 1650, y: 1250, w: 30, h: 30 },
            ],
            flags: [{ x: 1600, y: 1050 }],
            vip: { x: 1580, y: 410 },
            papers: [
                { x: 800, y: 300 }, { x: 2000, y: 200 }, { x: 2600, y: 700 },
                { x: 2900, y: 1200 }, { x: 500, y: 1200 }, { x: 1500, y: 1500 },
                { x: 2200, y: 1750 }, { x: 1000, y: 1800 },
            ],
            base: { x: 250, y: 1800 },
            chest: { x: 1500, y: 1850 },
            enemyBase: { x: 3100, y: 100 },
            playerStart: { x: 250, y: 1800 },
            shopPos: { x: 350, y: 1800 },
            enemies: [
                { x: 700, y: 400 }, { x: 1000, y: 600 }, { x: 1300, y: 900 },
                { x: 1800, y: 900 }, { x: 2100, y: 1100 }, { x: 2400, y: 1200 },
                { x: 800, y: 1000 }, { x: 1100, y: 1350 }, { x: 1900, y: 1550 },
                { x: 2600, y: 1000 }, { x: 2850, y: 1300 }, { x: 500, y: 800 },
            ],
            packs: [
                { x: 900, y: 700, type: "health" }, { x: 1500, y: 300, type: "ammo" },
                { x: 2200, y: 1000, type: "health" }, { x: 2800, y: 1500, type: "ammo" },
                { x: 600, y: 1500, type: "health" }, { x: 1800, y: 1800, type: "ammo" },
            ],
            carWaypoints: [
                { x: 500, y: 1850 }, { x: 3000, y: 1850 }, { x: 3150, y: 1700 },
                { x: 3150, y: 300 }, { x: 3000, y: 150 }, { x: 500, y: 150 },
                { x: 200, y: 350 }, { x: 200, y: 1200 }, { x: 200, y: 1600 },
                { x: 500, y: 1600 },
            ],
            carStart: { x: 500, y: 1850 },
        };

        function initMenu() {
            phase = "menu";
            overlay.classList.remove("hidden");

            ovTitle.innerHTML = `PichMan Series:<br><strong><em>El Rescate del Pichón</em></strong>`;
            ovTitle.style.textAlign = "center";

            ovText.innerHTML = `
        <strong>MISIÓN:</strong> Eliminá al Objetivo, recolectá los 8 documentos, tomá la bandera y rescatá al Pichón.<br>
        <strong>WASD</strong> caminar (sigiloso) · <strong>SHIFT</strong> correr (te detectarán)<br>
        <strong>Mouse</strong> apuntar · <strong>Scroll</strong> seleccionar ítem · <strong>Click</strong> usar ítem<br>
        <strong>Espacio</strong> patada · <strong>F</strong> cuchillo · <strong>R</strong> lanzar piedra · <strong>Q</strong> arrastrar<br>
        <strong>E</strong> tienda / interactuar<br><br>
        <strong>Tenés 10 minutos para completar la misión.</strong>
    `;
            ovBtn.textContent = "Iniciar Misión: Rescate del Pichón";
            onClickAction = () => initCombat();

            let ovCredits = document.getElementById("ovCredits");
            if (!ovCredits) {
                ovCredits = document.createElement("div");
                ovCredits.id = "ovCredits";
                ovBtn.after(ovCredits);
            }

            ovCredits.textContent = "Developed by MofetaStudios - Powered by PichonCode";
            ovCredits.style.color = "#888888";
            ovCredits.style.fontStyle = "italic";
            ovCredits.style.fontSize = "14px";
            ovCredits.style.textAlign = "center";
            ovCredits.style.marginTop = "12px";
            ovCredits.style.display = "block";

            ctx.fillStyle = "#050810";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }

        function setupPrison() {
            walls.push(
                { x: 180, y: 150, w: 190, h: 15 },
                { x: 180, y: 150, w: 15, h: 140 },
                { x: 355, y: 150, w: 15, h: 140 },
                { x: 180, y: 275, w: 75, h: 15 },
                { x: 295, y: 275, w: 75, h: 15 }
            );
            prisonDoor = { x: 255, y: 275, w: 40, h: 15, isPrisonDoor: true };
            walls.push(prisonDoor);
            prisonUnlocked = false;
            prisoner = {
                x: 275, y: 210, r: 12, hp: 150, maxHp: 150,
                following: false, rescued: false, atBase: false, hurtFlash: 0, angle: Math.PI / 2
            };
            for (let i = 0; i < PRISON_GUARD_COUNT; i++) {
                const angle = (i / PRISON_GUARD_COUNT) * Math.PI * 2;
                const radius = 180;
                const gx = Math.max(40, Math.min(WORLD_W - 40, 275 + Math.cos(angle) * radius));
                const gy = Math.max(40, Math.min(WORLD_H - 40, 220 + Math.sin(angle) * radius));
                enemies.push({
                    x: gx, y: gy, r: 14, hp: 60, maxHp: 60, type: "soldier",
                    speed: BOT_IDLE_SPEED, cooldown: 1.2,
                    angle: Math.PI / 2, facing: angle + Math.PI,
                    hurtFlash: 0, state: "idle", stateTimer: 0,
                    detectionLevel: 0, canSee: false,
                    suspicionPoint: null, lastSeen: null,
                    patrolCenter: { x: gx, y: gy }, patrolRadius: 40,
                    patrolPhase: Math.random() * Math.PI * 2,
                    lookAroundTimer: Math.random() * 2, lookAroundBase: angle + Math.PI,
                    searchSweep: 0, downed: false, downedTimer: 0, reviveTimer: 0,
                    bodyguard: false, escorting: false, prisonGuard: true,
                });
            }
            prisonPuzzle.active = false; prisonPuzzle.input = ""; prisonPuzzle.wrongFlash = 0;
        }

        function initCombat() {
            cheatBuffer = "";
            usedCheats = { carrefour: false, bucks: false, modopro: false };
            player.draggingBody = null;
            player.backstab = null;
            phase = "combat";
            shake = 0; knifeCooldown = 0; knifeFlash = 0;
            kickCooldown = 0; kickFlash = 0;
            helpOpen = false; helpOverlay.classList.add("hidden");
            missionTimeLeft = 600;
            emergencyProtocol = false;
            MAX_ENEMIES = 12; ENEMY_RESPAWN_INTERVAL = 6;
            itemLegend = { text: "", color: "", life: 0, maxLife: 1 };
            bodyAlertSoundTimer = 0;
            lastNoiseEventTime = 0;
            footstepTimer = 0;
            rcGlitchSoundTimer = 0;
            rcHonkCooldown = 0;
            reinforcementCalledTimer = 0;
            extraction.active = false; extraction.paused = false;
            extraction.input = ""; extraction.wrongFlash = 0;
            chestPuzzle.active = false; chestPuzzle.input = ""; chestPuzzle.wrongFlash = 0;
            chestState.opened = false;
            rushTimer.active = false; rushTimer.timeLeft = 0;
            rushTimer.warned30 = false; rushTimer.warned10 = false;
            stats.startTime = performance.now(); stats.endTime = 0;
            stats.detections = 0; stats.kills = 0; stats.vipKilled = false;
            stats.foodThrown = 0; stats.shots = 0; stats.grenadesThrown = 0; stats.stonesThrown = 0;
            keypadLayout = randomKeypad();

            vipDeathTimer = 0;
            vipDeathPos = null;
            cabinCheckBot = null;
            cabinCheckReassignTimer = 0;

            burningTrees = []; placedNails = []; skidmarks = [];
            rcCar.active = false; rcCar.exploded = false; rcCar.signal = 1;
            rcCar.signalLostTimer = 0; rcCar.parked = false; rcCar.honkFlash = 0;
            canvas.style.filter = '';

            player.x = level1.playerStart.x; player.y = level1.playerStart.y;
            player.r = 14; player.hp = player.maxHp;
            player.angle = -Math.PI / 2;
            player.shootCooldown = 0; player.hurtFlash = 0; player.throwCooldown = 0;
            player.money = 815;
            player.hasPistol = false; player.hasSilencer = false;
            player.pistolAmmo = 0;
            player.selectedItem = null;
            player.grenades.frag = 0; player.grenades.smoke = 0;
            player.stones = 10;
            player.hams = 0; player.choripanes = 0; player.roastbeefs = 0; player.parrilladas = 0;
            player.mines = 0;
            player.lighters = 0; player.nails = 0; player.rcCars = 0;

            SHOP_STOCK.pistol = 1; SHOP_STOCK.silencer = 1;
            SHOP_STOCK.frag = 3; SHOP_STOCK.smoke = 3; SHOP_STOCK.ammo = 5;
            SHOP_STOCK.stone = 5; SHOP_STOCK.ham = 5;
            SHOP_STOCK.choripan = 3; SHOP_STOCK.roastbeef = 2; SHOP_STOCK.parrillada = 1;
            SHOP_STOCK.mine = 3;
            SHOP_STOCK.lighter = 1; SHOP_STOCK.nails = 5; SHOP_STOCK.rc_car = 1;
            shopOpen = false; shopOverlay.classList.add("hidden");

            bullets = []; projectiles = []; droppedStones = []; droppedFoods = []; droppedAmmo = [];
            grills = []; placedMines = []; explosions = []; smokes = [];
            enemies = []; effects = []; statues = []; floatingTexts = []; notifications = [];
            enemyCars = []; dogs = [];

            moneyPacks = [];
            for (let i = 0; i < 10; i++) {
                moneyPacks.push({
                    x: 300 + Math.random() * (WORLD_W - 600),
                    y: 300 + Math.random() * (WORLD_H - 600),
                    amount: 100
                });
            }
            papers = []; papersCollected = 0;
            exitCode = ""; exitCodeRevealed = false; vipDead = false;

            walls = level1.walls.map(w => ({ ...w }));
            houses = level1.houses.map(h => ({ ...h }));
            trees = level1.trees.map(t => ({ ...t, burning: false, burnTimer: 0, burned: false }));
            rocks = level1.rocks.map(r => ({ ...r }));
            rebuildShadows();

            combatFlags = level1.flags.map(f => ({
                x: f.x, y: f.y, radius: 70, owner: "neutral", progress: 0, captureTime: COMBAT_CAPTURE_TIME,
            }));

            for (const ppos of level1.papers) {
                papers.push({ x: ppos.x, y: ppos.y, digit: Math.floor(Math.random() * 10), collected: false });
            }
            shopPos = { ...level1.shopPos };
            packs = level1.packs.map(p => ({ ...p, used: false }));
            exitZone = { x: level1.base.x, y: level1.base.y, r: 50 };

            const roles = ["flag1", "flag1", "flag1", "patrol", "patrol", "patrol", "patrol", "patrol", "patrol", "patrol", "patrol", "patrol"];
            for (let i = 0; i < level1.enemies.length; i++) {
                const e = level1.enemies[i];
                const role = roles[i] || "patrol";
                const targetFlag = role === "flag1" ? 0 : -1;
                enemies.push({
                    x: e.x, y: e.y, r: 14, hp: 40, maxHp: 40, type: "soldier",
                    speed: BOT_IDLE_SPEED, cooldown: 1 + Math.random() * 1.5,
                    angle: Math.PI / 2, facing: Math.random() * Math.PI * 2,
                    hurtFlash: 0, state: "idle", stateTimer: 0,
                    detectionLevel: 0, canSee: false,
                    suspicionPoint: null, lastSeen: null,
                    role, targetFlag,
                    wanderTarget: null,
                    patrolCenter: { x: e.x, y: e.y },
                    patrolRadius: 80 + Math.random() * 100,
                    patrolPhase: Math.random() * Math.PI * 2,
                    lookAroundTimer: Math.random() * 3,
                    lookAroundBase: Math.random() * Math.PI * 2,
                    searchSweep: 0, downed: false, downedTimer: 0, reviveTimer: 0,
                });
            }
            enemies.push({
                x: level1.vip.x, y: level1.vip.y, r: 16,
                hp: 200, maxHp: 200, type: "soldier", special: "vip",
                speed: BOT_IDLE_SPEED, cooldown: 1.5, angle: Math.PI / 2,
                facing: Math.random() * Math.PI * 2, hurtFlash: 0,
                state: "idle", stateTimer: 0, detectionLevel: 0, canSee: false,
                suspicionPoint: null, lastSeen: null,
                patrolCenter: { x: level1.vip.x, y: level1.vip.y },
                patrolRadius: 50, patrolPhase: Math.random() * Math.PI * 2,
                lookAroundTimer: 0, lookAroundBase: 0, searchSweep: 0,
                downed: false, downedTimer: 0, reviveTimer: 0, bodyguard: false,
                escorting: false,
                tripActive: false, tripStage: 'idle', tripTimer: 0, tripWaypointIdx: 0,
                eatTimer: 0, tripCooldown: 20 + Math.random() * 20,
            });
            setupBunkerPosts();
            for (let i = 0; i < bunkerPosts.length; i++) {
                const post = bunkerPosts[i];
                const g = {
                    x: post.x, y: post.y, r: 15,
                    hp: 80, maxHp: 80, type: "soldier", special: "bunker_guard",
                    speed: BOT_IDLE_SPEED * (0.8 + Math.random() * 0.4),
                    cooldown: 1.2, angle: Math.PI / 2,
                    facing: Math.PI / 2, hurtFlash: 0,
                    state: "idle", stateTimer: 0, detectionLevel: 0, canSee: false,
                    suspicionPoint: null, lastSeen: null,
                    patrolCenter: { x: post.x, y: post.y }, patrolRadius: 0,
                    patrolPhase: 0, lookAroundTimer: 0, lookAroundBase: Math.PI / 2,
                    searchSweep: 0, sweepPhase: Math.random() * Math.PI * 2,
                    downed: false, downedTimer: 0, reviveTimer: 0,
                    bunkerGuard: true, bunkerPostIdx: i, bunkerWaypoint: null, bodyguard: false,
                };
                enemies.push(g);
                post.occupiedBy = g;
            }
            setupPrison();

            for (let i = 0; i < 8; i++) {
                let dx = 0, dy = 0, valid = false;
                for (let tries = 0; tries < 30; tries++) {
                    dx = 200 + Math.random() * (WORLD_W - 400);
                    dy = 200 + Math.random() * (WORLD_H - 400);
                    if (dist(dx, dy, level1.base.x, level1.base.y) < 500) continue;
                    valid = true;
                    for (const w of [...walls, ...houses, ...rocks]) {
                        if (dx + 40 > w.x && dx - 40 < w.x + w.w && dy + 40 > w.y && dy - 40 < w.y + w.h) {
                            valid = false; break;
                        }
                    }
                    if (valid) break;
                }
                if (valid) spawnDog(dx, dy, dx, dy);
            }
            enemyRespawnTimer = 8;
            packSpawnTimer = PACK_SPAWN_INTERVAL;
            enemyCars.push({
                x: level1.carStart.x, y: level1.carStart.y, r: 20,
                heading: 0, vLong: 0, hp: 100, maxHp: 100,
                cooldown: 2, hurtFlash: 0,
                waypointIdx: 0, state: "patrol", canSee: false,
                stuckTimer: 0, stuckDir: 1, speedMul: 1, disabled: false,
                sirenOn: false, sirenFlash: 0, sirenSoundTimer: 0,
            });

            updateCamera();
            overlay.classList.add("hidden");
            updateHUD();
            SoundFX.startSuspenseMusic(0.55);
        }

        function gameOver() {
            phase = "dead";
            SoundFX.stopMusic(false);
            canvas.style.filter = '';
            overlay.classList.remove("hidden");
            ovTitle.textContent = "El Agente PichMan murió";
            ovText.innerHTML = `Intentá de nuevo, soldado.`;
            ovBtn.textContent = "REINTENTAR";
            onClickAction = () => initCombat();

            const ovCredits = document.getElementById("ovCredits");
            if (ovCredits) {
                ovCredits.style.display = "none";
            }
        }

        function formatTime(ms) {
            const total = Math.floor(ms / 1000);
            const m = Math.floor(total / 60);
            const s = total % 60;
            return `${m}m ${String(s).padStart(2, "0")}s`;
        }

        function winGame() {
            phase = "win";
            stats.endTime = performance.now();
            SoundFX.stopMusic(false);
            canvas.style.filter = '';
            overlay.classList.remove("hidden");
            ovTitle.textContent = "🏆 MISIÓN COMPLETA";
            const elapsed = stats.endTime - stats.startTime;
            const stealth = Math.max(0, 100 - stats.detections * 10);
            ovText.innerHTML = `
        <div class="stats-grid">
          <div class="lbl">⏱️ Tiempo total:</div><div class="val">${formatTime(elapsed)}</div>
          <div class="lbl">💀 Bajas totales:</div><div class="val">${stats.kills}</div>
          <div class="lbl">👁️ Nivel de sigilo:</div><div class="val">${stealth}%</div>
          <div class="lbl">🍖 Comida lanzada:</div><div class="val">${stats.foodThrown}</div>
          <div class="lbl">🔫 Disparos:</div><div class="val">${stats.shots}</div>
          <div class="lbl">💣 Granadas:</div><div class="val">${stats.grenadesThrown}</div>
          <div class="lbl">🪨 Piedras:</div><div class="val">${stats.stonesThrown}</div>
        </div>
        <strong>CÓDIGO DE EXTRACCIÓN: ${exitCode}</strong><br><br>
        <strong>¡Misión cumplida, comandante!</strong>
      `;
            ovBtn.textContent = "JUGAR DE NUEVO";
            onClickAction = () => initMenu();
        }

        const getSolids = () => [...walls, ...houses, ...rocks];

        function tryMoveEntity(entity, dx, dy, checkEnemies = false) {
            const solids = getSolids();
            let movedAny = false;

            const nx = entity.x + dx;
            let blockedX = false;
            for (const s of solids) if (circleRect(nx, entity.y, entity.r, s)) { blockedX = true; break; }
            if (!blockedX && checkEnemies) {
                for (const other of enemies) {
                    if (other === entity || other.downed) continue;
                    if (Math.hypot(nx - other.x, entity.y - other.y) < entity.r + other.r - 2) { blockedX = true; break; }
                }
            }
            if (!blockedX) { entity.x = nx; movedAny = true; }

            const ny = entity.y + dy;
            let blockedY = false;
            for (const s of solids) if (circleRect(entity.x, ny, entity.r, s)) { blockedY = true; break; }
            if (!blockedY && checkEnemies) {
                for (const other of enemies) {
                    if (other === entity || other.downed) continue;
                    if (Math.hypot(entity.x - other.x, ny - other.y) < entity.r + other.r - 2) { blockedY = true; break; }
                }
            }
            if (!blockedY) { entity.y = ny; movedAny = true; }

            return movedAny;
        }

        function separateOverlappingEnemies() {
            for (let i = 0; i < enemies.length; i++) {
                const a = enemies[i];
                if (a.downed) continue;
                for (let j = i + 1; j < enemies.length; j++) {
                    const b = enemies[j];
                    if (b.downed) continue;
                    const d = dist(a.x, a.y, b.x, b.y);
                    const minD = a.r + b.r + 10;
                    if (d < minD && d > 0.001) {
                        const overlap = (minD - d) * 0.5;
                        const angle = Math.atan2(b.y - a.y, b.x - a.x);
                        const ax = a.x - Math.cos(angle) * overlap;
                        const ay = a.y - Math.sin(angle) * overlap;
                        const bx = b.x + Math.cos(angle) * overlap;
                        const by = b.y + Math.sin(angle) * overlap;
                        let aOk = true, bOk = true;
                        for (const s of getSolids()) {
                            if (circleRect(ax, ay, a.r, s)) { aOk = false; }
                            if (circleRect(bx, by, b.r, s)) { bOk = false; }
                        }
                        if (aOk) { a.x = Math.max(20 + a.r, Math.min(WORLD_W - 20 - a.r, ax)); a.y = Math.max(20 + a.r, Math.min(WORLD_H - 20 - a.r, ay)); }
                        if (bOk) { b.x = Math.max(20 + b.r, Math.min(WORLD_W - 20 - b.r, bx)); b.y = Math.max(20 + b.r, Math.min(WORLD_H - 20 - b.r, by)); }
                    }
                }
            }
        }

        function alertNearby(source, radius) {
            const now = performance.now();
            const candidates = [];
            for (const other of enemies) {
                if (other === source || other.downed) continue;
                if (other.state === "alert" || other.state === "suspicious") continue;
                if (other.special === "vip") continue;
                if (other.special === "guard" && other.bodyguard) continue;
                if (other.escorting || other.bunkerGuard || other.cabinGuard) continue;
                if (other.checkingCabin) continue;
                if (other.reinforcement && other.reinforcement.timer > 0) continue;
                if (other.lastCalledAt && now - other.lastCalledAt < ENEMY_CALL_COOLDOWN) continue;
                if (dist(source.x, source.y, other.x, other.y) < radius) candidates.push(other);
            }
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }
            const selected = candidates.slice(0, MAX_INVESTIGATORS_PER_EVENT);
            for (const other of selected) {
                other.state = "suspicious";
                other.suspicionPoint = { x: source.x, y: source.y };
                other.stateTimer = 4;
                other.facing = Math.atan2(source.y - other.y, source.x - other.x);
                other.lastCalledAt = now;
            }
        }

        function updateBotPerception(e, dt) {
            if (e.downed) { e.canSee = false; return; }
            let canSeeNow = false, gain = 0;
            if (!isPlayerHidden()) {
                let inSmoke = false;
                for (const s of smokes) if (dist(e.x, e.y, s.x, s.y) < s.r * 0.85) { inSmoke = true; break; }
                if (!inSmoke) {
                    const d = dist(e.x, e.y, player.x, player.y);
                    let visionRange = (e.special === "guard" || e.bunkerGuard || e.cabinGuard) ? VISION_RANGE * 1.15 : VISION_RANGE;
                    if (emergencyProtocol) visionRange *= 1.4;
                    if (d < CLOSE_RANGE_360) {
                        if (hasLineOfSight(e.x, e.y, player.x, player.y)) { canSeeNow = true; gain = 3; }
                    } else if (d < visionRange) {
                        const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x);
                        let diff = angleToPlayer - e.facing;
                        while (diff > Math.PI) diff -= Math.PI * 2;
                        while (diff < -Math.PI) diff += Math.PI * 2;
                        const absDiff = Math.abs(diff);
                        if (absDiff < VISION_ANGLE / 2) {
                            if (hasLineOfSight(e.x, e.y, player.x, player.y)) {
                                canSeeNow = true;
                                gain = (1 + (1 - d / visionRange) * 1.5) * (emergencyProtocol ? 1.6 : 1);
                            }
                        } else if (absDiff < PERIPHERAL_ANGLE / 2 && d < PERIPHERAL_RANGE) {
                            if (hasLineOfSight(e.x, e.y, player.x, player.y)) { canSeeNow = true; gain = 0.35; }
                        }
                    }
                }
            }
            if (!canSeeNow && prisoner && (prisoner.following || prisoner.atBase)) {
                let visionRange = (e.special === "guard" || e.bunkerGuard || e.cabinGuard) ? VISION_RANGE * 1.15 : VISION_RANGE;
                if (emergencyProtocol) visionRange *= 1.4;
                const dP = dist(e.x, e.y, prisoner.x, prisoner.y);
                if (dP < visionRange) {
                    const angleToP = Math.atan2(prisoner.y - e.y, prisoner.x - e.x);
                    let diff = angleToP - e.facing;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    if (Math.abs(diff) < VISION_ANGLE / 2) {
                        let inSmoke = false;
                        for (const s of smokes) if (dist(prisoner.x, prisoner.y, s.x, s.y) < s.r * 0.85) { inSmoke = true; break; }
                        if (!inSmoke && !isInShadow(prisoner.x, prisoner.y) && hasLineOfSight(e.x, e.y, prisoner.x, prisoner.y)) {
                            canSeeNow = true; gain = 0.8;
                        }
                    }
                }
            }
            if (!e.checkingCabin) {
                let visionRange = (e.special === "guard" || e.bunkerGuard || e.cabinGuard) ? VISION_RANGE * 1.15 : VISION_RANGE;
                if (emergencyProtocol) visionRange *= 1.4;
                const corpseVisionRange = visionRange * CORPSE_VISION_MULT;
                const bodies = [];
                for (const other of enemies) if (other !== e && other.downed) bodies.push({ x: other.x, y: other.y, obj: other });
                for (const st of statues) {
                    bodies.push({ x: st.x + st.w / 2, y: st.y + st.h / 2, obj: st });
                }
                for (const body of bodies) {
                    if (body.obj.bodyDiscovered) continue;
                    if (isBodyHidden(body.x, body.y)) continue;
                    const dB = dist(e.x, e.y, body.x, body.y);
                    if (dB < corpseVisionRange) {
                        const angleToBody = Math.atan2(body.y - e.y, body.x - e.x);
                        let diff = angleToBody - e.facing;
                        while (diff > Math.PI) diff -= Math.PI * 2;
                        while (diff < -Math.PI) diff += Math.PI * 2;
                        if (Math.abs(diff) < VISION_ANGLE / 2) {
                            if (hasLineOfSight(e.x, e.y, body.x, body.y)) {
                                if (body.obj.isVipCorpse && !emergencyProtocol) {
                                    body.obj.bodyDiscovered = true;
                                    activateEmergencyProtocol();
                                    showNotification("¡Encontraron el cuerpo del Objetivo!", "#ef4444", 4);
                                    for (const e2 of enemies) e2.checkingCabin = false;
                                    if (bodyCamera.isCabinCheck) { bodyCamera.active = false; bodyCamera.bot = null; }
                                    cabinCheckBot = null;
                                    reinforcementCalledTimer = 0;
                                    break;
                                }
                                if (e.state !== "alert") {
                                    if (!bodyCameraShown.has(body.obj)) {
                                        bodyCameraShown.add(body.obj);
                                        bodyCamera = { active: true, bot: e, timer: 4, duration: 4, isCabinCheck: false };
                                        SoundFX.beep();
                                    }
                                    if (e.state !== "suspicious" && e.state !== "investigating_body") {
                                        e.state = "suspicious";
                                        e.suspicionPoint = { x: body.x, y: body.y };
                                        e.stateTimer = 6;
                                    }
                                    if (dB < CORPSE_CONFIRM_RANGE) {
                                        e.state = "alert";
                                        e.stateTimer = 8;
                                        e.lastSeen = { x: body.x + (Math.random() - 0.5) * 150, y: body.y + (Math.random() - 0.5) * 150 };
                                        e.suspicionPoint = { x: e.lastSeen.x, y: e.lastSeen.y };
                                        e.searchPoint = null;
                                        alertNearby(e, emergencyProtocol ? 600 : 350);
                                        body.obj.bodyDiscovered = true;
                                        e.radioCallTimer = 2.5;
                                        SoundFX.radioCall();
                                        callReinforcements(body.x, body.y, e);
                                        if (!bodyAlertSoundPlayed.has(body.obj) && bodyAlertSoundTimer <= 0) {
                                            bodyAlertSoundPlayed.add(body.obj);
                                            bodyAlertSoundTimer = 3.0;
                                            SoundFX.emergency();
                                        }
                                        if (body.obj.downedTimer !== undefined && body.obj.downed) {
                                            body.obj.downed = false;
                                            body.obj.reviveTimer = 0;
                                            body.obj.hp = Math.floor(body.obj.maxHp * 0.5);
                                            body.obj.state = "idle";
                                            body.obj.detectionLevel = 0;
                                            spawnParticles(body.obj.x, body.obj.y, "#22c55e", 15);
                                            addFloatingText(body.obj.x, body.obj.y - 30, "¡Revivido!", "#22c55e");
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
            e.canSee = canSeeNow;
            if (canSeeNow) {
                e.lastSeen = { x: player.x, y: player.y };
                e.detectionLevel = Math.min(1, e.detectionLevel + gain * dt);
            } else {
                e.detectionLevel = Math.max(0, e.detectionLevel - dt * 0.6);
            }
            if (e.detectionLevel >= 1) {
                if (e.state !== "alert") {
                    e.state = "alert";
                    e.stateTimer = 2.5;
                    if (!e._playerDetected) { stats.detections++; e._playerDetected = true; }
                    alertNearby(e, emergencyProtocol ? 700 : 400);
                    if ((e.special === "guard" || e.bunkerGuard) && dogs.length === 0) releaseDog();
                }
                e.stateTimer = 2.5;
            } else if (e.detectionLevel > 0.3 && e.state !== "alert") {
                if (e.state !== "suspicious") {
                    e.state = "suspicious";
                    e.suspicionPoint = e.lastSeen || { x: e.x, y: e.y };
                    e.stateTimer = 3;
                }
            } else if (e.state === "alert") {
                e.stateTimer -= dt;
                if (e.stateTimer <= 0) {
                    e.state = "suspicious";
                    e.suspicionPoint = e.lastSeen || { x: e.x, y: e.y };
                    e.stateTimer = 4;
                }
            } else if (e.state === "suspicious") {
                e.stateTimer -= dt;
                if (e.stateTimer <= 0) { e.state = "idle"; e.suspicionPoint = null; }
            }

            if (e.mapWideSearch) {
                e.state = "alert";
                e.stateTimer = 999;
                e.detectionLevel = 1;
            }
        }

        function updateBotAI(e, dt) {
            if (e.downed) {
                if (player.draggingBody !== e) {
                    e.downedTimer -= dt;
                    if (e.downedTimer <= 0) finalizeEnemy(e);
                }
                return;
            }
            if (e.checkingCabin && e.state !== "alert" && !(e.pushTimer && e.pushTimer > 0)) {
                if (!vipDeathPos) {
                    e.checkingCabin = false;
                    if (bodyCamera.bot === e) { bodyCamera.active = false; bodyCamera.bot = null; }
                } else {
                    const enteringWalk = (e.cabinCheckPhase === 'walking' || e.cabinCheckPhase === 'going_back') && e.cabinCheckWaypointIdx >= 5;
                    const isChecking = e.cabinCheckPhase === 'checking';
                    if (enteringWalk || isChecking) {
                        if (!bodyCamera.active || bodyCamera.bot !== e || !bodyCamera.isCabinCheck) {
                            const isNewActivation = !bodyCamera.active || bodyCamera.bot !== e;
                            bodyCamera = { active: true, bot: e, timer: 9999, duration: 9999, isCabinCheck: true };
                            if (isNewActivation) {
                                SoundFX.beep();
                            }
                        } else {
                            bodyCamera.timer = 9999;
                        }
                    } else if (bodyCamera.active && bodyCamera.bot === e && bodyCamera.isCabinCheck) {
                        bodyCamera.active = false;
                        bodyCamera.bot = null;
                    }

                    const DOOR_CX = CABIN.x + 7.5;
                    const DOOR_CY = (CABIN.doorY1 + CABIN.doorY2) / 2;

                    const isSafePos = (x, y) => {
                        for (const s of getSolids()) {
                            if (circleRect(x, y, e.r, s)) return false;
                        }
                        return true;
                    };

                    if (e._cabinPhase !== e.cabinCheckPhase) {
                        e._cabinPhase = e.cabinCheckPhase;
                        e._cabinPhaseTimer = 0;
                    }
                    e._cabinPhaseTimer = (e._cabinPhaseTimer || 0) + dt;
                    if (e._cabinPhaseTimer > 20) {
                        e._cabinPhaseTimer = 0;
                        e._cabinProgressCheck = undefined;
                        if (e.cabinCheckPhase === 'walking') {
                            e.x = VIP_PATH[VIP_PATH.length - 1].x;
                            e.y = VIP_PATH[VIP_PATH.length - 1].y;
                            e.cabinCheckPhase = 'checking';
                            return;
                        } else if (e.cabinCheckPhase === 'returning') {
                            e.x = VIP_PATH[0].x;
                            e.y = VIP_PATH[0].y;
                            e.cabinCheckPhase = 'going_back';
                            e.cabinCheckWaypointIdx = 0;
                            return;
                        } else if (e.cabinCheckPhase === 'going_back') {
                            e.cabinCheckWaypointIdx = VIP_PATH.length;
                        }
                    }

                    const moveTowardWaypoint = (wp, speed) => {
                        if (!wp) return true;
                        const d = dist(e.x, e.y, wp.x, wp.y);
                        if (d < 22) { e._cabinProgressCheck = undefined; return true; }

                        if (!isSafePos(e.x, e.y) && isSafePos(wp.x, wp.y)) {
                            e.x = wp.x;
                            e.y = wp.y;
                            e._cabinProgressCheck = undefined;
                            e.facing = Math.atan2(wp.y - e.y, wp.x - e.x);
                            e.angle = e.facing;
                            return true;
                        }

                        const crossDoor = (e.x < CABIN.x) !== (wp.x < CABIN.x);
                        let targetX = wp.x, targetY = wp.y;
                        if (crossDoor) {
                            const nearDoor = dist(e.x, e.y, DOOR_CX, DOOR_CY) < 25;
                            if (!nearDoor) {
                                targetX = DOOR_CX;
                                targetY = DOOR_CY;
                            }
                        }

                        const td = dist(e.x, e.y, targetX, targetY);
                        const moveAngle = findClearDirection(e, Math.atan2(targetY - e.y, targetX - e.x), Math.min(td + e.r, 90));
                        tryMoveEntity(e, Math.cos(moveAngle) * speed * dt, Math.sin(moveAngle) * speed * dt, false);

                        if (!e._cabinProgressCheck) {
                            e._cabinProgressCheck = { d: d, timer: 0 };
                        }
                        e._cabinProgressCheck.timer += dt;
                        if (e._cabinProgressCheck.timer > 0.3) {
                            const newD = dist(e.x, e.y, wp.x, wp.y);
                            if (e._cabinProgressCheck.d - newD < 5 && isSafePos(wp.x, wp.y)) {
                                e.x = wp.x;
                                e.y = wp.y;
                            }
                            e._cabinProgressCheck = undefined;
                        }

                        e.facing = Math.atan2(wp.y - e.y, wp.x - e.x);
                        e.angle = e.facing;
                        e.x = Math.max(20 + e.r, Math.min(WORLD_W - 20 - e.r, e.x));
                        e.y = Math.max(20 + e.r, Math.min(WORLD_H - 20 - e.r, e.y));
                        return false;
                    };

                    if (e.cabinCheckPhase === 'walking') {
                        const wp = VIP_PATH[e.cabinCheckWaypointIdx];
                        if (!wp) { e.cabinCheckPhase = 'checking'; e._cabinProgressCheck = undefined; return; }
                        if (moveTowardWaypoint(wp, 100)) e.cabinCheckWaypointIdx++;
                        return;
                    }
                    else if (e.cabinCheckPhase === 'checking') {
                        const bodyPos = getVipBodyPos();
                        const cabinCX = CABIN.x + CABIN.w / 2;
                        const cabinCY = CABIN.y + CABIN.h / 2;
                        const bodyHidden = bodyPos && isBodyHidden(bodyPos.x, bodyPos.y);
                        const bodyAtCabin = bodyPos && !bodyHidden && dist(bodyPos.x, bodyPos.y, cabinCX, cabinCY) < 250;
                        if (!bodyAtCabin) {
                            e.cabinCheckPhase = 'returning';
                            e.cabinCheckReturnIdx = VIP_PATH.length - 1;
                            e.state = "suspicious";
                            e.stateTimer = 30;
                            e.detectionLevel = 0.5;
                            e.suspicionPoint = { x: cabinCX, y: cabinCY };
                            e._cabinProgressCheck = undefined;
                            showNotification("El guardia no encuentra el objetivo...", "#fbbf24", 3);
                            return;
                        }
                        const d = dist(e.x, e.y, bodyPos.x, bodyPos.y);
                        if (d < VIP_CORPSE_NOTICE_RANGE) {
                            e.checkingCabin = false;
                            if (bodyCamera.isCabinCheck) { bodyCamera.active = false; bodyCamera.bot = null; }
                            activateEmergencyProtocol();
                            showNotification("¡Encontraron el cuerpo del Objetivo!", "#ef4444", 4);
                            return;
                        }
                        let targetX = bodyPos.x, targetY = bodyPos.y;
                        const botIn = isInsideCabin(e.x, e.y);
                        const targetIn = isInsideCabin(targetX, targetY);
                        if (!botIn && targetIn) {
                            const wp = getCabinEntryWaypoint(e);
                            if (wp) { targetX = wp.x; targetY = wp.y; }
                        } else if (botIn && !targetIn) {
                            const wp = getCabinExitWaypoint(e);
                            if (wp) { targetX = wp.x; targetY = wp.y; }
                        }
                        moveTowardWaypoint({ x: targetX, y: targetY }, 80);
                        return;
                    }
                    else if (e.cabinCheckPhase === 'returning') {
                        if (e.cabinCheckReturnIdx === undefined) e.cabinCheckReturnIdx = VIP_PATH.length - 1;
                        if (e.cabinCheckReturnIdx < 0) {
                            e.cabinCheckPhase = 'questioning_bunker';
                            e.cabinCheckPhaseTimer = 0;
                            e.state = "suspicious";
                            e.stateTimer = 999;
                            e.detectionLevel = 0.4;
                            e.suspicionPoint = { x: e.x + (Math.random() - 0.5) * 30, y: e.y + (Math.random() - 0.5) * 30 };
                            e._cabinProgressCheck = undefined;
                            return;
                        }
                        const wp = VIP_PATH[e.cabinCheckReturnIdx];
                        if (!wp) { e.cabinCheckReturnIdx = -1; return; }
                        if (moveTowardWaypoint(wp, 100)) e.cabinCheckReturnIdx--;
                        return;
                    }
                    else if (e.cabinCheckPhase === 'questioning_bunker') {
                        e.cabinCheckPhaseTimer = (e.cabinCheckPhaseTimer || 0) + dt;
                        const vipAlive = enemies.find(en => en.special === "vip" && !en.downed);
                        if (vipAlive && hasLineOfSight(e.x, e.y, vipAlive.x, vipAlive.y)) {
                            cancelCabinCheckSequence();
                            return;
                        }
                        e.facing = Math.PI / 2 + Math.sin(performance.now() / 600) * 0.6;
                        e.angle = e.facing;
                        if (e.cabinCheckPhaseTimer > 2) {
                            e.cabinCheckPhase = 'called_reinforcements';
                            e.radioCallTimer = 3;
                            SoundFX.radioCall();
                            callBunkerReinforcements(e);
                            return;
                        }
                    }
                    else if (e.cabinCheckPhase === 'called_reinforcements') {
                        const vipAlive = enemies.find(en => en.special === "vip" && !en.downed);
                        if (vipAlive && hasLineOfSight(e.x, e.y, vipAlive.x, vipAlive.y)) {
                            cancelCabinCheckSequence();
                            return;
                        }
                        return;
                    }
                }
            }
            if (e.radioCallTimer && e.radioCallTimer > 0) e.radioCallTimer -= dt;
            if (e.pushTimer && e.pushTimer > 0) {
                e.pushElapsed += dt;
                const p = Math.min(1, e.pushElapsed / e.pushDur);
                const ease = 1 - Math.pow(1 - p, 3);
                const targetX = e.pushStartX + (e.pushToX - e.pushStartX) * ease;
                const targetY = e.pushStartY + (e.pushToY - e.pushStartY) * ease;
                const moveDx = targetX - e.x, moveDy = targetY - e.y;
                const beforeX = e.x, beforeY = e.y;
                tryMoveEntity(e, moveDx, moveDy, false);
                const actualMoved = dist(beforeX, beforeY, e.x, e.y);
                const intendedMoved = Math.hypot(moveDx, moveDy);
                if (intendedMoved > 0.5 && actualMoved < intendedMoved * 0.3) {
                    e.pushTimer = 0; e.pushArc = 0;
                    const moveAngle = Math.atan2(moveDy, moveDx);
                    const bounceDist = Math.min(intendedMoved, 12);
                    tryMoveEntity(e, -Math.cos(moveAngle) * bounceDist, -Math.sin(moveAngle) * bounceDist, false);
                    spawnParticles(e.x, e.y, "#94a3b8", 8);
                    shake = Math.max(shake, 0.08);
                    if (!isPlayerHidden() && hasLineOfSight(e.x, e.y, player.x, player.y)) {
                        e.state = "alert"; e.detectionLevel = 1; e.stateTimer = 4; e.canSee = true;
                    }
                    return;
                }
                e.pushArc = Math.sin(p * Math.PI) * 35;
                e.pushTimer -= dt;
                e.canSee = false;
                e.x = Math.max(20 + e.r, Math.min(WORLD_W - 20 - e.r, e.x));
                e.y = Math.max(20 + e.r, Math.min(WORLD_H - 20 - e.r, e.y));
                if (e.pushTimer <= 0) {
                    e.pushTimer = 0; e.pushArc = 0;
                    if (!isPlayerHidden() && hasLineOfSight(e.x, e.y, player.x, player.y)) {
                        e.state = "alert"; e.detectionLevel = 1; e.stateTimer = 4; e.canSee = true;
                    }
                }
                return;
            }
            if (e.reinforcement) {
                e.reinforcement.timer -= dt;
                if (e.reinforcement.timer <= 0) e.reinforcement = null;
                else {
                    if (e.state !== "alert") { e.state = "alert"; e.stateTimer = 5; }
                    e.stateTimer = Math.max(e.stateTimer, 2);
                    if (!e.canSee && !e.lastSeen) e.lastSeen = { x: e.reinforcement.cx, y: e.reinforcement.cy };
                }
            }
            if (e.extinguishing) {
                let nearestBt = null, nearestDist = 9999;
                for (const bt of burningTrees) {
                    const cx = bt.tree.x + bt.tree.w / 2, cy = bt.tree.y + bt.tree.h / 2;
                    const d = dist(e.x, e.y, cx, cy);
                    if (d < nearestDist) { nearestDist = d; nearestBt = bt; }
                }
                if (!nearestBt) {
                    e.extinguishing = false;
                } else {
                    const cx = nearestBt.tree.x + nearestBt.tree.w / 2;
                    const cy = nearestBt.tree.y + nearestBt.tree.h / 2;
                    if (nearestDist > 70) {
                        const moveAngle = findClearDirection(e, Math.atan2(cy - e.y, cx - e.x), Math.min(nearestDist, 80));
                        tryMoveEntity(e, Math.cos(moveAngle) * 70 * dt, Math.sin(moveAngle) * 70 * dt, true);
                    }
                    e.facing = Math.atan2(cy - e.y, cx - e.x);
                    e.angle = e.facing;
                    e.x = Math.max(20 + e.r, Math.min(WORLD_W - 20 - e.r, e.x));
                    e.y = Math.max(20 + e.r, Math.min(WORLD_H - 20 - e.r, e.y));
                    return;
                }
            }
            if (e.state !== "alert" && e.special !== "vip" && !e.escorting && !e.bunkerGuard && !e.cabinGuard && !e.checkingCabin) {
                for (const other of enemies) {
                    if (other === e || !other.downed) continue;
                    if (player.draggingBody === other) continue;
                    const d = dist(e.x, e.y, other.x, other.y);
                    if (d < 55) {
                        if (isBodyHidden(other.x, other.y)) { other.reviveTimer = 0; continue; }
                        other.reviveTimer += dt;
                        if (other.reviveTimer >= 2) {
                            other.downed = false;
                            other.reviveTimer = 0;
                            other.hp = Math.floor(other.maxHp * 0.5);
                            other.state = "idle";
                            other.detectionLevel = 0;
                            spawnParticles(other.x, other.y, "#22c55e", 15);
                            addFloatingText(other.x, other.y - 30, "¡Revivido!", "#22c55e");
                        }
                        return;
                    }
                }
            }
            let targetX, targetY, moveSpeed, stopDist;
            let downedTarget = null, downedD = 999;
            for (const other of enemies) {
                if (other.downed && !isBodyHidden(other.x, other.y) && player.draggingBody !== other) {
                    const d = dist(e.x, e.y, other.x, other.y);
                    if (d < downedD) { downedD = d; downedTarget = other; }
                }
            }
            if (e.special === "vip" && !e.escorting && e.state === "idle" && !e.tripActive) {
                e.tripCooldown -= dt;
                if (e.tripCooldown <= 0 && !emergencyProtocol) {
                    e.tripActive = true;
                    e.tripStage = 'going';
                    e.tripWaypointIdx = 0;
                }
            }
            if (e.special === "vip" && e.tripActive) {
                if (e.tripStage === 'going' || e.tripStage === 'returning') {
                    const path = e.tripStage === 'going' ? VIP_PATH : [...VIP_PATH].reverse();
                    const target = path[e.tripWaypointIdx];
                    if (!target) {
                        if (e.tripStage === 'going') {
                            e.tripStage = 'eating';
                            e.eatTimer = 30;
                        } else {
                            e.tripActive = false;
                            e.tripStage = 'idle';
                            e.tripCooldown = 40 + Math.random() * 30;
                        }
                    } else {
                        const d = dist(e.x, e.y, target.x, target.y);
                        if (d < 22) {
                            e.tripWaypointIdx++;
                        } else {
                            const moveAngle = Math.atan2(target.y - e.y, target.x - e.x);
                            const navAngle = findClearDirection(e, moveAngle, Math.min(d, 60));
                            tryMoveEntity(e, Math.cos(navAngle) * 85 * dt, Math.sin(navAngle) * 85 * dt, false);
                            e.facing = moveAngle;
                            e.angle = e.facing;
                        }
                        e.x = Math.max(20 + e.r, Math.min(WORLD_W - 20 - e.r, e.x));
                        e.y = Math.max(20 + e.r, Math.min(WORLD_H - 20 - e.r, e.y));
                        if (Math.random() < 0.08) spawnParticles(e.x, e.y + 8, "#94a3b8", 1);
                        return;
                    }
                } else if (e.tripStage === 'eating') {
                    e.eatTimer -= dt;
                    e.facing = Math.PI / 2;
                    if (Math.random() < 0.15) {
                        spawnParticles(e.x, e.y - 5, "#fbbf24", 1);
                        spawnParticles(e.x + 6, e.y - 3, "#dc2626", 1);
                    }
                    if (e.eatTimer <= 0) {
                        e.tripStage = 'returning';
                        e.tripWaypointIdx = 0;
                    }
                    return;
                }
            }
            if (e.state === "alert" && e.canSee) {
                targetX = player.x; targetY = player.y;
                moveSpeed = emergencyProtocol ? BOT_ALERT_SPEED * 1.3 : BOT_ALERT_SPEED;
                stopDist = emergencyProtocol ? 180 : 200;
            } else if (emergencyProtocol) {
                const isInsideBunker = (e.x > 1350 && e.x < 1830 && e.y > 250 && e.y < 560);
                if (isInsideBunker) {
                    targetX = 1625;
                    targetY = 650;
                    moveSpeed = 120;
                    stopDist = 15;
                    e.wanderTarget = null;
                } else {
                    if (!e.wanderTarget || dist(e.x, e.y, e.wanderTarget.x, e.wanderTarget.y) < 80) {
                        e.wanderTarget = {
                            x: 200 + Math.random() * (WORLD_W - 400),
                            y: 200 + Math.random() * (WORLD_H - 400)
                        };
                    }
                    targetX = e.wanderTarget.x;
                    targetY = e.wanderTarget.y;
                    moveSpeed = 110 + (e.speedMod || 0);
                    stopDist = 20;
                }
            } else if (e.mapWideSearch) {
                if (!e.wanderTarget || dist(e.x, e.y, e.wanderTarget.x, e.wanderTarget.y) < 80) {
                    e.wanderTarget = {
                        x: 200 + Math.random() * (WORLD_W - 400),
                        y: 200 + Math.random() * (WORLD_H - 400)
                    };
                }
                targetX = e.wanderTarget.x;
                targetY = e.wanderTarget.y;
                moveSpeed = emergencyProtocol ? 140 : 130;
                stopDist = 40;
            } else if (e.bunkerGuard && e.bunkerPostIdx !== undefined) {
                const post = bunkerPosts[e.bunkerPostIdx];
                if (post) {
                    const maxInvestigateDist = 400;
                    const distToPost = dist(e.x, e.y, post.x, post.y);
                    const investigating = (e.state === "suspicious" && e.suspicionPoint) || (e.state === "alert" && e.lastSeen);
                    if (investigating && distToPost < maxInvestigateDist * 1.8) {
                        const tgt = e.state === "alert" && e.lastSeen ? e.lastSeen : e.suspicionPoint;
                        const distFromPost = dist(tgt.x, tgt.y, post.x, post.y);
                        if (distFromPost > maxInvestigateDist) {
                            const a = Math.atan2(tgt.y - post.y, tgt.x - post.x);
                            targetX = post.x + Math.cos(a) * maxInvestigateDist;
                            targetY = post.y + Math.sin(a) * maxInvestigateDist;
                        } else {
                            targetX = tgt.x; targetY = tgt.y;
                        }
                        moveSpeed = e.state === "alert" ? 100 : 70;
                        stopDist = 20;
                    } else {
                        if (e.bunkerWaypoint && dist(e.x, e.y, e.bunkerWaypoint.x, e.bunkerWaypoint.y) < 18) e.bunkerWaypoint = null;
                        if (e.bunkerWaypoint) { targetX = e.bunkerWaypoint.x; targetY = e.bunkerWaypoint.y; }
                        else { targetX = post.x; targetY = post.y; }
                        moveSpeed = 130; stopDist = 5;
                    }
                } else { targetX = e.x; targetY = e.y; moveSpeed = 0; stopDist = 5; }
            } else if (e.cabinGuard) {
                const post = CABIN_GUARD_POS;
                const maxInvestigateDist = 350;
                const distToPost = dist(e.x, e.y, post.x, post.y);
                const investigating = (e.state === "suspicious" && e.suspicionPoint) || (e.state === "alert" && e.lastSeen);
                if (investigating && distToPost < maxInvestigateDist * 1.8) {
                    const tgt = e.state === "alert" && e.lastSeen ? e.lastSeen : e.suspicionPoint;

                    const isBotInside = (e.y < 560);
                    const isTargetInside = (tgt.y < 560);

                    if (isBotInside !== isTargetInside) {
                        targetX = 1630;
                        targetY = isBotInside ? 540 : 580;
                    } else {
                        const distFromPost = dist(tgt.x, tgt.y, post.x, post.y);
                        if (distFromPost > maxInvestigateDist) {
                            const a = Math.atan2(tgt.y - post.y, tgt.x - post.x);
                            targetX = post.x + Math.cos(a) * maxInvestigateDist;
                            targetY = post.y + Math.sin(a) * maxInvestigateDist;
                        } else {
                            targetX = tgt.x; targetY = tgt.y;
                        }
                    }
                    moveSpeed = e.state === "alert" ? 100 : 70;
                    stopDist = 20;
                } else {
                    targetX = post.x; targetY = post.y;
                    moveSpeed = 100; stopDist = 6;
                }
            } else if (e.state === "alert") {
                const searchCenter = e.rcChasing && rcCar.active && !rcCar.exploded
                    ? { x: rcCar.x, y: rcCar.y }
                    : (e.reinforcement && e.reinforcement.timer > 0)
                        ? { x: e.reinforcement.cx, y: e.reinforcement.cy }
                        : (e.lastSeen || { x: player.x, y: player.y });
                if (!e.searchPoint) { e.searchPoint = { x: searchCenter.x, y: searchCenter.y }; e.searchPointTimer = 1.5 + Math.random() * 1.5; }
                e.searchPointTimer = (e.searchPointTimer || 0) - dt;
                const distToPoint = dist(e.x, e.y, e.searchPoint.x, e.searchPoint.y);
                const searchPointTooFar = dist(e.searchPoint.x, e.searchPoint.y, searchCenter.x, searchCenter.y) > 320;
                if (distToPoint < 30 || e.searchPointTimer <= 0 || searchPointTooFar) {
                    const a = Math.random() * Math.PI * 2;
                    const r = 60 + Math.random() * 150;
                    e.searchPoint = {
                        x: Math.max(40, Math.min(WORLD_W - 40, searchCenter.x + Math.cos(a) * r)),
                        y: Math.max(40, Math.min(WORLD_H - 40, searchCenter.y + Math.sin(a) * r)),
                    };
                    e.searchPointTimer = 2.5 + Math.random() * 2;
                }
                targetX = e.searchPoint.x; targetY = e.searchPoint.y;
                moveSpeed = emergencyProtocol ? BOT_ALERT_SPEED * 1.2 : BOT_ALERT_SPEED * 0.85;
                stopDist = 10;
            } else if (e.escorting) {
                const vip = enemies.find(en => en.special === "vip" && !en.downed);
                if (vip) {
                    const offset = e.escortAngle + performance.now() * 0.0003;
                    targetX = vip.x + Math.cos(offset) * 55;
                    targetY = vip.y + Math.sin(offset) * 55;
                    moveSpeed = 110; stopDist = 5;
                } else { e.escorting = false; targetX = e.x; targetY = e.y; moveSpeed = 0; stopDist = 5; }
            } else if (e.special === "vip") {
                if (e.escorting) {
                    const awayAngle = Math.atan2(e.y - player.y, e.x - player.x);
                    targetX = Math.max(80, Math.min(WORLD_W - 80, e.x + Math.cos(awayAngle) * 120));
                    targetY = Math.max(80, Math.min(WORLD_H - 80, e.y + Math.sin(awayAngle) * 120));
                    moveSpeed = 90; stopDist = 5;
                } else {
                    e.patrolPhase += dt * 0.15;
                    targetX = e.patrolCenter.x + Math.cos(e.patrolPhase) * 40;
                    targetY = e.patrolCenter.y + Math.sin(e.patrolPhase) * 40;
                    moveSpeed = 25; stopDist = 3;
                }
            } else if (e.special === "guard") {
                const v = enemies.find(en => en.special === "vip" && !en.downed);
                if (v) {
                    e.patrolPhase += dt * (e.bodyguard ? 0.5 : 0.4);
                    targetX = v.x + Math.cos(e.patrolPhase) * e.patrolRadius;
                    targetY = v.y + Math.sin(e.patrolPhase) * e.patrolRadius;
                    moveSpeed = 70; stopDist = 5;
                } else {
                    e.patrolPhase += dt * 0.35;
                    targetX = e.patrolCenter.x + Math.cos(e.patrolPhase) * e.patrolRadius;
                    targetY = e.patrolCenter.y + Math.sin(e.patrolPhase) * e.patrolRadius;
                    moveSpeed = BOT_IDLE_SPEED; stopDist = 3;
                }
            } else if (downedTarget && downedD < 400) {
                targetX = downedTarget.x; targetY = downedTarget.y;
                moveSpeed = 90; stopDist = 15;
            } else if (e.state === "suspicious" && e.suspicionPoint) {
                targetX = e.suspicionPoint.x; targetY = e.suspicionPoint.y;
                moveSpeed = 70; stopDist = 25;
                e.searchSweep += dt * 0.8;
            } else {
                if (emergencyProtocol && !e.prisonGuard) {
                    if (!e.wanderTarget || dist(e.x, e.y, e.wanderTarget.x, e.wanderTarget.y) < 100) {
                        e.wanderTarget = { x: 200 + Math.random() * (WORLD_W - 400), y: 200 + Math.random() * (WORLD_H - 400) };
                    }
                    targetX = e.wanderTarget.x; targetY = e.wanderTarget.y;
                    moveSpeed = 100; stopDist = 20;
                } else if (e.prisonGuard) {
                    e.patrolPhase += dt * 0.4;
                    targetX = e.patrolCenter.x + Math.cos(e.patrolPhase) * e.patrolRadius;
                    targetY = e.patrolCenter.y + Math.sin(e.patrolPhase) * e.patrolRadius;
                    moveSpeed = BOT_IDLE_SPEED; stopDist = 3;
                } else {
                    const allEnemyCaptured = combatFlags.every(f => f.owner === "enemy");
                    if (allEnemyCaptured) {
                        if (!e.wanderTarget || dist(e.x, e.y, e.wanderTarget.x, e.wanderTarget.y) < 40) {
                            e.wanderTarget = { x: 200 + Math.random() * (WORLD_W - 400), y: 200 + Math.random() * (WORLD_H - 400) };
                        }
                        targetX = e.wanderTarget.x; targetY = e.wanderTarget.y;
                        moveSpeed = 50; stopDist = 5;
                    } else if (e.role === "flag1") {
                        const flag = combatFlags[e.targetFlag];
                        if (flag.owner === "enemy") {
                            e.patrolPhase += dt * 0.35;
                            targetX = flag.x + Math.cos(e.patrolPhase) * 80;
                            targetY = flag.y + Math.sin(e.patrolPhase) * 80;
                            moveSpeed = BOT_IDLE_SPEED; stopDist = 3;
                        } else { targetX = flag.x; targetY = flag.y; moveSpeed = BOT_IDLE_SPEED; stopDist = 15; }
                    } else {
                        e.patrolPhase += dt * 0.35;
                        targetX = e.patrolCenter.x + Math.cos(e.patrolPhase) * e.patrolRadius;
                        targetY = e.patrolCenter.y + Math.sin(e.patrolPhase) * e.patrolRadius;
                        moveSpeed = BOT_IDLE_SPEED; stopDist = 3;
                    }
                }
            }
            let useWaypoint = false;
            {
                let botInside = isInsideCabin(e.x, e.y);
                let targetInside = isInsideCabin(targetX, targetY);

                if (!botInside && targetInside) {
                    const botsInCabin = enemies.filter(other => !other.downed && isInsideCabin(other.x, other.y)).length;

                    if (botsInCabin >= 3) {
                        targetX = CABIN.x - 40;
                        targetY = CABIN.y + CABIN.h / 2;
                        targetInside = false;
                    }
                }

                if (!botInside && targetInside) {
                    const wp = getCabinEntryWaypoint(e);
                    if (wp) { targetX = wp.x; targetY = wp.y; useWaypoint = true; }
                } else if (botInside && !targetInside) {
                    const wp = getCabinExitWaypoint(e);
                    if (wp) { targetX = wp.x; targetY = wp.y; useWaypoint = true; }
                }
            }
            if (useWaypoint) stopDist = 8;
            const walkDir = Math.atan2(targetY - e.y, targetX - e.x);
            let desiredFacing;
            if (e.bunkerGuard && e.bunkerPostIdx !== undefined) {
                if (e.state === "alert" && e.canSee) {
                    desiredFacing = Math.atan2(player.y - e.y, player.x - e.x);
                    let fDiff = desiredFacing - e.facing;
                    while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                    while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                    e.facing += Math.max(-5 * dt, Math.min(5 * dt, fDiff));
                } else if (e.state === "suspicious" || e.state === "alert") {
                    const dToTarget = dist(e.x, e.y, targetX, targetY);
                    e.searchSweep = (e.searchSweep || 0) + dt * 2.0;
                    desiredFacing = dToTarget > 30 ? walkDir : walkDir + Math.sin(e.searchSweep) * 0.5;
                    let fDiff = desiredFacing - e.facing;
                    while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                    while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                    e.facing += Math.max(-3 * dt, Math.min(3 * dt, fDiff));
                } else {
                    e.sweepPhase = (e.sweepPhase || 0) + dt * 1.2;
                    const sweepAngle = Math.PI / 2 + Math.sin(e.sweepPhase) * 1.15;
                    let fDiff = sweepAngle - e.facing;
                    while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                    while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                    e.facing += Math.max(-2.5 * dt, Math.min(2.5 * dt, fDiff));
                }
            } else if (e.cabinGuard) {
                if (e.state === "alert" && e.canSee) {
                    desiredFacing = Math.atan2(player.y - e.y, player.x - e.x);
                    let fDiff = desiredFacing - e.facing;
                    while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                    while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                    e.facing += Math.max(-5 * dt, Math.min(5 * dt, fDiff));
                } else if (e.state === "suspicious" || e.state === "alert") {
                    const dToTarget = dist(e.x, e.y, targetX, targetY);
                    e.searchSweep = (e.searchSweep || 0) + dt * 2.0;
                    desiredFacing = dToTarget > 30 ? walkDir : walkDir + Math.sin(e.searchSweep) * 0.5;
                    let fDiff = desiredFacing - e.facing;
                    while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                    while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                    e.facing += Math.max(-3 * dt, Math.min(3 * dt, fDiff));
                } else {
                    e.sweepPhase = (e.sweepPhase || 0) + dt * 1.0;
                    const sweepAngle = 0 + Math.sin(e.sweepPhase) * 1.0;
                    let fDiff = sweepAngle - e.facing;
                    while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                    while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                    e.facing += Math.max(-2 * dt, Math.min(2 * dt, fDiff));
                }
            } else if (e.state === "alert" && e.canSee && !useWaypoint) {
                desiredFacing = Math.atan2(player.y - e.y, player.x - e.x);
                let fDiff = desiredFacing - e.facing;
                while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                e.facing += Math.max(-5 * dt, Math.min(5 * dt, fDiff));
            } else if (e.state === "alert") {
                e.searchSweep = (e.searchSweep || 0) + dt * 2.2;
                desiredFacing = walkDir + Math.sin(e.searchSweep) * 0.65;
                let fDiff = desiredFacing - e.facing;
                while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                e.facing += Math.max(-3 * dt, Math.min(3 * dt, fDiff));
            } else if (e.state === "suspicious") {
                const dToTarget = dist(e.x, e.y, targetX, targetY);
                desiredFacing = dToTarget > 30 ? walkDir : walkDir + Math.sin(e.searchSweep) * 0.25;
                let fDiff = desiredFacing - e.facing;
                while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                e.facing += Math.max(-3.5 * dt, Math.min(3.5 * dt, fDiff));
            } else {
                e.lookAroundTimer -= dt;
                if (e.lookAroundTimer <= 0) {
                    e.lookAroundTimer = 3 + Math.random() * 3;
                    e.lookAroundBase = pickOpenFacing(e);
                }
                const d = dist(e.x, e.y, targetX, targetY);
                desiredFacing = d < 10 ? e.lookAroundBase : walkDir;
                let fDiff = desiredFacing - e.facing;
                while (fDiff > Math.PI) fDiff -= Math.PI * 2;
                while (fDiff < -Math.PI) fDiff += Math.PI * 2;
                e.facing += Math.max(-1.2 * dt, Math.min(1.2 * dt, fDiff));
            }
            const dx = targetX - e.x, dy = targetY - e.y;
            const d = Math.hypot(dx, dy) || 0.001;
            const isFixedGuard = (e.bunkerGuard || e.prisonGuard || e.cabinGuard) && e.state === "idle" && !e.checkingCabin;

            if (e.stuckEscapeTimer > 0) {
                e.stuckEscapeTimer -= dt;
                const ea = e.stuckEscapeAngle;
                const moveX = Math.cos(ea) * moveSpeed * dt;
                const moveY = Math.sin(ea) * moveSpeed * dt;

                tryMoveEntity(e, moveX, moveY, false);

                e.facing = ea;
                e.angle = e.facing;
                e.x = Math.max(20 + e.r, Math.min(WORLD_W - 20 - e.r, e.x));
                e.y = Math.max(20 + e.r, Math.min(WORLD_H - 20 - e.r, e.y));
                e.lastPosX = e.x; e.lastPosY = e.y; e.immobileTimer = 0;
                return;
            }

            if (d > stopDist && moveSpeed > 0) {
                let moveAngle = Math.atan2(dy, dx);

                if (e.forceTurnTimer && e.forceTurnTimer > 0) {
                    e.forceTurnTimer -= dt;
                    moveAngle += e.forceTurnAngle;
                } else {
                    moveAngle = getSafeSteeringAngle(e, moveAngle, Math.min(d, 120));
                }

                let moveX = Math.cos(moveAngle) * moveSpeed * dt;
                let moveY = Math.sin(moveAngle) * moveSpeed * dt;

                if (e.detour && e.detour.timer > 0) {
                    e.detour.timer -= dt;
                    const da = Math.atan2(e.detour.y - e.y, e.detour.x - e.x);
                    moveX = Math.cos(da) * moveSpeed * dt;
                    moveY = Math.sin(da) * moveSpeed * dt;
                    if (dist(e.x, e.y, e.detour.x, e.detour.y) < 20) e.detour.timer = 0;
                }

                const nearCabin = dist(e.x, e.y, CABIN.x + CABIN.w / 2, CABIN.y + CABIN.h / 2) < 250;
                tryMoveEntity(e, moveX, moveY, !useWaypoint && !nearCabin);

                const movedSinceLastCheck = dist(e.x, e.y, e.lastPosX !== undefined ? e.lastPosX : e.x, e.lastPosY !== undefined ? e.lastPosY : e.y);

                if (movedSinceLastCheck > 8) {
                    e.lastPosX = e.x; e.lastPosY = e.y;
                    e.immobileTimer = 0;
                    e.stuckCounter = 0;
                } else {
                    e.stuckCounter = (e.stuckCounter || 0) + dt;
                    e.immobileTimer = (e.immobileTimer || 0) + dt;

                    const threshold = isFixedGuard ? 1.5 : 0.6;
                    if (e.stuckCounter > threshold) {
                        e.stuckCounter = 0;
                        let bestAngle = Math.random() * Math.PI * 2;
                        let bestScore = -Infinity;

                        for (let i = 0; i < 16; i++) {
                            const a = (i / 16) * Math.PI * 2;
                            let score = 0, blocked = false;
                            for (let tt = 20; tt <= 180; tt += 20) {
                                const tx = e.x + Math.cos(a) * tt;
                                const ty = e.y + Math.sin(a) * tt;
                                for (const s of getSolids()) {
                                    if (circleRect(tx, ty, e.r + 8, s)) { blocked = true; break; }
                                }
                                if (blocked) { score -= (180 - tt) * 3; break; }
                            }
                            if (!blocked) score += 200;
                            if (d > 1) score += Math.cos(a - Math.atan2(dy, dx)) * 30;
                            if (score > bestScore) { bestScore = score; bestAngle = a; }
                        }
                        e.stuckEscapeTimer = 1.2;
                        e.stuckEscapeAngle = bestAngle;
                        e.lastPosX = e.x; e.lastPosY = e.y;
                    }

                    if (e.immobileTimer > 3.0 && !e.detour) {
                        const moveAngle2 = Math.atan2(moveY, moveX);
                        const options = [moveAngle2 + Math.PI / 2, moveAngle2 - Math.PI / 2, moveAngle2 + Math.PI * 0.75, moveAngle2 - Math.PI * 0.75, moveAngle2 + Math.PI];
                        let chosen = null;
                        for (const oa of options) {
                            const testX = e.x + Math.cos(oa) * 100;
                            const testY = e.y + Math.sin(oa) * 100;
                            let ok = true;
                            for (const s of getSolids()) if (circleRect(testX, testY, e.r, s)) { ok = false; break; }
                            if (ok) { chosen = oa; break; }
                        }
                        if (chosen === null) chosen = options[Math.floor(Math.random() * options.length)];
                        e.detour = { x: e.x + Math.cos(chosen) * 130, y: e.y + Math.sin(chosen) * 130, timer: 3 };
                        e.immobileTimer = 0;
                        e.lastPosX = e.x; e.lastPosY = e.y;
                    }
                }
            }
            e.x = Math.max(20 + e.r, Math.min(WORLD_W - 20 - e.r, e.x));
            e.y = Math.max(20 + e.r, Math.min(WORLD_H - 20 - e.r, e.y));
            if (e.canSee && e.state === "alert") e.angle = Math.atan2(player.y - e.y, player.x - e.x);
            else e.angle = e.facing;
            e.cooldown -= dt;
            if (e.state === "alert" && e.canSee && e.cooldown <= 0) {
                const playerDist = dist(e.x, e.y, player.x, player.y);
                if (playerDist < 420 && playerDist > 30) {
                    const baseCd = e.special === "guard" ? 1.2 : 1.4;
                    const cdMult = emergencyProtocol ? 0.6 : 1;
                    e.cooldown = (baseCd + Math.random() * 0.5) * cdMult;
                    const a = Math.atan2(player.y - e.y, player.x - e.x) + (Math.random() - 0.5) * 0.15;
                    const bs = 380;
                    bullets.push({
                        x: e.x + Math.cos(a) * (e.r + 4), y: e.y + Math.sin(a) * (e.r + 4),
                        vx: Math.cos(a) * bs, vy: Math.sin(a) * bs, r: 4, friendly: false, bounces: 0, life: 2.5
                    });
                    SoundFX.enemyShoot();
                }
            }
        }

        function updateEnemyCar(car, dt) {
            if (car.disabled) return;
            if (car.hurtFlash > 0) car.hurtFlash -= dt;

            car.sirenOn = emergencyProtocol || car.state === "chase";
            if (car.sirenOn) {
                car.sirenFlash = (car.sirenFlash || 0) + dt;
            } else {
                car.sirenFlash = 0;
            }

            const dToPlayer = dist(car.x, car.y, player.x, player.y);
            const angleToPlayer = Math.atan2(player.y - car.y, player.x - car.x);
            let diff = angleToPlayer - car.heading;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            let visionRange = 350;
            let visionHalf = 0.7;
            if (emergencyProtocol) { visionRange = 550; visionHalf = 1.15; }
            else if (car.sirenOn) { visionRange = 420; visionHalf = 0.85; }

            const canSee = !isPlayerHidden() && dToPlayer < visionRange && Math.abs(diff) < visionHalf &&
                hasLineOfSight(car.x, car.y, player.x, player.y) && !isInsideCabin(player.x, player.y);
            car.canSee = canSee;
            car.state = canSee ? "chase" : "patrol";
            let targetX, targetY, speed;
            if (car.state === "chase") { targetX = player.x; targetY = player.y; speed = CAR_CHASE_SPEED; }
            else {
                const wp = level1.carWaypoints[car.waypointIdx];
                targetX = wp.x; targetY = wp.y;
                speed = CAR_PATROL_SPEED * car.speedMul;
                if (dist(car.x, car.y, wp.x, wp.y) < 80) car.waypointIdx = (car.waypointIdx + 1) % level1.carWaypoints.length;
            }
            if (emergencyProtocol) speed *= 1.35;
            else if (car.sirenOn) speed *= 1.2;

            if (car.stuckTimer > 0.4) {
                if (!car.stuckDir) car.stuckDir = Math.random() < 0.5 ? 1 : -1;
                car.heading += car.stuckDir * 2.5 * dt;
                const reverseSpeed = speed * 0.7;
                const rx = -Math.cos(car.heading) * reverseSpeed * dt;
                const ry = -Math.sin(car.heading) * reverseSpeed * dt;
                const bx = car.x, by = car.y;
                tryMoveEntity(car, rx, ry);
                const moved = dist(bx, by, car.x, car.y);
                if (moved > reverseSpeed * dt * 0.3) {
                    car.stuckTimer -= dt * 1.2;
                    if (car.stuckTimer <= 0) { car.stuckTimer = 0; car.stuckDir = -car.stuckDir; }
                } else car.stuckDir = -car.stuckDir;
                car.x = Math.max(20 + car.r, Math.min(WORLD_W - 20 - car.r, car.x));
                car.y = Math.max(20 + car.r, Math.min(WORLD_H - 20 - car.r, car.y));
                return;
            }
            const targetHeading = Math.atan2(targetY - car.y, targetX - car.x);
            const lookAhead = 130;
            const solids = getSolids();
            const offsets = [0, 0.3, -0.3, 0.6, -0.6, 1.0, -1.0, 1.4, -1.4, 1.8, -1.8, 2.4, -2.4, 3.0, -3.0];
            let chosenHeading = targetHeading;
            let foundClear = false;
            for (const offset of offsets) {
                const testH = targetHeading + offset;
                const testX = car.x + Math.cos(testH) * lookAhead;
                const testY = car.y + Math.sin(testH) * lookAhead;
                let blocked = false;
                for (const s of solids) if (circleRect(testX, testY, car.r + 12, s)) { blocked = true; break; }
                if (!blocked) { chosenHeading = testH; foundClear = true; break; }
            }
            if (!foundClear) chosenHeading = targetHeading + Math.PI;
            let hDiff = chosenHeading - car.heading;
            while (hDiff > Math.PI) hDiff -= Math.PI * 2;
            while (hDiff < -Math.PI) hDiff += Math.PI * 2;
            car.heading += Math.max(-3 * dt, Math.min(3 * dt, hDiff));
            const beforeX = car.x, beforeY = car.y;
            tryMoveEntity(car, Math.cos(car.heading) * speed * dt, Math.sin(car.heading) * speed * dt);

            if (isInsideCabin(car.x, car.y)) {
                car.x = CABIN.x - car.r - 10;
                car.stuckTimer += dt * 2;
            }

            const moved = dist(beforeX, beforeY, car.x, car.y);
            if (moved < 0.3 * speed * dt) car.stuckTimer += dt;
            else car.stuckTimer = Math.max(0, car.stuckTimer - dt);
            if (dist(car.x, car.y, player.x, player.y) < car.r + player.r) {
                player.hp = 0; player.hurtFlash = 1; shake = 1;
                spawnParticles(player.x, player.y, "#ef4444", 40);
                addFloatingText(player.x, player.y - 40, "¡ATROPELLADO!", "#ef4444");
                SoundFX.explosion();
                updateHUD();
                gameOver();
                return;
            }
            if (car.state === "chase" && car.canSee && dToPlayer < 400) {
                car.cooldown -= dt;
                if (car.cooldown <= 0) {
                    car.cooldown = 1.5;
                    const a = Math.atan2(player.y - car.y, player.x - car.x);
                    bullets.push({
                        x: car.x + Math.cos(a) * (car.r + 6), y: car.y + Math.sin(a) * (car.r + 6),
                        vx: Math.cos(a) * 400, vy: Math.sin(a) * 400, r: 5, friendly: false, bounces: 0, life: 2.5
                    });
                    SoundFX.enemyShoot();
                }
            }
            car.x = Math.max(20 + car.r, Math.min(WORLD_W - 20 - car.r, car.x));
            car.y = Math.max(20 + car.r, Math.min(WORLD_H - 20 - car.r, car.y));
        }

        function updatePrisoner(dt) {
            if (!prisoner) return;
            if (prisoner.hurtFlash > 0) prisoner.hurtFlash -= dt;
            if (!prisoner.following && !prisoner.atBase && prisonUnlocked) {
                if (dist(player.x, player.y, prisoner.x, prisoner.y) < 50) {
                    prisoner.following = true;
                    prisoner.rescued = true;
                    player.money += 815;
                    addFloatingText(prisoner.x, prisoner.y - 30, "+$815", "#fbbf24");
                    showNotification("Pichón rescatado — +$815 · llevalo a la base", "#22c55e", 4);
                    SoundFX.pickup();
                    updateHUD();
                }
            }
            if (prisoner.following && exitZone && dist(prisoner.x, prisoner.y, exitZone.x, exitZone.y) < exitZone.r) {
                prisoner.following = false;
                prisoner.atBase = true;
                showNotification("Pichón asegurado en la base", "#22c55e", 4);
                SoundFX.pickup();
            }
            if (prisoner.following) {
                const d = dist(player.x, player.y, prisoner.x, prisoner.y);
                if (d > 55) {
                    const a = Math.atan2(player.y - prisoner.y, player.x - prisoner.x);
                    const speed = d > 150 ? 220 : 150;
                    tryMoveEntity(prisoner, Math.cos(a) * speed * dt, Math.sin(a) * speed * dt);
                    prisoner.angle = a;
                }
                if (d > 600) {
                    prisoner.x = player.x - Math.cos(player.angle) * 35;
                    prisoner.y = player.y - Math.sin(player.angle) * 35;
                    prisoner.x = Math.max(20 + prisoner.r, Math.min(WORLD_W - 20 - prisoner.r, prisoner.x));
                    prisoner.y = Math.max(20 + prisoner.r, Math.min(WORLD_H - 20 - prisoner.r, prisoner.y));
                }
                prisoner.x = Math.max(20 + prisoner.r, Math.min(WORLD_W - 20 - prisoner.r, prisoner.x));
                prisoner.y = Math.max(20 + prisoner.r, Math.min(WORLD_H - 20 - prisoner.r, prisoner.y));
            }
        }

        function processBullets(dt) {
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
                if (b.life <= 0) { bullets.splice(i, 1); continue; }
                if (b.friendly) {
                    let bounced = false;
                    if (b.x - b.r < 20) { b.x = 20 + b.r; b.vx = Math.abs(b.vx); bounced = true; }
                    if (b.x + b.r > WORLD_W - 20) { b.x = WORLD_W - 20 - b.r; b.vx = -Math.abs(b.vx); bounced = true; }
                    if (b.y - b.r < 20) { b.y = 20 + b.r; b.vy = Math.abs(b.vy); bounced = true; }
                    if (b.y + b.r > WORLD_H - 20) { b.y = WORLD_H - 20 - b.r; b.vy = -Math.abs(b.vy); bounced = true; }
                    if (bounced) { b.bounces++; if (b.bounces > 3) { bullets.splice(i, 1); continue; } }
                    for (const w of walls) {
                        if (bounceBullet(b, w)) { b.bounces++; if (b.bounces > 3) { bullets.splice(i, 1); break; } }
                    }
                    if (!bullets[i] || bullets[i] !== b) continue;
                }
                if (bulletHitsSolid(b)) { spawnParticles(b.x, b.y, "#8b98a8", 3); bullets.splice(i, 1); continue; }
                if (b.friendly) {
                    if (prisoner && prisoner.following && dist(b.x, b.y, prisoner.x, prisoner.y) < b.r + prisoner.r) {
                        damagePrisoner(10);
                        spawnParticles(b.x, b.y, "#ef4444", 6);
                        bullets.splice(i, 1);
                        continue;
                    }
                    let hit = false;
                    for (const e of enemies) {
                        if (dist(b.x, b.y, e.x, e.y) < b.r + e.r) {
                            if (e.downed) {
                                finalizeEnemy(e);
                                addFloatingText(b.x, b.y - 20, "REMATADO", "#ef4444");
                                player.money += 25;
                                stats.kills++;
                            } else {
                                const dmg = e.special === "vip" ? 15 : 25;
                                e.hp -= dmg; e.hurtFlash = 0.15;
                                e.state = "alert";
                                e.lastSeen = { x: player.x, y: player.y };
                                e.detectionLevel = 1; e.stateTimer = 3; e.canSee = true;
                                alertNearby(e, 300);
                                spawnParticles(b.x, b.y, "#ef4444", 6);
                            }
                            hit = true; break;
                        }
                    }
                    if (!hit) for (const car of enemyCars) {
                        if (!car.disabled && dist(b.x, b.y, car.x, car.y) < b.r + car.r) {
                            car.hp -= 25; car.hurtFlash = 0.15;
                            spawnParticles(b.x, b.y, "#ef4444", 6);
                            hit = true; break;
                        }
                    }
                    if (hit) { bullets.splice(i, 1); updateHUD(); continue; }
                } else {
                    if (prisoner && prisoner.following && dist(b.x, b.y, prisoner.x, prisoner.y) < b.r + prisoner.r) {
                        damagePrisoner(15);
                        spawnParticles(b.x, b.y, "#ef4444", 6);
                        bullets.splice(i, 1);
                        if (phase !== "combat") return;
                        continue;
                    }
                    if (dist(b.x, b.y, player.x, player.y) < b.r + player.r) {
                        player.hp -= 12; player.hurtFlash = 0.3; shake = 0.2;
                        spawnParticles(b.x, b.y, "#ef4444", 6);
                        updateHUD();
                        bullets.splice(i, 1);
                        if (player.hp <= 0) { gameOver(); return; }
                        continue;
                    }
                }
            }
        }

        function updateCombat(dt) {
            if (prisonPuzzle.wrongFlash > 0) prisonPuzzle.wrongFlash -= dt;
            if (chestPuzzle.wrongFlash > 0) chestPuzzle.wrongFlash -= dt;
            if (shopOpen || helpOpen || prisonPuzzle.active || chestPuzzle.active) return;
            if (keypadPressTimer > 0) keypadPressTimer -= dt;
            else keypadPressed = -1;
            if (shake > 0) shake = Math.max(0, shake - dt);
            if (player.hurtFlash > 0) player.hurtFlash -= dt;
            if (knifeCooldown > 0) knifeCooldown -= dt;
            if (knifeFlash > 0) knifeFlash -= dt;
            if (kickCooldown > 0) kickCooldown -= dt;
            if (kickFlash > 0) kickFlash -= dt;
            if (noShootHintTimer > 0) noShootHintTimer -= dt;
            if (player.throwCooldown > 0) player.throwCooldown -= dt;
            if (extraction.wrongFlash > 0) extraction.wrongFlash -= dt;
            if (itemLegend.life > 0) itemLegend.life = Math.max(0, itemLegend.life - dt);
            if (bodyAlertSoundTimer > 0) bodyAlertSoundTimer -= dt;
            if (rcHonkCooldown > 0) rcHonkCooldown -= dt;

            if (reinforcementCalledTimer > 0) {
                reinforcementCalledTimer -= dt;
                if (reinforcementCalledTimer <= 0) {
                    reinforcementCalledTimer = 0;
                    if (!emergencyProtocol) {
                        for (const e of enemies) e.checkingCabin = false;
                        if (bodyCamera.isCabinCheck) { bodyCamera.active = false; bodyCamera.bot = null; }
                        activateEmergencyProtocol();
                        showNotification("🚨 ¡Protocolo de emergencia activado!", "#ef4444", 4);
                    }
                }
            }

            if (bodyCamera.active) {
                bodyCamera.timer -= dt;
                if (bodyCamera.timer <= 0) { bodyCamera.active = false; bodyCamera.bot = null; }
                if (bodyCamera.isCabinCheck && bodyCamera.bot) {
                    const b = bodyCamera.bot;
                    if (!b.checkingCabin || b.downed || b.state === "alert") {
                        bodyCamera.active = false;
                        bodyCamera.bot = null;
                    }
                }
            }
            for (let i = notifications.length - 1; i >= 0; i--) {
                notifications[i].life -= dt;
                if (notifications[i].life <= 0) notifications.splice(i, 1);
            }
            if (rushTimer.active) {
                rushTimer.timeLeft -= dt;
                if (rushTimer.timeLeft <= 30 && !rushTimer.warned30) {
                    rushTimer.warned30 = true;
                    showNotification("⏱️ 30s para extraer", "#fbbf24", 3);
                }
                if (rushTimer.timeLeft <= 10 && !rushTimer.warned10) {
                    rushTimer.warned10 = true;
                    showNotification("⏱️ 10s para extraer", "#ef4444", 3);
                }
                if (rushTimer.timeLeft <= 0) {
                    rushTimer.active = false;
                    extraction.active = false;
                    loseAPaper();
                }
            }
            if (!extraction.active && allObjectivesComplete() && !rushTimer.active) {
                rushTimer.active = true;
                rushTimer.timeLeft = rushTimer.maxTime;
                rushTimer.warned30 = false;
                rushTimer.warned10 = false;
                showNotification("¡Objetivos listos! 48s para extraer", "#22c55e", 4);
            }
            if (extraction.active) {
                updateCamera();
                return;
            }

            if (vipDead && vipDeathPos && !emergencyProtocol) {
                if (vipDeathTimer > 0) {
                    vipDeathTimer -= dt;
                    if (vipDeathTimer <= 0) {
                        assignCabinCheckBot();
                    }
                } else if (cabinCheckBot && enemies.includes(cabinCheckBot) && !cabinCheckBot.downed && cabinCheckBot.checkingCabin) {
                } else {
                    cabinCheckReassignTimer -= dt;
                    if (cabinCheckReassignTimer <= 0) {
                        assignCabinCheckBot();
                        cabinCheckReassignTimer = 2;
                    }
                }
            }

            if (!extraction.active) {
                missionTimeLeft -= dt;
                if (missionTimeLeft <= 0) {
                    missionTimeLeft = 600;
                    loseAPaper();
                }
            }

            if (rcCar.active) {
                updateRcCar(dt);
                processBullets(dt);
                if (phase !== "combat") return;
                updateBurningTrees(dt);
                updateNails(dt);
                updateDogs(dt);
                updateMines(dt);
                updateGrills(dt);
                updatePrisoner(dt);
                for (const e of enemies) {
                    if (e.hurtFlash > 0) e.hurtFlash -= dt;
                    updateBotPerception(e, dt);
                    updateBotAI(e, dt);
                }
                separateOverlappingEnemies();
                for (let i = enemyCars.length - 1; i >= 0; i--) {
                    const car = enemyCars[i];
                    if (car.hp <= 0 && !car.disabled) { spawnParticles(car.x, car.y, "#fbbf24", 30); enemyCars.splice(i, 1); continue; }
                    updateEnemyCar(car, dt);
                }
                for (let i = effects.length - 1; i >= 0; i--) {
                    const p = effects[i];
                    p.x += p.vx * dt; p.y += p.vy * dt;
                    p.vx *= 0.95; p.vy *= 0.95; p.life -= dt;
                    if (p.life <= 0) effects.splice(i, 1);
                }
                for (let i = floatingTexts.length - 1; i >= 0; i--) {
                    const t = floatingTexts[i];
                    t.y -= 25 * dt; t.life -= dt;
                    if (t.life <= 0) floatingTexts.splice(i, 1);
                }
                updateCamera();
                return;
            }

            updateDogs(dt);
            updateMines(dt);
            updateGrills(dt);
            updateBurningTrees(dt);
            updateNails(dt);
            updateBunkerPosts(dt);
            updateEscortState(dt);
            updatePrisoner(dt);

            if (player.backstab) {
                player.backstab.timer -= dt;
                if (player.backstab.timer <= 0) {
                    const e = player.backstab.enemy;
                    if (e && enemies.includes(e) && !e.downed && dist(player.x, player.y, e.x, e.y) < BACKSTAB_RANGE + e.r + 25) {
                        if (e.special === "vip") {
                            e.hp = 0;
                            spawnParticles(e.x, e.y, "#ef4444", 25);
                            spawnParticles(e.x, e.y, "#fbbf24", 15);
                            addFloatingText(e.x, e.y - 25, "¡ACUCHILLADO!", "#ef4444");
                        } else {
                            e.hp = 0;
                            e.downed = true;
                            e.downedTimer = DOWNED_TIME;
                            e.reviveTimer = 0;
                            e.state = "idle";
                            e.detectionLevel = 0;
                            e.canSee = false;
                            e.pushTimer = 0;
                            e.pushArc = 0;
                            e.bodyDiscovered = false;
                            stats.kills++;
                            spawnParticles(e.x, e.y, "#ef4444", 20);
                        }
                    }
                    player.backstab = null;
                    updateHUD();
                }
            }

            const isRunning = (keys.ShiftLeft || keys.ShiftRight);
            const isDragging = !!player.draggingBody;
            let sp;
            if (isDragging) sp = PLAYER_WALK_SPEED * 0.7;
            else if (player.backstab) sp = 0;
            else if (isRunning) sp = PLAYER_RUN_SPEED;
            else sp = PLAYER_WALK_SPEED;

            let dx = 0, dy = 0;
            if (!player.backstab) {
                if (keys.KeyW) dy -= 1;
                if (keys.KeyS) dy += 1;
                if (keys.KeyA) dx -= 1;
                if (keys.KeyD) dx += 1;
                if (dx || dy) {
                    const len = Math.hypot(dx, dy);
                    tryMoveEntity(player, (dx / len) * sp * dt, (dy / len) * sp * dt);
                }
            }
            player.x = Math.max(20 + player.r, Math.min(WORLD_W - 20 - player.r, player.x));
            player.y = Math.max(20 + player.r, Math.min(WORLD_H - 20 - player.r, player.y));
            if (!player.backstab) player.angle = Math.atan2(worldMouseY() - player.y, worldMouseX() - player.x);

            if ((dx || dy) && isRunning && !isDragging && !player.backstab) {
                footstepTimer -= dt;
                if (footstepTimer <= 0) {
                    footstepTimer = FOOTSTEP_INTERVAL;
                    SoundFX.footstep();
                    makeRunNoise();
                }
            } else {
                footstepTimer = 0;
            }

            if (player.draggingBody) {
                const isStatue = player.draggingBody.w !== undefined;
                if (isStatue) {
                    if (!statues.includes(player.draggingBody)) player.draggingBody = null;
                } else {
                    if (!enemies.includes(player.draggingBody) || !player.draggingBody.downed) {
                        player.draggingBody = null;
                    }
                }
            }
            if (player.draggingBody) {
                const dragDist = 22;
                const backAngle = player.angle + Math.PI;
                const bx = player.x + Math.cos(backAngle) * dragDist;
                const by = player.y + Math.sin(backAngle) * dragDist;
                if (player.draggingBody.w !== undefined) {
                    player.draggingBody.x = bx - player.draggingBody.w / 2;
                    player.draggingBody.y = by - player.draggingBody.h / 2;
                } else {
                    player.draggingBody.x = bx;
                    player.draggingBody.y = by;
                }
            }
            player.x = Math.max(20 + player.r, Math.min(WORLD_W - 20 - player.r, player.x));
            player.y = Math.max(20 + player.r, Math.min(WORLD_H - 20 - player.r, player.y));
            if (!player.backstab) player.angle = Math.atan2(worldMouseY() - player.y, worldMouseX() - player.x);
            if (player.shootCooldown > 0) player.shootCooldown -= dt;
            if (mouse.down && player.selectedItem === "pistol" && !player.backstab) tryShoot();

            const nearShop = shopPos && dist(player.x, player.y, shopPos.x, shopPos.y) < 70 && !extraction.active;
            shopHintEl.classList.toggle("hidden", !nearShop);

            for (let i = projectiles.length - 1; i >= 0; i--) {
                const g = projectiles[i];
                g.t += dt;
                if (!g.thrown && g.t < g.dur) {
                    const p = g.t / g.dur;
                    g.x = g.startX + (g.tx - g.startX) * p;
                    g.y = g.startY + (g.ty - g.startY) * p;
                } else if (!g.thrown) {
                    g.thrown = true;
                    if (g.type === "stone") { handleStoneLanding(g.x, g.y); projectiles.splice(i, 1); continue; }
                    if (g.type === "food") { handleFoodLanding(g); projectiles.splice(i, 1); continue; }
                    if (g.type === "lighter") { handleLighterLanding(g.x, g.y); projectiles.splice(i, 1); continue; }
                    g.fuse = g.type === "frag" ? 1.4 : 1.0;
                } else {
                    g.fuse -= dt;
                    if (g.fuse <= 0) {
                        if (g.type === "frag") explodeFrag(g.x, g.y);
                        else explodeSmoke(g.x, g.y);
                        projectiles.splice(i, 1);
                    }
                }
            }
            for (let i = droppedStones.length - 1; i >= 0; i--) {
                const s = droppedStones[i];
                s.life -= dt;
                if (s.life <= 0) { droppedStones.splice(i, 1); continue; }
                if (dist(player.x, player.y, s.x, s.y) < player.r + 18) {
                    player.stones++;
                    addFloatingText(s.x, s.y - 15, "+1 🪨", "#94a3b8");
                    spawnParticles(s.x, s.y, "#94a3b8", 8);
                    SoundFX.pickup();
                    droppedStones.splice(i, 1);
                    updateHUD();
                }
            }
            for (let i = droppedAmmo.length - 1; i >= 0; i--) {
                const a = droppedAmmo[i];
                a.life -= dt;
                if (a.life <= 0) { droppedAmmo.splice(i, 1); continue; }
                if (dist(player.x, player.y, a.x, a.y) < player.r + 18) {
                    if (player.hasPistol) {
                        player.pistolAmmo += a.amount;
                        addFloatingText(a.x, a.y - 15, `+${a.amount} balas`, "#fbbf24");
                    } else {
                        player.money += 10;
                        addFloatingText(a.x, a.y - 15, "+$10", "#fbbf24");
                    }
                    spawnParticles(a.x, a.y, "#fbbf24", 8);
                    SoundFX.pickup();
                    droppedAmmo.splice(i, 1);
                    updateHUD();
                }
            }

            for (let i = moneyPacks.length - 1; i >= 0; i--) {
                const m = moneyPacks[i];
                if (dist(player.x, player.y, m.x, m.y) < player.r + 18) {
                    player.money += m.amount;
                    addFloatingText(m.x, m.y - 20, `+$${m.amount}`, "#fbbf24");
                    spawnParticles(m.x, m.y, "#fbbf24", 10);
                    SoundFX.pickup();
                    moneyPacks.splice(i, 1);
                    updateHUD();
                }
            }
            for (let i = droppedFoods.length - 1; i >= 0; i--) {
                droppedFoods[i].life -= dt;
                if (droppedFoods[i].life <= 0) droppedFoods.splice(i, 1);
            }
            for (const p of papers) {
                if (p.collected) continue;
                if (dist(player.x, player.y, p.x, p.y) < player.r + 20) {
                    p.collected = true;
                    papersCollected++;
                    player.money += 25;
                    addFloatingText(p.x, p.y - 20, `+${p.digit}`, "#fbbf24");
                    spawnParticles(p.x, p.y, "#f5f5f0", 8);
                    SoundFX.pickupPaper(papersCollected - 1);
                    if (papersCollected >= TOTAL_PAPERS && !exitCodeRevealed) {
                        exitCode = papers.map(pp => pp.digit).join("");
                        exitCodeRevealed = true;
                        addFloatingText(player.x, player.y - 60, `CÓDIGO: ${exitCode}`, "#22c55e");
                    }
                    updateHUD();
                }
            }
            for (let i = smokes.length - 1; i >= 0; i--) {
                smokes[i].life -= dt;
                if (smokes[i].life <= 0) smokes.splice(i, 1);
            }
            for (let i = explosions.length - 1; i >= 0; i--) {
                explosions[i].life -= dt;
                if (explosions[i].life <= 0) explosions.splice(i, 1);
            }
            for (const p of packs) {
                if (p.used) continue;
                if (dist(player.x, player.y, p.x, p.y) < player.r + 16) {
                    p.used = true;
                    if (p.type === "health") {
                        player.hp = Math.min(player.maxHp, player.hp + 50);
                        spawnParticles(p.x, p.y, "#22c55e", 14);
                        addFloatingText(p.x, p.y - 20, "+50 VIDA", "#22c55e");
                    } else if (p.type === "ammo" && player.hasPistol) {
                        player.pistolAmmo += 10;
                        addFloatingText(p.x, p.y - 20, "+10 BALAS", "#fbbf24");
                        spawnParticles(p.x, p.y, "#fbbf24", 14);
                    }
                    SoundFX.pickup();
                    updateHUD();
                }
            }
            packSpawnTimer -= dt;
            if (packSpawnTimer <= 0) {
                packSpawnTimer = PACK_SPAWN_INTERVAL + Math.random() * 5;
                spawnRandomPack();
            }
            if (enemies.filter(e => !e.downed).length < MAX_ENEMIES) {
                enemyRespawnTimer -= dt;
                if (enemyRespawnTimer <= 0) { enemyRespawnTimer = ENEMY_RESPAWN_INTERVAL; spawnEnemyAtBase(); }
            } else enemyRespawnTimer = ENEMY_RESPAWN_INTERVAL;

            updateFlags(dt);
            for (const e of enemies) {
                if (e.hurtFlash > 0) e.hurtFlash -= dt;
                updateBotPerception(e, dt);
                updateBotAI(e, dt);
            }
            separateOverlappingEnemies();

            for (let i = enemyCars.length - 1; i >= 0; i--) {
                const car = enemyCars[i];
                if (car.hp <= 0 && !car.disabled) { spawnParticles(car.x, car.y, "#fbbf24", 30); enemyCars.splice(i, 1); continue; }
                updateEnemyCar(car, dt);
            }

            processBullets(dt);
            if (phase !== "combat") return;

            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (!e.downed && e.hp <= 0) {
                    stats.kills++;
                    if (e.special === "vip") {
                        vipDead = true;
                        stats.vipKilled = true;
                        vipDeathPos = { x: e.x, y: e.y };
                        vipDeathTimer = VIP_CORPSE_DISCOVER_DELAY;
                        cabinCheckBot = null;
                        cabinCheckReassignTimer = 0;
                        const vipStatue = { x: e.x - 12, y: e.y - 12, w: 24, h: 24, isVipCorpse: true };
                        statues.push(vipStatue);
                        spawnParticles(e.x, e.y, "#fbbf24", 30);
                        spawnParticles(e.x, e.y, "#ef4444", 20);
                        addFloatingText(e.x, e.y - 40, "¡OBJETIVO ELIMINADO!", "#fbbf24");
                        player.money += 500;
                        enemies.splice(i, 1);
                        SoundFX.explosion();
                        showNotification(``, "#fbbf24", 4);
                        updateHUD();
                        continue;
                    }
                    if (e.special === "guard" || e.bunkerGuard || e.cabinGuard) {
                        spawnParticles(e.x, e.y, "#eab308", 18);
                        player.money += 100;
                        addFloatingText(e.x, e.y - 30, "+$100", "#eab308");
                        if (e.bunkerGuard) {
                            const post = bunkerPosts[e.bunkerPostIdx];
                            if (post) post.occupiedBy = null;
                        }
                        droppedAmmo.push({ x: e.x, y: e.y, life: 30, maxLife: 30, amount: 8 });
                        enemies.splice(i, 1);
                        updateHUD();
                        continue;
                    }
                    e.hp = 0; e.downed = true; e.downedTimer = DOWNED_TIME; e.reviveTimer = 0;
                    e.state = "idle"; e.detectionLevel = 0; e.canSee = false;
                    spawnParticles(e.x, e.y, "#6b7280", 10);
                    player.money += 50;
                    addFloatingText(e.x, e.y - 30, "+$50", "#fbbf24");
                    droppedAmmo.push({ x: e.x + (Math.random() - 0.5) * 20, y: e.y + (Math.random() - 0.5) * 20, life: 30, maxLife: 30, amount: 5 });
                    updateHUD();
                }
            }
            if (extractionReady() && exitCodeRevealed && !extraction.active) {
                if (dist(player.x, player.y, exitZone.x, exitZone.y) < exitZone.r) {
                    extraction.active = true;
                    extraction.input = "";
                    extraction.paused = false;
                    keypadLayout = randomKeypad();
                    SoundFX.emergency();
                }
            }
            for (let i = effects.length - 1; i >= 0; i--) {
                const p = effects[i];
                p.x += p.vx * dt; p.y += p.vy * dt;
                p.vx *= 0.95; p.vy *= 0.95; p.life -= dt;
                if (p.life <= 0) effects.splice(i, 1);
            }
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const t = floatingTexts[i];
                t.y -= 25 * dt; t.life -= dt;
                if (t.life <= 0) floatingTexts.splice(i, 1);
            }
            updateCamera();
        }

        function updateFlags(dt) {
            for (const flag of combatFlags) {
                const playerNear = dist(player.x, player.y, flag.x, flag.y) < flag.radius;
                let enemyNear = 0;
                for (const e of enemies) if (!e.downed && dist(e.x, e.y, flag.x, flag.y) < flag.radius) enemyNear++;
                if (playerNear && enemyNear === 0) {
                    if (flag.owner !== "player") {
                        flag.progress += dt / flag.captureTime;
                        if (flag.progress >= 1) {
                            flag.owner = "player"; flag.progress = 0;
                            spawnParticles(flag.x, flag.y, "#3b82f6", 25);
                            player.money += 100;
                            addFloatingText(flag.x, flag.y - 40, "+$100", "#fbbf24");
                            updateHUD();
                        }
                    }
                } else if (!playerNear && enemyNear > 0) {
                    if (flag.owner !== "enemy") {
                        flag.progress += dt / flag.captureTime;
                        if (flag.progress >= 1) {
                            flag.owner = "enemy"; flag.progress = 0;
                            spawnParticles(flag.x, flag.y, "#ef4444", 25);
                            updateHUD();
                        }
                    }
                } else flag.progress = Math.max(0, flag.progress - dt * 0.3);
            }
        }

        function spawnEnemyAtPos(sx, sy) {
            let attempts = 0;
            while (attempts < 20) {
                let blocked = false;
                for (const s of [...walls, ...houses, ...rocks]) {
                    if (sx + 40 > s.x && sx - 40 < s.x + s.w && sy + 40 > s.y && sy - 40 < s.y + s.h) { blocked = true; break; }
                }
                if (!blocked) {
                    let tooClose = false;
                    for (const e of enemies) {
                        if (e.downed) continue;
                        if (dist(sx, sy, e.x, e.y) < 60) { tooClose = true; break; }
                    }
                    if (!tooClose) break;
                }
                sx += (Math.random() - 0.5) * 120;
                sy += (Math.random() - 0.5) * 120;
                sx = Math.max(60, Math.min(WORLD_W - 60, sx));
                sy = Math.max(60, Math.min(WORLD_H - 60, sy));
                attempts++;
            }

            const roles = ["flag1", "patrol", "patrol"];
            const role = roles[Math.floor(Math.random() * roles.length)];
            const targetFlag = role === "flag1" ? 0 : -1;
            const isSuspicious = emergencyProtocol && Math.random() < 0.4;
            const startState = isSuspicious ? "suspicious" : "idle";
            const suspicionPoint = isSuspicious ? {
                x: Math.max(80, Math.min(WORLD_W - 80, sx + (Math.random() - 0.5) * 350)),
                y: Math.max(80, Math.min(WORLD_H - 80, sy + (Math.random() - 0.5) * 350)),
            } : null;
            enemies.push({
                x: sx, y: sy, r: 14, hp: 40, maxHp: 40, type: "soldier",
                speed: BOT_IDLE_SPEED, cooldown: 1.5, angle: Math.PI / 2,
                facing: Math.random() * Math.PI * 2, hurtFlash: 0,
                state: startState, stateTimer: isSuspicious ? 10 : 0,
                detectionLevel: isSuspicious ? 0.5 : 0, canSee: false,
                suspicionPoint, lastSeen: null, role, targetFlag,
                wanderTarget: null,
                patrolCenter: { x: sx, y: sy },
                patrolRadius: 80 + Math.random() * 60,
                patrolPhase: Math.random() * Math.PI * 2,
                lookAroundTimer: Math.random() * 3,
                lookAroundBase: Math.random() * Math.PI * 2,
                searchSweep: 0, downed: false, downedTimer: 0, reviveTimer: 0,
                lastPosX: sx, lastPosY: sy, immobileTimer: 0,
            });
            spawnParticles(sx, sy, "#ef4444", 12);
        }
        function spawnEnemyAtBase() {
            const a = Math.random() * Math.PI * 2;
            const rad = 60 + Math.random() * 40;
            spawnEnemyAtPos(level1.enemyBase.x + Math.cos(a) * rad, level1.enemyBase.y + Math.sin(a) * rad);
        }
        function spawnRandomPack() {
            const alive = packs.filter(p => !p.used);
            if (alive.length >= MAX_PACKS) return;
            for (let tries = 0; tries < 30; tries++) {
                const px = 100 + Math.random() * (WORLD_W - 200);
                const py = 100 + Math.random() * (WORLD_H - 200);
                let blocked = false;
                for (const w of [...walls, ...houses, ...rocks]) {
                    if (px + 20 > w.x && px - 20 < w.x + w.w && py + 20 > w.y && py - 20 < w.y + w.h) { blocked = true; break; }
                }
                if (!blocked) {
                    const type = player.hasPistol && Math.random() < 0.5 ? "ammo" : "health";
                    packs.push({ x: px, y: py, type, used: false, life: 30 });
                    return;
                }
            }
        }

        /* ================== RENDER ================== */
        function drawTree(t) {
            ctx.save();
            if (t.burned && !t.burning) {
                ctx.fillStyle = "rgba(15, 15, 15, 0.75)";
                ctx.beginPath(); ctx.arc(t.x + t.w / 2, t.y + t.h / 2, t.w * 0.55, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#050505"; ctx.beginPath();
                ctx.arc(t.x + t.w / 2 - 3, t.y + t.h / 2 + 2, t.w * 0.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#0a0a0a"; ctx.fillRect(t.x + t.w / 2 - 3, t.y + t.h / 2 + 8, 6, 12);
                ctx.fillStyle = "rgba(120, 60, 20, 0.3)";
                ctx.beginPath(); ctx.arc(t.x + t.w / 2, t.y + t.h / 2, t.w * 0.35, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                return;
            }
            if (t.burning) {
                const flicker = Math.sin(performance.now() / 80 + (t.x * 0.01)) * 0.3 + 0.7;
                ctx.shadowColor = "#f97316";
                ctx.shadowBlur = 40 * flicker;
            }
            ctx.fillStyle = "rgba(34, 197, 94, 0.28)";
            ctx.beginPath(); ctx.arc(t.x + t.w / 2, t.y + t.h / 2, t.w * 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = t.burning ? "#78350f" : "#15803d"; ctx.beginPath();
            ctx.arc(t.x + t.w / 2, t.y + t.h / 2 - 4, t.w * 0.55, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = t.burning ? "#450a0a" : "#166534"; ctx.beginPath();
            ctx.arc(t.x + t.w / 2 - 5, t.y + t.h / 2 + 2, t.w * 0.4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#78350f"; ctx.fillRect(t.x + t.w / 2 - 3, t.y + t.h / 2 + 8, 6, 12);
            if (t.burning) {
                for (let i = 0; i < 6; i++) {
                    const ph = (performance.now() / 100 + i * 0.15) % 1;
                    const fx = t.x + t.w / 2 + Math.sin(performance.now() / 200 + i * 2) * 12;
                    const fy = t.y + t.h / 2 - 5 - ph * 45;
                    ctx.globalAlpha = (1 - ph) * 0.9;
                    ctx.fillStyle = ph < 0.5 ? "#fbbf24" : "#ef4444";
                    ctx.beginPath(); ctx.arc(fx, fy, 4 + ph * 4, 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        }
        function drawHouse(h) {
            ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(h.x + 3, h.y + 3, h.w, h.h);
            ctx.fillStyle = "#78716c"; ctx.fillRect(h.x, h.y, h.w, h.h);
            ctx.strokeStyle = "#44403c"; ctx.lineWidth = 3; ctx.strokeRect(h.x, h.y, h.w, h.h);
            ctx.fillStyle = "#991b1b"; ctx.beginPath();
            ctx.moveTo(h.x - 5, h.y); ctx.lineTo(h.x + h.w / 2, h.y - 25); ctx.lineTo(h.x + h.w + 5, h.y);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#57534e"; ctx.fillRect(h.x + h.w / 2 - 10, h.y + h.h - 30, 20, 30);
            ctx.fillStyle = "#fcd34d";
            ctx.fillRect(h.x + 10, h.y + 15, 15, 15);
            ctx.fillRect(h.x + h.w - 25, h.y + 15, 15, 15);
            ctx.strokeStyle = "#57534e"; ctx.lineWidth = 2;
            ctx.strokeRect(h.x + 10, h.y + 15, 15, 15);
            ctx.strokeRect(h.x + h.w - 25, h.y + 15, 15, 15);
        }
        function drawRock(r) {
            ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2 + 2, r.y + r.h / 2 + 3, r.w * 0.55, r.h * 0.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#6b7280"; ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w * 0.55, r.h * 0.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#9ca3af"; ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2 - 4, r.y + r.h / 2 - 4, r.w * 0.3, r.h * 0.25, 0, 0, Math.PI * 2); ctx.fill();
        }
        function drawStatue(s) {
            ctx.save(); ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
            if (s.isVipCorpse) {
                ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath();
                ctx.ellipse(2, s.h / 2, s.w * 0.7, s.h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#92400e"; ctx.beginPath();
                ctx.ellipse(0, 0, s.w * 0.55, s.h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#fbbf24"; ctx.beginPath();
                ctx.ellipse(-2, -2, s.w * 0.3, s.h * 0.25, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#000"; ctx.font = "bold 14px system-ui";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText("👑", 0, 0);
                ctx.restore();
                return;
            }
            ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath();
            ctx.ellipse(2, s.h / 2, s.w * 0.6, s.h * 0.25, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#6b7280"; ctx.fillRect(-s.w / 2, s.h / 2 - 6, s.w, 8);
            ctx.fillStyle = "#9ca3af"; ctx.fillRect(-s.w / 2 + 2, -s.h / 2 + 2, s.w - 4, 6);
            ctx.fillRect(-3, -s.h / 2 + 2, 6, s.h - 4);
            ctx.fillStyle = "#d1d5db"; ctx.beginPath();
            ctx.arc(0, -s.h / 2 + 6, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#000"; ctx.fillRect(-2, -s.h / 2 + 5, 1.5, 2); ctx.fillRect(0.5, -s.h / 2 + 5, 1.5, 2);
            ctx.restore();
        }
        function drawPaper(p) {
            if (p.collected) return;
            const pulse = 1 + Math.sin(performance.now() / 300) * 0.15;
            ctx.save(); ctx.translate(p.x, p.y);
            ctx.shadowColor = "#fef3c7"; ctx.shadowBlur = 15 * pulse;
            ctx.fillStyle = "#f5f5f0"; ctx.fillRect(-8 * pulse, -10 * pulse, 16 * pulse, 20 * pulse);
            ctx.shadowBlur = 0; ctx.strokeStyle = "#bbb"; ctx.lineWidth = 1;
            ctx.strokeRect(-8 * pulse, -10 * pulse, 16 * pulse, 20 * pulse);
            ctx.fillStyle = "#1e293b"; ctx.font = `bold ${Math.floor(12 * pulse)}px monospace`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(String(p.digit), 0, 1);
            ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
            ctx.restore();
        }
        function drawFlag(flag) {
            const owner = flag.owner || "neutral";
            const color = owner === "player" ? "#3b82f6" : owner === "enemy" ? "#ef4444" : "#9ca3af";
            const pulse = 1 + Math.sin(performance.now() / 250) * 0.1;
            ctx.save(); ctx.strokeStyle = color + "80"; ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(flag.x, flag.y, flag.radius, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]); ctx.restore();
            ctx.fillStyle = color + "22"; ctx.beginPath(); ctx.arc(flag.x, flag.y, flag.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#8b6d3f"; ctx.fillRect(flag.x - 2, flag.y - 35, 4, 45);
            ctx.fillStyle = color; ctx.beginPath();
            ctx.moveTo(flag.x + 2, flag.y - 35); ctx.lineTo(flag.x + 36, flag.y - 26); ctx.lineTo(flag.x + 2, flag.y - 17);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = color; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(flag.x, flag.y, 14 * pulse, 0, Math.PI * 2); ctx.stroke();
            if (flag.progress > 0) {
                const remaining = Math.ceil(flag.captureTime * (1 - flag.progress));
                const cy = flag.y - 90;
                ctx.font = "bold 52px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.strokeStyle = "#000"; ctx.lineWidth = 6;
                ctx.strokeText(String(remaining), flag.x, cy);
                ctx.fillStyle = remaining <= 3 ? "#ef4444" : "#ffffff";
                ctx.fillText(String(remaining), flag.x, cy);
                const bw = 110, bh = 8; const bx = flag.x - bw / 2, by = cy + 34;
                ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(bx, by, bw, bh);
                ctx.fillStyle = "#22d3ee"; ctx.fillRect(bx, by, bw * flag.progress, bh);
                ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
                ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
            }
        }
        function drawShopMarker() {
            if (!shopPos) return;
            const pulse = 1 + Math.sin(performance.now() / 300) * 0.2;
            ctx.save(); ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 25;
            ctx.fillStyle = `rgba(251, 191, 36, ${0.15 * pulse})`;
            ctx.beginPath(); ctx.arc(shopPos.x, shopPos.y, 60 * pulse, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#1f2937"; ctx.fillRect(shopPos.x - 20, shopPos.y - 15, 40, 30);
            ctx.fillStyle = "#fbbf24"; ctx.fillRect(shopPos.x - 15, shopPos.y - 10, 30, 20);
            ctx.fillStyle = "#000"; ctx.font = "bold 22px monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("$", shopPos.x, shopPos.y + 1);
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.7 * pulse})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(shopPos.x, shopPos.y, 40 * pulse, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
        function drawExitZone() {
            if (!exitZone) return;
            const isActive = extractionReady();
            const pulse = 1 + Math.sin(performance.now() / 250) * 0.15;
            ctx.save();
            if (isActive) { ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 30; ctx.strokeStyle = "rgba(34,197,94,0.9)"; ctx.lineWidth = 4; }
            else { ctx.strokeStyle = "rgba(148, 163, 184, 0.4)"; ctx.lineWidth = 2; }
            ctx.setLineDash([10, 8]);
            ctx.beginPath(); ctx.arc(exitZone.x, exitZone.y, exitZone.r * pulse, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            if (isActive) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
                ctx.beginPath(); ctx.arc(exitZone.x, exitZone.y, exitZone.r * pulse, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#22c55e"; ctx.font = "bold 14px system-ui"; ctx.textAlign = "center";
                ctx.fillText("EXTRACCIÓN", exitZone.x, exitZone.y - exitZone.r - 10);
                ctx.textAlign = "start";
            }
            ctx.restore();
        }
        function drawPacks() {
            for (const p of packs) {
                if (p.used) continue;
                const cx = p.x, cy = p.y;
                const pulse = 1 + Math.sin(performance.now() / 300) * 0.15;
                ctx.save();
                if (p.type === "health") {
                    ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 15;
                    ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0; ctx.fillStyle = "#fff";
                    ctx.fillRect(cx - 2, cy - 7, 4, 14); ctx.fillRect(cx - 7, cy - 2, 14, 4);
                } else {
                    ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 15;
                    ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0; ctx.fillStyle = "#000"; ctx.font = "bold 12px system-ui";
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText("A", cx, cy); ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
                }
                ctx.restore();
            }
        }
        function drawDroppedStones() {
            for (const s of droppedStones) {
                const pulse = s.life < 5 ? 0.5 + Math.sin(performance.now() / 150) * 0.3 : 1;
                ctx.save(); ctx.globalAlpha = pulse;
                ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath();
                ctx.ellipse(s.x + 1, s.y + 2, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#64748b"; ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = "#94a3b8"; ctx.beginPath();
                ctx.arc(s.x - 1.5, s.y - 1.5, 1.8, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }
        function drawDroppedAmmo() {
            for (const a of droppedAmmo) {
                const pulse = a.life < 5 ? 0.5 + Math.sin(performance.now() / 150) * 0.3 : 1;
                ctx.save(); ctx.globalAlpha = pulse;
                ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath();
                ctx.ellipse(a.x + 1, a.y + 2, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#fbbf24"; ctx.fillRect(a.x - 6, a.y - 5, 12, 10);
                ctx.strokeStyle = "#92400e"; ctx.lineWidth = 1.5; ctx.strokeRect(a.x - 6, a.y - 5, 12, 10);
                ctx.fillStyle = "#000"; ctx.font = "bold 8px monospace";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText("A", a.x, a.y);
                ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
                ctx.restore();
            }
        }
        function drawDroppedFoods() {
            for (const h of droppedFoods) {
                const pulse = 1 + Math.sin(performance.now() / 400) * 0.15;
                ctx.save(); ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 15;
                ctx.translate(h.x, h.y);
                let col = "#fbbf24";
                if (h.foodType === "choripan") col = "#c2410c";
                if (h.foodType === "roastbeef") col = "#7f1d1d";
                ctx.fillStyle = col; ctx.beginPath();
                ctx.ellipse(0, 0, 12 * pulse, 9 * pulse, 0, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#fef3c7"; ctx.beginPath();
                ctx.arc(10 * pulse, -2 * pulse, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }
        function drawGrills() {
            for (const g of grills) {
                ctx.save(); ctx.translate(g.x, g.y);
                ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath();
                ctx.ellipse(2, 4, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#18181b"; ctx.beginPath();
                ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#3f3f46"; ctx.lineWidth = 2; ctx.stroke();
                ctx.strokeStyle = "#52525b"; ctx.lineWidth = 1;
                for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 5, -9); ctx.lineTo(i * 5, 9); ctx.stroke(); }
                if (g.charges > 0 && g.regenTimer <= 0) {
                    const flicker = Math.sin(g.pulse * 8) * 0.3 + 0.7;
                    ctx.shadowColor = "#dc2626"; ctx.shadowBlur = 20 * flicker;
                    ctx.fillStyle = `rgba(220, 38, 38, ${0.6 * flicker})`;
                    ctx.beginPath(); ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }
                if (g.regenTimer > 0) {
                    const pct = 1 - (g.regenTimer / g.regenTotal);
                    ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.arc(0, 0, 32, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct); ctx.stroke();
                    ctx.fillStyle = "#22d3ee"; ctx.font = "bold 12px monospace";
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(`${Math.ceil(g.regenTimer)}s`, 0, 22);
                } else if (g.charges > 0) {
                    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 10px monospace";
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(`${g.charges}/${g.maxCharges}`, 0, 22);
                }
                ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
                ctx.restore();
            }
        }
        function drawPlacedMines() {
            for (const m of placedMines) {
                const armed = m.armDelay <= 0;
                const blink = Math.floor(m.pulse * 5) % 2 === 0;
                ctx.save(); ctx.translate(m.x, m.y);
                ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath();
                ctx.ellipse(2, 3, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#1f2937"; ctx.beginPath();
                ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.5; ctx.stroke();
                const ledColor = armed ? (blink ? "#ef4444" : "#7f1d1d") : (blink ? "#f59e0b" : "#78350f");
                ctx.shadowColor = armed ? "#ef4444" : "#f59e0b"; ctx.shadowBlur = blink ? 10 : 0;
                ctx.fillStyle = ledColor; ctx.beginPath();
                ctx.arc(0, -1, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        }
        function drawNails() {
            for (const n of placedNails) {
                ctx.save();
                ctx.translate(n.x, n.y);
                for (let i = 0; i < 5; i++) {
                    const a = (i / 5) * Math.PI * 2 + n.x * 0.01;
                    const nx = Math.cos(a) * 6;
                    const ny = Math.sin(a) * 6;
                    ctx.strokeStyle = "#a1a1aa"; ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(nx, ny);
                    ctx.lineTo(nx + Math.cos(a) * 4, ny + Math.sin(a) * 4);
                    ctx.stroke();
                    ctx.fillStyle = "#78716c";
                    ctx.beginPath(); ctx.arc(nx, ny, 1.2, 0, Math.PI * 2); ctx.fill();
                }
                ctx.fillStyle = "rgba(120, 113, 108, 0.3)";
                ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }
        function drawSkidmarks() {
            for (const s of skidmarks) {
                const alpha = s.life / s.maxLife;
                ctx.save();
                ctx.globalAlpha = alpha * 0.6;
                ctx.translate(s.x, s.y);
                ctx.rotate(s.angle);
                ctx.fillStyle = "#1a1a1a";
                ctx.fillRect(-4, -6, 8, 3);
                ctx.fillRect(-4, 3, 8, 3);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
        }
        function drawRcCar() {
            if ((!rcCar.active && !rcCar.parked) || rcCar.exploded) return;
            const alpha = rcCar.active ? 1 : 0.55;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(rcCar.x, rcCar.y);
            ctx.rotate(rcCar.angle);
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.beginPath(); ctx.ellipse(0, 3, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#8b5cf6";
            ctx.fillRect(-12, -8, 24, 16);
            ctx.strokeStyle = "#6d28d9"; ctx.lineWidth = 1.5; ctx.strokeRect(-12, -8, 24, 16);
            ctx.fillStyle = "#111";
            ctx.fillRect(-14, -10, 4, 6); ctx.fillRect(-14, 4, 4, 6);
            ctx.fillRect(10, -10, 4, 6); ctx.fillRect(10, 4, 4, 6);
            ctx.strokeStyle = "#000"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-12, -14); ctx.stroke();
            ctx.fillStyle = "#ef4444";
            ctx.beginPath(); ctx.arc(-12, -14, 2, 0, Math.PI * 2); ctx.fill();
            if (rcCar.honkFlash > 0) {
                const ha = rcCar.honkFlash / 0.5;
                ctx.strokeStyle = `rgba(139, 92, 246, ${ha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, 25 + (1 - ha) * 18, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 35 + (1 - ha) * 22, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            if (rcCar.hp < rcCar.maxHp) {
                ctx.save();
                const pct = rcCar.hp / rcCar.maxHp;
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.fillRect(rcCar.x - 18, rcCar.y - 22, 36, 5);
                ctx.fillStyle = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#eab308" : "#ef4444";
                ctx.fillRect(rcCar.x - 18, rcCar.y - 22, 36 * pct, 5);
                ctx.restore();
            }
            if (rcCar.parked && !rcCar.active) {
                ctx.save();
                ctx.fillStyle = "#8b5cf6"; ctx.font = "bold 11px system-ui";
                ctx.textAlign = "center"; ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
                ctx.strokeText("🚗 APARCADO (P)", rcCar.x, rcCar.y - 30);
                ctx.fillText("🚗 APARCADO (P)", rcCar.x, rcCar.y - 30);
                ctx.restore();
            }
        }
        function drawDogs() {
            for (const d of dogs) {
                ctx.save();
                ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.beginPath();
                ctx.ellipse(d.x, d.y + 4, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                ctx.save(); ctx.translate(d.x, d.y - d.leapArc); ctx.rotate(d.angle);
                ctx.fillStyle = "#1a1a1a"; ctx.beginPath();
                ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#000"; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = "#0d0d0d"; ctx.beginPath(); ctx.arc(12, 0, 8, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#000"; ctx.beginPath();
                ctx.moveTo(8, -5); ctx.lineTo(6, -13); ctx.lineTo(12, -7); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(8, 5); ctx.lineTo(6, 13); ctx.lineTo(12, 7); ctx.closePath(); ctx.fill();
                ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(19, 0, 2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ef4444"; ctx.beginPath();
                ctx.arc(14, -3, 2.2, 0, Math.PI * 2); ctx.arc(14, 3, 2.2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#fff"; ctx.beginPath();
                ctx.arc(14.5, -3.5, 0.8, 0, Math.PI * 2); ctx.arc(14.5, 2.5, 0.8, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(-14, 0);
                const tailWave = Math.sin(performance.now() / 80) * 6;
                ctx.quadraticCurveTo(-20, tailWave, -22, 0); ctx.stroke();
                ctx.restore();
                if (d.state === "eating") {
                    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 14px system-ui";
                    ctx.textAlign = "center";
                    ctx.fillText("🍖", d.x, d.y - 30 - d.leapArc);
                    ctx.textAlign = "start";
                } else if (d.state === "patrolling") {
                    ctx.fillStyle = "#94a3b8"; ctx.font = "bold 12px system-ui";
                    ctx.textAlign = "center";
                    ctx.fillText("👀", d.x, d.y - 30 - d.leapArc);
                    ctx.textAlign = "start";
                } else if (d.state === "searching") {
                    ctx.fillStyle = "#ef4444"; ctx.font = "bold 14px system-ui";
                    ctx.textAlign = "center";
                    ctx.fillText("🐾", d.x, d.y - 30 - d.leapArc);
                    ctx.textAlign = "start";
                }
            }
        }
        function drawEnemyBase() {
            const { x, y } = level1.enemyBase;
            const r = 48;
            ctx.fillStyle = "rgba(127, 29, 29, 0.35)"; ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "rgba(239, 68, 68, 0.6)"; ctx.lineWidth = 2;
            ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#7f1d1d"; ctx.fillRect(x - 22, y - 18, 44, 36);
            ctx.fillStyle = "#991b1b"; ctx.fillRect(x - 18, y - 14, 36, 28);
            ctx.fillStyle = "#450a0a"; ctx.fillRect(x - 12, y - 8, 24, 4); ctx.fillRect(x - 12, y + 4, 24, 4);
            ctx.fillStyle = "#ef4444"; ctx.fillRect(x - 1, y - 38, 3, 22);
            ctx.beginPath(); ctx.moveTo(x + 2, y - 38); ctx.lineTo(x + 20, y - 33); ctx.lineTo(x + 2, y - 28);
            ctx.closePath(); ctx.fill();
        }
        function drawCabin() {
            ctx.fillStyle = "rgba(120, 85, 45, 0.35)";
            ctx.fillRect(CABIN.x + 15, CABIN.y + 15, CABIN.w - 30, CABIN.h - 30);
            ctx.save();
            ctx.translate(EAT_SPOT.x, EAT_SPOT.y);
            ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath();
            ctx.ellipse(3, 5, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(-14, -6, 28, 6);
            ctx.strokeStyle = "#5c3a1a"; ctx.lineWidth = 1.5;
            ctx.strokeRect(-14, -6, 28, 6);
            ctx.fillStyle = "#78350f";
            ctx.fillRect(-12, 0, 3, 8); ctx.fillRect(9, 0, 3, 8);
            ctx.fillStyle = "#f5f5f0"; ctx.beginPath(); ctx.arc(0, -9, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#dc2626"; ctx.beginPath(); ctx.arc(-2, -10, 2, 0, Math.PI * 2); ctx.arc(2, -10, 1.8, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        function drawVisionCone(e) {
            if (e.downed) return;
            if (e.pushArc && e.pushArc > 0) return;
            ctx.save(); ctx.translate(e.x, e.y);
            if (e.state === "idle") {
                ctx.save(); ctx.rotate(e.facing);
                const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, PERIPHERAL_RANGE);
                pg.addColorStop(0, "rgba(148, 163, 184, 0.06)");
                pg.addColorStop(1, "rgba(148, 163, 184, 0)");
                ctx.fillStyle = pg; ctx.beginPath();
                ctx.moveTo(0, 0); ctx.arc(0, 0, PERIPHERAL_RANGE, -PERIPHERAL_ANGLE / 2, PERIPHERAL_ANGLE / 2);
                ctx.closePath(); ctx.fill(); ctx.restore();
            }
            ctx.rotate(e.facing);
            let visionRange = (e.special === "guard" || e.bunkerGuard || e.cabinGuard) ? VISION_RANGE * 1.15 : VISION_RANGE;
            if (emergencyProtocol) visionRange *= 1.4;
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, visionRange);
            if (e.state === "alert") { grad.addColorStop(0, "rgba(239, 68, 68, 0.32)"); grad.addColorStop(1, "rgba(239, 68, 68, 0)"); }
            else if (e.state === "suspicious") { grad.addColorStop(0, "rgba(251, 191, 36, 0.22)"); grad.addColorStop(1, "rgba(251, 191, 36, 0)"); }
            else { grad.addColorStop(0, "rgba(148, 163, 184, 0.10)"); grad.addColorStop(1, "rgba(148, 163, 184, 0)"); }
            ctx.fillStyle = grad; ctx.beginPath();
            ctx.moveTo(0, 0); ctx.arc(0, 0, visionRange, -VISION_ANGLE / 2, VISION_ANGLE / 2);
            ctx.closePath(); ctx.fill(); ctx.restore();
        }
        function drawEnemy(e) {
            if (e.downed) {
                ctx.save(); ctx.translate(e.x, e.y);
                ctx.fillStyle = "rgba(107, 114, 128, 0.5)"; ctx.beginPath();
                ctx.ellipse(0, 0, e.r * 1.2, e.r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#6b7280"; ctx.beginPath(); ctx.arc(0, 0, e.r * 0.7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ef4444"; ctx.font = "bold 14px system-ui";
                ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("✚", 0, 0);
                ctx.restore();
                if (player.draggingBody !== e) {
                    const pct = e.downedTimer / DOWNED_TIME;
                    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)"; ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct); ctx.stroke();
                }
                return;
            }
            const arc = e.pushArc || 0;
            if (arc > 0) {
                ctx.save();
                ctx.fillStyle = "rgba(0,0,0,0.45)";
                ctx.beginPath();
                ctx.ellipse(e.x, e.y + 4, e.r * 0.9, e.r * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.save(); ctx.translate(e.x, e.y - arc);
            ctx.save(); ctx.rotate(e.facing);
            const arrowColor = e.checkingCabin ? "#fbbf24" :
                e.state === "alert" ? "#ef4444" :
                    e.state === "suspicious" ? "#fbbf24" :
                        e.special === "vip" ? "#fbbf24" :
                            (e.special === "guard" || e.bunkerGuard) ? "#eab308" :
                                e.cabinGuard ? "#f97316" :
                                    e.prisonGuard ? "#a78bfa" : e.purple ? "#c084fc" : "#94a3b8";
            ctx.fillStyle = arrowColor; ctx.beginPath();
            ctx.moveTo(e.r + 10, 0); ctx.lineTo(e.r + 3, -6); ctx.lineTo(e.r + 3, 6);
            ctx.closePath(); ctx.fill(); ctx.restore();
            let bodyColor;
            if (e.hurtFlash > 0) bodyColor = "#ffffff";
            else if (e.purple) bodyColor = "#a855f7";
            else if (e.special === "vip") bodyColor = "#fbbf24";
            else if (e.cabinGuard) bodyColor = "#b45309";
            else if (e.special === "guard") bodyColor = "#a16207";
            else if (e.bunkerGuard) bodyColor = "#b45309";
            else if (e.prisonGuard) bodyColor = "#7c3aed";
            else bodyColor = "#dc2626";
            ctx.fillStyle = bodyColor; ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
            let strokeColor = "#7f1d1d";
            if (e.purple) strokeColor = "#6b21a8";
            if (e.special === "vip") strokeColor = "#92400e";
            else if (e.special === "guard" || e.bunkerGuard || e.cabinGuard) strokeColor = "#78350f";
            else if (e.prisonGuard) strokeColor = "#4c1d95";
            ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke();
            ctx.save(); ctx.rotate(e.angle);
            ctx.fillStyle = "#374151"; ctx.fillRect(e.r - 2, -3, 14, 6);
            ctx.restore();
            if (e.special === "vip") {
                ctx.fillStyle = "#fef3c7"; ctx.font = "bold 16px system-ui";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText("👑", 0, -e.r - 6);
                ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
            }
            if (e.special === "guard" || e.bunkerGuard || e.cabinGuard) {
                ctx.save(); ctx.translate(-e.r - 4, 0);
                ctx.strokeStyle = e.special === "guard" && e.bodyguard ? "#fef3c7" : "#fcd34d";
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-3, 0); ctx.lineTo(0, 4); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(-3, -4); ctx.stroke();
                ctx.restore();
            }
            ctx.restore();
            if (e.hp < e.maxHp) {
                const pct = e.hp / e.maxHp;
                ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(e.x - 22, e.y - e.r - 14 - arc, 44, 5);
                ctx.fillStyle = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#eab308" : "#ef4444";
                ctx.fillRect(e.x - 22, e.y - e.r - 14 - arc, 44 * pct, 5);
            }
        }
        function drawRadioIcon(cx, cy) {
            const t = performance.now() / 1000;
            const pulse = 0.7 + Math.sin(t * 10) * 0.3;
            ctx.save(); ctx.translate(cx, cy);
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = "#0f172a"; ctx.fillRect(-5, -3, 10, 12);
            ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 1.2; ctx.strokeRect(-5, -3, 10, 12);
            ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(3, -3); ctx.lineTo(3, -9); ctx.stroke();
            ctx.fillStyle = `rgba(34, 211, 238, ${0.5 + pulse * 0.5})`;
            ctx.fillRect(-3, -1, 6, 3);
            const waveAlpha = 0.85 * pulse;
            ctx.strokeStyle = `rgba(251, 191, 36, ${waveAlpha})`; ctx.lineWidth = 1.5;
            for (let i = 1; i <= 3; i++) {
                const r = 2 + i * 3.5;
                ctx.beginPath(); ctx.arc(3, -9, r, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55); ctx.stroke();
            }
            ctx.restore();
        }
        function drawKnifeIconOnEnemy(e) {
            const cx = e.x, cy = e.y - e.r - 34;
            const t = performance.now() / 1000;
            const scale = 1 + Math.sin(t * 15) * 0.15;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.font = "bold 26px system-ui";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 4;
            ctx.strokeText("🔪", 0, 0);
            ctx.fillText("🔪", 0, 0);
            ctx.restore();
        }
        function drawEnemyIndicator(e) {
            if (e.downed) return;
            const cx = e.x, cy = e.y - e.r - 30 - (e.pushArc || 0);
            if (e.state === "alert") {
                ctx.save(); ctx.fillStyle = "#ef4444"; ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = "#fff"; ctx.font = "bold 16px system-ui";
                ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("!", cx, cy + 1);
                ctx.restore();
            } else if (e.checkingCabin) {
                let icon = "👀";
                if (e.cabinCheckPhase === 'returning' || e.cabinCheckPhase === 'going_back') icon = "❓";
                else if (e.cabinCheckPhase === 'called_reinforcements') icon = "📻";
                const bgColor = (e.cabinCheckPhase === 'returning' || e.cabinCheckPhase === 'going_back') ? "#fbbf24" :
                    (e.cabinCheckPhase === 'called_reinforcements') ? "#fbbf24" : "#fbbf24";
                ctx.save();
                ctx.fillStyle = bgColor; ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = "#000"; ctx.font = "bold 14px system-ui";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(icon, cx, cy + 1);
                ctx.restore();
            } else if (e.state === "suspicious" || e.detectionLevel > 0.1) {
                ctx.save(); ctx.fillStyle = "#fbbf24"; ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = "#000"; ctx.font = "bold 16px system-ui";
                ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", cx, cy + 1);
                ctx.restore();
            }
            if (e.radioCallTimer && e.radioCallTimer > 0) drawRadioIcon(cx + 24, cy);
        }
        function drawEnemyCar(car) {
            ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.heading + Math.PI / 2);
            ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath();
            ctx.ellipse(2, 6, 24, 36, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#0d1014";
            ctx.fillRect(-26, -24, 6, 16); ctx.fillRect(20, -24, 6, 16);
            ctx.fillRect(-26, 8, 6, 16); ctx.fillRect(20, 8, 6, 16);
            let body = car.hurtFlash > 0 ? "#ffffff" : (car.speedMul > 1 ? "#991b1b" : "#7f1d1d");
            if (car.disabled) body = "#525252";
            ctx.fillStyle = body;
            ctx.fillRect(-22, -32, 44, 64);
            ctx.strokeStyle = "#450a0a"; ctx.lineWidth = 2; ctx.strokeRect(-22, -32, 44, 64);
            ctx.fillStyle = car.disabled ? "rgba(100,100,100,0.5)" : "rgba(150, 210, 255, 0.5)";
            ctx.fillRect(-16, -24, 32, 12); ctx.fillRect(-16, 12, 32, 12);
            if (car.sirenOn && !car.disabled) {
                const flash = Math.floor((car.sirenFlash || 0) * 6) % 2 === 0;
                ctx.save();
                if (flash) {
                    ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 30;
                    ctx.fillStyle = "#ef4444";
                } else {
                    ctx.shadowColor = "#7f1d1d"; ctx.shadowBlur = 8;
                    ctx.fillStyle = "#7f1d1d";
                }
                ctx.fillRect(-8, -18, 16, 5);
                ctx.restore();
                ctx.strokeStyle = "#450a0a"; ctx.lineWidth = 1;
                ctx.strokeRect(-8, -18, 16, 5);
                if (flash) {
                    ctx.save();
                    ctx.globalAlpha = 0.35;
                    ctx.fillStyle = "#ef4444";
                    ctx.beginPath();
                    ctx.moveTo(-8, -15); ctx.lineTo(-30, -35); ctx.lineTo(-18, -35); ctx.closePath(); ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(8, -15); ctx.lineTo(30, -35); ctx.lineTo(18, -35); ctx.closePath(); ctx.fill();
                    ctx.restore();
                }
            }
            ctx.fillStyle = "#fef3c7"; ctx.beginPath();
            ctx.arc(-15, -32, 4, 0, Math.PI * 2); ctx.arc(15, -32, 4, 0, Math.PI * 2); ctx.fill();
            if (car.disabled) {
                ctx.fillStyle = "#1f2937";
                ctx.beginPath(); ctx.ellipse(-23, -16, 3, 10, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(23, -16, 3, 10, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(-23, 16, 3, 10, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(23, 16, 3, 10, 0, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            if (!car.disabled && car.hp < car.maxHp) {
                const pct = car.hp / car.maxHp;
                ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(car.x - 28, car.y - 60, 56, 6);
                ctx.fillStyle = "#ef4444"; ctx.fillRect(car.x - 28, car.y - 60, 56 * pct, 6);
            }
        }
        function drawSmokes() {
            for (const s of smokes) {
                const alpha = Math.min(1, s.life / 2) * 0.8;
                ctx.save();
                for (let i = 0; i < 10; i++) {
                    const ang = (i / 10) * Math.PI * 2 + performance.now() / 3000;
                    const rad = s.r * 0.5;
                    const px = s.x + Math.cos(ang) * rad;
                    const py = s.y + Math.sin(ang) * rad;
                    const grd = ctx.createRadialGradient(px, py, 0, px, py, s.r * 0.7);
                    grd.addColorStop(0, `rgba(180, 190, 200, ${alpha * 0.55})`);
                    grd.addColorStop(1, "rgba(148, 163, 184, 0)");
                    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, s.r * 0.7, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }
        }
        function drawShadows() {
            ctx.save(); ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
            for (const s of shadows) {
                ctx.beginPath(); ctx.moveTo(s.poly[0].x, s.poly[0].y);
                for (let i = 1; i < s.poly.length; i++) ctx.lineTo(s.poly[i].x, s.poly[i].y);
                ctx.closePath(); ctx.fill();
            }
            ctx.restore();
        }
        function drawDarkness() {
            ctx.save(); ctx.fillStyle = "rgba(4, 10, 24, 0.6)";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H); ctx.restore();
        }
        function drawPrisonDoor() {
            if (!prisonDoor || prisonUnlocked) return;
            const d = prisonDoor;
            const pulse = 1 + Math.sin(performance.now() / 300) * 0.2;
            ctx.save();
            ctx.fillStyle = "#8b5a2b"; ctx.fillRect(d.x, d.y, d.w, d.h);
            ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
            ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 12 * pulse;
            ctx.strokeRect(d.x, d.y, d.w, d.h);
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fbbf24"; ctx.font = "bold 13px system-ui";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("🔒", d.x + d.w / 2, d.y + d.h / 2);
            ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
            ctx.restore();
        }
        function drawChest() {
            if (!level1.chest) return;
            const c = level1.chest;
            const pulse = 1 + Math.sin(performance.now() / 300) * 0.1;
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.beginPath(); ctx.ellipse(c.x + 2, c.y + 8, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = chestState.opened ? "#6b7280" : "#92400e";
            ctx.fillRect(c.x - 18, c.y - 10, 36, 22);
            ctx.strokeStyle = chestState.opened ? "#374151" : "#451a03";
            ctx.lineWidth = 2; ctx.strokeRect(c.x - 18, c.y - 10, 36, 22);
            if (chestState.opened) {
                ctx.fillStyle = "#78716c";
                ctx.fillRect(c.x - 18, c.y - 22, 36, 8);
                ctx.fillStyle = "#fbbf24";
                ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 15 * pulse;
                ctx.fillRect(c.x - 12, c.y - 6, 24, 4);
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = "#78350f";
                ctx.fillRect(c.x - 18, c.y - 16, 36, 8);
                ctx.fillStyle = "#fbbf24";
                ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 10 * pulse;
                ctx.beginPath(); ctx.arc(c.x, c.y - 2, 5, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "#451a03"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(c.x, c.y - 6, 3, Math.PI, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
        }
        function drawPrisoner() {
            if (!prisoner) return;
            const p = prisoner;
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.beginPath();
            ctx.ellipse(p.x + 1, p.y + 5, p.r * 1.1, p.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            ctx.save(); ctx.translate(p.x, p.y);
            if (p.hurtFlash > 0) { ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 15; }
            else if (p.following) { ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 12; }
            else if (p.atBase) { ctx.shadowColor = "#3b82f6"; ctx.shadowBlur = 12; }
            ctx.fillStyle = p.atBase ? "#3b82f6" : "#22c55e";
            ctx.strokeStyle = p.atBase ? "#1e40af" : "#14532d";
            ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
            ctx.lineWidth = 2; ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(-3, -2, 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(3, -2, 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#000";
            ctx.beginPath(); ctx.arc(-3, -2, 1.1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(3, -2, 1.1, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            if (p.hp < p.maxHp) {
                const pct = p.hp / p.maxHp;
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.fillRect(p.x - 22, p.y - p.r - 16, 44, 5);
                ctx.fillStyle = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#eab308" : "#ef4444";
                ctx.fillRect(p.x - 22, p.y - p.r - 16, 44 * pct, 5);
            }
            if (p.following) {
                ctx.save();
                ctx.fillStyle = "#22c55e"; ctx.font = "bold 11px system-ui";
                ctx.textAlign = "center";
                ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
                ctx.strokeText("Pichón", p.x, p.y - p.r - 22);
                ctx.fillText("Pichón", p.x, p.y - p.r - 22);
                ctx.restore();
            } else if (p.atBase) {
                ctx.save();
                ctx.fillStyle = "#3b82f6"; ctx.font = "bold 11px system-ui";
                ctx.textAlign = "center";
                ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
                ctx.strokeText("A SALVO ✓", p.x, p.y - p.r - 22);
                ctx.fillText("A SALVO ✓", p.x, p.y - p.r - 22);
                ctx.restore();
            }
        }
        function drawMinimap() {
            const mmW = 240, mmH = 150;
            const mmX = VIEW_W - mmW - 16;
            const mmY = VIEW_H - mmH - 16;
            const sx = mmW / WORLD_W, sy = mmH / WORLD_H;
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.85)"; ctx.fillRect(mmX, mmY, mmW, mmH);
            ctx.strokeStyle = "rgba(34, 211, 238, 0.6)"; ctx.lineWidth = 2; ctx.strokeRect(mmX, mmY, mmW, mmH);
            ctx.beginPath(); ctx.rect(mmX, mmY, mmW, mmH); ctx.clip();
            for (const w of walls) {
                ctx.fillStyle = w.isPrisonDoor ? "rgba(251, 191, 36, 0.9)" : "rgba(140,150,160,0.6)";
                ctx.fillRect(mmX + w.x * sx, mmY + w.y * sy, Math.max(1, w.w * sx), Math.max(1, w.h * sy));
            }
            for (const h of houses) { ctx.fillStyle = "rgba(120, 113, 108, 0.85)"; ctx.fillRect(mmX + h.x * sx, mmY + h.y * sy, Math.max(1, h.w * sx), Math.max(1, h.h * sy)); }
            for (const s of shadows) {
                ctx.fillStyle = "rgba(20, 20, 40, 0.7)";
                ctx.beginPath(); ctx.moveTo(mmX + s.poly[0].x * sx, mmY + s.poly[0].y * sy);
                for (let i = 1; i < s.poly.length; i++) ctx.lineTo(mmX + s.poly[i].x * sx, mmY + s.poly[i].y * sy);
                ctx.closePath(); ctx.fill();
            }
            if (shopPos) { ctx.fillStyle = "#fbbf24"; ctx.font = "bold 12px monospace"; ctx.fillText("$", mmX + shopPos.x * sx - 3, mmY + shopPos.y * sy + 4); }
            for (const p of packs) { if (p.used) continue; ctx.fillStyle = p.type === "health" ? "#22c55e" : "#fbbf24"; ctx.beginPath(); ctx.arc(mmX + p.x * sx, mmY + p.y * sy, 2, 0, Math.PI * 2); ctx.fill(); }
            for (const p of papers) { if (p.collected) continue; ctx.fillStyle = "#f5f5f0"; ctx.fillRect(mmX + p.x * sx - 1.5, mmY + p.y * sy - 1.5, 3, 3); }
            if (!chestState.opened && level1.chest) {
                ctx.fillStyle = "#fbbf24";
                ctx.fillRect(mmX + level1.chest.x * sx - 2.5, mmY + level1.chest.y * sy - 2.5, 5, 5);
                ctx.strokeStyle = "#000"; ctx.lineWidth = 1;
                ctx.strokeRect(mmX + level1.chest.x * sx - 2.5, mmY + level1.chest.y * sy - 2.5, 5, 5);
            }
            for (const n of placedNails) { ctx.fillStyle = "#a1a1aa"; ctx.fillRect(mmX + n.x * sx - 1.5, mmY + n.y * sy - 1.5, 3, 3); }
            for (const bt of burningTrees) {
                ctx.fillStyle = "#f97316";
                ctx.beginPath(); ctx.arc(mmX + (bt.tree.x + bt.tree.w / 2) * sx, mmY + (bt.tree.y + bt.tree.h / 2) * sy, 3, 0, Math.PI * 2); ctx.fill();
            }
            for (const t of trees) {
                if (t.burned && !t.burning) {
                    ctx.fillStyle = "#1a1a1a";
                    ctx.fillRect(mmX + (t.x + t.w / 2) * sx - 1.5, mmY + (t.y + t.h / 2) * sy - 1.5, 3, 3);
                }
            }
            for (const m of placedMines) { ctx.fillStyle = m.armDelay > 0 ? "#f59e0b" : "#ef4444"; ctx.fillRect(mmX + m.x * sx - 2, mmY + m.y * sy - 2, 4, 4); }
            for (const flag of combatFlags) {
                const color = flag.owner === "player" ? "#3b82f6" : flag.owner === "enemy" ? "#ef4444" : "#9ca3af";
                ctx.fillStyle = color; ctx.beginPath(); ctx.arc(mmX + flag.x * sx, mmY + flag.y * sy, 4, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(mmX + level1.enemyBase.x * sx, mmY + level1.enemyBase.y * sy, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#f97316"; ctx.lineWidth = 1.5;
            ctx.strokeRect(mmX + CABIN.x * sx, mmY + CABIN.y * sy, CABIN.w * sx, CABIN.h * sy);
            for (const e of enemies) {
                if (e.downed) ctx.fillStyle = "#6b7280";
                else if (e.checkingCabin) ctx.fillStyle = "#fbbf24";
                else if (e.purple) ctx.fillStyle = "#a855f7";
                else if (e.special === "vip") ctx.fillStyle = "#fbbf24";
                else if (e.special === "guard") ctx.fillStyle = e.bodyguard ? "#eab308" : "#a16207";
                else if (e.bunkerGuard) ctx.fillStyle = "#b45309";
                else if (e.cabinGuard) ctx.fillStyle = "#f97316";
                else if (e.prisonGuard) ctx.fillStyle = "#7c3aed";
                else if (e.reinforcement && e.reinforcement.timer > 0) ctx.fillStyle = "#fb923c";
                else ctx.fillStyle = e.state === "alert" ? "#ef4444" : e.state === "suspicious" ? "#fbbf24" : "#dc2626";
                ctx.beginPath(); ctx.arc(mmX + e.x * sx, mmY + e.y * sy, (e.special === "vip" || e.bunkerGuard || e.prisonGuard || e.cabinGuard || e.checkingCabin) ? 3.5 : 2, 0, Math.PI * 2); ctx.fill();
            }
            for (const d of dogs) {
                ctx.fillStyle = d.state === "searching" ? "#ef4444" : d.state === "eating" ? "#fbbf24" : "#94a3b8";
                ctx.beginPath(); ctx.arc(mmX + d.x * sx, mmY + d.y * sy, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.stroke();
            }
            for (const car of enemyCars) {
                ctx.fillStyle = car.disabled ? "#525252" : "#ef4444";
                ctx.fillRect(mmX + car.x * sx - 3, mmY + car.y * sy - 3, 6, 6);
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(mmX + car.x * sx - 3, mmY + car.y * sy - 3, 6, 6);
            }
            if ((rcCar.active || rcCar.parked) && !rcCar.exploded) {
                ctx.fillStyle = rcCar.active ? "#8b5cf6" : "rgba(139, 92, 246, 0.5)";
                ctx.beginPath(); ctx.arc(mmX + rcCar.x * sx, mmY + rcCar.y * sy, 3, 0, Math.PI * 2); ctx.fill();
            }
            if (prisoner) {
                ctx.fillStyle = prisoner.atBase ? "#3b82f6" : "#22c55e";
                ctx.beginPath(); ctx.arc(mmX + prisoner.x * sx, mmY + prisoner.y * sy, 3, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke();
            }
            if (exitZone && extractionReady()) {
                ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(mmX + exitZone.x * sx, mmY + exitZone.y * sy, exitZone.r * sx, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(mmX + player.x * sx, mmY + player.y * sy, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1.5;
            ctx.strokeRect(mmX + camera.x * sx, mmY + camera.y * sy, VIEW_W * sx, VIEW_H * sy);
            ctx.restore();
        }

        function drawKeypad(puzzleState, wrongFlash, codeLength = 8) {
            const display = puzzleState.input;
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
            ctx.fillStyle = "#fbbf24"; ctx.font = "bold 64px monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 20;
            ctx.fillText("🔒", VIEW_W / 2, 100);
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fff"; ctx.font = "bold 22px system-ui";
            ctx.fillText(puzzleState === prisonPuzzle ? "Puerta del prisionero Pichón" : puzzleState === chestPuzzle ? "COFRE CERRADO 🔐" : "EXTRACCIÓN", VIEW_W / 2, 160);
            ctx.font = "bold 54px monospace";
            let dispStr = "";
            for (let i = 0; i < codeLength; i++) dispStr += (i < display.length ? display[i] : "_") + " ";
            ctx.fillStyle = wrongFlash > 0 ? "#ef4444" : "#22c55e";
            ctx.shadowColor = wrongFlash > 0 ? "#ef4444" : "#22c55e";
            ctx.shadowBlur = 15;
            ctx.fillText(dispStr, VIEW_W / 2, 240);
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#94a3b8"; ctx.font = "14px system-ui";
            if (puzzleState === prisonPuzzle) {
                ctx.fillText(`Código invertido · (normal: ${exitCode.split("").join(" ")})`, VIEW_W / 2, 295);
            } else if (puzzleState === chestPuzzle) {
                ctx.fillText(`Código del cofre · Últimos 4 dígitos del documento`, VIEW_W / 2, 295);
            } else {
                ctx.fillText(`Introducí el código de 8 dígitos · ${Math.ceil(rushTimer.timeLeft)}s`, VIEW_W / 2, 295);
            }
            const buttons = getKeypadButtons();
            for (let i = 0; i < buttons.length; i++) {
                const b = buttons[i];
                const pressed = keypadPressed === i && keypadPressTimer > 0;
                ctx.save();
                if (pressed) ctx.translate(0, 2);
                if (b.type === "digit") {
                    ctx.fillStyle = pressed ? "#22d3ee" : "rgba(34, 211, 238, 0.15)";
                    ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 8); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = pressed ? "#000" : "#fff";
                    ctx.font = "bold 30px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(String(b.value), b.x + b.w / 2, b.y + b.h / 2 + 1);
                } else if (b.type === "backspace") {
                    ctx.fillStyle = pressed ? "#ef4444" : "rgba(239, 68, 68, 0.15)";
                    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 6); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = pressed ? "#000" : "#ef4444";
                    ctx.font = "bold 16px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText("BORRAR", b.x + b.w / 2, b.y + b.h / 2 + 1);
                } else if (b.type === "enter") {
                    ctx.fillStyle = pressed ? "#22c55e" : "rgba(34, 197, 94, 0.15)";
                    ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 6); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = pressed ? "#000" : "#22c55e";
                    ctx.font = "bold 16px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText("ENTER", b.x + b.w / 2, b.y + b.h / 2 + 1);
                }
                ctx.restore();
            }
            ctx.restore();
        }

        function drawRcOverlay() {
            if (!rcCar.active || rcCar.exploded) return;
            const signal = rcCar.signal;
            const glitch = Math.max(0, 1 - signal * 1.6);

            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            for (let y = 0; y < VIEW_H; y += 3) {
                ctx.fillRect(0, y, VIEW_W, 1);
            }
            for (let i = 0; i < 300; i++) {
                const x = Math.random() * VIEW_W;
                const y = Math.random() * VIEW_H;
                const a = Math.random() * 0.12;
                ctx.fillStyle = `rgba(255,255,255,${a})`;
                ctx.fillRect(x, y, 2, 2);
            }
            if (glitch > 0) {
                const bands = Math.floor(glitch * 10);
                for (let i = 0; i < bands; i++) {
                    const bandY = Math.random() * VIEW_H;
                    const bandH = 3 + Math.random() * 18;
                    const offset = (Math.random() - 0.5) * glitch * 50;
                    const colors = ['rgba(255,0,0,0.18)', 'rgba(0,255,255,0.18)', 'rgba(255,255,0,0.12)', 'rgba(255,255,255,0.08)'];
                    const c = colors[Math.floor(Math.random() * colors.length)];
                    ctx.fillStyle = c;
                    ctx.fillRect(offset, bandY, VIEW_W, bandH);
                }
                if (glitch > 0.5 && Math.random() < 0.4) {
                    ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.2})`;
                    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                }
            }
            if (signal < 0.7) {
                const color = signal <= 0 ? "#ef4444" : signal < 0.4 ? "#f97316" : "#fbbf24";
                ctx.fillStyle = color;
                ctx.font = "bold 18px monospace";
                ctx.textAlign = "center";
                ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
                const label = signal <= 0 ? "⚠ SEÑAL PERDIDA" : signal < 0.4 ? "📡 SEÑAL MUY DÉBIL" : "📡 SEÑAL DÉBIL";
                ctx.strokeText(label, VIEW_W / 2, 45);
                ctx.fillText(label, VIEW_W / 2, 45);
                const barsX = VIEW_W / 2 - 30;
                for (let i = 0; i < 4; i++) {
                    const filled = signal > i / 4;
                    ctx.fillStyle = filled ? color : "rgba(255,255,255,0.2)";
                    ctx.fillRect(barsX + i * 16, 55 - i * 3, 12, 4 + i * 3);
                }
            } else {
                ctx.fillStyle = "#22c55e";
                ctx.font = "bold 12px monospace";
                ctx.textAlign = "center";
                ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
                ctx.strokeText("● RC CONECTADO · P salir · Click bocina", VIEW_W / 2, 45);
                ctx.fillText("● RC CONECTADO · P salir · Click bocina", VIEW_W / 2, 45);
            }
            const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, Math.min(VIEW_W, VIEW_H) * 0.3, VIEW_W / 2, VIEW_H / 2, Math.max(VIEW_W, VIEW_H) * 0.7);
            vg.addColorStop(0, "rgba(0,0,0,0)");
            vg.addColorStop(1, "rgba(0,0,0,0.55)");
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);

            ctx.restore();
        }

        function renderCombat() {
            const isRcMode = isRcActive();
            const zoom = isRcMode ? RC_ZOOM : 1.0;

            ctx.fillStyle = emergencyProtocol ? "#1a0c0c" : "#0c1a1c";
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);

            ctx.save();
            if (shake > 0) {
                const m = shake * 20;
                ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
            }
            if (isRcMode) {
                ctx.translate(VIEW_W / 2, VIEW_H / 2);
                ctx.scale(zoom, zoom);
                ctx.translate(-VIEW_W / 2, -VIEW_H / 2);
            }
            ctx.translate(-camera.x, -camera.y);

            ctx.fillStyle = emergencyProtocol ? "#1a0c0c" : "#0c1a1c";
            ctx.fillRect(0, 0, WORLD_W, WORLD_H);
            const sx = Math.floor(camera.x / 60) * 60;
            const sy = Math.floor(camera.y / 60) * 60;
            ctx.fillStyle = emergencyProtocol ? "rgba(200, 40, 40, 0.05)" : "rgba(80, 140, 200, 0.04)";
            for (let x = sx; x < camera.x + VIEW_W / zoom + 60; x += 60) {
                for (let y = sy; y < camera.y + VIEW_H / zoom + 60; y += 60) ctx.fillRect(x, y, 30, 30);
            }
            ctx.strokeStyle = emergencyProtocol ? "rgba(220, 60, 60, 0.25)" : "rgba(120, 170, 220, 0.2)";
            ctx.lineWidth = 4; ctx.strokeRect(20, 20, WORLD_W - 40, WORLD_H - 40);

            drawExitZone();
            drawCabin();
            drawSkidmarks();
            drawShadows();
            for (const e of enemies) drawVisionCone(e);
            for (const t of trees) drawTree(t);
            for (const h of houses) drawHouse(h);
            for (const w of walls) {
                if (w.isPrisonDoor) continue;
                ctx.fillStyle = "#4b5563"; ctx.fillRect(w.x, w.y, w.w, w.h);
                ctx.fillStyle = "#6b7280"; ctx.fillRect(w.x, w.y, w.w, 4);
                ctx.strokeStyle = "#374151"; ctx.lineWidth = 2; ctx.strokeRect(w.x, w.y, w.w, w.h);
            }
            drawPrisonDoor();
            drawChest();
            for (const r of rocks) drawRock(r);
            for (const s of statues) drawStatue(s);
            for (const m of moneyPacks) {
                ctx.save();
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.fillRect(m.x - 7, m.y - 3, 14, 8);
                ctx.fillStyle = "#22c55e";
                ctx.fillRect(m.x - 8, m.y - 5, 16, 10);
                ctx.strokeStyle = "#15803d";
                ctx.lineWidth = 1;
                ctx.strokeRect(m.x - 8, m.y - 5, 16, 10);
                ctx.fillStyle = "#fbbf24";
                ctx.font = "bold 9px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("$", m.x, m.y);
                ctx.restore();
            }
            drawDroppedStones();
            drawDroppedAmmo();
            drawDroppedFoods();
            drawGrills();
            drawPlacedMines();
            drawNails();
            drawEnemyBase();
            for (const flag of combatFlags) drawFlag(flag);
            for (const p of papers) drawPaper(p);
            drawShopMarker();
            drawPacks();
            for (const e of enemies) drawEnemy(e);
            for (const car of enemyCars) drawEnemyCar(car);
            drawDogs();
            drawPrisoner();
            drawRcCar();

            if (player.backstab && player.backstab.enemy && enemies.includes(player.backstab.enemy)) {
                drawKnifeIconOnEnemy(player.backstab.enemy);
            }

            for (const b of bullets) {
                ctx.save(); ctx.shadowColor = b.friendly ? "#fbbf24" : "#ef4444"; ctx.shadowBlur = 10;
                ctx.fillStyle = b.friendly ? "#fbbf24" : "#ef4444";
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            }
            for (const g of projectiles) {
                ctx.save(); ctx.translate(g.x, g.y);
                if (g.type === "frag") {
                    ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();
                    if (Math.floor(performance.now() / 100) % 2 === 0) {
                        ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
                    }
                } else if (g.type === "smoke") {
                    ctx.fillStyle = "#94a3b8"; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();
                } else if (g.type === "stone") {
                    ctx.fillStyle = "#64748b"; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5; ctx.stroke();
                } else if (g.type === "food") {
                    const col = g.foodType === "choripan" ? "#c2410c" : g.foodType === "roastbeef" ? "#7f1d1d" : g.foodType === "parrillada" ? "#dc2626" : "#fbbf24";
                    ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.fillStyle = col;
                    ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }
                ctx.restore();
            }
            for (const p of effects) {
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
            for (const ex of explosions) {
                const p = 1 - (ex.life / ex.maxLife);
                const r = ex.r * p;
                ctx.save(); ctx.globalAlpha = 1 - p;
                const grd = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, r);
                grd.addColorStop(0, "rgba(255, 220, 100, 0.9)");
                grd.addColorStop(0.5, "rgba(251, 146, 60, 0.6)");
                grd.addColorStop(1, "rgba(239, 68, 68, 0)");
                ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(ex.x, ex.y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            }
            drawSmokes();

            if (player.backstab) {
                const prog = 1 - (player.backstab.timer / player.backstab.duration);
                ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle);
                ctx.globalAlpha = 1 - prog * 0.5;
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 4;
                ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 15;
                const startA = -Math.PI / 2, endA = Math.PI / 2;
                const currentA = startA + (endA - startA) * prog;
                ctx.beginPath(); ctx.arc(player.r + 5, 0, player.r + 22, currentA - 0.3, currentA + 0.3); ctx.stroke();
                ctx.restore(); ctx.globalAlpha = 1;
            }
            if (knifeFlash > 0) {
                const total = 0.3;
                const prog = 1 - knifeFlash / total;
                ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle);
                ctx.globalAlpha = 1 - prog; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4;
                ctx.shadowColor = "#fff"; ctx.shadowBlur = 12;
                const startA = -Math.PI / 3, endA = Math.PI / 3;
                const currentA = startA + (endA - startA) * prog;
                ctx.beginPath(); ctx.arc(player.r, 0, player.r + 28, currentA - 0.35, currentA + 0.1); ctx.stroke();
                ctx.restore(); ctx.globalAlpha = 1;
            }
            if (kickFlash > 0) {
                const total = 0.25;
                const prog = 1 - kickFlash / total;
                ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle);
                ctx.globalAlpha = 1 - prog;
                ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 5;
                ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 12;
                ctx.beginPath(); ctx.arc(player.r + 10, 0, 14, -Math.PI / 2, Math.PI / 2); ctx.stroke();
                ctx.restore(); ctx.globalAlpha = 1;
            }
            ctx.restore();

            if (isRcMode) {
                ctx.save();
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                ctx.restore();
            } else {
                drawDarkness();
            }

            ctx.save();
            if (shake > 0) {
                const m = shake * 20;
                ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
            }
            if (isRcMode) {
                ctx.translate(VIEW_W / 2, VIEW_H / 2);
                ctx.scale(zoom, zoom);
                ctx.translate(-VIEW_W / 2, -VIEW_H / 2);
            }
            ctx.translate(-camera.x, -camera.y);
            const wmx = worldMouseX(); const wmy = worldMouseY();
            if (!isRcMode && !player.backstab && dist(player.x, player.y, wmx, wmy) > 30) {
                ctx.save(); ctx.strokeStyle = "rgba(34, 211, 238, 0.25)"; ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 6]); ctx.beginPath();
                ctx.moveTo(player.x + Math.cos(player.angle) * (player.r + 8), player.y + Math.sin(player.angle) * (player.r + 8));
                ctx.lineTo(wmx, wmy); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
            }
            ctx.save(); ctx.translate(player.x, player.y);
            if (player.hurtFlash > 0) { ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 20; }
            const isHidden = isPlayerHidden();
            if (isRcMode) ctx.globalAlpha = 0.4;
            ctx.fillStyle = isHidden ? "#155e75" : "#22d3ee";
            ctx.strokeStyle = isHidden ? "#0c4a6e" : "#0891b2";
            ctx.beginPath(); ctx.arc(0, 0, player.r, 0, Math.PI * 2); ctx.fill();
            ctx.lineWidth = 2; ctx.stroke();
            ctx.rotate(player.angle);
            if (player.selectedItem === "pistol" && !player.backstab && !isRcMode) {
                ctx.fillStyle = "#374151"; ctx.fillRect(player.r - 2, -3, 16, 6);
            } else if (player.selectedItem && ITEM_DISPLAY[player.selectedItem] && !player.backstab && !isRcMode) {
                ctx.fillStyle = ITEM_DISPLAY[player.selectedItem].color;
                ctx.beginPath(); ctx.arc(player.r + 4, 0, 5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
            if (player.draggingBody && !isRcMode) {
                ctx.save();
                ctx.translate(player.x, player.y);
                ctx.fillStyle = "#fbbf24"; ctx.font = "bold 11px system-ui";
                ctx.textAlign = "center"; ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
                ctx.strokeText("📦 ARRASTRANDO (Q)", 0, player.r + 18);
                ctx.fillText("📦 ARRASTRANDO (Q)", 0, player.r + 18);
                ctx.restore();
            }
            if (!isRcMode) {
                ctx.save(); ctx.translate(wmx, wmy);
                const chColor = player.selectedItem === "pistol" ? "rgba(251, 191, 36, 0.95)" : "rgba(34, 211, 238, 0.95)";
                ctx.strokeStyle = chColor; ctx.lineWidth = 2; ctx.shadowColor = chColor; ctx.shadowBlur = 6;
                ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-14, 0); ctx.lineTo(-9, 0); ctx.moveTo(9, 0); ctx.lineTo(14, 0);
                ctx.moveTo(0, -14); ctx.lineTo(0, -9); ctx.moveTo(0, 9); ctx.lineTo(0, 14); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, Math.PI * 2); ctx.fillStyle = chColor; ctx.fill();
                ctx.restore();
            }
            for (const e of enemies) drawEnemyIndicator(e);
            if (isHidden && !isRcMode) {
                ctx.save(); ctx.translate(player.x, player.y);
                ctx.fillStyle = "rgba(34, 197, 94, 0.95)"; ctx.font = "bold 13px system-ui";
                ctx.textAlign = "center"; ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
                ctx.strokeText("🥷 OCULTO", 0, -player.r - 18);
                ctx.fillText("🥷 OCULTO", 0, -player.r - 18);
                ctx.textAlign = "start"; ctx.restore();
            }
            if (!prisonUnlocked && prisonDoor && !extraction.active && !prisonPuzzle.active && !isRcMode) {
                const dcx = prisonDoor.x + prisonDoor.w / 2;
                const dcy = prisonDoor.y + prisonDoor.h / 2;
                if (dist(player.x, player.y, dcx, dcy) < 80) {
                    ctx.save();
                    ctx.translate(dcx, dcy - 45);
                    ctx.fillStyle = "rgba(0,0,0,0.9)";
                    ctx.fillRect(-110, -16, 220, 32);
                    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
                    ctx.strokeRect(-110, -16, 220, 32);
                    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 13px system-ui";
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText("E — INTRODUCIR CÓDIGO 🔒", 0, 0);
                    ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
                    ctx.restore();
                }
            }
            if (!chestState.opened && level1.chest && !extraction.active && !prisonPuzzle.active && !chestPuzzle.active && !isRcMode) {
                const ccx = level1.chest.x;
                const ccy = level1.chest.y;
                if (dist(player.x, player.y, ccx, ccy) < 70) {
                    ctx.save();
                    ctx.translate(ccx, ccy - 45);
                    ctx.fillStyle = "rgba(0,0,0,0.9)";
                    ctx.fillRect(-110, -16, 220, 32);
                    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
                    ctx.strokeRect(-110, -16, 220, 32);
                    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 13px system-ui";
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText("E — ABRIR COFRE 🔐", 0, 0);
                    ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
                    ctx.restore();
                }
            }
            for (const t of floatingTexts) {
                const alpha = t.life / t.maxLife;
                ctx.save(); ctx.globalAlpha = alpha; ctx.font = "bold 15px system-ui";
                ctx.textAlign = "center"; ctx.strokeStyle = "#000"; ctx.lineWidth = 3;
                ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
                ctx.restore();
            }
            ctx.restore();

            drawRcOverlay();

            if (!document.body.classList.contains("pro-mode")) {
                drawMinimap();
            }
            drawBodyCamera();
            for (let i = 0; i < notifications.length; i++) {
                const n = notifications[i];
                const alpha = Math.min(1, n.life);
                ctx.save(); ctx.globalAlpha = alpha; ctx.font = "bold 32px system-ui";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                const yPos = 200 + i * 50;
                ctx.strokeStyle = "#000"; ctx.lineWidth = 5;
                ctx.strokeText(n.text, VIEW_W / 2, yPos);
                ctx.fillStyle = n.color; ctx.fillText(n.text, VIEW_W / 2, yPos);
                ctx.restore();
            }
            if (itemLegend.life > 0) {
                const alpha = Math.min(1, itemLegend.life * 2);
                ctx.save(); ctx.globalAlpha = alpha; ctx.font = "bold 16px system-ui";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                const y = VIEW_H - 90;
                ctx.strokeStyle = "#000"; ctx.lineWidth = 5;
                ctx.strokeText(itemLegend.text, VIEW_W / 2, y);
                ctx.fillStyle = itemLegend.color;
                ctx.fillText(itemLegend.text, VIEW_W / 2, y);
                ctx.restore();
            }
            if (prisonPuzzle.active) drawKeypad(prisonPuzzle, prisonPuzzle.wrongFlash);
            if (chestPuzzle.active) drawKeypad(chestPuzzle, chestPuzzle.wrongFlash, 4);
            if (extraction.active) {
                if (!extraction.paused) drawKeypad(extraction, extraction.wrongFlash);
                else {
                    ctx.save();
                    ctx.fillStyle = "rgba(0,0,0,0.9)"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
                    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 20px monospace";
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(`⚠️ PAUSADO · ${Math.ceil(rushTimer.timeLeft)}s · E para reanudar`, VIEW_W / 2, VIEW_H / 2);
                    ctx.restore();
                }
            }
            function drawBodyCamera() {
                if (!bodyCamera.active || !bodyCamera.bot) return;
                const bot = bodyCamera.bot;
                const camW = 220, camH = 140;
                const camX = VIEW_W - camW - 16;
                const camY = 60;
                ctx.save();
                ctx.fillStyle = "rgba(5, 12, 20, 0.92)";
                ctx.fillRect(camX, camY, camW, camH);
                ctx.strokeStyle = bot.state === "alert" ? "#ef4444" : "#fbbf24";
                ctx.lineWidth = 2; ctx.strokeRect(camX, camY, camW, camH);
                ctx.fillStyle = bot.state === "alert" ? "#ef4444" : "#fbbf24";
                ctx.font = "bold 10px monospace";
                let camLabel = bot.state === "alert" ? "● CAM - ALERTA" : "● CAM - SOSPECHA";
                if (bot.checkingCabin && bot.cabinCheckPhase === 'checking') camLabel = "● CAM - INVESTIGANDO";
                else if (bot.checkingCabin && bot.cabinCheckPhase === 'returning') camLabel = "● CAM - REGRESANDO";
                else if (bot.checkingCabin && bot.cabinCheckPhase === 'going_back') camLabel = "● CAM - VOLVIENDO";
                else if (bot.checkingCabin && bot.cabinCheckPhase === 'called_reinforcements') camLabel = "● CAM - REFUERZOS";
                ctx.fillText(camLabel, camX + 8, camY + 16);
                ctx.beginPath(); ctx.rect(camX + 2, camY + 22, camW - 4, camH - 24); ctx.clip();
                ctx.translate(camX + camW / 2 - bot.x, camY + (camH + 22) / 2 - bot.y);
                drawShadows();
                for (const t of trees) drawTree(t);
                for (const h of houses) drawHouse(h);
                for (const w of walls) {
                    if (w.isPrisonDoor) continue;
                    ctx.fillStyle = "#4b5563"; ctx.fillRect(w.x, w.y, w.w, w.h);
                }
                for (const st of statues) drawStatue(st);
                for (const e of enemies) { drawVisionCone(e); drawEnemy(e); drawEnemyIndicator(e); }
                ctx.restore();
            }
        }

        let lastT = performance.now();
        let hudUpdateTimer = 0;
        function loop(t) {
            const dt = Math.min((t - lastT) / 1000, 0.05);
            lastT = t;
            if (phase === "combat") {
                updateCombat(dt);
                renderCombat();
                hudUpdateTimer += dt;
                if (hudUpdateTimer > 0.1) { hudUpdateTimer = 0; updateHUD(); }
            }
            requestAnimationFrame(loop);
        }

        initMenu();
        requestAnimationFrame(loop);
    }

    function start() {
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", start, { once: true });
            return;
        }
        ensureDOM();
        boot();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();