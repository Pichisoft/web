/* Pichisoft - guarda los datos de la app en tu cuenta (si hay sesión).
   Uso:
   <script src="pichisoft-datos.js" data-keys="clave1,clave2"></script>

   Expone:
   - window.PichisoftDatosReady : Promise que se resuelve cuando terminó la
     primera sincronización (hay que esperarla ANTES de leer/crear el vault).
   - window.PichisoftFlush()    : Promise que se resuelve cuando los cambios
     pendientes ya se subieron a la nube (usar antes de recargar/cerrar sesión). */
(function () {
    var me = document.currentScript;
    var KEYS = ((me && me.dataset.keys) || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    var resolveReady;
    window.PichisoftDatosReady = new Promise(function (r) { resolveReady = r; });
    window.PichisoftFlush = function () { return Promise.resolve(); };
    if (!KEYS.length) { resolveReady(); return; }

    var CFG = {
        apiKey: "AIzaSyCf_P8qp9nBUnsVe3qsTAtZJjZHOktKf-8",
        authDomain: "pichisoft.firebaseapp.com",
        projectId: "pichisoft",
        storageBucket: "pichisoft.firebasestorage.app",
        messagingSenderId: "690032082295",
        appId: "1:690032082295:web:b7f0e8cb8fcceb26e9b572",
        measurementId: "G-K7HRKR8BJ1"
    };
    var V = "https://www.gstatic.com/firebasejs/12.3.0/";

    var rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem;
    var pend = {}, timers = {}, lastPush = {};
    var active = false, noUser = false;
    var F = null, db = null, uid = null;

    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function timeout(p, ms) { return Promise.race([p, wait(ms).then(function () { throw new Error("tiempo agotado"); })]); }
    function id(k) { return encodeURIComponent(k); }
    function ref(k) { return F.doc(db, "users", uid, "data", id(k)); }
    function tKey(k) { return "ps_t__" + k; }
    function localT(k) { return parseInt(localStorage.getItem(tKey(k)) || "0", 10) || 0; }

    /* ---------- Subida a la nube ---------- */
    function flush(k) {
        clearTimeout(timers[k]);
        if (!pend[k]) return Promise.resolve();
        delete pend[k];
        var v = localStorage.getItem(k);
        if (v === null) return Promise.resolve();
        lastPush[k] = v;
        return F.setDoc(ref(k), { v: v, t: localT(k) || Date.now() }).catch(function (e) {
            pend[k] = true; /* reintentar luego */
            console.warn("Pichisoft: no se pudo guardar " + k, e);
        });
    }
    function flushAll() { return Promise.all(Object.keys(pend).map(flush)); }

    /* ---------- Interceptores (se instalan YA, no después de esperar a Firebase) ----------
       Así ningún cambio hecho al principio se pierde: siempre queda con su marca de tiempo. */
    Storage.prototype.setItem = function (k, v) {
        rawSet.call(this, k, v);
        var ks = String(k);
        if (this === localStorage && KEYS.indexOf(ks) > -1) {
            rawRemove.call(localStorage, "ps_borrar_nube__" + ks);
            rawSet.call(localStorage, tKey(ks), String(Date.now()));
            if (active) {
                pend[ks] = true;
                clearTimeout(timers[ks]);
                timers[ks] = setTimeout(function () { flush(ks); }, 1500);
            }
        }
    };

    Storage.prototype.removeItem = function (k) {
        rawRemove.call(this, k);
        var ks = String(k);
        if (this === localStorage && KEYS.indexOf(ks) > -1) {
            delete pend[ks];
            clearTimeout(timers[ks]);
            rawRemove.call(localStorage, tKey(ks));
            if (!noUser) {
                rawSet.call(localStorage, "ps_borrar_nube__" + ks, "1");
                if (active) {
                    F.deleteDoc(ref(ks)).then(function () {
                        rawRemove.call(localStorage, "ps_borrar_nube__" + ks);
                    }).catch(function () { });
                }
            }
        }
    };

    (async function () {
        try {
            var m = await Promise.all([import(V + "firebase-app.js"), import(V + "firebase-auth.js"), import(V + "firebase-firestore.js")]);
            var A = m[0], Au = m[1];
            F = m[2];
            var app = A.getApps().length ? A.getApp() : A.initializeApp(CFG);
            var auth = Au.getAuth(app);
            db = F.getFirestore(app);

            var user = await Promise.race([
                new Promise(function (res) { Au.onAuthStateChanged(auth, function (u) { res(u); }); }),
                wait(10000).then(function () { return null; })
            ]);
            if (!user) { noUser = true; return; }
            uid = user.uid;

            /* 0) Borrados pendientes */
            for (var b = 0; b < KEYS.length; b++) {
                var bk = KEYS[b], marca = "ps_borrar_nube__" + bk;
                if (localStorage.getItem(marca) === "1") {
                    try { await timeout(F.deleteDoc(ref(bk)), 10000); }
                    catch (e) { console.warn("Pichisoft: no se pudo borrar " + bk + " de la nube.", e); continue; }
                    rawRemove.call(localStorage, marca);
                }
            }

            /* 1) Al abrir: gana el dato MÁS NUEVO (por timestamp), no siempre la nube */
            for (var i = 0; i < KEYS.length; i++) {
                var k = KEYS[i];
                var dk = "ps_dueno__" + k, dueno = localStorage.getItem(dk);
                if (dueno && dueno !== uid) { rawRemove.call(localStorage, k); rawRemove.call(localStorage, tKey(k)); }
                rawSet.call(localStorage, dk, uid);

                if (localStorage.getItem("ps_borrar_nube__" + k) === "1") continue;

                var snap = await timeout(F.getDoc(ref(k)), 10000);
                var cloud = (snap.exists() && typeof snap.data().v === "string") ? snap.data() : null;

                /* se lee el local DESPUÉS del await (pudo cambiar mientras esperábamos) */
                var local = localStorage.getItem(k), lt = localT(k);

                if (cloud) {
                    var ct = cloud.t || 0;
                    if (local === cloud.v) {
                        rawSet.call(localStorage, tKey(k), String(ct || lt));
                    } else if (local === null || ct > lt) {
                        if (local !== null) rawSet.call(localStorage, k + "__respaldo", local);
                        rawSet.call(localStorage, k, cloud.v);
                        rawSet.call(localStorage, tKey(k), String(ct));
                    } else {
                        await F.setDoc(ref(k), { v: local, t: lt || Date.now() });
                        lastPush[k] = local;
                    }
                } else if (local !== null) {
                    var t0 = lt || Date.now();
                    rawSet.call(localStorage, tKey(k), String(t0));
                    await F.setDoc(ref(k), { v: local, t: t0 });
                    lastPush[k] = local;
                }
            }

            active = true;
            window.PichisoftFlush = flushAll;
            resolveReady(); /* ya se puede iniciar sesión */

            document.addEventListener("visibilitychange", function () { if (document.hidden) flushAll(); });
            window.addEventListener("pagehide", flushAll);

            /* 2) Cambios hechos desde otro dispositivo */
            var remoto = {}, idleT = null;
            function aplicar() {
                var ks = Object.keys(remoto);
                if (!ks.length) return;
                ks.forEach(function (k) {
                    var l = localStorage.getItem(k);
                    if (l !== null && l !== remoto[k].v) rawSet.call(localStorage, k + "__respaldo", l);
                    rawSet.call(localStorage, k, remoto[k].v);
                    rawSet.call(localStorage, tKey(k), String(remoto[k].t || Date.now()));
                });
                remoto = {};
                location.reload();
            }
            function programar() {
                clearTimeout(idleT);
                if (!Object.keys(remoto).length) return;
                idleT = setTimeout(function () { if (!document.hidden) aplicar(); }, 4000);
            }
            ["pointerdown", "keydown", "touchstart", "input"].forEach(function (ev) { document.addEventListener(ev, programar, true); });

            function esNuevo(k, d) {
                return typeof d.v === "string" &&
                    d.v !== localStorage.getItem(k) &&
                    !(k in pend) &&
                    d.v !== lastPush[k] &&
                    (d.t || 0) > localT(k);
            }

            async function revisar(ya) {
                for (var j = 0; j < KEYS.length; j++) {
                    var kk = KEYS[j];
                    try {
                        var sn = await F.getDoc(ref(kk));
                        if (sn.exists() && esNuevo(kk, sn.data())) remoto[kk] = sn.data(); else delete remoto[kk];
                    } catch (e) { return; }
                }
                if (Object.keys(remoto).length) { if (ya) aplicar(); else programar(); }
            }

            KEYS.forEach(function (kk) {
                F.onSnapshot(ref(kk), function (sn) {
                    if (sn.metadata.hasPendingWrites || !sn.exists()) return;
                    var d = sn.data();
                    if (esNuevo(kk, d)) { remoto[kk] = d; programar(); } else { delete remoto[kk]; }
                }, function () { });
            });
            document.addEventListener("visibilitychange", function () { if (!document.hidden) revisar(true); });
            window.addEventListener("online", function () { revisar(false); });
        } catch (e) {
            console.warn("Pichisoft: datos en la nube no disponibles, se usa solo LocalStorage.", e);
        } finally {
            resolveReady();
        }
    })();
})();
