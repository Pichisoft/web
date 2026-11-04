/* =====================================================================
   PICHISOFT IDIOMAS  ·  by Pichisoft
   Se carga con UNA línea al final del <body> de cada página:
       <script src="pichisoft-idiomas.js"></script>
   Opcional:
       data-anchor="#selector"  -> el botón se ubica debajo de ese elemento (por defecto #cuenta)
       data-skip=".a,.b"        -> selectores extra que NO se deben traducir
       data-pos="tl|tr|bl|br"   -> fuerza una esquina (top-left, top-right, bottom-left, bottom-right)
   Para que algo no se traduzca nunca, ponele translate="no" o class="notranslate".
   ===================================================================== */
(function () {
    'use strict';
    if (window.PichisoftIdiomas) return;

    const SCRIPT = document.currentScript;
    const CFG = {
        provider: 'mymemory',      // 'mymemory' (ya permitido en tu CSP) | 'google' (sin clave, requiere permitir translate.googleapis.com en connect-src)
        email: '',                 // opcional, solo MyMemory: un email real sube el límite diario gratuito
        concurrency: 4,
        anchor: (SCRIPT && SCRIPT.dataset.anchor) || '#cuenta',
        skip: (SCRIPT && SCRIPT.dataset.skip) || ''
    };

    /* -------------------- EXCEPCIONES POR APP --------------------
       Si una app necesita una esquina fija, agregala acá.
       match:   regex contra document.title + location.pathname (case-insensitive)
       pos:     'tl' | 'tr' | 'bl' | 'br'
       offsetX: píxeles EXTRA desde el borde horizontal (mueve el botón hacia adentro)
       offsetY: píxeles EXTRA desde el borde vertical  (mueve el botón hacia arriba/abajo)
    ------------------------------------------------------------- */
    const APP_POSITIONS = [
        { match: /pichonsnake/i, pos: 'tl' },                                // arriba a la izquierda
        { match: /pichonpaint/i, pos: 'br', offsetX: 60 },                   // abajo-derecha, ~1.5x más a la izquierda
        { match: /pichoncode/i, pos: 'bl', offsetY: 60 },                   // abajo-izquierda, un botón más arriba
        { match: /pichonpush/i, pos: 'br' },                                // abajo-derecha
    ];

    function getAppPosition() {
        if (SCRIPT && SCRIPT.dataset.pos) {
            return { pos: SCRIPT.dataset.pos, offsetX: 0, offsetY: 0 };
        }
        const hay = (document.title + ' ' + location.pathname).toLowerCase();
        for (const o of APP_POSITIONS) {
            if (o.match.test(hay)) {
                return { pos: o.pos, offsetX: o.offsetX || 0, offsetY: o.offsetY || 0 };
            }
        }
        return null;
    }

    const CODES = [...new Set(('ab ace af ak sq am ar an hy as av ay az ba bm eu be bn bho bi bs br bg my ca ceb ch ce ny zh-CN zh-TW cv kw co hr cs da dv nl dz en eo et ee fo fj tl fi fr ff gl lg ka de el gn gu ht ha haw he hi hmn hu is ig id ia ga it ja jv kl kn kr ks kk km rw kv kg ko ku ky lo la lv li ln lt lb mk mai mg ms ml mt mi mr mh mn na nv nd ne no nb nn nr oc or om os pap ps fa pl pt pa qu ro rm rn ru sm sg sa sc gd sr st sn sd si sk sl so es su sw ss sv tg ta tt te th bo ti ts tn to tr tk tw ug uk ur uz ve vi vo wa cy fy wo xh yi yo yue zu se iu ty ik ki lu oj pi sh ho hz ie io ng kj za ae').split(' '))];

    const SRC_ATTR = document.documentElement.getAttribute('lang') || 'es';
    const SRC = SRC_ATTR.toLowerCase().split('-')[0];
    const CK = 'psi1_' + SRC + '_';
    const ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];
    const SKIP = ['script', 'style', 'noscript', 'textarea', 'pre', 'code', 'svg style',
        '[contenteditable]:not([contenteditable="false"])', '[translate="no"]', '.notranslate',
        '.nm', '#cuenta .nom', '#psi-st'].concat(CFG.skip ? [CFG.skip] : []).join(',');
    const BRAND = /^pich\w*$/i;

    const ls = {
        get(k) { try { return localStorage.getItem(k); } catch { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch { } },
        del(k) { try { localStorage.removeItem(k); } catch { } }
    };
    const ss = {
        get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
        set(k, v) { try { sessionStorage.setItem(k, v); } catch { } }
    };
    const $ = s => document.querySelector(s);
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    let lang = null, gen = 0, active = 0, okCount = 0, failCount = 0, jobTotal = 0, jobDone = 0;
    let items = new WeakMap();
    const all = new Set(), waiting = new Map(), queued = new Set(), failed = new Set(), queue = [];
    let cssItems = [], quotaShown = false;
    let defaultLang = null, visible = true, btn = null;
    let btnKey = null;

    function readDefault() {
        let d = ls.get('psi_default');
        if (!d) {
            try { if (window.Pichisoft && Pichisoft.user) d = Pichisoft.getData('Pichisoft', 'lang', null); } catch { }
            if (d) ls.set('psi_default', d);
        }
        return d || null;
    }
    function setDefault(code) {
        defaultLang = code || null;
        if (code) ls.set('psi_default', code); else ls.del('psi_default');
        try { if (window.Pichisoft) Pichisoft.setData('Pichisoft', 'lang', code || null); } catch { }
        refreshUI();
    }

    const caches = {}, dirty = new Set(); let saveT = 0;
    function cacheFor(to) {
        if (!caches[to]) { try { caches[to] = JSON.parse(ls.get(CK + to) || '{}') || {}; } catch { caches[to] = {}; } }
        return caches[to];
    }
    function cacheSet(to, k, v) {
        cacheFor(to)[k] = v; dirty.add(to);
        clearTimeout(saveT);
        saveT = setTimeout(() => {
            dirty.forEach(t => {
                try { localStorage.setItem(CK + t, JSON.stringify(caches[t])); }
                catch {
                    Object.keys(localStorage).filter(x => x.startsWith('psi1_') && x !== CK + t).forEach(x => ls.del(x));
                    try { localStorage.setItem(CK + t, JSON.stringify(caches[t])); } catch { }
                }
            });
            dirty.clear();
        }, 600);
    }

    const decode = t => new DOMParser().parseFromString(t, 'text/html').documentElement.textContent;
    function chunk(t, max) {
        if (t.length <= max) return [t];
        const parts = t.match(/[^.!?…\n]+[.!?…]*\s*/g) || [t], out = []; let c = '';
        for (let x of parts) {
            while (x.length > max) { if (c) { out.push(c); c = ''; } out.push(x.slice(0, max)); x = x.slice(max); }
            if ((c + x).length > max) { out.push(c); c = x; } else c += x;
        }
        if (c) out.push(c);
        return out;
    }
    async function fetchTr(text, to) {
        const out = [];
        for (const p of chunk(text, CFG.provider === 'google' ? 1500 : 450)) {
            if (!p.trim()) { out.push(p); continue; }
            if (CFG.provider === 'google') {
                const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + SRC + '&tl=' + encodeURIComponent(to) + '&dt=t&q=' + encodeURIComponent(p));
                if (!r.ok) { const e = new Error('http'); e.quota = r.status === 429; throw e; }
                const j = await r.json();
                out.push(j[0].map(x => x[0]).join(''));
            } else {
                const u = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(p) + '&langpair=' + encodeURIComponent(SRC + '|' + to) + (CFG.email ? '&de=' + encodeURIComponent(CFG.email) : '');
                const r = await fetch(u), j = await r.json();
                const st = +j.responseStatus, t = (j.responseData && j.responseData.translatedText) || '';
                if (st === 429 || /MYMEMORY WARNING|USED ALL AVAILABLE/i.test(t)) { const e = new Error('quota'); e.quota = true; throw e; }
                if (st !== 200 || !t) throw new Error('bad');
                out.push(decode(t).trim());
            }
        }
        return out.join(' ').trim();
    }

    function attrItemOk(el, a) {
        if (a === 'value') return el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type);
        return true;
    }
    function proc(node, attr) {
        const cur = attr ? node.getAttribute(attr) : node.data;
        if (cur == null) return;
        let rec = items.get(node); const k = attr || '#', prev = rec && rec[k];
        if (prev && prev.dead) return;
        if (prev && prev.tr !== null && cur === prev.tr) return;
        const key = cur.trim(), ch = prev ? prev.ch + 1 : 0;
        if (ch > 4) { rec[k] = { dead: true }; return; }
        if (!key || key.length > 3000 || !/\p{L}/u.test(key) || BRAND.test(key)) { if (prev) { all.delete(prev); delete rec[k]; } return; }
        if (!rec) { rec = {}; items.set(node, rec); }
        const i = cur.indexOf(key);
        const it = { node, attr, key, orig: cur, lead: cur.slice(0, i), trail: cur.slice(i + key.length), tr: null, ch };
        if (prev) all.delete(prev);
        rec[k] = it; all.add(it); want(it);
    }
    function want(it) {
        const hit = cacheFor(lang)[it.key];
        if (hit != null) apply(it, hit); else enqueue(it);
    }
    function apply(it, tr) {
        if (it.css) { it.tr = tr; cssWriteSoon(); return; }
        const v = it.lead + tr + it.trail; it.tr = v;
        if (it.attr) it.node.setAttribute(it.attr, v); else it.node.data = v;
    }
    function scanText(n) {
        const p = n.parentElement;
        if (!p || p.closest(SKIP)) return;
        proc(n, null);
    }
    function attrs(el) {
        for (const a of ATTRS) if (el.hasAttribute(a)) proc(el, a);
        if (attrItemOk(el, 'value') && el.hasAttribute('value')) proc(el, 'value');
    }
    function scan(root) {
        if (!lang || !root) return;
        if (root.nodeType === 3) { scanText(root); return; }
        if (root.nodeType !== 1 || root.closest(SKIP)) return;
        attrs(root);
        const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode: n => (n.nodeType === 1 && n.matches(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });
        let n;
        while ((n = w.nextNode())) { if (n.nodeType === 3) proc(n, null); else attrs(n); }
    }
    function scanTitle() { const t = $('title'); if (t && t.firstChild) proc(t.firstChild, null); }

    function restore() {
        for (const it of all) {
            if (it.css || it.tr === null || !it.node.isConnected) continue;
            const cur = it.attr ? it.node.getAttribute(it.attr) : it.node.data;
            if (cur === it.tr) { if (it.attr) it.node.setAttribute(it.attr, it.orig); else it.node.data = it.orig; }
        }
        all.clear(); items = new WeakMap(); cssItems = [];
        const s = $('#psi-css'); if (s) s.textContent = '';
    }

    function cssCollect() {
        cssItems = [];
        const seen = new Set();
        const walk = rules => {
            for (const r of rules) {
                if (r.type === 1) {
                    if (/::?(after|before)/.test(r.selectorText || '')) {
                        const m = /^"([^"\\]{2,})"$/.exec(r.style.getPropertyValue('content').trim());
                        if (m && /\p{L}{2}/u.test(m[1]) && !seen.has(r.selectorText + m[1])) {
                            seen.add(r.selectorText + m[1]);
                            const it = { css: true, sel: r.selectorText, key: m[1], tr: null };
                            cssItems.push(it); want(it);
                        }
                    }
                } else if (r.cssRules) walk(r.cssRules);
            }
        };
        for (const sh of document.styleSheets) {
            if (sh.ownerNode && (sh.ownerNode.id === 'psi-style' || sh.ownerNode.id === 'psi-css')) continue;
            try { walk(sh.cssRules); } catch { }
        }
        cssWrite();
    }
    let cssT = 0;
    function cssWriteSoon() { clearTimeout(cssT); cssT = setTimeout(cssWrite, 80); }
    function cssWrite() {
        let s = $('#psi-css');
        if (!s) { s = document.createElement('style'); s.id = 'psi-css'; document.head.appendChild(s); }
        s.textContent = lang ? cssItems.filter(i => i.tr != null).map(i => i.sel + '{content:"' + i.tr.replace(/["\\\n]/g, ' ') + '"!important}').join('\n') : '';
    }

    function enqueue(it) {
        if (failed.has(it.key)) return;
        let s = waiting.get(it.key); if (!s) { s = new Set(); waiting.set(it.key, s); }
        s.add(it);
        if (!queued.has(it.key)) { queued.add(it.key); queue.push(it.key); jobTotal++; progress(); pump(); }
    }
    function pump() {
        if (!lang) return;
        while (active < CFG.concurrency && queue.length) run(queue.shift());
    }
    function flush(key, tr) {
        for (const it of waiting.get(key) || []) {
            if (it.tr === null && it.key === key && (it.css || it.node.isConnected)) apply(it, tr);
        }
        waiting.delete(key);
    }
    async function run(key) {
        const g = gen, to = lang; active++;
        try {
            const tr = await fetchTr(key, to);
            cacheSet(to, key, tr);
            if (g === gen) { okCount++; flush(key, tr); }
        } catch (e) {
            if (g === gen) {
                failCount++; failed.add(key); waiting.delete(key);
                if (e && e.quota) {
                    queue.length = 0; queued.clear(); jobTotal = jobDone = 0;
                    if (!quotaShown) { quotaShown = true; toast('Se alcanzó el límite diario del servicio de traducción. Parte de la página quedó sin traducir; probá de nuevo más tarde.'); }
                } else if (!okCount && failCount >= 4) {
                    toast('No se pudo traducir a ese idioma (el servicio no lo admite o no está disponible). Se mantiene el original.');
                    setLang(null, { noSession: true });
                }
            }
        } finally {
            active--;
            if (g === gen) {
                queued.delete(key); jobDone++; progress();
                if (!active && !queue.length) { jobTotal = jobDone = 0; progress(); cssWrite(); }
            }
            pump();
        }
    }

    function setLang(code, o) {
        o = o || {};
        gen++; queue.length = 0; queued.clear(); waiting.clear(); failed.clear();
        jobTotal = jobDone = okCount = failCount = 0; quotaShown = false;
        restore();
        lang = (code && code.toLowerCase().split('-')[0] !== SRC) ? code : null;
        if (!o.noSession) ss.set('psi_cur', lang || '-');
        document.documentElement.setAttribute('lang', lang || SRC_ATTR);
        if (lang) { scan(document.body); scanTitle(); cssCollect(); }
        progress(); refreshUI();
    }

    /* ------------------------------ UI ------------------------------ */
    const CSS = `
#psi-btn{position:fixed!important;z-index:2147483647;display:inline-flex!important;align-items:center;justify-content:center;gap:0;padding:10px;width:auto!important;max-width:max-content!important;min-width:0;box-sizing:border-box;visibility:visible!important;opacity:1!important;pointer-events:auto!important;white-space:nowrap;border-radius:6px;border:1px solid #d4af37;background:linear-gradient(135deg,#f1d98a,#c9a227 55%,#a67c10);color:#1a1405;font:bold 14px/1.1 Verdana,"Open Sans","Helvetica Neue",sans-serif;letter-spacing:.02em;cursor:pointer;user-select:none;-webkit-user-select:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 4px 12px rgba(0,0,0,.45);transition:padding .18s,filter .15s,transform .15s}
#psi-btn .psi-label{display:none;margin-left:7px}
#psi-btn:hover,#psi-btn:focus-visible{padding:10px 14px;gap:8px}
#psi-btn:hover .psi-label,#psi-btn:focus-visible .psi-label{display:inline}
#psi-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}
#psi-btn:active{transform:none}
#psi-btn:focus-visible{outline:2px solid #f1d98a;outline-offset:2px}
#psi-btn[hidden]{display:none!important}
#psi-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;flex:none}
#psi-btn.busy svg{animation:psiSpin 1s linear infinite}
@keyframes psiSpin{to{transform:rotate(360deg)}}
.psi-ov{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);user-select:none;-webkit-user-select:none}
.psi-card{position:relative;display:flex;flex-direction:column;width:min(440px,100%);max-height:90vh;box-sizing:border-box;background:#141414;border:1px solid #3a3a3a;border-top:3px solid #d4af37;border-radius:14px;padding:24px 20px 18px;box-shadow:0 26px 70px rgba(0,0,0,.8);font-family:Verdana,"Open Sans",sans-serif;color:#fff;text-align:left}
.psi-card h3{margin:0 34px 6px 0;font:bold 1.5rem "Times New Roman",Times,serif}
.psi-sub{margin:0 0 14px;font-size:.8rem;line-height:1.5;color:#bdbdbd}
.psi-x{position:absolute;top:14px;right:14px;width:26px;height:26px;padding:0;border:1.5px solid #d4af37;border-radius:50%;background:none;cursor:pointer;transition:transform .3s,background .2s}
.psi-x::before,.psi-x::after{content:"";position:absolute;left:50%;top:50%;width:11px;height:2px;margin:-1px 0 0 -5.5px;border-radius:2px;background:#f1d98a}
.psi-x::before{transform:rotate(45deg)}.psi-x::after{transform:rotate(-45deg)}
.psi-x:hover{transform:rotate(90deg);background:#d4af37}
.psi-x:hover::before,.psi-x:hover::after{background:#111}
#psi-q{width:100%;box-sizing:border-box;background:#1c1c1c;border:1px solid rgba(212,175,55,.3);border-radius:10px;color:#fff;font:inherit;font-size:.9rem;padding:11px 12px;outline:0;user-select:text;-webkit-user-select:text}
#psi-q:focus{border-color:#d4af37;box-shadow:0 0 0 3px rgba(212,175,55,.16)}
#psi-list{flex:1;min-height:150px;max-height:42vh;overflow:auto;margin:10px 0;padding-right:2px}
.psi-it{display:flex;align-items:baseline;gap:8px;width:100%;box-sizing:border-box;text-align:left;background:#191919;border:1px solid #262626;border-radius:9px;padding:9px 12px;margin-bottom:5px;color:#fff;font:inherit;font-size:.88rem;cursor:pointer;transition:border-color .15s,background .15s}
.psi-it small{color:#8f8f8f;font-size:.74rem}
.psi-it:hover{border-color:#6b5a1e}
.psi-it.on{border-color:#d4af37;background:rgba(212,175,55,.1)}
.psi-star{margin-left:auto;color:#d4af37;font-size:.85rem}
.psi-none{color:#9a9a9a;font-size:.82rem;padding:14px 4px}
.psi-def{display:flex;align-items:center;gap:12px;padding:12px 0 4px;border-top:1px solid #272727;cursor:pointer;font-size:.85rem;line-height:1.4}
.psi-def small{display:block;color:#9a9a9a;font-size:.7rem;margin-top:3px}
.psi-sw{-webkit-appearance:none;appearance:none;flex:none;margin:0 0 0 auto;width:46px;height:26px;border-radius:13px;background:#3b3b3b;position:relative;cursor:pointer;border:0;transition:background .2s}
.psi-sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#d8d8d8;transition:left .2s}
.psi-sw:checked{background:linear-gradient(135deg,#f1d98a,#b8901f)}
.psi-sw:checked::after{left:23px;background:#fff}
.psi-sw:disabled{opacity:.4;cursor:not-allowed}
.psi-sw:focus-visible{outline:2px solid #f1d98a;outline-offset:2px}
#psi-st{min-height:1.2em;margin-top:8px;font-size:.8rem;color:#f1d98a}
.psi-orig{margin-top:10px;width:100%;background:none;border:1px solid rgba(212,175,55,.26);color:#f1d98a;border-radius:10px;padding:11px;font:inherit;font-size:.85rem;cursor:pointer}
.psi-orig:hover{background:rgba(212,175,55,.1)}
.psi-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483647;max-width:min(420px,calc(100vw - 24px));box-sizing:border-box;padding:12px 16px;background:rgba(20,20,20,.97);border:1px solid #d4af37;border-radius:12px;color:#fff;font:.8rem/1.5 Verdana,"Open Sans",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.6);text-align:center}
@media (max-width:600px){#psi-btn{padding:9px}}
@media (prefers-reduced-motion:reduce){#psi-btn,#psi-btn svg,.psi-x{animation:none!important;transition:none!important}}
`;

    function toast(msg) {
        const t = document.createElement('div'); t.className = 'psi-toast'; t.setAttribute('role', 'status'); t.textContent = msg;
        document.body.appendChild(t); setTimeout(() => t.remove(), 7000);
    }

    function progress() {
        const st = $('#psi-st');
        if (st) st.textContent = jobTotal ? '⏳ ' + Math.round(jobDone / jobTotal * 100) + '%' : (lang ? '✓' : '');
        if (btn) btn.classList.toggle('busy', jobTotal > 0);
    }

    let LIST = null;
    function langs() {
        if (LIST) return LIST;
        let dn = null; try { dn = new Intl.DisplayNames(['es'], { type: 'language' }); } catch { }
        const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
        LIST = CODES.map(c => {
            let n = c, nat = '';
            try { if (dn) n = dn.of(c) || c; } catch { }
            try { nat = new Intl.DisplayNames([c], { type: 'language' }).of(c) || ''; } catch { }
            n = cap(n); nat = cap(nat);
            if (nat.toLowerCase() === n.toLowerCase()) nat = '';
            return { c, n, nat, s: norm(n + ' ' + nat + ' ' + c) };
        }).sort((a, b) => a.n.localeCompare(b.n, 'es', { sensitivity: 'base' }));
        return LIST;
    }

    function renderList() {
        const box = $('#psi-list'); if (!box) return;
        const q = norm($('#psi-q').value.trim());
        const cur = lang || SRC;
        const rows = langs().filter(l => !q || l.s.includes(q));
        box.innerHTML = '';
        if (!rows.length) { box.innerHTML = '<div class="psi-none">Sin resultados.</div>'; return; }
        rows.forEach(l => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'psi-it'; b.dataset.c = l.c; b.setAttribute('role', 'option');
            const on = l.c.toLowerCase() === cur.toLowerCase() || (!lang && l.c === SRC);
            if (on) { b.classList.add('on'); b.setAttribute('aria-selected', 'true'); }
            b.innerHTML = '<span></span><small></small>';
            b.firstChild.textContent = l.n; b.lastChild.textContent = l.nat;
            if (defaultLang && defaultLang.toLowerCase() === l.c.toLowerCase()) { const s = document.createElement('span'); s.className = 'psi-star'; s.textContent = '★'; s.title = 'Idioma predeterminado'; b.append(s); }
            b.onclick = () => {
                const wantDef = $('#psi-def').checked;
                setLang(l.c);
                if (wantDef && lang) setDefault(l.c);
            };
            box.append(b);
        });
    }
    function refreshUI() {
        const chk = $('#psi-def');
        if (chk) { chk.disabled = !lang; chk.checked = !!lang && !!defaultLang && defaultLang.toLowerCase() === lang.toLowerCase(); }
        const keep = $('#psi-list') ? $('#psi-list').scrollTop : 0;
        renderList();
        if ($('#psi-list')) $('#psi-list').scrollTop = keep;
    }

    function openPanel() {
        if ($('#psi-ov')) return;
        const o = document.createElement('div'); o.id = 'psi-ov'; o.className = 'psi-ov';
        o.innerHTML = `<div class="psi-card" role="dialog" aria-modal="true" aria-labelledby="psi-t">
  <button type="button" class="psi-x" id="psi-close" aria-label="Cerrar"></button>
  <h3 id="psi-t">Traducir</h3>
  <p class="psi-sub">Elegí el idioma al que querés traducir todo el texto de esta página.</p>
  <input id="psi-q" type="text" placeholder="Buscar idioma…" autocomplete="off" spellcheck="false">
  <div id="psi-list" role="listbox" translate="no" class="notranslate"></div>
  <label class="psi-def"><span>Usar como idioma predeterminado<small>Se aplica solo cada vez que entrás a Pichisoft.</small></span><input type="checkbox" class="psi-sw" id="psi-def"></label>
  <div id="psi-st" translate="no"></div>
  <button type="button" class="psi-orig" id="psi-orig">Volver al idioma original</button>
</div>`;
        document.body.append(o);
        const esc = e => { if (e.key === 'Escape') close(); };
        const close = () => { document.removeEventListener('keydown', esc, true); o.remove(); };
        document.addEventListener('keydown', esc, true);
        o.onclick = e => { if (e.target === o) close(); };
        $('#psi-close').onclick = close;
        $('#psi-q').oninput = renderList;
        $('#psi-orig').onclick = () => setLang(null);
        $('#psi-def').onchange = e => {
            if (!lang) { e.target.checked = false; return; }
            setDefault(e.target.checked ? lang : null);
        };
        refreshUI(); progress();
        const on = o.querySelector('.psi-it.on'); if (on) on.scrollIntoView({ block: 'center' });
        $('#psi-q').focus({ preventScroll: true });
    }
    function closePanel() { const o = $('#psi-ov'); if (o) o.remove(); }

    /* -------------------- POSICIONAMIENTO -------------------- */
    let placeRaf = 0;
    function placeSoon() { if (!placeRaf) placeRaf = requestAnimationFrame(() => { placeRaf = 0; place(); }); }

    /* Aplica una esquina con offsets opcionales */
    function applyCorner(cfg) {
        const pos = typeof cfg === 'string' ? cfg : cfg.pos;
        const ox = (typeof cfg === 'object' && cfg.offsetX) || 0;
        const oy = (typeof cfg === 'object' && cfg.offsetY) || 0;
        const GAP = 16;
        btn.style.top = 'auto';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
        btn.style.left = 'auto';
        if (pos === 'tl') { btn.style.top = (GAP + oy) + 'px'; btn.style.left = (GAP + ox) + 'px'; }
        else if (pos === 'tr') { btn.style.top = (GAP + oy) + 'px'; btn.style.right = (GAP + ox) + 'px'; }
        else if (pos === 'bl') { btn.style.bottom = (GAP + oy) + 'px'; btn.style.left = (GAP + ox) + 'px'; }
        else if (pos === 'br') { btn.style.bottom = (GAP + oy) + 'px'; btn.style.right = (GAP + ox) + 'px'; }
    }

    /* ¿Algo tapa al botón? */
    function isCovered() {
        const r = btn.getBoundingClientRect();
        if (r.width < 5 || r.height < 5) return false;
        const pts = [
            [r.left + r.width / 2, r.top + r.height / 2],
            [r.left + 4, r.top + 4],
            [r.right - 4, r.bottom - 4]
        ];
        for (const [x, y] of pts) {
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
            const top = document.elementFromPoint(x, y);
            if (top && top !== btn && !btn.contains(top)) return true;
        }
        return false;
    }

    /* ¿Es un elemento que no queremos tapar? (interactivo o texto importante) */
    function isImportant(el) {
        if (!el || !el.tagName) return false;
        const tag = el.tagName;
        const role = el.getAttribute('role');
        if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' ||
            tag === 'TEXTAREA' || tag === 'LABEL' ||
            role === 'button' || role === 'link' || role === 'menuitem' ||
            role === 'tab' || role === 'checkbox' || role === 'switch' ||
            el.hasAttribute('onclick')) return true;
        if (/^H[1-6]$/.test(tag)) return true;
        if (role === 'heading') return true;
        const cls = (typeof el.className === 'string') ? el.className : '';
        const id = el.id || '';
        const hay = (cls + ' ' + id).toLowerCase();
        if (/\b(logo|brand|marca|title|titulo|header|banner|hero|heading|footer|status)\b/.test(hay)) return true;
        return false;
    }

    /* ¿El botón tapa algo importante? */
    function coversImportant() {
        const r = btn.getBoundingClientRect();
        if (r.width < 5 || r.height < 5) return false;
        const pts = [
            [r.left + r.width / 2, r.top + r.height / 2],
            [r.left + 4, r.top + 4],
            [r.right - 4, r.bottom - 4]
        ];
        for (const [x, y] of pts) {
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
            const els = document.elementsFromPoint(x, y);
            if (!els.length) continue;
            if (els[0] !== btn && !btn.contains(els[0])) continue;
            for (let i = 1; i < els.length; i++) {
                const el = els[i];
                if (el === btn || btn.contains(el) || el.contains(btn)) continue;
                if (!el.tagName) continue;
                const cs = getComputedStyle(el);
                if (cs.pointerEvents === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
                const er = el.getBoundingClientRect();
                if (er.width >= innerWidth - 4 && er.height >= innerHeight - 4) continue;
                if (er.width * er.height > innerWidth * innerHeight * 0.5) continue;
                if (isImportant(el)) return true;
            }
        }
        return false;
    }

    function place() {
        if (!btn || btn.hidden) return;
        if (btn.parentElement && btn.parentElement.id === 'pichisoft-topbar') return;
        // 1. ¿La app pidió una esquina específica?
        const forced = getAppPosition();
        if (forced) { applyCorner(forced); return; }

        // 2. Posición preferida: debajo del anchor / engranaje
        let prefTop = 14, prefRight = 16;
        const a = $(CFG.anchor);
        if (a) {
            const r = a.getBoundingClientRect();
            if (r.height > 0 && r.right > 0 && r.bottom > 0 && r.top < innerHeight) {
                prefTop = r.bottom + 8;
                prefRight = innerWidth - r.right;
            }
        }
        const g = $('#pGear');
        if (g && getComputedStyle(g).display !== 'none') {
            const gr = g.getBoundingClientRect();
            if (gr.height > 0 && gr.top < innerHeight) prefTop = Math.max(prefTop, gr.bottom + 8);
        }
        const bw = btn.offsetWidth || 40;
        const bh = btn.offsetHeight || 40;
        prefTop = Math.max(8, Math.min(prefTop, innerHeight - bh - 8));
        prefRight = Math.max(8, Math.min(prefRight, innerWidth - bw - 8));

        // 3. Probar en orden hasta encontrar una esquina limpia
        const positions = [
            { top: prefTop + 'px', right: prefRight + 'px', bottom: 'auto', left: 'auto' },
            { top: '14px', right: '16px', bottom: 'auto', left: 'auto' },
            { top: 'auto', right: '16px', bottom: '14px', left: 'auto' },
            { top: '14px', right: 'auto', bottom: 'auto', left: '16px' },
            { top: 'auto', right: 'auto', bottom: '14px', left: '16px' }
        ];

        for (const p of positions) {
            btn.style.top = p.top;
            btn.style.right = p.right;
            btn.style.bottom = p.bottom;
            btn.style.left = p.left;
            if (!isCovered() && !coversImportant()) return;
        }
        btn.style.top = positions[0].top;
        btn.style.right = positions[0].right;
        btn.style.bottom = positions[0].bottom;
        btn.style.left = positions[0].left;
    }

    function setVisible(v) {
        visible = !!v; ls.set(btnKey || 'psi_btn', visible ? '1' : '0');
        if (btn) { btn.hidden = !visible; placeSoon(); }
        if (!visible) closePanel();
    }

    /* ------------------------------ INICIO ------------------------------ */
    function init() {
        const st = document.createElement('style'); st.id = 'psi-style'; st.textContent = CSS; document.head.appendChild(st);

        btn = document.createElement('button'); btn.id = 'psi-btn'; btn.type = 'button';
        btn.setAttribute('aria-label', 'Traducir');
        btn.title = 'Traducir';
        btn.textContent = 'Traducir'; // <--- AGREGÁ ESTO
        btn.onclick = openPanel;
        btn.style.position = 'fixed';
        btn.style.zIndex = '2147483647';
        btn.style.boxSizing = 'border-box';
        const bcs = getComputedStyle(document.body);
        const bodyBreaksFixed = bcs.transform !== 'none' || bcs.filter !== 'none' || bcs.perspective !== 'none';
        const topbar = document.getElementById('pichisoft-topbar');
        if (topbar) {
            // Limpiamos estilos e ID para que no pelee con el CSS del panel
            btn.removeAttribute('id');
           btn.style.cssText = 'position:static !important; background:transparent !important; border:none !important; font-family:"Times New Roman", Times, serif !important; font-size:0.9rem !important; font-weight:bold !important; letter-spacing:0.5px !important; cursor:pointer; padding:2px 8px !important; margin:0 !important; text-transform:uppercase; white-space:nowrap; height:auto !important; width:auto !important; box-shadow:none !important; order: 3 !important;';
            topbar.appendChild(btn);
        } else {
            (bodyBreaksFixed ? document.documentElement : document.body).appendChild(btn);
        }

        btnKey = 'psi_btn_' + (location.pathname || '/');
        const savedVis = ls.get(btnKey) !== null ? ls.get(btnKey) : ls.get('psi_btn');
        visible = typeof window.PSI_VISIBLE === 'boolean' ? window.PSI_VISIBLE : savedVis !== '0';
        btn.hidden = !visible;
        addEventListener('pichisoft:traductor', e => setVisible(e.detail && e.detail.visible));

        new MutationObserver(muts => {
            placeSoon();
            if (!lang) return;
            for (const m of muts) {
                if (m.type === 'childList') m.addedNodes.forEach(n => scan(n));
                else if (m.type === 'characterData') scanText(m.target);
                else if (m.type === 'attributes' && m.target.nodeType === 1 && !m.target.closest(SKIP) && attrItemOk(m.target, m.attributeName)) proc(m.target, m.attributeName);
            }
        }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat('value') });

        addEventListener('resize', placeSoon);
        addEventListener('scroll', placeSoon, { passive: true });
        addEventListener('load', placeSoon);
        place();
        setTimeout(place, 300);
        setTimeout(place, 1000);
        setTimeout(place, 3000);

        defaultLang = readDefault();
        const sess = ss.get('psi_cur');
        const start = sess === '-' ? null : (sess || defaultLang);
        if (start) setLang(start, { noSession: true });
    }

    window.PichisoftIdiomas = {
        open: openPanel, close: closePanel,
        setLang: c => setLang(c), getLang: () => lang || SRC,
        setDefault, getDefault: () => defaultLang,
        setVisible, isVisible: () => visible,
        languages: () => langs().map(l => ({ code: l.c, name: l.n, native: l.nat }))
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
