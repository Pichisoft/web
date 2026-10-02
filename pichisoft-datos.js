/* Pichisoft - guarda los datos de la app en tu cuenta (si hay sesión) para verlos en cualquier dispositivo.
   Sin sesión: no hace nada y la app sigue usando solo LocalStorage.
   Uso (en cada app, antes de </body>):
   <script src="pichisoft-datos.js" data-keys="clave1,clave2"></script>
   data-keys = nombres de las claves de localStorage que usa esa app. */
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
    var pend = {}, timers = {};
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
            if (!user) return;                       // sin cuenta: solo LocalStorage
            var uid = user.uid;
            function ref(k) { return F.doc(db, "users", uid, "data", id(k)); }

            /* 1) Al abrir: si la nube tiene datos, mandan esos; si está vacía, sube lo que hay en este dispositivo */
            var cambio = false;
            for (var i = 0; i < KEYS.length; i++) {
                var k = KEYS[i], dk = "ps_dueno__" + k, dueno = localStorage.getItem(dk);
                if (dueno && dueno !== uid) rawRemove.call(localStorage, k);   // datos de otra cuenta: no se mezclan
                rawSet.call(localStorage, dk, uid);
                var local = localStorage.getItem(k);
                var snap = await F.getDoc(ref(k));
                if (snap.exists() && typeof snap.data().v === "string") {
                    var cloud = snap.data().v;
                    if (local !== cloud) {
                        if (local !== null) rawSet.call(localStorage, k + "__respaldo", local);   // copia de seguridad
                        rawSet.call(localStorage, k, cloud);
                        cambio = true;
                    }
                } else if (local !== null) {
                    await F.setDoc(ref(k), { v: local, t: Date.now() });
                }
            }

            /* 2) Desde ahora, cada cambio de la app se guarda también en la nube */
            function flush(k) {
                clearTimeout(timers[k]);
                if (!(k in pend)) return;
                var v = pend[k]; delete pend[k];
                F.setDoc(ref(k), { v: v, t: Date.now() }).catch(function (e) { console.warn("Pichisoft: no se pudo guardar " + k, e); });
            }
            Storage.prototype.setItem = function (k, v) {
                rawSet.call(this, k, v);
                if (this === localStorage && KEYS.indexOf(k) > -1) {
                    pend[k] = String(v); clearTimeout(timers[k]);
                    timers[k] = setTimeout(function () { flush(k); }, 800);
                }
            };
            Storage.prototype.removeItem = function (k) {
                rawRemove.call(this, k);
                if (this === localStorage && KEYS.indexOf(k) > -1) { delete pend[k]; F.deleteDoc(ref(k)).catch(function () { }); }
            };
            function flushAll() { Object.keys(pend).forEach(flush); }
            document.addEventListener("visibilitychange", function () { if (document.hidden) flushAll(); });
            window.addEventListener("pagehide", flushAll);

            /* 3) Si llegaron datos nuevos de la nube, se recarga una vez para que la app los muestre */
            var rk = "ps_datos_reload_" + location.pathname;
            if (cambio && Date.now() - (+sessionStorage.getItem(rk) || 0) > 20000) {
                sessionStorage.setItem(rk, String(Date.now()));
                location.reload();
            }
        } catch (e) {
            console.warn("Pichisoft: datos en la nube no disponibles, se usa solo LocalStorage.", e);
        }
    })();
})();