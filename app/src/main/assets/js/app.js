'use strict';
/* MoneyMate UI. Vanilla JS, event delegation via data-act, no network access. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const S = () => MM.s;
  const base = () => S().settings.base;
  const money = (n, c, o) => MM.fmt(n, c, o);

  /* ---------- icons (24px grid, 1.75 stroke) ---------- */
  const ICONS = {
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".9"/><circle cx="4.5" cy="12" r=".9"/><circle cx="4.5" cy="18" r=".9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".9"/>',
    chart: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.3 6.4A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', back: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    swap: '<path d="M7 8h12l-3-3M17 16H5l3 3"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    cash: '<rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    bank: '<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
    savings: '<path d="M4 7a2 2 0 0 1 2-2h12v4M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2zM16 14.5h2"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
    wallet: '<path d="M4 7a2 2 0 0 1 2-2h12v4M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2zM16 14.5h2"/>',
    food: '<path d="M6 3v7a2 2 0 0 0 2 2v9M10 3v7M8 3v7M17 21V3c-2 1-3 4-3 8h3"/>',
    cart: '<path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/>',
    car: '<path d="M5 16v-5l2-5h10l2 5v5M3 16h18M7 16v2M17 16v2"/><circle cx="8" cy="13" r=".8"/><circle cx="16" cy="13" r=".8"/>',
    bag: '<path d="M6 8h12l1 12H5zM9 8V6a3 3 0 0 1 6 0v2"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    play: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
    book: '<path d="M5 4h13v14H7a2 2 0 0 0-2 2zM5 4v16M9 8h5"/>',
    plane: '<path d="M3 13l18-8-6 16-3-7z"/>',
    repeat: '<path d="M17 3l3 3-3 3M20 6H8a4 4 0 0 0-4 4M7 21l-3-3 3-3M4 18h12a4 4 0 0 0 4-4"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 3 6"/>',
    dots: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
    store: '<path d="M3 9l1-5h16l1 5M4 9v11h16V9M9 20v-6h6v6"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    gift: '<rect x="3" y="9" width="18" height="11" rx="1"/><path d="M12 9v11M3 13h18M12 9c-3 0-5-1-5-3s3-2 5 3c2-5 5-5 5-3s-2 3-5 3"/>',
    alert: '<path d="M12 4l9 16H3zM12 10v4M12 17v.5"/>', check: '<path d="M5 12l5 5 9-10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  };
  const ic = (n, c) => `<svg class="ic ${c || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ICONS.dots}</svg>`;
  const ACCT_TYPES = [['bank', 'Bank account'], ['savings', 'Savings'], ['cash', 'Cash'], ['card', 'Credit card'], ['wallet', 'Wallet / app']];

  /* ---------- ui state ---------- */
  const thisMonth = () => MM.ymOf(MM.today());
  const ui = { tab: 'home', actMonth: 'all', actType: 'all', actAcc: 'all', q: '', actLimit: 60, planTab: 'budgets', budMonth: thisMonth(), insMonth: thisMonth() };
  let lastAccount = null, txDraft = null, toastTimer = null, locked = false;

  /* ---------- helpers ---------- */
  function dayLabel(d) {
    const t = MM.today(); if (d === t) return 'Today';
    const y = new Date(); y.setDate(y.getDate() - 1); const ys = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    if (d === ys) return 'Yesterday';
    return MM.parseD(d).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short', year: d.slice(0, 4) === t.slice(0, 4) ? undefined : 'numeric' });
  }
  const parseNum = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '').trim()); return Number.isFinite(n) ? n : NaN; };
  const round = (n, cur) => { const d = MM.decOf(cur); return Number(n.toFixed(d)); };
  const curOptions = (sel, short) => Object.keys(MM.CURRENCIES).map((c) => `<option value="${c}" ${c === sel ? 'selected' : ''}>${short ? c : c + ' · ' + MM.CURRENCIES[c].name}</option>`).join('');
  const accOptions = (sel, excl) => S().accounts.filter((a) => a.id !== excl).map((a) => `<option value="${a.id}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)} (${a.currency})</option>`).join('');
  const usedCurrencies = () => { const s = new Set([base()]); S().accounts.forEach((a) => s.add(a.currency)); return [...s]; };
  const acctIcon = (t) => ({ bank: 'bank', savings: 'savings', cash: 'cash', card: 'card', wallet: 'wallet' }[t] || 'wallet');

  /* ---------- toast + dialog + sheet ---------- */
  function toast(msg, action) {
    const old = $('.toast'); if (old) old.remove(); clearTimeout(toastTimer);
    const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status');
    el.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button type="button">${esc(action.label)}</button>` : '');
    if (action) el.querySelector('button').onclick = () => { el.remove(); action.fn(); };
    $('#layer').appendChild(el); toastTimer = setTimeout(() => el.remove(), action ? 6000 : 2800);
  }
  function ask(o) {
    return new Promise((res) => {
      const el = document.createElement('div'); el.className = 'scrim dialog'; el.dataset.dialog = '1';
      el.innerHTML = `<div class="box" role="alertdialog" aria-modal="true"><h3>${esc(o.title)}</h3><p>${esc(o.body || '')}</p><div class="btns"><button class="btn ghost" data-r="0">${esc(o.cancel || 'Cancel')}</button><button class="btn ${o.danger ? 'danger' : ''}" data-r="1">${esc(o.ok || 'OK')}</button></div></div>`;
      el.onclick = (e) => { const b = e.target.closest('[data-r]'); if (b || e.target === el) { el.remove(); res(!!(b && b.dataset.r === '1')); } };
      $('#layer').appendChild(el); el.querySelector('[data-r="1"]').focus();
    });
  }
  function removeSheet() { const s = $('#layer > .scrim[data-sheet]'); if (s) s.remove(); }
  function closeSheet() { removeSheet(); txDraft = null; }
  function openSheet(title, body) {
    removeSheet();
    const el = document.createElement('div'); el.className = 'scrim'; el.dataset.sheet = '1';
    el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="grab"></div><div class="head"><h3>${esc(title)}</h3><button type="button" class="icon-btn" data-act="closeSheet" aria-label="Close">${ic('x')}</button></div>${body}</div>`;
    el.addEventListener('click', (e) => { if (e.target === el) closeSheet(); });
    $('#layer').appendChild(el);
    return el;
  }

  /* ---------- shared fragments ---------- */
  function topbar(title, right) { return `<header class="topbar"><h1>${esc(title)}</h1>${right || ''}</header>`; }
  function monthNav(scope, ym) {
    const cur = thisMonth();
    return `<div class="monthnav"><button class="icon-btn" data-act="month" data-scope="${scope}" data-dir="-1" aria-label="Previous month">${ic('back')}</button><b>${MM.monthLabel(ym)}</b><button class="icon-btn" data-act="month" data-scope="${scope}" data-dir="1" aria-label="Next month" ${ym >= cur ? 'disabled' : ''}>${ic('next')}</button></div>`;
  }
  function emptyState(title, body, act, label) {
    return `<div class="empty"><b>${esc(title)}</b>${esc(body)}${act ? `<br><button class="btn" data-act="${act}">${esc(label)}</button>` : ''}</div>`;
  }
  function txRow(t) {
    const c = MM.cat(t.type, t.category), a = MM.acc(t.accountId), b = t.toAccountId ? MM.acc(t.toAccountId) : null;
    if (!a) return '';
    const title = t.desc || (t.type === 'transfer' ? 'Transfer' : c.label);
    const sub = t.type === 'transfer' ? `${esc(a.name)} → ${b ? esc(b.name) : '—'}` : `${esc(c.label)} · ${esc(a.name)}${t.recurringId ? ' · Recurring' : ''}`;
    let amt;
    if (t.type === 'income') amt = `<div class="amt pos num">+${money(t.amount, t.currency)}</div>`;
    else if (t.type === 'expense') amt = `<div class="amt num">−${money(t.amount, t.currency)}</div>`;
    else { const to = b && b.currency !== t.currency ? `<small>→ ${money(MM.num(t.toAmount, t.amount), b.currency)}</small>` : ''; amt = `<div class="amt num">${money(t.amount, t.currency)}${to}</div>`; }
    return `<button class="row-item" data-act="editTx" data-id="${t.id}"><span class="chip-ic">${ic(c.icon)}</span><span class="grow"><div class="t1">${esc(title)}</div><div class="t2">${sub}</div></span>${amt}</button>`;
  }
  function budgetRow(b, ym, editable) {
    const spent = MM.spentInCategory(b.category, ym, b.currency), pct = spent / b.limit, c = MM.cat('expense', b.category);
    const cls = pct >= 1 ? 'over' : pct >= 0.8 ? 'warn' : '';
    const right = pct >= 1 ? `<span class="neg">Over by ${money(spent - b.limit, b.currency)}</span>` : `<span class="muted">${money(b.limit - spent, b.currency)} left</span>`;
    return `<${editable ? 'button' : 'div'} class="row-item" ${editable ? `data-act="editBudget" data-id="${b.id}"` : ''} style="display:block">
      <div style="display:flex;align-items:center;gap:12px"><span class="chip-ic">${ic(c.icon)}</span><span class="grow"><div class="t1">${esc(c.label)}</div><div class="t2 num" style="white-space:normal">${money(spent, b.currency)} of ${money(b.limit, b.currency)}</div></span><span class="small num" style="white-space:nowrap;text-align:right">${right}</span></div>
      <div class="bar ${cls}" role="progressbar" aria-valuenow="${Math.min(100, Math.round(pct * 100))}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100, pct * 100).toFixed(1)}%"></i></div></${editable ? 'button' : 'div'}>`;
  }

  /* =================== HOME =================== */
  function viewHome() {
    const s = S(), cur = thisMonth(), nw = MM.netWorth(), st = MM.monthStats(cur), prev = MM.monthStats(MM.addMonths(cur, -1));
    const h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const tint = ['#e0bd7a', '#4cc9a7', '#7fb2ff', '#ee7fac', '#b79cff'];
    const curs = Object.keys(nw.byCur);
    const parts = curs.map((c, i) => ({ c, value: Math.max(0, MM.convert(nw.byCur[c], c, base())), native: nw.byCur[c], color: tint[i % tint.length] })).filter((p) => p.value > 0);
    const strip = parts.length > 1 ? Charts.strip(parts) + `<div class="split-legend">${parts.map((p) => `<span><i class="dotk" style="background:${p.color}"></i><b class="num">${money(p.native, p.c)}</b></span>`).join('')}</div>` : '';
    let html = `<header class="topbar"><div class="hello"><small>${greet}</small><b>${s.settings.name ? esc(s.settings.name) : 'Welcome back'}</b></div>
      <button class="icon-btn" data-act="toggleHide" aria-label="${s.settings.hide ? 'Show' : 'Hide'} balances">${ic(s.settings.hide ? 'eyeoff' : 'eye')}</button>
      <button class="icon-btn" data-act="nav" data-id="settings" aria-label="Settings">${ic('gear')}</button></header>`;
    html += `<section class="hero"><div class="label">Net worth · ${base()}</div><div class="big num">${money(nw.total, base())}</div>${strip}
      <div class="hero-row"><div><small>Income · ${MM.monthLabel(cur, true)}</small><b class="num">${money(st.inc, base())}</b></div><div><small>Spent · ${MM.monthLabel(cur, true)}</small><b class="num">${money(st.exp, base())}</b></div></div></section>`;
    if (st.exp > 0 || prev.exp > 0) html += `<p class="insight">${st.exp > 0 ? `Spent ${money(st.exp, base())} so far this month.` : 'Nothing spent yet this month.'} ${prev.exp > 0 ? `Last month's total: ${money(prev.exp, base())}.` : ''}</p>`;

    const last = s.settings.lastBackup, days = last ? Math.floor((MM.parseD(MM.today()) - MM.parseD(last)) / 864e5) : null;
    if (s.transactions.length >= 15 && (days === null || days > 30)) {
      html += `<div class="card" style="margin-top:14px;display:flex;gap:12px;align-items:center"><span class="chip-ic">${ic('shield')}</span><span class="grow"><div class="t1">Back up your data</div><div class="t2" style="white-space:normal">${days === null ? 'You have not made a backup yet.' : `Last backup was ${days} days ago.`} Records live only on this phone.</div></span><button class="linkbtn" data-act="backupNow">Back up</button></div>`;
    }
    html += `<div class="quick"><button data-act="addTx" data-id="income">${ic('plus')}Income</button><button data-act="addTx" data-id="expense">${ic('minus')}Expense</button><button data-act="addTx" data-id="transfer">${ic('swap')}Transfer</button></div>`;

    html += `<h2 class="sec">Accounts <button class="linkbtn" data-act="newAccount">Add</button></h2><div class="scroller">` + s.accounts.map((a) => {
      const v = nw.balances[a.id], eq = a.currency !== base() ? `≈ ${money(MM.convert(v, a.currency, base()), base())}` : '';
      return `<button class="acct" data-act="editAccount" data-id="${a.id}"><div class="row">${ic(acctIcon(a.type), 'sm')}<span>${esc(a.name)}</span></div><div class="bal num">${money(v, a.currency)}</div><div class="eq num">${eq}</div></button>`;
    }).join('') + `<button class="acct add" data-act="newAccount">${ic('plus')}New account</button></div>`;

    const buds = s.budgets.map((b) => ({ b, p: MM.spentInCategory(b.category, cur, b.currency) / b.limit })).sort((x, y) => y.p - x.p).slice(0, 3);
    html += `<h2 class="sec">Budgets this month <button class="linkbtn" data-act="goPlan" data-id="budgets">${buds.length ? 'See all' : 'Set up'}</button></h2>`;
    html += buds.length ? `<div class="card flush">${buds.map((x) => budgetRow(x.b, cur, false)).join('')}</div>` : `<div class="card">${emptyState('No budgets yet', 'Set a monthly limit for the categories you want to watch.', 'newBudget', 'Create a budget')}</div>`;

    const due = s.recurring.filter((r) => r.active && MM.acc(r.accountId)).map((r) => ({ r, d: MM.nextDue(r) })).sort((a, b) => a.d.localeCompare(b.d)).slice(0, 3);
    if (due.length) html += `<h2 class="sec">Coming up</h2><div class="card flush">${due.map(({ r, d }) => { const c = MM.cat(r.type, r.category), a = MM.acc(r.accountId); return `<div class="row-item"><span class="chip-ic">${ic(c.icon)}</span><span class="grow"><div class="t1">${esc(r.desc || c.label)}</div><div class="t2">${dayLabel(d)} · ${esc(a.name)}</div></span><div class="amt num ${r.type === 'income' ? 'pos' : ''}">${r.type === 'income' ? '+' : '−'}${money(r.amount, a.currency)}</div></div>`; }).join('')}</div>`;

    const recent = [...s.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.created - a.created).slice(0, 5);
    html += `<h2 class="sec">Recent activity <button class="linkbtn" data-act="nav" data-id="activity">See all</button></h2>`;
    html += recent.length ? `<div class="card flush">${recent.map(txRow).join('')}</div>` : `<div class="card">${emptyState('No transactions yet', 'Record your first income or expense to see your money here.', 'addTxExpense', 'Add a transaction')}</div>`;
    return html;
  }

  /* =================== ACTIVITY =================== */
  function filteredTx() {
    const q = ui.q.trim().toLowerCase();
    return S().transactions.filter((t) =>
      (ui.actType === 'all' || t.type === ui.actType) && (ui.actMonth === 'all' || MM.ymOf(t.date) === ui.actMonth) &&
      (ui.actAcc === 'all' || t.accountId === ui.actAcc || t.toAccountId === ui.actAcc) &&
      (!q || ((t.desc || '') + ' ' + t.category + ' ' + (t.note || '')).toLowerCase().includes(q))
    ).sort((a, b) => b.date.localeCompare(a.date) || b.created - a.created);
  }
  function actList() {
    const all = filteredTx();
    if (!all.length) return `<div class="card">${S().transactions.length ? emptyState('Nothing matches', 'Try a different search or clear the filters.') : emptyState('No transactions yet', 'Your income, expenses and transfers will appear here.', 'addTxExpense', 'Add a transaction')}</div>`;
    let inc = 0, exp = 0; all.forEach((t) => { if (t.type === 'transfer') return; const v = MM.convert(t.amount, t.currency, base()); if (t.type === 'income') inc += v; else exp += v; });
    const shown = all.slice(0, ui.actLimit); const groups = [];
    shown.forEach((t) => { const g = groups[groups.length - 1]; if (g && g.d === t.date) g.items.push(t); else groups.push({ d: t.date, items: [t] }); });
    let out = `<div class="stats" style="margin:14px 0 4px"><div class="stat"><small>In</small><b class="pos num">${money(inc, base())}</b></div><div class="stat"><small>Out</small><b class="num">${money(exp, base())}</b></div></div>`;
    out += groups.map((g) => { const net = g.items.reduce((s, t) => (t.type === 'transfer' ? s : s + (t.type === 'income' ? 1 : -1) * MM.convert(t.amount, t.currency, base())), 0); return `<div class="dayhead"><span>${dayLabel(g.d)}</span><span class="num">${net ? money(net, base(), { sign: true }) : ''}</span></div><div class="card flush">${g.items.map(txRow).join('')}</div>`; }).join('');
    if (all.length > shown.length) out += `<button class="btn ghost block" style="margin-top:16px" data-act="moreTx">Show more (${all.length - shown.length})</button>`;
    return out;
  }
  function viewActivity() {
    const s = S(), months = MM.monthsPresent();
    return topbar('Activity', `<button class="icon-btn" data-act="exportCsv" aria-label="Export CSV">${ic('download')}</button>`) +
      `<div class="searchbox">${ic('search', 'sm')}<input id="q" type="search" placeholder="Search description or category" value="${esc(ui.q)}" aria-label="Search transactions"></div>
      <div class="chips" style="margin-top:12px">${[['all', 'All'], ['expense', 'Expenses'], ['income', 'Income'], ['transfer', 'Transfers']].map(([k, l]) => `<button class="chip" data-act="filterType" data-id="${k}" aria-pressed="${ui.actType === k}">${l}</button>`).join('')}</div>
      <div class="two" style="margin-top:12px"><select id="fMonth" aria-label="Month"><option value="all">All time</option>${months.map((m) => `<option value="${m}" ${ui.actMonth === m ? 'selected' : ''}>${MM.monthLabel(m)}</option>`).join('')}</select>
      <select id="fAcc" aria-label="Account"><option value="all">All accounts</option>${s.accounts.map((a) => `<option value="${a.id}" ${ui.actAcc === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
      <div id="actList">${actList()}</div>`;
  }

  /* =================== PLAN (budgets / goals / recurring) =================== */
  function viewPlan() {
    const s = S(); let body = '';
    if (ui.planTab === 'budgets') {
      const bs = s.budgets, ym = ui.budMonth; let lim = 0, sp = 0;
      bs.forEach((b) => { lim += MM.convert(b.limit, b.currency, base()); sp += MM.convert(MM.spentInCategory(b.category, ym, b.currency), b.currency, base()); });
      body = monthNav('bud', ym) + (bs.length ? `<div class="stats" style="margin-bottom:14px"><div class="stat"><small>Budgeted</small><b class="num">${money(lim, base())}</b></div><div class="stat"><small>${lim - sp >= 0 ? 'Left to spend' : 'Over budget'}</small><b class="num ${lim - sp < 0 ? 'neg' : ''}">${money(Math.abs(lim - sp), base())}</b></div></div><div class="card flush">${bs.map((b) => budgetRow(b, ym, true)).join('')}</div>` : `<div class="card">${emptyState('No budgets yet', 'A budget is a monthly spending limit for one category, such as Dining or Groceries.')}</div>`) +
        `<button class="btn block" style="margin-top:16px" data-act="newBudget">${ic('plus', 'sm')}Add budget</button>`;
    } else if (ui.planTab === 'goals') {
      body = (s.goals.length ? s.goals.map((g) => {
        const pct = Math.min(1, g.saved / g.target), done = g.saved >= g.target; let hint = '';
        if (g.deadline && !done) { const months = Math.max(1, Math.round((MM.parseD(g.deadline) - MM.parseD(MM.today())) / (30.44 * 864e5))); hint = MM.parseD(g.deadline) < MM.parseD(MM.today()) ? 'Target date has passed.' : `Save ${money((g.target - g.saved) / months, g.currency)} a month to reach it by ${MM.monthLabel(MM.ymOf(g.deadline))}.`; }
        return `<div class="card" style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:10px"><span class="grow"><div class="t1">${esc(g.name)}</div><div class="t2 num">${money(g.saved, g.currency)} of ${money(g.target, g.currency)}</div></span>${done ? `<span class="badge ok">${ic('check', 'sm')}Reached</span>` : `<span class="num" style="font-weight:700">${Math.round(pct * 100)}%</span>`}</div>
        <div class="bar ${done ? '' : ''}"><i style="width:${(pct * 100).toFixed(1)}%"></i></div>${hint ? `<div class="small muted">${hint}</div>` : ''}
        <div style="display:flex;gap:10px;margin-top:12px"><button class="btn ghost" style="flex:1;min-height:40px" data-act="fundGoal" data-id="${g.id}">Add or withdraw</button><button class="btn ghost" style="min-height:40px" data-act="editGoal" data-id="${g.id}">Edit</button></div></div>`;
      }).join('') : `<div class="card">${emptyState('No goals yet', 'Name something you are saving for and track your progress toward it.')}</div>`) + `<button class="btn block" data-act="newGoal">${ic('plus', 'sm')}Add goal</button>`;
    } else {
      body = (s.recurring.length ? `<div class="card flush">${s.recurring.map((r) => { const c = MM.cat(r.type, r.category), a = MM.acc(r.accountId); return `<button class="row-item" data-act="editRec" data-id="${r.id}"><span class="chip-ic">${ic(c.icon)}</span><span class="grow"><div class="t1">${esc(r.desc || c.label)}</div><div class="t2">${r.active ? `Monthly on day ${r.day}` : 'Paused'} · ${a ? esc(a.name) : 'Missing account'}</div></span><span class="amt num ${r.type === 'income' ? 'pos' : ''}">${r.type === 'income' ? '+' : '−'}${money(r.amount, a ? a.currency : base())}</span></button>`; }).join('')}</div>` : `<div class="card">${emptyState('No recurring items', 'Add rent, subscriptions or salary once. MoneyMate records them for you each month.')}</div>`) +
        `<button class="btn block" style="margin-top:16px" data-act="newRec">${ic('plus', 'sm')}Add recurring item</button><p class="small faint">Items are recorded automatically on their due day the next time you open the app.</p>`;
    }
    return topbar('Plan') + `<div class="seg" role="group" aria-label="Plan sections" style="margin-bottom:14px">${[['budgets', 'Budgets'], ['goals', 'Goals'], ['recurring', 'Recurring']].map(([k, l]) => `<button data-act="planTab" data-id="${k}" aria-pressed="${ui.planTab === k}">${l}</button>`).join('')}</div>` + body;
  }

  /* =================== INSIGHTS =================== */
  function viewInsights() {
    const ym = ui.insMonth, st = MM.monthStats(ym), b = base();
    const cats = Object.entries(st.byCat).map(([k, v]) => ({ id: k, label: MM.cat('expense', k).label, value: v })).sort((x, y) => y.value - x.value);
    const months = []; for (let i = 5; i >= 0; i--) { const m = MM.addMonths(thisMonth(), -i), x = MM.monthStats(m); months.push({ ym: m, label: MM.monthLabel(m, true), inc: x.inc, exp: x.exp }); }
    const d = cats.length ? Charts.donut(cats) : null;
    let html = topbar('Insights') + monthNav('ins', ym);
    html += `<div class="stats"><div class="stat"><small>Income</small><b class="num pos">${money(st.inc, b)}</b></div><div class="stat"><small>Spent</small><b class="num">${money(st.exp, b)}</b></div><div class="stat"><small>Net</small><b class="num ${st.net < 0 ? 'neg' : ''}">${money(st.net, b, { sign: true })}</b></div><div class="stat"><small>Savings rate</small><b class="num">${st.rate === null ? '—' : Math.round(st.rate * 100) + '%'}</b></div></div>`;
    html += `<h2 class="sec">Where it went</h2><div class="card">` + (d ? `<div class="donutwrap"><div class="donut">${d.svg}<div class="mid"><span>Spent</span><b class="num">${MM.s.settings.hide ? '••••' : money(d.total, b, { compact: true })}</b></div></div><div class="legend">${d.segs.map((s) => `<div><i class="dotk" style="background:${s.color};margin:0"></i><span class="nm">${esc(s.label)}</span><span class="pc num">${Math.round((s.value / d.total) * 100)}%</span></div>`).join('')}</div></div>
      <div style="margin-top:8px">${cats.map((c) => `<div class="row-item" style="padding:9px 0"><span class="chip-ic" style="width:34px;height:34px;border-radius:11px">${ic(MM.cat('expense', c.id).icon, 'sm')}</span><span class="grow t1">${esc(c.label)}</span><span class="amt num">${money(c.value, b)}</span></div>`).join('')}</div>` : emptyState('No spending recorded', `Nothing was spent in ${MM.monthLabel(ym)}.`)) + `</div>`;
    html += `<h2 class="sec">Last 6 months</h2><div class="card"><div class="key"><span><i class="dotk" style="background:var(--s1)"></i>Income</span><span><i class="dotk" style="background:var(--s2)"></i>Spent</span></div>${Charts.bars(months, ym, (v) => (S().settings.hide ? '' : money(v, b, { compact: true })))}<div class="small faint" style="margin-top:4px">Tap a month to open it.</div></div>`;
    if (st.big.length) html += `<h2 class="sec">Largest expenses</h2><div class="card flush">${st.big.map((x) => txRow(x.t)).join('')}</div>`;
    const pairs = MM.transferPairs(ym);
    if (pairs.length) html += `<h2 class="sec">Money sent between currencies</h2><div class="card flush">${pairs.map((p) => `<div class="row-item"><span class="chip-ic">${ic('swap')}</span><span class="grow"><div class="t1 num">${money(p.sent, p.from)} → ${money(p.got, p.to)}</div><div class="t2">${p.n} transfer${p.n > 1 ? 's' : ''} · average rate 1 ${p.from} = ${(p.got / p.sent).toFixed(MM.decOf(p.to) > 2 ? 3 : 2)} ${p.to}</div></span></div>`).join('')}</div>`;
    return html;
  }

  /* =================== SETTINGS =================== */
  const sw = (on, act, label) => `<button class="switch" role="switch" aria-checked="${!!on}" aria-label="${label}" data-act="${act}"></button>`;
  function viewSettings() {
    const s = S(), set = s.settings, used = usedCurrencies().filter((c) => c !== set.base), others = Object.keys(MM.CURRENCIES).filter((c) => c !== set.base && !used.includes(c));
    const fx = (c) => `<div class="fxrow"><span>1 ${set.base} =</span><input data-rate="${c}" inputmode="decimal" value="${MM.pairRate(c, set.base).toFixed(MM.decOf(c) + 2).replace(/\.?0+$/, '')}" aria-label="${c} per ${set.base}"><span>${c}</span></div>`;
    const last = set.lastBackup ? dayLabel(set.lastBackup) : 'Never';
    return `<header class="topbar"><button class="icon-btn" data-act="nav" data-id="home" aria-label="Back">${ic('back')}</button><h1>Settings</h1></header>
    <h2 class="sec">Profile</h2><div class="card"><div class="field" style="margin:0"><label for="setName">Your name</label><input id="setName" maxlength="30" value="${esc(set.name)}" placeholder="Shown on the home screen"></div></div>
    <h2 class="sec">Currency</h2><div class="card"><div class="field" style="margin-top:0"><label for="setBase">Main currency</label><select id="setBase">${curOptions(set.base)}</select><span class="hint">Totals and charts are shown in this currency.</span></div>
      <div class="lbl">Exchange rates</div>${used.map(fx).join('') || '<p class="small muted">Add an account in another currency to set a rate.</p>'}
      ${others.length ? `<details><summary>Other currencies</summary>${others.map(fx).join('')}</details>` : ''}<p class="small faint" style="margin-bottom:0">Rates are estimates you control. MoneyMate never fetches live prices.</p></div>
    <h2 class="sec">Accounts</h2><div class="card flush">${s.accounts.map((a) => `<button class="setrow" data-act="editAccount" data-id="${a.id}"><span class="chip-ic">${ic(acctIcon(a.type))}</span><span class="grow"><div class="t1">${esc(a.name)}</div><div class="t2">${a.currency} · ${(ACCT_TYPES.find((x) => x[0] === a.type) || [0, 'Account'])[1]}</div></span>${ic('next', 'sm')}</button>`).join('')}<button class="setrow" data-act="newAccount"><span class="chip-ic">${ic('plus')}</span><span class="grow t1">Add account</span></button></div>
    <h2 class="sec">Appearance</h2><div class="card"><div class="seg">${[['auto', 'Auto'], ['dark', 'Dark'], ['light', 'Light']].map(([k, l]) => `<button data-act="theme" data-id="${k}" aria-pressed="${set.theme === k}">${l}</button>`).join('')}</div></div>
    <h2 class="sec">Privacy</h2><div class="card flush">
      <div class="setrow"><span class="grow"><div class="t1">PIN lock</div><div class="t2" style="white-space:normal">Ask for a 4-digit PIN when the app opens.</div></span>${sw(set.lock, 'toggleLock', 'PIN lock')}</div>
      <div class="setrow"><span class="grow"><div class="t1">Hide balances</div><div class="t2" style="white-space:normal">Mask amounts across the app.</div></span>${sw(set.hide, 'toggleHide', 'Hide balances')}</div>
      <div class="setrow"><span class="grow"><div class="t1">Protect screen</div><div class="t2" style="white-space:normal">Hide app contents in recent apps and block screenshots.</div></span>${sw(set.secure, 'toggleSecure', 'Protect screen')}</div></div>
    <h2 class="sec">Your data</h2><div class="card"><p class="small muted" style="margin-top:0">Everything is stored on this phone only. Last backup: <b>${last}</b>.</p>
      <div class="two"><button class="btn ghost" data-act="backupNow">${ic('download', 'sm')}Back up</button><label class="btn ghost" style="cursor:pointer">${ic('upload', 'sm')}Restore<input type="file" id="restoreFile" accept=".json,application/json" hidden></label></div>
      <button class="btn ghost block" style="margin-top:10px" data-act="exportCsv">Export transactions (CSV)</button><button class="btn danger block" style="margin-top:10px" data-act="eraseAll">Erase all data</button></div>
    <p class="small faint center" style="margin:22px 0 0">MoneyMate ${MM.VERSION} · works offline · no account, no ads, no tracking</p>`;
  }

  /* =================== RENDER =================== */
  function render() {
    if (!S().settings.onboarded) { showOnboarding(); return; }
    const v = $('#view'); const keep = window.scrollY;
    const fn = { home: viewHome, activity: viewActivity, plan: viewPlan, insights: viewInsights, settings: viewSettings }[ui.tab] || viewHome;
    v.innerHTML = fn();
    document.querySelectorAll('.nav [data-tab]').forEach((b) => (b.dataset.tab === ui.tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
    window.scrollTo(0, keep);
  }
  function go(tab) { ui.tab = tab; render(); window.scrollTo(0, 0); }

  /* =================== FORMS =================== */
  function catGrid(type, sel) {
    return `<div class="cats" role="group" aria-label="Category">${MM.catList(type).map((c) => `<button type="button" class="cat" data-act="pickCat" data-id="${c.id}" aria-pressed="${c.id === sel}">${ic(c.icon)}<span>${esc(c.label)}</span></button>`).join('')}<input type="hidden" name="category" value="${esc(sel)}"></div>`;
  }
  /* --- transaction --- */
  function openTx(o) {
    const s = S(); if (!s.accounts.length) { toast('Add an account first'); newAccount(); return; }
    const t = o.id ? s.transactions.find((x) => x.id === o.id) : null;
    const accId = t ? t.accountId : (MM.acc(lastAccount) ? lastAccount : s.accounts[0].id);
    const type = t ? t.type : o.type || 'expense';
    txDraft = { id: t ? t.id : null, type, accountId: accId, toAccountId: t && t.toAccountId ? t.toAccountId : (s.accounts.find((a) => a.id !== accId) || {}).id, amount: t ? t.amount : '', toAmount: t && t.type === 'transfer' ? t.toAmount : '', toAuto: !t, category: t ? t.category : (type === 'income' ? 'Salary' : 'Food'), desc: t ? t.desc : '', date: t ? t.date : MM.today(), note: t ? t.note || '' : '', repeat: false };
    renderTxSheet();
  }
  function renderTxSheet() {
    const d = txDraft, s = S(), a = MM.acc(d.accountId), tr = d.type === 'transfer';
    if (tr && s.accounts.length < 2) { toast('You need two accounts to transfer between'); txDraft.type = 'expense'; return renderTxSheet(); }
    if (tr && (!d.toAccountId || d.toAccountId === d.accountId)) d.toAccountId = (s.accounts.find((x) => x.id !== d.accountId) || {}).id;
    if (!tr && !MM.catList(d.type).some((c) => c.id === d.category)) d.category = 'Other';
    const to = tr ? MM.acc(d.toAccountId) : null;
    let body = `<form data-form="tx" autocomplete="off"><div class="seg" role="group" aria-label="Type" style="margin:6px 0 4px">${[['expense', 'Expense'], ['income', 'Income'], ['transfer', 'Transfer']].map(([k, l]) => `<button type="button" data-act="txType" data-id="${k}" aria-pressed="${d.type === k}">${l}</button>`).join('')}</div>
      <div class="field"><label for="amount">${tr ? 'Amount sent' : 'Amount'}</label><div class="amount-wrap"><input class="amount-input num" id="amount" name="amount" inputmode="decimal" placeholder="0" value="${d.amount === '' ? '' : esc(d.amount)}" required><span id="curTag">${a.currency}</span></div></div>
      <div class="field"><label for="accountId">${tr ? 'From account' : 'Account'}</label><select id="accountId" name="accountId">${accOptions(d.accountId)}</select></div>`;
    if (tr) body += `<div class="field"><label for="toAccountId">To account</label><select id="toAccountId" name="toAccountId">${accOptions(d.toAccountId, d.accountId)}</select></div>
      <div class="field"><label for="toAmount">Amount received${to && to.currency !== a.currency ? ` (${to.currency})` : ''}</label><div class="amount-wrap"><input id="toAmount" name="toAmount" inputmode="decimal" class="num" value="${d.toAmount === '' ? '' : esc(d.toAmount)}" placeholder="Calculated from your rate"><span id="toTag">${to ? to.currency : ''}</span></div><span class="hint" id="fxHint"></span></div>`;
    else body += `<div class="field"><span class="lbl">Category</span>${catGrid(d.type, d.category)}</div>`;
    body += `<div class="field"><label for="desc">${tr ? 'Note' : 'Description'} (optional)</label><input id="desc" name="desc" maxlength="60" value="${esc(d.desc)}" placeholder="${tr ? 'e.g. Monthly remittance' : 'e.g. Weekly groceries'}"></div>
      <div class="field"><label for="date">Date</label><input id="date" name="date" type="date" value="${d.date}" required></div>`;
    if (!d.id && !tr) body += `<label class="check"><input type="checkbox" name="repeat" ${d.repeat ? 'checked' : ''}><span><div class="t1">Repeat every month</div><div class="small muted">Recorded automatically on the same day each month.</div></span></label>`;
    body += `<button class="btn block" type="submit" style="margin-top:8px">${d.id ? 'Save changes' : 'Save'}</button>${d.id ? `<button type="button" class="btn danger block" style="margin-top:10px" data-act="delTx" data-id="${d.id}">${ic('trash', 'sm')}Delete</button>` : ''}</form>`;
    openSheet(d.id ? 'Edit transaction' : 'New transaction', body); updateFxHint();
  }
  function syncDraft() {
    const f = $('#layer form[data-form="tx"]'); if (!f || !txDraft) return;
    const g = (n) => (f.elements[n] ? f.elements[n].value : undefined);
    txDraft.amount = g('amount'); txDraft.accountId = g('accountId') || txDraft.accountId; txDraft.desc = g('desc'); txDraft.date = g('date') || txDraft.date;
    if (f.elements.toAccountId) { txDraft.toAccountId = g('toAccountId'); txDraft.toAmount = g('toAmount'); }
    if (f.elements.category) txDraft.category = g('category');
    if (f.elements.repeat) txDraft.repeat = f.elements.repeat.checked;
  }
  function autoReceived() {
    const f = $('#layer form[data-form="tx"]'); if (!f || !f.elements.toAmount) return;
    const a = MM.acc(f.elements.accountId.value), b = MM.acc(f.elements.toAccountId.value), amt = parseNum(f.elements.amount.value);
    if (f.elements.toAmount.dataset.manual !== '1' && txDraft.toAuto !== false) f.elements.toAmount.value = a && b && amt > 0 ? String(round(MM.convert(amt, a.currency, b.currency), b.currency)) : '';
    $('#curTag').textContent = a ? a.currency : ''; $('#toTag').textContent = b ? b.currency : ''; updateFxHint();
  }
  function updateFxHint() {
    const f = $('#layer form[data-form="tx"]'), h = $('#fxHint'); if (!f || !h || !f.elements.toAmount) return;
    const a = MM.acc(f.elements.accountId.value), b = MM.acc(f.elements.toAccountId.value), x = parseNum(f.elements.amount.value), y = parseNum(f.elements.toAmount.value);
    if (!a || !b) return;
    if (a.currency === b.currency) { h.textContent = ''; return; }
    h.textContent = x > 0 && y > 0 ? `Rate used: 1 ${a.currency} = ${(y / x).toFixed(4)} ${b.currency}. Edit the received amount to match your actual transfer.` : `Default rate: 1 ${a.currency} = ${MM.pairRate(b.currency, a.currency).toFixed(4)} ${b.currency}.`;
  }
  function saveTx(f) {
    const v = new FormData(f), type = txDraft.type, a = MM.acc(v.get('accountId')), amount = parseNum(v.get('amount'));
    if (!a) return toast('Choose an account');
    if (!(amount > 0)) return toast('Enter an amount greater than zero');
    if (!v.get('date')) return toast('Choose a date');
    const item = { id: txDraft.id || MM.uid(), type, amount: round(amount, a.currency), currency: a.currency, accountId: a.id, category: type === 'transfer' ? 'Transfer' : v.get('category') || 'Other', desc: String(v.get('desc') || '').trim(), date: v.get('date'), note: '', created: Date.now() };
    if (type === 'transfer') {
      const b = MM.acc(v.get('toAccountId')); if (!b || b.id === a.id) return toast('Choose a different destination account');
      let got = parseNum(v.get('toAmount')); if (!(got > 0)) got = MM.convert(item.amount, a.currency, b.currency);
      item.toAccountId = b.id; item.toAmount = round(got, b.currency);
    }
    const arr = S().transactions, i = arr.findIndex((x) => x.id === item.id);
    if (i >= 0) { item.created = arr[i].created; if (arr[i].recurringId) item.recurringId = arr[i].recurringId; item.note = arr[i].note || ''; arr[i] = item; } else arr.push(item);
    if (!txDraft.id && v.get('repeat') && type !== 'transfer') S().recurring.push({ id: MM.uid(), type, amount: item.amount, accountId: a.id, category: item.category, desc: item.desc, day: Number(item.date.slice(8)), start: item.date, last: MM.ymOf(item.date), active: true });
    lastAccount = a.id; closeSheet(); MM.save(); toast(i >= 0 ? 'Changes saved' : 'Transaction saved');
  }
  async function deleteTx(id) {
    const arr = S().transactions, i = arr.findIndex((x) => x.id === id); if (i < 0) return;
    const gone = arr.splice(i, 1)[0]; closeSheet(); MM.save();
    toast('Transaction deleted', { label: 'Undo', fn: () => { S().transactions.push(gone); MM.save(); } });
  }
  /* --- account --- */
  function newAccount() { openAccount(); }
  function openAccount(id) {
    const a = id ? MM.acc(id) : null, n = a ? S().transactions.filter((t) => t.accountId === a.id || t.toAccountId === a.id).length : 0;
    openSheet(a ? 'Edit account' : 'New account', `<form data-form="account" data-id="${a ? a.id : ''}" autocomplete="off">
      <div class="field"><label for="aname">Name</label><input id="aname" name="name" maxlength="30" required value="${a ? esc(a.name) : ''}" placeholder="e.g. NBB current account"></div>
      <div class="two"><div class="field"><label for="atype">Type</label><select id="atype" name="type">${ACCT_TYPES.map(([k, l]) => `<option value="${k}" ${a && a.type === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="acur">Currency</label><select id="acur" name="currency" ${n ? 'disabled' : ''}>${curOptions(a ? a.currency : base(), true)}</select></div></div>
      ${n ? '<p class="small muted" style="margin-top:-6px">Currency is locked because this account has transactions.</p>' : ''}
      <div class="field"><label for="aopen">Balance when you start tracking</label><input id="aopen" name="opening" inputmode="decimal" class="num" value="${a ? a.opening || 0 : ''}" placeholder="0"><span class="hint">Use a negative number for money owed, such as a credit card balance.</span></div>
      <button class="btn block" type="submit">${a ? 'Save changes' : 'Add account'}</button>${a ? `<button type="button" class="btn danger block" style="margin-top:10px" data-act="delAccount" data-id="${a.id}">${ic('trash', 'sm')}Delete account</button>` : ''}</form>`);
  }
  function saveAccount(f) {
    const v = new FormData(f), id = f.dataset.id, name = String(v.get('name') || '').trim(), op = v.get('opening') === '' ? 0 : parseNum(v.get('opening'));
    if (!name) return toast('Enter a name'); if (Number.isNaN(op)) return toast('Enter a valid starting balance');
    if (id) { const a = MM.acc(id); a.name = name; a.type = v.get('type'); a.opening = op; if (v.get('currency')) a.currency = v.get('currency'); }
    else { const a = { id: MM.uid(), name, type: v.get('type'), currency: v.get('currency'), opening: op }; S().accounts.push(a); lastAccount = a.id; }
    closeSheet(); MM.save(); toast(id ? 'Account updated' : 'Account added');
  }
  async function deleteAccount(id) {
    const a = MM.acc(id), n = S().transactions.filter((t) => t.accountId === id || t.toAccountId === id).length;
    if (!(await ask({ title: `Delete ${a.name}?`, body: n ? `This also deletes its ${n} transaction${n > 1 ? 's' : ''} and recurring items. This cannot be undone.` : 'This cannot be undone.', ok: 'Delete', danger: true }))) return;
    const s = S(); s.accounts = s.accounts.filter((x) => x.id !== id); s.transactions = s.transactions.filter((t) => t.accountId !== id && t.toAccountId !== id); s.recurring = s.recurring.filter((r) => r.accountId !== id);
    closeSheet(); MM.save(); toast('Account deleted');
  }
  /* --- budget --- */
  function openBudget(id) {
    const b = id ? S().budgets.find((x) => x.id === id) : null, used = new Set(S().budgets.map((x) => x.category));
    const cats = MM.catList('expense').filter((c) => !used.has(c.id) || (b && b.category === c.id));
    if (!cats.length) return toast('Every category already has a budget');
    openSheet(b ? 'Edit budget' : 'New budget', `<form data-form="budget" data-id="${b ? b.id : ''}" autocomplete="off">
      <div class="field"><span class="lbl">Category</span>${catGrid2(cats, b ? b.category : cats[0].id)}</div>
      <div class="two"><div class="field"><label for="blim">Monthly limit</label><input id="blim" name="limit" inputmode="decimal" class="num" required value="${b ? b.limit : ''}" placeholder="0"></div>
      <div class="field"><label for="bcur">Currency</label><select id="bcur" name="currency">${usedCurrencies().map((c) => `<option ${b ? (b.currency === c ? 'selected' : '') : c === base() ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
      <button class="btn block" type="submit">${b ? 'Save changes' : 'Add budget'}</button>${b ? `<button type="button" class="btn danger block" style="margin-top:10px" data-act="delBudget" data-id="${b.id}">${ic('trash', 'sm')}Delete budget</button>` : ''}</form>`);
  }
  function catGrid2(list, sel) { return `<div class="cats" role="group" aria-label="Category">${list.map((c) => `<button type="button" class="cat" data-act="pickCat" data-id="${c.id}" aria-pressed="${c.id === sel}">${ic(c.icon)}<span>${esc(c.label)}</span></button>`).join('')}<input type="hidden" name="category" value="${esc(sel)}"></div>`; }
  function saveBudget(f) {
    const v = new FormData(f), limit = parseNum(v.get('limit')); if (!(limit > 0)) return toast('Enter a limit greater than zero');
    const item = { id: f.dataset.id || MM.uid(), category: v.get('category'), limit, currency: v.get('currency') };
    const arr = S().budgets, i = arr.findIndex((x) => x.id === item.id); if (i >= 0) arr[i] = item; else arr.push(item);
    closeSheet(); MM.save(); toast('Budget saved');
  }
  /* --- goal --- */
  function openGoal(id) {
    const g = id ? S().goals.find((x) => x.id === id) : null;
    openSheet(g ? 'Edit goal' : 'New goal', `<form data-form="goal" data-id="${g ? g.id : ''}" autocomplete="off">
      <div class="field"><label for="gname">Goal</label><input id="gname" name="name" maxlength="40" required value="${g ? esc(g.name) : ''}" placeholder="e.g. Family trip, Emergency fund"></div>
      <div class="two"><div class="field"><label for="gt">Target</label><input id="gt" name="target" inputmode="decimal" class="num" required value="${g ? g.target : ''}"></div><div class="field"><label for="gc">Currency</label><select id="gc" name="currency">${usedCurrencies().map((c) => `<option ${g ? (g.currency === c ? 'selected' : '') : c === base() ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
      <div class="field"><label for="gs">Saved so far</label><input id="gs" name="saved" inputmode="decimal" class="num" value="${g ? g.saved : '0'}"></div>
      <div class="field"><label for="gd">Target date (optional)</label><input id="gd" name="deadline" type="date" value="${g && g.deadline ? g.deadline : ''}"></div>
      <button class="btn block" type="submit">${g ? 'Save changes' : 'Add goal'}</button>${g ? `<button type="button" class="btn danger block" style="margin-top:10px" data-act="delGoal" data-id="${g.id}">${ic('trash', 'sm')}Delete goal</button>` : ''}</form>`);
  }
  function saveGoal(f) {
    const v = new FormData(f), target = parseNum(v.get('target')), saved = v.get('saved') === '' ? 0 : parseNum(v.get('saved'));
    if (!String(v.get('name')).trim()) return toast('Name your goal'); if (!(target > 0)) return toast('Enter a target greater than zero'); if (!(saved >= 0)) return toast('Saved amount cannot be negative');
    const item = { id: f.dataset.id || MM.uid(), name: String(v.get('name')).trim(), target, saved, currency: v.get('currency'), deadline: v.get('deadline') || null };
    const arr = S().goals, i = arr.findIndex((x) => x.id === item.id); if (i >= 0) arr[i] = item; else arr.push(item);
    closeSheet(); MM.save(); toast('Goal saved');
  }
  function openFund(id) {
    const g = S().goals.find((x) => x.id === id);
    openSheet(g.name, `<form data-form="fund" data-id="${g.id}" autocomplete="off"><p class="muted" style="margin:4px 0 0">${money(g.saved, g.currency)} saved of ${money(g.target, g.currency)}</p>
      <div class="seg" style="margin:14px 0 4px"><button type="button" data-act="fundMode" data-id="add" aria-pressed="true">Add</button><button type="button" data-act="fundMode" data-id="take" aria-pressed="false">Withdraw</button></div><input type="hidden" name="mode" value="add">
      <div class="field"><label for="fa">Amount</label><div class="amount-wrap"><input class="amount-input num" id="fa" name="amount" inputmode="decimal" required placeholder="0"><span>${g.currency}</span></div></div><button class="btn block" type="submit">Save</button></form>`);
  }
  function saveFund(f) {
    const v = new FormData(f), g = S().goals.find((x) => x.id === f.dataset.id), amt = parseNum(v.get('amount')); if (!(amt > 0)) return toast('Enter an amount greater than zero');
    g.saved = Math.max(0, round(g.saved + (v.get('mode') === 'take' ? -amt : amt), g.currency)); closeSheet(); MM.save(); toast(g.saved >= g.target ? 'Goal reached' : 'Goal updated');
  }
  /* --- recurring --- */
  function openRec(id) {
    const s = S(); if (!s.accounts.length) { toast('Add an account first'); return newAccount(); }
    const r = id ? s.recurring.find((x) => x.id === id) : null, type = r ? r.type : 'expense';
    openSheet(r ? 'Edit recurring item' : 'New recurring item', `<form data-form="rec" data-id="${r ? r.id : ''}" autocomplete="off"><div class="seg" style="margin:6px 0 4px">${[['expense', 'Expense'], ['income', 'Income']].map(([k, l]) => `<button type="button" data-act="recType" data-id="${k}" aria-pressed="${type === k}">${l}</button>`).join('')}</div><input type="hidden" name="type" value="${type}">
      <div class="field"><label for="ra">Amount</label><input id="ra" name="amount" class="amount-input num" inputmode="decimal" required value="${r ? r.amount : ''}" placeholder="0"></div>
      <div class="field"><label for="rac">Account</label><select id="rac" name="accountId">${accOptions(r ? r.accountId : (MM.acc(lastAccount) ? lastAccount : s.accounts[0].id))}</select></div>
      <div class="field"><span class="lbl">Category</span><div id="recCats">${catGrid(type, r ? r.category : type === 'income' ? 'Salary' : 'Bills')}</div></div>
      <div class="field"><label for="rd">Description (optional)</label><input id="rd" name="desc" maxlength="60" value="${r ? esc(r.desc) : ''}" placeholder="e.g. Rent, Netflix"></div>
      <div class="two"><div class="field"><label for="rday">Day of month</label><input id="rday" name="day" type="number" min="1" max="31" inputmode="numeric" required value="${r ? r.day : new Date().getDate()}"></div><div class="field"><label for="rs">Starts</label><input id="rs" name="start" type="date" required value="${r ? r.start : MM.today()}"></div></div>
      ${r ? `<label class="check"><input type="checkbox" name="active" ${r.active ? 'checked' : ''}><span class="t1">Active</span></label>` : ''}
      <button class="btn block" type="submit">${r ? 'Save changes' : 'Add recurring item'}</button>${r ? `<button type="button" class="btn danger block" style="margin-top:10px" data-act="delRec" data-id="${r.id}">${ic('trash', 'sm')}Delete</button>` : ''}</form>`);
  }
  function saveRec(f) {
    const v = new FormData(f), amount = parseNum(v.get('amount')), day = parseInt(v.get('day'), 10); if (!(amount > 0)) return toast('Enter an amount greater than zero'); if (!(day >= 1 && day <= 31)) return toast('Day must be between 1 and 31');
    const old = f.dataset.id ? S().recurring.find((x) => x.id === f.dataset.id) : null;
    const item = { id: old ? old.id : MM.uid(), type: v.get('type'), amount, accountId: v.get('accountId'), category: v.get('category'), desc: String(v.get('desc') || '').trim(), day, start: v.get('start'), last: old ? old.last : null, active: old ? !!v.get('active') : true };
    if (old && old.start !== item.start) item.last = null;
    const arr = S().recurring, i = arr.findIndex((x) => x.id === item.id); if (i >= 0) arr[i] = item; else arr.push(item);
    closeSheet(); MM.runRecurring(); MM.save(); toast('Recurring item saved');
  }

  /* =================== LOCK + PIN PAD =================== */
  function pinPad(o) {
    const el = document.createElement('div'); el.className = 'full'; el.style.zIndex = o.z || 60; let pin = '';
    el.innerHTML = `<div class="in center"><div class="brand" style="justify-content:center;margin-top:8vh"><div class="mark">${ic('lock', 'lg')}</div></div><h1 class="display" style="font-size:24px">${esc(o.title)}</h1><div class="muted" id="padSub">${esc(o.sub || '')}</div><div class="dots" aria-live="polite">${'<i></i>'.repeat(4)}</div>
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-k="${n}" aria-label="${n}">${n}</button>`).join('')}<button data-k="x" aria-label="${o.cancel ? 'Cancel' : ''}" ${o.cancel ? '' : 'style="visibility:hidden"'}>${o.cancel ? 'Cancel' : ''}</button><button data-k="0" aria-label="0">0</button><button data-k="d" aria-label="Delete digit">${ic('back')}</button></div></div>`;
    const dots = () => el.querySelectorAll('.dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
    const api = { close: () => el.remove(), fail: (m) => { pin = ''; dots(); $('#padSub', el).textContent = m; const dd = $('.dots', el); dd.classList.remove('shake'); void dd.offsetWidth; dd.classList.add('shake'); }, say: (m) => { pin = ''; dots(); $('#padSub', el).textContent = m; } };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k;
      if (k === 'x') { api.close(); if (o.onCancel) o.onCancel(); return; }
      if (k === 'd') pin = pin.slice(0, -1); else if (pin.length < 4) pin += k;
      dots(); if (pin.length === 4) { const p = pin; setTimeout(() => o.onDone(p, api), 120); }
    });
    el.__api = api; $('#layer').appendChild(el); return api;
  }
  function showLock() {
    if (!S().settings.lock || $('#layer .full[data-lock]')) return; locked = true;
    const api = pinPad({ title: 'Enter your PIN', sub: 'MoneyMate is locked', z: 70, onDone: (p, a) => { if (MM.checkPin(p)) { locked = false; a.close(); } else a.fail('Incorrect PIN. Try again.'); } });
    document.querySelector('#layer .full:last-child').dataset.lock = '1';
  }
  function setupPin() {
    let first = null;
    pinPad({ title: 'Choose a PIN', sub: 'Enter 4 digits', cancel: true, onDone: (p, a) => {
      if (!first) { first = p; a.say('Enter it again to confirm'); return; }
      if (p === first) { MM.setPin(p); a.close(); toast('PIN lock is on'); } else { first = null; a.fail('PINs did not match. Start again.'); }
    } });
  }
  function disablePin() {
    pinPad({ title: 'Enter your PIN', sub: 'Confirm to turn the lock off', cancel: true, onDone: (p, a) => { if (MM.checkPin(p)) { S().settings.lock = null; a.close(); MM.save(); toast('PIN lock is off'); } else a.fail('Incorrect PIN'); } });
  }

  /* =================== ONBOARDING =================== */
  let onb = { step: 1, name: '', base: 'BHD', acctName: 'Main account', type: 'bank', opening: '' };
  function showOnboarding() {
    $('.nav').style.display = 'none'; $('.fab').style.display = 'none';
    let el = $('#layer .full[data-onb]'); if (!el) { el = document.createElement('div'); el.className = 'full'; el.dataset.onb = '1'; $('#layer').appendChild(el); }
    const steps = `<div class="steps"><i class="on"></i><i class="${onb.step > 1 ? 'on' : ''}"></i></div>`;
    el.innerHTML = `<div class="in"><div class="brand"><div class="mark">${ic('wallet', 'lg')}</div><b style="font-size:20px">MoneyMate</b></div>${steps}` + (onb.step === 1 ? `
      <h1 class="display">Know where your money is, in every currency.</h1><p class="muted">Track spending, budgets and goals across your accounts. Everything stays on this phone.</p>
      <form data-form="onb1" autocomplete="off"><div class="field"><label for="on">What should we call you? (optional)</label><input id="on" name="name" maxlength="30" value="${esc(onb.name)}"></div>
      <div class="field"><label for="ob">Main currency</label><select id="ob" name="base">${curOptions(onb.base)}</select><span class="hint">Totals and charts use this. You can add accounts in other currencies.</span></div><button class="btn block" type="submit">Continue</button></form>` : `
      <h1 class="display">Add your first account.</h1><p class="muted">Pick where your money sits today. You can add more later.</p>
      <form data-form="onb2" autocomplete="off"><div class="field"><label for="an">Account name</label><input id="an" name="name" maxlength="30" required value="${esc(onb.acctName)}"></div>
      <div class="two"><div class="field"><label for="at">Type</label><select id="at" name="type">${ACCT_TYPES.map(([k, l]) => `<option value="${k}" ${onb.type === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div class="field"><label for="ac">Currency</label><select id="ac" name="currency">${curOptions(onb.base, true)}</select></div></div>
      <div class="field"><label for="ao">Current balance</label><input id="ao" name="opening" inputmode="decimal" class="num" value="${esc(onb.opening)}" placeholder="0"></div>
      <button class="btn block" type="submit">Start tracking</button><button type="button" class="btn ghost block" style="margin-top:10px" data-act="onbBack">Back</button></form>`) + `</div>`;
  }
  function finishOnb(f) {
    const v = new FormData(f), op = v.get('opening') === '' ? 0 : parseNum(v.get('opening')); if (Number.isNaN(op)) return toast('Enter a valid balance');
    const s = S(); s.settings.name = onb.name; s.settings.base = onb.base; s.settings.onboarded = true;
    const a = { id: MM.uid(), name: String(v.get('name')).trim() || 'Main account', type: v.get('type'), currency: v.get('currency'), opening: op }; s.accounts.push(a); lastAccount = a.id;
    const el = $('#layer .full[data-onb]'); if (el) el.remove(); $('.nav').style.display = ''; $('.fab').style.display = ''; MM.save();
  }

  /* =================== EVENTS =================== */
  const A = {
    nav: (el) => go(el.dataset.id), goPlan: (el) => { ui.planTab = el.dataset.id; go('plan'); },
    addTx: (el) => openTx({ type: el.dataset.id }), addTxExpense: () => openTx({ type: 'expense' }), editTx: (el) => openTx({ id: el.dataset.id }),
    closeSheet, txType: (el) => { syncDraft(); const t = el.dataset.id; txDraft.type = t; txDraft.category = t === 'income' ? 'Salary' : 'Food'; txDraft.toAuto = true; renderTxSheet(); },
    pickCat: (el) => { const g = el.closest('.cats'); g.querySelectorAll('.cat').forEach((b) => b.setAttribute('aria-pressed', b === el)); g.querySelector('input[name=category]').value = el.dataset.id; },
    delTx: (el) => deleteTx(el.dataset.id),
    newAccount, editAccount: (el) => openAccount(el.dataset.id), delAccount: (el) => deleteAccount(el.dataset.id),
    newBudget: () => openBudget(), editBudget: (el) => openBudget(el.dataset.id),
    delBudget: (el) => { const id = el.dataset.id; S().budgets = S().budgets.filter((b) => b.id !== id); closeSheet(); MM.save(); toast('Budget deleted'); },
    newGoal: () => openGoal(), editGoal: (el) => openGoal(el.dataset.id), fundGoal: (el) => openFund(el.dataset.id),
    delGoal: async (el) => { if (await ask({ title: 'Delete this goal?', body: 'Your saved progress for it will be removed.', ok: 'Delete', danger: true })) { const id = el.dataset.id; S().goals = S().goals.filter((g) => g.id !== id); closeSheet(); MM.save(); } },
    fundMode: (el) => { const f = el.closest('form'); f.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-pressed', b === el)); f.elements.mode.value = el.dataset.id; },
    newRec: () => openRec(), editRec: (el) => openRec(el.dataset.id),
    delRec: async (el) => { if (await ask({ title: 'Delete this recurring item?', body: 'Transactions already recorded are kept.', ok: 'Delete', danger: true })) { const id = el.dataset.id; S().recurring = S().recurring.filter((r) => r.id !== id); closeSheet(); MM.save(); } },
    recType: (el) => { const f = el.closest('form'); f.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-pressed', b === el)); f.elements.type.value = el.dataset.id; $('#recCats').innerHTML = catGrid(el.dataset.id, el.dataset.id === 'income' ? 'Salary' : 'Bills'); },
    planTab: (el) => { ui.planTab = el.dataset.id; render(); },
    filterType: (el) => { ui.actType = el.dataset.id; ui.actLimit = 60; render(); }, moreTx: () => { ui.actLimit += 60; $('#actList').innerHTML = actList(); },
    month: (el) => { const k = el.dataset.scope === 'bud' ? 'budMonth' : 'insMonth'; ui[k] = MM.addMonths(ui[k], Number(el.dataset.dir)); render(); },
    pickMonth: (el) => { ui.insMonth = el.dataset.id; render(); },
    theme: (el) => { S().settings.theme = el.dataset.id; applyTheme(); MM.save(); },
    toggleHide: () => { S().settings.hide = !S().settings.hide; MM.save(); },
    toggleSecure: () => { S().settings.secure = !S().settings.secure; applySecure(); MM.save(); },
    toggleLock: () => { if (S().settings.lock) disablePin(); else setupPin(); },
    exportCsv: () => { if (!S().transactions.length) return toast('No transactions to export'); MM.exportCSV(); },
    backupNow: () => { MM.backup(); },
    eraseAll: async () => { if (await ask({ title: 'Erase all data?', body: 'This permanently deletes every account, transaction, budget and goal on this phone. Back up first if you may need it.', ok: 'Erase everything', danger: true })) { const keepLock = null; MM.reset(); onb = { step: 1, name: '', base: 'BHD', acctName: 'Main account', type: 'bank', opening: '' }; ui.tab = 'home'; applyTheme(); applySecure(); MM.save(); } },
    onbBack: () => { onb.step = 1; showOnboarding(); },
  };
  const FORMS = { tx: saveTx, account: saveAccount, budget: saveBudget, goal: saveGoal, fund: saveFund, rec: saveRec,
    onb1: (f) => { const v = new FormData(f); onb.name = String(v.get('name') || '').trim(); onb.base = v.get('base'); onb.step = 2; showOnboarding(); },
    onb2: finishOnb };

  document.addEventListener('click', (e) => { const el = e.target.closest('[data-act]'); if (el && A[el.dataset.act]) { e.preventDefault(); A[el.dataset.act](el); } });
  document.addEventListener('submit', (e) => { const f = e.target.closest('form[data-form]'); if (f) { e.preventDefault(); FORMS[f.dataset.form](f); } });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'q') { ui.q = t.value; ui.actLimit = 60; $('#actList').innerHTML = actList(); return; }
    if (t.closest('form[data-form="tx"]')) {
      if (t.id === 'toAmount') { t.dataset.manual = t.value ? '1' : ''; if (!t.value) txDraft.toAuto = true; else txDraft.toAuto = false; updateFxHint(); }
      if (t.id === 'amount') autoReceived();
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'fMonth') { ui.actMonth = t.value; ui.actLimit = 60; $('#actList').innerHTML = actList(); }
    else if (t.id === 'fAcc') { ui.actAcc = t.value; ui.actLimit = 60; $('#actList').innerHTML = actList(); }
    else if (t.id === 'setName') { S().settings.name = t.value.trim(); MM.save(); }
    else if (t.id === 'setBase') { S().settings.base = t.value; MM.save(); }
    else if (t.dataset && t.dataset.rate) { const v = parseNum(t.value); if (v > 0) { S().settings.rates[t.dataset.rate] = v * MM.rateOf(base()); MM.save(); toast('Rate updated'); } else { toast('Enter a rate greater than zero'); render(); } }
    else if (t.id === 'restoreFile') restoreFile(t);
    else if (t.closest('form[data-form="tx"]') && (t.id === 'accountId' || t.id === 'toAccountId')) { syncDraft(); if (t.id === 'accountId' && txDraft.type === 'transfer' && txDraft.toAccountId === txDraft.accountId) { renderTxSheet(); } else if (t.id === 'accountId' && txDraft.type === 'transfer') { renderTxSheet(); } else autoReceived(); }
  });
  async function restoreFile(input) {
    const file = input.files && input.files[0]; if (!file) return;
    try {
      const obj = JSON.parse(await file.text()), norm = MM.normalize(obj); if (!norm) throw new Error('bad');
      const n = norm.transactions.length;
      if (await ask({ title: 'Restore this backup?', body: `It has ${norm.accounts.length} account(s) and ${n} transaction(s). This replaces everything currently on this phone.`, ok: 'Restore', danger: true })) {
        const lock = S().settings.lock; MM.replaceAll(obj); S().settings.lock = lock; S().settings.onboarded = S().settings.onboarded || S().accounts.length > 0; applyTheme(); applySecure(); MM.save(); toast('Backup restored');
      }
    } catch (e) { toast('That file is not a valid MoneyMate backup'); }
    input.value = '';
  }

  /* ---------- theme / native bridge ---------- */
  function applyTheme() {
    const t = S().settings.theme, root = document.documentElement; if (t === 'auto') root.removeAttribute('data-theme'); else root.dataset.theme = t;
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    try { if (window.AndroidBridge && AndroidBridge.setTheme) AndroidBridge.setTheme(dark); } catch (e) {}
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#0a1416' : '#eef2f1';
  }
  function applySecure() { try { if (window.AndroidBridge && AndroidBridge.setSecure) AndroidBridge.setSecure(!!S().settings.secure); } catch (e) {} }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  window.__mmBack = function () {
    const dlg = $('#layer > .dialog'); if (dlg) { dlg.click(); return true; }
    const pad = $('#layer > .full:not([data-lock]):not([data-onb])'); if (pad) { const c = pad.querySelector('[data-k=x]'); if (c) c.click(); return true; }
    if ($('#layer .full[data-lock]') || $('#layer .full[data-onb]')) return true;
    if ($('#layer > [data-sheet]')) { closeSheet(); return true; }
    if (ui.tab !== 'home') { go('home'); return true; }
    return false;
  };

  /* ---------- boot ---------- */
  MM.load(); applyTheme(); applySecure();
  MM.onChange(() => { render(); });
  MM.runRecurring();
  render(); if (S().settings.lock) showLock();
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (S().settings.lock) showLock(); } else { MM.runRecurring(); } });
  if (MM.lastError) toast('Storage is full or unavailable. Back up your data.');
})();
