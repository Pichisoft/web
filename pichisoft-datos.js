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
    var F = null, db = null, auth = null, uid = null;
    var syncedUid = null;            /* NUEVO: último uid con sync activo */
    var unsubs = [];
    var remoto = {}, idleT = null;

    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function timeout(p, ms) { return Promise.race([p, wait(ms).then(function () { throw new Error("tiempo agotado"); })]); }
    function id(k) { return encodeURIComponent(k); }
    function ref(k) { return F.doc(db, "users", uid, "data", id(k)); }
    function tKey(k) { return "ps_t__" + k; }
    function dKey(k) { return "ps_dueno__" + k; }
    function localT(k) { return parseInt(localStorage.getItem(tKey(k)) || "0", 10) || 0; }

    /* ====== NUEVO: LIMPIEZA SINCRÓNICA ======
       Corre ANTES que cualquier script de la app. Si en localStorage hay datos
       de un uid que no es el de la sesión actual, los borra (con respaldo).
       Así la app, aunque lea localStorage apenas carga, nunca ve datos ajenos. */
    (function limpiarSincrono() {
        try {
            var sess = JSON.parse(localStorage.getItem('ps_session') || 'null');
            if (!sess || !sess.k) return;
            var users = JSON.parse(localStorage.getItem('ps_users') || '{}');
            var u = users[sess.k];
            if (!u || !u.firebaseUid) return;
            var uidActual = u.firebaseUid;
            for (var i = 0; i < KEYS.length; i++) {
                var k = KEYS[i], dueno = localStorage.getItem(dKey(k));
                if (dueno && dueno !== uidActual) {
                    var v = localStorage.getItem(k);
                    if (v !== null) rawSet.call(localStorage, k + '__respaldo', v);
                    rawRemove.call(localStorage, k);
                    rawRemove.call(localStorage, tKey(k));
                    rawRemove.call(localStorage, dKey(k));
                }
            }
        } catch (e) { /* noop */ }
    })();

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

    /* ---------- Interceptores (se instalan YA) ---------- */
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
            if (active && uid) {
                rawSet.call(localStorage, "ps_borrar_nube__" + ks, "1");
                F.deleteDoc(ref(ks)).then(function () {
                    rawRemove.call(localStorage, "ps_borrar_nube__" + ks);
                }).catch(function () { });
            }
        }
    };

    /* ---------- Sync como uid ---------- */
    async function sincronizarComo(user) {
        uid = user.uid;
        syncedUid = user.uid;

        /* 0) Borrados pendientes */
        for (var b = 0; b < KEYS.length; b++) {
            var bk = KEYS[b], marca = "ps_borrar_nube__" + bk;
            if (localStorage.getItem(marca) === "1") {
                try { await timeout(F.deleteDoc(ref(bk)), 10000); }
                catch (e) { console.warn("Pichisoft: no se pudo borrar " + bk + " de la nube.", e); continue; }
                rawRemove.call(localStorage, marca);
            }
        }

        /* 1) Al abrir: gana el dato MÁS NUEVO (por timestamp), no siempre la nube.
              Si el dueño local era otro uid, primero limpiamos. */
        for (var i = 0; i < KEYS.length; i++) {
            var k = KEYS[i];
            var dueno = localStorage.getItem(dKey(k));
            if (dueno && dueno !== uid) {
                var vv = localStorage.getItem(k);
                if (vv !== null) rawSet.call(localStorage, k + '__respaldo', vv);
                rawRemove.call(localStorage, k);
                rawRemove.call(localStorage, tKey(k));
            }
            rawSet.call(localStorage, dKey(k), uid);

            if (localStorage.getItem("ps_borrar_nube__" + k) === "1") continue;

            var snap = await timeout(F.getDoc(ref(k)), 10000);
            var cloud = (snap.exists() && typeof snap.data().v === "string") ? snap.data() : null;
            var local = localStorage.getItem(k), lt = localT(k);

            if (cloud) {
                var ct = cloud.t || 0;
                if (local === cloud.v) {
                    rawSet.call(localStorage, tKey(k), String(ct || lt));
                } else if (local === null || ct > lt) {
                    if (local !== null) rawSet.call(localStorage, k + '__respaldo', local);
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

        /* 2) onSnapshot para cambios desde otro dispositivo */
        KEYS.forEach(function (kk) {
            var unsub = F.onSnapshot(ref(kk), function (sn) {
                if (sn.metadata.hasPendingWrites || !sn.exists()) return;
                var d = sn.data();
                if (esNuevo(kk, d)) { remoto[kk] = d; programar(); } else { delete remoto[kk]; }
            }, function () { });
            unsubs.push(unsub);
        });
    }

    /* NUEVO: apagar todo el sync (logout o cambio de cuenta) */
    function detenerSync() {
        active = false;
        syncedUid = null;
        unsubs.forEach(function (u) { try { u(); } catch (e) { } });
        unsubs = [];
        remoto = {};
        clearTimeout(idleT);
    }

    function aplicar() {
        var ks = Object.keys(remoto);
        if (!ks.length) return;
        ks.forEach(function (k) {
            var l = localStorage.getItem(k);
            if (l !== null && l !== remoto[k].v) rawSet.call(localStorage, k + '__respaldo', l);
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
    function esNuevo(k, d) {
        return typeof d.v === "string" &&
            d.v !== localStorage.getItem(k) &&
            !(k in pend) &&
            d.v !== lastPush[k] &&
            (d.t || 0) > localT(k);
    }

    /* ---------- Arranque ---------- */
    (async function () {
        try {
            var m = await Promise.all([import(V + "firebase-app.js"), import(V + "firebase-auth.js"), import(V + "firebase-firestore.js")]);
            var A = m[0], Au = m[1];
            F = m[2];
            var app = A.getApps().length ? A.getApp() : A.initializeApp(CFG);
            auth = Au.getAuth(app);
            db = F.getFirestore(app);

            var resolverPrimero;
            var primero = new Promise(function (r) { resolverPrimero = r; });
            var yaResolvio = false;

            /* NUEVO: listener permanente. Además del primer estado, detecta
               cambios de cuenta y recarga para que la limpieza se aplique. */
            Au.onAuthStateChanged(auth, async function (user) {
                if (!yaResolvio) { yaResolvio = true; resolverPrimero(user); return; }

                if (!user) {
                    /* Logout: subir pendientes y apagar sync (no recargamos) */
                    if (syncedUid) {
                        try { await Promise.race([flushAll(), wait(3000)]); } catch (e) { }
                        detenerSync();
                    }
                    return;
                }

                if (user.uid === syncedUid) return;

                /* Cambio de cuenta (o primer login tras modo invitado):
                   flushear pendientes, apagar y recargar. Al recargar,
                   limpiarSincrono + sincronizarComo dejan solo lo del uid nuevo. */
                try { await Promise.race([flushAll(), wait(3000)]); } catch (e) { }
                if (syncedUid) detenerSync();
                location.reload();
            });

            var user = await Promise.race([primero, wait(10000).then(function () { return null; })]);
            if (!user) { noUser = true; resolveReady(); return; }

            await sincronizarComo(user);
            resolveReady();

            document.addEventListener("visibilitychange", function () { if (document.hidden) flushAll(); });
            window.addEventListener("pagehide", flushAll);
            ["pointerdown", "keydown", "touchstart", "input"].forEach(function (ev) { document.addEventListener(ev, programar, true); });

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

            document.addEventListener("visibilitychange", function () { if (!hiddenSafe()) revisar(true); });
            window.addEventListener("online", function () { if (active) revisar(false); });
            function hiddenSafe() { return document.hidden; }
        } catch (e) {
            console.warn("Pichisoft: datos en la nube no disponibles, se usa solo LocalStorage.", e);
            resolveReady();
        }
    })();
})();
