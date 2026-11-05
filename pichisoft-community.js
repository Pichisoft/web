/* =====================================================================
   PICHISOFT COMMUNITY · Mensajería (chat, 👍 en CSS, amigos, reportes)
   ===================================================================== */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
    getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, deleteField,
    onSnapshot, query, where, orderBy, limit, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const app = getApps()[0] || initializeApp({
    apiKey: "AIzaSyCf_P8qp9nBUnsVe3qsTAtZJjZHOktKf-8", authDomain: "pichisoft.firebaseapp.com",
    projectId: "pichisoft", storageBucket: "pichisoft.firebasestorage.app",
    messagingSenderId: "690032082295", appId: "1:690032082295:web:b7f0e8cb8fcceb26e9b572"
});
const auth = getAuth(app), db = getFirestore(app);

const ADMINS = ['XIY1FfjUDodaSBSGema6NgixKRs1', 'n0XOUeFku1SxKWbrPWsA0V86kfc2'];
const CH = 700000;
const MAX_VIDEO = 6 * 1024 * 1024;
const KS = 'pichonapps-community-seen-';
const MOTIVOS = [
    ['ofensivo', 'Mensajes de contenido ofensivo'],
    ['perfil', 'Nombre de usuario/Foto de perfil con contenido ofensivo'],
    ['hacks', 'Hacks'],
    ['spam', 'Spam'],
    ['sucio', 'Juego sucio']
];

