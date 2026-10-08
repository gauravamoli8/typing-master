// Kruti Dev 010 keystrokes -> Unicode Hindi (used for the live "screen par" preview).
(function () {
  const HAL = '्', NUKTA = '़';
  const REV = window.KD_DATA.rev;
  const KEYS = Object.keys(REV).sort((a, b) => b.length - a.length);
  const isCons = (ch) => ch >= 'क' && ch <= 'ह';
  const isFull = (t) => { const s = t.split(NUKTA).join(''); return s.length > 0 && isCons(s[s.length - 1]); };
  const isHalf = (t) => t.length > 1 && t.endsWith(HAL) && (isCons(t[t.length - 2]) || t[t.length - 2] === NUKTA);
  const SKIP = new Set([...'ािीुूृेैोौॉंँॅः', '्र', NUKTA]);

  function fromKD(kd) {
    let toks = [];
    let i = 0;
    while (i < kd.length) {
      let m = null;
      for (const k of KEYS) { if (kd.startsWith(k, i)) { m = k; break; } }
      if (m) { toks.push(REV[m]); i += m.length; } else { toks.push(kd[i]); i++; }
    }
    // join nukta / halant to the consonant before it
    const merged = [];
    for (const t of toks) {
      if ((t === NUKTA || t === HAL) && merged.length && isFull(merged[merged.length - 1])) merged[merged.length - 1] += t;
      else merged.push(t);
    }
    toks = merged;
    // ि is typed before the consonant cluster; move it after
    const res = [];
    i = 0;
    while (i < toks.length) {
      if (toks[i] === 'ि') {
        let j = i + 1;
        while (j < toks.length && isHalf(toks[j])) j++;
        if (j < toks.length && isFull(toks[j])) j++;
        while (j < toks.length && toks[j] === '्र') j++;
        res.push(...toks.slice(i + 1, j), 'ि');
        i = j;
      } else { res.push(toks[i]); i++; }
    }
    toks = res;
    // reph (Z) is typed after the syllable; move र् before it
    let p;
    while ((p = toks.indexOf('REPH')) >= 0) {
      toks.splice(p, 1);
      let j = p - 1;
      while (j >= 0 && SKIP.has(toks[j])) j--;
      while (j - 1 >= 0 && isHalf(toks[j - 1])) j--;
      toks.splice(Math.max(j, 0), 0, 'र्');
    }
    return toks.join('').normalize('NFC');
  }
  window.fromKD = fromKD;
})();
