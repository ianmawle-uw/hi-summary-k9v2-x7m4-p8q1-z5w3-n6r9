/*
 * Journey content: steps, cards, fields and the rows each card shows on "Check your answers".
 * Wording for 1a, 1b, 1e and 3c comes from the Figma designs. Wording for the other cards is
 * ASSUMED (built from the labels on the Check your answers design) and should not be tested.
 */
(function () {
  var C = window.PROTO_CONFIG;

  /* ---------- helpers ---------- */
  var U = {};
  U.money = function (n) {
    if (n === '' || n === null || n === undefined || isNaN(n)) return '';
    var v = Number(n);
    var hasPence = Math.round(v * 100) % 100 !== 0;
    return '£' + v.toLocaleString('en-GB', { minimumFractionDigits: hasPence ? 2 : 0, maximumFractionDigits: 2 });
  };
  U.dateGB = function (iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  };
  U.yn = function (v) { return v === 'yes' ? 'Yes' : v === 'no' ? 'No' : ''; };
  function range(a, b, fmt) {
    var out = [];
    for (var i = a; i <= b; i++) out.push({ v: i, l: fmt ? fmt(i) : String(i) });
    return out;
  }
  function lab(opts, v) {
    for (var i = 0; i < opts.length; i++) if (String(opts[i].v) === String(v)) return opts[i].l;
    return v === undefined || v === null ? '' : String(v);
  }
  U.lab = lab;
  U.range = range;

  /* ---------- option lists ---------- */
  var O = {};
  O.policy = [
    { v: 'both', l: 'Buildings & contents', help: 'Covers the structure of your home & your contents.', img: 'technical-buildings-and-contents-light.svg' },
    { v: 'contents', l: 'Contents only', help: 'Contents insurance covers what’s inside your home, such as furniture, carpets and electrical goods.', img: 'technical-contents-light.svg' },
    { v: 'buildings', l: 'Buildings only', help: 'Buildings insurance covers the structure of your home, such as the walls, roof and doors.', img: 'technical-buildings-light.svg' }
  ];
  O.start = [{ v: 'today', l: 'Today' }, { v: 'tomorrow', l: 'Tomorrow' }, { v: 'other', l: 'Other' }];
  O.providers = ['Admiral', 'Allianz', 'Aviva', 'AXA', 'Churchill', 'Direct Line', 'Halifax', 'LV=', 'Zurich'].map(function (p) { return { v: p, l: p }; });
  O.ownership = [
    { v: 'mortgage', l: 'I own my home with a mortgage' },
    { v: 'outright', l: 'I own my home outright' },
    { v: 'rent', l: 'I rent my home - Private, unfurnished' },
    { v: 'other', l: 'Other' }
  ];
  O.propertyType = [{ v: 'house', l: 'House' }, { v: 'flat', l: 'Flat' }, { v: 'bungalow', l: 'Bungalow' }, { v: 'townhouse', l: 'Townhouse' }];
  O.houseType = [
    { v: 'detached', l: 'Detached' }, { v: 'semi', l: 'Semi-detached' }, { v: 'link', l: 'Link detached' },
    { v: 'terrace', l: 'Terrace' }, { v: 'endTerrace', l: 'End terrace' }
  ];
  O.walls = [{ v: 'brick', l: 'Brick' }, { v: 'stone', l: 'Stone' }, { v: 'timber', l: 'Timber frame' }, { v: 'concrete', l: 'Concrete' }, { v: 'other', l: 'Other' }];
  O.roof = [{ v: 'slate', l: 'Slate' }, { v: 'tiles', l: 'Tiles' }, { v: 'thatch', l: 'Thatch' }, { v: 'metal', l: 'Metal' }, { v: 'other', l: 'Other' }];
  O.heating = [{ v: 'gas', l: 'Gas central heating' }, { v: 'electric', l: 'Electric heating' }, { v: 'oil', l: 'Oil central heating' }, { v: 'solid', l: 'Solid fuel' }, { v: 'heatpump', l: 'Heat pump' }];
  O.doorLock = [{ v: 'multipoint', l: 'Multi-point locking system' }, { v: 'mortice', l: '5-lever mortice deadlock' }, { v: 'other', l: 'Other lock' }];
  O.patio = [{ v: 'none', l: 'No patio doors' }, { v: 'keyrail', l: 'Yes, central rail key operated lock' }, { v: 'other', l: 'Yes, other lock' }];
  O.alarm = [{ v: 'none', l: 'No alarm' }, { v: 'audible', l: 'Audible alarm' }, { v: 'ssaib', l: 'SSAIB alarm fitted' }];
  O.marital = [{ v: 'single', l: 'Single' }, { v: 'married', l: 'Married' }, { v: 'civil', l: 'Civil partnership' }, { v: 'divorced', l: 'Divorced' }, { v: 'widowed', l: 'Widowed' }];
  O.employment = [{ v: 'employed', l: 'Employed' }, { v: 'self', l: 'Self-employed' }, { v: 'retired', l: 'Retired' }, { v: 'student', l: 'Student' }, { v: 'home', l: 'Looking after the home' }];
  O.relationship = [{ v: 'spouse', l: 'Spouse' }, { v: 'partner', l: 'Partner' }, { v: 'parent', l: 'Parent' }, { v: 'child', l: 'Child' }, { v: 'other', l: 'Other' }];
  O.excessB = [100, 250, 500, 1000].map(function (n) { return { v: n, l: U.money(n) }; });
  O.excessC = [0, 50, 100, 250].map(function (n) { return { v: n, l: U.money(n) }; });
  O.pct = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(function (n) { return { v: n, l: n + '%' }; });
  O.years = range(0, 15, function (i) { return i === 15 ? '15+' : String(i); });
  U.O = O;

  /* ---------- field builders ---------- */
  function yesno(k, q, extra) { return Object.assign({ k: k, t: 'yesno', q: q, req: true }, extra); }
  function select(k, q, opts, extra) { return Object.assign({ k: k, t: 'select', q: q, opts: opts, req: true }, extra); }
  function radio(k, q, opts, extra) { return Object.assign({ k: k, t: 'radio', q: q, opts: opts, req: true }, extra); }
  function text(k, q, extra) { return Object.assign({ k: k, t: 'text', q: q, req: true }, extra); }
  function money(k, q, extra) { return Object.assign({ k: k, t: 'currency', q: q, req: true }, extra); }
  function date(k, q, extra) { return Object.assign({ k: k, t: 'date', q: q, req: true }, extra); }
  var isYes = function (k) { return function (a) { return a[k] === 'yes'; }; };

  /* ---------- steps ---------- */
  var STEPS = [
    { id: 'home', no: 1, label: 'Your Home', title: 'Your home', intro: 'Tell us about your property and how it’s built.', nextName: 'Your contents' },
    { id: 'contents', no: 2, label: 'Your contents', title: 'Your contents', intro: 'Tell us about what’s inside your home.', nextName: 'About you' },
    { id: 'about', no: 3, label: 'About You', title: 'About you', intro: 'A few quick details to personalise your cover.', nextName: 'Excess and optional cover' },
    { id: 'excess', no: 4, label: 'Excess', title: 'Excess and optional cover', intro: 'Choose how much you’d pay towards a claim and any extra cover.', nextName: 'Disclosures' },
    { id: 'disclosures', no: 5, label: 'Disclosures', title: 'Disclosures', intro: 'A few final questions before we find your quote.', nextName: 'Check your answers' }
  ];
  var FUTURE_STEPS = ['Your quote', 'Review', 'All done!'];

  /* ---------- cards ---------- */
  var CARDS = [];
  function card(o) { CARDS.push(o); }

  // 1a (wording from the 1a design)
  card({
    id: '1a', step: 'home', title: '1a. Your cover', activeTitle: '1a. Your new cover',
    desc: 'Your type of cover, address & policy start date.',
    fields: [
      { t: 'info', title: 'Before you start', paras: [
        'We offer home insurance from a selected panel of insurance providers.',
        'We\'ll search our panel and show you the cheapest policy that covers what you\'ve told us you need. You’ll see one quote, not a list to choose from.',
        'Please answer every question accurately and truthfully. If details are wrong or missing, your insurer could cancel your policy or refuse to pay a claim.'
      ] },
      radio('policyType', 'What type of policy would you like?', O.policy, { image: true }),
      { t: 'help', label: 'What\'s the difference?' },
      { k: 'address', t: 'address', q: 'What is the address you’d like to cover?', req: true },
      { k: 'startDate', t: 'startdate', q: 'Choose the date you’d like your cover to start',
        help: 'You can select a date up to 30 days in advance. If your current policy is due for renewal, this date should be the same as your renewal date so that you’re not without cover.', req: true },
      { k: 'provider', t: 'provider', q: 'Who is your current insurance provider?',
        help: 'Please select or click ‘Other/None’ if you can’t find your provider or don\'t currently have home insurance.', opts: O.providers, optOut: 'providerNone', optOutLabel: 'Other/None', req: true },
      { k: 'renewalPrice', t: 'currency', q: 'Your current renewal price?', help: 'This won\'t affect the price we quote you.',
        optOut: 'renewalOptOut', optOutLabel: 'Other/Prefer not to say', req: true, pence: true }
    ],
    rows: function (a) {
      return [
        ['Type of cover', lab(O.policy, a.policyType)],
        ['Address insured', a.address],
        ['Policy start date', U.dateGB(a.startDate)],
        ['Current insurance provider', a.providerNone ? 'Other/None' : a.provider],
        ['Renewal price', a.renewalOptOut ? 'Other/Prefer not to say' : U.money(a.renewalPrice)]
      ];
    }
  });

  // 1b (wording from the 1b design)
  card({
    id: '1b', step: 'home', title: '1b. About your property',
    desc: 'Details about your property type, ownership, and number of rooms.',
    fields: [
      radio('ownership', 'Do you own or rent the property?', O.ownership),
      { t: 'help', label: 'What if I haven’t moved in yet?' },
      radio('propertyType', 'What type of property is it?', O.propertyType),
      radio('houseType', 'What type of house is it?', O.houseType, { show: function (a) { return a.propertyType === 'house'; } }),
      select('bedrooms', 'How many bedrooms does your home have?', range(1, 10), { num: true,
        help: 'Please include rooms that were originally designed as bedrooms, even if they’re now used for a different purpose (e.g converted to a study).' }),
      select('bathrooms', 'How many bathrooms does the property have?', range(1, 8), { num: true,
        help: 'Including en-suites and any room containing a toilet.' }),
      select('otherRooms', 'Other rooms', range(0, 10), { num: true,
        help: 'This includes rooms like store rooms and basements.  It excludes kitchens, utility rooms and conservatories.' })
    ],
    rows: function (a) {
      var type = lab(O.propertyType, a.propertyType) + (a.propertyType === 'house' ? ', ' + lab(O.houseType, a.houseType) : '');
      return [
        ['Property ownership', lab(O.ownership, a.ownership)],
        ['Type of property', type],
        ['Number of rooms', a.bedrooms + ' bedroom' + (a.bedrooms === 1 ? '' : 's') + ', ' + a.bathrooms + ' bathroom' + (a.bathrooms === 1 ? '' : 's') + ', ' + a.otherRooms + ' other room' + (a.otherRooms === 1 ? '' : 's')]
      ];
    }
  });

  // 1c
  card({
    id: '1c', step: 'home', title: '1c. Property details',
    desc: 'Specifics around the property including flood risk and subsidence',
    fields: [
      yesno('trees', 'Is the property near large trees?'),
      yesno('water', 'Is the property near a body of water?'),
      yesno('selfContained', 'Is the property self-contained?'),
      yesno('goodRepair', 'Is the property in a good state of repair?'),
      yesno('buildingWork', 'Is the property undergoing building work?'),
      yesno('subsidence', 'Has the property had subsidence, landslip or heave?'),
      select('subsidenceYear', 'In what year did this happen?', range(1990, 2026).reverse(), { show: isYes('subsidence'), num: true, blank: true }),
      yesno('underpinning', 'Has the property been underpinned?'),
      yesno('flooding', 'Has the property ever flooded?')
    ],
    rows: function (a) {
      return [
        ['Near large trees?', U.yn(a.trees)], ['Near a body of water?', U.yn(a.water)],
        ['Self contained property?', U.yn(a.selfContained)], ['Good state of repair?', U.yn(a.goodRepair)],
        ['Undergoing building work?', U.yn(a.buildingWork)],
        ['Subsidence, landslip etc.?', U.yn(a.subsidence) + (a.subsidence === 'yes' && a.subsidenceYear ? ', ' + a.subsidenceYear : '')],
        ['Underpinning?', U.yn(a.underpinning)], ['Flooding?', U.yn(a.flooding)]
      ];
    }
  });

  // 1d
  card({
    id: '1d', step: 'home', title: '1d. How your home was built',
    desc: 'Summary of your home’s age and construction.',
    fields: [
      select('yearBuilt', 'What year was your home built?', range(1800, 2026).reverse(), { num: true }),
      date('movedIn', 'When did you move in?'),
      yesno('listed', 'Is your home a listed property?'),
      select('walls', 'What are the external walls made of?', O.walls),
      select('roof', 'What is the roof made of?', O.roof),
      yesno('flatRoof', 'Does your home have a flat roof?'),
      select('flatRoofPct', 'How much of the roof is flat?', O.pct, { show: isYes('flatRoof'), num: true, blank: true }),
      select('heating', 'What type of heating does your home have?', O.heating)
    ],
    rows: function (a) {
      return [
        ['Year built', a.yearBuilt], ['Date moved in', U.dateGB(a.movedIn)], ['Listed property', U.yn(a.listed)],
        ['External walls', lab(O.walls, a.walls)], ['Roof construction', lab(O.roof, a.roof)],
        ['Flat roof', U.yn(a.flatRoof) + (a.flatRoof === 'yes' && a.flatRoofPct ? ', ' + a.flatRoofPct + '%' : '')],
        ['Heating type', lab(O.heating, a.heating)]
      ];
    }
  });

  // 1e (wording from the 1e design). The BCIS alert is shown when the estimate has been adjusted.
  card({
    id: '1e', step: 'home', title: '1e. Rebuild cost',
    desc: 'The estimated cost to rebuild your home.',
    fields: [{ k: 'rebuildCost', t: 'rebuild', q: 'What\'s the estimated rebuild cost of your home?', req: true }],
    rows: function (a) { return [['Estimated rebuild cost', U.money(a.rebuildCost)]]; },
    bcis: true
  });

  // 1f
  card({
    id: '1f', step: 'home', title: '1f. Use of your home',
    desc: 'Who lives in the property and how it is used.',
    fields: [
      select('adults', 'How many adults (18+) live there?', range(1, 8), { num: true }),
      select('children', 'How many children (under 18) live there?', range(0, 8), { num: true }),
      yesno('smokers', 'Do any occupants smoke?'),
      yesno('mainResidence', 'Is this your main residence?'),
      yesno('letOut', 'Is the property let on a full-time or occasional basis?'),
      yesno('boarders', 'Do you have any boarders or lodgers?'),
      yesno('guests', 'Do you have any paying guests?'),
      yesno('unoccupied', 'Has the property been left unoccupied for 30 or more consecutive days?'),
      yesno('business', 'Is the property used for business purposes?'),
      select('visitors', 'How many business visitors come each day?', range(1, 50), { show: isYes('business'), num: true, blank: true })
    ],
    rows: function (a) {
      var others = [a.boarders === 'yes' ? 'Boarders or lodgers' : 'No boarders or lodgers', a.guests === 'yes' ? 'Paying guests' : 'No paying guests'];
      return [
        ['People living there', a.adults + ' adult' + (a.adults === 1 ? '' : 's') + ' (18+), ' + a.children + ' child' + (a.children === 1 ? '' : 'ren') + ' (under 18)'],
        ['Any occupants smoke?', U.yn(a.smokers)], ['Main residence?', U.yn(a.mainResidence)],
        ['Property let on a full-time or occasional basis?', U.yn(a.letOut)],
        ['Other people', others.join(', ')],
        ['Left unoccupied for 30+ consecutive days?', U.yn(a.unoccupied)],
        ['Used for business purposes?', U.yn(a.business) + (a.business === 'yes' && a.visitors ? ', ' + a.visitors + ' visitors per day' : '')]
      ];
    }
  });

  // 1g
  card({
    id: '1g', step: 'home', title: '1g. Your home security',
    desc: 'Locks, alarms and security at your property.',
    fields: [
      yesno('windowLocks', 'Do all accessible windows and skylights have locks?'),
      select('doorLock', 'What lock does your main door have?', O.doorLock),
      select('patioDoors', 'What lock do your patio doors have?', O.patio),
      select('alarm', 'Do you have an alarm system?', O.alarm),
      yesno('smokeAlarm', 'Do you have a smoke alarm?'),
      yesno('neighbourhoodWatch', 'Are you in a neighbourhood watch area?')
    ],
    rows: function (a) {
      return [
        ['All accessible windows/skylights have locks?', U.yn(a.windowLocks)], ['Main door lock?', lab(O.doorLock, a.doorLock)],
        ['Patio doors?', lab(O.patio, a.patioDoors)], ['Alarm system?', lab(O.alarm, a.alarm)],
        ['Smoke alarm?', U.yn(a.smokeAlarm)], ['Neighbourhood watch?', U.yn(a.neighbourhoodWatch)]
      ];
    }
  });

  // 2a
  card({
    id: '2a', step: 'contents', title: '2a. Home contents',
    desc: 'The cost to replace everything in your home.',
    fields: [money('contentsValue', 'What would it cost to replace all of your home contents?', { help: 'Include furniture, carpets, clothes and electrical goods.' })],
    rows: function (a) { return [['Cost to replace entire home contents', U.money(a.contentsValue)]]; }
  });

  // 2b
  card({
    id: '2b', step: 'contents', title: '2b. Bicycles',
    desc: 'Bikes covered away from home.',
    fields: [
      yesno('bikes', 'Do you want to cover any bikes worth over £350 while away from home?'),
      { k: 'bikeItems', t: 'items', q: 'Your bikes', show: isYes('bikes'), nameLabel: 'Bike description', valueLabel: 'Value' }
    ],
    rows: function (a) {
      return [['Cover bikes over £350 and away from home?', U.yn(a.bikes), a.bikes === 'yes' ? a.bikeItems.map(function (i) { return i.name + ', ' + U.money(i.value); }) : null]];
    }
  });

  // 2c
  card({
    id: '2c', step: 'contents', title: '2c. Valuables',
    desc: 'Valuable items you want covered.',
    fields: [
      yesno('valuables', 'Do you want to cover any items worth over £1,000?'),
      { k: 'valuableItems', t: 'items', q: 'Your valuables', show: isYes('valuables'), nameLabel: 'Item description', valueLabel: 'Value' }
    ],
    rows: function (a) {
      return [['Cover items over £1,000?', U.yn(a.valuables), a.valuables === 'yes' ? a.valuableItems.map(function (i) { return i.name + ', ' + U.money(i.value); }) : null]];
    }
  });

  // 2d
  card({
    id: '2d', step: 'contents', title: '2d. Cover away from home',
    desc: 'Cover for everyday items outside the home.',
    fields: [
      yesno('awayCover', 'Do you want cover for everyday items you carry outside the home?'),
      money('awayValue', 'What is the total value of the items you want covered away from home?', { show: isYes('awayCover') })
    ],
    rows: function (a) {
      var r = [['Cover for everyday items carried outside the home?', U.yn(a.awayCover)]];
      if (a.awayCover === 'yes') r.push(['Total value of items covered away from home', U.money(a.awayValue)]);
      return r;
    }
  });

  // 3a
  card({
    id: '3a', step: 'about', title: '3a. Your details',
    desc: 'Details about the main policy holder',
    fields: [
      text('firstName', 'First name'), text('lastName', 'Last name'),
      date('dob', 'Date of birth'),
      text('email', 'Email address', { type: 'email' }),
      text('phone', 'Phone number', { type: 'tel' }),
      select('marital', 'Marital status', O.marital),
      yesno('ukResident', 'Have you lived in the UK since birth?'),
      select('employment', 'What is your main employment status?', O.employment),
      text('occupation', 'What is your occupation?', { show: function (a) { return a.employment === 'employed' || a.employment === 'self'; } })
    ],
    rows: function (a) {
      return [
        ['Name', a.firstName + ' ' + a.lastName], ['Date of birth', U.dateGB(a.dob)], ['Email', a.email], ['Phone number', a.phone],
        ['Marital status', lab(O.marital, a.marital)], ['UK resident since birth?', U.yn(a.ukResident)],
        ['Main employment', lab(O.employment, a.employment) + (a.occupation && (a.employment === 'employed' || a.employment === 'self') ? ', ' + a.occupation : '')]
      ];
    }
  });

  // 3b
  card({
    id: '3b', step: 'about', title: '3b. Joint policy holder',
    desc: 'Details about the joint policy holder',
    fields: [
      select('jRelationship', 'How are you related to the joint policy holder?', O.relationship),
      text('jFirstName', 'First name'), text('jLastName', 'Last name'),
      date('jDob', 'Date of birth'),
      select('jMarital', 'Marital status', O.marital),
      yesno('jUkResident', 'Have they lived in the UK since birth?'),
      select('jEmployment', 'What is their main employment status?', O.employment),
      text('jOccupation', 'What is their occupation?', { show: function (a) { return a.jEmployment === 'employed' || a.jEmployment === 'self'; } })
    ],
    rows: function (a) {
      return [
        ['Relationship', lab(O.relationship, a.jRelationship)], ['Name', a.jFirstName + ' ' + a.jLastName], ['Date of birth', U.dateGB(a.jDob)],
        ['Marital status', lab(O.marital, a.jMarital)], ['UK resident since birth?', U.yn(a.jUkResident)],
        ['Main employment', lab(O.employment, a.jEmployment) + (a.jOccupation && (a.jEmployment === 'employed' || a.jEmployment === 'self') ? ', ' + a.jOccupation : '')]
      ];
    }
  });

  // 3c (wording from the 3c, Add claims and Claims added designs)
  card({
    id: '3c', step: 'about', title: '3c. Your claims history', nextOutside: true, intro: 'Please check and provide your claims details below',
    desc: 'Claims and losses in the last 5 years.',
    fields: [
      { k: 'claimsMade', t: 'claims', q: 'Have you made any home insurance claims or suffered any losses in the last 5 years?',
        help: 'This includes incidents where you chose not to claim, for example, because the cost was below your excess', req: true },
      select('yearsBuildings', 'How many years have you continuously held buildings insurance without any claims?', O.years,
        { num: true, help: 'Continuously means not having a break from a policy for more than 1 month.' }),
      select('yearsContents', 'How many years have you continuously held contents insurance without any claims?', O.years,
        { num: true, help: 'Continuously means not having a break from a policy for more than 1 month.' })
    ],
    rows: function (a) {
      var subs = a.claimsMade === 'yes' ? a.claims.map(function (c) { return c.type + ' ' + U.dateGB(c.date) + ', ' + (c.settled === 'settled' ? 'Settled' : 'Outstanding') + ', ' + U.money(c.amount); }) : null;
      return [
        ['Any home insurance claims in the last 5 years?', U.yn(a.claimsMade), subs && subs.length ? subs : null],
        ['Buildings claim-free years', a.yearsBuildings], ['Contents claim-free years', a.yearsContents]
      ];
    }
  });

  // 4a
  card({
    id: '4a', step: 'excess', title: '4a. Voluntary excess',
    desc: 'How much you would pay towards a claim.',
    fields: [
      select('excessBuildings', 'Buildings: how much voluntary excess would you like?', O.excessB, { num: true, help: 'This is on top of the compulsory excess. A higher excess can lower your price.' }),
      select('excessContents', 'Contents: how much voluntary excess would you like?', O.excessC, { num: true })
    ],
    rows: function (a) { return [['Buildings: voluntary excess', U.money(a.excessBuildings)], ['Contents: voluntary excess', U.money(a.excessContents)]]; }
  });

  // 4b
  card({
    id: '4b', step: 'excess', title: '4b. Optional cover',
    desc: 'Optional accidental damage cover.',
    fields: [
      yesno('accidentalBuildings', 'Do you want accidental damage cover for your buildings?'),
      yesno('accidentalContents', 'Do you want accidental damage cover for your contents?')
    ],
    rows: function (a) { return [['Buildings: accidental cover?', U.yn(a.accidentalBuildings)], ['Contents: accidental cover?', U.yn(a.accidentalContents)]]; }
  });

  // 5a
  card({
    id: '5a', step: 'disclosures', title: '5a. Disclosures',
    desc: 'A few questions about convictions, debt and previous insurance.',
    fields: [
      yesno('convictions', 'Does anyone covered have any unspent criminal convictions or pending prosecutions?'),
      yesno('ccj', 'Has anyone living in the property been the subject of any unsatisfied CCJs?'),
      yesno('bankrupt', 'Has anyone living in the property been declared bankrupt?'),
      yesno('refused', 'Has anyone living in the property had insurance refused, cancelled or declared void?')
    ],
    rows: function (a) {
      return [
        ['Does anyone have any unspent criminal convictions or pending prosecutions?', U.yn(a.convictions)],
        ['Has anyone living in the property been the subject of any unsatisfied CCJs?', U.yn(a.ccj)],
        ['Has anyone living in the property been declared bankrupt?', U.yn(a.bankrupt)],
        ['Has anyone living in the property had insurance refused, cancelled or declared void?', U.yn(a.refused)]
      ];
    }
  });

  window.PROTO_U = U;
  window.PROTO_STEPS = STEPS;
  window.PROTO_FUTURE = FUTURE_STEPS;
  window.PROTO_CARDS = CARDS;
})();