/* ------------------------------ ESTILOS ------------------------------ */
const CSS = `
.pcm-ov [hidden],.pcm-fab [hidden],.pcm-dov [hidden]{display:none!important}
.pcm-fab{position:fixed;left:16px;bottom:16px;z-index:45;display:none;align-items:center;gap:10px;padding:11px 20px 11px 15px;border-radius:999px;border:1.5px solid #d4af37;background:linear-gradient(135deg,#2b2107,#100c02);color:#f1d98a;font:bold .92rem Georgia,"Times New Roman",serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);transition:transform .2s,background .25s,color .2s;user-select:none;-webkit-user-select:none}
.pcm-fab.on{display:flex}
.pcm-fab:hover{background:linear-gradient(135deg,#d4af37,#a67c12);color:#111;transform:translateY(-2px)}
.pcm-fab:focus-visible,.pcm-b:focus-visible,.pcm-send:focus-visible,.pcm-x:focus-visible{outline:2px solid #f1d98a;outline-offset:2px}
.pcm-ic{position:relative;flex:none;width:20px;height:14px;border:2px solid currentColor;border-radius:6px;margin-bottom:5px}
.pcm-ic::after{content:"";position:absolute;left:3px;bottom:-7px;width:6px;height:6px;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg) skew(10deg,10deg)}
.pcm-dot{box-sizing:border-box;min-width:20px;height:20px;padding:0 5px;border-radius:10px;border:2px solid #f1d98a;background:linear-gradient(135deg,#ff5a5a,#b01818);color:#fff;font:bold .68rem/16px Verdana,sans-serif;text-align:center;box-shadow:0 0 0 0 rgba(255,90,90,.65);animation:pcmPulse 1.8s infinite}
.pcm-fab .pcm-dot{position:absolute;top:-8px;right:-4px}
.pcm-sm{display:inline-block;min-width:17px;height:17px;font-size:.6rem;line-height:13px;margin-left:7px;vertical-align:middle;position:static}
@keyframes pcmPulse{0%{box-shadow:0 0 0 0 rgba(255,90,90,.6)}70%{box-shadow:0 0 0 9px rgba(255,90,90,0)}100%{box-shadow:0 0 0 0 rgba(255,90,90,0)}}
@keyframes pcmIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

.pcm-ov{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;background:#0a0a0a; user-select:none;-webkit-user-select:none;animation:pcmIn .25s ease}
.pcm-card{display:flex;flex-direction:column;width:min(720px,100%);height:min(88vh,780px);box-sizing:border-box;background:linear-gradient(180deg,#181818,#0b0b0b);border:2px solid #d4af37;border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.85),0 0 44px rgba(212,175,55,.12);color:#fff;font-family:Verdana,"Open Sans",sans-serif;overflow:hidden}
.pcm-hd{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;border-bottom:1px solid rgba(212,175,55,.3);background:rgba(212,175,55,.04)}
.pcm-hd h2{margin:0;font:bold 1.6rem "Times New Roman",Times,serif;color:#f1d98a;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pcm-x{position:relative;flex:none;margin-left:10px;width:30px;height:30px;padding:0;border:1.5px solid #d4af37;border-radius:50%;background:none;cursor:pointer;transition:transform .3s,background .2s}
.pcm-x::before,.pcm-x::after{content:"";position:absolute;left:50%;top:50%;width:12px;height:2px;margin:-1px 0 0 -6px;border-radius:2px;background:#f1d98a;transition:background .2s}
.pcm-x::before{transform:rotate(45deg)}.pcm-x::after{transform:rotate(-45deg)}
.pcm-x:hover{transform:rotate(90deg);background:#d4af37}.pcm-x:hover::before,.pcm-x:hover::after{background:#111}
.pcm-tabs{display:flex;gap:6px;padding:8px 14px 0;border-bottom:1px solid rgba(212,175,55,.2);overflow-x:auto;scrollbar-width:none}
.pcm-tabs button{white-space:nowrap;background:none;border:0;border-bottom:2px solid transparent;color:#9a9a9a;font:bold .92rem Georgia,"Times New Roman",serif;padding:10px 14px;cursor:pointer;transition:color .2s}
.pcm-tabs button:hover{color:#fff}.pcm-tabs button.on{color:#f1d98a;border-color:#d4af37}
.pcm-pane{flex:1;min-height:0;display:flex;flex-direction:column;position:relative}
.pcm-list,.pcm-am{flex:1;min-height:0;overflow-y:auto;padding:14px 16px;scrollbar-width:thin;scrollbar-color:#b38b27 #0a0a0a;overscroll-behavior:contain}
.pcm-list{display:flex;flex-direction:column;gap:12px}
.pcm-empty,.pcm-mut{color:#8d8d8d;font-size:.82rem;text-align:center;padding:18px 6px;line-height:1.5}
.pcm-msg{display:flex;gap:10px;align-items:flex-start;position:relative;-webkit-touch-callout:none;transition:background .2s;padding:6px;border-radius:10px}
.pcm-av{flex:none;width:38px;height:38px;border-radius:50%;background:#444;overflow:hidden;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1rem}
.pcm-av img{width:100%;height:100%;object-fit:cover}
.pcm-av.sm{width:32px;height:32px;font-size:.9rem}
.pcm-mc{min-width:0;max-width:calc(100% - 50px);background:#161616;border:1px solid #2b2b2b;border-radius:4px 14px 14px 14px;padding:9px 12px;transition:background .3s,border-color .3s;}
.pcm-msg.mine .pcm-mc{border-color:#443f27}
.pcm-msg.adm .pcm-mc{border-color:rgba(212,175,55,.6);background:linear-gradient(180deg,#201b0b,#151209)}
.pcm-top{display:flex;align-items:center;flex-wrap:wrap;gap:4px 0;margin-bottom:4px}
.pcm-nm{font-size:.82rem;margin-right:8px;word-break:break-word}
.pcm-tm{color:#7d7d7d;font-size:.68rem}
.pcm-tm.ed{color:#caa016}
.pcm-adm{background:linear-gradient(135deg,#f1d98a,#b8901f);color:#111;font:bold .62rem Verdana,sans-serif;padding:2px 6px;border-radius:5px;margin-right:6px;letter-spacing:.07em}
.pcm-tx{font-size:.88rem;line-height:1.5;white-space:pre-wrap;word-break:break-word;user-select:text;-webkit-user-select:text}

/* MODO SELECCIÓN */
.pcm-msg.seleccionado .pcm-mc { border-color: #d4af37 !important; background: rgba(212,175,55,.15) !important; box-shadow: 0 0 10px rgba(212,175,55,.3); }
.pcm-sel-bar { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); background: #111; border: 1.5px solid #d4af37; border-radius: 12px; padding: 8px 14px; display: flex; gap: 10px; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 100; animation: pcmIn .2s ease; }
.pcm-sel-bar span { color: #f1d98a; font: bold .85rem Verdana, sans-serif; margin-right: 5px; }
.pcm-sel-btn { background: transparent; border: 1px solid #555; color: #fff; border-radius: 6px; padding: 6px 12px; cursor: pointer; font: bold .75rem Verdana, sans-serif; transition: all 0.2s; }
.pcm-sel-btn:hover { border-color: #d4af37; color: #f1d98a; }
.pcm-sel-btn.danger { color: #ff7b7b; border-color: #ff7b7b; }
.pcm-sel-btn.danger:hover { background: rgba(255,123,123,.15); }
.pcm-sel-btn.cancel { background: #333; border-color: #555; color: #ccc; }

@keyframes pcmBlink{0%,100%{background:transparent}50%{background:rgba(212,175,55,0.3)}}
.pcm-msg.highlight .pcm-mc{animation:pcmBlink 0.5s 3; border-color:#d4af37;}

.pcm-rep-box{background:rgba(212,175,55,.08);border-left:3px solid #d4af37;padding:6px 10px;margin-bottom:8px;border-radius:4px;font-size:.75rem;color:#bdbdbd;word-break:break-word;user-select:none;cursor:pointer;max-height:100px;overflow:hidden;}
.pcm-rep-box:hover{background:rgba(212,175,55,.15)}
.pcm-rep-box b{color:#f1d98a;display:block;margin-bottom:2px}

.pcm-img{display:block;max-width:100%;max-height:300px;margin-top:8px;border-radius:10px;border:1px solid #3a3a3a;cursor:zoom-in}
.pcm-video{display:block;max-width:100%;max-height:320px;margin-top:8px;border-radius:10px;background:#000}
.pcm-vid{margin-top:8px;background:#000;color:#f1d98a;border:1px solid #d4af37;border-radius:10px;padding:10px 14px;font:bold .85rem Georgia,serif;cursor:pointer}
.pcm-vid:hover{background:#d4af37;color:#111}

/* ACCIÓN RÁPIDA DE LIKE */
.pcm-ac{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.pcm-ac button{display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid #333;color:#9a9a9a;border-radius:8px;padding:4px 9px;font:inherit;font-size:.72rem;cursor:pointer;transition:border-color .15s,color .15s,background .15s}
.pcm-ac button:hover{border-color:#d4af37;color:#f1d98a}
.pcm-like.on{color:#f1d98a!important;border-color:#d4af37!important;background:rgba(212,175,55,.12)}

/* PULGAR ARRIBA HECHO EN CSS */
.pcm-th{position:relative;display:inline-block;width:20px;height:20px;flex:none}
.pcm-th::before{content:"";position:absolute;box-sizing:border-box;left:0;top:9px;width:6px;height:10px;border:2px solid currentColor;border-radius:2px}
.pcm-th::after{content:"";position:absolute;box-sizing:border-box;left:7px;top:8px;width:12px;height:11px;border:2px solid currentColor;border-radius:2px 2px 4px 4px}
.pcm-th i{position:absolute;box-sizing:border-box;left:9px;top:0;width:7px;height:11px;border:2px solid currentColor;border-bottom:0;border-radius:4px 4px 0 0;z-index:1}
.pcm-like.on .pcm-th::before,.pcm-like.on .pcm-th::after,.pcm-like.on .pcm-th i{background:currentColor}

/* MENÚ CONTEXTUAL */
.pcm-ctx{position:fixed;z-index:9999;background:linear-gradient(180deg,#1b1b1b,#131313);border:1px solid #d4af37;border-radius:10px;padding:6px;display:flex;flex-direction:column;min-width:150px;box-shadow:0 10px 30px rgba(0,0,0,.8);animation:pcmIn .15s ease}
.pcm-ctx button{background:none;border:0;color:#fff;padding:10px 14px;text-align:left;font:inherit;font-size:.85rem;cursor:pointer;border-radius:6px;transition:background .15s}
.pcm-ctx button:hover{background:rgba(212,175,55,.15)}
.pcm-ctx button.danger{color:#ff7b7b}
.pcm-ctx button.danger:hover{background:rgba(255,123,123,.15)}

.pcm-comp{border-top:1px solid rgba(212,175,55,.3);padding:12px 14px;background:#0f0f0f;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))}
.pcm-prev{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;font-size:.78rem;color:#f1d98a;word-break:break-all}
.pcm-prev button{background:none;border:0;color:#9a9a9a;text-decoration:underline;cursor:pointer;font:inherit;font-size:.75rem}

.pcm-rep-bar{display:flex;align-items:center;justify-content:space-between;background:#161616;border:1px solid #3a3a3a;border-bottom:0;border-radius:8px 8px 0 0;padding:8px 12px;font-size:.75rem;color:#bdbdbd;margin-bottom:-1px}
.pcm-rep-bar b{color:#f1d98a}
.pcm-rep-bar button{background:none;border:0;color:#9a9a9a;cursor:pointer;font:inherit;font-size:1.2rem;line-height:1;padding:0 4px}
.pcm-rep-bar button:hover{color:#ff7b7b}

.pcm-row{display:flex;align-items:flex-end;gap:8px}
.pcm-in{width:100%;box-sizing:border-box;background:#161616;border:1px solid #3a3a3a;border-radius:10px;color:#fff;font:inherit;font-size:.9rem;padding:10px;outline:0;user-select:text;-webkit-user-select:text}
.pcm-in:focus{border-color:#d4af37;box-shadow:0 0 0 3px rgba(212,175,55,.14)}
.pcm-row textarea{flex:1;resize:none;max-height:110px}
.pcm-clip{position:relative;flex:none;width:40px;height:40px;border-radius:50%;border:1.5px solid #d4af37;background:none;cursor:pointer;transition:background .2s}
.pcm-clip::before,.pcm-clip::after{content:"";position:absolute;left:50%;top:50%;background:#f1d98a;border-radius:2px;transition:background .2s}
.pcm-clip::before{width:14px;height:2px;margin:-1px 0 0 -7px}.pcm-clip::after{width:2px;height:14px;margin:-7px 0 0 -1px}
.pcm-clip:hover{background:#d4af37}.pcm-clip:hover::before,.pcm-clip:hover::after{background:#111}
.pcm-send{flex:none;border:1px solid #f1d98a;background:linear-gradient(135deg,#2b2107,#100c02);color:#fff;font:bold .95rem Georgia,serif;border-radius:10px;padding:10px 18px;cursor:pointer;transition:background .25s,color .2s}
.pcm-send:hover:not(:disabled){background:linear-gradient(135deg,#d4af37,#a67c12);color:#111}.pcm-send:disabled{opacity:.5;cursor:default}

.pcm-h3{margin:20px 0 8px;padding-bottom:5px;border-bottom:1px dashed rgba(212,175,55,.25);font:bold 1.05rem "Times New Roman",Times,serif;color:#f1d98a}
.pcm-h3:first-child{margin-top:0}
.pcm-srch{display:flex;gap:8px}
.pcm-per{display:flex;align-items:center;gap:10px;padding:8px 0}
.pcm-per .n{flex:1;min-width:0;font-weight:bold;font-size:.88rem;word-break:break-word}
.pcm-per .bs{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.pcm-b{background:#000;color:#fff;border:1px solid #4a4a4a;border-radius:8px;padding:8px 13px;font:.85rem Georgia,"Times New Roman",serif;cursor:pointer;transition:background-color .15s,color .15s}
.pcm-b:hover:not(:disabled){background:#fff;color:#000}.pcm-b:disabled{opacity:.55;cursor:default}
.pcm-b.no{background:#8c8c8c;color:#000;border-color:#8c8c8c}.pcm-b.no:hover:not(:disabled){background:#d2d2d2}

.pcm-dov{position:fixed;inset:0;z-index:320;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:pcmIn .2s ease;user-select:none;-webkit-user-select:none}
.pcm-dlg{width:min(430px,100%);max-height:92vh;overflow:auto;box-sizing:border-box;background:#141414;border:1px solid #3a3a3a;border-top:3px solid #d4af37;border-radius:14px;padding:24px 22px 18px;box-shadow:0 26px 70px rgba(0,0,0,.8);color:#fff;font-family:Verdana,"Open Sans",sans-serif}
.pcm-dlg h3{margin:0 0 10px;font:bold 1.5rem "Times New Roman",Times,serif;line-height:1.2}
.pcm-dlg p{margin:0 0 16px;font-size:.82rem;line-height:1.6;color:#bdbdbd}
.pcm-dlg .pcm-b{display:block;width:100%;box-sizing:border-box;margin-top:9px;padding:13px 12px;font-size:1rem}
.pcm-dlg textarea{margin-top:10px;resize:vertical}
.pcm-opt{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;text-align:left;background:#161616;border:1px solid #2b2b2b;border-radius:10px;padding:11px 12px;margin-top:8px;color:#fff;font:inherit;font-size:.82rem;line-height:1.4;cursor:pointer;transition:border-color .15s,background .15s}
.pcm-opt:hover{border-color:#4a4326}
.pcm-opt .rd{flex:none;width:16px;height:16px;box-sizing:border-box;border-radius:50%;border:2px solid #5a5a5a}
.pcm-opt.on{border-color:#d4af37;background:rgba(212,175,55,.08)}
.pcm-opt.on .rd{border-color:#d4af37;background:radial-gradient(circle,#d4af37 3.5px,transparent 4px)}
.pcm-viz img{max-width:92vw;max-height:88vh;border:2px solid #d4af37;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.8)}

.pcm-ts{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:340;display:flex;flex-direction:column;gap:8px;width:min(430px,calc(100vw - 24px));pointer-events:none}
.pcm-t{pointer-events:auto;box-sizing:border-box;padding:12px 16px;background:rgba(20,20,20,.97);border:1px solid #d4af37;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.6);font:.82rem/1.5 Verdana,"Open Sans",sans-serif;color:#fff;cursor:pointer;animation:pcmIn .25s ease}
.pcm-t.err{border:2px solid #a33; background: #3b0e0e; color: #ffb3b3; box-shadow: 0 0 15px rgba(163,51,51,.5); font-weight: bold;}

@media (max-width:600px){
 .pcm-ov{padding:0}.pcm-card{height:100%;border-radius:0;border-width:0}
 .pcm-hd{padding:calc(12px + env(safe-area-inset-top,0px)) 14px 12px}
 .pcm-list,.pcm-am{padding:12px 10px}
 .pcm-comp{padding:10px 10px calc(10px + env(safe-area-inset-bottom,0px))}
 .pcm-in,.pcm-row textarea{font-size:16px} 
 .pcm-send{padding:10px 14px}
 .pcm-mc{max-width:calc(100% - 46px);padding:8px 10px}
 .pcm-av{width:34px;height:34px}
 .pcm-img{max-height:240px}
 .pcm-video{max-height:260px}
 .pcm-tabs button{flex:1;padding:12px 8px}
 .pcm-per{flex-wrap:wrap}
 .pcm-per .n{flex:1 1 calc(100% - 50px)}
 .pcm-per .bs{flex:1 1 100%;justify-content:flex-start}
 .pcm-dov{padding:10px;align-items:flex-end}
 .pcm-dlg{padding:20px 16px calc(14px + env(safe-area-inset-bottom,0px));border-radius:14px 14px 0 0}
 .pcm-dlg textarea,.pcm-dlg .pcm-in{font-size:16px}
 .pcm-viz{align-items:center}
 .pcm-ts{top:calc(10px + env(safe-area-inset-top,0px))}
 .pcm-sel-bar{width:90%;bottom:70px;justify-content:center;flex-wrap:wrap;gap:6px;}
}
@media (max-height:480px) and (orientation:landscape){
 .pcm-hd{padding:6px 14px}
 .pcm-hd h2{font-size:1.15rem}
 .pcm-tabs button{padding:6px 12px}
}
`;

