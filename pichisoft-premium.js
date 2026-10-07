/* =====================================================================
   PICHONAPPS PREMIUM  ·  by Pichisoft
   Se carga con UNA línea al final del <body> de PichonApps:
       <script src="pichisoft-premium.js"></script>
   Con cuenta: versión premium completa. Sin cuenta: la página queda
   como estaba, más los carteles de aviso (registro y contacto).
   Todos los íconos están dibujados con CSS (no hay emojis).
   ===================================================================== */
(function () {
    'use strict';
    const $ = s => document.querySelector(s);

    /* ------------------------------ ESTILOS ------------------------------ */
    const CSS = `
:root{--gold:#d4af37;--gold2:#f1d98a;--line:rgba(212,175,55,.26)}
[hidden]{display:none!important}
.badge-prem{display:none;vertical-align:middle;margin-left:10px;padding:4px 10px;border-radius:6px;font:bold 13px Verdana,"Open Sans",sans-serif;letter-spacing:.06em;color:#ffe08a;text-shadow:0 1px 1px rgba(0,0,0,.55);background:linear-gradient(135deg,#b9bec3,#7c8288 55%,#aeb3b8);box-shadow:inset 0 1px 0 rgba(255,255,255,.35);user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}
body.prem .badge-prem{display:inline-block}
body.prem #dirClasico{display:none}
#pPremium{display:none;max-width:840px;padding-bottom:50px}
body.prem #pPremium{display:block}
.bienvenida{font-family:Verdana,"Open Sans",sans-serif;color:#fff;font-size:1em;line-height:1.65;margin:.4em 0 1.4em;max-width:760px}

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
.chev{margin-left:auto;flex:none;width:9px;height:9px;border:solid var(--gold);border-width:0 2px 2px 0;transform:rotate(45deg);margin-top:-4px;transition:transform .25s,margin .25s}
.acc.open>.acc-h .chev{transform:rotate(225deg);margin-top:4px}
.acc-b{display:none;padding:2px 16px 18px}
.acc.open>.acc-b,.buscando .acc>.acc-b{display:block;animation:pIn .25s ease}
@keyframes pIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.acc.sub{background:#0f0f0f;border-radius:12px;margin:18px 0 0;box-shadow:none}
.acc.sub .acc-h{font-size:.95rem;padding:14px 16px}
.buscando .acc.sub{display:none}

/* Íconos de los títulos de los paneles (dibujados con CSS) */
.acc>.acc-h>span:first-child{width:20px;height:20px;flex:none;position:relative}
.acc:not(.sub)>.acc-h>span:first-child{background:linear-gradient(var(--gold),var(--gold)) 0 3px/100% 3px no-repeat,linear-gradient(var(--gold),var(--gold)) 0 9px/70% 3px no-repeat,linear-gradient(var(--gold),var(--gold)) 0 15px/40% 3px no-repeat}
.acc.sub>.acc-h>span:first-child::before{content:"";position:absolute;inset:3px;border:2px solid var(--gold);border-radius:3px;transform:rotate(45deg) scale(.8)}

.cat{margin-top:16px}
.cat-h{display:flex;align-items:center;gap:10px;font-weight:bold;font-size:.95rem;color:var(--gold2);margin:0 0 9px;padding-bottom:7px;border-bottom:1px solid var(--line)}
.flat{background:linear-gradient(180deg,#1b1b1b,#131313);border:1px solid var(--line);border-radius:16px;padding:6px 16px 18px;margin:0;box-shadow:0 10px 28px rgba(0,0,0,.4)}
.flat>.cat-h::before{content:"";flex:none;width:20px;height:20px;background:linear-gradient(var(--gold),var(--gold)) 0 3px/100% 3px no-repeat,linear-gradient(var(--gold),var(--gold)) 0 9px/70% 3px no-repeat,linear-gradient(var(--gold),var(--gold)) 0 15px/40% 3px no-repeat}

/* Íconos de las categorías */
.ci{display:inline-block;position:relative;flex:none;width:22px;height:22px}
.ci::before,.ci::after{content:"";position:absolute}
.ci-utiles::before{inset:1px;border:2px solid var(--gold);border-radius:6px}
.ci-utiles::after{left:8px;top:4px;width:5px;height:10px;border:solid var(--gold);border-width:0 2px 2px 0;transform:rotate(45deg)}
.ci-juegos::before{left:0;top:5px;width:18px;height:11px;border:2px solid var(--gold);border-radius:8px}
.ci-juegos::after{left:2px;top:7px;width:18px;height:9px;background:linear-gradient(var(--gold),var(--gold)) 1px 3px/6px 2px no-repeat,linear-gradient(var(--gold),var(--gold)) 3px 1px/2px 6px no-repeat,radial-gradient(circle,var(--gold) 2px,transparent 2.6px) 11px 1px/6px 6px no-repeat}
.ci-azar::before{inset:1px;border:2px solid var(--gold);border-radius:5px}
.ci-azar::after{inset:5px;background:radial-gradient(circle,var(--gold) 1.7px,transparent 2.2px) 0 0/6px 6px no-repeat,radial-gradient(circle,var(--gold) 1.7px,transparent 2.2px) 50% 50%/6px 6px no-repeat,radial-gradient(circle,var(--gold) 1.7px,transparent 2.2px) 100% 100%/6px 6px no-repeat}
.ci-divertidas::before{inset:1px;border:2px solid var(--gold);border-radius:50%;background:radial-gradient(circle,var(--gold) 1.5px,transparent 2px) 3px 4px/5px 5px no-repeat,radial-gradient(circle,var(--gold) 1.5px,transparent 2px) 9px 4px/5px 5px no-repeat}
.ci-divertidas::after{left:6px;top:11px;width:6px;height:3px;border:2px solid var(--gold);border-top:0;border-radius:0 0 8px 8px}

.lista,.lista-p{display:flex;flex-direction:column;gap:7px}
.lista:empty{min-height:46px;border:1px dashed #4a4326;border-radius:10px;align-items:center;justify-content:center}
.lista:empty::after{content:"Soltá una app acá";color:#7a7355;font-size:.78rem}
.app{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;background:#202020;border:1px solid #2d2d2d;border-radius:10px;padding:11px 12px;font-size:.95rem;user-select:none;-webkit-user-select:none;transition:border-color .15s,background .15s}
.app:hover{border-color:var(--gold);background:#242220}
.app.moviendo{opacity:.3}
.app.ghost{position:fixed;z-index:200;pointer-events:none;border-color:var(--gold);box-shadow:0 16px 34px rgba(0,0,0,.65);margin:0}
body.arrastrando{cursor:grabbing;user-select:none;-webkit-user-select:none}
.grip{position:relative;flex:none;width:14px;height:21px;margin-right:4px;cursor:grab;touch-action:none;color:#8a7a3c;background:radial-gradient(circle,currentColor 1.6px,transparent 2.1px) 0 0/7px 7px}
.grip::before{content:"";position:absolute;inset:-8px -6px}
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
.pm-arr{display:inline-block;width:8px;height:8px;border:solid currentColor;border-width:0 0 2px 2px;transform:rotate(45deg);margin-right:10px;vertical-align:1px}
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

/* ===== Carteles de aviso (arrastrables, con X hecha en CSS) ===== */
#pCart{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;flex-direction:column;align-items:flex-end;gap:8px;padding:0 12px 12px;pointer-events:none}
.cartel{position:relative;pointer-events:auto;box-sizing:border-box;max-width:min(330px,calc(100vw - 24px));padding:11px 40px 11px 14px;font:.78rem/1.5 Verdana,"Open Sans",sans-serif;color:#fff;background:rgba(20,20,20,.95);border:1px solid var(--line);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.5);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;animation:pIn .25s ease}
.cartel.suelto{position:fixed;margin:0;z-index:55}
.cartel.arr{cursor:grabbing;border-color:var(--gold);box-shadow:0 16px 34px rgba(0,0,0,.65)}
.cartel a,.cartel a:visited{color:#4da3ff;text-decoration:underline;font-weight:bold;padding:0}
.cartel a:hover{background:none;color:#8cc4ff}
.c-x{position:absolute;top:8px;right:8px;width:24px;height:24px;padding:0;border:1.5px solid var(--gold);border-radius:50%;background:none;cursor:pointer;transition:transform .3s,background .2s}
.c-x::before,.c-x::after{content:"";position:absolute;left:50%;top:50%;width:10px;height:2px;margin:-1px 0 0 -5px;border-radius:2px;background:var(--gold2);transition:background .2s}
.c-x::before{transform:rotate(45deg)}
.c-x::after{transform:rotate(-45deg)}
.c-x:hover{transform:rotate(90deg);background:var(--gold)}
.c-x:hover::before,.c-x:hover::after{background:#111}
.c-x:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}

/* Panel de contacto */
.pml-ov{position:fixed;inset:0;z-index:130;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.pml-card{width:min(400px,100%);box-sizing:border-box;background:#141414;border:1px solid #3a3a3a;border-top:3px solid var(--gold);border-radius:14px;padding:26px 22px 20px;box-shadow:0 26px 70px rgba(0,0,0,.8);font-family:Verdana,"Open Sans",sans-serif;color:#fff;animation:pIn .25s ease}
.pml-card h3{margin:0 0 10px;font-family:"Times New Roman",Times,serif;font-size:1.5rem;line-height:1.2}
.pml-card p{margin:0 0 18px;font-size:.85rem;line-height:1.6;color:#bdbdbd;word-break:break-word}
.pml-btn{display:block;width:100%;box-sizing:border-box;padding:13px 12px;margin-top:9px;border-radius:8px;background:#000;color:#fff;border:1px solid #4a4a4a;font:1rem Georgia,"Times New Roman",serif;cursor:pointer;transition:background-color .15s,color .15s}
.pml-btn:hover{background:#fff;color:#000}
.pml-no{background:#8c8c8c;color:#000;border-color:#8c8c8c}
.pml-no:hover{background:#d2d2d2}
.pml-btn:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}

@media (max-width:600px){
  .p-gear{position:absolute;top:70px;right:10px;width:38px;height:38px}
  body.prem .titulo,body.prem .bienvenida{padding-right:46px}
  .badge-prem{font-size:11px;margin:6px 0 0}
  .bienvenida{font-size:.95rem}
  .pm-panel{padding:14px 18px 26px}
  .c-x{width:28px;height:28px}
  .cartel{font-size:.76rem}
}
@media (prefers-reduced-motion:reduce){.acc-b,.pm-ov,.pm-panel,.p-gear,.cartel,.c-x{animation:none!important;transition:none!important}}
`;

    /* ------------------------------ DATOS ------------------------------ */
    const B = 'https://pichisoft.github.io/web/';
    const MAIL = 'contacto@pichisoft.cc';
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
        { n: 'PichonPaint', u: 'pichonpaint', t: ['nuevo', 'beta'] },
        { n: 'PichonPass', u: 'pichonpass', t: ['actualizado', 'premium'] },
        { n: 'PichonRandom', u: 'pichonrandom' },
        { n: 'PichonSnake', u: 'pichonsnake' },
        { n: 'PichonWatch', u: 'pichonwatch' }
    ];
    APPS.forEach(a => a.t = a.t || []);
    const MAP = Object.fromEntries(APPS.map(a => [a.n, a]));
    const CATS = [
        { id: 'utiles', nombre: 'Apps útiles', apps: ['PichonTutorial', 'PichonDocs', 'PichonList', 'PichonPass', 'PichonCalc', 'PichonCalendar', 'PichonAlarm'] },
        { id: 'juegos', nombre: 'Juegos', apps: ['PichonSnake'] },
        { id: 'azar', nombre: 'Apps de azar', apps: ['PichonDestiny', 'PichonRandom'] },
        { id: 'divertidas', nombre: 'Apps divertidas', apps: ['PichonBirthday', 'PichonFood', 'PichonMorse', 'PichonPaint', 'PichonWatch'] }
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

    /* Carteles de aviso: "solo" limita quién lo ve (invitado = sin cuenta, premium = con cuenta) */
    const CARTELES = [
        { id: 'reg', solo: 'invitado', html: 'Ya está disponible nuestra versión premium para PichonApps. ¿Quiere obtenerla? Hágase una cuenta, en esta misma app, apretando el botón "Registrarse".' },
        { id: 'tut', solo: 'premium', html: '¿Tiene una duda acerca de nuestras apps? <a data-b href="' + B + 'pichontutorial.html">Vea el tutorial de cada una.</a>' },
        { id: 'con', html: '<a data-b data-mail href="mailto:' + MAIL + '">¿Tiene una duda?→ Comuníquese con nosotros.</a>' }
    ];

    /* ------------------------------ ESTADO ------------------------------ */
    let cfg = { orden: true, blank: true, buscador: true, carteles: true };
    let lay = { cats: {}, flat: [] };
    const abierto = {};
    const cerrados = new Set(), pos = {};
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
  <p class="bienvenida">¡Hola! Bienvenido a PichonApps, nuestro directorio de aplicaciones y juegos que tanto te gustan de Pichisoft.</p>
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
<div id="pCart"></div>`);
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
            const g = document.createElement('span'); g.className = 'grip'; g.title = 'Arrastrar para ordenar';
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

    function acc(titulo, hijos, key, extra) {
        const a = document.createElement('div'); a.className = 'acc' + (extra ? ' ' + extra : '') + (abierto[key] ? ' open' : '');
        const h = document.createElement('button'); h.className = 'acc-h'; h.setAttribute('aria-expanded', !!abierto[key]);
        h.innerHTML = '<span aria-hidden="true"></span><span>' + titulo + '</span><span class="chev" aria-hidden="true"></span>';
        h.onclick = () => { abierto[key] = !abierto[key]; a.classList.toggle('open', abierto[key]); h.setAttribute('aria-expanded', abierto[key]); };
        const b = document.createElement('div'); b.className = 'acc-b'; b.append(...hijos);
        a.append(h, b); return a;
    }

    function catEl(c) {
        const s = document.createElement('section'); s.className = 'cat';
        const h = document.createElement('div'); h.className = 'cat-h';
        h.innerHTML = '<i class="ci ci-' + c.id + '" aria-hidden="true"></i><span>' + c.nombre + '</span>';
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
        renderCarteles();
        if (cfg.orden) {
            const sub = acc('Apps ordenadas según su prefijo', [prefijos()], 'pre', 'sub');
            root.append(acc('Apps ordenadas', [...CATS.map(catEl), sub], 'ord'));
        } else {
            const f = document.createElement('section'); f.className = 'cat flat';
            const h = document.createElement('div'); h.className = 'cat-h'; h.textContent = 'Todas las apps';
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

    /* ------------------------------ CARTELES ------------------------------ */
    /* Deja espacio abajo para que los carteles apilados no tapen las apps */
    function reservar() {
        const b = $('#pCart');
        document.body.style.paddingBottom = b && b.children.length ? (b.offsetHeight + 16) + 'px' : '';
    }

    function renderCarteles() {
        document.querySelectorAll('.cartel').forEach(c => c.remove());
        const prem = !!Pichisoft.user, box = $('#pCart');
        if (!box) return;
        if (prem && !cfg.carteles) { reservar(); return; }
        CARTELES.forEach(c => {
            if ((c.solo === 'invitado' && prem) || (c.solo === 'premium' && !prem) || cerrados.has(c.id)) return;
            const d = document.createElement('div'); d.className = 'cartel'; d.dataset.id = c.id; d.innerHTML = c.html;
            /* Sin cuenta siempre pestaña nueva; con cuenta, según la opción */
            d.querySelectorAll('a[data-b]').forEach(a => { if (!prem || cfg.blank) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
            d.querySelectorAll('a[data-mail]').forEach(a => { a.onclick = e => { e.preventDefault(); elegirMail(); }; });
            const x = document.createElement('button'); x.className = 'c-x'; x.setAttribute('aria-label', 'Cerrar aviso'); x.title = 'Cerrar';
            x.onpointerdown = e => e.stopPropagation();
            x.onclick = () => { cerrados.add(c.id); delete pos[c.id]; d.remove(); reservar(); };
            d.append(x);
            d.onpointerdown = e => moverCartel(e, d);
            if (pos[c.id]) { d.classList.add('suelto'); d.style.left = pos[c.id].l + 'px'; d.style.top = pos[c.id].t + 'px'; document.body.append(d); }
            else box.append(d);
        });
        reservar();
    }

    /* Panel para elegir cómo escribir al equipo (funciona en cualquier dispositivo) */
    function elegirMail() {
        if ($('#pMail')) return;
        const gmail = 'https://mail.google.com/mail/?extsrc=mailto&url=' + encodeURIComponent('mailto:' + MAIL);
        const o = document.createElement('div'); o.id = 'pMail'; o.className = 'pml-ov';
        o.innerHTML = `<div class="pml-card" role="dialog" aria-modal="true" aria-labelledby="pmlT">
      <h3 id="pmlT">Comuníquese con nosotros</h3>
      <p>Escribinos a <b>${MAIL}</b>. Elegí cómo querés enviar el mensaje:</p>
      <button class="pml-btn" id="pmlG">Abrir Gmail</button>
      <button class="pml-btn" id="pmlM">Abrir mi app de mails</button>
      <button class="pml-btn" id="pmlC">Copiar dirección</button>
      <button class="pml-btn pml-no" id="pmlX">Cerrar</button>
    </div>`;
        document.body.append(o);
        const esc = e => { if (e.key === 'Escape') cerrar(); };
        const cerrar = () => { document.removeEventListener('keydown', esc); o.remove(); };
        document.addEventListener('keydown', esc);
        o.onclick = e => { if (e.target === o) cerrar(); };
        o.querySelector('#pmlX').onclick = cerrar;
        o.querySelector('#pmlG').onclick = () => { window.open(gmail, '_blank', 'noopener'); cerrar(); };
        o.querySelector('#pmlM').onclick = () => { location.href = 'mailto:' + MAIL; cerrar(); };
        o.querySelector('#pmlC').onclick = async e => {
            try { await navigator.clipboard.writeText(MAIL); e.target.textContent = '¡Copiada!'; }
            catch { e.target.textContent = MAIL; }
        };
    }

    function moverCartel(e, d) {
        if (e.button > 0 || e.target.closest('a,button')) return;
        const r = d.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, w = r.width, h = r.height;
        if (!d.classList.contains('suelto')) { d.classList.add('suelto'); d.style.width = w + 'px'; document.body.append(d); reservar(); }
        d.classList.add('arr');
        try { d.setPointerCapture(e.pointerId); } catch { }
        const mv = ev => {
            const l = Math.min(Math.max(ev.clientX - dx, 0), innerWidth - w), t = Math.min(Math.max(ev.clientY - dy, 0), innerHeight - h);
            d.style.left = l + 'px'; d.style.top = t + 'px'; pos[d.dataset.id] = { l, t };
        };
        const fin = () => {
            d.classList.remove('arr');
            d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', fin); d.removeEventListener('pointercancel', fin);
        };
        mv(e);
        d.addEventListener('pointermove', mv); d.addEventListener('pointerup', fin); d.addEventListener('pointercancel', fin);
    }

    /* ---------------------------- CONFIGURACIÓN ---------------------------- */
    function cerrarConfig() {
        const o = $('#pCfg'); if (!o) return;
        o.classList.remove('on'); setTimeout(() => o.remove(), 200);
    }

    function confirmarReset() {
        if ($('#pcfOv')) return;

        if (!$('#pcfCss')) {
            const st = document.createElement('style'); st.id = 'pcfCss';
            st.textContent = `
.pcf-ov{position:fixed;inset:0;z-index:130;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .18s}
.pcf-ov.on{opacity:1}
.pcf-card{width:min(400px,100%);box-sizing:border-box;background:#141414;border:1px solid #3a3a3a;border-top:3px solid #d4af37;border-radius:14px;padding:28px 24px 22px;box-shadow:0 26px 70px rgba(0,0,0,.8);transform:translateY(14px) scale(.97);transition:transform .2s}
.pcf-ov.on .pcf-card{transform:none}
.pcf-card h3{margin:0 0 12px;font-family:"Times New Roman",Times,serif;font-weight:bold;font-size:1.55rem;line-height:1.2;color:#fff;text-align:left}
.pcf-card p{margin:0 0 24px;font-family:Verdana,"Open Sans",sans-serif;font-size:.85rem;line-height:1.6;color:#bdbdbd;text-align:left}
.pcf-btn{display:block;width:100%;box-sizing:border-box;padding:14px 12px;border-radius:8px;font-family:Verdana,"Open Sans",sans-serif;font-size:.9rem;cursor:pointer;transition:background-color .15s,color .15s}
.pcf-btn+.pcf-btn{margin-top:10px}
.pcf-no{background-color:#8c8c8c;color:#000;border:1px solid #8c8c8c}
.pcf-no:hover{background-color:#d2d2d2;color:#000}
.pcf-si{background-color:#000;color:#fff;border:1px solid #4a4a4a}
.pcf-si:hover{background-color:#fff;color:#000}
.pcf-btn:focus-visible{outline:2px solid #f1d98a;outline-offset:2px}
.pcf-card .pcf-btn{font-family:Georgia,"Times New Roman",serif!important;font-size:1rem!important;font-weight:normal}`;
            document.head.appendChild(st);
        }

        const d = document.createElement('div'); d.id = 'pcfOv'; d.className = 'pcf-ov';
        d.innerHTML = `<div class="pcf-card" role="alertdialog" aria-modal="true" aria-labelledby="pcfT">
    <h3 id="pcfT">¿Restablecer el orden de las apps?</h3>
    <p>El orden que le aplicaste a tus apps, volverán al orden predeterminado.</p>
    <button class="pcf-btn pcf-no" id="pcfNo">No quiero restablecer el orden</button>
    <button class="pcf-btn pcf-si" id="pcfSi">Restablecer orden</button>
  </div>`;
        document.body.append(d);
        requestAnimationFrame(() => d.classList.add('on'));

        const esc = e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); cerrar(); } };
        const cerrar = () => {
            document.removeEventListener('keydown', esc, true);
            d.classList.remove('on'); setTimeout(() => d.remove(), 180);
        };
        document.addEventListener('keydown', esc, true);
        d.onclick = e => { if (e.target === d) cerrar(); };
        d.querySelector('#pcfNo').onclick = cerrar;
        d.querySelector('#pcfSi').onclick = () => { cerrar(); setD('layout', null); cargarLay(); render(); };
        d.querySelector('#pcfNo').focus();
    }

    function abrirConfig() {
        if ($('#pCfg')) return;
        const o = document.createElement('div'); o.id = 'pCfg'; o.className = 'pm-ov';
        const fila = (k, t, d) => `<label class="pm-row"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" class="sw" data-k="${k}"></label>`;
        o.innerHTML = `<div class="pm-panel" role="dialog" aria-modal="true" aria-label="Configuración">
      <button class="pm-back" id="cfgBack"><i class="pm-arr" aria-hidden="true"></i>Volver</button>
      <h2>Configuración</h2>
      ${fila('orden', 'Ordenar apps', 'Agrupa las apps por categoría. Si lo desactivás, se muestran todas juntas.')}
      ${fila('blank', 'Abrir las apps en una pestaña nueva', 'Si lo desactivás, se abren en esta misma pestaña.')}
      ${fila('buscador', 'Mostrar barra de búsqueda', 'Buscá una app escribiendo solo lo que va después de "Pichon".')}
      ${fila('carteles', 'Mostrar carteles de aviso', 'Muestra los avisos flotantes, que podés arrastrar y cerrar con la X. Si lo desactivás, no vuelven a aparecer.')}
      <button class="pm-reset" id="cfgReset">Restablecer el orden de las apps</button>
    </div>`;
        document.body.append(o);
        requestAnimationFrame(() => o.classList.add('on'));
        o.onclick = e => { if (e.target === o) cerrarConfig(); };
        o.querySelector('#cfgBack').onclick = cerrarConfig;
        o.querySelectorAll('.sw').forEach(s => {
            s.checked = !!cfg[s.dataset.k];
            s.onchange = () => {
                cfg[s.dataset.k] = s.checked; setD('cfg', cfg);
                if (s.dataset.k === 'carteles' && s.checked) cerrados.clear(); /* al reactivar, vuelven todos */
                render();
            };
        });
        o.querySelector('#cfgReset').onclick = confirmarReset;
    }

    /* ------------------------ ACTIVAR / DESACTIVAR ------------------------ */
    function renderPremium() {
        const u = Pichisoft.user;
        document.body.classList.toggle('prem', !!u);
        if (!u) { cerrarConfig(); renderCarteles(); return; }
        cfg = Object.assign({ orden: true, blank: true, buscador: true, carteles: true }, getD('cfg', {}));
        cargarLay(); render();
    }

    /* Mantiene los carteles sueltos dentro de la pantalla al rotar o redimensionar */
    addEventListener('resize', () => {
        document.querySelectorAll('.cartel.suelto').forEach(d => {
            const r = d.getBoundingClientRect();
            d.style.left = Math.max(0, Math.min(r.left, innerWidth - r.width)) + 'px';
            d.style.top = Math.max(0, Math.min(r.top, innerHeight - r.height)) + 'px';
        });
        reservar();
    });

    inyectar();
    const rcOriginal = window.renderCuenta;
    window.renderCuenta = function () { rcOriginal.apply(this, arguments); renderPremium(); };
    renderPremium();
})();
