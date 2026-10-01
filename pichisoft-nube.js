/* Pichisoft en cada app: cartel de sesión + datos en la nube.
   Uso: <script src="pichisoft-nube.js"></script> (al final del body, o en el <head> si la app sincroniza datos).
   Sincronizar datos de una app:  Pichisoft.syncKeys(['clave_de_localStorage']).then(iniciarApp)
   Opcional en el <script>: data-inicio="8000" data-perfil="3000" (ms), data-top="60" data-right="12" (px). */
(function () {
    var me = document.currentScript || document.querySelector('script[src*="pichisoft-nube"]');
    var base = me && me.src ? me.src.replace(/[^\/]*$/, '') : '';
    var D1 = +(me && me.dataset.inicio) || 8000, D2 = +(me && me.dataset.perfil) || 3000;
    var B = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-';
    function L(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
    function load(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
    var ok = L('ps_ok'), mm = L('ps_me'), logged = !!(ok && mm && mm.uid === ok);
    var rawSet = Storage.prototype.setItem, col = null, watch = {}, pend = {}, timers = {};
    var P = window.Pichisoft = window.Pichisoft || {};

    function sdk() {
        if (window.firebase && firebase.firestore && firebase.auth) return Promise.resolve();
        return load(B + 'app-compat.js').then(function () { return load(B + 'auth-compat.js'); }).then(function () { return load(B + 'firestore-compat.js'); });
    }
    P.ready = !logged ? Promise.resolve(null) :
        Promise.resolve(window.PICHISOFT_FIREBASE || load(base + 'pichisoft-config.js').then(function () { return window.PICHISOFT_FIREBASE; }))
            .then(function (c) {
                if (!c || !c.apiKey) return null;
                return sdk().then(function () {
                    if (!firebase.apps.length) firebase.initializeApp(c);
                    return new Promise(function (res) { var off = firebase.auth().onAuthStateChanged(function (u) { off(); res(u && u.uid === ok ? u : null); }); });
                });
            }).then(function (u) {
                if (u) { col = firebase.firestore().collection('users').doc(u.uid).collection('data'); P.user = mm; }
                return u;
            }).catch(function () { return null; });

    var id = function (k) { return encodeURIComponent(k); };
    P.getData = function (app, key, def) {
        return P.ready.then(function (u) {
            if (!u) { var v = L(app + ':' + key); return v == null ? def : v; }
            return col.doc(id(app + '__' + key)).get().then(function (d) { return d.exists ? JSON.parse(d.data().v) : def; });
        });
    };
    P.setData = function (app, key, val) {
        return P.ready.then(function (u) {
            if (!u) { rawSet.call(localStorage, app + ':' + key, JSON.stringify(val)); return; }
            return col.doc(id(app + '__' + key)).set({ v: JSON.stringify(val), t: Date.now() });
        });
    };

    function flushKey(k) {
        clearTimeout(timers[k]);
        if (!(k in pend) || !col) return;
        var v = pend[k]; delete pend[k];
        col.doc(id(k)).set({ v: v, t: Date.now() }).catch(function () { });
    }
    /* Mantiene sincronizadas con la nube las claves de localStorage que usa una app.
       Al abrir: si la nube ya tiene datos, mandan esos (y tu copia local queda en "clave__respaldo_local").
       Si la nube está vacía, sube lo que hay en el dispositivo. Después, cada cambio se guarda solo. */
    P.syncKeys = function (keys) {
        return P.ready.then(function (u) {
            if (!u) return;
            var reg = L('ps_synckeys') || [];
            keys.forEach(function (k) { watch[k] = 1; if (reg.indexOf(k) < 0) reg.push(k); });
            rawSet.call(localStorage, 'ps_synckeys', JSON.stringify(reg));
            if (!Storage.prototype.__ps) {
                Storage.prototype.setItem = function (k, v) {
                    rawSet.call(this, k, v);
                    if (this === localStorage && watch[k]) { pend[k] = String(v); clearTimeout(timers[k]); timers[k] = setTimeout(function () { flushKey(k); }, 800); }
                };
                Storage.prototype.__ps = 1;
                window.addEventListener('pagehide', function () { Object.keys(pend).forEach(flushKey); });
            }
            return Promise.all(keys.map(function (k) {
                return col.doc(id(k)).get().then(function (d) {
                    var local = localStorage.getItem(k);
                    if (d.exists) {
                        var cloud = d.data().v;
                        if (local !== null && local !== cloud) rawSet.call(localStorage, k + '__respaldo_local', local);
                        rawSet.call(localStorage, k, cloud);
                    } else if (local !== null) return col.doc(id(k)).set({ v: local, t: Date.now() });
                }).catch(function () { });
            }));
        });
    };

    /* ---------- Cartel de sesión ---------- */
    if (!logged) return;
    function init() {
        var st = document.createElement('style');
        st.textContent = '.ps-w{font:13px/1.3 Georgia,"Times New Roman",serif;color:#3ddc84;display:inline-flex;align-items:center;max-width:min(340px,72vw);box-sizing:border-box;padding:6px 12px 6px 9px;border-radius:999px;background:rgba(0,0,0,.66);border:1px solid rgba(61,220,132,.28);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;transform:translateY(-6px);transition:opacity .45s ease,transform .45s ease;z-index:9999;pointer-events:none;text-align:left}' +
            '.ps-w.ps-fx{position:fixed}.ps-w.in{opacity:1;transform:none}' +
            '.ps-c{display:inline-flex;align-items:center;gap:8px;transition:opacity .3s ease}.ps-c.h{opacity:0}' +
            '.ps-sp{flex:none;width:14px;height:14px;border:2px solid rgba(61,220,132,.25);border-top-color:#3ddc84;border-radius:50%;animation:ps-r .9s linear infinite}' +
            '.ps-ok{flex:none;animation:ps-p .5s cubic-bezier(.2,1.6,.4,1)}' +
            '.ps-ok circle{stroke-dasharray:63;stroke-dashoffset:63;animation:ps-d .6s ease forwards}' +
            '.ps-ok path{stroke-dasharray:18;stroke-dashoffset:18;animation:ps-d .4s .45s ease forwards}' +
            '.ps-av{flex:none;width:26px;height:26px;border-radius:50%;background:#444;color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;font:600 13px Georgia,serif}' +
            '.ps-av img{width:100%;height:100%;object-fit:cover}' +
            '.ps-nm{color:#f5f5f5;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
            '@keyframes ps-r{to{transform:rotate(360deg)}}@keyframes ps-d{to{stroke-dashoffset:0}}@keyframes ps-p{0%{transform:scale(.4)}100%{transform:scale(1)}}' +
            '@media(max-width:600px){.ps-w{font-size:11.5px;padding:5px 10px 5px 7px;max-width:64vw}.ps-nm{font-size:12px;max-width:90px}}' +
            '@media(prefers-reduced-motion:reduce){.ps-sp{animation-duration:2.4s}.ps-ok,.ps-ok circle,.ps-ok path{animation:none!important;stroke-dashoffset:0!important}}';
        document.head.appendChild(st);
        var mount = document.getElementById('psMount'), fixed = !mount;
        var w = document.createElement('div'); w.className = 'ps-w' + (fixed ? ' ps-fx' : '');
        w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite');
        var c = document.createElement('span'); c.className = 'ps-c'; w.appendChild(c);
        (mount || document.body).appendChild(w);
        function el(t, cl, x) { var e = document.createElement(t); if (cl) e.className = cl; if (x != null) e.textContent = x; return e; }
        function s1(c) { c.appendChild(el('span', 'ps-sp')); c.appendChild(el('span', '', 'Iniciando sesión en tu cuenta de Pichisoft...')); }
        function s2(c) {
            c.insertAdjacentHTML('beforeend', '<svg class="ps-ok" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#3ddc84" stroke-width="2"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#3ddc84" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
            c.appendChild(el('span', '', 'Sesión iniciada'));
        }
        function s3(c) {
            var a = el('span', 'ps-av');
            if (typeof mm.photo === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(mm.photo)) { var i = new Image(); i.src = mm.photo; i.alt = ''; a.appendChild(i); }
            else a.textContent = (mm.name || '?').charAt(0).toUpperCase();
            c.appendChild(a); c.appendChild(el('span', 'ps-nm', mm.name));
        }
        function place() {
            if (!fixed) return;
            var top = 12, right = 12, a = document.querySelector('a[href="https://pichisoft.github.io/web/"],button.pichisoft-link');
            if (a) {
                var r = a.getBoundingClientRect(), p = a.parentElement ? a.parentElement.getBoundingClientRect() : null;
                if (p && p.height < 80 && p.width < 240) r = p;
                if (r.width && r.bottom < 220 && r.right > innerWidth * .4) { top = Math.round(r.bottom + 6); right = Math.max(8, Math.round(innerWidth - r.right)); }
            }
            if (me && me.dataset.top) top = +me.dataset.top;
            if (me && me.dataset.right) right = +me.dataset.right;
            if (w.offsetWidth + right > innerWidth - 8) right = 8;
            w.style.top = top + 'px'; w.style.right = right + 'px';
        }
        function swap(f) { c.classList.add('h'); setTimeout(function () { c.textContent = ''; f(c); c.classList.remove('h'); place(); }, 300); }
        s1(c); place();
        setTimeout(function () { w.classList.add('in'); }, 30);
        window.addEventListener('resize', place);
        Promise.all([new Promise(function (r) { setTimeout(r, D1); }), P.ready]).then(function (x) {
            if (!x[1]) { w.classList.remove('in'); setTimeout(function () { w.remove(); }, 500); return; }  // sesión inválida: se oculta
            swap(s2); setTimeout(function () { swap(s3); }, D2);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();