/* ------------------------------ UTILIDADES ------------------------------ */
const $ = s => document.querySelector(s);
function h(t, c, x) { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
const okFoto = f => (typeof f === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(f)) ? f : '';
const tms = m => (m.ts && m.ts.toMillis) ? m.ts.toMillis() : Date.now();
const miNombre = () => window.Pichisoft && window.Pichisoft.user ? window.Pichisoft.user.name : '';
const errTxt = e => e && e.code === 'permission-denied' ? 'No tenés permiso para hacer eso (revisá que tu cuenta esté habilitada).'
    : e && e.code === 'unavailable' ? 'El servicio no está disponible ahora. Probá de nuevo.'
        : (e && e.message) || 'Ocurrió un error inesperado.';
const leer = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(new Error('No se pudo leer el archivo.')); r.readAsDataURL(f); });

function aviso(t, tipo) {
    let c = $('.pcm-ts'); if (!c) { c = h('div', 'pcm-ts'); document.body.append(c); }
    const d = h('div', 'pcm-t' + (tipo === 'err' ? ' err' : ''), t);
    d.onclick = () => d.remove(); c.append(d); setTimeout(() => d.remove(), 4200);
}

function dialogo(titulo, build, alCerrar, extra) {
    const o = h('div', 'pcm-dov' + (extra ? ' ' + extra : '')), b = h('div', 'pcm-dlg');
    b.setAttribute('role', 'dialog'); b.setAttribute('aria-modal', 'true');
    if (titulo) b.append(h('h3', '', titulo));
    o.append(b);
    const esc = e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); cerrar(); } };
    function cerrar() { document.removeEventListener('keydown', esc, true); o.remove(); if (alCerrar) alCerrar(); }
    document.addEventListener('keydown', esc, true);
    o.onclick = e => { if (e.target === o) cerrar(); };
    build(b, cerrar); document.body.append(o); return cerrar;
}
function confirmar(titulo, texto, okTxt) {
    return new Promise(res => {
        let r = false;
        dialogo(titulo, (b, c) => {
            b.append(h('p', '', texto));
            const s = h('button', 'pcm-b', okTxt), n = h('button', 'pcm-b no', 'Cancelar');
            s.onclick = () => { r = true; c(); }; n.onclick = c; b.append(s, n);
        }, () => res(r));
    });
}

/* ------------------------------ ESTADO ------------------------------ */
let uid = null, unsubs = [], dmUnsub = null, msgs = [], dmMsgs = [], reqIn = [], reqOut = [], seen = null;
let btn = null, dotFab = null, panel = null, tab = 'chat';
let lista, vacio, paneChat, paneAm, listaAm, resBusq, ta, sendBtn, prevBox, adj = null, enviando = false, ultimo = 0;
let replyTo = null, replyBar = null, replyName = null, replyTxt = null;
let modoDM = false, dmUid = null, dmName = '';
let ctx = null;
let vvFn = null;
let modoSeleccion = false;
const seleccionados = new Set();
const els = new Map(), perfiles = {};
let firma = '';
const esAdm = () => ADMINS.includes(uid);

