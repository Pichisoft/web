/* =====================================================================
   PICHONAPPS PREMIUM  ·  by Pichisoft
   Se carga con UNA línea al final del <body> de PichonApps:
       <script src="pichonapps-premium.js"></script>
   Solo se activa para usuarios con cuenta. Sin cuenta, la página queda
   como estaba y se muestra el aviso abajo a la derecha.
   ===================================================================== */
(function () {
    'use strict';
    const $ = s => document.querySelector(s);

    /* ------------------------------ ESTILOS ------------------------------ */
    const CSS = `
:root{--gold:#d4af37;--gold2:#f1d98a;--line:rgba(212,175,55,.26)}
[hidden]{display:none!important}
.badge-prem{display:none;vertical-align:middle;margin-left:10px;padding:4px 10px;border-radius:6px;font:bold 13px Verdana,"Open Sans",sans-serif;letter-spacing:.06em;color:#ffe08a;text-shadow:0 1px 1px rgba(0,0,0,.55);background:linear-gradient(135deg,#b9bec3,#7c8288 55%,#aeb3b8);box-shadow:inset 0 1px 0 rgba(255,255,255,.35)}
body.prem .badge-prem{display:inline-block}
body.prem #dirClasico{display:none}
#pPremium{display:none;max-width:840px;padding-bottom:50px}
body.prem #pPremium{display:block}
.bienvenida{font-family:Verdana,"Open Sans",sans-serif;color:#fff;font-size:1em;line-height:1.65;margin:.4em 0 1.4em;max-width:760px}
.bienvenida a,.bienvenida a:visited{color:#fff;font-weight:bold;text-decoration:underline;padding:0}
.bienvenida a:hover{background:none;color:#fff;text-decoration-thickness:2px}

.p-search{display:flex;align-items:center;background:linear-gradient(#1c1c1c,#141414);border:1px solid var(--line);border-radius:14px;padding:0 16px;margin:0 0 18px;transition:border-color .2s,box-shadow .2s}
.p-search:focus-within{border-color:var(--gold);box-shadow:0 0 0 3px rgba(212,175,55,.16)}
.p-search svg{width:18px;height:18px;stroke:var(--gold);fill:none;stroke-width:2;stroke-linecap:round;flex:none;margin-right:10px}
.p-pre{color:var(--gold2);font-weight:bold;font-size:16px}
.p-search input{flex:1;min-width:0;background:none;border:0;outline:0;color:#fff;font:inherit;font-size:16px;padding:15px 0 15px 1px}
.p-search input::placeholder{color:#6d6d6d}

.acc{background:linear-gradient(180deg,#1b1b1b,#131313);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:14px;box-shadow:0 10px 28px rgba(0,0,0,.4)}
.acc-h{width:100%;display:flex;align-items:center;gap:12px;background:none;border:0;color:#fff;font:bold 1.05rem Verdana,"Open Sans",sans-serif;padding:17px 18px;cursor:pointer;text-align:left}
.acc-h:hover{background:rgba(212,175,55,.07)}
.acc-h:focus-visible,.pm-back:focus-visible,.p-gear:focus-visible{outline:2px solid var(--gold);outline-offset:-2px}
.chev{margin-left:auto;color:var(--gold);transition:transform .25s}
.acc.open>.acc-h .chev{transform:rotate(180deg)}
.acc-b{display:none;padding:2px 16px 18px}
.acc.open>.acc-b,.buscando .acc>.acc-b{display:block;animation:pIn .25s ease}
@keyframes pIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.acc.sub{background:#0f0f0f;border-radius:12px;margin:18px 0 0;box-shadow:none}
.acc.sub .acc-h{font-size:.95rem;padding:14px 16px}
.buscando .acc.sub{display:none}

.cat{margin-top:16px}
.cat-h{font-weight:bold;font-size:.95rem;color:var(--gold2);margin:0 0 9px;padding-bottom:7px;border-bottom:1px solid var(--line)}
.flat{background:linear-gradient(180deg,#1b1b1b,#131313);border:1px solid var(--line);border-radius:16px;padding:6px 16px 18px;margin:0;box-shadow:0 10px 28px rgba(0,0,0,.4)}
.lista,.lista-p{display:flex;flex-direction:column;gap:7px}
.lista:empty{min-height:46px;border:1px dashed #4a4326;border-radius:10px;align-items:center;justify-content:center}
.lista:empty::after{content:"Soltá una app acá";color:#7a7355;font-size:.78rem}
.app{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;background:#202020;border:1px solid #2d2d2d;border-radius:10px;padding:11px 12px;font-size:.95rem;user-select:none;-webkit-user-select:none;transition:border-color .15s,background .15s}
.app:hover{border-color:var(--gold);background:#242220}
.app.moviendo{opacity:.3}
.app.ghost{position:fixed;z-index:200;pointer-events:none;border-color:var(--gold);box-shadow:0 16px 34px rgba(0,0,0,.65);margin:0}
body.arrastrando{cursor:grabbing;user-select:none;-webkit-user-select:none}
.grip{cursor:grab;touch-action:none;color:#8a7a3c;font-size:1.05rem;line-height:1;letter-spacing:-3px;padding:8px 6px 8px 0}
.grip:hover{color:var(--gold2)}
.app .app-l,.app .app-l:visited{flex:1 1 auto;min-width:0;padding:0;color:#f5f5f5}
.app a.app-l:hover{background:none;color:var(--gold2)}
.app .app-l.off{color:#8d8d8d}
.tags{display:flex;flex-wrap:wrap;gap:4px}
.tags .etiqueta{margin:0;font-size:.62rem;padding:3px 7px;white-space:nowrap}
.et-proximo{background:rgb(28,65,167)}
.grp{margin-top:16px}
.grp-h{margin:0 0 8px}
.grp-h .etiqueta{margin:0 6px 0 0;font-size:.74rem}
.grp-h.txt{font-size:.85rem;color:#aaa}
.p-no{color:#bbb;font-family:Verdana,sans-serif;font-size:.9rem;padding:20px 4px}

.p-gear{display:none;position:fixed;top:82px;right:16px;z-index:50;width:42px;height:42px;padding:0;border-radius:50%;background:#1c1c1c;border:1px solid var(--line);color:var(--gold2);cursor:pointer;align-items:center;justify-content:center;transition:transform .3s,border-color .2s}
body.prem .p-gear{display:flex}
.p-gear:hover{border-color:var(--gold);transform:rotate(60deg)}
.p-gear svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}

.pm-ov{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.62);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;justify-content:flex-end;opacity:0;transition:opacity .2s}
.pm-ov.on{opacity:1}
.pm-panel{width:min(410px,100%);height:100%;box-sizing:border-box;overflow:auto;background:linear-gradient(180deg,#1a1a1a,#0e0e0e);border-left:1px solid var(--line);padding:16px 22px 30px;font-family:Verdana,"Open Sans",sans-serif;color:#fff;transform:translateX(40px);transition:transform .25s}
.pm-ov.on .pm-panel{transform:none}
.pm-back{background:none;border:0;color:var(--gold2);font:inherit;font-size:.9rem;cursor:pointer;padding:8px 0}
.pm-back:hover{color:#fff}
.pm-panel h2{font-family:"Times New Roman",Times,serif;font-size:1.7rem;margin:10px 0 6px;color:#fff}
.pm-row{display:flex;align-items:center;gap:14px;padding:17px 0;border-bottom:1px solid #272727;cursor:pointer}
.pm-row b{font-size:.92rem}
.pm-row small{display:block;color:#9a9a9a;font-size:.72rem;line-height:1.45;margin-top:4px;font-weight:normal}
.sw{-webkit-appearance:none;appearance:none;flex:none;margin:0 0 0 auto;width:46px;height:26px;border-radius:13px;background:#3b3b3b;position:relative;cursor:pointer;border:0;transition:background .2s}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#d8d8d8;transition:left .2s}
.sw:checked{background:linear-gradient(135deg,#f1d98a,#b8901f)}
.sw:checked::after{left:23px;background:#fff}
.sw:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}
.pm-reset{margin-top:22px;width:100%;background:none;border:1px solid var(--line);color:var(--gold2);border-radius:10px;padding:12px;font:inherit;font-size:.85rem;cursor:pointer}
.pm-reset:hover{background:rgba(212,175,55,.1)}

.aviso{display:none;position:fixed;right:14px;bottom:14px;z-index:40;max-width:min(320px,calc(100vw - 28px));font:.78rem/1.5 Verdana,"Open Sans",sans-serif;color:#fff;background:rgba(20,20,20,.92);border:1px solid #3a3a3a;border-radius:10px;padding:10px 12px}
body:not(.prem) .aviso{display:block}

@media (max-width:600px){
  .p-gear{position:absolute;top:70px;right:10px;width:38px;height:38px}
  body.prem .titulo,body.prem .bienvenida{padding-right:46px}
  .badge-prem{font-size:11px;margin:6px 0 0}
  .bienvenida{font-size:.95rem}
  .pm-panel{padding:14px 18px 26px}
}
@media (prefers-reduced-motion:reduce){.acc-b,.pm-ov,.pm-panel,.p-gear{animation:none!important;transition:none!important}}
`;

    /* ------------------------------ DATOS ------------------------------ */
    const B = 'https://pichisoft.github.io/web/';
    const TAGS = {
        nuevo: ['NUEVO', 'et-nuevo'], actualizado: ['ACTUALIZADO', 'et-actualizado'], beta: ['BETA', 'et-beta'],
        cancelado: ['CANCELADO', 'et-cancelado'], ultimos: ['ÚLTIMOS 10 DÍAS PARA USARLA', 'et-ultimos'],
        actcancelada: ['ACTUALIZACIÓN CANCELADA', 'et-act-cancelada'], mantenimiento: ['EN MANTENIMIENTO', 'et-mantenimiento'],
        premium: ['VERSIÓN PREMIUM', 'et-premium'], proximo: ['PRÓXIMAMENTE', 'et-proximo']
    };
    /* Para ponerle un prefijo a una app, agregá su clave en "t": ej. t:['beta'] */
    const APPS = [
        { n: 'PichonTutorial', u: 'pichontutorial' },
        { n: 'PichonAlarm', u: 'pichonalarm' },
        { n: 'PichonBirthday', u: 'pichonbirthday', t: ['nuevo'] },
        { n: 'PichonCalc', u: 'pichoncalc' },
        { n: 'PichonCalendar', u: 'pichoncalendar' },
        { n: 'PichonDestiny', u: 'pichondestiny' },
        { n: 'PichonDocs', u: 'pichondocs' },
        { n: 'PichonFood', u: 'pichonfood', t: ['nuevo'] },
        { n: 'PichonList', u: 'pichonlist' },
        { n: 'PichonMorse', u: 'pichonmorse', t: ['nuevo'] },
        { n: 'PichonOpinion', t: ['proximo'] },
        { n: 'PichonPass', u: 'pichonpass', t: ['actualizado', 'premium'] },
        { n: 'PichonRandom', u: 'pichonrandom' },
        { n: 'PichonSnake', u: 'pichonsnake' },
        { n: 'PichonWatch', u: 'pichonwatch' }
    ];
    APPS.forEach(a => a.t = a.t || []);
    const MAP = Object.fromEntries(APPS.map(a => [a.n, a]));
    const CATS = [
        { id: 'utiles', nombre: 'Apps útiles', ico: '🛠️', apps: ['PichonTutorial', 'PichonDocs', 'PichonList', 'PichonPass', 'PichonCalc', 'PichonCalendar', 'PichonAlarm'] },
        { id: 'juegos', nombre: 'Juegos', ico: '🎮', apps: ['PichonSnake'] },
        { id: 'azar', nombre: 'Apps de azar', ico: '🎲', apps: ['PichonDestiny', 'PichonRandom'] },
        { id: 'divertidas', nombre: 'Apps divertidas', ico: '🎉', apps: ['PichonBirthday', 'PichonFood', 'PichonMorse', 'PichonWatch'] }
    ];
    const has = (a, k) => a.t.includes(k);
    const GR = [
        [['nuevo', 'actualizado'], a => has(a, 'nuevo') && has(a, 'actualizado')],
        [['nuevo'], a => has(a, 'nuevo') && !has(a, 'actualizado')],
        [['actualizado'], a => has(a, 'actualizado') && !has(a, 'nuevo')],
        [['beta'], a => has(a, 'beta')],
        [['premium'], a => has(a, 'premium')],
        [['ultimos'], a => has(a, 'ultimos')],
        [['mantenimiento'], a => has(a, 'mantenimiento')],
        [['proximo'], a => has(a, 'proximo')],
        [['cancelado'], a => has(a, 'cancelado')],
        [['actcancelada'], a => has(a, 'actcancelada')],
        [[], a => !a.t.length]
    ];

    /* ------------------------------ ESTADO ------------------------------ */
    let cfg = { orden: true, blank: true, buscador: true };
    let lay = { cats: {}, flat: [] };
    const abierto = {};
    const getD = (k, d) => { try { const v = Pichisoft.getData('PichonApps', k, d); return v == null ? d : v; } catch { return d; } };
    const setD = (k, v) => { try { Pichisoft.setData('PichonApps', k, v); } catch (e) { console.error(e); } };

    function cargarLay() {
        const sv = getD('layout', {}), usadas = new Set(), cats = {};
        CATS.forEach(c => {
            cats[c.id] = ((sv.cats && sv.cats[c.id]) || []).filter(n => MAP[n] && !usadas.has(n) && usadas.add(n));
        });
        CATS.forEach(c => c.apps.forEach(n => { if (!usadas.has(n)) { usadas.add(n); cats[c.id].push(n); } }));
        const fu = new Set(), flat = (sv.flat || []).filter(n => MAP[n] && !fu.has(n) && fu.add(n));
        APPS.forEach(a => { if (!fu.has(a.n)) flat.push(a.n); });
        lay = { cats, flat };
    }

    /* ------------------------------ DOM ------------------------------ */
    function inyectar() {
        const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
        document.querySelector('h1.titulo').insertAdjacentHTML('beforeend', ' <span class="badge-prem">VERSIÓN PREMIUM</span>');
        const ul = document.querySelector('ul'); ul.id = 'dirClasico';
        ul.insertAdjacentHTML('afterend', `
<div id="pPremium">
  <p class="bienvenida">¡Hola! Bienvenido a PichonApps, nuestro directorio de aplicaciones y juegos que tanto te gustan de Pichisoft. ¿Tiene una duda acerca de nuestras apps? <a id="linkTut" href="${B}pichontutorial.html">Vea el tutorial de cada una</a>.</p>
  <div class="p-search" id="pSearch">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
    <span class="p-pre">Pichon</span>
    <input id="pQ" type="text" inputmode="search" autocomplete="off" spellcheck="false" placeholder="Destiny, Calc, Snake…" aria-label="Buscar apps de Pichon">
  </div>
  <div id="pBody"></div>
  <p class="p-no" id="pNo" hidden>No encontramos ninguna app con ese nombre.</p>
</div>`);
        document.body.insertAdjacentHTML('beforeend', `
<button class="p-gear" id="pGear" aria-label="Configuración" title="Configuración"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
<div class="aviso">Ya está disponible nuestra versión premium para PichonApps. ¿Quiere obtenerla? Hágase una cuenta, en esta misma app, apretando el botón "Registrarse".</div>`);
        $('#pGear').onclick = abrirConfig;
        $('#pQ').oninput = e => {
            if (/^pichon/i.test(e.target.value)) e.target.value = e.target.value.replace(/^pichon\s*/i, '');
            filtrar();
        };
        document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarConfig(); });
    }

    function item(a, drag) {
        const d = document.createElement('div'); d.className = 'app'; d.dataset.n = a.n;
        if (drag) {
            const g = document.createElement('span'); g.className = 'grip'; g.textContent = '⋮⋮'; g.title = 'Arrastrar para ordenar';
            g.onpointerdown = e => arrastrar(e, d, g); d.append(g);
        }
        let l;
        if (a.u) {
            l = document.createElement('a'); l.href = B + a.u + '.html';
            if (cfg.blank) { l.target = '_blank'; l.rel = 'noopener noreferrer'; }
        } else { l = document.createElement('span'); l.title = 'Próximamente'; }
        l.className = 'app-l' + (a.u ? '' : ' off'); l.textContent = a.n; d.append(l);
        if (a.t.length) {
            const t = document.createElement('span'); t.className = 'tags';
            a.t.forEach(k => { const s = document.createElement('span'); s.className = 'etiqueta ' + TAGS[k][1]; s.textContent = TAGS[k][0]; t.append(s); });
            d.append(t);
        }
        return d;
    }

    function acc(titulo, ico, hijos, key, extra) {
        const a = document.createElement('div'); a.className = 'acc' + (extra ? ' ' + extra : '') + (abierto[key] ? ' open' : '');
        const h = document.createElement('button'); h.className = 'acc-h'; h.setAttribute('aria-expanded', !!abierto[key]);
        h.innerHTML = '<span>' + ico + '</span><span>' + titulo + '</span><span class="chev">▾</span>';
        h.onclick = () => { abierto[key] = !abierto[key]; a.classList.toggle('open', abierto[key]); h.setAttribute('aria-expanded', abierto[key]); };
        const b = document.createElement('div'); b.className = 'acc-b'; b.append(...hijos);
        a.append(h, b); return a;
    }

    function catEl(c) {
        const s = document.createElement('section'); s.className = 'cat';
        const h = document.createElement('div'); h.className = 'cat-h'; h.textContent = c.ico + '  ' + c.nombre;
        const l = document.createElement('div'); l.className = 'lista'; l.dataset.cat = c.id;
        lay.cats[c.id].forEach(n => l.append(item(MAP[n], true)));
        s.append(h, l); return s;
    }

    function prefijos() {
        const w = document.createElement('div');
        GR.forEach(([tags, fn]) => {
            const lst = APPS.filter(fn); if (!lst.length) return;
            const s = document.createElement('div'); s.className = 'grp';
            const h = document.createElement('div'); h.className = 'grp-h';
            if (tags.length) tags.forEach(k => { const c = document.createElement('span'); c.className = 'etiqueta ' + TAGS[k][1]; c.textContent = TAGS[k][0]; h.append(c); });
            else { h.classList.add('txt'); h.textContent = 'Sin prefijo'; }
            const l = document.createElement('div'); l.className = 'lista-p'; lst.forEach(a => l.append(item(a, false)));
            s.append(h, l); w.append(s);
        });
        return w;
    }

    function render() {
        const root = $('#pBody'); root.innerHTML = '';
        $('#pSearch').hidden = !cfg.buscador;
        if (!cfg.buscador) $('#pQ').value = '';
        const t = $('#linkTut');
        if (cfg.blank) { t.target = '_blank'; t.rel = 'noopener noreferrer'; } else { t.removeAttribute('target'); t.removeAttribute('rel'); }
        if (cfg.orden) {
            const sub = acc('Apps ordenadas según su prefijo', '🏷️', [prefijos()], 'pre', 'sub');
            root.append(acc('Apps ordenadas', '✨', [...CATS.map(catEl), sub], 'ord'));
        } else {
            const f = document.createElement('section'); f.className = 'cat flat';
            const h = document.createElement('div'); h.className = 'cat-h'; h.textContent = '✨  Todas las apps';
            const l = document.createElement('div'); l.className = 'lista'; l.dataset.flat = '1';
            lay.flat.forEach(n => l.append(item(MAP[n], true)));
            f.append(h, l); root.append(f);
        }
        filtrar();
    }

    function filtrar() {
        const raw = cfg.buscador ? $('#pQ').value.trim().toLowerCase().replace(/^pichon\s*/, '') : '';
        const root = $('#pPremium'); root.classList.toggle('buscando', !!raw);
        let hits = 0;
        root.querySelectorAll('.lista .app').forEach(a => {
            const ok = !raw || a.dataset.n.toLowerCase().slice(6).includes(raw);
            a.hidden = !ok; if (ok) hits++;
        });
        root.querySelectorAll('.cat').forEach(c => { c.hidden = !!raw && !c.querySelector('.app:not([hidden])'); });
        $('#pNo').hidden = !(raw && !hits);
    }

    /* ---------------------- ARRASTRAR (mouse y táctil) ---------------------- */
    function guardarLay() {
        if (cfg.orden) CATS.forEach(c => { lay.cats[c.id] = [...document.querySelectorAll('#pBody .lista[data-cat="' + c.id + '"] .app')].map(x => x.dataset.n); });
        else lay.flat = [...document.querySelectorAll('#pBody .lista[data-flat] .app')].map(x => x.dataset.n);
        setD('layout', lay);
    }

    function arrastrar(e, el, grip) {
        if (e.button > 0) return;
        e.preventDefault();
        try { grip.releasePointerCapture(e.pointerId); } catch { }
        const r = el.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
        const gh = el.cloneNode(true); gh.classList.add('ghost');
        gh.style.cssText = 'width:' + r.width + 'px;left:' + r.left + 'px;top:' + r.top + 'px';
        document.body.append(gh); el.classList.add('moviendo'); document.body.classList.add('arrastrando');
        let ly = 300;
        const iv = setInterval(() => { if (ly < 80) scrollBy(0, -10); else if (ly > innerHeight - 80) scrollBy(0, 10); }, 16);
        const mv = ev => {
            ly = ev.clientY;
            gh.style.left = (ev.clientX - dx) + 'px'; gh.style.top = (ev.clientY - dy) + 'px';
            const t = document.elementFromPoint(ev.clientX, ev.clientY); if (!t) return;
            const o = t.closest('.app');
            if (o && o !== el && o.parentNode.classList.contains('lista')) {
                const b = o.getBoundingClientRect();
                o.parentNode.insertBefore(el, ev.clientY < b.top + b.height / 2 ? o : o.nextSibling); return;
            }
            const c = t.closest('.cat'); if (!c) return;
            const l = c.querySelector('.lista'), otros = [...l.querySelectorAll('.app')].filter(x => x !== el);
            if (!otros.length || ev.clientY > otros[otros.length - 1].getBoundingClientRect().bottom) l.appendChild(el);
        };
        const fin = () => {
            clearInterval(iv);
            removeEventListener('pointermove', mv); removeEventListener('pointerup', fin); removeEventListener('pointercancel', fin);
            gh.remove(); el.classList.remove('moviendo'); document.body.classList.remove('arrastrando');
            guardarLay(); filtrar();
        };
        addEventListener('pointermove', mv); addEventListener('pointerup', fin); addEventListener('pointercancel', fin);
    }

    /* ---------------------------- CONFIGURACIÓN ---------------------------- */
    function cerrarConfig() {
        const o = $('#pCfg'); if (!o) return;
        o.classList.remove('on'); setTimeout(() => o.remove(), 200);
    }

    function abrirConfig() {
        if ($('#pCfg')) return;
        const o = document.createElement('div'); o.id = 'pCfg'; o.className = 'pm-ov';
        const fila = (k, t, d) => `<label class="pm-row"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" class="sw" data-k="${k}"></label>`;
        o.innerHTML = `<div class="pm-panel" role="dialog" aria-modal="true" aria-label="Configuración">
      <button class="pm-back" id="cfgBack">← Volver</button>
      <h2>Configuración</h2>
      ${fila('orden', 'Ordenar apps', 'Agrupa las apps por categoría. Si lo desactivás, se muestran todas juntas.')}
      ${fila('blank', 'Abrir las apps en una pestaña nueva', 'Si lo desactivás, se abren en esta misma pestaña.')}
      ${fila('buscador', 'Mostrar barra de búsqueda', 'Buscá una app escribiendo solo lo que va después de "Pichon".')}
      <button class="pm-reset" id="cfgReset">Restablecer el orden de las apps</button>
    </div>`;
        document.body.append(o);
        requestAnimationFrame(() => o.classList.add('on'));
        o.onclick = e => { if (e.target === o) cerrarConfig(); };
        o.querySelector('#cfgBack').onclick = cerrarConfig;
        o.querySelectorAll('.sw').forEach(s => {
            s.checked = !!cfg[s.dataset.k];
            s.onchange = () => { cfg[s.dataset.k] = s.checked; setD('cfg', cfg); render(); };
        });
        o.querySelector('#cfgReset').onclick = () => {
            if (!confirm('¿Restablecer el orden original de las apps?')) return;
            setD('layout', null); cargarLay(); render();
        };
    }

    /* ------------------------ ACTIVAR / DESACTIVAR ------------------------ */
    function renderPremium() {
        const u = Pichisoft.user;
        document.body.classList.toggle('prem', !!u);
        if (!u) { cerrarConfig(); return; }
        cfg = Object.assign({ orden: true, blank: true, buscador: true }, getD('cfg', {}));
        cargarLay(); render();
    }

    inyectar();
    const rcOriginal = window.renderCuenta;
    window.renderCuenta = function () { rcOriginal.apply(this, arguments); renderPremium(); };
    renderPremium();
})();