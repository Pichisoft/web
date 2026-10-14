/* PICHONAPPS · mensajes de Pichisoft + cuentas inhabilitadas
   Agregar al final del <body> de PichonApps (después de los otros scripts):
       <script type="module" src="pichonapps-mensajes.js"></script>
   Y en el CSP de PichonApps, sumar a connect-src:  https://api.mymemory.translated.net */
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const F = window.PichisoftFirebase;
if (F) {
    const st = document.createElement('style');
    st.textContent = `
#pmBox{position:fixed;top:78px;right:0;z-index:60;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none;max-width:100vw}
.pmN{pointer-events:auto;position:relative;box-sizing:border-box;max-width:min(330px,calc(100vw - 16px));margin-right:8px;padding:12px 40px 12px 14px;background:rgba(20,20,20,.97);border:1px solid #d4af37;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:pmIn .4s ease;font:.8rem/1.5 Verdana,sans-serif;color:#fff}
@keyframes pmIn{from{transform:translateX(120%)}to{transform:none}}
.pmN a{color:#4da3ff;font-weight:bold;text-decoration:underline;cursor:pointer;padding:0}
.pmX{position:absolute;top:8px;right:8px;width:24px;height:24px;padding:0;border:1.5px solid #d4af37;border-radius:50%;background:none;cursor:pointer}
.pmX::before,.pmX::after{content:"";position:absolute;left:50%;top:50%;width:10px;height:2px;margin:-1px 0 0 -5px;background:#f1d98a}
.pmX::before{transform:rotate(45deg)}.pmX::after{transform:rotate(-45deg)}
.pmO{position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto}
.pmC{width:min(460px,100%);box-sizing:border-box;background:#141414;border:1px solid #3a3a3a;border-top:3px solid #d4af37;border-radius:14px;padding:22px;color:#fff;font-family:Verdana,sans-serif}
.pmC h3{margin:0 0 12px;font:bold 1.4rem "Times New Roman",serif}
.pmT{white-space:pre-wrap;word-break:break-word;background:#1c1c1c;border-radius:8px;padding:12px;font-size:.88rem;line-height:1.55;margin:8px 0}
.pmC select,.pmC button{font:inherit;font-size:.85rem;border-radius:8px;padding:10px;margin-top:8px;border:1px solid #4a4a4a;background:#000;color:#fff;cursor:pointer}
.pmC select{width:100%;box-sizing:border-box}
.pmC button:hover{background:#fff;color:#000}
.pmC .pmV{display:block;width:100%;margin-top:14px;background:#8c8c8c;color:#000}`;
    document.head.append(st);
    const box = document.createElement('div'); box.id = 'pmBox'; document.body.append(box);

    const LANGS = { es: 'Español', en: 'English', pt: 'Português', fr: 'Français', it: 'Italiano', de: 'Deutsch', ru: 'Русский', ja: '日本語', ko: '한국어', 'zh-CN': '中文', ar: 'العربية', hi: 'हिन्दी', tr: 'Türkçe' };
    const ocultos = new Set(); let msgs = [], unsub = null;

    async function traducir(texto, a) {
        const partes = texto.match(/[^.!?\n]+[.!?]*\s*|\n/g) || [texto], trozos = []; let cur = '';
        partes.forEach(p => { if ((cur + p).length > 450) { trozos.push(cur); cur = ''; } cur += p; }); if (cur) trozos.push(cur);
        let out = '';
        for (const t of trozos) {
            if (!t.trim()) { out += t; continue; }
            const r = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(t) + '&langpair=autodetect|' + a);
            const j = await r.json();
            if (+j.responseStatus !== 200) throw new Error(j.responseDetails || 'Error');
            out += j.responseData.translatedText + ' ';
        }
        return out.trim();
    }

    function abrir(m) {
        const o = document.createElement('div'); o.className = 'pmO';
        const c = document.createElement('div'); c.className = 'pmC';
        c.innerHTML = '<h3>Mensaje de Pichisoft</h3><div class="pmT" id="a"></div><select id="l"></select><button id="g">Traducir</button><div class="pmT" id="b" hidden></div><button class="pmV" id="v">Volver a PichonApps</button>';
        c.querySelector('#a').textContent = m.text;
        const sel = c.querySelector('#l');
        Object.entries(LANGS).forEach(([k, n]) => sel.add(new Option(n, k)));
        sel.value = (navigator.language || 'es').split('-')[0] in LANGS ? (navigator.language || 'es').split('-')[0] : 'es';
        c.querySelector('#g').onclick = async e => {
            const b = c.querySelector('#b'); e.target.disabled = true; b.hidden = false; b.textContent = 'Traduciendo…';
            try { b.textContent = await traducir(m.text, sel.value); } catch (x) { b.textContent = 'No se pudo traducir: ' + x.message; }
            e.target.disabled = false;
        };
        const cerrar = () => { o.remove(); scrollTo(0, 0); updateDoc(doc(F.db, 'messages', m.id), { read: true }).catch(console.error); };
        c.querySelector('#v').onclick = cerrar;
        o.append(c); document.body.append(o);
    }

    function pintar() {
        box.innerHTML = '';
        msgs.filter(m => !ocultos.has(m.id)).slice(0, 3).forEach(m => {
            const d = document.createElement('div'); d.className = 'pmN';
            const a = document.createElement('a'); a.textContent = 'Tienes un mensaje recibido de Pichisoft'; a.onclick = () => abrir(m);
            const x = document.createElement('button'); x.className = 'pmX'; x.setAttribute('aria-label', 'Cerrar'); x.onclick = () => { ocultos.add(m.id); pintar(); };
            d.append(a, x); box.append(d);
        });
    }

    F.onAuthStateChanged(F.auth, async u => {
        if (unsub) { unsub(); unsub = null; } msgs = []; pintar();
        if (!u) return;
        try { /* cuenta inhabilitada por el admin */
            const f = await getDoc(doc(F.db, 'admin_flags', u.uid));
            if (f.exists() && f.data().disabled) {
                await F.signOut(F.auth); localStorage.removeItem('ps_session');
                alert('Tu cuenta de Pichisoft fue inhabilitada.'); location.reload(); return;
            }
        } catch (e) { console.error(e); }
        unsub = onSnapshot(query(collection(F.db, 'messages'), where('to', '==', u.uid)), s => {
            msgs = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => !m.read).sort((a, b) => b.at - a.at); pintar();
        }, console.error);
    });
}