const perfil = id => perfiles[id] || (perfiles[id] = getDoc(doc(db, 'public_profiles', id)).then(s => s.exists() ? s.data() : {}).catch(() => ({})));
function avatar(id, nombre, cls) {
    const a = h('div', 'pcm-av' + (cls ? ' ' + cls : ''), String(nombre || '?')[0].toUpperCase());
    perfil(id).then(p => { if (okFoto(p.photo)) { const i = h('img'); i.src = p.photo; i.alt = ''; a.textContent = ''; a.append(i); } });
    return a;
}
async function syncPerfil() {
    const u = window.Pichisoft && window.Pichisoft.user; if (!u || !uid) return;
    const photo = (okFoto(u.photo) && u.photo.length <= 300000) ? u.photo : '';
    const f = u.name + '|' + photo.length + '|' + uid; if (f === firma) return;
    try {
        await setDoc(doc(db, 'public_profiles', uid), { username: u.name, lc: u.name.toLowerCase(), photo: photo || '' });
        firma = f;
        perfiles[uid] = Promise.resolve({ username: u.name, photo: photo || '' });
    } catch (e) { console.error('Error sync profile', e); }
}

/* ------------------------------ ACTIVAR / DESACTIVAR ------------------------------ */
const activo = () => !!(window.Pichisoft && window.Pichisoft.user && auth.currentUser);

function refresh() {
    if (activo()) {
        crearBoton(); btn.classList.add('on');
        if (uid !== auth.currentUser.uid) {
            parar();
            uid = auth.currentUser.uid;
            syncPerfil().catch(e => console.error(e));
            iniciar();
        }
    } else {
        parar(); uid = null; cerrarPanel(); if (btn) btn.classList.remove('on');
    }
}
function parar() {
    unsubs.forEach(f => { try { f(); } catch { } }); unsubs = [];
    if (dmUnsub) { try { dmUnsub(); } catch { } dmUnsub = null; }
    msgs = []; dmMsgs = []; reqIn = []; reqOut = []; seen = null; firma = '';
    Object.keys(perfiles).forEach(k => delete perfiles[k]);
    if (dotFab) dotFab.hidden = true;
}
function iniciar() {
    const v = localStorage.getItem(KS + uid); seen = v === null ? null : +v;
    unsubs.push(onSnapshot(query(collection(db, 'community_messages'), orderBy('ts', 'desc'), limit(60)), s => {
        msgs = s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })).reverse();
        if (seen === null) { seen = msgs.reduce((a, m) => Math.max(a, tms(m)), 0); localStorage.setItem(KS + uid, String(seen)); }
        if (panel && tab === 'chat' && !modoDM) { pintarChat(); marcarVisto(); }
        actualizarBadge();
    }, e => console.error('community_messages', e)));
    unsubs.push(onSnapshot(query(collection(db, 'friend_requests'), where('to', '==', uid)), s => {
        reqIn = s.docs.map(d => ({ id: d.id, ...d.data() })); cambioAmigos();
    }, e => console.error('friend_requests in', e)));
    unsubs.push(onSnapshot(query(collection(db, 'friend_requests'), where('from', '==', uid)), s => {
        reqOut = s.docs.map(d => ({ id: d.id, ...d.data() })); cambioAmigos();
    }, e => console.error('friend_requests out', e)));
}
function cambioAmigos() { if (panel) { pintarAmigos(); if (tab === 'chat' && !modoDM) pintarChat(); } actualizarBadge(); }
function marcarVisto() {
    const mx = msgs.filter(m => m.uid !== uid).reduce((a, m) => Math.max(a, tms(m)), seen || 0);
    if (mx !== seen) { seen = mx; try { localStorage.setItem(KS + uid, String(mx)); } catch { } }
    actualizarBadge();
}
function actualizarBadge() {
    const nm = msgs.filter(m => m.uid !== uid && tms(m) > (seen || 0)).length;
    const nr = reqIn.filter(r => r.status === 'pending').length;
    const n = nm + nr;
    if (dotFab) { dotFab.hidden = !n; dotFab.textContent = n > 9 ? '9+' : String(n); }
    if (panel) {
        const d1 = panel.querySelector('[data-t="chat"] .pcm-dot'), d2 = panel.querySelector('[data-t="amigos"] .pcm-dot');
        d1.hidden = !nm; d1.textContent = nm > 9 ? '9+' : nm; d2.hidden = !nr; d2.textContent = nr > 9 ? '9+' : nr;
    }
}

/* ------------------------------ BOTÓN ------------------------------ */
function crearBoton() {
    if (btn) return;
    const st = h('style'); st.textContent = CSS; document.head.append(st);
    btn = h('button'); btn.type = 'button'; btn.setAttribute('aria-label', 'Mensajería');
    btn.innerHTML = 'Mensajería';
    btn.onclick = abrir;

    const topbar = document.getElementById('pichisoft-topbar');
    if (topbar) {
        topbar.appendChild(btn);
    } else {
        btn.className = 'pcm-fab';
        btn.innerHTML = '<span class="pcm-ic"></span><span>Mensajería</span><b class="pcm-dot" hidden></b>';
        dotFab = btn.querySelector('.pcm-dot');
        document.body.append(btn);
    }
}

