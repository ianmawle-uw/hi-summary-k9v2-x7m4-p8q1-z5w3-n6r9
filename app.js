/*
 * Check your answers prototype (home insurance).
 * Version B: Edit goes to the section page and a sticky "Return to summary" bar returns to the summary.
 * Version C: Edit expands the card in place on the summary page, with Save and Cancel.
 * Pick a version with ?v=b or ?v=c. Progress is saved in this browser, so people can leave and come back.
 */
(function () {
  'use strict';

  var C = window.PROTO_CONFIG, U = window.PROTO_U, CARDS = window.PROTO_CARDS, STEPS = window.PROTO_STEPS, FUT = window.PROTO_FUTURE;
  var appEl = document.getElementById('app'), overlayEl = document.getElementById('overlay'), toastEl = document.getElementById('toast-root');
  var params = new URLSearchParams(location.search);
  var version = (params.get('v') || '').toLowerCase();
  if (version !== 'b' && version !== 'c') version = '';
  var KEY = 'uwproto:v2:' + version;

  /* ---------- icons (Hearth svg-icons) ---------- */
  var ICONS = {
    add: { s: 24, d: 'M13.131 22.182H10.87v-9.05H1.818v-2.263h9.05V1.818h2.263v9.05h9.051v2.263h-9.05z' },
    down: { s: 24, d: 'm2 7.887 1.775-1.775L12 14.338l8.225-8.226L22 7.887l-10 10z' },
    right: { s: 20, d: 'M6.507 18 5 16.58 11.985 10 5 3.42 6.507 2 15 10z' },
    close: { s: 24, d: 'M5.6 20 4 18.4l6.4-6.4L4 5.6 5.6 4l6.4 6.4L18.4 4 20 5.6 13.6 12l6.4 6.4-1.6 1.6-6.4-6.4z' },
    info: { s: 24, d: 'M10.625 17.375h2.75V11h-2.75zM12 9.5q.637 0 1.069-.431.43-.431.431-1.07 0-.636-.431-1.068A1.45 1.45 0 0 0 12 6.5q-.637 0-1.069.431A1.45 1.45 0 0 0 10.5 8q0 .637.431 1.069.432.43 1.069.43m0 13.35q-2.275 0-4.25-.852a10.9 10.9 0 0 1-3.435-2.313 10.9 10.9 0 0 1-2.313-3.435Q1.15 14.275 1.15 12t.852-4.25a10.9 10.9 0 0 1 2.313-3.435A10.9 10.9 0 0 1 7.75 2.002Q9.725 1.15 12 1.15t4.25.852a10.9 10.9 0 0 1 3.435 2.313 10.9 10.9 0 0 1 2.313 3.435q.852 1.975.852 4.25t-.852 4.25a10.9 10.9 0 0 1-2.313 3.435 10.9 10.9 0 0 1-3.435 2.313q-1.975.852-4.25.852' },
    lock: { s: 24, d: 'M4 22.5v-14h3v-2q0-2.075 1.463-3.537Q9.926 1.5 12 1.5q2.075 0 3.537 1.463Q17 4.425 17 6.5v2h3v14zm8-5q.825 0 1.412-.587Q14 16.325 14 15.5t-.588-1.412A1.93 1.93 0 0 0 12 13.5q-.825 0-1.412.588A1.93 1.93 0 0 0 10 15.5q0 .824.588 1.413.587.587 1.412.587m-3-9h6v-2q0-1.25-.875-2.125A2.9 2.9 0 0 0 12 3.5q-1.25 0-2.125.875A2.9 2.9 0 0 0 9 6.5z' },
    search: { s: 24, d: 'm19.6 21-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.887T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5a6.1 6.1 0 0 1-1.3 3.8l6.3 6.3zM9.5 14q1.875 0 3.188-1.312Q14 11.375 14 9.5t-1.312-3.187T9.5 5 6.313 6.313 5 9.5t1.313 3.188T9.5 14' },
    tick: { s: 20, d: 'M7.595 15.5 2 10.286l1.399-1.304 4.196 3.91L16.601 4.5 18 5.804z' },
    user: { s: 24, d: 'M12 12q-1.65 0-2.825-1.175T8 8t1.175-2.825T12 4t2.825 1.175T16 8t-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562.437-.713 1.162-1.088a14.8 14.8 0 0 1 3.15-1.163A13.8 13.8 0 0 1 12 13q1.65 0 3.25.387 1.6.388 3.15 1.163.724.375 1.163 1.087Q20 16.35 20 17.2V20z' }
  };
  function ic(name, size, cls) {
    var i = ICONS[name], s = size || i.s;
    return '<svg class="icon ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 ' + i.s + ' ' + i.s + '" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + i.d + '"/></svg>';
  }
  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDay(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function plusDays(n) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; }

  /* ---------- state ---------- */
  function computeCost(a) {
    var R = C.rebuild, cost = R.baseCost;
    cost += (a.bedrooms - R.base.bedrooms) * R.perBedroom;
    cost += (a.bathrooms - R.base.bathrooms) * R.perBathroom;
    cost += (a.otherRooms - R.base.otherRooms) * R.perOtherRoom;
    cost += (a.propertyType === 'house' ? (R.houseType[a.houseType] || 0) : 0) - (R.houseType[R.base.houseType] || 0);
    var y = Number(a.yearBuilt);
    cost += y < 1900 ? 15000 : y < 1945 ? 8000 : y < 1980 ? 3000 : 0;
    return Math.max(50000, Math.round(cost / 1000) * 1000);
  }
  function fresh() {
    return { answers: C.persona(), rebuildConfirmed: C.rebuild.baseCost, rebuildAdjusted: false, maxStep: 5, reached: false, consent: false, log: [], t0: Date.now() };
  }
  var S = fresh();
  var ui = { editing: null, draft: null, errors: {}, modal: null, consentError: false, addrManual: false, itemDraft: {}, openerFid: null };

  function load() {
    if (!version) return;
    if (params.get('reset') === '1') {
      try { localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
      params.delete('reset');
      var q = params.toString();
      history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
    }
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.answers) { S = parsed; return; }
      }
    } catch (e) { /* ignore and start fresh */ }
    S = fresh();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: carry on in memory */ } }
  function log(e, d) { S.log.push({ t: Date.now() - (S.t0 || Date.now()), at: new Date().toISOString(), e: e, d: d === undefined ? null : d }); if (S.log.length > 3000) S.log.shift(); }

  function model() { return (version === 'c' && ui.draft) ? ui.draft : S.answers; }
  function cardById(id) { return CARDS.filter(function (c) { return c.id === id; })[0]; }
  function stepById(id) { return STEPS.filter(function (s) { return s.id === id; })[0]; }
  function findField(k) {
    for (var i = 0; i < CARDS.length; i++) for (var j = 0; j < CARDS[i].fields.length; j++) if (CARDS[i].fields[j].k === k) return CARDS[i].fields[j];
    return null;
  }
  function onCommit(keys) {
    if (keys.indexOf('rebuildCost') > -1) {
      S.rebuildAdjusted = false; S.rebuildConfirmed = S.answers.rebuildCost;
    } else if (keys.some(function (k) { return C.rebuild.triggerKeys.indexOf(k) > -1; })) {
      var nc = computeCost(S.answers);
      S.answers.rebuildCost = nc;
      S.rebuildAdjusted = nc !== S.rebuildConfirmed;
      if (S.rebuildAdjusted) log('bcis_alert_on', { cost: nc });
    }
  }
  function setVal(k, v) {
    var m = model();
    if (same(m[k], v)) return;
    m[k] = v;
    delete ui.errors[k];
    if (m === S.answers) { log('answer', { k: k, v: typeof v === 'object' ? '[list]' : v }); onCommit([k]); save(); }
  }
  function commitDraft() {
    var keys = [];
    Object.keys(ui.draft).forEach(function (k) { if (!same(ui.draft[k], S.answers[k])) { S.answers[k] = ui.draft[k]; keys.push(k); } });
    if (keys.length) { log('answers_saved', keys); onCommit(keys); }
    save();
  }
  function confirmRebuild() { S.rebuildAdjusted = false; S.rebuildConfirmed = S.answers.rebuildCost; save(); }

  /* ---------- validation ---------- */
  function validate(c, a) {
    var e = {}, today = isoDay(plusDays(0)), max = isoDay(plusDays(30));
    c.fields.forEach(function (f) {
      if (!f.k) return;
      if (f.show && !f.show(a)) return;
      var v = a[f.k];
      switch (f.t) {
        case 'claims':
          if (v === undefined || v === '') e[f.k] = 'Select an option';
          else if (v === 'yes' && !(a.claims && a.claims.length)) e[f.k] = 'Add a claim, or select No';
          break;
        case 'radio': case 'yesno': if (v === undefined || v === '') e[f.k] = 'Select an option'; break;
        case 'select': if (f.req && (v === '' || v === undefined || v === null)) e[f.k] = 'Select an answer'; break;
        case 'text':
          if (!String(v || '').trim()) e[f.k] = 'Enter an answer';
          else if (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(v)) e[f.k] = 'Enter an email address in the correct format, like name@example.com';
          break;
        case 'currency':
          if (f.optOut && a[f.optOut]) break;
          if (v === '' || v === undefined || isNaN(v)) e[f.k] = 'Enter an amount';
          break;
        case 'rebuild':
          if (v === '' || v === undefined || isNaN(v) || v < 1) e[f.k] = 'Enter an amount';
          break;
        case 'date': if (!v) e[f.k] = 'Enter a date'; break;
        case 'startdate':
          if (!v) e[f.k] = 'Select a start date';
          else if (v < today) e[f.k] = 'Choose a date that is today or later';
          else if (v > max) e[f.k] = 'Choose a date within the next 30 days';
          break;
        case 'provider': if (!a[f.optOut] && !v) e[f.k] = 'Select your current provider'; break;
        case 'address': if (!a.address) e[f.k] = 'Select or enter an address'; break;
        default: break;
      }
    });
    return e;
  }

  /* ---------- routing ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, ''), p = h.split('/');
    if (p[0] === 'step' && cardById(p[1])) return { name: 'step', card: p[1] };
    if (p[0] === 'summary' || p[0] === 'quote' || p[0] === 'facilitator') return { name: p[0] };
    return { name: 'summary' };
  }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

  /* ---------- small components ---------- */
  function alertHtml(title, paras, attr) {
    return '<div class="alert" role="status" ' + (attr || '') + '>' + ic('info', 24) + '<div class="alert__body">' +
      (title ? '<div class="alert__title">' + esc(title) + '</div>' : '') +
      paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div></div>';
  }
  function bcisAlert() {
    return alertHtml('Estimated rebuild cost adjustment', [
      'Some of the criteria we use to estimate the rebuild cost of your house has been changed since we originally confirmed the value.',
      'We have updated your rebuild cost using the Building Cost Information Service (BCIS). You can edit this if you think it’s wrong.'
    ], 'data-bcis="1"');
  }
  function stepperHtml(current, linkable) {
    var items = STEPS.map(function (s) { return { no: s.no, label: s.label, first: CARDS.filter(function (c) { return c.step === s.id; })[0].id }; })
      .concat(FUT.map(function (l, i) { return { no: 6 + i, label: l }; }));
    return '<ol class="stepper" aria-label="Progress">' + items.map(function (it) {
      var done = it.no !== current && (it.no <= 5 ? it.no <= S.maxStep : it.no < current);
      var cls = it.no === current ? 'step--active' : done ? 'step--done' : '';
      var dot = done ? ic('tick', 20) : String(it.no);
      var label = (done && linkable && it.first)
        ? '<button type="button" class="step__label" data-act="goStep" data-card="' + it.first + '">' + esc(it.label) + '</button>'
        : '<span class="step__label"' + (done ? ' style="font-weight:500"' : '') + '>' + esc(it.label) + '</span>';
      return '<li class="step ' + cls + '"' + (it.no === current ? ' aria-current="step"' : '') + '><span class="step__dot">' + dot + '</span>' + label + '</li>';
    }).join('') + '</ol>';
  }
  function headerHtml(current, sub, intro, linkable) {
    return '<h1 class="page-title">Home Insurance</h1>' + stepperHtml(current, linkable) + '<h2 class="page-sub">' + esc(sub) + '</h2><p class="page-intro">' + esc(intro) + '</p>';
  }
  function navHtml() {
    return '<header class="nav"><div class="container nav__in">' +
      '<a class="nav__logo" href="#/summary" data-act="toast" aria-label="Utility Warehouse"><img src="img/wordmark-warm-white.svg" alt="Utility Warehouse"></a>' +
      '<nav class="nav__links" aria-label="Main">' +
      ['Home', 'Bills & Payments', 'Services', 'Support', 'Save £50'].map(function (l, i) {
        return '<button type="button" class="nav__link' + (i === 1 ? ' nav__link--active' : '') + '" data-act="toast">' + esc(l) + (l === 'Services' ? ' ' + ic('down', 20) : '') + '</button>';
      }).join('') +
      '<button type="button" class="nav__account" data-act="toast">' + ic('user', 24) + '<span>Your account</span></button></nav></div></header>';
  }
  function footerHtml() {
    function list(items) { return '<ul class="footer__list">' + items.map(function (i) { return '<li><button type="button" data-act="toast">' + esc(i) + '</button></li>'; }).join('') + '</ul>'; }
    return '<footer class="footer"><div class="container footer__in">' +
      '<div><span class="footer__logo"><img src="img/wordmark-purple.svg" alt="Utility Warehouse"></span><p class="footer__tag">Delivering essential home services nationwide to help you save money on your household bills.</p></div>' +
      '<div><p class="footer__h">Quicklinks</p>' + list(['Warm home discount', 'Smart meter preference', 'Cookie settings', 'Roaming charges', 'Webmail']) + '</div>' +
      '<div><p class="footer__h">Legal</p>' + list(['Terms & Conditions', 'Cookies', 'Privacy policy']) + '</div>' +
      '<div><p class="footer__h">Download our app</p><span class="badge">App Store</span><br><span class="badge">Google Play</span></div></div>' +
      '<div class="container footer__legal">© Utility Warehouse Limited 2025. Registered in England. Company number: 04594421. Utility Warehouse Limited is authorised and regulated by the Financial Conduct Authority</div></footer>';
  }
  function stickyHtml() {
    return '<div class="sticky" role="region" aria-label="Return to your answers"><div class="container"><button type="button" class="btn btn--cta" data-act="barReturn" data-fid="bar">Return to summary ' + ic('right', 20) + '</button></div></div>';
  }

  /* ---------- fields ---------- */
  function wrap(f, body, ctx, group, preHtml) {
    var id = 'f-' + f.k, err = ctx.errors[f.k];
    var label = group ? '<div class="field__label" id="' + id + '-l">' + esc(f.q) + '</div>' : '<label class="field__label" for="' + id + '">' + esc(f.q) + '</label>';
    var help = f.help ? [].concat(f.help).map(function (h) { return '<div class="field__help">' + esc(h) + '</div>'; }).join('') : '';
    return (preHtml || '') + '<div class="field" data-field="' + f.k + '">' + label + help + '<div class="field__body">' + body + '</div>' +
      (err ? '<p class="field__error" id="' + id + '-e" role="alert">' + ic('info', 20) + '<span>' + esc(err) + '</span></p>' : '') + '</div>';
  }
  function tilesHtml(f, a, ctx, row, act, extra) {
    var val = a[f.k], opts = f.t === 'yesno' ? [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }] : f.opts;
    return '<div class="tiles' + (row ? ' tiles--row' : '') + '" role="radiogroup" aria-labelledby="f-' + f.k + '-l"' + (ctx.errors[f.k] ? ' aria-invalid="true"' : '') + '>' +
      opts.map(function (o) {
        var on = String(val) === String(o.v), img = f.image && o.img;
        return '<button type="button" role="radio" aria-checked="' + on + '" class="tile' + (img ? ' tile--image' : '') + '" data-act="' + (act || 'set') + '" data-k="' + f.k + '" data-v="' + esc(o.v) + '" data-fid="' + f.k + ':' + esc(o.v) + '"' + (extra || '') + '>' +
          '<span class="radio"></span>' + (img ? '<span class="tile__img"><img src="img/' + o.img + '" alt=""></span>' : '') +
          '<span class="tile__text"><span>' + esc(o.l) + '</span>' + (o.help ? '<span class="tile__help">' + esc(o.help) + '</span>' : '') + '</span></button>';
      }).join('') + '</div>';
  }
  function fmtMoneyInput(v, pence) {
    if (v === '' || v === undefined || v === null || isNaN(v)) return '';
    return Number(v).toLocaleString('en-GB', { minimumFractionDigits: pence ? 2 : 0, maximumFractionDigits: 2 });
  }
  function mockAddresses(pc) {
    var p = (pc || '').toUpperCase().trim() || 'BH1 1HB';
    return [5, 6, 7, 8, 9].map(function (n) { return n + ' High Street, Poole, Dorset ' + p; });
  }
  function fieldHtml(f, a, ctx) {
    if (f.show && !f.show(a)) return '';
    var id = 'f-' + f.k, err = ctx.errors[f.k] ? ' aria-invalid="true" aria-describedby="' + id + '-e"' : '';
    switch (f.t) {
      case 'info': return alertHtml(f.title, f.paras);
      case 'help': return '<div class="field" style="margin-top:-12px"><button type="button" class="link link--help" data-act="toast">' + ic('info', 20) + esc(f.label) + '</button></div>';
      case 'radio': return wrap(f, tilesHtml(f, a, ctx, false), ctx, true);
      case 'yesno': return wrap(f, tilesHtml(f, a, ctx, true), ctx, true);
      case 'select':
        return wrap(f, '<div class="select-wrap"><select class="select" id="' + id + '" data-k="' + f.k + '" data-fid="' + f.k + '"' + (f.num ? ' data-num' : '') + err + '>' +
          (f.blank || a[f.k] === '' || a[f.k] === undefined ? '<option value="">Select</option>' : '') +
          f.opts.map(function (o) { return '<option value="' + esc(o.v) + '"' + (String(a[f.k]) === String(o.v) ? ' selected' : '') + '>' + esc(o.l) + '</option>'; }).join('') +
          '</select>' + ic('down', 24) + '</div>', ctx, false);
      case 'text':
        return wrap(f, '<input class="input" id="' + id + '" type="' + (f.type || 'text') + '" data-k="' + f.k + '" data-fid="' + f.k + '" value="' + esc(a[f.k]) + '" autocomplete="off"' + err + '>', ctx, false);
      case 'date':
        return wrap(f, '<input class="input" id="' + id + '" type="date" data-k="' + f.k + '" data-fid="' + f.k + '" value="' + esc(a[f.k]) + '"' + err + '>', ctx, false);
      case 'currency': {
        var off = f.optOut && a[f.optOut];
        var body = '<div class="input-wrap"><span class="prefix">£</span><input class="input input--narrow" id="' + id + '" inputmode="decimal" data-money data-k="' + f.k + '" data-fid="' + f.k + '" value="' + esc(off ? '' : fmtMoneyInput(a[f.k], f.pence)) + '"' + (off ? ' disabled' : '') + err + ' autocomplete="off"></div>';
        if (f.optOut) body += '<label class="check"><input type="checkbox" data-k="' + f.optOut + '" data-fid="' + f.optOut + '"' + (a[f.optOut] ? ' checked' : '') + '><span>' + esc(f.optOutLabel) + '</span></label>';
        return wrap(f, body, ctx, false);
      }
      case 'provider': {
        var none = a[f.optOut];
        var b = '<div class="select-wrap"><select class="select" id="' + id + '" data-k="' + f.k + '" data-fid="' + f.k + '"' + (none ? ' disabled' : '') + err + '>' +
          '<option value="">Select</option>' + f.opts.map(function (o) { return '<option value="' + esc(o.v) + '"' + (a[f.k] === o.v && !none ? ' selected' : '') + '>' + esc(o.l) + '</option>'; }).join('') + '</select>' + ic('down', 24) + '</div>';
        b += '<label class="check"><input type="checkbox" data-k="' + f.optOut + '" data-fid="' + f.optOut + '"' + (none ? ' checked' : '') + '><span>' + esc(f.optOutLabel) + '</span></label>';
        return wrap(f, b, ctx, false);
      }
      case 'startdate': {
        var tiles = tilesHtml({ k: 'startChoice', t: 'radio', opts: U.O.start }, a, { errors: {} }, false, 'setStart');
        var dateInput = a.startChoice === 'other'
          ? '<div style="margin-top:24px"><label class="field__label" for="' + id + '">Please select date</label><div class="field__body"><input class="input" type="date" id="' + id + '" data-k="startDate" data-fid="startDate" min="' + isoDay(plusDays(0)) + '" max="' + isoDay(plusDays(30)) + '" value="' + esc(a.startDate) + '"' + err + '></div></div>'
          : '';
        return wrap({ k: 'startDate', q: f.q, help: f.help }, tiles + dateInput, ctx, true).replace('id="f-startDate-l"', 'id="f-startChoice-l"');
      }
      case 'address': {
        var list = mockAddresses(a.postcode);
        var tl = '<div class="tiles addr-list" role="radiogroup" aria-label="Addresses found">' + list.map(function (ad) {
          var on = a.address === ad;
          return '<button type="button" role="radio" aria-checked="' + on + '" class="tile" data-act="pickAddr" data-v="' + esc(ad) + '" data-fid="addr:' + esc(ad) + '"><span class="radio"></span><span class="tile__text"><span>' + esc(ad) + '</span></span></button>';
        }).join('') + '</div>';
        var body = '<div class="input-wrap input-wrap--icon">' + ic('search', 24) + '<input class="input" id="' + id + '" data-k="postcode" data-fid="postcode" placeholder="Tell us your postcode" value="' + esc(a.postcode) + '" autocomplete="off"' + err + '></div>' + tl +
          '<p style="margin-top:12px"><button type="button" class="link" data-act="addrManual" data-fid="addrManual">Enter address manually</button></p>' +
          (ui.addrManual ? '<div style="margin-top:12px"><label class="field__label" for="f-address-manual">Your address</label><div class="field__body"><input class="input" id="f-address-manual" data-k="address" data-fid="address" value="' + esc(a.address) + '" placeholder="House number and street, town, postcode"></div></div>' : '');
        return wrap({ k: 'address', q: f.q }, body, ctx, false);
      }
      case 'items': {
        var items = a[f.k] || [], dr = ui.itemDraft[f.k] || { name: '', value: '' };
        var li = items.map(function (it, i) {
          return '<li><span>' + esc(it.name) + ', ' + esc(U.money(it.value)) + '</span><button type="button" class="link link--danger" data-act="itemRemove" data-k="' + f.k + '" data-i="' + i + '" data-fid="rm:' + f.k + ':' + i + '">Remove<span class="sr-only"> ' + esc(it.name) + '</span></button></li>';
        }).join('');
        var body2 = (items.length ? '<ul class="items">' + li + '</ul>' : '') +
          '<div class="items__add"><div><label class="field__help" for="it-n-' + f.k + '">' + esc(f.nameLabel) + '</label><input class="input" id="it-n-' + f.k + '" data-it="name" data-ik="' + f.k + '" data-fid="itn:' + f.k + '" value="' + esc(dr.name) + '" autocomplete="off"></div>' +
          '<div><label class="field__help" for="it-v-' + f.k + '">' + esc(f.valueLabel) + '</label><div class="input-wrap"><span class="prefix">£</span><input class="input" id="it-v-' + f.k + '" inputmode="decimal" data-it="value" data-ik="' + f.k + '" data-fid="itv:' + f.k + '" value="' + esc(dr.value) + '" autocomplete="off"></div></div>' +
          '<button type="button" class="btn btn--outline" data-act="itemAdd" data-k="' + f.k + '" data-fid="add:' + f.k + '">Add</button></div>';
        return wrap(f, body2, ctx, true);
      }
      case 'claims': {
        var yn = tilesHtml({ k: f.k, t: 'yesno' }, a, { errors: {} }, true, 'claimSet');
        var listHtml = '';
        if (a.claimsMade === 'yes') {
          listHtml = '<div class="claims">' + (a.claims || []).map(function (c, i) {
            return '<div class="claim"><div><div class="claim__title">' + esc(c.type) + '</div><div class="claim__meta">' + esc(U.dateGB(c.date)) + ', ' + (c.settled === 'settled' ? 'Settled' : 'Outstanding') + ', ' + esc(U.money(c.amount)) + '</div></div>' +
              '<div class="claim__actions"><button type="button" class="link" data-act="claimEdit" data-i="' + i + '" data-fid="ce:' + i + '">Edit<span class="sr-only"> ' + esc(c.type) + ' claim</span></button><button type="button" class="link link--danger" data-act="claimRemove" data-i="' + i + '" data-fid="cr:' + i + '">Remove<span class="sr-only"> ' + esc(c.type) + ' claim</span></button></div></div>';
          }).join('') + '<button type="button" class="claims__add" data-act="claimAdd" data-fid="claimAdd"><span>Add a claim</span>' + ic('add', 24) + '</button></div>';
        }
        return wrap(f, yn + listHtml, ctx, true);
      }
      case 'rebuild': {
        var pre = S.rebuildAdjusted ? bcisAlert() : '';
        var f2 = { k: f.k, q: f.q, help: ['Using Building Cost Information Service (BCIS) data and the details about your house, we\'ve estimated your rebuild cost.', 'You can change it if you think it\'s wrong.', 'If this is too low, your payout may not cover rebuilding your home.'] };
        var body3 = '<div class="input-wrap"><span class="prefix">£</span><input class="input input--narrow" id="' + id + '" inputmode="numeric" data-money data-k="' + f.k + '" data-fid="' + f.k + '" value="' + esc(fmtMoneyInput(a[f.k], false)) + '"' + err + ' autocomplete="off"></div>' +
          '<p style="margin-top:16px"><button type="button" class="link link--help" data-act="toast">' + ic('info', 20) + 'What is rebuild cost and how do I calculate it?</button></p>';
        return wrap(f2, body3, ctx, false, pre);
      }
      default: return '';
    }
  }
  function fieldsHtml(c, a, ctx) { return c.fields.map(function (f) { return fieldHtml(f, a, ctx); }).join(''); }

  /* ---------- journey pages (version B, and reachable in C) ---------- */
  function neighbours(id) { var i = CARDS.indexOf(cardById(id)); return { prev: CARDS[i - 1], next: CARDS[i + 1] }; }
  function cardButtons(c, out) {
    var n = neighbours(c.id), step = stepById(c.step);
    var nextLabel = 'Next' + (!n.next || n.next.step !== c.step ? ': ' + step.nextName : '');
    var back = n.prev ? '<button type="button" class="btn btn--outline" data-act="back" data-card="' + c.id + '" data-fid="back">Back to ' + n.prev.id + '</button>' : '';
    var next = '<button type="button" class="btn btn--cta" data-act="next" data-card="' + c.id + '" data-fid="next">' + esc(nextLabel) + '</button>';
    if (c.nextOutside && !out) return back ? '<div class="btn-row">' + back + '</div>' : '';
    if (c.nextOutside && out) return '<div class="btn-row btn-row--after">' + next + '</div>';
    return '<div class="btn-row">' + back + next + '</div>';
  }
  function pageStep(cardId) {
    var c = cardById(cardId), step = stepById(c.step), cards = CARDS.filter(function (x) { return x.step === c.step; }), idx = cards.indexOf(c);
    var ctx = { errors: ui.errors };
    var list = cards.map(function (x, i) {
      if (i < idx) return '<section class="card" aria-labelledby="t-' + x.id + '"><div class="card__head"><h3 class="card__title" id="t-' + x.id + '">' + esc(x.title) + '</h3><a class="link" href="#/step/' + x.id + '">Edit<span class="sr-only"> ' + esc(x.title) + '</span></a></div><p class="card__desc">' + esc(x.desc) + '</p></section>';
      if (i > idx) return '<section class="card card--upcoming"><h3 class="card__title">' + esc(x.title) + '</h3></section>';
      return '<section class="card card--active" id="card-' + x.id + '" aria-labelledby="t-' + x.id + '"><h2 class="card__title" id="t-' + x.id + '">' + esc(x.activeTitle || x.title) + '</h2>' +
        (x.intro ? '<p class="card__intro">' + esc(x.intro) + '</p>' : '') + fieldsHtml(x, S.answers, ctx) + cardButtons(x, false) + '</section>' + (x.nextOutside ? cardButtons(x, true) : '');
    }).join('');
    return headerHtml(step.no, step.title, step.intro, true) + '<div class="cards col">' + list + '</div>' +
      '<p><button type="button" class="link save-later" data-act="toast">' + ic('lock', 20) + 'Save for later</button></p>';
  }

  /* ---------- check your answers ---------- */
  function rowsHtml(c, a) {
    return '<dl class="rows">' + c.rows(a).map(function (r) {
      var sub = r[2] && r[2].length ? '<ul>' + r[2].map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '';
      return '<div class="row"><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + sub + '</dd></div>';
    }).join('') + '</dl>';
  }
  function summaryCard(c) {
    if (version === 'c' && ui.editing === c.id) {
      var ctx = { errors: ui.errors };
      return '<section class="card card--editing" id="card-' + c.id + '" aria-labelledby="t-' + c.id + '"><div class="card__head"><h3 class="card__title" id="t-' + c.id + '">' + esc(c.activeTitle || c.title) + '</h3></div>' +
        fieldsHtml(c, ui.draft, ctx) +
        '<div class="btn-row"><button type="button" class="btn btn--cta" data-act="save" data-card="' + c.id + '" data-fid="save">Save</button><button type="button" class="btn btn--outline" data-act="cancel" data-fid="cancel">Cancel</button></div></section>';
    }
    var edit = version === 'c'
      ? '<button type="button" class="link" data-act="edit" data-card="' + c.id + '" data-fid="edit:' + c.id + '">Edit<span class="sr-only"> ' + esc(c.title) + '</span></button>'
      : '<a class="link" href="#/step/' + c.id + '">Edit<span class="sr-only"> ' + esc(c.title) + '</span></a>';
    return '<section class="card card--summary" id="card-' + c.id + '" aria-labelledby="t-' + c.id + '"><div class="card__head"><h3 class="card__title" id="t-' + c.id + '">' + esc(c.title) + '</h3>' + edit + '</div>' +
      rowsHtml(c, S.answers) + (c.bcis && S.rebuildAdjusted ? bcisAlert() : '') + '</section>';
  }
  function pageSummary() {
    return headerHtml(5, 'Check your answers', 'Please ensure your answers are accurate and change any that need updating.', version === 'b') +
      '<div class="cards col">' + CARDS.map(summaryCard).join('') + '</div>' +
      '<div class="consent" id="consent"><label><input type="checkbox" data-act="consent" data-fid="consent"' + (S.consent ? ' checked' : '') + (ui.consentError ? ' aria-invalid="true"' : '') + '><span>' +
      '<p>I confirm that I am happy for Utility Warehouse to provide me with a quote and a link to retrieve my quote by email.</p>' +
      '<p>I also understand that underwriters may check my details with credit and fraud agencies. This soft search is to verify my identity and affects neither credit score nor my ability to get credit.</p></span></label>' +
      (ui.consentError ? '<p class="field__error" role="alert">' + ic('info', 20) + '<span>Tick the box to confirm before you get your quote</span></p>' : '') + '</div>' +
      '<div class="btn-row btn-row--after"><button type="button" class="btn btn--outline" data-act="summaryBack" data-fid="sback">Back</button><button type="button" class="btn btn--cta" data-act="getQuote" data-fid="quote">Get your quote</button></div>' +
      '<p><button type="button" class="link save-later" data-act="toast">' + ic('lock', 20) + 'Save for later</button></p>';
  }
  function pageQuote() {
    return headerHtml(6, 'Your quote', 'You’ve reached the end of this prototype.', false) +
      '<div class="col"><p style="margin-top:24px">Thanks for taking part. You can close this window now.</p><div class="btn-row btn-row--after"><button type="button" class="btn btn--outline" data-act="toSummary">Back to check your answers</button></div></div>';
  }

  /* ---------- landing and facilitator ---------- */
  function pageLanding() {
    var base = location.pathname;
    return '<div class="plain"><h1>Home insurance prototype</h1><p>Check your answers: edit pattern test.</p>' +
      '<p>Choose a version. Each version keeps its own saved answers in this browser.</p>' +
      '<div class="btn-row"><a class="btn btn--cta" href="' + base + '?v=b">Version B: return banner</a><a class="btn btn--outline" href="' + base + '?v=c">Version C: expand in place</a></div>' +
      '<h2>For the test</h2><p>Send each group its own link: <code>?v=b</code> or <code>?v=c</code>. Add <code>&amp;reset=1</code> to a link to start from the original answers. Open <code>#/facilitator</code> for tools.</p></div>';
  }
  function pageFacilitator() {
    var other = version === 'b' ? 'c' : 'b';
    var recent = S.log.slice(-25).map(function (l) { return pad(Math.floor(l.t / 60000)) + ':' + pad(Math.floor(l.t / 1000) % 60) + ' ' + l.e + (l.d !== null ? ' ' + JSON.stringify(l.d) : ''); }).join('\n');
    return '<div class="plain"><h1>Facilitator</h1><p><span class="pill">Version ' + version.toUpperCase() + '</span> <span class="pill">' + S.log.length + ' events logged</span></p>' +
      '<div class="btn-row"><button type="button" class="btn btn--outline" data-act="downloadLog">Download event log (JSON)</button><button type="button" class="btn btn--outline" data-act="reset">Reset to starting answers</button></div>' +
      '<h2>Links</h2><p>This version: <code>' + esc(location.pathname) + '?v=' + version + '</code><br>Other version: <code>' + esc(location.pathname) + '?v=' + other + '</code></p>' +
      '<div class="btn-row"><a class="btn btn--outline" href="#/summary">Open Check your answers</a><a class="btn btn--outline" href="' + esc(location.pathname) + '?v=' + other + '#/facilitator">Switch to version ' + other.toUpperCase() + '</a></div>' +
      '<h2>Recent events</h2><pre>' + esc(recent || 'Nothing logged yet.') + '</pre></div>';
  }

  /* ---------- claim modal ---------- */
  function openClaim(mode, idx) {
    var d = { day: '', month: '', year: '', type: '', typeq: '', settled: '', amount: '', atProperty: '' };
    if (mode === 'edit') {
      var c = model().claims[idx], p = String(c.date).split('-');
      d = { day: String(Number(p[2])), month: String(Number(p[1])), year: p[0], type: c.type, typeq: '', settled: c.settled, amount: String(c.amount), atProperty: c.atProperty };
    }
    var ae = document.activeElement;
    ui.openerFid = ae && ae.getAttribute ? ae.getAttribute('data-fid') : null;
    ui.modal = { mode: mode, idx: idx, d: d, errors: {}, open: false };
    log('claim_modal_open', mode);
    renderOverlay(true);
  }
  function closeModal() {
    ui.modal = null; renderOverlay(); render();
    if (ui.openerFid) { var el = document.querySelector('[data-fid="' + cssEsc(ui.openerFid) + '"]'); if (el) el.focus(); }
  }
  function cssEsc(s) { return window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"'); }
  function modalHtml() {
    var m = ui.modal, d = m.d, e = m.errors, q = d.type || d.typeq || '';
    var list = C.claimTypes.filter(function (t) { return !d.typeq || t.toLowerCase().indexOf(d.typeq.toLowerCase()) > -1; });
    function err(k) { return e[k] ? '<p class="field__error" role="alert">' + ic('info', 20) + '<span>' + esc(e[k]) + '</span></p>' : ''; }
    function opt2(k, opts) {
      return '<div class="tiles tiles--row" role="radiogroup" aria-labelledby="m-' + k + '-l"' + (e[k] ? ' aria-invalid="true"' : '') + '>' + opts.map(function (o) {
        return '<button type="button" role="radio" aria-checked="' + (d[k] === o.v) + '" class="tile" data-act="mSet" data-mk="' + k + '" data-v="' + o.v + '" data-fid="m:' + k + ':' + o.v + '"><span class="radio"></span><span class="tile__text"><span>' + o.l + '</span></span></button>';
      }).join('') + '</div>';
    }
    var inv = function (k) { return e[k] ? ' aria-invalid="true"' : ''; };
    return '<div class="scrim" data-act="scrim"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-t">' +
      '<button type="button" class="dialog__close" data-act="modalClose" aria-label="Close" data-fid="m:close">' + ic('close', 24) + '</button>' +
      '<h2 id="dlg-t">About your previous claim</h2>' +
      '<div class="field"><div class="field__label" id="m-date-l">When did you make this claim?</div><div class="field__body date3" role="group" aria-labelledby="m-date-l">' +
      '<label>Day<input class="input" inputmode="numeric" maxlength="2" data-m="day" data-fid="m:day" value="' + esc(d.day) + '"' + inv('date') + '></label>' +
      '<label>Month<input class="input" inputmode="numeric" maxlength="2" data-m="month" data-fid="m:month" value="' + esc(d.month) + '"' + inv('date') + '></label>' +
      '<label>Year<input class="input input--year" inputmode="numeric" maxlength="4" data-m="year" data-fid="m:year" value="' + esc(d.year) + '"' + inv('date') + '></label></div>' + err('date') + '</div>' +
      '<div class="field"><label class="field__label" for="m-type">What type of claim was made?</label><div class="field__body combo"><div class="input-wrap input-wrap--icon">' + ic('search', 24) +
      '<input class="input" id="m-type" role="combobox" aria-expanded="' + (m.open && list.length > 0) + '" aria-controls="m-type-list" autocomplete="off" placeholder="Search claim type" data-m="typeq" data-fid="m:typeq" value="' + esc(q) + '"' + inv('type') + '></div>' +
      (m.open && list.length ? '<ul class="combo__list" id="m-type-list" role="listbox">' + list.map(function (t) { return '<li role="option"><button type="button" data-act="mType" data-v="' + esc(t) + '" data-fid="m:t:' + esc(t) + '">' + esc(t) + '</button></li>'; }).join('') + '</ul>' : '') +
      '</div>' + err('type') + '</div>' +
      '<div class="field"><div class="field__label" id="m-settled-l">Has the claim been settled?</div><div class="field__body">' + opt2('settled', [{ v: 'settled', l: 'Settled' }, { v: 'outstanding', l: 'Outstanding' }]) + '</div>' + err('settled') + '</div>' +
      '<div class="field"><label class="field__label" for="m-amount">How much was the claim for?</label><div class="field__body"><div class="input-wrap"><span class="prefix">£</span><input class="input" id="m-amount" inputmode="decimal" data-m="amount" data-fid="m:amount" value="' + esc(d.amount) + '"' + inv('amount') + ' autocomplete="off"></div></div>' + err('amount') + '</div>' +
      '<div class="field"><div class="field__label" id="m-atProperty-l">Were you living at property to be insured when you made this claim?</div><div class="field__body">' + opt2('atProperty', [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No, another property' }]) + '</div>' + err('atProperty') + '</div>' +
      '<div class="dialog__foot"><button type="button" class="btn btn--cta" data-act="mSave" data-fid="m:save">' + (m.mode === 'edit' ? 'Save claim' : 'Add claim') + '</button></div></div></div>';
  }
  function saveClaim() {
    var m = ui.modal, d = m.d, e = {}, now = new Date(), y = Number(d.year), mo = Number(d.month), da = Number(d.day);
    if (!d.day || !d.month || !d.year) e.date = 'Enter the date of the claim';
    else {
      var dt = new Date(y, mo - 1, da);
      if (String(d.year).length !== 4 || mo < 1 || mo > 12 || da < 1 || dt.getMonth() !== mo - 1 || dt.getDate() !== da) e.date = 'Enter a real date, like 12 12 2025';
      else if (dt > now) e.date = 'The date of the claim must be in the past';
      else if (y < now.getFullYear() - 5 || (y === now.getFullYear() - 5 && (mo - 1 < now.getMonth() || (mo - 1 === now.getMonth() && da < now.getDate())))) e.date = 'The claim must be within the last 5 years';
    }
    if (!d.type) e.type = 'Select a claim type from the list';
    if (!d.settled) e.settled = 'Select whether the claim has been settled';
    var amt = parseFloat(String(d.amount).replace(/[^0-9.]/g, ''));
    if (!d.amount || isNaN(amt)) e.amount = 'Enter the amount of the claim';
    if (!d.atProperty) e.atProperty = 'Select an option';
    if (Object.keys(e).length) { m.errors = e; renderOverlay(); return; }
    var claim = { type: d.type, date: y + '-' + pad(mo) + '-' + pad(da), settled: d.settled, amount: amt, atProperty: d.atProperty };
    var claims = clone(model().claims || []);
    if (m.mode === 'edit') claims[m.idx] = claim; else claims.push(claim);
    log(m.mode === 'edit' ? 'claim_saved' : 'claim_added', claim.type);
    setVal('claims', claims);
    setVal('claimsMade', 'yes');
    closeModal();
  }
  function renderOverlay(focusFirst) {
    var cap = capture('overlay');
    if (!ui.modal) { overlayEl.innerHTML = ''; document.body.style.overflow = ''; return; }
    overlayEl.innerHTML = modalHtml();
    document.body.style.overflow = 'hidden';
    if (focusFirst) { var first = overlayEl.querySelector('[data-m="day"]'); if (first) first.focus(); }
    else restore(cap, overlayEl);
  }

  /* ---------- rendering ---------- */
  function capture(where) {
    var ae = document.activeElement, scope = where === 'overlay' ? overlayEl : appEl;
    if (!ae || !scope.contains(ae) || !ae.getAttribute) return null;
    var fid = ae.getAttribute('data-fid');
    if (!fid) return null;
    return { fid: fid, s: typeof ae.selectionStart === 'number' ? ae.selectionStart : null, e: typeof ae.selectionEnd === 'number' ? ae.selectionEnd : null };
  }
  function restore(cap, scope) {
    if (!cap) return;
    var el = scope.querySelector('[data-fid="' + cssEsc(cap.fid) + '"]');
    if (!el) return;
    try { el.focus({ preventScroll: true }); if (cap.s !== null && el.setSelectionRange && el.type !== 'date' && el.type !== 'email') el.setSelectionRange(cap.s, cap.e); } catch (err) { /* some input types do not support selection */ }
  }
  function render() {
    var rt = route(), cap = capture('app'), inner;
    if (!version) { document.body.classList.remove('has-bar'); appEl.innerHTML = pageLanding(); return; }
    if (rt.name === 'summary') { if (!S.reached) { S.reached = true; save(); } inner = pageSummary(); }
    else if (rt.name === 'step') inner = pageStep(rt.card);
    else if (rt.name === 'quote') inner = pageQuote();
    else inner = pageFacilitator();
    var bar = version === 'b' && S.reached && rt.name === 'step';
    document.body.classList.toggle('has-bar', bar);
    if (rt.name === 'facilitator') { appEl.innerHTML = navHtml() + inner; }
    else appEl.innerHTML = navHtml() + '<main class="main container" id="main" tabindex="-1">' + inner + '</main>' + footerHtml() + (bar ? stickyHtml() : '');
    restore(cap, appEl);
    document.title = (rt.name === 'summary' ? 'Check your answers' : rt.name === 'step' ? cardById(rt.card).title : 'Home insurance') + ' | Home insurance prototype';
  }
  function showToast(msg) {
    toastEl.innerHTML = '<div class="toast" role="status">' + esc(msg) + '</div>';
    clearTimeout(showToast.t);
    showToast.t = setTimeout(function () { toastEl.innerHTML = ''; }, 2800);
  }
  function focusFirstError() {
    var el = document.querySelector('.field__error');
    if (!el) return;
    var field = el.closest('.field') || el;
    field.scrollIntoView({ block: 'center' });
    var inp = field.querySelector('input:not([disabled]),select,button.tile');
    if (inp) inp.focus({ preventScroll: true });
  }

  /* ---------- actions ---------- */
  function afterRoute() {
    ui.errors = {}; ui.consentError = false;
    window.scrollTo(0, 0);
    var rt = route();
    log('view', rt.name === 'step' ? 'step/' + rt.card : rt.name);
    save();
    render();
    var main = document.getElementById('main'); if (main) main.focus({ preventScroll: true });
  }
  function validateCurrentStep() {
    var rt = route(); if (rt.name !== 'step') return true;
    var errs = validate(cardById(rt.card), S.answers);
    if (Object.keys(errs).length) { ui.errors = errs; render(); focusFirstError(); return false; }
    return true;
  }
  function onClick(e) {
    // close the claim type list when clicking elsewhere
    if (ui.modal && ui.modal.open && !e.target.closest('.combo')) { ui.modal.open = false; renderOverlay(); }
    var combo = e.target.closest('[data-m="typeq"]');
    if (combo && ui.modal && !ui.modal.open) { ui.modal.open = true; renderOverlay(); return; }
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act'), ds = t.dataset;
    switch (act) {
      case 'toast': e.preventDefault(); showToast('This isn’t part of the prototype.'); break;
      case 'set': {
        var f = findField(ds.k), v = ds.v; if (f && f.num) v = Number(v);
        setVal(ds.k, v); render(); break;
      }
      case 'setStart': {
        setVal('startChoice', ds.v);
        if (ds.v === 'today') setVal('startDate', isoDay(plusDays(0)));
        if (ds.v === 'tomorrow') setVal('startDate', isoDay(plusDays(1)));
        render(); break;
      }
      case 'pickAddr': setVal('address', ds.v); render(); break;
      case 'addrManual': ui.addrManual = !ui.addrManual; render(); break;
      case 'itemAdd': {
        var dr = ui.itemDraft[ds.k] || { name: '', value: '' }, val = parseFloat(String(dr.value).replace(/[^0-9.]/g, ''));
        if (!dr.name.trim() || isNaN(val) || val <= 0) { ui.errors[ds.k] = 'Enter a description and a value'; render(); break; }
        var list = clone(model()[ds.k] || []); list.push({ name: dr.name.trim(), value: val });
        ui.itemDraft[ds.k] = { name: '', value: '' }; setVal(ds.k, list); render(); break;
      }
      case 'itemRemove': { var l2 = clone(model()[ds.k] || []); l2.splice(Number(ds.i), 1); setVal(ds.k, l2); render(); break; }
      case 'claimSet':
        if (ds.v === 'yes') { setVal('claimsMade', 'yes'); render(); if (!(model().claims || []).length) openClaim('add'); }
        else { setVal('claimsMade', 'no'); render(); }
        break;
      case 'claimAdd': openClaim('add'); break;
      case 'claimEdit': openClaim('edit', Number(ds.i)); break;
      case 'claimRemove': { var cl = clone(model().claims || []); log('claim_removed', cl[Number(ds.i)] && cl[Number(ds.i)].type); cl.splice(Number(ds.i), 1); setVal('claims', cl); render(); break; }
      case 'mSet': ui.modal.d[ds.mk] = ds.v; delete ui.modal.errors[ds.mk]; renderOverlay(); break;
      case 'mType': ui.modal.d.type = ds.v; ui.modal.d.typeq = ''; ui.modal.open = false; delete ui.modal.errors.type; renderOverlay(); break;
      case 'mSave': saveClaim(); break;
      case 'modalClose': closeModal(); break;
      case 'scrim': if (e.target === t) closeModal(); break;
      case 'back': {
        var n = neighbours(ds.card); log('nav_back', ds.card); if (n.prev) go('#/step/' + n.prev.id); break;
      }
      case 'next': {
        var c = cardById(ds.card), errs = validate(c, S.answers);
        if (Object.keys(errs).length) { ui.errors = errs; render(); focusFirstError(); break; }
        if (c.id === '1e') confirmRebuild();
        var nx = neighbours(c.id).next; log('nav_next', c.id); go(nx ? '#/step/' + nx.id : '#/summary'); break;
      }
      case 'goStep': log('stepper_click', ds.card); go('#/step/' + ds.card); break;
      case 'barReturn':
        if (!validateCurrentStep()) break;
        log('bar_return', route().card); go('#/summary'); break;
      case 'edit': {
        if (ui.editing && ui.editing !== ds.card) log('edit_discarded', ui.editing);
        ui.editing = ds.card; ui.draft = clone(S.answers); ui.errors = {}; log('edit_open', ds.card); render();
        var card = document.getElementById('card-' + ds.card); if (card) card.scrollIntoView({ block: 'nearest' });
        var first = card && card.querySelector('input:not([disabled]),select,button.tile'); if (first) first.focus({ preventScroll: true });
        break;
      }
      case 'save': {
        var sc = cardById(ds.card), er = validate(sc, ui.draft);
        if (Object.keys(er).length) { ui.errors = er; render(); focusFirstError(); break; }
        commitDraft(); ui.editing = null; ui.draft = null; ui.errors = {}; log('edit_save', ds.card); render();
        var done = document.getElementById('card-' + ds.card); if (done) done.scrollIntoView({ block: 'nearest' });
        var eb = document.querySelector('[data-fid="edit:' + ds.card + '"]'); if (eb) eb.focus({ preventScroll: true });
        break;
      }
      case 'cancel': { var id = ui.editing; ui.editing = null; ui.draft = null; ui.errors = {}; log('edit_cancel', id); render(); var b2 = document.querySelector('[data-fid="edit:' + id + '"]'); if (b2) b2.focus({ preventScroll: true }); break; }
      case 'consent': S.consent = t.checked; ui.consentError = false; save(); render(); break;
      case 'summaryBack': go('#/step/5a'); break;
      case 'getQuote':
        if (!S.consent) { ui.consentError = true; render(); var ce = document.getElementById('consent'); if (ce) ce.scrollIntoView({ block: 'center' }); break; }
        log('get_quote'); go('#/quote'); break;
      case 'toSummary': go('#/summary'); break;
      case 'downloadLog': {
        var blob = new Blob([JSON.stringify({ version: version, answers: S.answers, log: S.log }, null, 2)], { type: 'application/json' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'prototype-log-' + version + '.json'; document.body.appendChild(a); a.click(); a.remove(); break;
      }
      case 'reset': try { localStorage.removeItem(KEY); } catch (er2) { /* ignore */ } location.hash = '#/summary'; location.reload(); break;
      default: break;
    }
  }
  function onInput(e) {
    var t = e.target;
    if (t.matches('[data-m]')) {
      var name = t.getAttribute('data-m');
      if (name === 'typeq') { ui.modal.d.typeq = t.value; ui.modal.d.type = ''; ui.modal.open = true; delete ui.modal.errors.type; renderOverlay(); }
      else { ui.modal.d[name] = t.value; if (name === 'day' || name === 'month' || name === 'year') delete ui.modal.errors.date; else delete ui.modal.errors[name]; }
      return;
    }
    if (t.matches('[data-it]')) {
      var k = t.getAttribute('data-ik'); ui.itemDraft[k] = ui.itemDraft[k] || { name: '', value: '' }; ui.itemDraft[k][t.getAttribute('data-it')] = t.value; delete ui.errors[k]; return;
    }
    if (!t.matches('input[data-k]') || t.type === 'checkbox') return;
    var key = t.getAttribute('data-k');
    if (t.hasAttribute('data-money')) {
      var s = t.value.replace(/[^0-9.]/g, '');
      setVal(key, s === '' ? '' : parseFloat(s));
      if (key === 'rebuildCost') { var al = document.querySelector('[data-bcis]'); if (al) al.remove(); }
    } else setVal(key, t.value);
  }
  function onChange(e) {
    var t = e.target;
    if (t.matches('select[data-k]')) {
      var v = t.value; if (t.hasAttribute('data-num')) v = v === '' ? '' : Number(v);
      setVal(t.getAttribute('data-k'), v); render(); return;
    }
    if (t.matches('input[type="checkbox"][data-k]')) { setVal(t.getAttribute('data-k'), t.checked); render(); return; }
    if (t.matches('input[data-k]')) render();
  }
  function onKey(e) {
    if (!ui.modal) return;
    if (e.key === 'Escape') { if (ui.modal.open) { ui.modal.open = false; renderOverlay(); } else closeModal(); return; }
    if (e.key === 'Tab') {
      var f = overlayEl.querySelectorAll('button, input, select, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ---------- start ---------- */
  load();
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', onKey);
  window.addEventListener('hashchange', afterRoute);
  if (!location.hash) history.replaceState(null, '', location.pathname + location.search + '#/summary');
  if (version) { log('session_start', version); afterRoute(); } else render();
})();
