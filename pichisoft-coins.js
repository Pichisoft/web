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
        pichonlist: 'PichonList', pichman: 'PichonMan', pichonmorse: 'PichonMorse',
        pichonpaint: 'PichonPaint', pichonpass: 'PichonPass', pichonpush: 'PichonPush',
        pichonrandom: 'PichonRandom', pichonsnake: 'PichonSnake', pichontraffic: 'PichonTraffic',
        pichonwatch: 'PichonWatch', pichonweather: 'PichonWeather'
    };
    const APPS_NUEVAS = {};
    const MONTO_APP_NUEVA = 100;

    const TEXTO_QUE_SON = `Los PichiCoins son la moneda virtual de Pichisoft. No valen dinero real y no se pueden cambiar por dinero.

Se ganan usando PichonApps y nuestras aplicaciones: entrando a las apps, pasando tiempo en ellas, leyendo nuestros paneles y más.

Se gastan en la Tienda para conseguir mejoras y detalles exclusivos.

Puedes juntarlos con o sin cuenta de Pichisoft. Si después te creas una cuenta, no pierdes nada de lo que ya juntaste.`;

    /* Tienda. "slot" agrupa decoraciones que compiten entre sí: solo una equipada por slot. */
    const TIENDA = [
        { id: 'marco_dorado', nombre: 'Marco dorado', desc: 'Un borde dorado brillante alrededor de tu foto de perfil.', precio: 2000, soloCuenta: true, slot: 'marco' },
        { id: 'marco_animado', nombre: 'Marco animado', desc: 'Un anillo dorado que gira alrededor de tu foto de perfil.', precio: 6000, soloCuenta: true, slot: 'marco' },
        { id: 'marco_arcoiris', nombre: 'Marco arcoíris', desc: 'Un borde arcoíris animado alrededor de tu foto de perfil.', precio: 3500, soloCuenta: true, slot: 'marco' },
        { id: 'tema_esmeralda', nombre: 'Tema esmeralda', desc: 'Cambia el dorado de PichonApps por verde esmeralda.', precio: 900, slot: 'tema' },
        { id: 'tema_zafiro', nombre: 'Tema zafiro', desc: 'Cambia el dorado de PichonApps por azul zafiro.', precio: 900, slot: 'tema' },
        { id: 'tema_rubi', nombre: 'Tema rubí', desc: 'Cambia el dorado de PichonApps por rojo rubí.', precio: 900, slot: 'tema' },
        { id: 'cartel_esmeralda', nombre: 'Cartel esmeralda', desc: 'El cartel de «¡Ganaste!» con estilo esmeralda.', precio: 700, slot: 'cartel' },
        { id: 'cartel_zafiro', nombre: 'Cartel zafiro', desc: 'El cartel de «¡Ganaste!» con estilo zafiro.', precio: 700, slot: 'cartel' },
        { id: 'titulo', nombre: 'Título personalizado', desc: 'Muestra un título debajo de tu nombre (visible solo para ti).', precio: 1200, soloCuenta: true, slot: 'titulo' },
        { id: 'sonido_moneda', nombre: 'Sonido de moneda', desc: 'Suena una moneda cada vez que ganás PichiCoins.', precio: 500, slot: 'sonido' },
        { id: 'coleccion', nombre: 'Colección completa', desc: 'Todos los ítems de la tienda en un solo paquete. ¡Ahorrás un montón!', precio: 12000, soloCuenta: true }
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

/* --- Efectos de los ítems equipados --- */
body.psc-own-marco_dorado #cuenta .av{box-shadow:0 0 0 3px var(--gold),0 0 14px rgba(212,175,55,.6)}
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

body.psc-own-titulo #cuenta .nom::after{content:"· Explorador";display:block;font:italic .68rem Arial,sans-serif;color:var(--gold);margin-top:1px;letter-spacing:.5px}

/* --- TEMAS --- */
body.psc-own-tema_esmeralda { --gold:#2ecc71; --gold2:#a9f5c6; }
body.psc-own-tema_esmeralda #pichisoft-topbar{border-color:rgba(46,204,113,.4)}
body.psc-own-tema_esmeralda #pichisoft-topbar>*{color:#2ecc71!important}
body.psc-own-tema_esmeralda #pichisoft-topbar>*:hover{color:#fff!important;text-shadow:0 0 8px rgba(169,245,198,.8)!important}
body.psc-own-tema_esmeralda #psc-btn.cuenta{border-color:#2ecc71;color:#a9f5c6}

body.psc-own-tema_zafiro { --gold:#3498db; --gold2:#a8daf5; }
body.psc-own-tema_zafiro #pichisoft-topbar{border-color:rgba(52,152,219,.4)}
body.psc-own-tema_zafiro #pichisoft-topbar>*{color:#3498db!important}
body.psc-own-tema_zafiro #pichisoft-topbar>*:hover{color:#fff!important;text-shadow:0 0 8px rgba(168,218,245,.8)!important}
body.psc-own-tema_zafiro #psc-btn.cuenta{border-color:#3498db;color:#a8daf5}

body.psc-own-tema_rubi { --gold:#e74c3c; --gold2:#f5a8a0; }
body.psc-own-tema_rubi #pichisoft-topbar{border-color:rgba(231,76,60,.4)}
body.psc-own-tema_rubi #pichisoft-topbar>*{color:#e74c3c!important}
body.psc-own-tema_rubi #pichisoft-topbar>*:hover{color:#fff!important;text-shadow:0 0 8px rgba(245,168,160,.8)!important}
body.psc-own-tema_rubi #psc-btn.cuenta{border-color:#e74c3c;color:#f5a8a0}

@media (max-width:600px){.psc-ov{padding:10px}.psc-card{max-height:92vh}.psc-hd h2{font-size:1.5rem}.psc-bd{padding:14px 12px 18px}}
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
            equipped: g.equipped && typeof g.equipped === 'object' ? g.equipped : {},
            rec: +g.rec || 0
        };
    }
    let S = leerGuest();
    let modo = 'invitado';
    let uid = null;
    let pend = { earned: {}, bought: {}, equipped: {}, rec: false };
    let dock = null, btn = null;
    let unsubSnap = null;
    const colaEventos = [];
    const abierto = {};
    const saldo = () => Math.max(0, suma(S.earned) - suma(S.bought));

    function persistPend() { lsSet('psc_pend', { uid, earned: pend.earned, bought: pend.bought, equipped: pend.equipped, rec: pend.rec }); }
    function pendAdd(tipo, k, v) { if (modo === 'cuenta') pend[tipo][k] = v; }
    function pendEq(slot, val) { if (modo === 'cuenta') pend.equipped[slot] = val; }
    function guardar() {
        if (modo === 'cuenta') { persistPend(); programarFlush(); }
        else lsSet('psc_guest', S);
    }

    let flushing = false, tf = 0;
    function programarFlush(ms) { clearTimeout(tf); tf = setTimeout(flush, ms || 700); }
    async function flush() {
        if (modo !== 'cuenta' || !uid || flushing) return;
        const e = { ...pend.earned }, b = { ...pend.bought }, eq = { ...pend.equipped }, r = pend.rec;
        if (!Object.keys(e).length && !Object.keys(b).length && !Object.keys(eq).length && !r) return;
        flushing = true;
        const id = uid;
        try {
            await setDoc(doc(db, 'pichicoins', id), { earned: e, bought: b, equipped: eq, rec: S.rec }, { merge: true });
            if (uid === id) {
                Object.keys(e).forEach(k => delete pend.earned[k]);
                Object.keys(b).forEach(k => delete pend.bought[k]);
                Object.keys(eq).forEach(k => delete pend.equipped[k]);
                if (r) pend.rec = false;
                persistPend();
            }
        } catch (err) {
            console.warn('PichiCoins: no se pudo guardar, se reintenta.', err);
            setTimeout(flush, 20000);
        } finally { flushing = false; }
    }

    function detenerSnap() { if (unsubSnap) { try { unsubSnap(); } catch (e) { } unsubSnap = null; } }

    async function cargarCuenta(id) {
        let remoto = null, fallo = false;
        try { const s = await getDoc(doc(db, 'pichicoins', id)); if (s.exists()) remoto = s.data(); }
        catch (e) { console.warn('PichiCoins: no se pudo leer la cuenta.', e); fallo = true; }
        if (uid !== id) return;

        if (fallo) {
            modo = 'invitado'; uid = null; cambio();
            setTimeout(() => { if (modo === 'invitado' && auth.currentUser && auth.currentUser.uid === id) evaluar(); }, 5000);
            return;
        }

        const A = {
            earned: { ...(remoto && remoto.earned) },
            bought: { ...(remoto && remoto.bought) },
            equipped: { ...(remoto && remoto.equipped) },
            rec: +(remoto && remoto.rec) || 0
        };
        const nuevo = { earned: {}, bought: {}, equipped: {} };
        const unir = src => {
            if (!src) return;
            ['earned', 'bought'].forEach(t => {
                const o = src[t] || {};
                for (const k in o) if (!(k in A[t])) { A[t][k] = o[k]; nuevo[t][k] = o[k]; }
            });
            if ((+src.rec || 0) > A.rec) A.rec = +src.rec;
            if (src.equipped) {
                for (const slot in src.equipped) {
                    if (src.equipped[slot] && !A.equipped[slot]) {
                        A.equipped[slot] = src.equipped[slot];
                        nuevo.equipped[slot] = src.equipped[slot];
                    }
                }
            }
        };

        // Guest coins se fusionan una vez y se limpia
        const g = leerGuest();
        const gTotal = suma(g.earned) - suma(g.bought);
        if (gTotal > 0) { unir(g); lsSet('psc_guest', { earned: {}, bought: {}, equipped: {}, rec: 0 }); }
        const p = lsGet('psc_pend', null); if (p && p.uid === id) unir(p);

        // Migración: si el doc no tiene "equipped", auto-equipar un ítem por slot de los ya comprados
        if (!remoto || !remoto.equipped) {
            TIENDA.forEach(it => {
                if (it.slot && A.bought[it.id] && !A.equipped[it.slot]) {
                    A.equipped[it.slot] = it.id;
                    nuevo.equipped[it.slot] = it.id;
                }
            });
        }

        // Bonus de cuenta (también se re-otorga después de un reset)
        let bono = false;
        if (!A.earned.cuenta_creada) {
            A.earned.cuenta_creada = MONTO_CUENTA;
            nuevo.earned.cuenta_creada = MONTO_CUENTA;
            bono = true;
        }

        S = A; modo = 'cuenta';
        pend = { earned: nuevo.earned, bought: nuevo.bought, equipped: nuevo.equipped, rec: true };
        persistPend(); programarFlush(100);
        cambio();
        if (bono) {
            const texto = remoto ? 'volver a empezar en Pichisoft' : 'crear tu cuenta de Pichisoft';
            cartel({ monto: MONTO_CUENTA, texto });
        }
        revisarHitos();

        detenerSnap();
        unsubSnap = onSnapshot(doc(db, 'pichicoins', id), snap => {
            if (uid !== id || !snap.exists()) return;
            const d = snap.data();
            let cambió = false;
            for (const t of ['earned', 'bought']) {
                const o = d[t] || {};
                for (const k in o) if (!(k in S[t])) { S[t][k] = o[k]; cambió = true; }
            }
            if (d.equipped) {
                for (const slot in d.equipped) {
                    if (d.equipped[slot] && !S.equipped[slot]) { S.equipped[slot] = d.equipped[slot]; cambió = true; }
                }
            }
            if ((d.rec || 0) > S.rec) { S.rec = d.rec; cambió = true; }
            if (cambió) { persistPend(); cambio(); }
        }, err => console.warn('PichiCoins snapshot:', err));

        while (colaEventos.length) evento(colaEventos.shift());
    }

    function evaluar() {
        const u = auth.currentUser;
        const nuevo = (u && sesionValida() && (!window.Pichisoft || window.Pichisoft.user)) ? u.uid : null;
        if (nuevo === uid && modo === 'cuenta') { actualizarBoton(); return; }
        if (nuevo === uid && modo === 'cargando') return;
        uid = nuevo;
        if (!nuevo) {
            detenerSnap();
            modo = 'invitado'; S = leerGuest(); pend = { earned: {}, bought: {}, equipped: {}, rec: false };
            colaEventos.length = 0;
            cambio(); return;
        }
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
        if (!e) return;
        if (modo === 'cuenta') ganar('ev_' + n, e[0], e[2]);
        else if (modo === 'cargando') colaEventos.push(n);
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

    function bColeccion() {
        const w = h('div');

        // Agrupar por slot, solo los que ya compró
        const slots = {};
        TIENDA.forEach(it => {
            if (!it.slot || !S.bought[it.id]) return;
            if (!slots[it.slot]) slots[it.slot] = [];
            slots[it.slot].push(it);
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
                    info.append(
                        h('div', 'psc-eq-name', it.nombre),
                        h('div', 'psc-eq-desc', it.desc)
                    );
                    const b = h('button', 'psc-eq-btn'); b.type = 'button';
                    if (equipped) {
                        b.textContent = 'Desequipar';
                        b.onclick = () => equipar(slot, '');
                    } else {
                        b.textContent = 'Equipar';
                        b.onclick = () => equipar(slot, it.id);
                    }
                    row.append(info, b);
                    w.append(row);
                });
            });
        }

        // Zona peligrosa
        const rst = h('div', 'psc-reset-section');
        rst.append(
            h('div', 'psc-h4', 'Zona peligrosa'),
            P('psc-tx', 'Restablecer PichiCoins borra TODOS tus PichiCoins: tu saldo, las decoraciones que compraste y los logros que conseguiste. Después podés volver a ganarlos haciendo las mismas cosas.')
        );
        const rb = h('button', 'psc-reset-btn'); rb.type = 'button';
        rb.textContent = 'Restablecer mis PichiCoins';
        rb.onclick = () => confirmarResetCoins();
        rst.append(rb);
        w.append(rst);

        return w;
    }

    function comprar(it) {
        if (S.bought[it.id] || saldo() < it.precio) return;
        if (it.soloCuenta && modo !== 'cuenta') return;
        S.bought[it.id] = it.precio; pendAdd('bought', it.id, it.precio);

        // Auto-equipar si tiene slot (para que se vea el efecto al instante)
        if (it.slot) { S.equipped[it.slot] = it.id; pendEq(it.slot, it.id); }

        // La colección regala todo lo que no tengas (sin auto-equipar; el usuario elige)
        if (it.id === 'coleccion') {
            TIENDA.forEach(otro => {
                if (otro.id !== 'coleccion' && !S.bought[otro.id]) {
                    S.bought[otro.id] = 0; pendAdd('bought', otro.id, 0);
                }
            });
        }
        guardar(); cambio();
        cartel({ titulo: '¡Compra realizada!', texto: '«' + it.nombre + '» · −' + fmt(it.precio) + ' PichiCoins' });
    }

    function equipar(slot, itemId) {
        if (itemId && !S.bought[itemId]) return;
        S.equipped[slot] = itemId || '';
        pendEq(slot, itemId || '');
        guardar();
        cambio();
    }

    function confirmarResetCoins() {
        if (document.getElementById('psc-reset-ov')) return;
        const ov = h('div', 'psc-reset-ov'); ov.id = 'psc-reset-ov';
        ov.innerHTML = `
            <div class="psc-reset-card" role="alertdialog" aria-modal="true" aria-labelledby="psc-reset-ttl">
                <h2 id="psc-reset-ttl">¿Restablecer tus PichiCoins?</h2>
                <p><b>Vas a perder TODOS tus PichiCoins, compras y logros.</b></p>
                <p>Se van a borrar tu saldo actual, las decoraciones que compraste y todos los logros que conseguiste.</p>
                <p>Pero no te preocupes: <b>podés volver a ganarlos</b> haciendo las mismas cosas que antes (entrar a una app por primera vez, leer un panel, mandar tu primer mensaje, configurar PichonApps, etc.). Incluso vas a recibir de nuevo el bono de bienvenida de +5.000 PichiCoins.</p>
                <p>Esta acción no se puede deshacer.</p>
                <button class="psc-reset-cancel" id="psc-reset-no" type="button">No, quiero conservar mis PichiCoins</button>
                <button class="psc-reset-confirm" id="psc-reset-yes" type="button">Sí, restablecer todo</button>
            </div>`;
        document.body.append(ov);
        const cerrar = () => ov.remove();
        ov.onclick = e => { if (e.target === ov) cerrar(); };
        ov.querySelector('#psc-reset-no').onclick = cerrar;
        ov.querySelector('#psc-reset-yes').onclick = async () => {
            const b = ov.querySelector('#psc-reset-yes');
            b.disabled = true; b.textContent = 'Restableciendo…';
            await resetCoins();
            cerrar();
        };
    }

    async function resetCoins() {
        if (modo !== 'cuenta' || !uid) {
            // Invitado
            S = { earned: {}, bought: {}, equipped: {}, rec: 0 };
            pend = { earned: {}, bought: {}, equipped: {}, rec: false };
            lsSet('psc_guest', S);
            cambio();
            cartel({ titulo: '¡PichiCoins restablecidos!', texto: 'Tu progreso fue borrado. Vuelve a hacer las cosas para ganar de nuevo.' });
            return;
        }

        const old = { earned: { ...S.earned }, bought: { ...S.bought }, equipped: { ...S.equipped }, rec: S.rec };
        try {
            // Overwrite completo (sin merge) para borrar todo
            await setDoc(doc(db, 'pichicoins', uid), { earned: {}, bought: {}, equipped: {}, rec: 0 });
            S = { earned: {}, bought: {}, equipped: {}, rec: 0 };
            pend = { earned: {}, bought: {}, equipped: {}, rec: false };
            persistPend();
            cambio();
            cartel({ titulo: '¡PichiCoins restablecidos!', texto: 'Tu progreso fue borrado. Vuelve a hacer las cosas para ganar de nuevo.' });

            // Re-trigger cargarCuenta para re-otorgar el bono de +5000
            setTimeout(() => {
                if (auth.currentUser && auth.currentUser.uid === uid) {
                    detenerSnap();
                    cargarCuenta(uid);
                }
            }, 4200);
        } catch (err) {
            S.earned = old.earned; S.bought = old.bought; S.equipped = old.equipped; S.rec = old.rec;
            cambio();
            console.error('Reset error:', err);
            alert('No se pudo restablecer. Intentá de nuevo más tarde.');
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
        Object.values(S.equipped || {}).forEach(id => {
            if (id && S.bought[id]) b.classList.add('psc-own-' + id);
        });
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
        const sh = document.getElementById('pf-share-btn'); if (sh) dock.append(sh);
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
            const top = Math.max(bottomCuenta, bottomTopbar, 100) + 10;
            dock.style.top = Math.round(top) + 'px';
        };
        if (window.ResizeObserver) {
            new ResizeObserver(pos).observe(cuenta);
            const tb = document.getElementById('pichisoft-topbar');
            if (tb) new ResizeObserver(pos).observe(tb);
        }
        if (window.MutationObserver) {
            new MutationObserver(pos).observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }
        addEventListener('resize', pos); addEventListener('scroll', pos, { passive: true });
        addEventListener('load', pos);
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

        let ultimoPerfil = null;
        const rc = window.renderCuenta;
        window.renderCuenta = function () {
            if (rc) rc.apply(this, arguments);
            evaluar();
            const u = window.Pichisoft && window.Pichisoft.user;
            if (u) {
                if (ultimoPerfil && (ultimoPerfil.name !== u.name || ultimoPerfil.photo !== u.photo || ultimoPerfil.email !== u.email)) {
                    evento('perfil');
                }
                ultimoPerfil = { name: u.name, photo: u.photo, email: u.email };
            } else {
                ultimoPerfil = null;
            }
        };
    }

    /* ================================== INICIO ================================== */
    const st = document.createElement('style'); st.id = 'psc-style'; st.textContent = CSS; document.head.appendChild(st);
    if (esIndex) { montarDock(); escucharIndex(); }
    window.PichiCoins = {
        evento, abrir: abrirPanel,
        saldo: () => saldo(), modo: () => modo,
        tiene: id => !!S.bought[id],
        equipado: slot => (S.equipped && S.equipped[slot]) || null,
        marcarHecho: (nombre) => evento(nombre)
    };
    addEventListener('pagehide', () => { flush(); });
    onAuthStateChanged(auth, () => evaluar());
    evaluar();
    cambio();
    if (slugActual) visitar(slugActual);
})();