/* ------------------------------ PANEL ------------------------------ */
const onEsc = e => { if (e.key === 'Escape' && panel && !$('.pcm-dov') && !ctx) cerrarPanel(); };
function abrir() {
    if (panel || !uid) return;
    syncPerfil().catch(e => console.error(e));
    panel = h('div', 'pcm-ov');
    panel.innerHTML = `<div class="pcm-card" role="dialog" aria-modal="true" aria-label="Mensajería">
 <div class="pcm-hd">
   <button class="pcm-b" id="pcmDmBack" style="display:none; border:0; padding:0 10px 0 0; background:none; color:#f1d98a; font-size:1.5rem; cursor:pointer;" title="Volver">←</button>
   <h2 id="pcmHdTitle">Mensajería</h2>
   <button class="pcm-x" type="button" aria-label="Cerrar" title="Cerrar"></button>
 </div>
 <div class="pcm-tabs" id="pcmTabs"><button type="button" data-t="chat">Chat<b class="pcm-dot pcm-sm" hidden></b></button><button type="button" data-t="amigos">Amigos<b class="pcm-dot pcm-sm" hidden></b></button></div>
 <div class="pcm-pane" id="pcmChat">
  <div class="pcm-sel-bar" id="pcmSelBar" hidden>
    <span id="pcmSelCount">0 seleccionados</span>
    <button class="pcm-sel-btn" onclick="accionLote('reportar')">Reportar</button>
    <button class="pcm-sel-btn" onclick="accionLote('editar')">Editar</button>
    <button class="pcm-sel-btn danger" onclick="accionLote('eliminar')">Eliminar</button>
    <button class="pcm-sel-btn cancel" onclick="cancelarSeleccion()">Cancelar</button>
  </div>
  <div class="pcm-list"><div class="pcm-empty">Todavía no hay mensajes. ¡Escribí el primero!</div></div>
  <div class="pcm-comp">
   <div class="pcm-prev" hidden><span></span><button type="button">Quitar</button></div>
   <div class="pcm-rep-bar" hidden>
       <span>Respondiendo a <b class="pcm-rep-nm"></b>: <span class="pcm-rep-tx"></span></span>
       <button type="button" class="pcm-rep-cancel" title="Cancelar respuesta">×</button>
   </div>
   <div class="pcm-row">
    <button class="pcm-clip" type="button" title="Adjuntar foto o video" aria-label="Adjuntar foto o video" hidden></button>
    <input type="file" accept="image/*,video/mp4,video/webm" hidden>
    <textarea class="pcm-in" rows="1" maxlength="500" placeholder="Escribí un mensaje…"></textarea>
    <button class="pcm-send" type="button">Enviar</button>
   </div>
  </div>
 </div>
 <div class="pcm-pane" id="pcmAm" hidden><div class="pcm-am">
  <div class="pcm-h3">Buscar usuario</div>
  <div class="pcm-srch"><input class="pcm-in" type="text" maxlength="20" placeholder="Nombre de usuario exacto" autocomplete="off"><button class="pcm-b" type="button">Buscar</button></div>
  <div id="pcmRes"></div><div id="pcmListaAm"></div>
 </div></div></div>`;
    document.body.append(panel);
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onEsc);
    const vv = window.visualViewport;
    if (vv) {
        vvFn = () => {
            if (!panel) return;
            panel.style.bottom = 'auto';
            panel.style.height = vv.height + 'px';
            panel.style.top = vv.offsetTop + 'px';
            if (tab === 'chat' && lista && document.activeElement === ta) lista.scrollTop = lista.scrollHeight;
        };
        vv.addEventListener('resize', vvFn);
        vv.addEventListener('scroll', vvFn);
        vvFn();
    }

    lista = panel.querySelector('.pcm-list'); vacio = lista.firstChild;
    paneChat = panel.querySelector('#pcmChat'); paneAm = panel.querySelector('#pcmAm');
    listaAm = panel.querySelector('#pcmListaAm'); resBusq = panel.querySelector('#pcmRes');
    ta = panel.querySelector('textarea'); sendBtn = panel.querySelector('.pcm-send'); prevBox = panel.querySelector('.pcm-prev');

    replyBar = panel.querySelector('.pcm-rep-bar');
    replyName = panel.querySelector('.pcm-rep-nm');
    replyTxt = panel.querySelector('.pcm-rep-tx');
    panel.querySelector('.pcm-rep-cancel').onclick = limpiarReply;

    const clip = panel.querySelector('.pcm-clip'), fi = panel.querySelector('input[type=file]');

    panel.addEventListener('click', e => { if (e.target === panel) cerrarPanel(); });
    panel.querySelector('.pcm-x').onclick = cerrarPanel;
    panel.querySelectorAll('.pcm-tabs button').forEach(b => b.onclick = () => setTab(b.dataset.t));
    panel.querySelector('#pcmDmBack').onclick = () => setTab('amigos');
    ta.addEventListener('focus', () => setTimeout(() => { lista.scrollTop = lista.scrollHeight; }, 300));
    ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 110) + 'px'; });

    ta.addEventListener('keydown', e => {
        if (e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) e.stopImmediatePropagation();
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
    });

    ta.addEventListener('paste', async e => {
        if (!esAdm() && !modoDM) return;
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const blob = items[i].getAsFile();
                if (blob.type.startsWith('image/') || blob.type.startsWith('video/')) {
                    if (blob.type.startsWith('video/') && blob.size > MAX_VIDEO) return aviso('El video pesa demasiado (máximo 6 MB).', 'err');
                    adj = blob;
                    prevBox.hidden = false;
                    prevBox.firstChild.textContent = (blob.type.startsWith('video/') ? 'Video: ' : 'Foto: ') + 'Pegado';
                    e.preventDefault();
                    return;
                }
            }
        }
    });

    sendBtn.onclick = enviar;

    if (esAdm()) {
        clip.hidden = false; clip.onclick = () => fi.click();
        fi.onchange = () => {
            const f = fi.files[0]; fi.value = ''; if (!f) return;
            const img = f.type.startsWith('image/'), vid = ['video/mp4', 'video/webm'].includes(f.type);
            if (!img && !vid) return aviso('Formato no soportado. Usá una foto, un MP4 o un WebM.', 'err');
            if (vid && f.size > MAX_VIDEO) return aviso('El video pesa demasiado (máximo 6 MB).', 'err');
            adj = f; prevBox.hidden = false; prevBox.firstChild.textContent = (vid ? 'Video: ' : 'Foto: ') + f.name;
        };
    }
    // ESTO VA AFUERA, PARA QUE FUNCIONE SIEMPRE:
    prevBox.querySelector('button').onclick = limpiarAdj;

    const inp = panel.querySelector('.pcm-srch input'), bb = panel.querySelector('.pcm-srch button');
    bb.onclick = () => buscar(inp.value);
    inp.addEventListener('keydown', e => {
        if (e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) e.stopImmediatePropagation();
        if (e.key === 'Enter') buscar(inp.value);
    });

    pintarAmigos(); setTab('chat');
}
function cerrarPanel() {
    if (!panel) return;
    if (window.visualViewport && vvFn) {
        window.visualViewport.removeEventListener('resize', vvFn);
        window.visualViewport.removeEventListener('scroll', vvFn);
        vvFn = null;
    }
    pararDM();
    cancelarSeleccion();
    panel.remove(); panel = null; els.clear(); adj = null;
    document.documentElement.style.overflow = ''; document.removeEventListener('keydown', onEsc);
    actualizarBadge();
    if (ctx) { ctx.remove(); ctx = null; }
}
function setTab(t) {
    if (t !== 'chat') { pararDM(); cancelarSeleccion(); }
    tab = t;
    panel.querySelectorAll('.pcm-tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    paneChat.hidden = t !== 'chat'; paneAm.hidden = t !== 'amigos';
    if (t === 'chat') { pintarChat(); marcarVisto(); lista.scrollTop = lista.scrollHeight; } else pintarAmigos();
    actualizarBadge();
}
function limpiarAdj() { adj = null; if (prevBox) prevBox.hidden = true; }
function limpiarReply() { replyTo = null; if (replyBar) replyBar.hidden = true; }

function abrirDM(otherUid, otherName) {
    modoDM = true;
    dmUid = otherUid;
    dmName = otherName;
    panel.querySelector('.pcm-hd h2').textContent = 'Chat con ' + otherName;
    panel.querySelector('#pcmDmBack').style.display = 'block';
    panel.querySelector('.pcm-tabs').style.display = 'none';
    paneChat.hidden = false;
    paneAm.hidden = true;
    cancelarSeleccion();

    limpiarAdj();
    limpiarReply();
    ta.value = '';
    ta.style.height = 'auto';

    els.clear();
    lista.innerHTML = '';
    lista.append(vacio);

    if (dmUnsub) dmUnsub();
    const chatId = [uid, otherUid].sort().join('_');

    dmUnsub = onSnapshot(query(collection(db, 'private_messages'), where('chatId', '==', chatId), limit(100)), s => {
        dmMsgs = s.docs.map(d => {
            const x = d.data();
            return { id: d.id, uid: x.from, n: x.n || (x.from === uid ? miNombre() : dmName), t: x.t, ts: x.ts, likes: x.likes, media: x.media, replyTo: x.replyTo, edited: x.edited };
        }).sort((a, b) => tms(a) - tms(b));
        if (panel && modoDM) { pintarChat(); lista.scrollTop = lista.scrollHeight; }
    }, e => console.error('private_messages', e));

    pintarChat();
}

function pararDM() {
    if (!modoDM) return;
    modoDM = false;
    dmUid = null;
    if (dmUnsub) { dmUnsub(); dmUnsub = null; }
    dmMsgs = [];
    if (panel) {
        panel.querySelector('.pcm-hd h2').textContent = 'Mensajería';
        panel.querySelector('#pcmDmBack').style.display = 'none';
        panel.querySelector('.pcm-tabs').style.display = 'flex';
        paneChat.hidden = false;
        paneAm.hidden = true;
        els.clear();
        lista.innerHTML = '';
        lista.append(vacio);
        limpiarAdj();
        limpiarReply();
        ta.value = '';
        ta.style.height = 'auto';
        pintarChat();
        lista.scrollTop = lista.scrollHeight;
    }
}

function citar(m) {
    replyTo = m;
    replyBar.hidden = false;
    replyName.textContent = m.n || '?';
    replyTxt.textContent = m.t ? (m.t.length > 40 ? m.t.slice(0, 40) + '…' : m.t) : '[Multimedia]';
    ta.focus();
}

/* ------------------------------ SELECCIÓN MÚLTIPLE ------------------------------ */
function iniciarSeleccion(m) {
    modoSeleccion = true;
    seleccionados.clear();
    seleccionados.add(m.id);
    actualizarSeleccionUI();
}
function toggleSeleccion(m) {
    if (seleccionados.has(m.id)) seleccionados.delete(m.id);
    else seleccionados.add(m.id);
    if (seleccionados.size === 0) cancelarSeleccion();
    else actualizarSeleccionUI();
}
function cancelarSeleccion() {
    modoSeleccion = false;
    seleccionados.clear();
    actualizarSeleccionUI();
}
function actualizarSeleccionUI() {
    const bar = $('#pcmSelBar');
    if (bar) {
        bar.hidden = !modoSeleccion;
        if (modoSeleccion) $('#pcmSelCount').textContent = seleccionados.size + ' seleccionados';
    }
    const arr = modoDM ? dmMsgs : msgs;
    arr.forEach(m => {
        const el = document.getElementById('msg-' + m.id);
        if (el) el.classList.toggle('seleccionado', seleccionados.has(m.id));
    });
}

window.cancelarSeleccion = cancelarSeleccion;
window.accionLote = async (tipo) => {
    const arr = modoDM ? dmMsgs : msgs;
    const sel = arr.filter(m => seleccionados.has(m.id));
    if (!sel.length) return;

    if (tipo === 'reportar') {
        if (sel.some(m => m.uid === uid)) return aviso('No puedes reportar a tus propios mensajes.', 'err');
        reportarLote(sel);
    }
    else if (tipo === 'editar') {
        if (sel.some(m => m.uid !== uid) && !esAdm()) return aviso('Solo los admins pueden editar mensajes de otros usuarios.', 'err');
        if (modoDM) return aviso('No podés editar mensajes privados.', 'err');
        editarLote(sel);
    }
    else if (tipo === 'eliminar') {
        if (sel.some(m => m.uid !== uid) && !esAdm()) return aviso('Solo los admins pueden eliminar mensajes de otros usuarios.', 'err');
        eliminarLote(sel);
    }
};

/* ------------------------------ CHAT ------------------------------ */
function fecha(m) {
    const d = new Date(tms(m)), hh = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === new Date().toDateString() ? hh : d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) + ' ' + hh;
}
function rel(o) {
    for (const r of [...reqIn, ...reqOut]) {
        if (r.from !== o && r.to !== o) continue;
        if (r.status === 'accepted') return 'amigo';
        if (r.from === uid) return 'enviada';
        if (r.status === 'pending') return 'recibida';
    }
    return '';
}
function pintarLike(b, m) {
    if (!b) return;
    const l = m.likes || {}, n = Object.keys(l).length, on = !!l[uid];
    b.classList.toggle('on', on); b.lastChild.textContent = n ? String(n) : ''; b.onclick = (e) => { e.stopPropagation(); like(m, on); };
}
function mediaEl(m) {
    const md = m.media;
    if (md.k === 'img' && /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(md.d || '')) {
        const i = h('img', 'pcm-img'); i.src = md.d; i.alt = ''; i.onclick = () => verImg(md.d); return i;
    }
    if (md.k === 'vid') {
        const b = h('button', 'pcm-vid', 'Reproducir video'); b.type = 'button';
        b.onclick = async () => {
            b.disabled = true; b.textContent = 'Cargando…';
            try {
                const s = await getDocs(collection(db, modoDM ? 'private_messages' : 'community_messages', m.id, 'chunks'));
                const partes = s.docs.sort((a, c) => a.id < c.id ? -1 : 1).map(d => Uint8Array.from(atob(d.data().d), c => c.charCodeAt(0)));
                const v = h('video', 'pcm-video'); v.controls = true; v.playsInline = true;
                v.src = URL.createObjectURL(new Blob(partes, { type: md.mime || 'video/mp4' }));
                b.replaceWith(v); v.play().catch(() => { });
            } catch (e) { b.disabled = false; b.textContent = 'Reproducir video'; aviso('No se pudo cargar el video.', 'err'); }
        };
        return b;
    }
    return h('span');
}
function verImg(src) {
    dialogo('', (b, c) => { b.style.cssText = 'background:none;border:0;padding:0;box-shadow:none;width:auto;max-width:100%'; const i = h('img'); i.src = src; i.alt = ''; i.onclick = c; b.append(i); }, null, 'pcm-viz');
}

