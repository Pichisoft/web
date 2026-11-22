/* =====================================================================
   PICHISOFT COINS  ·  by Pichisoft  ·  v4 (2026-11-20)
   ===================================================================== */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

(function () {
    'use strict';
    if (window.PichiCoins) return;

    /* ============================ CONFIGURACIÓN ============================ */
    const FIREBASE_CFG = {
        apiKey: "AIzaSyCf_P8qp9nBUnsVe3qsTAtZJjZHOktKf-8",
        authDomain: "pichisoft.firebaseapp.com",
        projectId: "pichisoft",
        storageBucket: "pichisoft.firebasestorage.app",
        messagingSenderId: "690032082295",
        appId: "1:690032082295:web:b7f0e8cb8fcceb26e9b572",
        measurementId: "G-K7HRKR8BJ1"
    };

    const APPS = {
        pichonalarm: 'PichonAlarm', pichonbirthday: 'PichonBirthday', pichoncalc: 'PichonCalc',
        pichoncalendar: 'PichonCalendar', pichonchess: 'PichonChess', pichoncode: 'PichonCode',
        pichondestiny: 'PichonDestiny', pichondocs: 'PichonDocs', pichonfood: 'PichonFood',
        pichonlist: 'PichonList', pichman: 'PichonMan', pichonmorse: 'PichonMorse', pichonopinion: 'PichonOpinion',
        pichonpaint: 'PichonPaint', pichonpass: 'PichonPass', pichonpush: 'PichonPush',
        pichonrandom: 'PichonRandom', pichonsnake: 'PichonSnake', pichontraffic: 'PichonTraffic',
        pichonwatch: 'PichonWatch', pichonweather: 'PichonWeather'
    };
    let APPS_NUEVAS = {};

    const MONTO_APP_NUEVA = 100;

    const TEXTO_QUE_SON = `Los PichiCoins son la moneda virtual de Pichisoft. No valen dinero real y no se pueden cambiar por dinero.

Se ganan usando PichonApps y nuestras aplicaciones: entrando a las apps, pasando tiempo en ellas, leyendo nuestros paneles y más.

Se gastan en la Tienda para conseguir mejoras y detalles exclusivos.

Puedes juntarlos con o sin cuenta de Pichisoft. Si después te creas una cuenta, no pierdes nada de lo que ya juntaste.`;

    /* Tienda. "slot" agrupa decoraciones que compiten entre sí: solo una equipada por slot. */
    const MAX_CUSTOM = 3, PRECIO_CUSTOM = 1000;
    /* [id, nombre, color principal, color claro] */
    const THEMES = [
        ['esmeralda', 'esmeralda', '#22e07a', '#8dffb8'],
        ['zafiro', 'zafiro', '#3498db', '#a8daf5'],
        ['rubi', 'rubí', '#e74c3c', '#f5a8a0'],
        ['amatista', 'amatista', '#9b59b6', '#d7bde2'],
        ['ambar', 'ámbar', '#f39c12', '#fad7a0'],
        ['diamante', 'diamante', '#7fc4e8', '#e8f6ff'],
        ['magenta', 'magenta', '#e84393', '#f8b8d8'],
        ['coral', 'coral', '#ff6b6b', '#ffc9c9'],
        ['fenix', 'fénix', '#ff7a1a', '#ffd166'],
        ['rosa_awawita', 'Rosa Awawita', '#ff69b4', '#ffd1e8'],
        ['girasol', 'girasol', '#ffd60a', '#fff59d'],
        ['yuli', 'Yuli', '#c8c8c8', '#f0f0f0'],
        ['turquesa', 'turquesa', '#1abc9c', '#a3f0e0'],
        ['lavanda', 'lavanda', '#9b8bd6', '#e2dcff'],
        ['cobre', 'cobre', '#cd7f32', '#f0c9a0'],
        ['lima', 'lima', '#a4de02', '#e3ff9a'],
        ['medianoche', 'medianoche', '#5c6bc0', '#c5cae9'],
        ['nieve', 'nieve', '#ffffff', '#e8e8e8'],
        ['obsidiana', 'obsidiana', '#6b7280', '#d1d5db'],
        ['carbon', 'carbón', '#4b5563', '#9ca3af'],
        ['vino', 'vino', '#7f1d1d', '#fca5a5'],
        ['bosque', 'bosque', '#166534', '#86efac'],
        ['oceano', 'océano profundo', '#1e3a8a', '#93c5fd'],
        ['push', 'push', '#581c87', '#d8b4fe']
    ];
    const TIENDA = [
        { id: 'marco_dorado', nombre: 'Marco dorado', desc: 'Un borde dorado brillante alrededor de tu foto de perfil.', precio: 2000, soloCuenta: true, slot: 'marco' },
        { id: 'marco_animado', nombre: 'Marco animado', desc: 'Un anillo que gira alrededor de tu foto de perfil.', precio: 2500, soloCuenta: true, slot: 'marco' },
        { id: 'marco_arcoiris', nombre: 'Marco arcoíris', desc: 'Un borde arcoíris animado alrededor de tu foto de perfil.', precio: 3200, soloCuenta: true, slot: 'marco' },
        { id: 'marco_neon', nombre: 'Pack Neón', desc: 'Un pack con 10 marcos de neón que pulsan alrededor de tu foto de perfil: cian, magenta, verde, naranja, amarillo, rosa, violeta, rojo, azul y uno que cambia de color. Elegís cuál usar desde Mi colección.', precio: 4000, soloCuenta: true, slot: 'marco' },
        { id: 'marco_fuego', nombre: 'Marco fuego', desc: 'Un anillo de llamas que arde alrededor de tu foto de perfil.', precio: 3500, soloCuenta: true, slot: 'marco' },
        { id: 'marco_hielo', nombre: 'Marco hielo', desc: 'Un anillo helado y cristalino alrededor de tu foto de perfil.', precio: 3500, soloCuenta: true, slot: 'marco' },
        { id: 'marco_glitch', nombre: 'Marco glitch', desc: 'Un borde digital que se distorsiona como una señal con fallas.', precio: 3700, soloCuenta: true, slot: 'marco' },
        ...THEMES.map(([k, n]) => ({ id: 'tema_' + k, nombre: 'Tema ' + n, desc: 'Cambia el dorado de PichonApps por el estilo ' + n + '.', precio: 900, slot: 'tema' })),
        { id: 'tema_dia', nombre: 'Tema del día', desc: 'Tu PichonApps cambia de color solo a lo largo del día: amanecer, mediodía, tarde, tardecita, noche y madrugada.', precio: 1800, slot: 'tema' },
        ...THEMES.map(([k, n]) => ({ id: 'cartel_' + k, nombre: 'Cartel ' + n, desc: 'El cartel de «¡Ganaste!» con el estilo ' + n + '.', precio: 700, slot: 'cartel' })),
        { id: 'titulo', nombre: 'Título personalizado', desc: 'Muestra un título debajo de tu nombre. ¡Podés elegir el texto que quieras!', precio: 1200, soloCuenta: true, slot: 'titulo' },
        { id: 'sonido_moneda', nombre: 'Sonido de moneda', desc: 'Suena una moneda cada vez que ganás PichiCoins.', precio: 500, slot: 'sonido' },
        { id: 'coleccion', nombre: 'Colección completa', desc: 'Todos los ítems de la tienda en un solo paquete.', precio: 15000, soloCuenta: true }
    ];

    const SLOT_NOMBRES = {
        marco: 'Marco de perfil',
        tema: 'Tema de PichonApps',
        cartel: 'Cartel de «¡Ganaste!»',
        titulo: 'Título bajo tu nombre',
        sonido: 'Sonido de moneda'
    };

    const HITOS = [
        [1, 100, 'Entrar a una app por primera vez', 'entrar a una de nuestras apps por primera vez'],
        [3, 200, 'Entrar a 3 apps distintas', 'entrar a 3 apps distintas'],
        [5, 300, 'Entrar a 5 apps distintas', 'entrar a 5 apps distintas'],
        [10, 500, 'Entrar a 10 apps distintas', 'entrar a 10 apps distintas'],
        [15, 750, 'Entrar a 15 apps distintas', 'entrar a 15 apps distintas'],
        [0, 1000, 'Entrar a todas nuestras apps', 'entrar a todas nuestras apps']
    ];
    const TRAMOS = [
        [600, 400, 'Permanecer 10 minutos en nuestras apps (en un mismo día)', 'permanecer 10 minutos en nuestras apps'],
        [1800, 800, 'Permanecer 30 minutos en nuestras apps (en un mismo día)', 'permanecer 30 minutos en nuestras apps'],
        [3600, 1500, 'Permanecer 1 hora en nuestras apps (en un mismo día)', 'permanecer 1 hora en nuestras apps']
    ];
    const MONTO_RECORD = 200;
    const MONTO_PANEL = 50;
    const PANELES = {
        sobre: 'Sobre nosotros', faq: 'Preguntas frecuentes', info: 'Información general',
        reglas: 'Nuestras reglas', privacidad: 'Privacidad', cookies: 'Cookies'
    };
    const MONTO_CUENTA = 5000;
    const EVENTOS = {
        mensaje: [500, 'Enviar un mensaje por primera vez', 'enviar tu primer mensaje'],
        calificar: [500, 'Calificar una app por primera vez', 'calificar una app por primera vez'],
        config: [500, 'Configurar tu PichonApps (al menos un cambio)', 'configurar tu PichonApps por primera vez'],
        traducir: [500, 'Traducir PichonApps a otro idioma por primera vez', 'traducir PichonApps a otro idioma por primera vez'],
        perfil: [500, 'Editar tu perfil (al menos un cambio)', 'editar tu perfil por primera vez']
    };
    const DUR_CARTEL = 4600;

    /* ================================ ESTILOS ================================ */
    const CSS = `
:root { --gold: #d4af37; --gold2: #f1d98a; }

#psc-dock{position:absolute;top:100px;right:16px;z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
#psc-dock #pf-share-btn{position:static!important;top:auto!important;right:auto!important}
body:has(.ov) #psc-dock{display:none}
@media (max-width:600px){#psc-dock{right:14px}}

#psc-btn{display:inline-flex;align-items:center;gap:8px;background:#333;color:whitesmoke;border:1px solid #666;border-radius:6px;padding:9px 14px;font:inherit;font-size:.85rem;cursor:pointer;user-select:none;-webkit-user-select:none;transition:background .2s,color .2s,transform .15s,box-shadow .2s}
#psc-btn:hover{background:whitesmoke;color:#222}
#psc-btn .psc-mini{display:none;width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff6c9,var(--gold2) 35%,var(--gold) 70%,#8a6a10);box-shadow:0 0 8px rgba(241,217,138,.6)}
#psc-btn.cuenta{border:1.5px solid var(--gold);background:linear-gradient(135deg,#2b2107,#100c02);color:var(--gold2);font-family:Georgia,"Times New Roman",serif;font-weight:bold;font-size:.92rem;padding:8px 16px 8px 12px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)}
#psc-btn.cuenta .psc-mini{display:inline-block}
#psc-btn.cuenta:hover{background:linear-gradient(135deg,var(--gold2),var(--gold) 55%,#a67c10);color:#1a1405;transform:translateY(-1px);box-shadow:0 0 16px rgba(241,217,138,.45)}
#psc-btn:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}

.psc-ov{position:fixed;inset:0;z-index:100002;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;animation:pscFade .25s ease}
@keyframes pscFade{from{opacity:0}to{opacity:1}}
.psc-card{background:linear-gradient(180deg,#141414,#0a0a0a);border:2px solid var(--gold);border-radius:16px;width:100%;max-width:720px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.9),0 0 30px rgba(212,175,55,.15);color:#d4d4d4;font-family:Verdana,"Open Sans",sans-serif}
.psc-hd{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid rgba(212,175,55,.3);background:rgba(212,175,55,.03);border-radius:14px 14px 0 0}
.psc-hd h2{margin:0;font:bold 1.8rem "Times New Roman",Times,serif;color:var(--gold2);text-shadow:0 0 10px rgba(241,217,138,.3)}
.psc-x{position:relative;width:34px;height:34px;padding:0;border:1.5px solid var(--gold);border-radius:50%;background:transparent;cursor:pointer;transition:transform .3s,background .2s}
.psc-x::before,.psc-x::after{content:"";position:absolute;left:50%;top:50%;width:13px;height:2px;margin:-1px 0 0 -6.5px;border-radius:2px;background:var(--gold2)}
.psc-x::before{transform:rotate(45deg)}.psc-x::after{transform:rotate(-45deg)}
.psc-x:hover{transform:rotate(90deg);background:var(--gold)}.psc-x:hover::before,.psc-x:hover::after{background:#111}
.psc-bd{padding:18px 20px 22px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#b38b27 #0a0a0a}
.psc-acc{background:linear-gradient(180deg,#1b1b1b,#131313);border:1px solid rgba(212,175,55,.26);border-radius:14px;overflow:hidden;margin-bottom:12px}
.psc-acc-h{width:100%;display:flex;align-items:center;gap:12px;background:none;border:0;color:#fff;font:bold 1.02rem Verdana,"Open Sans",sans-serif;padding:16px 18px;cursor:pointer;text-align:left}
.psc-acc-h:hover{background:rgba(212,175,55,.07)}
.psc-acc-h:focus-visible{outline:2px solid var(--gold);outline-offset:-2px}
.psc-acc-t{flex:1;min-width:0}
.psc-acc .chev{flex:none;width:9px;height:9px;border:solid var(--gold);border-width:0 2px 2px 0;transform:rotate(45deg);margin-top:-4px;transition:transform .25s,margin .25s}
.psc-acc.open .chev{transform:rotate(225deg);margin-top:4px}
.psc-acc-b{display:none;padding:2px 18px 18px}
.psc-acc.open>.psc-acc-b{display:block;animation:pscFade .25s ease}
.psc-tx{font-family:Arial,sans-serif;font-weight:bold;font-size:1rem;color:#c9c9c9;line-height:1.6;white-space:pre-wrap;word-break:break-word;user-select:text;-webkit-user-select:text}
p.psc-tx{margin:0 0 14px}
.psc-big{font:bold 1.5rem "Times New Roman",Times,serif;color:var(--gold2);margin:6px 0 16px;user-select:text}
.psc-big b{color:#fff}
.psc-tt{font:bold 1.05rem "Times New Roman",Times,serif;color:var(--gold2);margin:6px 0 6px}
.psc-h4{margin:18px 0 8px;padding-bottom:5px;border-bottom:1px dashed rgba(212,175,55,.25);font:bold 1.05rem "Times New Roman",Times,serif;color:var(--gold2)}
.psc-h4:first-child{margin-top:4px}
.psc-row{display:flex;align-items:center;gap:12px;padding:9px 4px;font-family:Arial,sans-serif;font-weight:bold;font-size:.92rem;color:#d4d4d4;line-height:1.4}
.psc-row small{display:block;color:#8d8d8d;font-weight:normal;font-size:.72rem;margin-top:2px}
.psc-rt{flex:1;min-width:0}
.psc-amt{flex:none;color:var(--gold2);font-weight:bold;white-space:nowrap}
.psc-ck{flex:none;position:relative;width:18px;height:18px;border:2px solid #4a4326;border-radius:5px;box-sizing:border-box}
.psc-row.done{opacity:.55}
.psc-row.done .psc-ck{border-color:var(--gold);background:rgba(212,175,55,.15)}
.psc-row.done .psc-ck::after{content:"";position:absolute;left:4px;top:0;width:5px;height:9px;border:solid var(--gold2);border-width:0 2px 2px 0;transform:rotate(45deg)}
.psc-row.lock{opacity:.45}
.psc-item{border:1px solid #2b2b2b;background:#161616;border-radius:12px;padding:14px;margin-top:10px}
.psc-item.own{border-color:var(--gold);background:rgba(212,175,55,.07)}
.psc-item-t{display:flex;justify-content:space-between;gap:10px;align-items:baseline;font:bold 1rem Arial,sans-serif;color:#fff}
.psc-item-t span:last-child{color:var(--gold2);white-space:nowrap}
.psc-item p{margin:6px 0 10px;font:.82rem/1.5 Arial,sans-serif;color:#aaa}
.psc-buy{background:#000;color:#fff;border:1px solid #4a4a4a;border-radius:8px;padding:9px 14px;font:.9rem Georgia,"Times New Roman",serif;cursor:pointer;transition:background-color .15s,color .15s}
.psc-buy:hover:not(:disabled){background:#fff;color:#000}
.psc-buy:disabled{opacity:.5;cursor:default}
.psc-buy.ok{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#1a1405;border-color:var(--gold2)}

/* --- Mi colección (equipar) --- */
.psc-eq-item{display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid #272727}
.psc-eq-item:last-child{border-bottom:0}
.psc-eq-info{flex:1;min-width:0}
.psc-eq-name{font-family:Arial,sans-serif;font-weight:bold;font-size:.95rem;color:#fff}
.psc-eq-desc{font-size:.75rem;color:#999;margin-top:3px;line-height:1.4}
.psc-eq-btn{flex:none;padding:8px 14px;background:#333;color:#fff;border:1px solid #666;border-radius:8px;font-family:Georgia,"Times New Roman",serif;font-size:.85rem;cursor:pointer;transition:all .2s}
.psc-eq-btn:hover{background:#fff;color:#000}
.psc-eq-item.equipped .psc-eq-name{color:var(--gold2)}
.psc-eq-item.equipped .psc-eq-btn{background:var(--gold);color:#111;border-color:var(--gold)}
.psc-eq-item.equipped .psc-eq-btn:hover{background:var(--gold2);color:#111}
.psc-empty{font-family:Arial,sans-serif;font-weight:bold;color:#999;font-size:.9rem;text-align:center;padding:14px 0}

/* --- Zona peligrosa / Reset --- */
.psc-reset-section{margin-top:22px;padding-top:16px;border-top:1px solid rgba(220,60,60,.3)}
.psc-reset-section .psc-h4{color:#ff7b7b;border-bottom-color:rgba(220,60,60,.25)}
.psc-reset-btn{display:block;width:100%;margin-top:12px;padding:12px;background:linear-gradient(135deg,#3a1010,#1a0606);color:#ffb0b0;border:1.5px solid #b03030;border-radius:10px;font-family:Georgia,"Times New Roman",serif;font-size:1rem;font-weight:bold;cursor:pointer;transition:all .2s}
.psc-reset-btn:hover{background:linear-gradient(135deg,#5a1818,#2a0808);color:#fff;border-color:#ff5555;box-shadow:0 0 15px rgba(200,50,50,.4)}
.psc-reset-btn:focus-visible{outline:2px solid #ff8888;outline-offset:2px}

/* --- Modal reset --- */
.psc-reset-ov{position:fixed;inset:0;z-index:100005;background:rgba(0,0,0,.9);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;animation:pscFade .25s ease}
.psc-reset-card{width:100%;max-width:480px;background:linear-gradient(180deg,#1a0808,#0a0303);border:2px solid #c0392b;border-radius:16px;padding:26px 24px 22px;color:#e8e8e8;box-shadow:0 20px 60px rgba(0,0,0,.9),0 0 30px rgba(192,57,43,.3)}
.psc-reset-card h2{font-family:"Times New Roman",Times,serif;color:#ff8888;font-size:1.6rem;margin:0 0 14px;text-align:left}
.psc-reset-card p{font-family:Arial,sans-serif;font-size:.88rem;line-height:1.55;color:#d4d4d4;margin:0 0 12px}
.psc-reset-card p b{color:#ff8888}
.psc-reset-cancel{display:block;width:100%;margin-top:18px;padding:12px;background:#2a2a2a;color:#fff;border:1px solid #555;border-radius:10px;font-family:Georgia,"Times New Roman",serif;font-size:.95rem;cursor:pointer}
.psc-reset-cancel:hover{background:#3a3a3a}
.psc-reset-confirm{display:block;width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#5a1818,#2a0808);color:#ffb0b0;border:1.5px solid #c0392b;border-radius:10px;font-family:Georgia,"Times New Roman",serif;font-size:.95rem;font-weight:bold;cursor:pointer}
.psc-reset-confirm:hover{background:linear-gradient(135deg,#8a2020,#400c0c);color:#fff}
.psc-reset-confirm:disabled{opacity:.5;cursor:wait}

/* --- Cartel "¡Ganaste!" --- */
.psc-t{position:fixed;top:14px;left:50%;z-index:2147483600;display:flex;align-items:center;gap:14px;width:max-content;max-width:min(480px,calc(100vw - 20px));box-sizing:border-box;padding:14px 22px 17px 14px;border-radius:16px;border:1.5px solid var(--gold);background:linear-gradient(160deg,#241b06,#0c0a03 70%);color:#fff;font-family:Verdana,"Open Sans",sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 34px rgba(212,175,55,.35);overflow:hidden;cursor:pointer;transform:translateX(-50%);animation:pscIn .8s cubic-bezier(.2,1.35,.35,1) both,pscGlow 2.2s ease-in-out .8s infinite;user-select:none;-webkit-user-select:none}
.psc-t.out{animation:pscOut .45s ease forwards}
.psc-t::before{content:"";position:absolute;top:0;bottom:0;width:55%;left:-80%;background:linear-gradient(100deg,transparent,rgba(241,217,138,.3),transparent);transform:skewX(-20deg);animation:pscShine 1.5s ease .55s 2}
.psc-coin{flex:none;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 32% 28%,#fff6c9,var(--gold2) 30%,var(--gold) 62%,#8a6a10);border:2px solid #fff3b0;box-shadow:inset 0 -3px 6px rgba(0,0,0,.35),0 0 18px rgba(241,217,138,.6);font:bold 1.5rem "Times New Roman",serif;color:#5b4308;animation:pscFlip 1.8s ease-in-out infinite}
.psc-t1{font:bold 1.15rem "Times New Roman",Times,serif;color:var(--gold2);line-height:1.25}
.psc-t1 b{color:#fff;text-shadow:0 0 12px rgba(241,217,138,.9)}
.psc-t2{font-size:.8rem;color:#d0d0d0;margin-top:3px;line-height:1.4}
.psc-bar{position:absolute;left:0;bottom:0;height:3px;width:100%;background:linear-gradient(90deg,var(--gold2),var(--gold));transform-origin:left;animation:pscBar ${DUR_CARTEL}ms linear forwards}
.psc-sp{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--gold2);box-shadow:0 0 8px var(--gold2);opacity:0;animation:pscSpark 1.6s ease-out infinite}
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
/* --- Vista previa --- */
.psc-pv-ov{position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,.9);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;animation:pscFade .25s ease}
.psc-pv-card{width:100%;max-width:440px;background:linear-gradient(180deg,#141414,#0a0a0a);border:2px solid var(--gold);border-radius:16px;padding:22px 20px 18px;color:#e8e8e8;box-shadow:0 20px 60px rgba(0,0,0,.9),0 0 30px rgba(212,175,55,.15)}
.psc-pv-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.psc-pv-hd h2{font-family:"Times New Roman",Times,serif;color:var(--gold2);font-size:1.4rem;margin:0}
.psc-pv-x{position:relative;width:28px;height:28px;padding:0;border:1.5px solid var(--gold);border-radius:50%;background:transparent;cursor:pointer}
.psc-pv-x::before,.psc-pv-x::after{content:"";position:absolute;left:50%;top:50%;width:10px;height:2px;margin:-1px 0 0 -5px;border-radius:2px;background:var(--gold2)}
.psc-pv-x::before{transform:rotate(45deg)}.psc-pv-x::after{transform:rotate(-45deg)}
.psc-pv-x:hover{background:var(--gold)}.psc-pv-x:hover::before,.psc-pv-x:hover::after{background:#111}
.psc-pv-name{font-family:Arial,sans-serif;font-size:1rem;margin:0 0 6px;color:#fff}
.psc-pv-desc{font-family:Arial,sans-serif;font-size:.85rem;color:#bdbdbd;margin:0 0 14px;line-height:1.5}
.psc-pv-hint{font-family:Arial,sans-serif;font-size:.78rem;color:var(--gold2);margin:0 0 14px;padding:10px 12px;background:rgba(212,175,55,.08);border-left:3px solid var(--gold);border-radius:6px;line-height:1.4}
.psc-pv-demo{background:#0a0a0a;border:1px dashed #2b2b2b;border-radius:12px;padding:20px;text-align:center;margin-bottom:14px;min-height:100px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px}
.psc-pv-demo-marco{position:relative;display:inline-block}
.psc-pv-demo-av{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#2b2107,#100c02);color:var(--gold2);font:bold 1.6rem "Times New Roman",serif;display:flex;align-items:center;justify-content:center}
.psc-pv-demo-tema{display:flex;flex-direction:column;gap:6px;align-items:center}
.psc-pv-demo-btn{padding:6px 12px;background:transparent;border:1.5px solid var(--gold);border-radius:8px;color:var(--gold2);font:bold .82rem Georgia,serif;text-transform:uppercase;letter-spacing:.5px}
.psc-pv-demo-cartel{display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:14px;border:1.5px solid var(--gold);background:linear-gradient(160deg,#241b06,#0c0a03 70%);box-shadow:0 8px 24px rgba(0,0,0,.6),0 0 24px rgba(212,175,55,.35);min-width:260px}
.psc-pv-coin{flex:none;width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff6c9,var(--gold2) 30%,var(--gold) 62%,#8a6a10);border:2px solid #fff3b0;font:bold 1.1rem "Times New Roman",serif;color:#5b4308;display:flex;align-items:center;justify-content:center}
.psc-pv-t1{font:bold .95rem "Times New Roman",Times,serif;color:var(--gold2);text-align:left;line-height:1.2}
.psc-pv-t1 b{color:#fff}
.psc-pv-t2{font-size:.72rem;color:#d0d0d0;margin-top:2px;text-align:left}
.psc-pv-demo-titulo{display:flex;flex-direction:column;align-items:center;gap:4px}
.psc-pv-demo-titulo b{color:#fff;font-size:1rem}
.psc-pv-demo-titulo span{font-style:italic;font-size:.72rem;color:var(--gold);letter-spacing:.5px}
.psc-pv-demo-sonido{padding:12px 20px;background:#1b1b1b;border:1px dashed var(--gold);border-radius:10px;color:var(--gold2);font:bold .85rem Arial,sans-serif;cursor:pointer}
.psc-pv-demo-sonido:hover{background:#2b2107;color:#fff}
.psc-pv-close{display:block;width:100%;padding:11px;background:#2a2a2a;color:#fff;border:1px solid #555;border-radius:10px;font-family:Georgia,"Times New Roman",serif;font-size:.9rem;cursor:pointer}
.psc-pv-close:hover{background:#3a3a3a}
.psc-pv{background:linear-gradient(135deg,#1b1b1b,#0d0d0d);border-color:#555;color:#ccc;margin-top:8px}
.psc-pv:hover{background:linear-gradient(135deg,#333,#1a1a1a);color:#fff;border-color:var(--gold)}
/* --- Efectos de los ítems equipados --- */
body.psc-own-marco_dorado #cuenta .avwrap::before {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fff6c9, #f1d98a 30%, #d4af37 65%, #8a6a10);
    box-shadow: 0 0 14px rgba(212, 175, 55, .85);
}
body.psc-own-marco_dorado #cuenta .av {
    position: relative;
    z-index: 1;
    box-shadow: none !important;
}
body.psc-own-marco_dorado #cuenta .lapiz {
    z-index: 2;
}



body.psc-own-marco_animado #cuenta .avwrap::before{content:"";position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(var(--gold2),#8a6a10,#fff6c9,var(--gold),var(--gold2));animation:pscSpin 3s linear infinite}
body.psc-own-marco_animado #cuenta .av{position:relative;z-index:1}
body.psc-own-marco_animado #cuenta .lapiz{z-index:2}
body.psc-own-marco_arcoiris #cuenta .avwrap::before{content:"";position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(#ff0044,#ff8800,#ffee00,#00cc44,#0088ff,#7700ff,#ff0044);animation:pscSpin 3s linear infinite;filter:saturate(1.2)}
body.psc-own-marco_arcoiris #cuenta .av{position:relative;z-index:1}
body.psc-own-marco_arcoiris #cuenta .lapiz{z-index:2}
@keyframes pscSpin{to{transform:rotate(360deg)}}

body.psc-own-cartel_esmeralda .psc-t{border-color:#2ecc71;background:linear-gradient(160deg,#0b2418,#04120a 70%);box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 34px rgba(46,204,113,.4)}
body.psc-own-cartel_esmeralda .psc-t1{color:#a9f5c6}
body.psc-own-cartel_zafiro .psc-t{border-color:#3498db;background:linear-gradient(160deg,#0a1e2e,#020a12 70%);box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 34px rgba(52,152,219,.4)}
body.psc-own-cartel_zafiro .psc-t1{color:#a8daf5}
body.psc-own-cartel_rubi .psc-t{border-color:#e74c3c;background:linear-gradient(160deg,#2a0c0c,#120202 70%);box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 34px rgba(231,76,60,.4)}
body.psc-own-cartel_rubi .psc-t1{color:#f5a8a0}
body.psc-own-cartel_rosa_awawita .psc-t{border-color:#ff69b4;background:linear-gradient(160deg,#2a0f1e,#12020b 70%);box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 34px rgba(255,105,180,.4)}
body.psc-own-cartel_rosa_awawita .psc-t1{color:#ffd1e8}
body.psc-own-cartel_girasol .psc-t{border-color:#ffd60a;background:linear-gradient(160deg,#2a2405,#0a0800 70%);box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 34px rgba(255,214,10,.4)}
body.psc-own-cartel_girasol .psc-t1{color:#fff59d}

/* NUEVO: si hay un tema equipado y NO hay cartel específico, el cartel hereda los colores del tema */
body[class*="psc-own-tema_"]:not([class*="psc-own-cartel_"]) .psc-t {
    border-color: var(--gold);
    background: linear-gradient(160deg, var(--dark-glow), transparent 80%), linear-gradient(160deg, #0d0a04, #050302);
    box-shadow: 0 18px 50px rgba(0,0,0,.7), 0 0 34px var(--dark-glow);
}
body[class*="psc-own-tema_"]:not([class*="psc-own-cartel_"]) .psc-t1 { color: var(--gold2); }
body[class*="psc-own-tema_"]:not([class*="psc-own-cartel_"]) .psc-coin { background: radial-gradient(circle at 32% 28%, #fff, var(--gold2) 30%, var(--gold) 62%, #3a2a00); }
body[class*="psc-own-tema_"]:not([class*="psc-own-cartel_"]) .psc-bar { background: linear-gradient(90deg, var(--gold2), var(--gold)); }

body.psc-own-titulo #cuenta .nom[data-titulo]::after{content:"· " attr(data-titulo);display:block;font:italic .68rem Arial,sans-serif;color:var(--gold);margin-top:1px;letter-spacing:.5px}

/* --- TEMAS --- */
/* --- TEMAS: variables --- */
body.psc-own-tema_rosa_awawita { --gold:#ff69b4; --gold2:#ffd1e8; --line:rgba(255,105,180,.3); --line-s:rgba(255,105,180,.5); --glow:rgba(255,209,232,.9); --dark-glow:rgba(255,105,180,.35); }
body.psc-own-tema_girasol      { --gold:#ffd60a; --gold2:#fff59d; --line:rgba(255,214,10,.3); --line-s:rgba(255,214,10,.5); --glow:rgba(255,245,157,.9); --dark-glow:rgba(255,214,10,.35); }
body.psc-own-tema_esmeralda { --gold:#22e07a; --gold2:#8dffb8; --line:rgba(34,224,122,.3); --line-s:rgba(34,224,122,.5); --glow:rgba(141,255,184,.9); --dark-glow:rgba(34,224,122,.35); }
body.psc-own-tema_zafiro    { --gold:#3498db; --gold2:#a8daf5; --line:rgba(52,152,219,.26); --line-s:rgba(52,152,219,.4); --glow:rgba(168,218,245,.8); --dark-glow:rgba(52,152,219,.25); }
body.psc-own-tema_rubi      { --gold:#e74c3c; --gold2:#f5a8a0; --line:rgba(231,76,60,.26); --line-s:rgba(231,76,60,.4); --glow:rgba(245,168,160,.8); --dark-glow:rgba(231,76,60,.25); }
body.psc-own-tema_amatista  { --gold:#9b59b6; --gold2:#d7bde2; --line:rgba(155,89,182,.26); --line-s:rgba(155,89,182,.4); --glow:rgba(215,189,226,.8); --dark-glow:rgba(155,89,182,.25); }
body.psc-own-tema_ambar     { --gold:#f39c12; --gold2:#fad7a0; --line:rgba(243,156,18,.26); --line-s:rgba(243,156,18,.4); --glow:rgba(250,215,160,.8); --dark-glow:rgba(243,156,18,.25); }
body.psc-own-tema_diamante  { --gold:#7fc4e8; --gold2:#e8f6ff; --line:rgba(127,196,232,.3); --line-s:rgba(127,196,232,.5); --glow:rgba(232,246,255,.9); --dark-glow:rgba(127,196,232,.35); }
body.psc-own-tema_magenta   { --gold:#e84393; --gold2:#f8b8d8; --line:rgba(232,67,147,.26); --line-s:rgba(232,67,147,.4); --glow:rgba(248,184,216,.8); --dark-glow:rgba(232,67,147,.25); }
body.psc-own-tema_coral     { --gold:#ff6b6b; --gold2:#ffc9c9; --line:rgba(255,107,107,.26); --line-s:rgba(255,107,107,.4); --glow:rgba(255,201,201,.8); --dark-glow:rgba(255,107,107,.25); }
body.psc-own-tema_fenix     { --gold:#ff7a1a; --gold2:#ffd166; --line:rgba(255,122,26,.3); --line-s:rgba(255,122,26,.5); --glow:rgba(255,209,102,.9); --dark-glow:rgba(255,122,26,.35); }
body.psc-own-tema_yuli      { --gold:#c8c8c8; --gold2:#f0f0f0; --line:rgba(200,200,200,.26); --line-s:rgba(200,200,200,.4); --glow:rgba(240,240,240,.8); --dark-glow:rgba(200,200,200,.25); }


/* --- Badge "VERSIÓN PREMIUM" --- */
body[class*="psc-own-tema_"] .badge-prem {
    background: linear-gradient(135deg, var(--gold2), var(--gold) 55%, var(--gold));
    color: #1a1405;
    text-shadow: 0 1px 1px rgba(255,255,255,.4);
}

/* --- Estrellas de calificación (PichonApps apps) --- */
body[class*="psc-own-tema_"] .estrellas span { transition: color .15s; }

/* --- Mensajería (PichonCommunity) --- */
body[class*="psc-own-tema_"] .pcm-fab { border-color: var(--gold); background: linear-gradient(135deg, #0d0a04, #050302); color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-fab:hover { background: linear-gradient(135deg, var(--gold), var(--gold)); color: #111; }
body[class*="psc-own-tema_"] .pcm-card { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-hd { border-bottom-color: var(--line-s); background: var(--dark-glow); }
body[class*="psc-own-tema_"] .pcm-hd h2 { color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-x { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-x::before, body[class*="psc-own-tema_"] .pcm-x::after { background: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-x:hover { background: var(--gold); }
body[class*="psc-own-tema_"] .pcm-tabs { border-bottom-color: var(--line); }
body[class*="psc-own-tema_"] .pcm-tabs button.on { color: var(--gold2); border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-msg.adm .pcm-mc { border-color: var(--line-s); background: linear-gradient(180deg, #0f0f0f, #0a0a0a); }
body[class*="psc-own-tema_"] .pcm-msg.mine .pcm-mc { border-color: var(--line-s); }
body[class*="psc-own-tema_"] .pcm-adm { background: linear-gradient(135deg, var(--gold2), var(--gold)); color: #111; }
body[class*="psc-own-tema_"] .pcm-send { border-color: var(--gold2); background: linear-gradient(135deg, #0d0a04, #050302); }
body[class*="psc-own-tema_"] .pcm-send:hover:not(:disabled) { background: linear-gradient(135deg, var(--gold), var(--gold)); color: #111; }
body[class*="psc-own-tema_"] .pcm-clip { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-clip::before, body[class*="psc-own-tema_"] .pcm-clip::after { background: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-clip:hover { background: var(--gold); }
body[class*="psc-own-tema_"] .pcm-in:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--dark-glow); }
body[class*="psc-own-tema_"] .pcm-dot { border-color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-like.on { color: var(--gold2) !important; border-color: var(--gold) !important; background: var(--dark-glow) !important; }
body[class*="psc-own-tema_"] .pcm-ac button:hover { border-color: var(--gold); color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-tx b { color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-tx code { background: var(--dark-glow); border-color: var(--line); color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-tx a { color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-ctx { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-ctx button:hover { background: var(--dark-glow); }
body[class*="psc-own-tema_"] .pcm-fmt { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-fmt button { color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-fmt button:hover { background: linear-gradient(135deg, var(--gold2), var(--gold)); }
body[class*="psc-own-tema_"] .pcm-t { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-dlg { border-top-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-st { background: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-rep-box { background: var(--dark-glow); border-left-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-rep-box b { color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-down { border-color: var(--gold); background: linear-gradient(135deg, #0d0a04, #050302); color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-down:hover { background: var(--gold); color: #111; }
body[class*="psc-own-tema_"] .pcm-sel-bar { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-sel-bar span { color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-msg.seleccionado .pcm-mc { border-color: var(--gold) !important; background: var(--dark-glow) !important; box-shadow: 0 0 10px var(--dark-glow); }
body[class*="psc-own-tema_"] .pcm-vid { border-color: var(--gold); color: var(--gold2); }
body[class*="psc-own-tema_"] .pcm-vid:hover { background: var(--gold); color: #111; }
body[class*="psc-own-tema_"] .pcm-hs { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pcm-hs:hover { background: var(--gold); }

/* --- Traducir (PichisoftIdiomas) --- */
body[class*="psc-own-tema_"] #psi-btn { border-color: var(--gold); background: linear-gradient(135deg, var(--gold2), var(--gold) 55%, var(--gold)); color: #111; }
body[class*="psc-own-tema_"] #psi-btn:hover { filter: brightness(1.15); }
body[class*="psc-own-tema_"] #psi-btn:focus-visible { outline-color: var(--gold2); }
body[class*="psc-own-tema_"] .psi-card { border-top-color: var(--gold); }
body[class*="psc-own-tema_"] .psi-x { border-color: var(--gold); }
body[class*="psc-own-tema_"] .psi-x::before, body[class*="psc-own-tema_"] .psi-x::after { background: var(--gold2); }
body[class*="psc-own-tema_"] .psi-x:hover { background: var(--gold); }
body[class*="psc-own-tema_"] #psi-q:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--dark-glow); }
body[class*="psc-own-tema_"] .psi-it:hover { border-color: var(--gold); }
body[class*="psc-own-tema_"] .psi-it.on { border-color: var(--gold); background: var(--dark-glow); }
body[class*="psc-own-tema_"] .psi-star { color: var(--gold); }
body[class*="psc-own-tema_"] .psi-sw:checked { background: linear-gradient(135deg, var(--gold2), var(--gold)); }
body[class*="psc-own-tema_"] #psi-st { color: var(--gold2); }
body[class*="psc-own-tema_"] .psi-orig { border-color: var(--line); color: var(--gold2); }
body[class*="psc-own-tema_"] .psi-orig:hover { background: var(--dark-glow); }
body[class*="psc-own-tema_"] .psi-toast { border-color: var(--gold); }

/* --- Overrides genéricos para cualquier tema activo --- */

/* Topbar */
body[class*="psc-own-tema_"] #pichisoft-topbar { border-color: var(--line-s); }
body[class*="psc-own-tema_"] #pichisoft-topbar > * { color: var(--gold) !important; }
body[class*="psc-own-tema_"] #pichisoft-topbar > *:hover { color: #fff !important; text-shadow: 0 0 8px var(--glow) !important; }

/* Botón PichiCoins */
body[class*="psc-own-tema_"] #psc-btn.cuenta { border-color: var(--gold); color: var(--gold2); }
body[class*="psc-own-tema_"] #psc-btn.cuenta:hover { background: linear-gradient(135deg, var(--gold2), var(--gold) 55%, var(--gold)); box-shadow: 0 0 16px var(--dark-glow); }

/* Buscador (glow del focus) */
body[class*="psc-own-tema_"] .p-search:focus-within { box-shadow: 0 0 0 3px var(--dark-glow); }

/* Grip dots de arrastre */
body[class*="psc-own-tema_"] .grip { color: var(--line-s); }

/* Switches ON/OFF de Configuración */
body[class*="psc-own-tema_"] .sw:checked { background: linear-gradient(135deg, var(--gold2), var(--gold)); }

/* Opciones de Configuración */
body[class*="psc-own-tema_"] .pm-opt.on { background: var(--dark-glow); }
body[class*="psc-own-tema_"] .pm-col.on { background: var(--dark-glow); }
body[class*="psc-own-tema_"] .pm-opt:hover { border-color: var(--line-s); }
body[class*="psc-own-tema_"] .pm-col:hover { border-color: var(--line-s); }
body[class*="psc-own-tema_"] .pm-reset { border-color: var(--line); color: var(--gold2); }
body[class*="psc-own-tema_"] .pm-reset:hover { background: var(--dark-glow); }

/* Pie de página: botones de paneles */
body[class*="psc-own-tema_"] .pf-footer { border-color: var(--line-s); }
body[class*="psc-own-tema_"] .pf-btn { color: var(--gold); }
body[class*="psc-own-tema_"] .pf-btn::after { background-color: var(--gold2); box-shadow: 0 0 8px var(--gold2); }
body[class*="psc-own-tema_"] .pf-btn:hover { text-shadow: 0 0 12px var(--glow); }

/* Modal de paneles informativos */
body[class*="psc-own-tema_"] .pf-card { border-color: var(--gold); }
body[class*="psc-own-tema_"] .pf-header h2 { color: var(--gold2); text-shadow: 0 0 10px var(--dark-glow); }
body[class*="psc-own-tema_"] .pf-close { border-color: var(--gold); color: var(--gold); }
body[class*="psc-own-tema_"] .pf-close:hover { background: var(--gold) !important; box-shadow: 0 0 15px var(--dark-glow); }
body[class*="psc-own-tema_"] .pf-body h3 { color: var(--gold2); border-bottom-color: var(--line); }
body[class*="psc-own-tema_"] .pf-body p strong { color: var(--gold2); }
body[class*="psc-own-tema_"] .pf-body a { color: var(--gold); }
body[class*="psc-own-tema_"] .pf-body a:hover { text-shadow: 0 0 8px var(--glow); }

/* Modal confirmación "restablecer orden" */
body[class*="psc-own-tema_"] .pcf-card { border-top-color: var(--gold); }

/* Banner de cookies */
body[class*="psc-own-tema_"] #ps-cookie-banner { border-color: var(--line-s); }
body[class*="psc-own-tema_"] .ps-cb-text a { color: var(--gold2) !important; }
body[class*="psc-own-tema_"] .ps-cb-text a:hover { text-shadow: 0 0 8px var(--glow); }
body[class*="psc-own-tema_"] .ps-cb-btn { border-color: var(--gold); }
body[class*="psc-own-tema_"] .ps-cb-btn-sec { color: var(--gold); }
body[class*="psc-own-tema_"] .ps-cb-btn-sec:hover { background: var(--gold) !important; }
body[class*="psc-own-tema_"] .ps-cb-btn-pri { background: var(--gold); }
body[class*="psc-own-tema_"] .ps-cb-btn-pri:hover { background: var(--gold2) !important; box-shadow: 0 0 12px var(--glow); }

/* Modal de contacto (.pml-*) */
body[class*="psc-own-tema_"] .pml-card { border-top-color: var(--gold); }

@media (max-width:600px){.psc-ov{padding:10px}.psc-card{max-height:92vh}.psc-hd h2{font-size:1.5rem}.psc-bd{padding:14px 12px 18px}}
`;

    /* ============================= UTILIDADES ============================= */
    const app = getApps()[0] || initializeApp(FIREBASE_CFG);
    const auth = getAuth(app), db = getFirestore(app);
    const esIndex = (() => { const p = location.pathname.replace(/\/+$/, ''); return p === '' || p === '/index.html'; })();
    const slugActual = esIndex ? '' : (location.pathname.split('/').pop() || '').replace(/\.html$/i, '').toLowerCase();

    const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
    APPS_NUEVAS = lsGet('psc_apps_nuevas', {});

    const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
    const fmt = n => Math.max(0, Math.round(+n || 0)).toLocaleString('es-AR');
    const numEl = n => { const b = h('b', 'notranslate', fmt(n)); b.setAttribute('translate', 'no'); return b; };
    function P(cls, ...parts) { const p = h('p', cls); parts.forEach(x => p.append(typeof x === 'number' ? numEl(x) : x)); return p; }
    const hoy = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const suma = o => Object.values(o).reduce((a, v) => a + (+v || 0), 0);
    function sesionValida() { const s = lsGet('ps_session', null); return !!(s && s.k && s.exp > Date.now()); }
    const obj = o => (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
    const okHex = c => /^#[0-9a-f]{6}$/i.test(c || '');
    const CK = ['g', 'g2', 'bg', 'tx', 'cg', 'cg2', 'cbg'];
    const okCustom = c => !!(c && typeof c.id === 'string' && c.id && CK.every(k => okHex(c[k])));
    const hexRgb = hex => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return '212,175,55'; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','); };
    function varsDe(g, g2) {
        const r = hexRgb(g), r2 = hexRgb(g2);
        return { '--gold': g, '--gold2': g2, '--gold-rgb': r, '--line': 'rgba(' + r + ',.3)', '--line-s': 'rgba(' + r + ',.5)', '--glow': 'rgba(' + r2 + ',.9)', '--dark-glow': 'rgba(' + r + ',.35)' };
    }
    const CUSTOM_KEYS = ['--gold', '--gold2', '--gold-rgb', '--line', '--line-s', '--glow', '--dark-glow', '--ctxt'];
    const tint = s => s
        .replace(/#d4af37/gi, 'var(--gold,#d4af37)')
        .replace(/#f1d98a/gi, 'var(--gold2,#f1d98a)')
        .replace(/#(?:b38b27|a67c12|a67c10|caa016|b8901f|c9a227|8a6a10)\b/gi, 'var(--gold,#d4af37)')
        .replace(/rgba\(\s*212\s*,\s*175\s*,\s*55\s*,/g, 'rgba(var(--gold-rgb,212,175,55),')
        .replace(/rgba\(\s*241\s*,\s*217\s*,\s*138\s*,\s*([\d.]+)\s*\)/g, (m, a) => 'color-mix(in srgb,var(--gold2,#f1d98a) ' + Math.round(a * 100) + '%,transparent)')
        .replace(/#2b2107/gi, 'color-mix(in srgb,var(--gold,#d4af37) 22%,#000)')
        .replace(/#100c02/gi, 'color-mix(in srgb,var(--gold,#d4af37) 7%,#000)')
        .replace(/(--gold2?\s*:\s*)var\(--gold2?,(#[0-9a-f]{6})\)/gi, '$1$2');
    const okStreak = s => (s && typeof s.last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.last) && Number.isFinite(+s.n)) ? { last: s.last, n: Math.max(0, Math.floor(+s.n)) } : { last: '', n: 0 };
    const mejorStreak = (a, b) => (a.last > b.last || (a.last === b.last && a.n >= b.n)) ? a : b;
    const diaDe = off => { const d = new Date(); d.setDate(d.getDate() + off); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    /* Tema del día: paleta según la hora */
    const PALETAS_DIA = {
        madrugada: { g: '#9575cd', g2: '#d1c4e9', bg: '#100a1f', tx: '#ece6ff' },
        amanecer: { g: '#ff8a65', g2: '#ffd3c0', bg: '#2a1822', tx: '#fff0e8' },
        mediodia: { g: '#4fc3f7', g2: '#d2f1ff', bg: '#13232f', tx: '#f2fbff' },
        tarde: { g: '#ffa726', g2: '#ffe0b2', bg: '#2a1e10', tx: '#fff6e8' },
        tardecita: { g: '#f06292', g2: '#ffc1d6', bg: '#2a1229', tx: '#fff0f6' },
        noche: { g: '#4d8dff', g2: '#b9d2ff', bg: '#0a1326', tx: '#eaf1ff' }
    };
    let previewDia = null;   // solo se usa dentro de la vista previa
    const NOMBRES_DIA = [
        ['madrugada', 'Madrugada', '00-06'], ['amanecer', 'Amanecer', '06-10'], ['mediodia', 'Mediodía', '10-15'],
        ['tarde', 'Tarde', '15-18'], ['tardecita', 'Tardecita', '18-21'], ['noche', 'Noche', '21-00']
    ];
    function claveDia() {
        const h = new Date().getHours();
        return h < 6 ? 'madrugada' : h < 10 ? 'amanecer' : h < 15 ? 'mediodia' : h < 18 ? 'tarde' : h < 21 ? 'tardecita' : 'noche';
    }
    function paletaDia() { return PALETAS_DIA[previewDia || claveDia()]; }
    /* [id, nombre, color] */
    const NEONES = [
        ['cian', 'cian', '#00ffff'], ['magenta', 'magenta', '#ff00ff'], ['verde', 'verde lima', '#39ff14'],
        ['naranja', 'naranja', '#ff6a00'], ['amarillo', 'amarillo', '#ffee00'], ['rosa', 'rosa', '#ff2d95'],
        ['violeta', 'violeta', '#9d4dff'], ['rojo', 'rojo', '#ff1744'], ['azul', 'azul eléctrico', '#2979ff'],
        ['dual', 'dual (cambia de color)', '#00ffff']
    ];
    const itemsNeon = () => NEONES.map(([k, n]) => ({ id: 'marco_neon_' + k, nombre: 'Neón ' + n, desc: 'Del Pack Neón.', slot: 'marco' }));
    const CSS4 = NEONES.filter(n => n[0] !== 'dual').map(([k, , c]) =>
        'body.psc-own-marco_neon_' + k + ' #cuenta .av,.psc-pvm.marco_neon_' + k + ' .psc-pv-demo-av{--nc:' + c + ';box-shadow:0 0 0 2px var(--nc),0 0 10px var(--nc),0 0 22px var(--nc);animation:pscNeonV 1.8s ease-in-out infinite}').join('\n') + `
body.psc-own-marco_neon_dual #cuenta .av,.psc-pvm.marco_neon_dual .psc-pv-demo-av{animation:pscNeon 1.6s ease-in-out infinite}
@keyframes pscNeonV{0%,100%{box-shadow:0 0 0 2px var(--nc),0 0 6px var(--nc),0 0 12px var(--nc)}50%{box-shadow:0 0 0 2px var(--nc),0 0 16px var(--nc),0 0 34px var(--nc)}}
.psc-neon-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px 8px;width:100%}
.psc-neon-grid>div{display:flex;flex-direction:column;align-items:center;gap:8px;font:.62rem Arial,sans-serif;color:#bbb}
.psc-neon-grid .psc-pv-demo-av{width:40px;height:40px;font-size:1.1rem}
@media(max-width:600px){.psc-neon-grid{grid-template-columns:repeat(3,1fr)}}
`;
    const posee = id => !id ? false : (id.startsWith('marco_neon_') ? S.bought.marco_neon !== undefined : S.bought[id] !== undefined);
    const CSS3 = `
    html{transition:background-color 1.5s ease,color 1.5s ease}
    .psc-dia-bar{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin-top:6px}
.psc-dia-chip{display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px;background:#161616;border:1px solid #2b2b2b;border-radius:10px;color:#fff;font:bold .78rem Arial,sans-serif;cursor:pointer;transition:border-color .15s,background .15s}
.psc-dia-chip i{width:16px;height:16px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c)}
.psc-dia-chip small{font:.62rem Arial,sans-serif;color:#999}
.psc-dia-chip:hover{border-color:var(--c)}
.psc-dia-chip.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 14%,#000)}
body:has(.psc-ov) #pichisoft-topbar,body:has(.psc-pv-ov) #pichisoft-topbar,body:has(.psc-reset-ov) #pichisoft-topbar,
body:has(.pf-modal.open) #pichisoft-topbar,body:has(#pf-share-ov.open) #pichisoft-topbar,body:has(.pcm-ov) #pichisoft-topbar,body:has(.psi-ov) #pichisoft-topbar{visibility:hidden!important;opacity:0!important;pointer-events:none!important}
#psc-racha{align-self:flex-end;text-align:center;line-height:1.1;user-select:none;-webkit-user-select:none;padding:2px 4px}
#psc-racha b{display:block;font:bold 1.7rem "Times New Roman",serif;color:var(--gold2)}
#psc-racha small{display:block;font:.7rem Verdana,sans-serif;color:#aaa}
.psc-rk{position:fixed;top:calc(14px + env(safe-area-inset-top,0px));left:14px;z-index:2147483600;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 28px);box-sizing:border-box;padding:10px 18px 11px 12px;border-radius:14px;border:1.5px solid var(--gold);background:linear-gradient(160deg,color-mix(in srgb,var(--gold) 22%,#000),#050302 80%);box-shadow:0 12px 34px rgba(0,0,0,.7),0 0 26px var(--dark-glow);color:#fff;font-family:Verdana,sans-serif;overflow:hidden;cursor:pointer;animation:pskIn .6s cubic-bezier(.2,1.3,.35,1) both;user-select:none;-webkit-user-select:none}
.psc-rk.out{animation:pskOut .4s ease forwards}
.psc-rk::before{content:"";position:absolute;top:0;bottom:0;width:50%;left:-70%;background:linear-gradient(100deg,transparent,color-mix(in srgb,var(--gold2) 35%,transparent),transparent);transform:skewX(-20deg);animation:psc-shine2 1.4s ease .4s 2}
@keyframes psc-shine2{to{left:130%}}
.psc-fl{flex:none;position:relative;width:24px;height:32px;border-radius:50% 50% 50% 50%/65% 65% 35% 35%;background:linear-gradient(to top,var(--gold),var(--gold2));box-shadow:0 0 14px var(--glow,var(--gold));transform-origin:50% 100%;animation:pskFl .8s ease-in-out infinite alternate}
.psc-fl::after{content:"";position:absolute;left:28%;right:28%;bottom:3px;height:50%;border-radius:inherit;background:#fff;opacity:.85}
.psc-rk1{font:bold 1.05rem "Times New Roman",serif;color:var(--gold2);line-height:1.2}
.psc-rk2{font-size:.76rem;color:#d0d0d0;margin-top:2px}
.psc-rk2 b{color:#fff}
@keyframes pskIn{from{opacity:0;transform:translateX(-40px) scale(.85)}to{opacity:1;transform:none}}
@keyframes pskOut{to{opacity:0;transform:translateX(-40px) scale(.9)}}
@keyframes pskFl{from{transform:scale(1,1) rotate(-4deg)}to{transform:scale(.92,1.1) rotate(4deg)}}
@media(prefers-reduced-motion:reduce){.psc-rk,.psc-rk::before,.psc-fl{animation:none!important}}
`;
    /* CSS extra: temas generados + arreglos responsive */
    const CSS2 = ':root{--gold-rgb:212,175,55;--dark-glow:rgba(212,175,55,.35)}\n' +
        THEMES.map(([k, , g, g2]) => 'body.psc-own-tema_' + k + '{' + Object.entries(varsDe(g, g2)).map(([a, b]) => a + ':' + b).join(';') + '}').join('\n') + `
body.psc-idx.psc-own-tema_custom a,body.psc-idx.psc-own-tema_custom a:visited{color:var(--ctxt,whitesmoke)}
body.psc-idx.psc-own-tema_custom a:hover{color:#111;background:var(--ctxt,whitesmoke)}
@keyframes pscGlow{0%,100%{box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 26px var(--dark-glow)}50%{box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 46px var(--glow,var(--dark-glow))}}
.psc-t{top:calc(14px + env(safe-area-inset-top,0px))}
.psc-ed-r{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;font:.85rem Arial,sans-serif;color:#ddd;border-bottom:1px solid #222}
.psc-ed-r input[type=color]{width:46px;height:30px;padding:0;border:1px solid #555;border-radius:6px;background:none;cursor:pointer}
.psc-ed-r input[type=text]{width:55%;box-sizing:border-box;background:#222;border:1px solid #555;color:#fff;padding:8px;border-radius:6px;font-size:16px;outline:0;user-select:text;-webkit-user-select:text}
.psc-ed-sec{margin:14px 0 2px;font:bold .95rem "Times New Roman",serif;color:var(--gold2)}
#psc-ed-ov .psc-pv-card{max-height:92vh;overflow:auto;max-width:460px}
.psc-pvm{position:relative;display:inline-block}
.psc-pvm .psc-pv-demo-av{position:relative;z-index:1}
.psc-pvm.marco_dorado .psc-pv-demo-av{box-shadow:0 0 0 3px #d4af37,0 0 14px rgba(212,175,55,.7)}

.psc-pvm.marco_animado::before,.psc-pvm.marco_arcoiris::before{content:"";position:absolute;inset:-4px;border-radius:50%;animation:pscSpin 3s linear infinite}
.psc-pvm.marco_animado::before{background:conic-gradient(var(--gold2),#8a6a10,#fff6c9,var(--gold),var(--gold2))}
.psc-pvm.marco_arcoiris::before{background:conic-gradient(#ff0044,#ff8800,#ffee00,#00cc44,#0088ff,#7700ff,#ff0044)}
body.psc-own-marco_neon #cuenta .av{box-shadow:0 0 0 2px #0ff,0 0 10px #0ff,0 0 22px #0ff;animation:pscNeon 1.6s ease-in-out infinite}
.psc-pvm.marco_neon .psc-pv-demo-av{box-shadow:0 0 0 2px #0ff,0 0 10px #0ff,0 0 22px #0ff;animation:pscNeon 1.6s ease-in-out infinite}
@keyframes pscNeon{0%,100%{box-shadow:0 0 0 2px #0ff,0 0 6px #0ff,0 0 12px #0ff}50%{box-shadow:0 0 0 2px #f0f,0 0 14px #f0f,0 0 30px #f0f}}
body.psc-own-marco_fuego #cuenta .avwrap::before,body.psc-own-marco_hielo #cuenta .avwrap::before,body.psc-own-marco_glitch #cuenta .avwrap::before,
.psc-pvm.marco_fuego::before,.psc-pvm.marco_hielo::before,.psc-pvm.marco_glitch::before{content:"";position:absolute;inset:-4px;border-radius:50%}
body.psc-own-marco_fuego #cuenta .avwrap::before,.psc-pvm.marco_fuego::before{background:conic-gradient(#ff2a00,#ff9d00,#ffee00,#ff5a00,#c40000,#ff9d00,#ff2a00);animation:pscSpin 1.4s linear infinite;box-shadow:0 0 14px rgba(255,100,0,.8);filter:saturate(1.3)}
body.psc-own-marco_hielo #cuenta .avwrap::before,.psc-pvm.marco_hielo::before{background:conic-gradient(#e8f6ff,#7fc4e8,#ffffff,#4aa3df,#cfefff,#e8f6ff);animation:pscSpin 6s linear infinite;box-shadow:0 0 14px rgba(127,196,232,.8)}
body.psc-own-marco_glitch #cuenta .avwrap::before,.psc-pvm.marco_glitch::before{background:conic-gradient(#ff00c8,#00f0ff,#111,#ff00c8,#00f0ff,#ff00c8);animation:pscGlitch 1.1s steps(1,end) infinite}
@keyframes pscGlitch{0%{transform:translate(0,0) rotate(0)}20%{transform:translate(-2px,1px) rotate(40deg)}40%{transform:translate(2px,-1px) rotate(-30deg)}60%{transform:translate(-1px,-2px) rotate(120deg)}80%{transform:translate(1px,2px) rotate(200deg)}100%{transform:translate(0,0) rotate(360deg)}}
body.psc-own-marco_fuego #cuenta .av,body.psc-own-marco_hielo #cuenta .av,body.psc-own-marco_glitch #cuenta .av{position:relative;z-index:1}
body.psc-own-marco_fuego #cuenta .lapiz,body.psc-own-marco_hielo #cuenta .lapiz,body.psc-own-marco_glitch #cuenta .lapiz{z-index:2}
@media(prefers-reduced-motion:reduce){body[class*="psc-own-marco_"] #cuenta .av,body[class*="psc-own-marco_"] #cuenta .avwrap::before,.psc-pvm::before,.psc-pvm .psc-pv-demo-av{animation:none!important}}
.psc-eq-item{flex-wrap:wrap}.psc-eq-info{min-width:140px}
body[class*="psc-own-tema_"] #pf-share-box{border-color:var(--gold)}
body[class*="psc-own-tema_"] #pf-share-box h2{color:var(--gold2)}
@supports(height:100dvh){.psc-card{max-height:88dvh}#psc-ed-ov .psc-pv-card{max-height:92dvh}}
@media(max-width:600px){#cuenta{top:calc(8px + env(safe-area-inset-top,0px))}}
`;

    /* ================================ ESTADO ================================ */
    const vacioGuest = () => ({ earned: {}, bought: {}, equipped: {}, rec: 0, tituloTexto: '', custom: [], streak: { last: '', n: 0 }, fromUid: '' });
    function leerGuest() {
        const g = lsGet('psc_guest', null) || {};
        return {
            earned: obj(g.earned), bought: obj(g.bought), equipped: obj(g.equipped), rec: +g.rec || 0,
            tituloTexto: typeof g.tituloTexto === 'string' ? g.tituloTexto.slice(0, 30) : '',
            custom: (Array.isArray(g.custom) ? g.custom : []).filter(okCustom).slice(0, MAX_CUSTOM),
            streak: okStreak(g.streak), fromUid: typeof g.fromUid === 'string' ? g.fromUid : ''
        };
    }
    const keyAcc = id => 'psc_acc_' + id;
    let S = leerGuest();
    let modo = 'cargando';

    let uid = null, authListo = false, sucio = false;
    let dock = null, btn = null, unsubSnap = null;
    const colaAcc = [];
    const abierto = {};
    const saldo = () => Math.max(0, suma(S.earned) - suma(S.bought));
    const snapshotLocal = () => ({ streak: S.streak, earned: S.earned, bought: S.bought, equipped: S.equipped, rec: S.rec, tituloTexto: S.tituloTexto || '', custom: S.custom });
    function drenar() { while (colaAcc.length) { try { colaAcc.shift()(); } catch (e) { console.warn(e); } } }

    function guardar() {
        if (modo === 'cuenta' && uid) { lsSet(keyAcc(uid), snapshotLocal()); sucio = true; programarFlush(); }
        else if (modo === 'invitado') lsSet('psc_guest', S);
    }

    let flushing = false, tf = 0;
    function programarFlush(ms) { clearTimeout(tf); tf = setTimeout(flush, ms || 700); }
    async function flush() {
        if (modo !== 'cuenta' || !uid || flushing || !sucio) return;
        flushing = true; sucio = false;
        const id = uid;
        try {
            await setDoc(doc(db, 'pichicoins', id), snapshotLocal(), { merge: true });
            if (sucio) programarFlush(500);
        } catch (err) {
            sucio = true;
            console.warn('PichiCoins: no se pudo guardar, se reintenta.', err);
            setTimeout(flush, 20000);
        } finally { flushing = false; }
    }
    function detenerSnap() { if (unsubSnap) { try { unsubSnap(); } catch (e) { } unsubSnap = null; } }

    async function cargarCuenta(id) {
        if (modo !== 'cargando') return;
        let remoto = null, fallo = false;
        try { const s = await getDoc(doc(db, 'pichicoins', id)); if (s.exists()) remoto = s.data(); }
        catch (e) { console.warn('PichiCoins: no se pudo leer la cuenta.', e); fallo = true; }
        if (uid !== id) return;
        const cache = lsGet(keyAcc(id), null);
        if (fallo && !cache) { setTimeout(() => { if (uid === id && modo === 'cargando') cargarCuenta(id); }, 5000); return; }

        const r = remoto || {};
        const A = {
            streak: okStreak(r.streak),
            earned: { ...obj(r.earned) }, bought: { ...obj(r.bought) }, equipped: { ...obj(r.equipped) },
            rec: +r.rec || 0,
            tituloTexto: typeof r.tituloTexto === 'string' ? r.tituloTexto.slice(0, 30) : '',
            custom: (Array.isArray(r.custom) ? r.custom : []).filter(okCustom).slice(0, MAX_CUSTOM)
        };

        let hayCambio = false;
        const unir = (src, sinConfig) => {
            if (!src) return;
            ['earned', 'bought'].forEach(t => { const o = obj(src[t]); for (const k in o) if (!(k in A[t])) { A[t][k] = o[k]; hayCambio = true; } });
            if ((+src.rec || 0) > A.rec) { A.rec = +src.rec; hayCambio = true; }
            if (src.streak) { const m = mejorStreak(A.streak, okStreak(src.streak)); if (m !== A.streak) { A.streak = m; hayCambio = true; } }
            if (!sinConfig) {
                const eq = obj(src.equipped);
                for (const slot in eq) if (eq[slot] && !A.equipped[slot]) { A.equipped[slot] = eq[slot]; hayCambio = true; }
                if (!A.tituloTexto && typeof src.tituloTexto === 'string' && src.tituloTexto) { A.tituloTexto = src.tituloTexto.slice(0, 30); hayCambio = true; }
            }
            (Array.isArray(src.custom) ? src.custom : []).filter(okCustom).forEach(c => {
                const i = A.custom.findIndex(x => x.id === c.id);
                if (i < 0) { if (A.custom.length < MAX_CUSTOM) { A.custom.push(c); hayCambio = true; } }
                else if ((c.u || 0) > (A.custom[i].u || 0)) { A.custom[i] = c; hayCambio = true; }
            });
        };

        unir(cache, !!remoto);   // si Firebase respondió, la config equipada la manda Firebase, no el caché
        const g = leerGuest();                         // lo juntado como invitado
        if (!g.fromUid || g.fromUid === id) {
            if (Object.keys(g.earned).length || Object.keys(g.bought).length || g.custom.length || g.rec) {
                unir(g); lsSet('psc_guest', vacioGuest());
            }
        }
        A.custom = A.custom.filter(x => !(('delc_' + x.id) in A.earned));
        if (!r.equipped) {
            TIENDA.forEach(it => { if (it.slot && A.bought[it.id] !== undefined && !A.equipped[it.slot]) { A.equipped[it.slot] = it.id; hayCambio = true; } });
        }
        let bono = false;
        if (!A.earned.cuenta_creada) { A.earned.cuenta_creada = MONTO_CUENTA; bono = true; hayCambio = true; }

        S = A; modo = 'cuenta';
        lsSet(keyAcc(id), snapshotLocal());
        sucio = hayCambio || !remoto;
        if (sucio) programarFlush(100);
        cambio();
        if (bono) cartel({ monto: MONTO_CUENTA, texto: remoto ? 'volver a empezar en Pichisoft' : 'crear tu cuenta de Pichisoft' });
        drenar();
        revisarHitos();

        detenerSnap();
        unsubSnap = onSnapshot(doc(db, 'pichicoins', id), snap => {
            if (uid !== id || !snap.exists() || modo !== 'cuenta') return;
            const d = snap.data(); let c = false;
            for (const t of ['earned', 'bought']) { const o = obj(d[t]); for (const k in o) if (!(k in S[t])) { S[t][k] = o[k]; c = true; } }
            /* Lo equipado y el texto del título se sincronizan entre dispositivos (gana el último que guardó) */
            if (!sucio && !flushing && !snap.metadata.hasPendingWrites) {
                const eq = obj(d.equipped);
                for (const slot of ['marco', 'tema', 'cartel', 'titulo', 'sonido']) {
                    const nuevo = eq[slot] || '';
                    if ((S.equipped[slot] || '') !== nuevo) { S.equipped[slot] = nuevo; c = true; }
                }
                const tt = typeof d.tituloTexto === 'string' ? d.tituloTexto.slice(0, 30) : '';
                if (tt !== (S.tituloTexto || '')) { S.tituloTexto = tt; c = true; }
            }
            if ((d.rec || 0) > S.rec) { S.rec = d.rec; c = true; }
            (Array.isArray(d.custom) ? d.custom : []).filter(okCustom).forEach(cu => {
                const i = S.custom.findIndex(x => x.id === cu.id);
                if (i < 0) { if (S.custom.length < MAX_CUSTOM) { S.custom.push(cu); c = true; } }
                else if ((cu.u || 0) > (S.custom[i].u || 0)) { S.custom[i] = cu; c = true; }
            });
            if (d.streak) { const m = mejorStreak(S.streak, okStreak(d.streak)); if (m !== S.streak) { S.streak = m; c = true; } }
            const antes = S.custom.length;
            S.custom = S.custom.filter(x => !(('delc_' + x.id) in S.earned));
            if (S.custom.length !== antes) c = true;
            if (c) { lsSet(keyAcc(id), snapshotLocal()); cambio(); }
        }, err => console.warn('PichiCoins snapshot:', err));
    }

    function evaluar() {
        if (!authListo && sesionValida()) { if (modo !== 'cuenta') modo = 'cargando'; return; }
        const u = auth.currentUser;
        const nuevo = u ? u.uid : null;

        if (nuevo && nuevo === uid && (modo === 'cuenta' || modo === 'cargando')) { actualizarBoton(); return; }
        if (!nuevo && !uid && modo === 'invitado') { actualizarBoton(); return; }
        if (uid && modo === 'cuenta') {                // cierre de sesión: se deja una copia como invitado
            flush();
            lsSet('psc_guest', { ...snapshotLocal(), fromUid: uid });
        }
        uid = nuevo;
        if (!nuevo) {
            detenerSnap(); sucio = false;
            modo = 'invitado'; S = leerGuest();
            cambio(); drenar(); return;
        }
        modo = 'cargando';
        cargarCuenta(nuevo);
    }

    /* ================================ LOGROS ================================ */
    function ganar(id, monto, motivo) {
        if (modo === 'cargando') { colaAcc.push(() => ganar(id, monto, motivo)); return false; }
        if (id in S.earned) return false;
        S.earned[id] = monto; guardar();
        if (monto > 0 && motivo) cartel({ monto, texto: motivo });
        cambio();
        return true;
    }
    function revisarHitos() {
        if (modo === 'cargando') return;
        /* Red de seguridad: toda cuenta tiene que tener su bono de bienvenida */
        if (modo === 'cuenta' && !S.earned.cuenta_creada) ganar('cuenta_creada', MONTO_CUENTA, 'crear tu cuenta de Pichisoft');
        const total = Object.keys(APPS).length;
        const n = Object.keys(S.earned).filter(k => k.startsWith('v_') && APPS[k.slice(2)]).length;
        HITOS.forEach(([N, monto, , motivo]) => { if (n >= (N || total)) ganar('apps_' + (N || 'todas'), monto, motivo); });
    }
    /* Lee el index.html (li.nuevo) desde cualquier página, así no hace falta haber pasado por el index en este dispositivo */
    let nuevasP = null;
    function cargarNuevasRemoto() {
        if (nuevasP) return nuevasP;
        nuevasP = fetch('/index.html', { cache: 'no-store' })
            .then(r => r.ok ? r.text() : Promise.reject())
            .then(txt => {
                const dom = new DOMParser().parseFromString(txt, 'text/html');
                const enc = {};
                dom.querySelectorAll('.nuevo a[href], a.nuevo[href]').forEach(a => {
                    const m = /([a-z0-9_-]+)\.html(?:[?#]|$)/i.exec(a.getAttribute('href') || '');
                    if (!m || m[1].toLowerCase() === 'index') return;
                    const sl = m[1].toLowerCase();
                    enc[sl] = APPS[sl] || a.textContent.trim() || sl;
                });
                Object.keys(APPS_NUEVAS).forEach(k => delete APPS_NUEVAS[k]);
                Object.assign(APPS_NUEVAS, enc);
                lsSet('psc_apps_nuevas', APPS_NUEVAS);
            })
            .catch(() => { });
        return nuevasP;
    }
    function visitar(slug) {
        slug = String(slug || '').toLowerCase();
        if (modo === 'cargando') { colaAcc.push(() => visitar(slug)); return; }

        if (APPS[slug]) {
            const k = 'v_' + slug;
            if (!(k in S.earned)) { S.earned[k] = 0; guardar(); }
            revisarHitos();
        }
        const premiarNueva = () => {
            if (APPS_NUEVAS[slug]) ganar('app_nueva_' + slug, MONTO_APP_NUEVA, 'entrar a ' + APPS_NUEVAS[slug] + ', una app nueva');
        };
        if (esIndex) premiarNueva();
        else cargarNuevasRemoto().then(premiarNueva);
    }
    function evento(n) {
        const e = EVENTOS[n]; if (!e) return;
        if (modo === 'cargando') { colaAcc.push(() => evento(n)); return; }
        if (modo === 'cuenta') ganar('ev_' + n, e[0], e[2]);
    }
    /* ---------------------- Racha diaria ---------------------- */
    let rachaDia = '';
    function rachaActual() {
        const s = S.streak || {};
        return (s.last && (s.last === hoy() || s.last === diaDe(-1))) ? s.n : 0;
    }
    function revisarRacha() {
        if (modo === 'cargando') { colaAcc.push(revisarRacha); return; }
        const t = hoy(); rachaDia = t;
        const s = S.streak || (S.streak = { last: '', n: 0 });
        if (s.last === t) return;
        const n = s.last === diaDe(-1) ? s.n + 1 : 1;
        S.streak = { last: t, n };
        let monto = 0;
        if (n === 1) {
            if (!('racha_primera_v2' in S.earned)) { S.earned.racha_primera_v2 = 100; monto += 100; }
            else { S.earned['rd_' + t] = 30; monto += 30; }  // ya cobró el primero antes
        } else {
            S.earned['rd_' + t] = 30; monto += 30;
        }
        if (n % 7 === 0) { S.earned['rw_' + t] = 80; monto += 80; }
        guardar(); cambio();
        if (monto > 0) cartelRacha(n, monto);
    }
    function cartelRacha(n, monto) {
        const t = h('div', 'psc-rk'); t.setAttribute('translate', 'no'); t.setAttribute('role', 'status');
        t.innerHTML = '<div class="psc-fl"></div><div><div class="psc-rk1"></div><div class="psc-rk2"></div></div>';
        const est = colorCartel(S.equipped && S.equipped.cartel);
        if (est) estilarCartel(t, est);
        t.querySelector('.psc-rk1').textContent = n === 1 ? '¡Empezó tu racha!' : '¡' + n + ' días de racha!';
        const r2 = t.querySelector('.psc-rk2'); r2.append('+', Object.assign(h('b'), { textContent: fmt(monto) }), ' PichiCoins');
        if (n > 0 && n % 7 === 0) r2.append(' · ¡semana completa!');
        document.body.append(t);
        let fin = false;
        const cerrar = () => { if (fin) return; fin = true; t.classList.add('out'); setTimeout(() => t.remove(), 450); };
        t.onclick = cerrar; setTimeout(cerrar, 4200);
    }
    /* ---------------------- Tiempo de permanencia ---------------------- */
    let ultAct = Date.now();
    ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(ev =>
        addEventListener(ev, () => { ultAct = Date.now(); }, { passive: true, capture: true }));
    function revisarTiempo(s, d) {
        TRAMOS.forEach(([sec, monto, , motivo]) => { if (s >= sec) ganar('t_' + sec, monto, motivo); });
        /* Récord: una vez POR DÍA en que superás tu máximo anterior */
        if (S.rec > 0 && s > S.rec) ganar('record_' + d, MONTO_RECORD, 'superar tu récord diario de tiempo en nuestras apps');
    }
    setInterval(() => {
        if (modo === 'cargando') return;
        if (document.visibilityState !== 'visible' || !document.hasFocus() || Date.now() - ultAct > 120000) return;
        if (rachaDia !== hoy()) revisarRacha();
        const d = hoy();
        let o = lsGet('psc_day', null);
        if (!o || o.d !== d) {
            if (o && o.s > S.rec) { S.rec = o.s; guardar(); }
            o = { d, s: 0 };
        }
        o.s++; lsSet('psc_day', o);
        revisarTiempo(o.s, d);
    }, 1000);

    /* ================================ CARTEL ================================ */
    const cola = []; let mostrando = false;
    function sonidoMoneda() {
        const s = S.equipped && S.equipped.sonido;
        if (!s || !(s in S.bought)) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'sine'; o.frequency.setValueAtTime(880, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
            g.gain.setValueAtTime(0.15, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            o.start(); o.stop(ctx.currentTime + 0.3);
        } catch (e) { }
    }
    /* Estilo de un cartel a partir de un id: 'cartel_<tema>' o 'ccartel_<idCustom>' */
    function estiloDe(id) {
        if (!id) return null;
        if (id.startsWith('ccartel_')) { const c = S.custom.find(x => x.id === id.slice(8)); return c ? { g: c.cg, g2: c.cg2, bg: c.cbg } : null; }
        const t = THEMES.find(x => x[0] === id.replace(/^cartel_/, ''));
        return t ? { g: t[2], g2: t[3] } : null;
    }
    function colorCartel(id) { return (id && S.bought[id] !== undefined) ? estiloDe(id) : null; }
    function estilarCartel(el, e) {
        const v = varsDe(e.g, e.g2); for (const k in v) el.style.setProperty(k, v[k]);
        el.style.borderColor = e.g;
        el.style.background = e.bg ? 'linear-gradient(160deg,' + e.bg + ',#050302 85%)'
            : 'linear-gradient(160deg,rgba(' + hexRgb(e.g) + ',.22),transparent 80%),linear-gradient(160deg,#0d0a04,#050302)';
        el.style.boxShadow = '0 18px 50px rgba(0,0,0,.7),0 0 34px ' + v['--dark-glow'];
    }
    function cartel(o) { cola.push(o); if (!mostrando) siguiente(); }
    function siguiente() {
        const o = cola.shift();
        if (!o) { mostrando = false; return; }
        mostrando = true;
        const t = h('div', 'psc-t'); t.setAttribute('translate', 'no'); t.setAttribute('role', 'status');
        t.innerHTML = '<div class="psc-coin">P</div><div><div class="psc-t1"></div><div class="psc-t2"></div></div><div class="psc-bar"></div>' + '<i class="psc-sp"></i>'.repeat(6);
        const est = colorCartel(S.equipped && S.equipped.cartel);
        if (est) estilarCartel(t, est);
        const t1 = t.querySelector('.psc-t1'), t2 = t.querySelector('.psc-t2');
        if (o.titulo) { t1.textContent = o.titulo; }
        else { t1.append('¡Ganaste ', Object.assign(h('b'), { textContent: fmt(o.monto) }), ' PichiCoins!'); }
        t2.textContent = o.texto ? (o.titulo ? o.texto : 'por ' + o.texto) : '';
        document.body.append(t);
        if (!o.titulo) sonidoMoneda();
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
        const libres = TIENDA.filter(i => S.bought[i.id] === undefined);
        const prox = libres.filter(i => i.precio > s).sort((a, b) => a.precio - b.precio)[0];
        const ya = libres.filter(i => i.precio <= s && (!i.soloCuenta || modo === 'cuenta'));
        if (prox) {
            w.append(P('psc-tx', 'Ganar ', prox.precio - s, ' PichiCoins más: con esa cantidad podrás comprar «' + prox.nombre + '».' + (prox.soloCuenta && modo !== 'cuenta' ? ' (Requiere cuenta de Pichisoft)' : '')));
        } else if (!libres.length) {
            w.append(P('psc-tx', '¡Ya compraste todo lo disponible en la tienda!'));
        } else {
            w.append(P('psc-tx', '¡Ya tienes PichiCoins de sobra! Visita la Tienda para gastarlos.'));
        }
        if (ya.length && prox) w.append(P('psc-tx', 'Ya puedes comprar: ' + ya.slice(0, 6).map(i => '«' + i.nombre + '»').join(', ') + (ya.length > 6 ? '…' : '.')));
        return w;
    }
    function bGanar() {
        const w = h('div'), E = S.earned;
        if (modo !== 'cuenta') w.append(P('psc-tx', 'Si te creas una cuenta de Pichisoft ganas ', MONTO_CUENTA, ' PichiCoins, y lo que juntes sin cuenta se conserva.'));
        w.append(h('div', 'psc-h4', 'Explorando nuestras apps'));
        HITOS.forEach(([N, monto, texto]) => w.append(fila(texto, monto, { done: ('apps_' + (N || 'todas')) in E })));
        const nuevas = Object.keys(APPS_NUEVAS);
        if (!nuevas.length) w.append(fila('Entrar a una app nueva (cada vez que sumemos una)', MONTO_APP_NUEVA));
        else nuevas.forEach(sl => w.append(fila('Entrar a ' + APPS_NUEVAS[sl] + ' (app nueva)', MONTO_APP_NUEVA, { done: ('app_nueva_' + sl) in E })));
        w.append(h('div', 'psc-h4', 'Tiempo en nuestras apps'));
        TRAMOS.forEach(([sec, monto, texto]) => w.append(fila(texto, monto, { done: ('t_' + sec) in E })));
        w.append(fila('Superar tu récord de tiempo diario', MONTO_RECORD, { nota: 'Una vez por cada día en que superes tu récord' + (S.rec > 0 ? ' · Tu récord: ' + Math.floor(S.rec / 60) + ' min' : '') }));
        w.append(h('div', 'psc-h4', 'Leer nuestros paneles'));
        w.append(h('div', 'psc-h4', 'Leer nuestros paneles'));
        w.append(h('div', 'psc-h4', 'Días de racha'));
        w.append(fila('Tu primer día de racha', 100, { done: 'racha_primera_v2' in E }));
        w.append(fila('Cada día de racha después del primero', 30, { done: ('rd_' + hoy()) in E, nota: 'Entrá a PichonApps todos los días. Si pasás un día sin entrar, la racha vuelve a 0' + (rachaActual() ? ' · Racha actual: ' + rachaActual() : '') }));
        w.append(fila('Cada semana de racha (7, 14, 21… días)', 80,
            { done: ('rw_' + hoy()) in E, nota: 'Se cobra automáticamente cada 7 días seguidos' }));

        w.append(h('div', 'psc-h4', 'Cuenta de Pichisoft'));
        w.append(fila('Crear tu cuenta de Pichisoft', MONTO_CUENTA, { done: 'cuenta_creada' in E }));
        Object.keys(EVENTOS).forEach(k => w.append(fila(EVENTOS[k][1], EVENTOS[k][0], { done: ('ev_' + k) in E, lock: modo !== 'cuenta', nota: modo !== 'cuenta' ? 'Solo con cuenta' : '' })));
        return w;
    }
    function bTienda() {
        const w = h('div'), s0 = saldo();
        w.append(P('psc-big', 'Tu saldo: ', s0, ' PichiCoins'));

        /* Tema propio */
        const cc = h('div', 'psc-item');
        const ct = h('div', 'psc-item-t'); ct.append(h('span', '', 'Crea tu propio tema')); const cp = h('span'); cp.append(numEl(PRECIO_CUSTOM)); ct.append(cp);
        const cb = h('button', 'psc-buy'); cb.type = 'button';
        if (S.custom.length >= MAX_CUSTOM) { cb.textContent = 'Límite alcanzado (' + MAX_CUSTOM + '/' + MAX_CUSTOM + ')'; cb.disabled = true; }
        else if (modo === 'cargando') { cb.textContent = 'Cargando…'; cb.disabled = true; }
        else if (s0 < PRECIO_CUSTOM) { cb.append('Te faltan ', numEl(PRECIO_CUSTOM - s0)); cb.disabled = true; }
        else { cb.textContent = 'Crear mi tema'; cb.onclick = () => abrirEditor(null); }
        cc.append(ct, h('p', '', 'Elegí los colores de tu PichonApps y el estilo del cartel «¡Ganaste!». Podés crear hasta ' + MAX_CUSTOM + ' temas (tenés ' + S.custom.length + '/' + MAX_CUSTOM + ') y editarlos gratis cuando quieras.'), cb);
        w.append(cc);

        TIENDA.forEach(it => {
            const own = S.bought[it.id] !== undefined, s = saldo();
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
            if (it.slot) {
                const pv = h('button', 'psc-buy psc-pv'); pv.type = 'button'; pv.textContent = 'Vista previa';
                pv.onclick = () => mostrarPreview(it);
                c.append(t, h('p', '', it.desc), b, pv);
            } else c.append(t, h('p', '', it.desc), b);
            w.append(c);
        });
        return w;
    }
    const itemsCustom = () => S.custom.flatMap(c => [
        { id: 'ctema_' + c.id, nombre: 'Tema propio: ' + c.n, desc: 'Tu tema personalizado.', slot: 'tema', custom: c, cdel: c },
        { id: 'ccartel_' + c.id, nombre: 'Cartel propio: ' + c.n, desc: 'El estilo de «¡Ganaste!» de tu tema.', slot: 'cartel', cdel: c }
    ]);
    function borrarCustom(c) {
        S.earned['delc_' + c.id] = 0;
        S.custom = S.custom.filter(x => x.id !== c.id);
        ['tema', 'cartel'].forEach(sl => { const v = S.equipped[sl]; if (v === 'ctema_' + c.id || v === 'ccartel_' + c.id) S.equipped[sl] = ''; });
        guardar(); cambio();
        cartel({ titulo: 'Tema eliminado', texto: '«' + c.n + '»' });
    }
    function confirmarBorrarCustom(c) {
        if (document.getElementById('psc-del-ov')) return;
        if (!document.getElementById('psc-del-css')) {
            const s = document.createElement('style'); s.id = 'psc-del-css';
            s.textContent = '.psc-del-no{display:block;width:100%;margin-top:8px;padding:12px;background:#2a2a2a;color:#fff;border:1px solid #555;border-radius:10px;font:.95rem Georgia,serif;cursor:pointer;transition:all .2s}.psc-del-no:hover{background:#fff;color:#000}.psc-del-yes{display:block;width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#3a1010,#1a0606);color:#ffb0b0;border:1.5px solid #b03030;border-radius:10px;font:bold .95rem Georgia,serif;cursor:pointer;transition:all .2s}.psc-del-yes:hover{background:linear-gradient(135deg,#8a2020,#400c0c);color:#fff;box-shadow:0 0 14px rgba(200,50,50,.4)}';
            document.head.appendChild(s);
        }
        const ov = h('div', 'psc-pv-ov'); ov.id = 'psc-del-ov';
        ov.innerHTML = '<div class="psc-pv-card" role="alertdialog" aria-modal="true"><div class="psc-pv-hd"><h2>¿Eliminar este tema?</h2><button class="psc-pv-x" type="button" aria-label="Cerrar"></button></div><p class="psc-pv-name"><b></b></p><p class="psc-pv-desc">Se eliminarán el tema y su cartel «¡Ganaste!». No se devuelven los PichiCoins y no se puede deshacer. Después podrás crear otro (ocupa un lugar de los ' + MAX_CUSTOM + ').</p><button class="psc-del-no" type="button">No, conservarlo</button><button class="psc-del-yes" type="button">Sí, eliminar</button></div>';
        document.body.append(ov);
        ov.querySelector('b').textContent = c.n;
        const cerrar = () => ov.remove();
        ov.querySelector('.psc-pv-x').onclick = cerrar;
        ov.querySelector('.psc-del-no').onclick = cerrar;
        ov.onclick = e => { if (e.target === ov) cerrar(); };
        ov.querySelector('.psc-del-yes').onclick = () => { cerrar(); borrarCustom(c); };
    }
    function bColeccion() {
        const w = h('div'), slots = {};
        TIENDA.flatMap(it => it.id === 'marco_neon' ? itemsNeon() : [it]).concat(itemsCustom()).forEach(it => {
            if (!it.slot || !posee(it.id)) return;
            (slots[it.slot] = slots[it.slot] || []).push(it);
        });
        if (!Object.keys(slots).length) {
            w.append(h('div', 'psc-empty', 'Todavía no tenés nada comprado. ¡Andá a la Tienda y comprá alguna decoración!'));
        } else {
            Object.keys(slots).forEach(slot => {
                w.append(h('div', 'psc-h4', SLOT_NOMBRES[slot] || slot));
                slots[slot].forEach(it => {
                    const equipped = S.equipped[slot] === it.id;
                    const row = h('div', 'psc-eq-item' + (equipped ? ' equipped' : ''));
                    const info = h('div', 'psc-eq-info');
                    info.append(h('div', 'psc-eq-name', it.nombre), h('div', 'psc-eq-desc', it.desc));
                    const b = h('button', 'psc-eq-btn'); b.type = 'button';
                    b.textContent = equipped ? 'Desequipar' : 'Equipar';
                    b.onclick = () => equipar(slot, equipped ? '' : it.id);
                    row.append(info, b);
                    if (it.custom) {
                        const ed = h('button', 'psc-eq-btn', 'Editar'); ed.type = 'button'; ed.style.marginLeft = '8px';
                        ed.onclick = () => abrirEditor(it.custom); row.append(ed);
                    }
                    if (it.cdel) {
                        const dl = h('button', 'psc-eq-btn', 'Eliminar'); dl.type = 'button'; dl.style.marginLeft = '8px';
                        dl.onclick = () => confirmarBorrarCustom(it.cdel); row.append(dl);
                    }
                    if (slot === 'titulo' && equipped) {
                        const edit = h('button', 'psc-eq-btn', 'Cambiar texto'); edit.type = 'button'; edit.style.marginLeft = '8px';
                        edit.onclick = () => pedirTituloTexto(); row.append(edit);
                    }
                    w.append(row);
                });
            });
        }
        const rst = h('div', 'psc-reset-section');
        rst.append(h('div', 'psc-h4', 'Zona peligrosa'),
            P('psc-tx', 'Restablecer PichiCoins borra TODOS tus PichiCoins: tu saldo, las decoraciones que compraste, tus temas propios y los logros que conseguiste. Después podés volver a ganarlos haciendo las mismas cosas.'));
        const rb = h('button', 'psc-reset-btn'); rb.type = 'button'; rb.textContent = 'Restablecer mis PichiCoins';
        rb.onclick = () => confirmarResetCoins();
        rst.append(rb); w.append(rst);
        return w;
    }

    function comprar(it) {
        if (modo === 'cargando' || S.bought[it.id] !== undefined || saldo() < it.precio) return;
        if (it.soloCuenta && modo !== 'cuenta') return;
        S.bought[it.id] = it.precio;
        if (it.slot) S.equipped[it.slot] = it.id;
        if (it.id === 'marco_neon') S.equipped.marco = 'marco_neon_cian';
        if (it.id === 'titulo') setTimeout(() => pedirTituloTexto(), 300);
        if (it.id === 'coleccion') TIENDA.forEach(o => { if (o.id !== 'coleccion' && S.bought[o.id] === undefined) S.bought[o.id] = 1; });
        guardar(); cambio();
        cartel({ titulo: '¡Compra realizada!', texto: '«' + it.nombre + '» · −' + fmt(it.precio) + ' PichiCoins' });
    }
    function pedirTituloTexto() {
        if (document.getElementById('psc-title-ov')) return;
        const ov = h('div', 'psc-pv-ov'); ov.id = 'psc-title-ov';
        ov.innerHTML = `
            <div class="psc-pv-card" role="dialog" aria-modal="true">
                <div class="psc-pv-hd"><h2>Tu título personalizado</h2><button class="psc-pv-x" type="button" aria-label="Cerrar"></button></div>
                <p class="psc-pv-desc">Este título aparece debajo de tu nombre de usuario (visible solo para ti). Máximo 30 caracteres.</p>
                <input type="text" id="psc-title-input" maxlength="30" placeholder="Ej: Explorador, Leyenda, Pichisofter..."
                    style="width:100%;box-sizing:border-box;background:#222;border:1px solid var(--gold);color:#fff;padding:10px;font:inherit;border-radius:8px;outline:0;font-size:16px">
                <p class="psc-pv-hint">Podés cambiarlo cuando quieras desde "Mi colección".</p>
                <button class="psc-pv-close" id="psc-title-save" type="button">Guardar título</button>
            </div>`;
        document.body.append(ov);
        const inp = ov.querySelector('#psc-title-input'); inp.value = S.tituloTexto || '';
        const cerrar = () => ov.remove();
        const gd = () => { S.tituloTexto = (inp.value || '').trim().slice(0, 30); guardar(); cambio(); cerrar(); };
        ov.querySelector('.psc-pv-x').onclick = cerrar;
        ov.querySelector('#psc-title-save').onclick = gd;
        ov.onclick = e => { if (e.target === ov) cerrar(); };
        inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); gd(); } };
        setTimeout(() => inp.focus(), 120);
    }

    /* ---------------- Editor de temas propios ---------------- */
    function abrirEditor(edit) {
        if (document.getElementById('psc-ed-ov')) return;
        const nuevo = !edit;
        if (nuevo && (S.custom.length >= MAX_CUSTOM || saldo() < PRECIO_CUSTOM || modo === 'cargando')) return;
        const c = Object.assign({ n: 'Mi tema ' + (S.custom.length + 1), g: '#d4af37', g2: '#f1d98a', bg: '#222222', tx: '#f5f5f5', cg: '#d4af37', cg2: '#f1d98a', cbg: '#0d0a04' }, edit ? JSON.parse(JSON.stringify(edit)) : {});
        const row = (k, t) => '<label class="psc-ed-r"><span>' + t + '</span><input type="color" data-k="' + k + '" value="' + c[k] + '"></label>';
        const ov = h('div', 'psc-pv-ov'); ov.id = 'psc-ed-ov';
        ov.innerHTML = '<div class="psc-pv-card" role="dialog" aria-modal="true">' +
            '<div class="psc-pv-hd"><h2>' + (nuevo ? 'Crear tema propio' : 'Editar tema') + '</h2><button class="psc-pv-x" type="button" aria-label="Cerrar"></button></div>' +
            '<label class="psc-ed-r"><span>Nombre</span><input type="text" id="psc-ed-n" maxlength="20"></label>' +
            '<div class="psc-ed-sec">Tema de PichonApps</div>' +
            row('g', 'Color principal') + row('g2', 'Color claro (títulos y brillos)') + row('bg', 'Fondo de la página') + row('tx', 'Color del texto') +
            '<div class="psc-ed-sec">Cartel «¡Ganaste!»</div>' +
            row('cg', 'Borde y brillo') + row('cg2', 'Texto y moneda') + row('cbg', 'Fondo') +
            '<div class="psc-pv-demo"><div class="psc-pv-demo-cartel" id="psc-ed-demo"><div class="psc-pv-coin">P</div><div><div class="psc-pv-t1">¡Ganaste <b>500</b> PichiCoins!</div><div class="psc-pv-t2">por hacer algo genial</div></div></div></div>' +
            '<p class="psc-pv-hint">' + (nuevo ? 'Crear el tema cuesta ' + fmt(PRECIO_CUSTOM) + ' PichiCoins. Después podés editarlo gratis.' : 'Editar tu tema es gratis.') + ' Estás viendo una vista previa en vivo.</p>' +
            '<button class="psc-pv-close" id="psc-ed-save" type="button">' + (nuevo ? 'Crear tema (−' + fmt(PRECIO_CUSTOM) + ')' : 'Guardar cambios') + '</button>' +
            '<button class="psc-pv-close" id="psc-ed-no" type="button" style="margin-top:8px">Cancelar</button></div>';
        document.body.append(ov);
        const inp = ov.querySelector('#psc-ed-n'); inp.value = c.n;
        const demo = ov.querySelector('#psc-ed-demo');
        const vivo = () => { document.body.classList.add('psc-own-tema_custom'); aplicarTema(c); estilarCartel(demo, { g: c.cg, g2: c.cg2, bg: c.cbg }); };
        ov.querySelectorAll('input[type=color]').forEach(i => i.oninput = () => { c[i.dataset.k] = i.value; vivo(); });
        vivo();
        const cerrar = () => { ov.remove(); aplicarEfectos(); };
        ov.querySelector('.psc-pv-x').onclick = cerrar;
        ov.querySelector('#psc-ed-no').onclick = cerrar;
        ov.onclick = e => { if (e.target === ov) cerrar(); };
        ov.querySelector('#psc-ed-save').onclick = () => {
            c.n = (inp.value || '').trim().slice(0, 20) || 'Mi tema';
            if (!CK.every(k => okHex(c[k]))) return;
            if (nuevo) {
                if (S.custom.length >= MAX_CUSTOM || saldo() < PRECIO_CUSTOM || modo === 'cargando') return;
                c.id = 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); c.u = Date.now();
                S.custom.push(c);
                S.bought['ctema_' + c.id] = PRECIO_CUSTOM; S.bought['ccartel_' + c.id] = 0;
                S.equipped.tema = 'ctema_' + c.id; S.equipped.cartel = 'ccartel_' + c.id;
                guardar(); cerrar(); cambio();
                cartel({ titulo: '¡Tema creado!', texto: '«' + c.n + '» · −' + fmt(PRECIO_CUSTOM) + ' PichiCoins' });
            } else {
                c.u = Date.now();
                const i = S.custom.findIndex(x => x.id === c.id); if (i >= 0) S.custom[i] = c;
                guardar(); cerrar(); cambio();
            }
        };
    }

    /* ---------------- Vista previa de ítems de la tienda ---------------- */
    const PREVIEW_PARAM = 'psc_preview';
    let previewState = null;

    function buscarItemPorId(id) {
        if (!id) return null;
        const all = TIENDA.concat(itemsNeon(), itemsCustom());
        return all.find(x => x.id === id) || null;
    }

    function mostrarPreview(it) {
        if (!it) return;
        if (previewState) return;
        if (!esIndex) {
            location.href = 'https://pichisoft.cc/?' + PREVIEW_PARAM + '=' + encodeURIComponent(it.id);
            return;
        }
        activarPreview(it);
    }

    function crearBarraPreview(it) {
        const bar = h('div'); bar.id = 'psc-preview-bar';
        bar.setAttribute('translate', 'no');
        bar.setAttribute('role', 'status');
        const lbl = h('span', 'psc-prev-label', 'Vista previa:');
        const nm = h('b', 'psc-prev-name', it.nombre || '');
        bar.append(lbl, nm);

        if (it.id === 'sonido_moneda') {
            const s = h('button', 'psc-prev-extra', '🔊 Probar sonido'); s.type = 'button';
            s.onclick = () => { sonidoMoneda(); mostrarCartelDemo(); };
            bar.append(s);
        }
        if (it.id === 'marco_neon') {
            const wrap = h('div', 'psc-prev-chips');
            NEONES.forEach(([k, n, col], idx) => {
                const chip = h('button', 'psc-prev-extra', n.split(' ')[0]);
                chip.type = 'button';
                chip.title = 'Neón ' + n;
                chip.style.borderColor = col;
                if (idx === 0) { chip.style.background = col; chip.style.color = '#111'; }
                chip.onclick = () => {
                    wrap.querySelectorAll('button').forEach(b => { b.style.background = 'rgba(212,175,55,.12)'; b.style.color = 'var(--gold2, #f1d98a)'; });
                    chip.style.background = col; chip.style.color = '#111';
                    aplicarEfectos({ slot: 'marco', id: 'marco_neon_' + k });
                };
                wrap.append(chip);
            });
            bar.append(wrap);
        }
        if (it.id === 'tema_dia') {
            const wrap = h('div', 'psc-prev-chips');
            const actual = claveDia();
            NOMBRES_DIA.forEach(([k, n, hrs]) => {
                const pal = PALETAS_DIA[k];
                const chip = h('button', 'psc-prev-extra', n);
                chip.type = 'button';
                chip.title = n + ' (' + hrs + ' hs)';
                chip.style.borderColor = pal.g;
                if (k === actual) { chip.style.background = pal.g; chip.style.color = '#111'; }
                chip.onclick = () => {
                    wrap.querySelectorAll('button').forEach(b => { b.style.background = 'rgba(212,175,55,.12)'; b.style.color = 'var(--gold2, #f1d98a)'; });
                    chip.style.background = pal.g; chip.style.color = '#111';
                    previewDia = k;
                    aplicarEfectos({ slot: 'tema', id: 'tema_dia' });
                };
                wrap.append(chip);
            });
            bar.append(wrap);
        }

        if (it.id === 'coleccion') {
            bar.append(h('span', 'psc-prev-note', 'La colección incluye TODOS los ítems de la tienda'));
        }

        const ex = h('button'); ex.id = 'psc-preview-exit'; ex.type = 'button';
        ex.setAttribute('translate', 'no');
        ex.textContent = '✕ Salir de vista previa';
        ex.onclick = salirPreview;
        bar.append(ex);
        document.body.append(bar);
    }


    function mostrarCartelDemo() {
        if (document.querySelector('.psc-preview-cartel-demo')) return;
        const t = h('div', 'psc-t psc-preview-cartel-demo');
        t.setAttribute('translate', 'no');
        t.setAttribute('role', 'status');
        t.innerHTML = '<div class="psc-coin">P</div><div><div class="psc-t1">¡Ganaste <b>100</b> PichiCoins!</div><div class="psc-t2">por probar este ítem</div></div><div class="psc-bar"></div>' + '<i class="psc-sp"></i>'.repeat(6);
        const est = previewState && previewState.item.slot === 'cartel'
            ? estiloDe(previewState.item.id)
            : colorCartel(S.equipped && S.equipped.cartel);
        if (est) estilarCartel(t, est);
        document.body.append(t);
        setTimeout(() => { if (t.parentNode) t.remove(); }, 4600);
    }

    function activarPreview(it) {
        const originalAbierto = { ...abierto };
        const pscOv = document.getElementById('psc-ov');
        if (pscOv) { const x = pscOv.querySelector('.psc-x'); if (x) x.click(); }
        aplicarEfectos({ slot: it.slot, id: it.id });
        document.body.classList.add('psc-preview-mode');
        previewState = { item: it, originalAbierto, previewDiaSaved: previewDia };
        crearBarraPreview(it);
        if (it.id === 'sonido_moneda') { setTimeout(sonidoMoneda, 150); setTimeout(mostrarCartelDemo, 300); }
        else if (it.slot === 'cartel') { setTimeout(mostrarCartelDemo, 300); }
    }

    function salirPreview() {
        if (!previewState) return;
        document.body.classList.remove('psc-preview-mode');
        const bar = document.getElementById('psc-preview-bar'); if (bar) bar.remove();
        document.querySelectorAll('.psc-preview-cartel-demo').forEach(t => t.remove());
        previewDia = null;
        aplicarEfectos();
        previewState = null;
        const params = new URLSearchParams(location.search);
        if (params.has(PREVIEW_PARAM)) {
            params.delete(PREVIEW_PARAM);
            const qs = params.toString();
            history.replaceState({}, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
        }
        setTimeout(() => { abrirPanel(); document.documentElement.style.overflow = 'hidden'; }, 60);
    }

    function pscPreviewKeyGuard(e) {
        if (!previewState) return;
        if (e.key === 'Escape') return;
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        e.preventDefault();
        e.stopPropagation();
    }
    addEventListener('keydown', pscPreviewKeyGuard, true);

    function pscPreviewEscape(e) {
        if (!previewState) return;
        if (e.key !== 'Escape') return;
        const hayModal = document.querySelector('.psi-ov, .pcm-ov, #pCfg, .pf-modal.open, #pf-share-ov.open, #psc-pv-ov, #psc-ed-ov, #psc-reset-ov, #psc-title-ov, #pcfOv, .psc-del-ov');
        if (hayModal) return;
        e.stopImmediatePropagation();
        salirPreview();
    }
    addEventListener('keydown', pscPreviewEscape, true);

    function checkPreviewFromURL() {
        if (!esIndex) return;
        const params = new URLSearchParams(location.search);
        const id = params.get(PREVIEW_PARAM);
        if (!id) return;
        const it = buscarItemPorId(id);
        if (!it) {
            params.delete(PREVIEW_PARAM);
            const qs = params.toString();
            history.replaceState({}, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
            return;
        }
        let attempts = 40;
        const tick = () => {
            if (modo === 'cargando' && attempts-- > 0) { setTimeout(tick, 250); return; }
            mostrarPreview(it);
        };
        tick();
    }
    function equipar(slot, itemId) {
        if (itemId && !posee(itemId)) return;
        S.equipped[slot] = itemId || '';
        guardar(); cambio();
    }

    function confirmarResetCoins() {
        if (document.getElementById('psc-reset-ov')) return;
        const ov = h('div', 'psc-reset-ov'); ov.id = 'psc-reset-ov';
        ov.innerHTML = `
            <div class="psc-reset-card" role="alertdialog" aria-modal="true" aria-labelledby="psc-reset-ttl">
                <h2 id="psc-reset-ttl">¿Restablecer tus PichiCoins?</h2>
                <p><b>Vas a perder TODOS tus PichiCoins, compras, temas propios y logros.</b></p>
                <p>Se van a borrar tu saldo actual, las decoraciones que compraste y todos los logros que conseguiste.</p>
                <p>Pero no te preocupes: <b>podés volver a ganarlos</b> haciendo las mismas cosas que antes. Incluso vas a recibir de nuevo el bono de bienvenida de +5.000 PichiCoins (si tenés cuenta).</p>
                <p>Esta acción no se puede deshacer.</p>
                <button class="psc-reset-cancel" id="psc-reset-no" type="button">No, quiero conservar mis PichiCoins</button>
                <button class="psc-reset-confirm" id="psc-reset-yes" type="button">Sí, restablecer todo</button>
            </div>`;
        document.body.append(ov);
        const cerrar = () => ov.remove();
        ov.onclick = e => { if (e.target === ov) cerrar(); };
        ov.querySelector('#psc-reset-no').onclick = cerrar;
        ov.querySelector('#psc-reset-yes').onclick = async () => {
            const b = ov.querySelector('#psc-reset-yes'); b.disabled = true; b.textContent = 'Restableciendo…';
            await resetCoins(); cerrar();
        };
    }
    async function resetCoins() {
        const vacio = () => ({ earned: {}, bought: {}, equipped: {}, rec: 0, tituloTexto: '', custom: [], streak: { last: '', n: 0 }, fromUid: '' });
        const aviso = () => cartel({ titulo: '¡PichiCoins restablecidos!', texto: 'Tu progreso fue borrado. Vuelve a hacer las cosas para ganar de nuevo.' });
        if (modo !== 'cuenta' || !uid) {
            S = vacio(); lsSet('psc_guest', S); lsSet('psc_day', { d: hoy(), s: 0 });
            cambio(); aviso(); return;
        }
        const old = { ...S }, id = uid;
        try {
            detenerSnap();
            await setDoc(doc(db, 'pichicoins', id), { earned: {}, bought: {}, equipped: {}, rec: 0, tituloTexto: '', custom: [], streak: { last: '', n: 0 }, });
            S = vacio(); sucio = false;
            lsSet(keyAcc(id), snapshotLocal()); lsSet('psc_guest', vacioGuest()); lsSet('psc_day', { d: hoy(), s: 0 });
            cambio(); aviso();
            modo = 'cargando';
            rachaDia = '';
            revisarRacha();          // queda en cola y corre al terminar de cargar
            cargarCuenta(id);        // da el bono de 5.000 y reactiva la sincronizacións
        } catch (err) {
            S = old; cambio(); console.error('Reset error:', err);
            alert('No se pudo restablecer. Intentá de nuevo más tarde.');
            if (uid === id) cargarCuenta(id);
        }
    }

    function render() {
        const bd = document.getElementById('psc-bd'); if (!bd) return;
        const top = bd.scrollTop; bd.textContent = '';
        bd.append(
            acc('que', '¿Qué son los PichiCoins?', bQue()),
            acc('mis', 'Mis PichiCoins', bMis()),
            acc('ganar', '¿Cómo ganar PichiCoins?', bGanar()),
            acc('tienda', 'Tienda', bTienda()),
            acc('coleccion', 'Mi colección', bColeccion())
        );
        bd.scrollTop = top;
    }
    function abrirPanel() {
        if (document.getElementById('psc-ov')) return;
        const ov = h('div', 'psc-ov'); ov.id = 'psc-ov';
        ov.innerHTML = '<div class="psc-card" role="dialog" aria-modal="true" aria-label="PichiCoins"><div class="psc-hd"><h2>PichiCoins</h2><button type="button" class="psc-x" aria-label="Cerrar"></button></div><div class="psc-bd" id="psc-bd"></div></div>';
        document.body.append(ov);
        document.documentElement.style.overflow = 'hidden';
        const esc = e => { if (e.key === 'Escape' && !document.getElementById('psc-pv-ov') && !document.getElementById('psc-ed-ov')) { e.stopImmediatePropagation(); cerrar(); } };
        const cerrar = () => { document.removeEventListener('keydown', esc, true); ov.remove(); document.documentElement.style.overflow = ''; };
        document.addEventListener('keydown', esc, true);
        ov.onclick = e => { if (e.target === ov) cerrar(); };
        ov.querySelector('.psc-x').onclick = cerrar;
        render();
    }

    /* ======================== BOTÓN, EFECTOS Y ENGANCHES ======================== */
    function actualizarBoton() { if (btn) btn.classList.toggle('cuenta', modo === 'cuenta'); }
    function aplicarTema(c) {
        const b = document.body, r = document.documentElement;
        CUSTOM_KEYS.forEach(k => b.style.removeProperty(k));
        if (esIndex) { r.style.removeProperty('background-color'); r.style.removeProperty('color'); }
        if (!c) return;
        const v = varsDe(c.g, c.g2); for (const k in v) b.style.setProperty(k, v[k]);
        if (esIndex) { b.style.setProperty('--ctxt', c.tx); r.style.backgroundColor = c.bg; r.style.color = c.tx; }
    }
    function aplicarEfectos(over) {
        const b = document.body, eq = Object.assign({}, S.equipped || {});
        if (over) eq[over.slot] = over.id;
        [...b.classList].filter(c => c.startsWith('psc-own-')).forEach(c => b.classList.remove(c));
        let cus = null;
        for (const slot in eq) {
            let id = eq[slot];
            if (id === 'marco_neon') id = 'marco_neon_cian';
            if (!id || slot === 'cartel') continue;
            if (!(over && over.slot === slot) && !posee(id)) continue;
            if (id === 'tema_dia') { cus = paletaDia(); b.classList.add('psc-own-tema_custom'); continue; }
            if (id.startsWith('ctema_')) { cus = S.custom.find(x => x.id === id.slice(6)) || null; if (cus) b.classList.add('psc-own-tema_custom'); continue; }
            b.classList.add('psc-own-' + id);
        }
        aplicarTema(cus);
        const nomEl = document.querySelector('#cuenta .nom');
        if (nomEl) {
            if (eq.titulo && (over || S.bought.titulo !== undefined)) nomEl.setAttribute('data-titulo', S.tituloTexto || 'Explorador');
            else nomEl.removeAttribute('data-titulo');
        }
    }
    function cambio() {
        actualizarBoton(); aplicarEfectos(); render();
        const rk = document.getElementById('psc-racha');
        if (rk) { const n = rachaActual(); rk.textContent = ''; const b = h('b', 'notranslate', String(n)); b.setAttribute('translate', 'no'); rk.append(b, h('small', '', n === 1 ? 'día de racha' : 'días de racha')); }
        try { window.dispatchEvent(new CustomEvent('pichicoins:cambio', { detail: { saldo: saldo(), modo } })); } catch { }
    }

    function montarDock() {
        const cuenta = document.getElementById('cuenta'); if (!cuenta) return;
        dock = h('div'); dock.id = 'psc-dock';
        btn = h('button'); btn.id = 'psc-btn'; btn.type = 'button';
        btn.innerHTML = '<i class="psc-mini"></i><span>PichiCoins</span>';
        btn.onclick = abrirPanel;
        dock.append(btn);
        const sh = document.getElementById('pf-share-btn'); if (sh) dock.append(sh);
        const rk = h('div'); rk.id = 'psc-racha'; dock.append(rk);
        document.body.append(dock);
        const pos = () => {
            const topbar = document.getElementById('pichisoft-topbar');
            const rC = cuenta.getBoundingClientRect();
            const fijoC = getComputedStyle(cuenta).position === 'fixed';
            const bottomCuenta = rC.bottom + (fijoC ? 0 : scrollY);
            let bottomTopbar = 0;
            if (topbar && getComputedStyle(topbar).display !== 'none') {
                const rT = topbar.getBoundingClientRect();
                const fijoT = getComputedStyle(topbar).position === 'fixed';
                bottomTopbar = rT.bottom + (fijoT ? 0 : scrollY);
            }
            dock.style.top = Math.round(Math.max(bottomCuenta, bottomTopbar, 100) + 10) + 'px';
        };
        if (window.ResizeObserver) {
            new ResizeObserver(pos).observe(cuenta);
            const tb = document.getElementById('pichisoft-topbar'); if (tb) new ResizeObserver(pos).observe(tb);
        }
        if (window.MutationObserver) new MutationObserver(pos).observe(document.body, { attributes: true, attributeFilter: ['class'] });
        addEventListener('resize', pos); addEventListener('scroll', pos, { passive: true }); addEventListener('load', pos);
        pos(); setTimeout(pos, 600);
    }

    function escucharIndex() {
        const enlace = e => {
            const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
            const m = /pichisoft\.cc\/([a-z0-9_-]+)(?:\.html)?(?:[?#]|$)/i.exec(a.href);
            if (m) visitar(m[1]);
        };
        addEventListener('click', enlace, true);
        addEventListener('auxclick', enlace, true);
        document.addEventListener('click', e => {
            const b = e.target.closest && e.target.closest('.pf-btn[data-pf],[data-pf-link]'); if (!b) return;
            const k = b.dataset.pf || b.dataset.pfLink; if (!PANELES[k]) return;
            if (('panel_' + k) in S.earned) return;
            ganar('panel_' + k, MONTO_PANEL, 'leer el panel «' + PANELES[k] + '»');
        }, true);
        const rc = window.renderCuenta;
        window.renderCuenta = function () {
            if (rc) rc.apply(this, arguments);
            evaluar();
            setTimeout(() => aplicarEfectos(), 0);
        };
    }
    /* Auto-detección de apps nuevas: lee index.html y guarda los slugs en localStorage */
    function escanearAppsNuevas() {
        if (!esIndex) return;
        const encontradas = {};
        /* Detecta por clase "nuevo" en el index (li.nuevo) y por la etiqueta NUEVO de pichisoft-premium.js (t:['nuevo']) */
        document.querySelectorAll('.nuevo, .Nuevo, [data-nuevo], [data-nueva], .app-nueva, .app .et-nuevo').forEach(el => {
            const cont = el.classList.contains('et-nuevo') ? el.closest('.app') : el;
            if (!cont) return;
            const a = cont.matches('a[href]') ? cont : (cont.querySelector('a[href]') || cont.closest('a[href]'));
            let slug = (cont.dataset && cont.dataset.app) || (a && a.dataset && a.dataset.app) || '';
            if (!slug && a) {
                const m = /([a-z0-9_-]+)\.html(?:[?#]|$)/i.exec(a.getAttribute('href') || '');
                if (m && m[1].toLowerCase() !== 'index') slug = m[1].toLowerCase();
            }
            if (!slug) return;
            encontradas[slug] = APPS[slug] || (a ? a.textContent.trim() : '') || slug;
        });
        Object.keys(APPS_NUEVAS).forEach(k => delete APPS_NUEVAS[k]);
        Object.assign(APPS_NUEVAS, encontradas);
        lsSet('psc_apps_nuevas', APPS_NUEVAS);
    }



    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', escanearAppsNuevas, { once: true });
    } else {
        escanearAppsNuevas();
    }
    /* ================================== INICIO ================================== */
    const st = document.createElement('style'); st.id = 'psc-style'; st.textContent = tint(CSS); document.head.appendChild(st);
    const CSS_PREVIEW = `
/* ===================== MODO VISTA PREVIA ===================== */
body.psc-preview-mode * { pointer-events: none !important; }

/* Elementos que SÍ se pueden tocar en preview */
body.psc-preview-mode #pichisoft-topbar > *,
body.psc-preview-mode .pf-btn[data-pf],
body.psc-preview-mode #psc-preview-bar,
body.psc-preview-mode #psc-preview-bar * {
    pointer-events: auto !important;
}

/* Barra superior de preview */
/* Barra lateral de vista previa (medio derecha) */
#psc-preview-bar {
    position: fixed;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    z-index: 2147483000;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: max-content;
    max-width: 210px;
    padding: 12px 14px;
    background: linear-gradient(160deg, #241b06, #0c0a03 70%);
    border: 1.5px solid var(--gold, #d4af37);
    border-radius: 14px;
    box-shadow: 0 18px 50px rgba(0,0,0,.7), 0 0 34px rgba(212,175,55,.35);
    color: #fff;
    font: 500 .85rem Verdana, "Open Sans", sans-serif;
    box-sizing: border-box;
    animation: pscFade .25s ease;
    user-select: none;
    -webkit-user-select: none;
}
#psc-preview-bar .psc-prev-label { color: #d0d0d0; font-size: .74rem; }
#psc-preview-bar .psc-prev-name { color: var(--gold2, #f1d98a); font-family: Georgia, serif; font-size: .98rem; line-height: 1.2; }
#psc-preview-bar .psc-prev-note { color: #bdbdbd; font-size: .72rem; font-style: italic; line-height: 1.35; }
#psc-preview-bar .psc-prev-chips {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    margin: 2px 0;
}
#psc-preview-bar .psc-prev-extra {
    background: rgba(212,175,55,.12); color: var(--gold2, #f1d98a);
    border: 1px solid var(--gold, #d4af37); border-radius: 6px;
    padding: 5px 6px; font: bold .72rem Arial, sans-serif; cursor: pointer;
    text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#psc-preview-bar .psc-prev-extra:hover { background: var(--gold, #d4af37); color: #111; }
#psc-preview-exit {
    background: linear-gradient(135deg, #d4af37, #a67c10);
    color: #111; border: 0; border-radius: 8px;
    padding: 8px 12px; font: bold .82rem Georgia, serif;
    cursor: pointer; text-align: center;
    margin-top: 2px;
    box-shadow: 0 4px 12px rgba(0,0,0,.4);
}
#psc-preview-exit:hover { background: linear-gradient(135deg, #f1d98a, #d4af37); }

/* En celular se acomoda abajo para no tapar el contenido */
@media (max-width: 600px) {
    #psc-preview-bar {
        top: auto;
        bottom: calc(10px + env(safe-area-inset-bottom, 0px));
        right: auto;
        left: 50%;
        transform: translateX(-50%);
        width: calc(100vw - 20px);
        max-width: 420px;
        padding: 10px 12px;
        gap: 6px;
    }
    #psc-preview-bar .psc-prev-chips {
        grid-template-columns: repeat(3, 1fr);
    }
    #psc-preview-exit { padding: 7px 10px; font-size: .8rem; }
}

/* Subir z-index de modales para que se vean por encima del preview */
body.psc-preview-mode #pCfg       { z-index: 2147483200 !important; }
body.psc-preview-mode .pcm-ov     { z-index: 2147483200 !important; }
body.psc-preview-mode .pf-modal.open { z-index: 2147483200 !important; }

/* Modales: contenedores clickeables (para el "click en el fondo cierra") */
body.psc-preview-mode #pCfg,
body.psc-preview-mode .psi-ov,
body.psc-preview-mode .pcm-ov,
body.psc-preview-mode .pf-modal.open,
body.psc-preview-mode #pCfg .pm-panel,
body.psc-preview-mode .psi-ov .psi-card,
body.psc-preview-mode .pcm-ov .pcm-card,
body.psc-preview-mode .pf-modal.open .pf-card {
    pointer-events: auto !important;
}

/* Solo los botones de cierre son clickeables dentro de los modales (Decisión A: opción 2) */
body.psc-preview-mode .pm-back,
body.psc-preview-mode .psi-x,
body.psc-preview-mode .pcm-x,
body.psc-preview-mode .pf-close {
    pointer-events: auto !important;
}

/* Ocultar cosas del index que no van en preview */
body.psc-preview-mode #psc-dock,
body.psc-preview-mode #ps-cookie-banner,
body.psc-preview-mode #pf-share-btn,
body.psc-preview-mode .psc-t:not(.psc-preview-cartel-demo),
body.psc-preview-mode .psc-rk,
body.psc-preview-mode #pCart {
    display: none !important;
}

/* Atenuar la barra de preview cuando hay un modal abierto */
body.psc-preview-mode:has(#pCfg) #psc-preview-bar,
body.psc-preview-mode:has(.psi-ov) #psc-preview-bar,
body.psc-preview-mode:has(.pcm-ov) #psc-preview-bar,
body.psc-preview-mode:has(.pf-modal.open) #psc-preview-bar {
    opacity: .35;
    pointer-events: none !important;
}

/* En celular, la barra se ajusta */
@media (max-width: 600px) {
    #psc-preview-bar { top: 8px; padding: 8px 12px; gap: 8px; font-size: .82rem; }
    #psc-preview-exit { padding: 6px 10px; font-size: .8rem; }
}
`;
    const st2 = document.createElement('style'); st2.id = 'psc-style2'; st2.textContent = CSS2 + CSS3 + CSS4 + CSS_PREVIEW; document.head.appendChild(st2);
    if (esIndex) {
        document.body.classList.add('psc-idx');

        const iniciarDock = () => {
            if (!document.getElementById('psc-dock')) montarDock();
        };

        iniciarDock();
        setTimeout(iniciarDock, 500);
        setTimeout(iniciarDock, 1500);

        escucharIndex();
    }
    window.PichiCoins = {
        version: 5,
        evento, abrir: abrirPanel,
        saldo: () => saldo(), modo: () => modo,
        tiene: id => S.bought[id] !== undefined,
        equipado: slot => (S.equipped && S.equipped[slot]) || null,
        marcarHecho: (nombre) => evento(nombre)
    };
    addEventListener('pagehide', () => { flush(); });
    onAuthStateChanged(auth, () => { authListo = true; evaluar(); });
    setTimeout(() => { if (!authListo) { authListo = true; evaluar(); } }, 8000);
    setTimeout(() => {
        if (modo === 'cargando' && uid) {
            const cache = lsGet(keyAcc(uid), null);
            if (!cache) return;   // sin caché NO se inventa un estado vacío: cargarCuenta sigue reintentando
            console.warn('PichiCoins: cargarCuenta tardó demasiado, uso cache local');
            S = {
                streak: okStreak(cache.streak),
                earned: { ...obj(cache.earned) },
                bought: { ...obj(cache.bought) },
                equipped: { ...obj(cache.equipped) },
                rec: +cache.rec || 0,
                tituloTexto: cache.tituloTexto || '',
                custom: (Array.isArray(cache.custom) ? cache.custom : []).filter(okCustom).slice(0, MAX_CUSTOM)
            };
            modo = 'cuenta';
            sucio = false;
            drenar();
            revisarHitos();
            cambio();
        }
    }, 12000);
    /* El tema del día se revisa cada minuto (y al volver a la pestaña) */
    setInterval(() => { if (S.equipped && S.equipped.tema === 'tema_dia' && posee('tema_dia')) aplicarEfectos(); }, 60000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.equipped && S.equipped.tema === 'tema_dia') aplicarEfectos(); });
    evaluar();
    cambio();
    revisarRacha();
    if (slugActual) visitar(slugActual);
    setTimeout(checkPreviewFromURL, 200);
})();
