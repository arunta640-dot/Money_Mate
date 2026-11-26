'use strict';
/* Tiny inline-SVG charts. No libraries, no network. Colours come from CSS variables. */
const Charts = (function () {
  const SLOTS = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)'];
  const colorFor = (i, isOther) => (isOther ? 'var(--s-other)' : SLOTS[i % SLOTS.length]);

  /* items: [{label, value}] already sorted desc. Top 5 + "Other". 2px surface gaps between arcs. */
  function donut(items) {
    const top = items.slice(0, 5), rest = items.slice(5).reduce((s, x) => s + x.value, 0);
    const segs = top.map((x, i) => ({ ...x, color: colorFor(i) }));
    if (rest > 0) segs.push({ label: 'Other', value: rest, color: colorFor(0, true) });
    const total = segs.reduce((s, x) => s + x.value, 0) || 1;
    const r = 52, C = 2 * Math.PI * r, gap = segs.length > 1 ? 2.5 : 0; let off = 0;
    const arcs = segs.map((s) => {
      const len = Math.max(0.5, (s.value / total) * C - gap);
      const el = `<circle cx="70" cy="70" r="${r}" fill="none" stroke="${s.color}" stroke-width="16" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`;
      off += (s.value / total) * C; return el;
    }).join('');
    return { svg: `<svg viewBox="0 0 140 140" role="img" aria-label="Spending by category"><circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="16"/>${arcs}</svg>`, segs, total };
  }

  /* months: [{ym, label, inc, exp}]. Paired bars; tap a month to select it. */
  function bars(months, selected, fmtCompact) {
    const W = 340, H = 168, padL = 4, padB = 22, padT = 16, innerH = H - padB - padT;
    const max = Math.max(1, ...months.map((m) => Math.max(m.inc, m.exp)));
    const slot = (W - padL) / months.length, bw = Math.min(16, slot / 2 - 4);
    const gridY = [0, 0.5, 1].map((f) => `<line x1="0" x2="${W}" y1="${padT + innerH * (1 - f)}" y2="${padT + innerH * (1 - f)}" stroke="var(--line)" stroke-width="1"/>`).join('');
    const bar = (x, v, color) => {
      const h = v <= 0 ? 0 : Math.max(2, (v / max) * innerH), y = padT + innerH - h;
      if (!h) return '';
      const r = Math.min(4, h, bw / 2);
      return `<path d="M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + bw - r}Q${x + bw},${y} ${x + bw},${y + r}V${y + h}Z" fill="${color}"/>`;
    };
    const cols = months.map((m, i) => {
      const cx = padL + slot * i + slot / 2, sel = m.ym === selected;
      return `<g data-act="pickMonth" data-id="${m.ym}" class="${sel ? 'sel' : ''}" role="button" aria-label="${m.label}: income ${Math.round(m.inc)}, spending ${Math.round(m.exp)}">
        <rect x="${cx - slot / 2}" y="0" width="${slot}" height="${H}" fill="${sel ? 'var(--surface2)' : 'transparent'}" rx="8"/>
        ${bar(cx - bw - 1, m.inc, 'var(--s1)')}${bar(cx + 1, m.exp, 'var(--s2)')}
        <text x="${cx}" y="${H - 6}" text-anchor="middle">${m.label}</text></g>`;
    }).join('');
    return `<svg class="bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Income and spending, last 6 months"><text x="${W}" y="${padT - 5}" text-anchor="end">${fmtCompact(max)}</text>${gridY}${cols}</svg>`;
  }

  /* horizontal share strip for the hero: parts [{label,value,color}] */
  function strip(parts) {
    const total = parts.reduce((s, p) => s + p.value, 0) || 1;
    return `<div class="split" role="img" aria-label="Net worth by currency">${parts.map((p) => `<i style="flex:${Math.max(0.02, p.value / total)};background:${p.color}"></i>`).join('')}</div>`;
  }
  return { donut, bars, strip, colorFor };
})();