function mostrarCtx(x, y, m) {
    if (ctx) ctx.remove();
    ctx = h('div', 'pcm-ctx');
    ctx.style.cssText = `top:${Math.max(8, Math.min(y, innerHeight - 220))}px;left:${Math.max(8, Math.min(x, innerWidth - 170))}px;`;

    const addBtn = (txt, fn, color) => {
        const b = h('button', color || '', txt);
        b.onclick = (e) => { e.stopPropagation(); fn(); ctx.remove(); ctx = null; };
        ctx.append(b);
    };

    addBtn('Seleccionar', () => iniciarSeleccion(m));
    addBtn('Responder', () => citar(m));

    if (m.uid !== uid) {
        addBtn('Reportar', () => reportar(m), 'danger');
    }
    if (m.uid === uid || esAdm()) {
        addBtn('Editar', () => editar(m));
        addBtn('Eliminar', () => borrar(m), 'danger');
    }

    document.body.append(ctx);
    setTimeout(() => {
        const cerrarCtx = e => {
            if (ctx && ctx.contains(e.target)) return;
            if (ctx) { ctx.remove(); ctx = null; }
            document.removeEventListener('pointerdown', cerrarCtx, true);
        };
        document.addEventListener('pointerdown', cerrarCtx, true);
    }, 10);
}

function burbuja(m) {
    const mine = m.uid === uid, adm = ADMINS.includes(m.uid);
    const d = h('div', 'pcm-msg' + (mine ? ' mine' : '') + (adm ? ' adm' : ''));
    d.id = 'msg-' + m.id;
    d.append(avatar(m.uid, m.n));

    const c = h('div', 'pcm-mc'), top = h('div', 'pcm-top');
    if (adm) top.append(h('span', 'pcm-adm', 'ADMIN'));
    const tm = h('time', 'pcm-tm', fecha(m));
    top.append(h('b', 'pcm-nm', m.n || '?'), tm);
    if (m.edited) {
        const marca = h('span', 'pcm-tm ed', m.editedBy && m.editedBy !== m.uid ? ' · editado por admin' : ' · editado');
        top.append(marca);
    }
    c.append(top);

    if (m.replyTo) {
        const rb = h('div', 'pcm-rep-box');
        rb.innerHTML = `<b>${String(m.replyTo.n).replace(/</g, '&lt;')}</b>${String(m.replyTo.t).replace(/</g, '&lt;')}`;
        rb.onclick = (e) => {
            e.stopPropagation();
            const orig = document.getElementById('msg-' + m.replyTo.id);
            if (orig) {
                orig.scrollIntoView({ behavior: 'smooth', block: 'center' });
                orig.classList.add('highlight');
                setTimeout(() => orig.classList.remove('highlight'), 1600);
            } else {
                aviso('El mensaje original ya no está disponible.', 'err');
            }
        };
        c.append(rb);
    }

    if (m.t) c.append(h('div', 'pcm-tx', m.t));
    if (m.media) c.append(mediaEl(m));

    // BOTÓN DE LIKE CSS
    const ac = h('div', 'pcm-ac');
    const lb = h('button', 'pcm-like'); lb.type = 'button'; lb.title = 'Me gusta';
    lb.innerHTML = '<span class="pcm-th"><i></i></span>'; lb.append(h('span', '', ''));
    ac.append(lb);
    pintarLike(lb, m);
    c.append(ac);

    // CLICK PARA SELECCIONAR O ACCIONES
    d.onclick = (e) => {
        if (modoSeleccion) {
            if (e.target.closest('button')) return; // Ignorar si clickeó un botón (like)
            toggleSeleccion(m);
        }
    };

    // MENÚ CONTEXTUAL
    let pressTimer;
    d.onpointerdown = e => {
        if (modoSeleccion || e.button === 2) return;
        pressTimer = setTimeout(() => mostrarCtx(e.clientX, e.clientY, m), 600);
    };
    d.onpointerup = () => clearTimeout(pressTimer);
    d.onpointercancel = () => clearTimeout(pressTimer);
    d.onpointerleave = () => clearTimeout(pressTimer);
    d.oncontextmenu = e => {
        e.preventDefault();
        if (!modoSeleccion) mostrarCtx(e.clientX, e.clientY, m);
    };

    d.append(c); return d;
}

