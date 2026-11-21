/* =====================================================================
   PICHISOFT ATAJOS Y CONSOLA · by Pichisoft
   <script src="pichisoft-atajos.js"></script> al final del <body>
   Teclas: Ctrl (o Cmd) o Alt + letra. Acordes: Ctrl+M,F · Ctrl+P,P · Ctrl+P,C
   ===================================================================== */
(function () {
    'use strict';
    if (window.PichisoftAtajos) return;

    const BASE = 'https://pichisoft.cc/';
    const GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=contacto@pichisoft.cc';
    const APPS = {
        alarm: 'pichonalarm', birthday: 'pichonbirthday', calc: 'pichoncalc', calendar: 'pichoncalendar',
        chess: 'pichonchess', code: 'pichoncode', destiny: 'pichondestiny', docs: 'pichondocs', food: 'pichonfood',
        list: 'pichonlist', man: 'pichman', morse: 'pichonmorse', paint: 'pichonpaint', pass: 'pichonpass',
        push: 'pichonpush', random: 'pichonrandom', snake: 'pichonsnake', traffic: 'pichontraffic',
        watch: 'pichonwatch', weather: 'pichonweather'
    };
    const PROXIMAS = ['olympus', 'opinion'];

    const conCuenta = () => !!(window.Pichisoft && window.Pichisoft.user);
    const editable = t => !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const SEL_MODALES = '.ov,.pf-modal.open,#pf-share-ov.open,.psc-ov,.psc-pv-ov,.psc-reset-ov,.pcm-ov,.pcm-dov,.psi-ov,.pm-ov,.pcr-ov,.pml-ov,.pcf-ov';
    const hayModal = () => !!document.querySelector(SEL_MODALES);
    const clic = s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; };

    /* ------------------------- Acciones ------------------------- */
    const A = {
        buscar() { const q = document.getElementById('pQ'); if (!q || !q.offsetParent) return; q.scrollIntoView({ block: 'center' }); q.focus(); q.select(); },
        config() { clic('#pGear'); },
        traducir() { window.PichisoftIdiomas && window.PichisoftIdiomas.abrir(); },
        chat() { window.PichisoftMensajeria && window.PichisoftMensajeria.abrir('chat'); },
        amigos() { window.PichisoftMensajeria && window.PichisoftMensajeria.abrir('amigos'); },
        perfil() { if (typeof window.editarPerfil === 'function') window.editarPerfil(); },
        compartir() { clic('#pf-share-btn'); },
        coins() { window.PichiCoins && window.PichiCoins.abrir(); },
        panel(k) { clic('.pf-btn[data-pf="' + k + '"]'); },
        consola() { alternarConsola(); }
    };

    /* ------------------------- Atajos ------------------------- */
    const TECLAS = {
        KeyK: { cuenta: true, run: A.buscar },
        KeyS: { run: e => (e.shiftKey || !conCuenta()) ? A.compartir() : A.config() },
        KeyT: { cuenta: true, run: A.traducir },
        KeyM: { cuenta: true, chord: true, run: A.chat },
        KeyP: { chord: true, run: () => { if (conCuenta()) A.perfil(); } },
        KeyC: { run: A.coins, sinSeleccion: true },
        KeyU: { run: () => A.panel('sobre') },
        KeyA: { run: () => A.panel('faq'), sinSeleccion: true },
        KeyI: { run: () => A.panel('info') },
        KeyR: { run: () => A.panel('reglas') },
        KeyH: { run: () => A.panel('ayuda') }
    };
    const ACORDES = {
        KeyM: { KeyF: A.amigos },
        KeyP: { KeyP: () => A.panel('privacidad'), KeyC: () => A.panel('cookies') }
    };

    let pend = null;
    function soltarPend() {
        if (!pend) return;
        clearTimeout(pend.t);
        const f = pend.fn; pend = null;
        try { f(); } catch (e) { console.error(e); }
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && consolaAbierta()) { cerrarConsola(); return; }
        if (e.repeat) return;

        /* segunda tecla de un acorde */
        if (pend) {
            const f = ACORDES[pend.code] && ACORDES[pend.code][e.code];
            if (f) { e.preventDefault(); clearTimeout(pend.t); pend = null; f(); return; }
            soltarPend();
        }

        const mod = e.ctrlKey || e.metaKey || e.altKey;
        if (!mod) return;

        const esSlash = e.code === 'Slash' || e.code === 'NumpadDivide' ||
            e.key === '/' || e.key === '÷';
        if (esSlash) { e.preventDefault(); alternarConsola(); return; }
        if (editable(e.target) || hayModal()) return;

        const d = TECLAS[e.code];
        if (!d) return;
        if (d.cuenta && !conCuenta()) return;                       // se deja el atajo del navegador
        if (d.sinSeleccion && !e.altKey && String(window.getSelection()).length) return;

        e.preventDefault();
        if (d.chord) {
            pend = { code: e.code, fn: () => d.run(e), t: setTimeout(soltarPend, 600) };
            return;
        }
        d.run(e);
    }, true);

    /* ------------------------- Consola ------------------------- */
    const CSS = `
.ps-con-card{background:#000!important;border:2px solid var(--gold,#d4af37)!important}
.ps-con-body{padding:16px;font-family:"Courier New",Consolas,monospace;color:#fff;display:flex;flex-direction:column;gap:10px;min-height:0}
.ps-con-log{max-height:45vh;overflow-y:auto;white-space:pre-wrap;word-break:break-word;font-size:.9rem;line-height:1.5;user-select:text;-webkit-user-select:text}
.ps-con-log .cmd{color:var(--gold2,#f1d98a)}
.ps-con-hint{color:#fff;font-size:.9rem}
.ps-con-row{display:flex;gap:8px;align-items:center;border-top:1px solid #333;padding-top:10px}
.ps-con-row input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#fff;font:16px "Courier New",Consolas,monospace}
`;
    let con = null, log = null, inp = null;
    const hist = []; let hi = 0;

    function imprimir(t, cls) {
        const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = t;
        log.append(d); log.scrollTop = log.scrollHeight;
    }
    function crearConsola() {
        if (con) return;
        const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
        con = document.createElement('div');
        con.className = 'pf-modal'; con.id = 'ps-con'; con.setAttribute('translate', 'no');
        con.setAttribute('role', 'dialog'); con.setAttribute('aria-modal', 'true');
        con.innerHTML = '<div class="pf-card ps-con-card"><div class="pf-header"><h2>Consola</h2>' +
            '<button class="pf-close" type="button" aria-label="Cerrar ventana">✕</button></div>' +
            '<div class="ps-con-body"><div class="ps-con-log"></div>' +
            '<div class="ps-con-hint">Escribe /commands para ver la lista de comandos.</div>' +
            '<div class="ps-con-row"><span>&gt;</span><input type="text" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="Escribe un comando"></div></div></div>';
        document.body.append(con);
        log = con.querySelector('.ps-con-log'); inp = con.querySelector('input');
        con.querySelector('.pf-close').onclick = cerrarConsola;
        con.addEventListener('click', e => { if (e.target === con) cerrarConsola(); else if (!window.getSelection().toString()) inp.focus(); });
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); const v = inp.value.trim(); inp.value = ''; if (v) { hist.push(v); hi = hist.length; ejecutar(v); } }
            else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) inp.value = hist[--hi]; }
            else if (e.key === 'ArrowDown') { e.preventDefault(); inp.value = hi < hist.length - 1 ? hist[++hi] : (hi = hist.length, ''); }
        });
    }
    const consolaAbierta = () => !!(con && con.classList.contains('open'));
    function abrirConsola() {
        if (hayModal() && !consolaAbierta()) return;
        crearConsola();
        con.classList.add('open');
        document.documentElement.style.overflow = 'hidden';
        setTimeout(() => inp.focus(), 50);
    }
    function cerrarConsola() {
        if (!con) return;
        con.classList.remove('open');
        document.documentElement.style.overflow = '';
    }
    function alternarConsola() { consolaAbierta() ? cerrarConsola() : abrirConsola(); }

    /* Cierra la consola y abre otra cosa */
    const ir = fn => () => { cerrarConsola(); setTimeout(fn, 80); };
    const nuevaPestana = url => { cerrarConsola(); const w = window.open(url, '_blank'); if (w) { try { w.opener = null; } catch { } } };

    const CMDS = {
        commands: { d: 'Muestra esta lista', run: listar },
        settings: { d: 'Abre Configuración', cuenta: 1, run: ir(A.config) },
        translate: { d: 'Abre Traducir', cuenta: 1, run: ir(A.traducir) },
        community: { d: 'Abre Mensajería', cuenta: 1, run: ir(A.chat) },
        search: { d: 'Va a la barra de búsqueda de apps', cuenta: 1, run: ir(A.buscar) },
        coins: { d: 'Abre PichiCoins', run: ir(A.coins) },
        about: { d: 'Abre Sobre nosotros', run: ir(() => A.panel('sobre')) },
        faq: { d: 'Abre Preguntas frecuentes', run: ir(() => A.panel('faq')) },
        info: { d: 'Abre Información general', run: ir(() => A.panel('info')) },
        rules: { d: 'Abre Nuestras reglas', run: ir(() => A.panel('reglas')) },
        'privacy-policy': { d: 'Abre la Política de Privacidad (o /pp)', run: ir(() => A.panel('privacidad')) },
        cookies: { d: 'Abre la Política de Cookies', run: ir(() => A.panel('cookies')) },
        share: { d: 'Abre Compartir', run: ir(A.compartir) },
        help: { d: 'Abre Ayuda (atajos de teclado)', run: ir(() => A.panel('ayuda')) },
        ask: { d: 'Escribinos por Gmail (contacto@pichisoft.cc)', run: () => nuevaPestana(GMAIL) }
    };
    CMDS.pp = CMDS['privacy-policy'];

    function listar() {
        const l = ['Comandos disponibles:'];
        Object.keys(CMDS).filter(k => k !== 'pp').forEach(k => l.push(('/' + k).padEnd(18) + CMDS[k].d + (CMDS[k].cuenta ? '  [con cuenta]' : '')));
        l.push('/app_<nombre>'.padEnd(18) + 'Abre una app. Nombres: ' + Object.keys(APPS).join(', '));
        l.push('', 'Atajos: Ctrl+/ abre esta consola. Mirá el panel Ayuda para el resto.');
        imprimir(l.join('\n'));
    }

    function ejecutar(txt) {
        imprimir('> ' + txt, 'cmd');
        let c = txt.toLowerCase().trim();
        if (c[0] !== '/') c = '/' + c;
        c = c.slice(1);
        if (c.startsWith('app_')) {
            const n = c.slice(4);
            if (APPS[n]) return nuevaPestana(BASE + APPS[n] + '.html');
            if (PROXIMAS.includes(n)) return imprimir('Esa app todavía no está disponible (próximamente).');
            return imprimir('No existe esa app. Apps: ' + Object.keys(APPS).join(', '));
        }
        const m = CMDS[c];
        if (!m) return imprimir('Comando no reconocido. Escribe /commands para ver la lista de comandos.');
        if (m.cuenta && !conCuenta()) return imprimir('Este comando es solo para usuarios con cuenta de Pichisoft.');
        m.run();
    }

    window.PichisoftAtajos = { consola: alternarConsola };
    document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#pf-consola')) abrirConsola(); });
})();
