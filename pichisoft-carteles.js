/* =====================================================================
   PICHISOFT · CARTELES DE ANUNCIO (v2.4)  ·  by Pichisoft
   Solo se muestran a usuarios SIN cuenta. Con cuenta no aparece nada.

   Se carga con UNA línea al final del <body>:
       <script src="pichisoft-carteles.js"></script>

   CAMBIOS v2.4:
   - PichonPass Clásico: el anuncio de entrada se activa por "#auth" (no depende
     del nombre del archivo) y no aparece en la versión premium.
   - Los 8 clics quedan bloqueados en cualquier página de PichonPass.
   - estadoSesion() ya no exige window.Pichisoft.

   CAMBIOS v2.3:
   - Detección de invitado corregida (usa PichisoftFirebase.auth.currentUser
     y onAuthStateChanged).

   CAMBIOS v2.2:
   - PichonApps ya no muestra anuncio al entrar (solo cada 8 clics).
   - El contador de clics arranca de cero en cada visita/recarga.
   - El anuncio sigue corriendo si la pestaña está en segundo plano
     (el tiempo se mide con Date.now(), no contando ticks).
   ===================================================================== */
(function () {
    'use strict';

    const SEG = 1000, MIN = 60 * SEG, HORA = 60 * MIN, DIA = 24 * HORA;

    /* =================================================================
       1) AJUSTES GENERALES
       ================================================================= */
    const AJUSTES = {
        PRUEBA: false,
        ESPERA_GLOBAL: 0,
        FINAL_MS: 10 * SEG,
        /* Selector de modales de todas las apps Pichisoft: carteles no se muestran encima */
        IGNORAR: '.pcr-ov, .ov, .pml-ov, .pm-ov, .pcf-ov, .pmO, #pmBox, [data-sin-anuncio]'
    };

    /* =================================================================
       2) LOS CARTELES (ANUNCIOS)
       ================================================================= */
    const ANUNCIOS = {
        premiumApps: {
            activo: true, max: 0, enfriamiento: 0, final: 40 * SEG,
            pantallas: [
                { titulo: 'Versión premium', texto: `¿Quieres que las apps estén ordenadas, que las puedas buscar por su nombre, y que puedas cambiar de interfaz?`, dur: 6 * SEG },
                { titulo: 'Versión premium', texto: `Hemos creado la versión premium para PichonApps, en la que, puedas ordenar las apps por tipo de app (herramientas, juegos, diversión...) y por tipo de prefijo (apps nuevas, actualizadas, en mantenimiento...).`, dur: 8 * SEG },
                { titulo: 'Versión premium', texto: `Y eso no es lo <strong>único</strong>: también puedes configurar para que las apps se abran en una nueva pestaña o en la misma, e incluso, con cuenta de Pichisoft, desbloqueas la versión premium para las aplicaciones que la tienen.`, dur: 8 * SEG },
                { titulo: 'Versión premium', texto: `Create una cuenta de Pichisoft, y empieza a ver lo que realmente se siente usar una aplicación sin anuncios, con funciones premium, y con estilos que combinen con nuestra personalidad: apreta el botón "Registrarse", create una cuenta (o si ya tienes una, inicia sesión) y disfruta de Pichisoft.`, dur: 8 * SEG }
            ],
            pantallaFinal: {
                titulo: 'Versión premium', efecto: 'brillo',
                texto: `
¿Quieres que las apps estén ordenadas, que las puedas buscar por su nombre, y que puedas cambiar de interfaz?
Hemos creado la versión premium para PichonApps, en la que, puedas ordenar las apps por tipo de app (herramientas, juegos, diversión...) y por tipo de prefijo (apps nuevas, actualizadas, en mantenimiento...). Y eso no es lo <strong>único</strong>: también puedes configurar para que las apps se abran en una nueva pestaña o en la misma, e incluso, con cuenta de Pichisoft, desbloqueas la versión premium para las aplicaciones que la tienen. Create una cuenta de Pichisoft, y empieza a ver lo que realmente se siente usar una aplicación sin anuncios, con funciones premium, y con estilos que combinen con nuestra personalidad: apreta el botón "Registrarse", create una cuenta (o si ya tienes una, inicia sesión) y disfruta de Pichisoft.

— Equipo Pichisoft.
`
            },
            opciones: [
                { texto: 'Crearse una cuenta', url: 'https://pichisoft.cc', blank: false },
                { texto: 'Cerrar anuncio', cerrar: true }
            ]
        },
        premiumPass: {
            activo: true, max: 0, enfriamiento: 0, final: 30 * SEG,
            pantallas: [
                { titulo: 'Versión premium', texto: `¿Quieres una interfaz digna de una aplicación para guardar contraseñas?`, dur: 6 * SEG },
                { titulo: 'Versión premium', texto: `¿Que puedas guardar registros con total seguridad sin tener que preocuparte?`, dur: 6 * SEG },
                { titulo: 'Versión premium', texto: `¿Que puedas hacer todo con <strong>mucha</strong> más facilidad y velocidad?`, dur: 6 * SEG },
                { titulo: 'Versión premium', texto: `Ya tenemos la versión premium de PichonPass. Para obtenerla, acceda a <a href="https://pichisoft.cc">pichisoft.cc</a> y hágase una cuenta, apretando el botón "Registrarse", o en caso de que ya tenga cuenta: "Iniciar sesión".`, dur: 8 * SEG },
                { titulo: 'Versión premium', texto: `Ya disponible, PichonPass —Versión premium—.`, efecto: 'super', dur: 6 * SEG }
            ],
            pantallaFinal: {
                titulo: 'Versión premium', efecto: 'brillo',
                texto: `
¿Quieres una interfaz digna de una aplicación para guardar contraseñas? ¿Que puedas guardar registros con total seguridad sin tener que preocuparte? ¿Que puedas hacer todo con <strong>mucha</strong> más facilidad y velocidad?
Ya tenemos la versión premium de PichonPass. Para obtenerla, acceda a <a href="https://pichisoft.cc">pichisoft.cc</a> y hágase una cuenta, apretando el botón "Registrarse", o en caso de que ya tenga cuenta: "Iniciar sesión".
Ya disponible, PichonPass —Versión premium—.
`
            },
            opciones: [
                { texto: 'Crear cuenta', url: 'https://pichisoft.cc', blank: true },
                { texto: 'Cerrar anuncio', cerrar: true }
            ]
        }
    };

    /* =================================================================
       3) DISPARADORES
       ================================================================= */
    const DISPARADORES = [
        /* PichonApps: anuncio cada 8 clics (contador desde cero en cada visita).
           NUNCA en páginas de PichonPass (la regex excluye cualquier ruta con "pichonpass"). */
        { nombre: 'apps-clics', activo: true, tipo: 'click', si: '#cuenta', pagina: '^(?!.*pichonpass)', selector: 'body', anuncios: ['premiumApps'], cada: 8 },
        /* PichonApps: SIN anuncio al entrar */
        { nombre: 'apps-entrada', activo: false, tipo: 'entrada', si: '#cuenta', anuncios: ['premiumApps'], retraso: 1500 },
        /* PichonPass Clásico: UN anuncio al entrar (al venir del botón "Usar versión clásica").
           Se activa en la página que tiene el login (#auth) y NO en la versión premium. */
        { nombre: 'pass-entrada', activo: true, tipo: 'entrada', si: '#auth', pagina: '^(?!.*pichonpass(\\.html)?$)', anuncios: ['premiumPass'], retraso: 1500 }
    ];

    /* ================================================================
       A PARTIR DE ACÁ NO HACE FALTA TOCAR NADA
       ================================================================ */

    const KEY = 'ps_carteles';
    const nuevoEstado = () => ({ g: 0, a: {}, c: {}, r: {} });
    let estado = (() => {
        try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && typeof v === 'object') return Object.assign(nuevoEstado(), v); } catch { }
        return nuevoEstado();
    })();
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(estado)); } catch { } };

    /* Contadores de clics SOLO EN MEMORIA: arrancan de cero en cada visita/recarga */
    const contadores = {};

    let abierto = false;

    /* ================================================================
       estadoSesion(): detecta si hay cuenta o es invitado.
       - Lee el usuario de Pichisoft.user y de PichisoftFirebase.auth.currentUser
       - Escucha onAuthStateChanged para saber cuándo Firebase terminó de
         restaurar la sesión (así no se confunde a un logueado con invitado).
       - Si no se puede escuchar, usa un margen de 4 s desde la carga.
       ================================================================ */
    let authListo = false, authUsuario = null, authEscuchando = false;
    function escucharAuth() {
        if (authEscuchando) return;
        const A = window.PichisoftFirebase && window.PichisoftFirebase.auth;
        if (!A || typeof A.onAuthStateChanged !== 'function') return;
        authEscuchando = true;
        try { A.onAuthStateChanged(u => { authListo = true; authUsuario = u || null; }); }
        catch { authEscuchando = false; }
    }
    function estadoSesion() {
        try {
            escucharAuth();
            const P = window.Pichisoft, F = window.PichisoftFirebase;
            const fbUser = F ? (F.currentUser !== undefined ? F.currentUser : (F.auth ? F.auth.currentUser : undefined)) : undefined;

            /* Cualquier fuente dice "logueado" → cuenta */
            if ((P && P.user) || fbUser || authUsuario) return 'cuenta';

            /* Invitado solo si Firebase ya respondió:
               - PichonPass Clásico: PichisoftFirebase se crea recién al responder Firebase
                 (currentUser === null explícito)
               - PichonApps: onAuthStateChanged ya disparó, o pasaron 4 s */
            if (F) {
                const resuelto = authListo || F.currentUser === null || (F.currentUser === undefined && performance.now() > 4000);
                if (resuelto) return 'invitado';
            }
        } catch { }
        return 'desconocido';
    }
    const esInvitado = () => estadoSesion() === 'invitado';

    const limpiar = s => String(s == null ? '' : s).replace(/^\r?\n/, '').replace(/\r?\n[ \t]*$/, '');

    /* Texto con formato seguro */
    const ETQ = { strong: 'strong', b: 'strong', em: 'em', i: 'em', a: 'a' };
    function rico(el, texto) {
        el.replaceChildren();
        const s = limpiar(texto), re = /<(\/?)(strong|b|em|i|a)((?:\s+href="[^"]*")?)\s*>/gi, pila = [el];
        let ult = 0, m;
        const act = () => pila[pila.length - 1];
        while ((m = re.exec(s))) {
            if (m.index > ult) act().append(document.createTextNode(s.slice(ult, m.index)));
            ult = re.lastIndex;
            const tag = ETQ[m[2].toLowerCase()];
            if (m[1] === '/') { if (pila.length > 1 && act().tagName.toLowerCase() === tag) pila.pop(); }
            else {
                const n = document.createElement(tag);
                if (tag === 'a') {
                    const h = (/href="([^"]*)"/i.exec(m[3]) || [])[1] || '';
                    if (/^(https?:|mailto:)/i.test(h)) { n.href = h; n.target = '_blank'; n.rel = 'noopener noreferrer'; }
                }
                act().append(n); pila.push(n);
            }
        }
        if (ult < s.length) act().append(document.createTextNode(s.slice(ult)));
    }

    function globalOK(forzar) {
        if (AJUSTES.PRUEBA || forzar || !AJUSTES.ESPERA_GLOBAL) return true;
        return Date.now() - (estado.g || 0) >= AJUSTES.ESPERA_GLOBAL;
    }

    function elegible(id, forzar) {
        const a = ANUNCIOS[id];
        if (!a || a.activo === false) return false;
        if (AJUSTES.PRUEBA || forzar) return true;
        const ahora = Date.now(), s = estado.a[id] || { n: 0, t: 0 };
        if (a.desde && ahora < new Date(a.desde + 'T00:00:00').getTime()) return false;
        if (a.hasta && ahora > new Date(a.hasta + 'T23:59:59').getTime()) return false;
        if (a.max && s.n >= a.max) return false;
        if (a.enfriamiento && ahora - s.t < a.enfriamiento) return false;
        return true;
    }

    function elegirDe(lista, clave) {
        if (!lista || !lista.length || !globalOK()) return null;
        const ini = estado.r[clave] || 0;
        for (let i = 0; i < lista.length; i++) {
            const k = (ini + i) % lista.length;
            if (elegible(lista[k])) { estado.r[clave] = k + 1; guardar(); return lista[k]; }
        }
        return null;
    }

    const aplica = t => (!t.pagina || new RegExp(t.pagina).test(location.pathname)) && (!t.si || !!document.querySelector(t.si));

    /* ---------------------------- ESTILOS ---------------------------- */
    const CSS = `
.pcr-ov{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;overflow:auto;background:rgba(0,0,0,.72);backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0);opacity:0;transition:opacity .45s ease,backdrop-filter .45s ease,-webkit-backdrop-filter .45s ease}
.pcr-ov.on{opacity:1;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.pcr-ov.off{opacity:0;backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0)}
.pcr-card{--g:#d4af37;--g2:#f1d98a;--px:22px;position:relative;width:min(640px,100%);box-sizing:border-box;margin:auto;overflow:hidden;padding:18px var(--px) 0;color:#fff;background:linear-gradient(180deg,#181818,#0b0b0b);border:2px solid var(--g);border-radius:18px;box-shadow:0 0 0 1px rgba(212,175,55,.18),0 30px 80px rgba(0,0,0,.85),0 0 44px rgba(212,175,55,.12);opacity:0;transform:translateY(28px) scale(.94);transition:opacity .5s ease,transform .6s cubic-bezier(.2,.9,.25,1.08),height .5s ease}
.pcr-card:focus{outline:none}
.pcr-ov.on .pcr-card{opacity:1;transform:none}
.pcr-ov.off .pcr-card{opacity:0;transform:translateY(20px) scale(.96);transition:opacity .35s ease,transform .38s ease}
.pcr-card.pulso{animation:pcrGlow 1.5s ease-out}
@keyframes pcrGlow{0%{box-shadow:0 0 0 1px rgba(212,175,55,.18),0 30px 80px rgba(0,0,0,.85),0 0 44px rgba(212,175,55,.12)}35%{box-shadow:0 0 0 2px rgba(241,217,138,.7),0 30px 80px rgba(0,0,0,.85),0 0 90px rgba(212,175,55,.55)}100%{box-shadow:0 0 0 1px rgba(212,175,55,.18),0 30px 80px rgba(0,0,0,.85),0 0 44px rgba(212,175,55,.12)}}
.pcr-head{display:grid;grid-template-columns:auto 1fr auto;align-items:start;gap:14px}
.pcr-izq{display:flex;align-items:baseline;flex-wrap:wrap;gap:3px 8px;min-height:30px}
.pcr-lbl{font:bold 1.15rem "Times New Roman",Times,serif;color:#fff}
.pcr-by{font:italic normal .72rem Verdana,"Open Sans",sans-serif;color:#8d8d8d}
.pcr-tit{margin:0;align-self:center;text-align:center;font:bold clamp(1.35rem,4.2vw,2rem)/1.2 "Times New Roman",Times,serif;color:#fff;white-space:pre-wrap;word-break:break-word}
.pcr-x{position:relative;width:30px;height:30px;padding:0;border:1.5px solid var(--g);border-radius:50%;background:none;cursor:pointer;transition:transform .3s,background .2s,opacity .3s}
.pcr-x::before,.pcr-x::after{content:"";position:absolute;left:50%;top:50%;width:12px;height:2px;margin:-1px 0 0 -6px;border-radius:2px;background:var(--g2);transition:background .2s}
.pcr-x::before{transform:rotate(45deg)}
.pcr-x::after{transform:rotate(-45deg)}
.pcr-x:disabled{opacity:.28;cursor:not-allowed}
.pcr-x:not(:disabled):hover{transform:rotate(90deg);background:var(--g)}
.pcr-x:not(:disabled):hover::before,.pcr-x:not(:disabled):hover::after{background:#111}
.pcr-x:focus-visible{outline:2px solid var(--g2);outline-offset:2px}
.pcr-x.lista{animation:pcrPulso 1.5s ease-out 2}
@keyframes pcrPulso{0%{box-shadow:0 0 0 0 rgba(212,175,55,.6)}100%{box-shadow:0 0 0 14px rgba(212,175,55,0)}}
.pcr-d{transition:opacity .28s ease,transform .28s ease}
.pcr-d.out{opacity:0;transform:translateY(8px)}
.pcr-d.esp-brillo{animation:pcrBrillo .95s cubic-bezier(.2,.8,.2,1) both}
.pcr-d.esp-super{animation:pcrSuper 1.15s cubic-bezier(.2,.9,.25,1.05) both}
@keyframes pcrBrillo{0%{opacity:0;transform:translateY(16px) scale(.97);filter:blur(8px)}100%{opacity:1;transform:none;filter:blur(0)}}
@keyframes pcrSuper{0%{opacity:0;transform:scale(1.4);filter:blur(14px)}55%{opacity:1;transform:scale(.97);filter:blur(0)}100%{opacity:1;transform:none;filter:blur(0)}}
.pcr-brillo{position:absolute;inset:0;pointer-events:none;z-index:3;opacity:0;background:linear-gradient(105deg,transparent 35%,rgba(241,217,138,.30) 50%,transparent 65%);transform:translateX(-120%)}
.pcr-brillo.go{animation:pcrBarrido 1.2s ease-out}
@keyframes pcrBarrido{0%{opacity:1;transform:translateX(-120%)}100%{opacity:1;transform:translateX(120%)}}
.pcr-desc{margin:16px 0 0;font:.95rem/1.7 Verdana,"Open Sans",sans-serif;color:#c4c4c4;white-space:pre-wrap;word-break:break-word}
.pcr-desc[hidden]{display:none}
.pcr-desc strong,.pcr-tit strong{color:#fff;font-weight:bold}
.pcr-desc a,.pcr-desc a:visited{color:#4da3ff;font-weight:bold;text-decoration:underline}
.pcr-desc a:hover{color:#8cc4ff}
.pcr-ops{display:flex;flex-direction:column;gap:9px;margin-top:20px}
.pcr-ops:empty{display:none}
.pcr-op{display:block;width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid var(--g2);border-radius:10px;cursor:pointer;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5);font:1rem Georgia,"Times New Roman",serif;background:linear-gradient(135deg,#2b2107,#100c02) left/0% 100% no-repeat,linear-gradient(135deg,#d4af37,#a67c12);transition:background-size .35s ease,transform .2s,box-shadow .25s,border-color .25s,opacity .3s}
.pcr-op:not(:disabled):hover{background-size:100% 100%,100% 100%;border-color:var(--g);transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.55)}
.pcr-op:disabled{opacity:.4;cursor:not-allowed}
.pcr-op:focus-visible{outline:2px solid var(--g2);outline-offset:2px}
.pcr-pie{display:flex;justify-content:space-between;gap:4px 12px;margin:18px calc(var(--px) * -1) 0;padding:10px var(--px) 13px;border-top:1px solid rgba(212,175,55,.18);font:.68rem Verdana,"Open Sans",sans-serif;color:#8d8d8d}
.pcr-barra{position:absolute;left:0;bottom:0;width:100%;height:3px;background:linear-gradient(90deg,#b8901f,#f1d98a);transform-origin:left;transform:scaleX(0);transition:transform .12s linear}
@media (max-width:560px){.pcr-card{--px:16px;padding-top:16px;border-radius:16px}.pcr-head{grid-template-columns:1fr auto}.pcr-tit{grid-column:1/-1;grid-row:2;margin-top:12px}.pcr-pie{flex-direction:column}}
@media (prefers-reduced-motion:reduce){.pcr-ov,.pcr-card,.pcr-d,.pcr-x,.pcr-op,.pcr-barra{transition:none!important;animation:none!important}.pcr-brillo{display:none}}
`;
    function inyectarCSS() {
        if (document.getElementById('pcrCss')) return;
        const st = document.createElement('style'); st.id = 'pcrCss'; st.textContent = CSS; document.head.appendChild(st);
    }

    function continuar(d) {
        if (!d) return;
        if (d.blank) {
            const w = window.open(d.href, '_blank');
            if (w) { try { w.opener = null; } catch { } } else location.href = d.href;
        } else location.href = d.href;
    }
    function abrirUrl(url, blank) {
        if (blank === false) location.href = url;
        else { const w = window.open(url, '_blank'); if (w) { try { w.opener = null; } catch { } } }
    }

    /* ----------------------------- EL CARTEL ----------------------------- */
    function construir(a, o) {
        abierto = true;
        inyectarCSS();

        const pant = (a.pantallas && a.pantallas.length ? a.pantallas : [{ titulo: '', texto: '' }])
            .map(p => Object.assign({}, p, { dur: Math.max(1500, p.dur || 6 * SEG) }));
        const pf = a.pantallaFinal || null;
        const total = pant.reduce((s, p) => s + p.dur, 0);
        const final = a.final == null ? AJUSTES.FINAL_MS : a.final;
        const datos = i => (i < pant.length ? pant[i] : pf);
        const opsDe = p => p.opciones || a.opciones || [];
        const opsKey = p => JSON.stringify(opsDe(p).map(op => [op.texto, op.url, !!op.cerrar]));
        const focoPrevio = document.activeElement;
        const overflowPrevio = document.documentElement.style.overflow;

        const ov = document.createElement('div'); ov.className = 'pcr-ov';
        ov.innerHTML =
            '<div class="pcr-card" role="dialog" aria-modal="true" aria-label="Anuncio" tabindex="-1">' +
            '<div class="pcr-head">' +
            '<div class="pcr-izq"><span class="pcr-lbl">Anuncio</span><span class="pcr-by">- By Pichisoft -</span></div>' +
            '<h2 class="pcr-tit pcr-d"></h2>' +
            '<button class="pcr-x" type="button" disabled aria-label="Cerrar anuncio" title="Podrás cerrarlo cuando termine el anuncio"></button>' +
            '</div>' +
            '<p class="pcr-desc pcr-d"></p>' +
            '<div class="pcr-ops pcr-d"></div>' +
            '<div class="pcr-pie"><span class="pcr-msg"></span><span class="pcr-dest"></span></div>' +
            '<div class="pcr-brillo"></div>' +
            '<div class="pcr-barra"></div>' +
            '</div>';
        const card = ov.querySelector('.pcr-card'), tit = ov.querySelector('.pcr-tit'), desc = ov.querySelector('.pcr-desc'),
            ops = ov.querySelector('.pcr-ops'), x = ov.querySelector('.pcr-x'), msg = ov.querySelector('.pcr-msg'),
            dest = ov.querySelector('.pcr-dest'), barra = ov.querySelector('.pcr-barra'), brillo = ov.querySelector('.pcr-brillo');
        if (o.destino) dest.textContent = 'Al cerrar se abrirá la app que elegiste.';

        let idx = 0, mostrado = 0, t = 0, terminado = false, cerrando = false, ultimoMsg = '', finTerminada = false;

        function pintar(i, sinTit, sinOps) {
            const p = datos(i); mostrado = i;
            if (!sinTit) rico(tit, p.titulo);
            rico(desc, p.texto); desc.hidden = !limpiar(p.texto);
            if (!sinOps) {
                ops.replaceChildren();
                opsDe(p).forEach(op => {
                    const b = document.createElement('button'); b.type = 'button'; b.className = 'pcr-op'; b.textContent = op.texto || 'Aceptar';
                    if (op.cerrar) { b.dataset.cierra = '1'; b.disabled = !terminado; }
                    b.onclick = () => {
                        if (op.url) abrirUrl(op.url, op.blank);
                        if (op.cerrar) cerrar(op.accion);
                        else if (typeof op.accion === 'function') { try { op.accion(); } catch (e) { console.error(e); } }
                    };
                    ops.append(b);
                });
            }
        }

        function cambiar(i) {
            const p = datos(i), q = datos(mostrado), esp = p.efecto === 'super' ? 'super' : (p.efecto === 'brillo' ? 'brillo' : '');
            const mismoTit = limpiar(p.titulo) === limpiar(q.titulo), mismasOps = opsKey(p) === opsKey(q);
            const ds = [desc]; if (!mismoTit) ds.push(tit); if (!mismasOps) ds.push(ops);
            const h0 = card.offsetHeight;
            card.style.height = h0 + 'px';
            ds.forEach(e => e.classList.add('out'));
            setTimeout(() => {
                if (cerrando) return;
                pintar(i, mismoTit, mismasOps);
                card.style.height = 'auto'; const h1 = card.offsetHeight;
                card.style.height = h0 + 'px'; void card.offsetHeight; card.style.height = h1 + 'px';
                ds.forEach(e => { e.classList.remove('out'); if (esp) e.classList.add('esp-' + esp); });
                if (esp) {
                    brillo.classList.remove('go'); void brillo.offsetWidth; brillo.classList.add('go');
                    if (esp === 'super') { card.classList.remove('pulso'); void card.offsetWidth; card.classList.add('pulso'); }
                }
                setTimeout(() => {
                    card.style.height = '';
                    ds.forEach(e => e.classList.remove('esp-brillo', 'esp-super'));
                    brillo.classList.remove('go'); card.classList.remove('pulso');
                }, esp ? 1300 : 520);
            }, esp ? 420 : 300);
        }

        function terminar() {
            terminado = true;
            x.disabled = false; x.title = 'Cerrar'; x.classList.add('lista');
            ops.querySelectorAll('[data-cierra]').forEach(b => { b.disabled = false; });
        }

        function setMsg(s) { if (s !== ultimoMsg) { msg.textContent = s; ultimoMsg = s; } }

        function tick() {
            if (finTerminada) return;
            if (t >= total && !terminado) terminar();
            let n = 0, acc = pant[0].dur;
            while (t >= acc && n < pant.length - 1) acc += pant[++n].dur;
            if (t >= total && pf) n = pant.length;
            if (n !== idx) { idx = n; cambiar(n); }
            if (t < total) {
                setMsg('Podrás cerrar este anuncio en ' + Math.ceil((total - t) / SEG) + ' s');
                barra.style.transform = 'scaleX(' + (t / total) + ')';
            } else if (final > 0) {
                const resto = final - (t - total);
                setMsg('Se cerrará solo en ' + Math.max(0, Math.ceil(resto / SEG)) + ' s · o toca la X');
                barra.style.transform = 'scaleX(' + Math.max(0, resto / final) + ')';
                if (resto <= 0) cerrar();
            } else {
                setMsg('Ya puedes cerrarlo con la X');
                barra.style.transform = 'scaleX(1)';
                finTerminada = true;
                clearInterval(iv);
            }
        }

        /* FIX: el tiempo se mide con el reloj real (Date.now), así el anuncio
           sigue avanzando aunque la pestaña esté en segundo plano y el navegador
           frene los timers. Ya no se pausa con document.hidden. */
        let ultimo = Date.now();
        const iv = setInterval(() => {
            if (cerrando) return;
            const ahora = Date.now();
            t += ahora - ultimo;
            ultimo = ahora;
            tick();
        }, 100);
        const tecla = e => { if (e.key === 'Escape' && terminado) cerrar(); };

        function cerrar(extra) {
            if (cerrando) return; cerrando = true;
            clearInterval(iv); document.removeEventListener('keydown', tecla);
            if (o.destino) continuar(o.destino);
            ov.classList.remove('on'); ov.classList.add('off');
            setTimeout(() => {
                ov.remove(); abierto = false;
                document.documentElement.style.overflow = overflowPrevio;
                try { if (typeof extra === 'function') extra(); } catch (e) { console.error(e); }
                try { if (typeof o.alCerrar === 'function') o.alCerrar(); } catch (e) { console.error(e); }
                try { if (focoPrevio && focoPrevio.focus) focoPrevio.focus(); } catch { }
            }, 430);
        }

        x.onclick = () => cerrar();
        document.addEventListener('keydown', tecla);
        pintar(0); tick();
        document.documentElement.style.overflow = 'hidden';
        document.body.append(ov);
        void ov.offsetHeight;
        requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('on'); card.focus({ preventScroll: true }); }));
    }

    function mostrar(id, o) {
        o = o || {};
        if (abierto || !esInvitado()) return false;
        if (!elegible(id, o.forzar) || !globalOK(o.forzar)) return false;
        const s = estado.a[id] || { n: 0, t: 0 };
        estado.a[id] = { n: s.n + 1, t: Date.now() }; estado.g = Date.now(); guardar();
        construir(ANUNCIOS[id], o);
        return true;
    }

    function destinoDe(el, e) {
        const a = el.closest('a[href]');
        if (!a || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return null;
        const h = a.getAttribute('href') || '';
        if (!h || h[0] === '#' || /^javascript:/i.test(h) || a.hasAttribute('download')) return null;
        return { href: a.href, blank: a.target === '_blank' };
    }

    function alClic(e) {
        if (!e.isTrusted || abierto || !esInvitado() || !e.target.closest) return;
        if (e.target.closest(AJUSTES.IGNORAR)) return;

        const d = e.target.closest('[data-anuncio]');
        if (d) {
            const dest = destinoDe(e.target, e);
            if (mostrar(d.dataset.anuncio, { destino: dest }) && dest) e.preventDefault();
            return;
        }

        for (const tr of DISPARADORES) {
            if (tr.tipo !== 'click' || tr.activo === false || !aplica(tr)) continue;
            if (!e.target.closest(tr.selector)) continue;
            /* Contador en memoria: arranca de cero en cada visita */
            contadores[tr.nombre] = (contadores[tr.nombre] || 0) + 1;
            if (!AJUSTES.PRUEBA) {
                if (contadores[tr.nombre] % (tr.cada || 1) !== 0) continue;
                if (tr.prob != null && Math.random() > tr.prob) continue;
            }
            const id = elegirDe(tr.anuncios, tr.nombre); if (!id) continue;
            const dest = destinoDe(e.target, e);
            if (mostrar(id, { destino: dest })) { if (dest) e.preventDefault(); return; }
        }
    }

    /* Espera a que no haya modales abiertos y a que se confirme la sesión */
    function cuandoLibre(fn) {
        const ini = Date.now();
        const iv = setInterval(() => {
            const s = estadoSesion();
            if (s === 'cuenta' || Date.now() - ini > 2 * MIN) { clearInterval(iv); return; }
            if (s === 'invitado' && !abierto && !document.querySelector(AJUSTES.IGNORAR)) {
                clearInterval(iv); fn();
            }
        }, 600);
    }

    function iniciar() {
        DISPARADORES.filter(t => t.tipo === 'entrada' && t.activo !== false && aplica(t)).forEach(t => {
            setTimeout(() => cuandoLibre(() => { const id = elegirDe(t.anuncios, t.nombre); if (id) mostrar(id); }), t.retraso || 0);
        });
        document.addEventListener('click', alClic, true);
    }

    window.PichonAnuncios = {
        mostrar,
        antesDe(id, fn, o) { if (!mostrar(id, Object.assign({}, o, { alCerrar: fn }))) { try { fn && fn(); } catch (e) { console.error(e); } } },
        definir(id, obj) { ANUNCIOS[id] = obj; },
        reiniciar() { estado = nuevoEstado(); guardar(); Object.keys(contadores).forEach(k => delete contadores[k]); }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
