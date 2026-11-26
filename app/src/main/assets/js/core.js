'use strict';
/* MoneyMate core: data store, money/FX helpers, migration, recurring engine, export. No UI here. */
const MM = (function () {
  const KEY = 'moneymate.v2', OLD_KEY = 'moneymate.v1', VERSION = '2.0.0';

  /* usd = units of currency per 1 USD. Defaults are approximate and editable in Settings. */
  const CURRENCIES = {
    BHD: { name: 'Bahraini Dinar', dec: 3, usd: 0.376 },
    INR: { name: 'Indian Rupee', dec: 2, usd: 90.24 },
    USD: { name: 'US Dollar', dec: 2, usd: 1 },
    SAR: { name: 'Saudi Riyal', dec: 2, usd: 3.75 },
    AED: { name: 'UAE Dirham', dec: 2, usd: 3.6725 },
    OMR: { name: 'Omani Rial', dec: 3, usd: 0.3845 },
    KWD: { name: 'Kuwaiti Dinar', dec: 3, usd: 0.307 },
    QAR: { name: 'Qatari Riyal', dec: 2, usd: 3.64 },
    EUR: { name: 'Euro', dec: 2, usd: 0.86 },
    GBP: { name: 'British Pound', dec: 2, usd: 0.76 },
    PKR: { name: 'Pakistani Rupee', dec: 2, usd: 280 },
  };

  const CATS = {
    expense: [
      ['Food', 'Dining', 'food'], ['Groceries', 'Groceries', 'cart'], ['Transport', 'Transport', 'car'],
      ['Shopping', 'Shopping', 'bag'], ['Bills', 'Bills', 'receipt'], ['Housing', 'Housing', 'home'],
      ['Health', 'Health', 'heart'], ['Entertainment', 'Leisure', 'play'], ['Education', 'Education', 'book'],
      ['Travel', 'Travel', 'plane'], ['Subscriptions', 'Subscriptions', 'repeat'], ['Family', 'Family', 'users'],
      ['Other', 'Other', 'dots'],
    ],
    income: [
      ['Salary', 'Salary', 'briefcase'], ['Business', 'Business', 'store'], ['Investments', 'Investments', 'trend'],
      ['Gifts', 'Gifts', 'gift'], ['Other', 'Other', 'dots'],
    ],
  };
  const catList = (type) => CATS[type === 'income' ? 'income' : 'expense'].map(([id, label, icon]) => ({ id, label, icon }));
  function cat(type, id) {
    if (type === 'transfer') return { id: 'Transfer', label: 'Transfer', icon: 'swap' };
    return catList(type).find((c) => c.id === id) || { id, label: id || 'Other', icon: 'dots' };
  }

  /* ---------- state ---------- */
  let state = null;
  const listeners = [];
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function defaultRates() { const r = {}; for (const k in CURRENCIES) r[k] = CURRENCIES[k].usd; return r; }
  function blank() {
    return {
      v: 2,
      settings: { base: 'BHD', theme: 'auto', hide: false, secure: false, lock: null, name: '', onboarded: false, lastBackup: null, rates: defaultRates() },
      accounts: [], transactions: [], budgets: [], goals: [], recurring: [],
    };
  }

  /* ---------- dates (local time, never UTC: Bahrain is UTC+3 so toISOString() is wrong near midnight) ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const dstr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dstr(new Date());
  const ymOf = (s) => s.slice(0, 7);
  const addMonths = (ym, k) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + k, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
  const daysIn = (ym) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); };
  const parseD = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const monthLabel = (ym, short) => parseD(ym + '-01').toLocaleDateString('en', short ? { month: 'short' } : { month: 'long', year: 'numeric' });

  /* ---------- FX + formatting ---------- */
  const decOf = (c) => (CURRENCIES[c] ? CURRENCIES[c].dec : 2);
  const rateOf = (c) => (state.settings.rates[c] > 0 ? state.settings.rates[c] : (CURRENCIES[c] ? CURRENCIES[c].usd : 1));
  const convert = (a, from, to) => (from === to ? a : (a / rateOf(from)) * rateOf(to));
  /* "1 base = X cur" for display */
  const pairRate = (cur, base) => rateOf(cur) / rateOf(base || state.settings.base);
  function fmt(n, c, o) {
    o = o || {};
    if (state.settings.hide && !o.force) return (c || '') + ' ••••';
    const d = o.compact ? 0 : decOf(c);
    const loc = c === 'INR' ? 'en-IN' : 'en-US';
    try {
      return new Intl.NumberFormat(loc, { style: 'currency', currency: c, minimumFractionDigits: d, maximumFractionDigits: o.compact ? 1 : d, notation: o.compact ? 'compact' : 'standard', signDisplay: o.sign ? 'exceptZero' : 'auto' }).format(n);
    } catch (e) { return c + ' ' + n.toFixed(d); }
  }

  /* ---------- persistence ---------- */
  let timer = null, lastError = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); lastError = null; }
    catch (e) { lastError = e; }
    listeners.forEach((f) => f());
  }
  const onChange = (f) => listeners.push(f);

  /* ---------- migration / validation ---------- */
  const num = (x, d) => (Number.isFinite(+x) ? +x : d || 0);
  const isCur = (c) => typeof c === 'string' && /^[A-Z]{3}$/.test(c);

  function normalize(o) {
    if (!o || typeof o !== 'object') return null;
    if (o.v === 2) {
      const s = blank();
      Object.assign(s.settings, o.settings || {});
      s.settings.rates = Object.assign(defaultRates(), (o.settings && o.settings.rates) || {});
      for (const k of ['accounts', 'transactions', 'budgets', 'goals', 'recurring']) s[k] = Array.isArray(o[k]) ? o[k] : [];
      s.accounts = s.accounts.filter((a) => a && a.id && isCur(a.currency));
      const ids = new Set(s.accounts.map((a) => a.id));
      s.transactions = s.transactions.filter((t) => t && t.id && ids.has(t.accountId) && num(t.amount) > 0 && /^\d{4}-\d\d-\d\d$/.test(t.date || ''));
      return s;
    }
    if (Array.isArray(o.transactions) && Array.isArray(o.budgets) && Array.isArray(o.goals)) return migrateV1(o);
    return null;
  }

  function migrateV1(o) {
    const s = blank();
    const inrPerBhd = num(o.rate, 240) > 0 ? num(o.rate, 240) : 240;
    s.settings.rates.INR = inrPerBhd * s.settings.rates.BHD;
    s.settings.base = o.currency === 'INR' ? 'INR' : 'BHD';
    const used = new Set();
    o.transactions.forEach((t) => used.add(t.currency === 'INR' ? 'INR' : 'BHD'));
    o.budgets.forEach((b) => used.add(b.currency === 'INR' ? 'INR' : 'BHD'));
    if (!used.size) return s; /* nothing to import: treat as a fresh install */
    const accByCur = {};
    ['BHD', 'INR'].filter((c) => used.has(c)).forEach((c) => {
      const a = { id: uid(), name: c === 'BHD' ? 'Main account' : 'India account', type: c === 'BHD' ? 'bank' : 'savings', currency: c, opening: 0 };
      accByCur[c] = a; s.accounts.push(a);
    });
    s.transactions = o.transactions.filter((t) => t && num(t.amount) > 0 && /^\d{4}-\d\d-\d\d$/.test(t.date || '')).map((t) => {
      const c = t.currency === 'INR' ? 'INR' : 'BHD';
      return { id: String(t.id || uid()), type: t.type === 'income' ? 'income' : 'expense', amount: num(t.amount), currency: c, accountId: accByCur[c].id, category: t.category || 'Other', desc: String(t.description || ''), date: t.date, note: '', created: num(t.created, Date.now()) };
    });
    s.budgets = o.budgets.filter((b) => b && num(b.limit) > 0).map((b) => ({ id: String(b.id || uid()), category: b.category || 'Other', limit: num(b.limit), currency: b.currency === 'INR' ? 'INR' : 'BHD' }));
    s.goals = o.goals.filter((g) => g && num(g.target) > 0).map((g) => ({ id: String(g.id || uid()), name: String(g.name || 'Goal'), target: num(g.target), saved: num(g.saved), currency: g.currency === 'INR' ? 'INR' : 'BHD', deadline: null }));
    s.settings.onboarded = true;
    return s;
  }

  function load() {
    let s = null;
    try { s = normalize(JSON.parse(localStorage.getItem(KEY))); } catch (e) { s = null; }
    if (!s) { try { s = normalize(JSON.parse(localStorage.getItem(OLD_KEY))); } catch (e) { s = null; } }
    state = s || blank();
    return state;
  }
  function replaceAll(o) { const s = normalize(o); if (!s) return false; state = s; save(); return true; }
  function reset() { state = blank(); save(); }

  /* ---------- queries ---------- */
  const acc = (id) => state.accounts.find((a) => a.id === id);
  function balances() {
    const b = {}; state.accounts.forEach((a) => (b[a.id] = num(a.opening)));
    state.transactions.forEach((t) => {
      if (!(t.accountId in b)) return;
      if (t.type === 'income') b[t.accountId] += t.amount;
      else b[t.accountId] -= t.amount;
      if (t.type === 'transfer' && t.toAccountId in b) b[t.toAccountId] += num(t.toAmount, t.amount);
    });
    return b;
  }
  function netWorth() {
    const b = balances(); let total = 0; const byCur = {};
    state.accounts.forEach((a) => { const v = convert(b[a.id], a.currency, state.settings.base); total += v; byCur[a.currency] = (byCur[a.currency] || 0) + b[a.id]; });
    return { total, byCur, balances: b };
  }
  function monthStats(ym) {
    const base = state.settings.base; let inc = 0, exp = 0; const byCat = {}; const big = [];
    state.transactions.forEach((t) => {
      if (t.type === 'transfer' || ymOf(t.date) !== ym) return;
      const v = convert(t.amount, t.currency, base);
      if (t.type === 'income') inc += v; else { exp += v; byCat[t.category] = (byCat[t.category] || 0) + v; big.push({ t, v }); }
    });
    big.sort((a, b) => b.v - a.v);
    return { inc, exp, net: inc - exp, rate: inc > 0 ? (inc - exp) / inc : null, byCat, big: big.slice(0, 5) };
  }
  function spentInCategory(category, ym, cur) {
    return state.transactions.filter((t) => t.type === 'expense' && t.category === category && ymOf(t.date) === ym).reduce((s, t) => s + convert(t.amount, t.currency, cur), 0);
  }
  function transferPairs(ym) {
    const m = {};
    state.transactions.forEach((t) => {
      if (t.type !== 'transfer' || ymOf(t.date) !== ym) return;
      const a = acc(t.accountId), b = acc(t.toAccountId); if (!a || !b || a.currency === b.currency) return;
      const k = a.currency + '>' + b.currency; const p = m[k] || (m[k] = { from: a.currency, to: b.currency, sent: 0, got: 0, n: 0 });
      p.sent += t.amount; p.got += num(t.toAmount, 0); p.n++;
    });
    return Object.values(m);
  }
  function monthsPresent() {
    const s = new Set(state.transactions.map((t) => ymOf(t.date))); s.add(ymOf(today()));
    return [...s].sort().reverse();
  }

  /* ---------- recurring engine ---------- */
  function clampDay(ym, day) { return ym + '-' + pad(Math.min(Math.max(1, day), daysIn(ym))); }
  function runRecurring() {
    const now = today(), cur = ymOf(now); let n = 0;
    state.recurring.forEach((r) => {
      if (!r.active || !acc(r.accountId)) return;
      let m = r.last ? addMonths(r.last, 1) : ymOf(r.start);
      while (m <= cur) {
        const d = clampDay(m, r.day);
        if (d > now) break;
        if (d >= r.start) {
          state.transactions.push({ id: uid(), type: r.type, amount: r.amount, currency: acc(r.accountId).currency, accountId: r.accountId, category: r.category, desc: r.desc, date: d, note: 'Recurring', recurringId: r.id, created: Date.now() });
          n++;
        }
        r.last = m; m = addMonths(m, 1);
      }
    });
    if (n) save();
    return n;
  }
  function nextDue(r) {
    const now = today(); let m = ymOf(now);
    let d = clampDay(m, r.day);
    if (d < now || (r.last && ymOf(d) <= r.last)) d = clampDay(addMonths(m, 1), r.day);
    return d;
  }

  /* ---------- PIN (a privacy lock for the UI, not encryption; data stays in app storage) ---------- */
  function hashPin(pin, salt) {
    let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0; const s = salt + ':' + pin;
    for (let r = 0; r < 2000; r++) for (let i = 0; i < s.length; i++) { const ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  const setPin = (pin) => { const salt = uid(); state.settings.lock = { salt, hash: hashPin(pin, salt) }; save(); };
  const checkPin = (pin) => !!state.settings.lock && hashPin(pin, state.settings.lock.salt) === state.settings.lock.hash;

  /* ---------- export / backup ---------- */
  function download(name, content, mime) {
    if (window.AndroidBridge && typeof window.AndroidBridge.saveFile === 'function') { window.AndroidBridge.saveFile(name, mime, content); return; }
    const a = document.createElement('a'), url = URL.createObjectURL(new Blob([content], { type: mime }));
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function csv() {
    const head = ['Date', 'Type', 'Account', 'Category', 'Description', 'Amount', 'Currency', 'To account', 'Amount received', 'Note'];
    const rows = [...state.transactions].sort((a, b) => a.date.localeCompare(b.date)).map((t) => {
      const a = acc(t.accountId), b = t.toAccountId ? acc(t.toAccountId) : null;
      return [t.date, t.type, a ? a.name : '', t.type === 'transfer' ? '' : t.category, t.desc || '', t.amount, t.currency, b ? b.name : '', t.type === 'transfer' ? num(t.toAmount, t.amount) : '', t.note || ''];
    });
    return '﻿' + [head, ...rows].map((r) => r.map((v) => { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }).join(',')).join('\r\n');
  }
  function exportCSV() { download('moneymate-transactions-' + today() + '.csv', csv(), 'text/csv'); }
  function backup() {
    const copy = JSON.parse(JSON.stringify(state)); copy.settings.lock = null; /* never write the PIN hash into a file */
    state.settings.lastBackup = today(); save();
    download('moneymate-backup-' + today() + '.json', JSON.stringify(copy, null, 2), 'application/json');
  }

  return {
    VERSION, CURRENCIES, catList, cat, uid, load, save, onChange, replaceAll, reset, normalize,
    get s() { return state; }, get lastError() { return lastError; },
    today, ymOf, addMonths, monthLabel, parseD, daysIn, clampDay,
    decOf, rateOf, convert, pairRate, fmt, num, acc, balances, netWorth, monthStats, spentInCategory, transferPairs, monthsPresent,
    runRecurring, nextDue, setPin, checkPin, exportCSV, backup,
  };
})();