function pintarChat() {
    if (!lista) return;
    const arr = modoDM ? dmMsgs : msgs;
    const cerca = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 90;
    const ids = new Set(arr.map(m => m.id));
    for (const [id, x] of els) if (!ids.has(id)) { x.el.remove(); els.delete(id); }
    arr.forEach(m => {
        const sig = (m.t || '') + '|' + (m.edited ? 'E' + (m.editedBy || '') : '') + '|'
            + (m.replyTo ? 'R' + m.replyTo.id : '') + '|'
            + (m.media ? m.media.k + (m.media.n || '') : '') + '|' + rel(m.uid) + '|' + JSON.stringify(m.likes || {});
        let x = els.get(m.id);
        if (!x || x.sig !== sig) {
            const el = burbuja(m);
            if (x) x.el.replaceWith(el); else lista.append(el);
            x = { el, sig }; els.set(m.id, x);
        }
    });
    vacio.hidden = arr.length > 0;
    if (cerca) lista.scrollTop = lista.scrollHeight;
    actualizarSeleccionUI();
}

async function like(m, on) {
    try { await updateDoc(doc(db, modoDM ? 'private_messages' : 'community_messages', m.id), { ['likes.' + uid]: on ? deleteField() : true }); }
    catch (e) { aviso(errTxt(e), 'err'); }
}
async function borrar(m) {
    if (!await confirmar('¿Eliminar mensaje?', 'Esta acción no se puede deshacer.', 'Eliminar mensaje')) return;
    try {
        const col = modoDM ? 'private_messages' : 'community_messages';
        if (m.media && m.media.k === 'vid' && esAdm())
            for (let i = 0; i < (m.media.n || 0); i++) await deleteDoc(doc(db, col, m.id, 'chunks', String(i).padStart(3, '0'))).catch(() => { });
        await deleteDoc(doc(db, col, m.id)); aviso('Mensaje eliminado.');
    } catch (e) { aviso(errTxt(e), 'err'); }
}

function editar(m) {
    if (modoDM) return aviso('No podés editar mensajes privados.', 'err');
    dialogo('Editar mensaje', (b, c) => {
        b.append(h('p', '', 'Modificá el texto del mensaje. Quedará marcado como editado para todos.'));
        const d = h('textarea', 'pcm-in');
        d.rows = 4; d.maxLength = 500; d.value = m.t || '';
        b.append(d);

        const ok = h('button', 'pcm-b', 'Guardar cambios');
        const no = h('button', 'pcm-b no', 'Cancelar');
        no.onclick = c;

        ok.onclick = async () => {
            const txt = d.value.trim();
            if (!txt && !m.media) { aviso('El mensaje no puede quedar vacío.', 'err'); return; }
            if (txt === (m.t || '')) { c(); return; }

            ok.disabled = true; no.disabled = true;
            try {
                await updateDoc(doc(db, 'community_messages', m.id), {
                    t: txt,
                    edited: true,
                    editedBy: uid,
                    editedAt: serverTimestamp()
                });
                c();
                aviso(esAdm() && m.uid !== uid ? 'Mensaje editado (como admin).' : 'Mensaje editado.');
            } catch (e) {
                ok.disabled = false; no.disabled = false;
                aviso(errTxt(e), 'err');
            }
        };

        b.append(ok, no);
        d.focus();
        d.setSelectionRange(d.value.length, d.value.length);
    });
}

/* ------------------------------ ACCIONES EN LOTE ------------------------------ */
function editarLote(sel) {
    dialogo('Editar ' + sel.length + ' mensajes', (b, c) => {
        b.append(h('p', '', 'Modificá el texto. Se aplicará a todos los mensajes seleccionados.'));
        const d = h('textarea', 'pcm-in');
        d.rows = 4; d.maxLength = 500;
        // Si todos tienen el mismo texto, lo precargamos
        const unico = sel.every(m => m.t === sel[0].t);
        if (unico) d.value = sel[0].t || '';
        b.append(d);

        const ok = h('button', 'pcm-b', 'Guardar cambios');
        const no = h('button', 'pcm-b no', 'Cancelar');
        no.onclick = c;

        ok.onclick = async () => {
            const txt = d.value.trim();
            if (!txt && !sel.every(m => m.media)) { aviso('Los mensajes sin multimedia no pueden quedar vacíos.', 'err'); return; }

            ok.disabled = true; no.disabled = true;
            try {
                const batch = writeBatch(db);
                sel.forEach(m => {
                    batch.update(doc(db, 'community_messages', m.id), {
                        t: txt, edited: true, editedBy: uid, editedAt: serverTimestamp()
                    });
                });
                await batch.commit();
                c();
                cancelarSeleccion();
                aviso(sel.length + ' mensajes editados.');
            } catch (e) {
                ok.disabled = false; no.disabled = false;
                aviso(errTxt(e), 'err');
            }
        };

        b.append(ok, no);
        d.focus();
        d.setSelectionRange(d.value.length, d.value.length);
    });
}

async function eliminarLote(sel) {
    if (!await confirmar('¿Eliminar ' + sel.length + ' mensajes?', 'Esta acción no se puede deshacer.', 'Eliminar mensajes')) return;
    try {
        const col = modoDM ? 'private_messages' : 'community_messages';
        const batch = writeBatch(db);
        sel.forEach(m => {
            batch.delete(doc(db, col, m.id));
        });
        await batch.commit();
        cancelarSeleccion();
        aviso(sel.length + ' mensajes eliminados.');
    } catch (e) { aviso(errTxt(e), 'err'); }
}

