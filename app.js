/* Krutidev 010 Hindi Typing Tutor — vanilla JS, no build step. */
(function () {
  'use strict';
  const D = window.KD_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const view = $('#view');

  // ------------------------------------------------------------------ keyboard model
  const BASE = "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./";
  const SHIFTED = '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?';
  const SHIFT = {}, UNSHIFT = {};
  [...BASE].forEach((k, i) => { SHIFT[k] = SHIFTED[i]; UNSHIFT[SHIFTED[i]] = k; });
  const DISP = {
    '`': ['ृ', '्'], '1': ['1', '!'], '2': ['2', '/'], '3': ['3', 'रु'], '4': ['4', '+'], '5': ['5', 'ः'], '6': ['6', '‘'],
    '7': ['7', '-'], '8': ['8', '’'], '9': ['9', ';'], '0': ['0', 'द्ध'], '-': ['.', 'ऋ'], '=': ['त्र', '़'],
    q: ['ु', 'फ'], w: ['ू', 'ॅ'], e: ['म', 'म्'], r: ['त', 'त्'], t: ['ज', 'ज्'], y: ['ल', 'ल्'], u: ['न', 'न्'],
    i: ['प', 'प्'], o: ['व', 'व्'], p: ['च', 'च्'], '[': ['ख्', 'क्ष्'], ']': [',', 'द्व'], '\\': ['?', 'द्य'],
    a: ['ं', '।'], s: ['े', 'ै'], d: ['क', 'क्'], f: ['ि', 'थ्'], g: ['ह', 'ळ'], h: ['ी', 'भ्'], j: ['र', 'श्र'],
    k: ['ा', 'ज्ञ'], l: ['स', 'स्'], ';': ['य', 'रू'], "'": ['श्', 'ष्'],
    z: ['्र', 'र्'], x: ['ग', 'ग्'], c: ['ब', 'ब्'], v: ['अ', 'ट'], b: ['इ', 'ठ'], n: ['द', 'छ'], m: ['उ', 'ड'],
    ',': ['ए', 'ढ'], '.': ['ण्', 'झ'], '/': ['ध्', 'घ्'],
  };
  const COMB = new Set([...'ृ्ःुूॅंेैिीा़', '्र']);
  const g = (s) => (COMB.has(s) ? '◌' + s : s);
  const FINGER = {};
  Object.entries({ lp: '`1qaz', lr: '2wsx', lm: '3edc', li: '45rtfgvb', ri: '67yuhjnm', rm: '8ik,', rr: '9ol.', rp: "0-=p[]\\;'/" })
    .forEach(([f, ks]) => [...ks].forEach((k) => (FINGER[k] = f)));
  const FNAME = { lp: 'बायाँ छोटी उँगली', lr: 'बायाँ अनामिका', lm: 'बायाँ मध्यमा', li: 'बायाँ तर्जनी',
    ri: 'दायाँ तर्जनी', rm: 'दायाँ मध्यमा', rr: 'दायाँ अनामिका', rp: 'दायाँ छोटी उँगली' };
  const FSHORT = { lp: 'L छोटी', lr: 'L अनामिका', lm: 'L मध्यमा', li: 'L तर्जनी', ri: 'R तर्जनी', rm: 'R मध्यमा', rr: 'R अनामिका', rp: 'R छोटी' };
  const ALT = {
    '¡': ['ँ', '0161', '⌥ 1'], 'Å': ['ऊ', '0197', '⌥ ⇧ A'], '¥': ['ञ', '0165', '⌥ Y'], '³': ['ङ', '0179', '—'],
    'ª': ['्र (ट्र/ड्र)', '0170', '⌥ 9'], 'Ø': ['क्र', '0216', '⌥ ⇧ O'], 'ç': ['प्र', '0231', '⌥ C'], 'æ': ['द्र', '0230', "⌥ '"],
    'Ý': ['फ्र', '0221', '—'], 'ã': ['ह्म', '0227', '—'], 'à': ['ह्न', '0224', '—'], 'á': ['ह्य', '0225', '—'],
    'ê': ['ट्ट', '0234', '—'], 'ì': ['ड्ड', '0236', '—'], 'í': ['द्द', '0237', '—'], 'ä': ['क्त', '0228', '—'],
    '·': ['ऽ', '0183', '⌥ ⇧ 9'], 'ñ': ['॰', '0241', '⌥ N, N'], 'Þ': ['“', '0222', '—'], 'ß': ['”', '0223', '⌥ S'],
    '¼': ['(', '0188', '—'], '½': [')', '0189', '—'],
  };
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  function keyboardHTML(opts = {}) {
    const rows = [
      ['num', [...'`1234567890-='], [], [['Backspace', 2]]],
      ['top', [...'qwertyuiop[]\\'], [['Tab', 1.5]], []],
      ['home', [..."asdfghjkl;'"], [['Caps', 1.75]], [['Enter', 2.25]]],
      ['bot', [...'zxcvbnm,./'], [['Shift', 2.25, 'shiftL']], [['Shift', 2.75, 'shiftR']]],
    ];
    const nk = opts.newkeys || '';
    let h = `<div class="kb${opts.shift ? ' kb-shift' : ''}${opts.small ? ' kb-sm' : ''}">`;
    for (const [name, keys, pre, post] of rows) {
      const dim = opts.rows && !opts.rows.includes(name);
      h += `<div class="kbrow${dim ? ' dim' : ''}">`;
      for (const [lab, w, id] of pre) h += `<div class="key mod" style="--w:${w}" ${id ? `data-k="${id}"` : ''}>${lab}</div>`;
      for (const k of keys) {
        const [n, s] = DISP[k];
        const hi = nk.includes(k) || nk.includes(SHIFT[k]);
        const lab = /[a-z]/.test(k) ? k.toUpperCase() : `${esc(SHIFT[k])} ${esc(k)}`;
        h += `<div class="key f-${FINGER[k]}${hi ? ' hi' : ''}${'fj'.includes(k) ? ' bump' : ''}" data-k="${esc(k)}">` +
          `<span class="ks">${esc(g(s))}</span><span class="kn">${esc(g(n))}</span><span class="ke">${lab}</span></div>`;
      }
      for (const [lab, w, id] of post) h += `<div class="key mod" style="--w:${w}" ${id ? `data-k="${id}"` : ''}>${lab}</div>`;
      h += '</div>';
    }
    h += `<div class="kbrow${opts.rows ? ' dim' : ''}"><div class="key mod" style="--w:4">Ctrl · Alt</div>` +
      `<div class="key mod" style="--w:7" data-k=" ">Space</div><div class="key mod" style="--w:4">Alt · Ctrl</div></div>`;
    return h + '</div>';
  }

  function legendHTML() {
    return '<div class="legend">' + Object.keys(FSHORT).map((f) => `<span><i class="dot f-${f}"></i>${FSHORT[f]}</span>`).join('') + '</div>';
  }

  function keycaps(k, cls = '') {
    return `<span class="kcs ${cls}">` + [...k].map((c) => {
      if (c === ' ') return '<span class="kc sp">space</span>';
      if (ALT[c]) return `<span class="kc alt" title="Alt ${ALT[c][1]}">Alt ${ALT[c][1]}</span>`;
      return `<span class="kc${UNSHIFT[c] ? ' sh' : ''}">${esc(c)}</span>`;
    }).join('') + '</span>';
  }

  // ------------------------------------------------------------------ storage
  const KEY = 'kdt.v1';
  let S = { ex: {}, hist: [], settings: { showKeys: true, stopOnError: false, hint: true } };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) S = Object.assign(S, s, { settings: Object.assign(S.settings, s.settings || {}) }); } catch (e) { /* private mode */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  const allEx = [];
  D.lessons.forEach((L) => L.exercises.forEach((ex, i) => allEx.push({ L, i, id: `${L.no}.${i}` })));
  const nextEx = () => allEx.find((e) => !(S.ex[e.id] && S.ex[e.id].stars >= 2)) || allEx[0];
  const lessonPct = (L) => Math.round(100 * L.exercises.filter((_, i) => (S.ex[`${L.no}.${i}`] || {}).stars >= 2).length / L.exercises.length);
  const stars = (n) => '★★★'.slice(0, n) + '<i>' + '★★★'.slice(0, 3 - n) + '</i>';
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // ------------------------------------------------------------------ router
  let cleanup = null;
  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    $$('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.r === (parts[0] || 'home')));
    window.scrollTo(0, 0);
    const [r, a, b] = parts;
    if (r === 'lessons') return viewLessons();
    if (r === 'l') return viewPractice(+a, +(b || 0));
    if (r === 't' && a) return viewTest(+a);
    if (r === 't') return viewTests();
    if (r === 'guide') return viewGuide();
    if (r === 'ref') return viewRef();
    if (r === 'progress') return viewProgress();
    return viewHome();
  }
  window.addEventListener('hashchange', route);

  // ------------------------------------------------------------------ views
  function viewHome() {
    const done = allEx.filter((e) => (S.ex[e.id] || {}).stars >= 2).length;
    const tests = S.hist.filter((h) => h.kind === 'test');
    const best = tests.reduce((m, h) => Math.max(m, h.net), 0);
    const mins = Math.round(S.hist.reduce((m, h) => m + (h.sec || 0), 0) / 60);
    const accs = S.hist.slice(-20).map((h) => h.acc);
    const acc = accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0;
    const n = nextEx();
    const groups = [['B', 'Row-wise Lessons', 'Ek-ek row, pehle normal phir Shift'], ['C', 'Advanced', 'Matra, aadhe akshar, र ke roop'], ['D', 'Shabd aur Vakya', '100 common words, vakya abhyas']];
    view.innerHTML = `
    <section class="hero">
      <div>
        <span class="eyebrow">Kruti Dev 010 · Remington layout</span>
        <h1>कृतिदेव हिंदी टाइपिंग <span>सीखें</span></h1>
        <p>Typing Master jaisa step-by-step course — <b>row by row</b> keys, phir akshar, shabd, vakya aur speed tests.
        Font install karne ki zaroorat nahi: aap English keyboard par type karein, screen par Hindi dikhegi.</p>
        <div class="hero-cta">
          <a class="btn pri" href="#/l/${n.L.no}/${n.i}">${done ? 'Aage badhein' : 'Shuru karein'} → Lesson ${n.L.no} · ${esc(n.L.exercises[n.i].name)}</a>
          <a class="btn" href="#/guide">Pehle guide padhein</a>
        </div>
      </div>
      <div class="hero-kb">${keyboardHTML({ small: true })}</div>
    </section>
    <section class="stats4">
      <div><b>${done}<small>/${allEx.length}</small></b><span>Abhyas poore</span></div>
      <div><b>${best || '—'}</b><span>Best net WPM (test)</span></div>
      <div><b>${acc ? acc + '%' : '—'}</b><span>Accuracy (recent)</span></div>
      <div><b>${mins}</b><span>Minute practice</span></div>
    </section>
    <h2 class="h2">Aapka course</h2>
    <div class="path">
      ${groups.map(([gk, gn, gd]) => `
      <div class="pgroup"><div class="pg-h"><h3>${gn}</h3><p>${gd}</p></div>
        ${D.lessons.filter((L) => L.group === gk).map((L) => `
        <a class="pl" href="#/l/${L.no}/0"><span class="pl-no">${String(L.no).padStart(2, '0')}</span>
          <span class="pl-t"><b>${esc(L.title)}</b><small>${esc(L.sub)}</small></span>
          <span class="bar"><i style="width:${lessonPct(L)}%"></i></span></a>`).join('')}
      </div>`).join('')}
      <div class="pgroup"><div class="pg-h"><h3>Speed Tests</h3><p>Timer ke saath paragraph</p></div>
        ${D.tests.map((t) => `<a class="pl" href="#/t/${t.no}"><span class="pl-no t">T${t.no}</span><span class="pl-t"><b>${esc(t.title)}</b><small>${esc(t.level)}</small></span>
        <span class="pl-best">${bestTest(t.no)}</span></a>`).join('')}
      </div>
    </div>
    <div class="tipcard"><b>Roz ka niyam:</b> 30–45 minute practice · keyboard ki taraf mat dekhiye · pehle accuracy (95%+), speed apne-aap aayegi.
    <a href="Krutidev_Hindi_Typing_Manual.pdf" download>PDF manual download karein ↓</a></div>`;
  }

  function bestTest(no) {
    const b = S.hist.filter((h) => h.kind === 'test' && h.id === String(no)).reduce((m, h) => Math.max(m, h.net), 0);
    return b ? `${b} WPM` : '';
  }

  function viewLessons() {
    view.innerHTML = `<h1 class="h1">Saare lessons</h1>` + D.lessons.map((L) => `
      <div class="lcard"><div class="lc-h"><span class="pl-no">${String(L.no).padStart(2, '0')}</span>
      <div><h3>${esc(L.title)}</h3><p>${esc(L.sub)}</p></div><span class="pct">${lessonPct(L)}%</span></div>
      <div class="lc-ex">${L.exercises.map((ex, i) => { const r = S.ex[`${L.no}.${i}`];
        return `<a href="#/l/${L.no}/${i}" class="exchip${r ? ' done' : ''}"><b>${esc(ex.name)}</b><span class="st">${stars(r ? r.stars : 0)}</span>${r ? `<small>${r.best} WPM · ${r.acc}%</small>` : '<small>Abhi baaki</small>'}</a>`; }).join('')}</div></div>`).join('');
  }

  // ------------------------------------------------------------------ hidden input capture
  function makeCapture(onChar, onBack, onEnter) {
    const ta = document.createElement('textarea');
    ta.className = 'cap'; ta.setAttribute('autocapitalize', 'off'); ta.setAttribute('autocomplete', 'off');
    ta.setAttribute('autocorrect', 'off'); ta.setAttribute('spellcheck', 'false'); ta.setAttribute('aria-label', 'Typing input');
    document.body.appendChild(ta);
    let composing = false;
    ta.addEventListener('compositionstart', () => (composing = true));
    ta.addEventListener('compositionend', () => { composing = false; flush(); });
    function flush() { const v = ta.value; ta.value = ''; for (const c of v) { if (c === '\n') onEnter && onEnter(); else onChar(c); } }
    ta.addEventListener('input', () => { if (!composing) flush(); });
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') { e.preventDefault(); onBack(e.ctrlKey || e.altKey || e.metaKey); }
      else if (e.key === 'Tab') { e.preventDefault(); onChar('\t'); }
      else if (e.key === 'Enter') { e.preventDefault(); onEnter && onEnter(); }
    });
    const focus = () => ta.focus({ preventScroll: true });
    return { ta, focus, destroy: () => ta.remove() };
  }

  // ------------------------------------------------------------------ keyboard highlighter
  function hl(root, ch) {
    $$('.key.next, .key.nextsh', root).forEach((k) => k.classList.remove('next', 'nextsh'));
    const info = $('.nexthint', document);
    if (ch == null) { if (info) info.innerHTML = ''; return; }
    if (ALT[ch]) {
      if (info) info.innerHTML = `Agli key: <b class="alt">${esc(ALT[ch][0])}</b> → Windows: <kbd>Alt</kbd> + <b>${ALT[ch][1]}</b> (Num pad)` +
        `${ALT[ch][2] !== '—' ? ` · Mac: <b>${ALT[ch][2]}</b>` : ''} · ya <kbd>Tab</kbd> dabaakar aage badhein`;
      return;
    }
    const base = UNSHIFT[ch] || ch;
    const key = $(`.key[data-k="${CSS.escape(base)}"]`, root);
    if (key) key.classList.add('next');
    let txt = '';
    if (ch === ' ') txt = 'Agli key: <b>Space</b> — angootha';
    else if (FINGER[base]) {
      const shift = !!UNSHIFT[ch];
      if (shift) { const sk = $(`.key[data-k="${FINGER[base][0] === 'l' ? 'shiftR' : 'shiftL'}"]`, root); if (sk) sk.classList.add('nextsh'); }
      txt = `Agli key: <kbd>${esc(ch)}</kbd> → <b class="hin">${esc(g(shift ? DISP[base][1] : DISP[base][0]))}</b> · ${FNAME[FINGER[base]]}` +
        (shift ? ` · <b>${FINGER[base][0] === 'l' ? 'Right' : 'Left'} Shift</b> ke saath` : '');
    }
    if (info) info.innerHTML = txt;
  }
  function flashKey(root, ch) {
    const base = UNSHIFT[ch] || ch;
    const key = $(`.key[data-k="${CSS.escape(base)}"]`, root);
    if (!key) return;
    key.classList.remove('wrong'); void key.offsetWidth; key.classList.add('wrong');
  }

  // ------------------------------------------------------------------ lesson practice
  function viewPractice(no, exi) {
    const L = D.lessons.find((x) => x.no === no);
    if (!L) { location.hash = '#/lessons'; return; }
    const EX = L.exercises[exi] || L.exercises[0];
    const items = EX.items;
    const target = items.map((x) => x.k).join(' ');
    const hWords = items.map((x) => x.h).join(' ').split(' ');
    const kWords = target.split(' ');
    const seenIntro = S.ex[`${no}.0`];
    const intro = `
      <details class="intro" ${seenIntro ? '' : 'open'}><summary>Is lesson me kya seekhenge</summary>
      <p>${L.intro}</p>
      ${L.newkeys ? `<div class="nks">${[...L.newkeys].map((k) => { const b = UNSHIFT[k] || k; const out = UNSHIFT[k] ? DISP[b][1] : DISP[b][0];
        return `<div class="nk f-${FINGER[b]}">${keycaps(k)}<span>→</span><b class="hin">${esc(g(out))}</b><small>${FSHORT[FINGER[b]]}</small></div>`; }).join('')}</div>` : ''}
      ${L.combos.length ? `<div class="combos">${L.combos.map(([a, b, c]) => `<div><small>${esc(a)}</small>${keycaps(b)}<span>=</span><b class="hin">${esc(c)}</b></div>`).join('')}</div>` : ''}
      ${L.tips.length ? `<ul class="tips">${L.tips.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
      </details>`;
    view.innerHTML = `
    <div class="ph"><a href="#/lessons" class="back">← Lessons</a>
      <h1><span>Lesson ${no}</span> ${esc(L.title)}</h1></div>
    <div class="tabs">${L.exercises.map((ex, i) => { const r = S.ex[`${no}.${i}`];
      return `<a href="#/l/${no}/${i}" class="${i === exi ? 'on' : ''}">${i + 1}. ${esc(ex.name)} <span class="st">${stars(r ? r.stars : 0)}</span></a>`; }).join('')}</div>
    ${intro}
    <div class="pcard">
      <div class="pbar">
        <div class="pinfo"><b>${esc(EX.name)}</b><small>${esc(EX.desc)}</small></div>
        <div class="live"><span><b id="wpm">0</b>WPM</span><span><b id="acc">100%</b>Accuracy</span><span><b id="err">0</b>Galtiyan</span><span><b id="tm">0:00</b>Samay</span></div>
      </div>
      <div class="prog"><i id="prog"></i></div>
      <div class="target${S.settings.showKeys ? '' : ' nokeys'}" id="target">${kWords.map((kw, wi) => `<div class="blk" data-w="${wi}"><div class="hin">${esc(hWords[wi] || '')}</div><div class="keys">${[...kw].map((c) => `<span class="kc${UNSHIFT[c] ? ' sh' : ''}${ALT[c] ? ' alt' : ''}">${ALT[c] ? 'Alt' : esc(c)}</span>`).join('')}${wi < kWords.length - 1 ? '<span class="kc sp" title="Space"></span>' : ''}</div></div>`).join('')}</div>
      <div class="screen"><span class="lbl">Aapki screen par</span><div class="out hin" id="out"><i class="caret"></i></div></div>
      <div class="focusmsg" id="focusmsg">Type karna shuru karne ke liye <b>yahan click karein</b></div>
      <div class="nexthint" id="nexthint"></div>
      <div id="kbw" class="${S.settings.hint ? '' : 'nohint'}">${keyboardHTML({ newkeys: L.newkeys })}</div>
      <div class="ctrl">
        <button class="btn" id="restart">↺ Dobara shuru</button>
        <label><input type="checkbox" id="optKeys" ${S.settings.showKeys ? 'checked' : ''}> Keys dikhayein</label>
        <label><input type="checkbox" id="optHint" ${S.settings.hint ? 'checked' : ''}> Keyboard par agli key</label>
        <label><input type="checkbox" id="optStop" ${S.settings.stopOnError ? 'checked' : ''}> Galti par ruk jaayein</label>
      </div>
    </div>`;

    const spans = $$('#target .kc');            // one span per target char (spaces included)
    const blocks = $$('#target .blk');
    const charBlock = [];
    kWords.forEach((kw, wi) => { for (let i = 0; i < kw.length + (wi < kWords.length - 1 ? 1 : 0); i++) charBlock.push(wi); });
    const kbw = $('#kbw');
    let typed = [], marks = [], total = 0, errs = 0, t0 = 0, t1 = 0, timer = null, done = false;
    const errMap = {};

    function paint() {
      const pos = typed.length;
      spans.forEach((s, i) => {
        s.classList.toggle('ok', i < pos && marks[i]);
        s.classList.toggle('bad', i < pos && !marks[i]);
        s.classList.toggle('cur', i === pos);
      });
      const cb = charBlock[Math.min(pos, charBlock.length - 1)];
      blocks.forEach((b, i) => { b.classList.toggle('active', i === cb && !done); b.classList.toggle('done', i < cb || done); });
      const act = blocks[cb];
      if (act) { const tr = $('#target'); const top = act.offsetTop - tr.offsetTop; if (top > tr.scrollTop + tr.clientHeight - 90 || top < tr.scrollTop) tr.scrollTop = Math.max(0, top - 20); }
      const outText = fromKD(typed.join(''));
      $('#out').innerHTML = esc(outText.slice(-160)) + '<i class="caret"></i>';
      $('#prog').style.width = `${(100 * pos) / target.length}%`;
      hl(kbw, done ? null : target[pos]);
      stats();
    }
    function stats() {
      const sec = t0 ? ((t1 || Date.now()) - t0) / 1000 : 0;
      const wpm = sec > 2 ? Math.round(typed.length / 5 / (sec / 60)) : 0;
      $('#wpm').textContent = wpm;
      $('#acc').textContent = (total ? Math.round((100 * (total - errs)) / total) : 100) + '%';
      $('#err').textContent = errs;
      $('#tm').textContent = fmtTime(sec);
      return { sec, wpm, acc: total ? Math.round((100 * (total - errs)) / total) : 100 };
    }
    function onChar(c) {
      if (done) return;
      const exp = target[typed.length];
      if (c === '\t') { if (ALT[exp]) c = exp; else return; }
      if (!t0) { t0 = Date.now(); timer = setInterval(stats, 500); }
      total++;
      const ok = c === exp;
      if (!ok) { errs++; errMap[exp] = (errMap[exp] || 0) + 1; flashKey(kbw, c); if (S.settings.stopOnError) { stats(); return; } }
      typed.push(c); marks.push(ok);
      if (typed.length >= target.length) finish();
      paint();
    }
    function onBack(word) {
      if (done || !typed.length) return;
      do { typed.pop(); marks.pop(); } while (word && typed.length && typed[typed.length - 1] !== ' ');
      paint();
    }
    function finish() {
      done = true; t1 = Date.now(); clearInterval(timer);
      const st = stats();
      const target2 = [0, 12, 14, 16, 18, 20, 22, 24, 18, 18, 18, 22, 22][no] || 20;
      const nStars = st.acc >= 97 && st.wpm >= target2 ? 3 : st.acc >= 92 ? 2 : st.acc >= 85 ? 1 : 0;
      const id = `${no}.${exi}`;
      const prev = S.ex[id] || { best: 0, acc: 0, stars: 0, n: 0 };
      S.ex[id] = { best: Math.max(prev.best, st.wpm), acc: Math.max(prev.acc, st.acc), stars: Math.max(prev.stars, nStars), n: prev.n + 1 };
      S.hist.push({ t: Date.now(), kind: 'ex', id, title: `L${no} · ${EX.name}`, wpm: st.wpm, net: st.wpm, acc: st.acc, sec: Math.round(st.sec) });
      if (S.hist.length > 500) S.hist = S.hist.slice(-500);
      save();
      const weak = Object.entries(errMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
      const nextI = exi + 1 < L.exercises.length ? `#/l/${no}/${exi + 1}` : (D.lessons.find((x) => x.no === no + 1) ? `#/l/${no + 1}/0` : '#/t');
      showModal(`
        <div class="res-stars">${stars(nStars)}</div>
        <h2>${['Dobara koshish karein', 'Theek hai — thoda aur abhyas', 'Bahut badhiya!', 'Shaandaar! 🎉'][nStars]}</h2>
        <div class="res4"><div><b>${st.wpm}</b>WPM</div><div><b>${st.acc}%</b>Accuracy</div><div><b>${errs}</b>Galtiyan</div><div><b>${fmtTime(st.sec)}</b>Samay</div></div>
        ${weak.length ? `<p class="weak">Kamzor keys: ${weak.map(([k, n]) => `${keycaps(k)}<small>×${n}</small>`).join(' ')}</p>` : '<p class="weak">Ek bhi galti nahi! 👏</p>'}
        <p class="muted">Aage badhne ke liye kam se kam <b>2 star</b> (92%+ accuracy) laayein. 3 star: 97%+ aur ${target2}+ WPM.</p>
        <div class="mbtns"><button class="btn" data-act="again">↺ Dobara</button><a class="btn pri" href="${nextI}" data-act="close">Agla abhyas →</a></div>`,
        (act) => { if (act === 'again') route(); });
    }
    function restart() { route(); }

    const cap = makeCapture(onChar, onBack);
    const pcard = $('.pcard');
    const setFocus = () => { cap.focus(); };
    pcard.addEventListener('click', (e) => { if (!e.target.closest('input,label,button,a')) setFocus(); });
    cap.ta.addEventListener('focus', () => { $('#focusmsg').classList.add('hide'); pcard.classList.add('focused'); });
    cap.ta.addEventListener('blur', () => { $('#focusmsg').classList.remove('hide'); pcard.classList.remove('focused'); });
    pcard.addEventListener('click', () => pcard.scrollIntoView({ behavior: 'smooth', block: 'start' }), { once: true });
    $('#restart').onclick = restart;
    $('#optKeys').onchange = (e) => { S.settings.showKeys = e.target.checked; save(); $('#target').classList.toggle('nokeys', !e.target.checked); setFocus(); };
    $('#optHint').onchange = (e) => { S.settings.hint = e.target.checked; save(); kbw.classList.toggle('nohint', !e.target.checked); setFocus(); };
    $('#optStop').onchange = (e) => { S.settings.stopOnError = e.target.checked; save(); setFocus(); };
    paint();
    setTimeout(setFocus, 50);
    cleanup = () => { clearInterval(timer); cap.destroy(); closeModal(); };
  }

  // ------------------------------------------------------------------ speed tests
  function viewTests() {
    view.innerHTML = `<h1 class="h1">Speed Tests</h1><p class="lead">Exam jaisa abhyas: paragraph dekhkar type karein, timer chalega. Galti shabd ke hisaab se gini jaati hai.</p>
    <div class="tgrid">${D.tests.map((t) => `<a class="tcard" href="#/t/${t.no}"><span class="lvl">${esc(t.level)}</span><h3 class="hin">${esc(t.title)}</h3>
    <p class="hin">${esc(t.h.slice(0, 90))}…</p><div class="tmeta"><span>${t.h.split(' ').length} shabd</span><span>${t.k.length} keystrokes</span><span>${bestTest(t.no) ? 'Best: ' + bestTest(t.no) : ''}</span></div></a>`).join('')}</div>`;
  }

  function viewTest(no) {
    const T = D.tests.find((x) => x.no === no);
    if (!T) { location.hash = '#/t'; return; }
    const hw = T.h.split(' '), kw = T.k.split(' ');
    let dur = +(sessionStorage.getItem('kdt.dur') || 300);
    view.innerHTML = `
    <div class="ph"><a href="#/t" class="back">← Speed Tests</a><h1><span>Test ${no}</span> <span class="hin">${esc(T.title)}</span></h1></div>
    <div class="pcard test">
      <div class="pbar">
        <div class="durs">Samay: ${[60, 120, 300, 600, 0].map((d) => `<button data-d="${d}" class="${d === dur ? 'on' : ''}">${d ? d / 60 + ' min' : 'Poora'}</button>`).join('')}</div>
        <div class="live"><span><b id="tm">${dur ? fmtTime(dur) : '0:00'}</b>${dur ? 'Baaki' : 'Samay'}</span><span><b id="wpm">0</b>WPM</span><span><b id="werr">0</b>Galat shabd</span></div>
      </div>
      <div class="passage hin" id="pass">${hw.map((w, i) => `<span data-i="${i}">${esc(w)}</span>`).join(' ')}</div>
      <div class="khint" id="khint"></div>
      <div class="screen tall"><span class="lbl">Aapki screen par</span><div class="out hin" id="out"><i class="caret"></i></div></div>
      <div class="focusmsg" id="focusmsg">Test shuru karne ke liye <b>yahan click karein</b> aur type karein — pehli key se timer chalega</div>
      <div class="ctrl"><button class="btn" id="restart">↺ Dobara</button><button class="btn pri" id="submit">Test submit karein</button>
      <label><input type="checkbox" id="optKh"> Current shabd ki keys dikhayein</label></div>
    </div>`;
    let typed = '', t0 = 0, timer = null, done = false;
    const spans = $$('#pass span');
    function words() { return typed.split(' '); }
    function paint() {
      const tw = words();
      const cur = tw.length - 1;
      spans.forEach((s, i) => {
        s.className = i < cur ? (tw[i] === kw[i] ? 'ok' : 'bad') : i === cur ? 'cur' : '';
      });
      if (spans[cur]) { const p = $('#pass'); const top = spans[cur].offsetTop - p.offsetTop; if (top > p.scrollTop + p.clientHeight - 60 || top < p.scrollTop) p.scrollTop = Math.max(0, top - 30); }
      $('#khint').innerHTML = $('#optKh').checked && kw[cur] ? `<span class="hin">${esc(hw[cur])}</span> ${keycaps(kw[cur])}` : '';
      $('#out').innerHTML = esc(fromKD(typed).slice(-220)) + '<i class="caret"></i>';
      $('#werr').textContent = tw.slice(0, cur).filter((w, i) => w !== kw[i]).length;
      tick();
    }
    function elapsed() { return t0 ? (Date.now() - t0) / 1000 : 0; }
    function tick() {
      const sec = elapsed();
      $('#tm').textContent = dur ? fmtTime(Math.max(0, dur - sec)) : fmtTime(sec);
      $('#wpm').textContent = sec > 2 ? Math.round(typed.length / 5 / (sec / 60)) : 0;
      if (dur && sec >= dur && !done) finish();
    }
    function onChar(c) {
      if (done || c === '\t') return;
      if (!t0) { t0 = Date.now(); timer = setInterval(tick, 250); $$('.durs button').forEach((b) => (b.disabled = true)); }
      typed += c;
      paint();
      const tw = words();
      if (!dur && tw.length >= kw.length && tw[kw.length - 1].length >= kw[kw.length - 1].length) finish();
    }
    function onBack(word) {
      if (done || !typed) return;
      if (word) typed = typed.replace(/\S*\s?$/, ''); else typed = typed.slice(0, -1);
      paint();
    }
    function finish() {
      if (done) return;
      done = true; clearInterval(timer);
      const sec = Math.max(elapsed(), 1);
      const tw = typed.trim() ? typed.trim().split(/ +/) : [];
      // an unfinished last word that is still a correct prefix is not a mistake
      if (!/\s$/.test(typed) && tw.length && tw.length <= kw.length && kw[tw.length - 1].startsWith(tw[tw.length - 1]) && tw[tw.length - 1] !== kw[tw.length - 1]) tw.pop();
      const n = Math.min(tw.length, kw.length);
      const wrong = tw.slice(0, n).filter((w, i) => w !== kw[i]).length + Math.max(0, tw.length - kw.length);
      const min = sec / 60;
      const gross = Math.round(typed.length / 5 / min);
      const net = Math.max(0, Math.round(gross - wrong / min));
      const acc = tw.length ? Math.round((100 * (tw.length - wrong)) / tw.length) : 0;
      S.hist.push({ t: Date.now(), kind: 'test', id: String(no), title: `Test ${no} · ${T.title}`, wpm: gross, net, acc, sec: Math.round(sec) });
      save();
      paint();
      const mistakes = tw.slice(0, n).map((w, i) => [w, i]).filter(([w, i]) => w !== kw[i]).slice(0, 8);
      showModal(`
        <h2>Test ka result</h2>
        <div class="res4"><div><b>${gross}</b>Gross WPM</div><div><b>${net}</b>Net WPM</div><div><b>${acc}%</b>Accuracy</div><div><b>${fmtTime(sec)}</b>Samay</div></div>
        <p class="muted">${tw.length} shabd type kiye · ${typed.length} keystrokes · ${wrong} galat shabd</p>
        ${mistakes.length ? `<div class="mlist">${mistakes.map(([w, i]) => `<div><span class="hin">${esc(hw[i])}</span><span class="bad hin">${esc(fromKD(w))}</span>${keycaps(kw[i], 'sm')}</div>`).join('')}</div>` : ''}
        <div class="mbtns"><button class="btn" data-act="again">↺ Dobara</button><a class="btn pri" href="#/progress" data-act="close">Progress dekhein</a></div>`,
        (act) => { if (act === 'again') route(); });
    }
    const cap = makeCapture(onChar, onBack, () => {});
    const pcard = $('.pcard');
    pcard.addEventListener('click', (e) => { if (!e.target.closest('input,label,button,a')) cap.focus(); });
    cap.ta.addEventListener('focus', () => { $('#focusmsg').classList.add('hide'); pcard.classList.add('focused'); });
    cap.ta.addEventListener('blur', () => { $('#focusmsg').classList.remove('hide'); pcard.classList.remove('focused'); });
    $$('.durs button').forEach((b) => (b.onclick = () => { dur = +b.dataset.d; sessionStorage.setItem('kdt.dur', dur); route(); }));
    $('#restart').onclick = () => route();
    $('#submit').onclick = () => { if (t0) finish(); };
    $('#optKh').onchange = () => { paint(); cap.focus(); };
    paint();
    setTimeout(() => cap.focus(), 50);
    cleanup = () => { clearInterval(timer); cap.destroy(); closeModal(); };
  }

  // ------------------------------------------------------------------ guide & reference
  function viewGuide() {
    const rules = [
      ['ि की मात्रा पहले', 'Chhoti i ki matra akshar se pehle type hoti hai.', 'किताब', 'fdrkc'],
      ['रेफ ( र् ) बाद में', 'Upar wala र् (Z) akshar + matra ke baad.', 'धर्म', '/keZ'],
      ['आधा + k = पूरा', 'ख थ ध भ श ष ण घ क्ष — aadhi key + k.', 'भाषा', 'Hkk"kk'],
      ['रु = #, रू = :', 'र ke saath ु / ू kabhi alag se nahi.', 'रुपया', '#i;k'],
      ['्र ( z ) बाद में', 'Pair wala र (प्र, क्र) akshar ke baad z.', 'प्रेम', 'izse'],
      ['। = Shift + A', 'Poorn viram ke liye A.', 'है।', 'gSA'],
      ['Comma = ] , Full stop = -', ', se ए aata hai aur . se ण्.', 'हम, तुम.', 'ge] rqe-'],
      ['? = \\ key', 'Shift + / se घ् aata hai, ? nahi.', 'क्या?', 'D;k\\'],
    ];
    view.innerHTML = `<h1 class="h1">Guide — shuru karne se pehle</h1>
    <div class="gsteps">
      <div class="card"><h3>1 · Yeh app kaise kaam karti hai</h3><p>Krutidev ek <b>non-Unicode</b> font hai: aap English (US) keyboard ki keys dabaate hain aur font unhe Hindi dikhata hai. Yeh app wahi keys pehchaanti hai aur <b>"Aapki screen par"</b> box me dikhati hai ki Kruti Dev 010 font me kya likha jaata. Isliye app me practice ke liye font install karne ki zaroorat nahi.</p></div>
      <div class="card"><h3>2 · Keyboard English (US) rakhein</h3><p>Hindi / Google Input Tools band rakhein. <b>Caps Lock OFF</b> rakhein — warna saari keys Shift wali chalengi.</p></div>
      <div class="card"><h3>3 · Asli kaam ke liye (MS Word)</h3><p>Kruti Dev 010 font install karke Word me select karein. <b>File → Options → Proofing → AutoCorrect Options</b> me "Straight quotes with smart quotes" aur "Capitalize first letter of sentences" ka tick hataayein — warna श / ष kharaab ho jaate hain.</p></div>
      <div class="card"><h3>4 · Baithne ka tareeka</h3><p>Peeth seedhi, kalaai hawa me, ungliyan <b>A S D F</b> aur <b>J K L ;</b> par. F aur J ke ubhaar se bina dekhe jagah pehchaanein. Shift hamesha <b>ulte haath</b> se.</p></div>
    </div>
    <h2 class="h2">Kaunsi ungli, kaunsi key</h2>
    ${keyboardHTML()}${legendHTML()}
    <h2 class="h2">Krutidev ke 8 sunehre niyam</h2>
    <div class="rules">${rules.map(([t, d, h, k], i) => `<div class="rule"><span class="rn">${i + 1}</span><div><h4 class="hin">${t}</h4><p>${d}</p><div class="rex"><b class="hin">${h}</b>${keycaps(k)}</div></div></div>`).join('')}</div>
    <h2 class="h2">Speed kaise naapi jaati hai</h2>
    <div class="gsteps"><div class="card"><h3>Gross WPM</h3><p class="formula">(Kul keystrokes ÷ 5) ÷ minute</p></div>
    <div class="card"><h3>Net WPM</h3><p class="formula">Gross − (galat shabd ÷ minute)</p></div></div>
    <p class="muted">Har exam (SSC, High Court, CPCT, state exams) ke niyam alag hote hain — apne exam ki official notification zaroor padhein. Aam taur par 25–30 WPM "exam ready" maana jaata hai.</p>`;
  }

  function viewRef() {
    const groups = [
      ['Matraayein', [['ा', 'k'], ['ि', 'f'], ['ी', 'h'], ['ु', 'q'], ['ू', 'w'], ['ृ', '`'], ['े', 's'], ['ै', 'S'], ['ो', 'ks'], ['ौ', 'kS'], ['ं', 'a'], ['ः', '%'], ['ॉ', 'kW']]],
      ['Swar', [['अ', 'v'], ['आ', 'vk'], ['इ', 'b'], ['ई', 'bZ'], ['उ', 'm'], ['ऊ', 'Å'], ['ऋ', '_'], ['ए', ','], ['ऐ', ',s'], ['ओ', 'vks'], ['औ', 'vkS']]],
      ['Aadha + k', [['ख', '[k'], ['घ', '?k'], ['थ', 'Fk'], ['ध', '/k'], ['भ', 'Hk'], ['श', "'k"], ['ष', '"k'], ['ण', '.k'], ['क्ष', '{k']]],
      ['र के रूप', [['र', 'j'], ['र्', 'Z'], ['्र', 'z'], ['रु', '#'], ['रू', ':'], ['ट्र', 'Vª']]],
      ['Chinh', [['।', 'A'], [',', ']'], ['.', '-'], ['?', '\\'], ['-', '&'], ['/', '@'], [';', '('], ['‘ ’', '^ *']]],
      ['Khaas', [['त्र', '='], ['ज्ञ', 'K'], ['श्र', 'J'], ['द्य', '|'], ['द्व', '}'], ['द्ध', ')'], ['ड़', 'M+'], ['ढ़', '<+']]],
    ];
    view.innerHTML = `<h1 class="h1">Quick reference</h1>
    <div class="seg"><button class="on" data-s="0">Normal</button><button data-s="1">Shift ke saath</button></div>
    <div id="refkb">${keyboardHTML()}</div>${legendHTML()}
    <div class="cgrid">${groups.map(([n, items]) => `<div class="cg"><h4>${n}</h4>${items.map(([a, b]) => `<span class="ci"><b class="hin">${esc(g(a))}</b><code>${esc(b)}</code></span>`).join('')}</div>`).join('')}</div>
    <h2 class="h2">Alt codes — khaas akshar</h2>
    <p class="muted">Windows: <kbd>Alt</kbd> dabaaye rakhein, Num Pad se number type karein, phir Alt chhodein. Mac par jahan diya hai, Option (⌥) wala shortcut is app me bhi chalega. Practice me <kbd>Tab</kbd> dabaakar bhi aage badh sakte hain.</p>
    <table class="tbl"><thead><tr><th>Akshar</th><th>Font char</th><th>Windows</th><th>Mac (is app me)</th></tr></thead><tbody>
    ${Object.entries(ALT).map(([c, [u, w, m]]) => `<tr><td class="hin big">${esc(u)}</td><td><code>${esc(c)}</code></td><td><b>Alt + ${w}</b></td><td>${m}</td></tr>`).join('')}
    </tbody></table>`;
    $$('.seg button').forEach((b) => (b.onclick = () => { $$('.seg button').forEach((x) => x.classList.toggle('on', x === b)); $('#refkb').innerHTML = keyboardHTML({ shift: b.dataset.s === '1' }); }));
  }

  function viewProgress() {
    const H = S.hist.slice().reverse();
    const tests = S.hist.filter((h) => h.kind === 'test');
    const pts = S.hist.slice(-40);
    let chart = '<p class="muted">Abhi koi data nahi — ek abhyas ya test poora karein.</p>';
    if (pts.length > 1) {
      const W = 700, Hh = 180, max = Math.max(30, ...pts.map((p) => p.wpm));
      const xy = pts.map((p, i) => [20 + (i * (W - 40)) / (pts.length - 1), Hh - 20 - ((Hh - 40) * p.wpm) / max]);
      chart = `<svg viewBox="0 0 ${W} ${Hh}" class="chart">${[10, 20, 30, 40, 50].filter((v) => v <= max).map((v) => { const y = Hh - 20 - ((Hh - 40) * v) / max; return `<line x1="20" x2="${W - 20}" y1="${y}" y2="${y}"/><text x="4" y="${y + 4}">${v}</text>`; }).join('')}
        <polyline points="${xy.map((p) => p.join(',')).join(' ')}"/>${xy.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" class="${pts[i].kind}"><title>${esc(pts[i].title)}: ${pts[i].wpm} WPM, ${pts[i].acc}%</title></circle>`).join('')}</svg>
        <div class="legend"><span><i class="dot ex"></i>Abhyas</span><span><i class="dot test"></i>Speed test</span></div>`;
    }
    view.innerHTML = `<h1 class="h1">Aapki progress</h1>
    <section class="stats4"><div><b>${S.hist.length}</b><span>Kul sessions</span></div><div><b>${tests.length}</b><span>Speed tests</span></div>
    <div><b>${tests.reduce((m, h) => Math.max(m, h.net), 0) || '—'}</b><span>Best net WPM</span></div><div><b>${Math.round(S.hist.reduce((m, h) => m + (h.sec || 0), 0) / 60)}</b><span>Minute practice</span></div></section>
    <div class="card"><h3>WPM — pichhle 40 sessions</h3>${chart}</div>
    <div class="card"><h3>History</h3>${H.length ? `<table class="tbl"><thead><tr><th>Tareekh</th><th>Abhyas / Test</th><th>WPM</th><th>Net</th><th>Accuracy</th><th>Samay</th></tr></thead><tbody>
    ${H.slice(0, 100).map((h) => `<tr><td>${new Date(h.t).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td><td class="hin">${esc(h.title)}</td><td>${h.wpm}</td><td>${h.net}</td><td>${h.acc}%</td><td>${fmtTime(h.sec)}</td></tr>`).join('')}
    </tbody></table>` : '<p class="muted">Abhi koi history nahi.</p>'}</div>
    <p class="muted">Progress isi browser me save hoti hai. <button class="link" id="reset">Saari progress mitaayein</button></p>`;
    $('#reset').onclick = () => { if (confirm('Saari progress aur history mitaa dein? Yeh wapas nahi aayegi.')) { S.ex = {}; S.hist = []; save(); route(); } };
  }

  // ------------------------------------------------------------------ modal
  let modalEl = null;
  function showModal(html, onAct) {
    closeModal();
    modalEl = document.createElement('div');
    modalEl.className = 'modal';
    modalEl.innerHTML = `<div class="mbox">${html}</div>`;
    modalEl.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]');
      if (a) { const act = a.dataset.act; closeModal(); onAct && onAct(act); }
    });
    document.body.appendChild(modalEl);
    const first = modalEl.querySelector('.btn.pri'); if (first) first.focus();
  }
  function closeModal() { if (modalEl) { modalEl.remove(); modalEl = null; } }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  route();
})();
