(() => {
    "use strict";

    /* ====================== CSS INYECTADO ====================== */
    const CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --accent: #22d3ee; }
    html, body {
      width: 100%; height: 100%;
      background: radial-gradient(circle at 50% 0%, #1b2430, #07090d 70%);
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      color: #e6edf3;
      overflow: hidden;
      display: grid;
      place-items: center;
    }
    .game-wrap {
      position: relative;
      width: min(400px, 92vw);
      max-height: 94vh;
      aspect-ratio: 400 / 620;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.07);
      user-select: none;
    }
    canvas {
      display: block; width: 100%; height: 100%;
      touch-action: none;
    }
    .hud {
      position: absolute; top: 14px; left: 16px; right: 16px;
      display: flex; justify-content: space-between; pointer-events: none;
    }
    .hud-item { display: flex; flex-direction: column; gap: 2px; }
    .hud-item.right { text-align: right; }
    .hud .label, .hud-ammo .label {
      font-size: 10px; letter-spacing: .18em; text-transform: uppercase;
      font-weight: 700; color: #8b98a8;
    }
    .hud-item span:last-child {
      font-size: 18px; font-weight: 800; color: #fff;
      text-shadow: 0 2px 10px rgba(0,0,0,.6);
    }
    .hud-ammo {
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      pointer-events: none;
    }
    #ammo {
      font-size: 22px; font-weight: 900; color: var(--accent);
      text-shadow: 0 0 14px rgba(34,211,238,.6), 0 2px 10px rgba(0,0,0,.6);
      transition: color .2s ease, transform .15s ease;
    }
    #ammo.empty {
      color: #e5484d;
      text-shadow: 0 0 14px rgba(229,72,77,.5), 0 2px 10px rgba(0,0,0,.6);
    }
    #ammo.gain { animation: gainFlash .35s ease; }
    @keyframes gainFlash {
      0%   { transform: scale(1);   color: var(--accent); }
      50%  { transform: scale(1.5); color: #10b981; }
      100% { transform: scale(1);   color: var(--accent); }
    }
    .overlay {
      position: absolute; inset: 0; display: grid; place-items: center;
      padding: 24px; text-align: center;
      background: rgba(5,8,12,.75);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      transition: opacity .25s ease, visibility .25s ease;
    }
    .overlay.hidden { opacity: 0; visibility: hidden; }
    .panel h1 { font-size: 24px; line-height: 1.25; margin-bottom: 12px; }
    .panel p {
      font-size: 14px; line-height: 1.7; color: #9aa8b8; margin-bottom: 24px;
    }
    .panel p strong { color: var(--accent); }
    .panel button {
      font: inherit; font-weight: 800; letter-spacing: .06em;
      text-transform: uppercase; font-size: 14px;
      padding: 14px 36px; border: 0; border-radius: 999px; cursor: pointer;
      color: #04141a;
      background: linear-gradient(180deg, #5ee7f7, var(--accent));
      box-shadow: 0 8px 24px rgba(34,211,238,.35);
      transition: transform .12s ease, box-shadow .12s ease;
    }
    .panel button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(34,211,238,.5);
    }
    .panel button:active { transform: translateY(0) scale(.97); }
  `;

    /* ====================== CONSTRUIR DOM ====================== */
    function buildDOM() {
        // Si ya existe el wrap, no duplicar
        if (document.querySelector(".game-wrap")) return;

        const style = document.createElement("style");
        style.textContent = CSS;
        document.head.appendChild(style);

        const wrap = document.createElement("div");
        wrap.className = "game-wrap";
        wrap.innerHTML = `
      <canvas id="game" width="400" height="620"></canvas>
      <div class="hud">
        <div class="hud-item">
          <span class="label">Puntos</span>
          <span id="score">0</span>
        </div>
        <div class="hud-item right">
          <span class="label">Récord</span>
          <span id="best">0</span>
        </div>
      </div>
      <div class="hud-ammo">
        <span class="label">Balas</span>
        <span id="ammo">5</span>
      </div>
      <div class="overlay" id="overlay">
        <div class="panel">
          <h1 id="ovTitle">🚗 Esquiva el Tráfico</h1>
          <p id="ovText">
            Muévete con <strong>← →</strong> o <strong>A / D</strong>.<br>
            Dispara con <strong>Espacio</strong>.<br>
            Cada 5 autos que esquives, ¡+1 bala!
          </p>
          <button id="ovBtn">Jugar</button>
        </div>
      </div>
    `;
        document.body.appendChild(wrap);
    }

    /* ====================== JUEGO ====================== */
    function boot() {
        const canvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById("game"));
        if (!canvas) { console.error("❌ No se pudo crear el canvas."); return; }
        const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
        if (!ctx) { console.error("❌ No se pudo obtener el contexto 2D."); return; }

        const W = canvas.width;
        const H = canvas.height;
        const ROAD_X = 46;
        const ROAD_W = W - ROAD_X * 2;
        const ROAD_RIGHT = ROAD_X + ROAD_W;
        const MARGIN = 12;

        const scoreEl = /** @type {HTMLElement} */ (document.getElementById("score"));
        const bestEl = /** @type {HTMLElement} */ (document.getElementById("best"));
        const ammoEl = /** @type {HTMLElement} */ (document.getElementById("ammo"));
        const overlay = /** @type {HTMLElement} */ (document.getElementById("overlay"));
        const ovTitle = /** @type {HTMLElement} */ (document.getElementById("ovTitle"));
        const ovText = /** @type {HTMLElement} */ (document.getElementById("ovText"));
        const ovBtn = /** @type {HTMLElement} */ (document.getElementById("ovBtn"));

        const ENEMY_COLORS = ["#e5484d", "#f5a623", "#3b82f6", "#10b981", "#a855f7"];

        function loadBest() {
            try { return Number(localStorage.getItem("carGameBest")) || 0; }
            catch (_) { return 0; }
        }
        function saveBest(value) {
            try { localStorage.setItem("carGameBest", String(value)); }
            catch (_) { /* ignorar */ }
        }

        let best = loadBest();
        bestEl.textContent = String(best);

        const state = {
            running: false, time: 0, speed: 0, score: 0, scroll: 0, spawnTimer: 0,
            shake: 0,
            keys: { left: false, right: false },
            car: { x: 0, y: 0, w: 46, h: 82, vx: 0 },
            obstacles: [], bullets: [], ammo: 5, passedCount: 0,
        };

        function rr(x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }
        function shade(hex, amt) {
            const n = parseInt(hex.slice(1), 16);
            const r = Math.max(0, Math.min(255, (n >> 16) + amt));
            const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
            const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
            return `rgb(${r},${g},${b})`;
        }
        const rand = (min, max) => min + Math.random() * (max - min);
        function hit(a, b, p = 0) {
            return (
                a.x + p < b.x + b.w - p && a.x + a.w - p > b.x + p &&
                a.y + p < b.y + b.h - p && a.y + a.h - p > b.y + p
            );
        }
        function updateAmmoUI() {
            ammoEl.textContent = String(state.ammo);
            ammoEl.classList.toggle("empty", state.ammo === 0);
        }

        function reset() {
            state.time = 0; state.speed = 300; state.score = 0; state.scroll = 0;
            state.spawnTimer = 0.7; state.shake = 0;
            state.obstacles.length = 0; state.bullets.length = 0;
            state.keys.left = state.keys.right = false;
            state.ammo = 5; state.passedCount = 0;

            const c = state.car;
            c.w = 46; c.h = 82;
            c.x = W / 2 - c.w / 2;
            c.y = H - 132;
            c.vx = 0;
            scoreEl.textContent = "0";
            updateAmmoUI();
        }

        function startGame() {
            if (state.running) return;
            reset();
            state.running = true;
            overlay.classList.add("hidden");
        }

        function gameOver() {
            state.running = false;
            state.shake = 0.45;
            const points = Math.floor(state.score);
            if (points > best) {
                best = points;
                saveBest(best);
                bestEl.textContent = String(best);
            }
            ovTitle.textContent = "💥 ¡Chocaste!";
            ovText.innerHTML = `Puntos: <strong>${points}</strong><br>Récord: <strong>${best}</strong>`;
            ovBtn.textContent = "Reintentar";
            overlay.classList.remove("hidden");
        }

        function shoot() {
            if (!state.running || state.ammo <= 0) return;
            state.ammo--; updateAmmoUI();
            const c = state.car;
            state.bullets.push({
                x: c.x + c.w / 2 - 3, y: c.y - 6, w: 6, h: 16,
                speed: 950, dead: false,
            });
            state.shake = Math.max(state.shake, 0.06);
        }

        function onObstaclePassed() {
            state.passedCount++;
            if (state.passedCount >= 5) {
                state.passedCount = 0;
                state.ammo++;
                updateAmmoUI();
                ammoEl.classList.remove("gain");
                void ammoEl.offsetWidth;
                ammoEl.classList.add("gain");
            }
        }

        function spawnObstacle() {
            const isCone = Math.random() < 0.28;
            const w = isCone ? 34 : 46;
            const h = isCone ? 36 : 82;
            const minX = ROAD_X + MARGIN;
            const maxX = ROAD_RIGHT - MARGIN - w;
            state.obstacles.push({
                x: rand(minX, maxX), y: -h - 30, w, h,
                type: isCone ? "cone" : "car",
                color: ENEMY_COLORS[(Math.random() * ENEMY_COLORS.length) | 0],
                speedMul: isCone ? 1 : rand(0.85, 1.2),
                dead: false,
            });
        }

        function update(dt) {
            if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
            if (!state.running) return;

            state.time += dt;
            state.speed = Math.min(1000, 300 + state.time * 16);
            state.score += state.speed * dt * 0.05;
            scoreEl.textContent = String(Math.floor(state.score));
            state.scroll = (state.scroll + state.speed * dt) % 70;

            const c = state.car;
            const dir = (state.keys.left ? -1 : 0) + (state.keys.right ? 1 : 0);
            c.vx += dir * 3800 * dt;
            c.vx *= Math.max(0, 1 - 8 * dt);
            if (dir === 0 && Math.abs(c.vx) < 6) c.vx = 0;
            c.vx = Math.max(-560, Math.min(560, c.vx));
            c.x += c.vx * dt;

            const minX = ROAD_X + MARGIN;
            const maxX = ROAD_RIGHT - MARGIN - c.w;
            if (c.x < minX) { c.x = minX; c.vx = 0; }
            else if (c.x > maxX) { c.x = maxX; c.vx = 0; }

            state.spawnTimer -= dt;
            if (state.spawnTimer <= 0) {
                spawnObstacle();
                if (state.time > 12 && Math.random() < 0.3) spawnObstacle();
                const base = Math.max(0.34, 0.9 - state.time * 0.012);
                state.spawnTimer = base * rand(0.75, 1.25);
            }

            for (const o of state.obstacles) o.y += state.speed * dt * o.speedMul;
            for (const b of state.bullets) b.y -= b.speed * dt;

            for (const b of state.bullets) {
                if (b.dead) continue;
                for (const o of state.obstacles) {
                    if (o.dead) continue;
                    if (hit(b, o, 0)) {
                        b.dead = true; o.dead = true;
                        state.shake = Math.max(state.shake, 0.15);
                        break;
                    }
                }
            }

            for (const o of state.obstacles) {
                if (o.dead) continue;
                if (hit(c, o, 7)) { gameOver(); return; }
            }

            state.bullets = state.bullets.filter((b) => !b.dead && b.y + b.h > -20);

            const alive = [];
            for (const o of state.obstacles) {
                if (o.dead) continue;
                if (o.y > H + 40) onObstaclePassed();
                else alive.push(o);
            }
            state.obstacles = alive;
        }

        function drawRoad() {
            ctx.fillStyle = "#0d1117";
            ctx.fillRect(0, 0, W, H);
            const g = ctx.createLinearGradient(ROAD_X, 0, ROAD_RIGHT, 0);
            g.addColorStop(0, "#252a33");
            g.addColorStop(0.5, "#303743");
            g.addColorStop(1, "#252a33");
            ctx.fillStyle = g;
            ctx.fillRect(ROAD_X, 0, ROAD_W, H);
            ctx.fillStyle = "#e6edf3";
            ctx.fillRect(ROAD_X + 2, 0, 5, H);
            ctx.fillRect(ROAD_RIGHT - 7, 0, 5, H);
            const laneW = ROAD_W / 3;
            ctx.fillStyle = "rgba(230,237,243,0.5)";
            for (let i = 1; i <= 2; i++) {
                const lx = ROAD_X + laneW * i - 2.5;
                for (let y = -70 + state.scroll; y < H; y += 70) {
                    ctx.fillRect(lx, y, 5, 36);
                }
            }
        }

        function drawCar(x, y, w, h, color, flip) {
            ctx.fillStyle = "rgba(0,0,0,0.32)";
            rr(x + 2, y + 5, w, h, 12); ctx.fill();

            ctx.save();
            if (flip) { ctx.translate(0, 2 * y + h); ctx.scale(1, -1); }

            ctx.fillStyle = "#0d1014";
            const tw = 8, th = h * 0.2;
            rr(x - 4, y + h * 0.14, tw, th, 3); ctx.fill();
            rr(x + w - 4, y + h * 0.14, tw, th, 3); ctx.fill();
            rr(x - 4, y + h * 0.66, tw, th, 3); ctx.fill();
            rr(x + w - 4, y + h * 0.66, tw, th, 3); ctx.fill();

            const grad = ctx.createLinearGradient(x, 0, x + w, 0);
            grad.addColorStop(0, shade(color, -45));
            grad.addColorStop(0.3, color);
            grad.addColorStop(0.7, color);
            grad.addColorStop(1, shade(color, -55));
            ctx.fillStyle = grad;
            rr(x, y, w, h, 12); ctx.fill();

            ctx.fillStyle = shade(color, -28);
            rr(x + w * 0.12, y + h * 0.3, w * 0.76, h * 0.4, 8); ctx.fill();

            ctx.fillStyle = "rgba(150,210,255,0.85)";
            rr(x + w * 0.16, y + h * 0.12, w * 0.68, h * 0.15, 6); ctx.fill();

            ctx.fillStyle = "rgba(150,210,255,0.5)";
            rr(x + w * 0.16, y + h * 0.73, w * 0.68, h * 0.13, 6); ctx.fill();

            ctx.fillStyle = "#fff6c9";
            rr(x + w * 0.12, y + 2, w * 0.2, 6, 3); ctx.fill();
            rr(x + w * 0.68, y + 2, w * 0.2, 6, 3); ctx.fill();

            ctx.restore();
        }

        function drawCone(x, y, w, h) {
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            rr(x + 2, y + 5, w, h, 6); ctx.fill();
            ctx.fillStyle = "#2a2f38";
            rr(x - 3, y + h - 9, w + 6, 9, 4); ctx.fill();
            ctx.fillStyle = "#ff7a18";
            ctx.beginPath();
            ctx.moveTo(x + w / 2, y + 2);
            ctx.lineTo(x + w - 3, y + h - 7);
            ctx.lineTo(x + 3, y + h - 7);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#f5f7fa";
            ctx.fillRect(x + w * 0.29, y + h * 0.42, w * 0.42, h * 0.16);
        }

        function drawBullet(b) {
            ctx.save();
            ctx.shadowColor = "#22d3ee";
            ctx.shadowBlur = 14;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            grad.addColorStop(0, "#aef7ff");
            grad.addColorStop(1, "#22d3ee");
            ctx.fillStyle = grad;
            rr(b.x, b.y, b.w, b.h, 3); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            rr(b.x + 1, b.y + 2, b.w - 2, b.h * 0.5, 2); ctx.fill();
            ctx.restore();
        }

        function render() {
            ctx.save();
            if (state.shake > 0) {
                const m = state.shake * 22;
                ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
            }
            drawRoad();
            for (const o of state.obstacles) {
                if (o.type === "cone") drawCone(o.x, o.y, o.w, o.h);
                else drawCar(o.x, o.y, o.w, o.h, o.color, true);
            }
            for (const b of state.bullets) drawBullet(b);
            const c = state.car;
            drawCar(c.x, c.y, c.w, c.h, "#22d3ee", false);
            ctx.restore();
        }

        let lastT = performance.now();
        function loop(t) {
            let dt = (t - lastT) / 1000;
            lastT = t;
            if (dt > 0.05) dt = 0.05;
            update(dt);
            render();
            requestAnimationFrame(loop);
        }

        const KEYMAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
        window.addEventListener("keydown", (e) => {
            if (["ArrowLeft", "ArrowRight", "Space", "Enter"].includes(e.code)) e.preventDefault();
            const k = KEYMAP[e.code];
            if (k) state.keys[k] = true;
            if (e.code === "Space" || e.code === "Enter") {
                if (!state.running) startGame();
                else if (!e.repeat) shoot();
            }
        });
        window.addEventListener("keyup", (e) => {
            const k = KEYMAP[e.code];
            if (k) state.keys[k] = false;
        });
        window.addEventListener("blur", () => { state.keys.left = state.keys.right = false; });

        canvas.addEventListener("pointerdown", (e) => {
            if (!state.running) return;
            const rect = canvas.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            if (relX < 0.5) state.keys.left = true;
            else state.keys.right = true;
            canvas.setPointerCapture(e.pointerId);
        });
        const release = () => { state.keys.left = state.keys.right = false; };
        canvas.addEventListener("pointerup", release);
        canvas.addEventListener("pointercancel", release);
        canvas.addEventListener("pointerleave", release);

        ovBtn.addEventListener("click", startGame);

        reset();
        requestAnimationFrame(loop);
    }

    /* ====================== ARRANQUE ====================== */
    function start() {
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", start, { once: true });
            return;
        }
        if (!document.head) {
            // algunos srcdoc raros sin head
            const head = document.createElement("head");
            document.documentElement.insertBefore(head, document.documentElement.firstChild);
        }
        buildDOM();
        boot();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();