function reportarLote(sel) {
    let motivo = '';
    dialogo('Reportar ' + sel.length + ' mensajes', (b, c) => {
        b.append(h('p', '', 'Elegí el motivo del reporte para todos los mensajes seleccionados.'));
        const opts = MOTIVOS.map(([k, t]) => {
            const o = h('button', 'pcm-opt'); o.type = 'button'; o.append(h('span', 'rd'), h('span', '', t));
            o.onclick = () => { motivo = k; opts.forEach(x => x.classList.toggle('on', x === o)); ok.disabled = false; };
            b.append(o); return o;
        });
        const d = h('textarea', 'pcm-in'); d.rows = 3; d.maxLength = 500; d.placeholder = 'Contanos más (opcional)'; b.append(d);
        const ok = h('button', 'pcm-b', 'Enviar reportes'), no = h('button', 'pcm-b no', 'Cancelar');
        ok.disabled = true; no.onclick = c;
        ok.onclick = async () => {
            ok.disabled = true;
            try {
                const batch = writeBatch(db);
                sel.forEach(m => {
                    batch.set(doc(db, 'reports', uid + '_' + m.id), {
                        by: uid, tu: m.uid, tn: String(m.n || '').slice(0, 20), mid: m.id,
                        mt: (m.t || '').slice(0, 300), mk: m.media ? m.media.k : '', r: motivo,
                        d: d.value.trim().slice(0, 500), ts: serverTimestamp()
                    });
                });
                await batch.commit();
                c();
                cancelarSeleccion();
                aviso(sel.length + ' mensajes reportados.');
            } catch (e) { ok.disabled = false; aviso(errTxt(e), 'err'); }
        };
        b.append(ok, no);
    });
}

/* ------------------------------ REPORTES ------------------------------ */
function reportar(m) {
    let motivo = '';
    dialogo('Reportar mensaje', (b, c) => {
        b.append(h('p', '', 'Elegí el motivo del reporte. Es anónimo: la persona reportada no sabrá que fue reportada ni quién lo hizo.'));
        const opts = MOTIVOS.map(([k, t]) => {
            const o = h('button', 'pcm-opt'); o.type = 'button'; o.append(h('span', 'rd'), h('span', '', t));
            o.onclick = () => { motivo = k; opts.forEach(x => x.classList.toggle('on', x === o)); ok.disabled = false; };
            b.append(o); return o;
        });
        const d = h('textarea', 'pcm-in'); d.rows = 3; d.maxLength = 500; d.placeholder = 'Contanos más (opcional)'; b.append(d);
        const ok = h('button', 'pcm-b', 'Enviar reporte'), no = h('button', 'pcm-b no', 'Cancelar');
        ok.disabled = true; no.onclick = c;
        ok.onclick = async () => {
            ok.disabled = true;
            try {
                await setDoc(doc(db, 'reports', uid + '_' + m.id), {
                    by: uid, tu: m.uid, tn: String(m.n || '').slice(0, 20), mid: m.id,
                    mt: (m.t || '').slice(0, 300), mk: m.media ? m.media.k : '', r: motivo,
                    d: d.value.trim().slice(0, 500), ts: serverTimestamp()
                });
                c(); aviso('Gracias. Recibimos tu reporte y lo vamos a revisar.');
            } catch (e) { ok.disabled = false; aviso(e.code === 'permission-denied' ? 'Ya reportaste este mensaje.' : errTxt(e), 'err'); }
        };
        b.append(ok, no);
    });
}

/* ------------------------------ AMIGOS ------------------------------ */
async function solicitar(o, nombre, boton) {
    if (o === uid) return;
    try {
        await syncPerfil();
        await setDoc(doc(db, 'friend_requests', uid + '_' + o), { from: uid, to: o, fn: miNombre(), tn: String(nombre || '').slice(0, 20), status: 'pending', at: serverTimestamp() });
        aviso('Solicitud de amistad enviada.');
        if (boton) { boton.disabled = true; boton.textContent = 'Solicitud enviada'; }
    } catch (e) { aviso(errTxt(e), 'err'); }
}
async function responder(r, estado) {
    try { await updateDoc(doc(db, 'friend_requests', r.id), { status: estado }); aviso(estado === 'accepted' ? 'Ahora son amigos.' : 'Solicitud rechazada.'); }
    catch (e) { aviso(errTxt(e), 'err'); }
}
async function quitar(r, texto, titulo, okTxt) {
    if (!await confirmar(titulo, texto, okTxt)) return;
    try { await deleteDoc(doc(db, 'friend_requests', r.id)); aviso('Listo.'); } catch (e) { aviso(errTxt(e), 'err'); }
}
const bt = (t, f, c) => { const b = h('button', 'pcm-b' + (c ? ' ' + c : ''), t); b.type = 'button'; b.onclick = () => f(b); return b; };
function fila(id, nombre, botones, isFriend) {
    const f = h('div', 'pcm-per'), bs = h('div', 'bs');
    if (isFriend) bs.append(bt('Mensaje', () => { abrirDM(id, nombre); }, 'no'));
    bs.append(...botones);
    f.append(avatar(id, nombre, 'sm'), h('div', 'n', nombre || '?'), bs); return f;
}
function seccion(titulo, arr, mk, vacioTxt) {
    listaAm.append(h('div', 'pcm-h3', titulo));
    if (!arr.length) listaAm.append(h('div', 'pcm-mut', vacioTxt)); else arr.forEach(r => listaAm.append(mk(r)));
}
function pintarAmigos() {
    if (!listaAm) return;
    listaAm.textContent = '';
    const nom = r => String(r.from === uid ? r.tn : r.fn).toLowerCase();
    const rec = reqIn.filter(r => r.status === 'pending').sort((a, b) => nom(a).localeCompare(nom(b)));
    const env = reqOut.filter(r => r.status !== 'accepted').sort((a, b) => nom(a).localeCompare(nom(b)));
    const ami = [...reqIn, ...reqOut].filter(r => r.status === 'accepted').sort((a, b) => nom(a).localeCompare(nom(b)));
    seccion('Solicitudes recibidas', rec, r => fila(r.from, r.fn, [bt('Aceptar', () => responder(r, 'accepted')), bt('Rechazar', () => responder(r, 'declined'), 'no')]), 'No tenés solicitudes pendientes.');
    seccion('Solicitudes enviadas', env, r => fila(r.to, r.tn, [bt('Cancelar', () => quitar(r, 'Se cancelará tu solicitud de amistad.', '¿Cancelar solicitud?', 'Cancelar solicitud'), 'no')]), 'No enviaste solicitudes.');
    seccion('Mis amigos', ami, r => fila(r.from === uid ? r.to : r.from, r.from === uid ? r.tn : r.fn, [bt('Eliminar', () => quitar(r, 'Dejarán de ser amigos.', '¿Eliminar amigo?', 'Eliminar amigo'), 'no')], true), 'Todavía no tenés amigos.');
}
async function buscar(txt) {
    const t = String(txt).trim().toLowerCase(); resBusq.textContent = '';
    if (t.length < 3) { resBusq.append(h('div', 'pcm-mut', 'Escribí el nombre de usuario completo (mínimo 3 caracteres).')); return; }
    try {
        const s = await getDocs(query(collection(db, 'public_profiles'), where('lc', '==', t), limit(5)));
        const ps = s.docs.filter(d => d.id !== uid);
        if (!ps.length) { resBusq.append(h('div', 'pcm-mut', 'No encontramos a nadie con ese nombre.')); return; }
        ps.forEach(d => {
            const p = d.data(), r = rel(d.id); let b;
            if (r === 'amigo') { b = bt('Ya son amigos', () => { }); b.disabled = true; }
            else if (r === 'enviada') { b = bt('Solicitud enviada', () => { }); b.disabled = true; }
            else if (r === 'recibida') b = bt('Ver solicitud', () => { setTab('amigos'); resBusq.textContent = ''; });
            else b = bt('Enviar solicitud', bb => solicitar(d.id, p.username, bb));
            resBusq.append(fila(d.id, p.username, [b], r === 'amigo'));
        });
    } catch (e) { aviso(errTxt(e), 'err'); }
}

/* ------------------------------ INICIO ------------------------------ */
onAuthStateChanged(auth, () => refresh());
const rcPrev = window.renderCuenta;
window.renderCuenta = function () { if (rcPrev) rcPrev.apply(this, arguments); refresh(); };
refresh();
