/* Pichisoft - guarda los datos de la app en tu cuenta (si hay sesión).
   Uso:
   <script src="pichisoft-datos.js" data-keys="clave1,clave2"></script> */
(function () {
    var me = document.currentScript;
    var KEYS = ((me && me.dataset.keys) || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!KEYS.length) return;

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
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function id(k) { return encodeURIComponent(k); }

    (async function () {
        try {
            var m = await Promise.all([import(V + "firebase-app.js"), import(V + "firebase-auth.js"), import(V + "firebase-firestore.js")]);
            var A = m[0], Au = m[1], F = m[2];
            var app = A.getApps().length ? A.getApp() : A.initializeApp(CFG);
            var auth = Au.getAuth(app), db = F.getFirestore(app);

            var user = await Promise.race([
                new Promise(function (res) { Au.onAuthStateChanged(auth, function (u) { res(u); }); }),
                wait(15000).then(function () { return null; })
            ]);
            if (!user) return;
            var uid = user.uid;
            function ref(k) { return F.doc(db, "users", uid, "data", id(k)); }

            /* 0) Borrados pendientes */
            for (var b = 0; b < KEYS.length; b++) {
                var bk = KEYS[b];
                var marcaBorrado = "ps_borrar_nube__" + bk;
                if (localStorage.getItem(marcaBorrado) === "1") {
                    try {
                        await F.deleteDoc(ref(bk));
                    } catch (e) {
                        console.warn("Pichisoft: no se pudo borrar " + bk + " de la nube.", e);
                        continue;
                    }
                    rawRemove.call(localStorage, marcaBorrado);
                }
            }

            /* 1) Al abrir: la nube manda. FIX: saltamos keys con borrado pendiente. */
            var cambio = false;
            for (let i = 0; i < KEYS.length; i++) {
                const k = KEYS[i];
                const dk = "ps_dueno__" + k, dueno = localStorage.getItem(dk);
                if (dueno && dueno !== uid) rawRemove.call(localStorage, k);
                rawSet.call(localStorage, dk, uid);

                /* FIX: si quedó una marca de borrado pendiente, no restauramos desde la nube */
                if (localStorage.getItem("ps_borrar_nube__" + k) === "1") continue;

                const local = localStorage.getItem(k);
                const snap = await F.getDoc(ref(k));
                if (snap.exists() && typeof snap.data().v === "string") {
                    const cloud = snap.data().v;
                    if (local !== cloud) {
                        if (local !== null) rawSet.call(localStorage, k + "__respaldo", local);
                        rawSet.call(localStorage, k, cloud);
                        cambio = true;
                    }
                } else if (local !== null) {
                    await F.setDoc(ref(k), { v: local, t: Date.now() });
                }
            }

            /* 2) Interceptar cambios */
            function flush(k) {
                clearTimeout(timers[k]);
                if (!(k in pend)) return;
                var v = pend[k]; delete pend[k]; lastPush[k] = v;
                F.setDoc(ref(k), { v: v, t: Date.now() }).catch(function (e) { console.warn("Pichisoft: no se pudo guardar " + k, e); });
            }

            Storage.prototype.setItem = function (k, v) {
                rawSet.call(this, k, v);
                var ks = String(k);
                if (this === localStorage && KEYS.indexOf(ks) > -1) {
                    rawRemove.call(localStorage, "ps_borrar_nube__" + ks);
                    pend[ks] = String(v);
                    clearTimeout(timers[ks]);
                    timers[ks] = setTimeout(function () { flush(ks); }, 1500);
                }
            };

            Storage.prototype.removeItem = function (k) {
                rawRemove.call(this, k);
                var ks = String(k);
                if (this === localStorage && KEYS.indexOf(ks) > -1) {
                    delete pend[ks];
                    clearTimeout(timers[ks]);
                    rawSet.call(localStorage, "ps_borrar_nube__" + ks, "1");
                    F.deleteDoc(ref(ks)).then(function () {
                        rawRemove.call(localStorage, "ps_borrar_nube__" + ks);
                    }).catch(function () { });
                }
            };

            function flushAll() { Object.keys(pend).forEach(flush); }
            document.addEventListener("visibilitychange", function () { if (document.hidden) flushAll(); });
            window.addEventListener("pagehide", flushAll);

            /* 3) Recarga una vez si llegaron datos nuevos de la nube */
            var rk = "ps_datos_reload_" + location.pathname;
            if (cambio && Date.now() - (+sessionStorage.getItem(rk) || 0) > 20000) {
                sessionStorage.setItem(rk, String(Date.now()));
                location.reload();
            }

            /* 4) Cambios desde otro dispositivo */
            var remoto = {}, idleT = null;
            function aplicar() {
                var ks = Object.keys(remoto);
                if (!ks.length) return;
                ks.forEach(function (k) {
                    var l = localStorage.getItem(k);
                    if (l !== null && l !== remoto[k]) rawSet.call(localStorage, k + "__respaldo", l);
                    rawSet.call(localStorage, k, remoto[k]);
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

            async function revisar(ya) {
                for (var j = 0; j < KEYS.length; j++) {
                    var kk = KEYS[j];
                    try {
                        var sn = await F.getDoc(ref(kk));
                        if (sn.exists() && typeof sn.data().v === "string") {
                            var c = sn.data().v;
                            if (c !== localStorage.getItem(kk) && !(kk in pend) && c !== lastPush[kk]) remoto[kk] = c; else delete remoto[kk];
                        }
                    } catch (e) { return; }
                }
                if (Object.keys(remoto).length) { if (ya) aplicar(); else programar(); }
            }
            KEYS.forEach(function (kk) {
                F.onSnapshot(ref(kk), function (sn) {
                    if (sn.metadata.hasPendingWrites || !sn.exists() || typeof sn.data().v !== "string") return;
                    var c = sn.data().v;
                    if (c === localStorage.getItem(kk) || kk in pend || c === lastPush[kk]) { delete remoto[kk]; return; }
                    remoto[kk] = c; programar();
                }, function () { });
            });
            document.addEventListener("visibilitychange", function () { if (!document.hidden) revisar(true); });
            window.addEventListener("online", function () { revisar(false); });
        } catch (e) {
            console.warn("Pichisoft: datos en la nube no disponibles, se usa solo LocalStorage.", e);
        }
    })();
})();
