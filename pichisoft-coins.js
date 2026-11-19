/* =====================================================================
   PICHISOFT COINS  ·  by Pichisoft
   Se carga como MÓDULO, igual en PichonApps y en cada app:
       <script type="module" src="/pichisoft-coins.js"></script>
   - Sin cuenta: guarda todo en localStorage.
   - Con cuenta: guarda en Firestore (colección "pichicoins", doc = tu UID).
   - Lo que se ganó sin cuenta se FUSIONA con la cuenta (nunca se cobra dos veces).
   - PichiCoins se GASTAN en la tienda: saldo = ganado - gastado.
   Para otros scripts:  window.PichiCoins.evento('mensaje' | 'calificar' | 'config' | 'traducir')
                        window.PichiCoins.tiene('id_del_item')
   ===================================================================== */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

(function () {
    'use strict';
    if (window.PichiCoins) return;

    /* ============================ CONFIGURACIÓN ============================ */

    /* IMPORTANTE: tiene que ser IDÉNTICA a la de tus apps (con measurementId),
       si no, Firebase tira "duplicate-app" en el script de sesión de las apps. */
    const FIREBASE_CFG = {
        apiKey: "AIzaSyCf_P8qp9nBUnsVe3qsTAtZJjZHOktKf-8",
        authDomain: "pichisoft.firebaseapp.com",
        projectId: "pichisoft",
        storageBucket: "pichisoft.firebasestorage.app",
        messagingSenderId: "690032082295",
        appId: "1:690032082295:web:b7f0e8cb8fcceb26e9b572",
        measurementId: "G-K7HRKR8BJ1"
    };

    /* Apps actuales (slug = nombre del archivo sin .html). "Entrar a todas" = estas. */
    const APPS = {
        pichonalarm: 'PichonAlarm', pichonbirthday: 'PichonBirthday', pichoncalc: 'PichonCalc',
        pichoncalendar: 'PichonCalendar', pichonchess: 'PichonChess', pichoncode: 'PichonCode',
        pichondestiny: 'PichonDestiny', pichondocs: 'PichonDocs', pichonfood: 'PichonFood',
        pichonlist: 'PichonList', pichman: 'PichonMan', pichonmorse: 'PichonMorse',
        pichonpaint: 'PichonPaint', pichonpass: 'PichonPass', pichonpush: 'PichonPush',
        pichonrandom: 'PichonRandom', pichonsnake: 'PichonSnake', pichontraffic: 'PichonTraffic',
        pichonwatch: 'PichonWatch', pichonweather: 'PichonWeather'
    };
    /* Apps NUEVAS (las que agregues de ahora en adelante). Van acá y NO en APPS.
       Cada una da +25 la primera vez que se entra. Ej: { pichonopinion: 'PichonOpinion' } */
    const APPS_NUEVAS = {};
    const MONTO_APP_NUEVA = 25;

    /* ----- Texto de "¿Qué son los PichiCoins?" -----
       Se muestra con white-space: pre-wrap: los saltos de línea y espacios se respetan tal cual.
       Es texto plano (no HTML). Reemplazá lo de adentro por el tuyo. */
    const TEXTO_QUE_SON = `Los PichiCoins son la moneda virtual de Pichisoft. No valen dinero real y no se pueden cambiar por dinero.

Se ganan usando PichonApps y nuestras aplicaciones: entrando a las apps, pasando tiempo en ellas, leyendo nuestros paneles y más.

Se gastan en la Tienda para conseguir mejoras y detalles exclusivos.

Puedes juntarlos con o sin cuenta de Pichisoft. Si después te creas una cuenta, no pierdes nada de lo que ya juntaste.`;

    /* ----- Tienda -----
       id: único, sin espacios | precio: en PichiCoins | soloCuenta: true si requiere cuenta
       Al comprar, el <body> recibe la clase "psc-own-<id>" (para hacer efectos con CSS)
       y desde cualquier script podés preguntar PichiCoins.tiene('<id>'). */
    const TIENDA = [
        { id: 'marco_dorado', nombre: 'Marco dorado', desc: 'Un borde dorado brillante alrededor de tu foto de perfil.', precio: 2000, soloCuenta: true },
        { id: 'marco_animado', nombre: 'Marco animado', desc: 'Un anillo dorado que gira alrededor de tu foto de perfil.', precio: 6000, soloCuenta: true }
    ];

    /* ----- Logros ----- (monto, texto en "Cómo ganar", texto del cartel "por ...") */
    const HITOS = [  // N = cantidad de apps distintas (0 = todas)
        [1, 10, 'Entrar a una app por primera vez', 'entrar a una de nuestras apps por primera vez'],
        [3, 20, 'Entrar a 3 apps distintas', 'entrar a 3 apps distintas'],
        [5, 30, 'Entrar a 5 apps distintas', 'entrar a 5 apps distintas'],
        [10, 50, 'Entrar a 10 apps distintas', 'entrar a 10 apps distintas'],
        [15, 75, 'Entrar a 15 apps distintas', 'entrar a 15 apps distintas'],
        [0, 100, 'Entrar a todas nuestras apps', 'entrar a todas nuestras apps']
    ];
    const TRAMOS = [  // segundos acumulados EN EL DÍA (pestaña visible y con actividad)
        [600, 80, 'Permanecer 10 minutos en nuestras apps (en un mismo día)', 'permanecer 10 minutos en nuestras apps'],
        [1800, 250, 'Permanecer 30 minutos en nuestras apps (en un mismo día)', 'permanecer 30 minutos en nuestras apps'],
        [3600, 600, 'Permanecer 1 hora en nuestras apps (en un mismo día)', 'permanecer 1 hora en nuestras apps']
    ];
    const MONTO_RECORD = 120;
    const MONTO_PANEL = 20;
    const PANELES = {
        sobre: 'Sobre nosotros', faq: 'Preguntas frecuentes', info: 'Información general',
        reglas: 'Nuestras reglas', privacidad: 'Privacidad', cookies: 'Cookies'
    };
    const MONTO_CUENTA = 5000;
    const EVENTOS = {  // solo con cuenta
        mensaje: [150, 'Enviar un mensaje por primera vez', 'enviar tu primer mensaje'],
        calificar: [250, 'Calificar una app por primera vez', 'calificar una app por primera vez'],
        config: [250, 'Configurar tu PichonApps (al menos un cambio)', 'configurar tu PichonApps por primera vez'],
        traducir: [180, 'Traducir PichonApps a otro idioma por primera vez', 'traducir PichonApps a otro idioma por primera vez']
    };
    const DUR_CARTEL = 4600;

    /* ================================ ESTILOS ================================ */
    const CSS = `
#psc-dock{position:absolute;top:100px;right:16px;z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
#psc-dock #pf-share-btn{position:static!important;top:auto!important;right:auto!important}
body:has(.ov) #psc-dock{display:none}
@media (max-width:600px){#psc-dock{right:14px}}

#psc-btn{display:inline-flex;align-items:center;gap:8px;background:#333;color:whitesmoke;border:1px solid #666;border-radius:6px;padding:9px 14px;font:inherit;font-size:.85rem;cursor:pointer;user-select:none;-webkit-user-select:none;transition:background .2s,color .2s,transform .15s,box-shadow .2s}
#psc-btn:hover{background:whitesmoke;color:#222}
#psc-btn .psc-mini{display:none;width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff6c9,#f1d98a 35%,#d4af37 70%,#8a6a10);box-shadow:0 0 8px rgba(241,217,138,.6)}
#psc-btn.cuenta{border:1.5px solid #d4af37;background:linear-gradient(135deg,#2b2107,#100c02);color:#f1d98a;font-family:Georgia,"Times New Roman",serif;font-weight:bold;font-size:.92rem;padding:8px 16px 8px 12px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)}
#psc-btn.cuenta .psc-mini{display:inline-block}
#psc-btn.cuenta:hover{background:linear-gradient(135deg,#f1d98a,#c9a227 55%,#a67c10);color:#1a1405;transform:translateY(-1px);box-shadow:0 0 16px rgba(241,217,138,.45)}
#psc-btn:focus-visible{outline:2px solid #f1d98a;outline-offset:2px}

/* ---------- Panel ---------- */
.psc-ov{position:fixed;inset:0;z-index:100002;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;animation:pscFade .25s ease}
@keyframes pscFade{from{opacity:0}to{opacity:1}}
.psc-card{background:linear-gradient(180deg,#141414,#0a0a0a);border:2px solid #d4af37;border-radius:16px;width:100%;max-width:720px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.9),0 0 30px rgba(212,175,55,.15);color:#d4d4d4;font-family:Verdana,"Open Sans",sans-serif}
.psc-hd{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid rgba(212,175,55,.3);background:rgba(212,175,55,.03);border-radius:14px 14px 0 0}
.psc-hd h2{margin:0;font:bold 1.8rem "Times New Roman",Times,serif;color:#f1d98a;text-shadow:0 0 10px rgba(241,217,138,.3)}
.psc-x{position:relative;width:34px;height:34px;padding:0;border:1.5px solid #d4af37;border-radius:50%;background:transparent;cursor:pointer;transition:transform .3s,background .2s}
.psc-x::before,.psc-x::after{content:"";position:absolute;left:50%;top:50%;width:13px;height:2px;margin:-1px 0 0 -6.5px;border-radius:2px;background:#f1d98a}
.psc-x::before{transform:rotate(45deg)}.psc-x::after{transform:rotate(-45deg)}
.psc-x:hover{transform:rotate(90deg);background:#d4af37}.psc-x:hover::before,.psc-x:hover::after{background:#111}
.psc-bd{padding:18px 20px 22px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#b38b27 #0a0a0a}
.psc-acc{background:linear-gradient(180deg,#1b1b1b,#131313);border:1px solid rgba(212,175,55,.26);border-radius:14px;overflow:hidden;margin-bottom:12px}
.psc-acc-h{width:100%;display:flex;align-items:center;gap:12px;background:none;border:0;color:#fff;font:bold 1.02rem Verdana,"Open Sans",sans-serif;padding:16px 18px;cursor:pointer;text-align:left}
.psc-acc-h:hover{background:rgba(212,175,55,.07)}
.psc-acc-h:focus-visible{outline:2px solid #d4af37;outline-offset:-2px}
.psc-acc-t{flex:1;min-width:0}
.psc-acc .chev{flex:none;width:9px;height:9px;border:solid #d4af37;border-width:0 2px 2px 0;transform:rotate(45deg);margin-top:-4px;transition:transform .25s,margin .25s}
.psc-acc.open .chev{transform:rotate(225deg);margin-top:4px}
.psc-acc-b{display:none;padding:2px 18px 18px}
.psc-acc.open>.psc-acc-b{display:block;animation:pscFade .25s ease}
.psc-tx{font-family:Arial,sans-serif;font-weight:bold;font-size:1rem;color:#c9c9c9;line-height:1.6;white-space:pre-wrap;word-break:break-word;user-select:text;-webkit-user-select:text}
p.psc-tx{margin:0 0 14px}
.psc-big{font:bold 1.5rem "Times New Roman",Times,serif;color:#f1d98a;margin:6px 0 16px;user-select:text}
.psc-big b{color:#fff}
.psc-tt{font:bold 1.05rem "Times New Roman",Times,serif;color:#f1d98a;margin:6px 0 6px}
.psc-h4{margin:18px 0 8px;padding-bottom:5px;border-bottom:1px dashed rgba(212,175,55,.25);font:bold 1.05rem "Times New Roman",Times,serif;color:#f1d98a}
.psc-h4:first-child{margin-top:4px}
.psc-row{display:flex;align-items:center;gap:12px;padding:9px 4px;font-family:Arial,sans-serif;font-weight:bold;font-size:.92rem;color:#d4d4d4;line-height:1.4}
.psc-row small{display:block;color:#8d8d8d;font-weight:normal;font-size:.72rem;margin-top:2px}
.psc-rt{flex:1;min-width:0}
.psc-amt{flex:none;color:#f1d98a;font-weight:bold;white-space:nowrap}
.psc-ck{flex:none;position:relative;width:18px;height:18px;border:2px solid #4a4326;border-radius:5px;box-sizing:border-box}
.psc-row.done{opacity:.55}
.psc-row.done .psc-ck{border-color:#d4af37;background:rgba(212,175,55,.15)}
.psc-row.done .psc-ck::after{content:"";position:absolute;left:4px;top:0;width:5px;height:9px;border:solid #f1d98a;border-width:0 2px 2px 0;transform:rotate(45deg)}
.psc-row.lock{opacity:.45}
.psc-item{border:1px solid #2b2b2b;background:#161616;border-radius:12px;padding:14px;margin-top:10px}
.psc-item.own{border-color:#d4af37;background:rgba(212,175,55,.07)}
.psc-item-t{display:flex;justify-content:space-between;gap:10px;align-items:baseline;font:bold 1rem Arial,sans-serif;color:#fff}
.psc-item-t span:last-child{color:#f1d98a;white-space:nowrap}
.psc-item p{margin:6px 0 10px;font:.82rem/1.5 Arial,sans-serif;color:#aaa}
.psc-buy{background:#000;color:#fff;border:1px solid #4a4a4a;border-radius:8px;padding:9px 14px;font:.9rem Georgia,"Times New Roman",serif;cursor:pointer;transition:background-color .15s,color .15s}
.psc-buy:hover:not(:disabled){background:#fff;color:#000}
.psc-buy:disabled{opacity:.5;cursor:default}
.psc-buy.ok{background:linear-gradient(135deg,#f1d98a,#c9a227);color:#1a1405;border-color:#f1d98a}
@media (max-width:600px){.psc-ov{padding:10px}.psc-card{max-height:92vh}.psc-hd h2{font-size:1.5rem}.psc-bd{padding:14px 12px 18px}}

/* ---------- Cartel "¡Ganaste!" ---------- */
.psc-t{position:fixed;top:14px;left:50%;z-index:2147483600;display:flex;align-items:center;gap:14px;width:max-content;max-width:min(480px,calc(100vw - 20px));box-sizing:border-box;padding:14px 22px 17px 14px;border-radius:16px;border:1.5px solid #d4af37;background:linear-gradient(160deg,#241b06,#0c0a03 70%);color:#fff;font-family:Verdana,"Open Sans",sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 34px rgba(212,175,55,.35);overflow:hidden;cursor:pointer;transform:translateX(-50%);animation:pscIn .8s cubic-bezier(.2,1.35,.35,1) both,pscGlow 2.2s ease-in-out .8s infinite;user-select:none;-webkit-user-select:none}
.psc-t.out{animation:pscOut .45s ease forwards}
.psc-t::before{content:"";position:absolute;top:0;bottom:0;width:55%;left:-80%;background:linear-gradient(100deg,transparent,rgba(241,217,138,.3),transparent);transform:skewX(-20deg);animation:pscShine 1.5s ease .55s 2}
.psc-coin{flex:none;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 32% 28%,#fff6c9,#f1d98a 30%,#d4af37 62%,#8a6a10);border:2px solid #fff3b0;box-shadow:inset 0 -3px 6px rgba(0,0,0,.35),0 0 18px rgba(241,217,138,.6);font:bold 1.5rem "Times New Roman",serif;color:#5b4308;animation:pscFlip 1.8s ease-in-out infinite}
.psc-t1{font:bold 1.15rem "Times New Roman",Times,serif;color:#f1d98a;line-height:1.25}
.psc-t1 b{color:#fff;text-shadow:0 0 12px rgba(241,217,138,.9)}
.psc-t2{font-size:.8rem;color:#d0d0d0;margin-top:3px;line-height:1.4}
.psc-bar{position:absolute;left:0;bottom:0;height:3px;width:100%;background:linear-gradient(90deg,#f1d98a,#d4af37);transform-origin:left;animation:pscBar ${DUR_CARTEL}ms linear forwards}
.psc-sp{position:absolute;width:6px;height:6px;border-radius:50%;background:#f1d98a;box-shadow:0 0 8px #f1d98a;opacity:0;animation:pscSpark 1.6s ease-out infinite}
.psc-sp:nth-of-type(1){left:70px;top:16px;animation-delay:.6s}
.psc-sp:nth-of-type(2){left:34%;top:10px;animation-delay:.9s}
.psc-sp:nth-of-type(3){right:30%;top:14px;animation-delay:1.2s}
.psc-sp:nth-of-type(4){right:12px;top:22px;animation-delay:.75s}
.psc-sp:nth-of-type(5){left:46%;bottom:12px;animation-delay:1.05s}
.psc-sp:nth-of-type(6){left:14px;bottom:10px;animation-delay:1.35s}
@keyframes pscIn{0%{opacity:0;transform:translate(-50%,-170%) scale(.7)}60%{opacity:1;transform:translate(-50%,8%) scale(1.04)}100%{opacity:1;transform:translate(-50%,0) scale(1)}}
@keyframes pscOut{to{opacity:0;transform:translate(-50%,-150%) scale(.9)}}
@keyframes pscGlow{0%,100%{box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 26px rgba(212,175,55,.3)}50%{box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 46px rgba(241,217,138,.6)}}
@keyframes pscShine{to{left:140%}}
@keyframes pscFlip{from{transform:perspective(320px) rotateY(0)}to{transform:perspective(320px) rotateY(360deg)}}
@keyframes pscBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@keyframes pscSpark{0%{opacity:0;transform:translateY(0) scale(0)}30%{opacity:1;transform:translateY(-8px) scale(1)}100%{opacity:0;transform:translateY(-26px) scale(.2)}}
@media (prefers-reduced-motion:reduce){.psc-t,.psc-t::before,.psc-coin,.psc-sp{animation:none!important}.psc-t{transform:translateX(-50%)}.psc-bar{animation:pscBar ${DUR_CARTEL}ms linear forwards!important}}

/* ---------- Efectos de la tienda ---------- */
body.psc-own-marco_dorado #cuenta .av{box-shadow:0 0 0 3px #d4af37,0 0 14px rgba(212,175,55,.6)}
body.psc-own-marco_animado #cuenta .avwrap::before{content:"";position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(#f1d98a,#8a6a10,#fff6c9,#d4af37,#f1d98a);animation:pscSpin 3s linear infinite}
body.psc-own-marco_animado #cuenta .av{position:relative;z-index:1}
body.psc-own-marco_animado #cuenta .lapiz{z-index:2}
@keyframes pscSpin{to{transform:rotate(360deg)}}
`;

    /* ============================= UTILIDADES ============================= */
    const app = getApps()[0] || initializeApp(FIREBASE_CFG);
    const auth = getAuth(app), db = getFirestore(app);
    const esIndex = (() => { const p = location.pathname.replace(/\/+$/, ''); return p === '' || p === '/index.html'; })();
    const slugActual = esIndex ? '' : (location.pathname.split('/').pop() || '').replace(/\.html$/i, '').toLowerCase();

    const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
    const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
    const fmt = n => Math.max(0, Math.round(+n || 0)).toLocaleString('es-AR');
    const numEl = n => { const b = h('b', 'notranslate', fmt(n)); b.setAttribute('translate', 'no'); return b; };
    function P(cls, ...parts) { const p = h('p', cls); parts.forEach(x => p.append(typeof x === 'number' ? numEl(x) : x)); return p; }
    const hoy = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const suma = o => Object.values(o).reduce((a, v) => a + (+v || 0), 0);
    function sesionValida() { const s = lsGet('ps_session', null); return !!(s && s.k && s.exp > Date.now()); }

    /* ================================ ESTADO ================================ */
    function leerGuest() {
        const g = lsGet('psc_guest', null) || {};
        return {
            earned: g.earned && typeof g.earned === 'object' ? g.earned : {},
            bought: g.bought && typeof g.bought === 'object' ? g.bought : {},
            rec: +g.rec || 0
        };
    }
    let S = leerGuest();                 // ledger activo (invitado o cuenta)
    let modo = 'invitado';               // 'invitado' | 'cargando' | 'cuenta'
    let uid = null;
    let pend = { earned: {}, bought: {}, rec: false };
    let dock = null, btn = null;
    const abierto = {};
    const saldo = () => Math.max(0, suma(S.earned) - suma(S.bought));

    function persistPend() { lsSet('psc_pend', { uid, earned: pend.earned, bought: pend.bought, rec: pend.rec }); }
    function pendAdd(tipo, k, v) { if (modo === 'cuenta') pend[tipo][k] = v; }
    function guardar() {
        if (modo === 'cuenta') { persistPend(); programarFlush(); }
        else lsSet('psc_guest', S);
    }

    let flushing = false, tf = 0;
    function programarFlush(ms) { clearTimeout(tf); tf = setTimeout(flush, ms || 700); }
    async function flush() {
        if (modo !== 'cuenta' || !uid || flushing) return;
        const e = { ...pend.earned }, b = { ...pend.bought }, r = pend.rec;
        if (!Object.keys(e).length && !Object.keys(b).length && !r) return;
        flushing = true;
        const id = uid;
        try {
            await setDoc(doc(db, 'pichicoins', id), { earned: e, bought: b, rec: S.rec }, { merge: true });
            if (uid === id) {
                Object.keys(e).forEach(k => delete pend.earned[k]);
                Object.keys(b).forEach(k => delete pend.bought[k]);
                if (r) pend.rec = false;
                persistPend();
            }
        } catch (err) {
            console.warn('PichiCoins: no se pudo guardar, se reintenta.', err);
            setTimeout(flush, 20000);
        } finally { flushing = false; }
    }

    /* ---------------------- Fusión invitado -> cuenta ---------------------- */
    async function cargarCuenta(id) {
        let remoto = null, fallo = false;
        try { const s = await getDoc(doc(db, 'pichicoins', id)); if (s.exists()) remoto = s.data(); }
        catch (e) { console.warn('PichiCoins: no se pudo leer la cuenta.', e); fallo = true; }
        if (uid !== id) return;
        if (fallo) { modo = 'invitado'; cambio(); return; }

        const A = { earned: { ...(remoto && remoto.earned) }, bought: { ...(remoto && remoto.bought) }, rec: +(remoto && remoto.rec) || 0 };
        const nuevo = { earned: {}, bought: {} };
        const unir = src => {
            if (!src) return;
            ['earned', 'bought'].forEach(t => {
                const o = src[t] || {};
                for (const k in o) if (!(k in A[t])) { A[t][k] = o[k]; nuevo[t][k] = o[k]; }
            });
            if ((+src.rec || 0) > A.rec) A.rec = +src.rec;
        };
        unir(leerGuest());
        const p = lsGet('psc_pend', null); if (p && p.uid === id) unir(p);

        let bono = false;
        if (!remoto) { A.earned.cuenta_creada = MONTO_CUENTA; nuevo.earned.cuenta_creada = MONTO_CUENTA; bono = true; }

        S = A; modo = 'cuenta';
        pend = { earned: nuevo.earned, bought: nuevo.bought, rec: true };
        persistPend(); programarFlush(100);
        cambio();
        if (bono) cartel({ monto: MONTO_CUENTA, texto: 'crear tu cuenta de Pichisoft' });
        revisarHitos();
    }

    function evaluar() {
        const u = auth.currentUser;
        const nuevo = (u && u.emailVerified && sesionValida() && (!window.Pichisoft || window.Pichisoft.user)) ? u.uid : null;
        if (nuevo === uid) { actualizarBoton(); return; }
        uid = nuevo;
        if (!nuevo) { modo = 'invitado'; S = leerGuest(); pend = { earned: {}, bought: {}, rec: false }; cambio(); return; }
        modo = 'cargando';
        cargarCuenta(nuevo);
    }

    /* ================================ LOGROS ================================ */
    function ganar(id, monto, motivo) {
        if (id in S.earned) return false;
        S.earned[id] = monto; pendAdd('earned', id, monto); guardar();
        if (monto > 0 && motivo) cartel({ monto, texto: motivo });
        cambio();
        return true;
    }
    function revisarHitos() {
        const total = Object.keys(APPS).length;
        const n = Object.keys(S.earned).filter(k => k.startsWith('v_') && APPS[k.slice(2)]).length;
        HITOS.forEach(([N, monto, , motivo]) => { if (n >= (N || total)) ganar('apps_' + (N || 'todas'), monto, motivo); });
    }
    function visitar(slug) {
        slug = String(slug || '').toLowerCase();
        if (APPS[slug]) {
            const k = 'v_' + slug;
            if (!(k in S.earned)) { S.earned[k] = 0; pendAdd('earned', k, 0); guardar(); }
            revisarHitos();
        } else if (APPS_NUEVAS[slug]) {
            ganar('app_nueva_' + slug, MONTO_APP_NUEVA, 'entrar a ' + APPS_NUEVAS[slug] + ', una app nueva');
        }
    }
    function evento(n) {
        const e = EVENTOS[n];
        if (e && modo === 'cuenta') ganar('ev_' + n, e[0], e[2]);
    }

    /* ---------------------- Tiempo de permanencia ---------------------- */
    let ultAct = Date.now();
    ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(ev =>
        addEventListener(ev, () => { ultAct = Date.now(); }, { passive: true, capture: true }));
    function revisarTiempo(s, d) {
        TRAMOS.forEach(([sec, monto, , motivo]) => { if (s >= sec) ganar('t_' + sec, monto, motivo); });
        if (S.rec > 0 && s > S.rec) ganar('record_' + d, MONTO_RECORD, 'superar tu récord diario de tiempo en nuestras apps');
    }
    setInterval(() => {
        // Solo cuenta con la pestaña visible, enfocada y con actividad en los últimos 2 minutos
        if (document.visibilityState !== 'visible' || !document.hasFocus() || Date.now() - ultAct > 120000) return;
        const d = hoy();
        let o = lsGet('psc_day', null);
        if (!o || o.d !== d) {
            if (o && o.s > S.rec) { S.rec = o.s; if (modo === 'cuenta') pend.rec = true; guardar(); }
            o = { d, s: 0 };
        }
        o.s++; lsSet('psc_day', o);
        revisarTiempo(o.s, d);
    }, 1000);

    /* ================================ CARTEL ================================ */
    const cola = []; let mostrando = false;
    function cartel(o) { cola.push(o); if (!mostrando) siguiente(); }
    function siguiente() {
        const o = cola.shift();
        if (!o) { mostrando = false; return; }
        mostrando = true;
        const t = h('div', 'psc-t'); t.setAttribute('translate', 'no'); t.setAttribute('role', 'status');
        t.innerHTML = '<div class="psc-coin">P</div><div><div class="psc-t1"></div><div class="psc-t2"></div></div><div class="psc-bar"></div>' + '<i class="psc-sp"></i>'.repeat(6);
        const t1 = t.querySelector('.psc-t1'), t2 = t.querySelector('.psc-t2');
        if (o.titulo) { t1.textContent = o.titulo; }
        else { t1.append('¡Ganaste ', Object.assign(h('b'), { textContent: fmt(o.monto) }), ' PichiCoins!'); }
        t2.textContent = o.texto ? (o.titulo ? o.texto : 'por ' + o.texto) : '';
        document.body.append(t);
        let fin = false;
        const cerrar = () => { if (fin) return; fin = true; t.classList.add('out'); setTimeout(() => { t.remove(); siguiente(); }, 450); };
        t.onclick = cerrar;
        setTimeout(cerrar, DUR_CARTEL);
    }

    /* ================================ PANEL ================================ */
    function fila(texto, monto, opt) {
        opt = opt || {};
        const r = h('div', 'psc-row' + (opt.done ? ' done' : '') + (opt.lock ? ' lock' : ''));
        const t = h('span', 'psc-rt', texto);
        if (opt.nota) t.append(h('small', '', opt.nota));
        const a = h('span', 'psc-amt'); a.append('+', numEl(monto));
        r.append(h('i', 'psc-ck'), t, a);
        return r;
    }
    function acc(key, titulo, cont) {
        const a = h('div', 'psc-acc' + (abierto[key] ? ' open' : ''));
        const b = h('button', 'psc-acc-h'); b.type = 'button'; b.setAttribute('aria-expanded', !!abierto[key]);
        b.append(h('span', 'psc-acc-t', titulo), h('span', 'chev'));
        b.onclick = () => { abierto[key] = !abierto[key]; a.classList.toggle('open', abierto[key]); b.setAttribute('aria-expanded', abierto[key]); };
        const c = h('div', 'psc-acc-b'); c.append(cont);
        a.append(b, c); return a;
    }

    function bQue() { const d = h('div', 'psc-tx'); d.textContent = TEXTO_QUE_SON; return d; }

    function bMis() {
        const w = h('div'), s = saldo();
        w.append(P('psc-big', 'Tienes ', s, ' PichiCoins'));
        w.append(h('div', 'psc-tt', 'Tu Objetivo Actual:'));
        const libres = TIENDA.filter(i => !S.bought[i.id]);
        const prox = libres.filter(i => i.precio > s).sort((a, b) => a.precio - b.precio)[0];
        const ya = libres.filter(i => i.precio <= s && (!i.soloCuenta || modo === 'cuenta'));
        if (prox) {
            w.append(P('psc-tx', 'Ganar ', prox.precio - s, ' PichiCoins más: con esa cantidad podrás comprar «' + prox.nombre + '».' + (prox.soloCuenta && modo !== 'cuenta' ? ' (Requiere cuenta de Pichisoft)' : '')));
        } else if (!libres.length) {
            w.append(P('psc-tx', '¡Ya compraste todo lo disponible en la tienda!'));
        } else {
            w.append(P('psc-tx', '¡Ya tienes PichiCoins de sobra! Visita la Tienda para gastarlos.'));
        }
        if (ya.length && prox) w.append(P('psc-tx', 'Ya puedes comprar: ' + ya.map(i => '«' + i.nombre + '»').join(', ') + '.'));
        return w;
    }

    function bGanar() {
        const w = h('div'), E = S.earned;
        if (modo !== 'cuenta') {
            w.append(P('psc-tx', 'Si te creas una cuenta de Pichisoft ganas ', MONTO_CUENTA, ' PichiCoins, y lo que juntes sin cuenta se conserva.'));
        }
        w.append(h('div', 'psc-h4', 'Explorando nuestras apps'));
        HITOS.forEach(([N, monto, texto]) => w.append(fila(texto, monto, { done: ('apps_' + (N || 'todas')) in E })));
        const nuevas = Object.keys(APPS_NUEVAS);
        if (!nuevas.length) w.append(fila('Entrar a una app nueva (cada vez que sumemos una)', MONTO_APP_NUEVA));
        else nuevas.forEach(sl => w.append(fila('Entrar a ' + APPS_NUEVAS[sl] + ' (app nueva)', MONTO_APP_NUEVA, { done: ('app_nueva_' + sl) in E })));

        w.append(h('div', 'psc-h4', 'Tiempo en nuestras apps'));
        TRAMOS.forEach(([sec, monto, texto]) => w.append(fila(texto, monto, { done: ('t_' + sec) in E })));
        w.append(fila('Superar tu récord de tiempo diario', MONTO_RECORD, { nota: 'Una vez por día' + (S.rec > 0 ? ' · Tu récord: ' + Math.floor(S.rec / 60) + ' min' : '') }));

        w.append(h('div', 'psc-h4', 'Leer nuestros paneles'));
        Object.keys(PANELES).forEach(k => w.append(fila('Leer «' + PANELES[k] + '»', MONTO_PANEL, { done: ('panel_' + k) in E })));

        w.append(h('div', 'psc-h4', 'Cuenta de Pichisoft'));
        w.append(fila('Crear tu cuenta de Pichisoft', MONTO_CUENTA, { done: 'cuenta_creada' in E }));
        Object.keys(EVENTOS).forEach(k => w.append(fila(EVENTOS[k][1], EVENTOS[k][0], { done: ('ev_' + k) in E, lock: modo !== 'cuenta', nota: modo !== 'cuenta' ? 'Solo con cuenta' : '' })));
        return w;
    }

    function bTienda() {
        const w = h('div');
        w.append(P('psc-big', 'Tu saldo: ', saldo(), ' PichiCoins'));
        if (!TIENDA.length) { w.append(P('psc-tx', 'Muy pronto habrá cosas para comprar.')); return w; }
        TIENDA.forEach(it => {
            const own = !!S.bought[it.id], s = saldo();
            const c = h('div', 'psc-item' + (own ? ' own' : ''));
            const t = h('div', 'psc-item-t'); t.append(h('span', '', it.nombre)); const pr = h('span'); pr.append(numEl(it.precio)); t.append(pr);
            const b = h('button', 'psc-buy'); b.type = 'button';
            if (own) { b.textContent = 'Comprado'; b.disabled = true; }
            else if (it.soloCuenta && modo !== 'cuenta') { b.textContent = 'Solo con cuenta'; b.disabled = true; }
            else if (modo === 'cargando') { b.textContent = 'Cargando…'; b.disabled = true; }
            else if (s < it.precio) { b.append('Te faltan ', numEl(it.precio - s)); b.disabled = true; }
            else {
                b.textContent = 'Comprar';
                let t0 = 0;
                b.onclick = () => {
                    if (!b.classList.contains('ok')) {
                        b.classList.add('ok'); b.textContent = '¿Confirmar compra?';
                        t0 = setTimeout(() => { b.classList.remove('ok'); b.textContent = 'Comprar'; }, 4000);
                        return;
                    }
                    clearTimeout(t0); comprar(it);
                };
            }
            c.append(t, h('p', '', it.desc), b);
            w.append(c);
        });
        return w;
    }

    function comprar(it) {
        if (S.bought[it.id] || saldo() < it.precio) return;
        if (it.soloCuenta && modo !== 'cuenta') return;
        S.bought[it.id] = it.precio; pendAdd('bought', it.id, it.precio); guardar();
        cambio();
        cartel({ titulo: '¡Compra realizada!', texto: '«' + it.nombre + '» · −' + fmt(it.precio) + ' PichiCoins' });
    }

    function render() {
        const bd = document.getElementById('psc-bd'); if (!bd) return;
        const top = bd.scrollTop; bd.textContent = '';
        bd.append(
            acc('que', '¿Qué son los PichiCoins?', bQue()),
            acc('mis', 'Mis PichiCoins', bMis()),
            acc('ganar', '¿Cómo ganar PichiCoins?', bGanar()),
            acc('tienda', 'Tienda', bTienda())
        );
        bd.scrollTop = top;
    }
    function abrirPanel() {
        if (document.getElementById('psc-ov')) return;
        const ov = h('div', 'psc-ov'); ov.id = 'psc-ov';
        ov.innerHTML = '<div class="psc-card" role="dialog" aria-modal="true" aria-label="PichiCoins"><div class="psc-hd"><h2>PichiCoins</h2><button type="button" class="psc-x" aria-label="Cerrar"></button></div><div class="psc-bd" id="psc-bd"></div></div>';
        document.body.append(ov);
        document.documentElement.style.overflow = 'hidden';
        const esc = e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); cerrar(); } };
        const cerrar = () => { document.removeEventListener('keydown', esc, true); ov.remove(); document.documentElement.style.overflow = ''; };
        document.addEventListener('keydown', esc, true);
        ov.onclick = e => { if (e.target === ov) cerrar(); };
        ov.querySelector('.psc-x').onclick = cerrar;
        render();
    }

    /* ======================== BOTÓN, EFECTOS Y ENGANCHES ======================== */
    function actualizarBoton() { if (btn) btn.classList.toggle('cuenta', modo === 'cuenta'); }
    function aplicarEfectos() {
        const b = document.body;
        [...b.classList].filter(c => c.startsWith('psc-own-')).forEach(c => b.classList.remove(c));
        Object.keys(S.bought).forEach(id => b.classList.add('psc-own-' + id));
    }
    function cambio() {
        actualizarBoton(); aplicarEfectos(); render();
        try { window.dispatchEvent(new CustomEvent('pichicoins:cambio', { detail: { saldo: saldo(), modo } })); } catch { }
    }

    function montarDock() {
        const cuenta = document.getElementById('cuenta'); if (!cuenta) return;
        dock = h('div'); dock.id = 'psc-dock';
        btn = h('button'); btn.id = 'psc-btn'; btn.type = 'button';
        btn.innerHTML = '<i class="psc-mini"></i><span>PichiCoins</span>';
        btn.onclick = abrirPanel;
        dock.append(btn);
        const sh = document.getElementById('pf-share-btn'); if (sh) dock.append(sh);   // Compartir queda debajo
        document.body.append(dock);
        const pos = () => {
            const r = cuenta.getBoundingClientRect(), fijo = getComputedStyle(cuenta).position === 'fixed';
            dock.style.top = Math.round(r.bottom + (fijo ? 0 : scrollY) + 10) + 'px';
        };
        if (window.ResizeObserver) new ResizeObserver(pos).observe(cuenta);
        addEventListener('resize', pos); addEventListener('load', pos);
        pos(); setTimeout(pos, 600);
    }

    function escucharIndex() {
        // Entrar a una app desde PichonApps (clic en cualquier link a /pichonXXX.html)
        const enlace = e => {
            const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
            const m = /pichisoft\.cc\/([a-z0-9_-]+)(?:\.html)?(?:[?#]|$)/i.exec(a.href);
            if (m) visitar(m[1]);
        };
        addEventListener('click', enlace, true);
        addEventListener('auxclick', enlace, true);

        // Leer un panel inferior: tiene que quedar abierto 6 segundos
        let tPanel = 0;
        document.addEventListener('click', e => {
            const b = e.target.closest && e.target.closest('.pf-btn[data-pf],[data-pf-link]'); if (!b) return;
            const k = b.dataset.pf || b.dataset.pfLink; if (!PANELES[k]) return;
            clearTimeout(tPanel);
            tPanel = setTimeout(() => {
                const m = document.getElementById('pf-modal');
                if (m && m.classList.contains('open')) ganar('panel_' + k, MONTO_PANEL, 'leer el panel «' + PANELES[k] + '»');
            }, 6000);
        }, true);

        const rc = window.renderCuenta;
        window.renderCuenta = function () { if (rc) rc.apply(this, arguments); evaluar(); };
    }

    /* ================================== INICIO ================================== */
    const st = document.createElement('style'); st.id = 'psc-style'; st.textContent = CSS; document.head.appendChild(st);
    if (esIndex) { montarDock(); escucharIndex(); }
    window.PichiCoins = {
        evento, abrir: abrirPanel,
        saldo: () => saldo(), modo: () => modo,
        tiene: id => !!S.bought[id]
    };
    addEventListener('pagehide', () => { flush(); });
    onAuthStateChanged(auth, () => evaluar());
    evaluar();
    cambio();
    if (slugActual) visitar(slugActual);
})();