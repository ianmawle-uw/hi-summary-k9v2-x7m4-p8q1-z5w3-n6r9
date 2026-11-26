/*
 * Check your answers prototype: settings a researcher can edit.
 * Everything here is test data, not real customer data.
 * Values marked ASSUMED were not in the Figma designs and were filled in so the
 * journey hangs together. Change them freely.
 */
(function () {
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function plusDays(n) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; }

  window.PROTO_CONFIG = {
    // Policy start date in the starting persona, in days from today (the design shows "Other" with a date).
    // Kept relative so the date is never in the past when the test runs. Policies can start up to 30 days ahead.
    startOffsetDays: 15,

    // Rebuild cost model (ASSUMED). The designs show 366,000 on the Rebuild cost page and 377,000
    // on the Check your answers page after a BCIS adjustment. These steps reproduce that:
    // one extra bedroom adds 11,000.
    rebuild: {
      base: { bedrooms: 2, bathrooms: 2, otherRooms: 3, houseType: 'semi' },
      baseCost: 366000,
      perBedroom: 11000,
      perBathroom: 6000,
      perOtherRoom: 4000,
      houseType: { detached: 25000, semi: 0, link: 10000, terrace: -12000, endTerrace: -6000 },
      // Changing any of these answers re-estimates the rebuild cost and shows the BCIS alert.
      triggerKeys: ['bedrooms', 'bathrooms', 'otherRooms', 'houseType', 'propertyType', 'yearBuilt']
    },

    claimTypes: ['Accidental damage', 'Escape of water', 'Fire', 'Flooding', 'Malicious damage', 'Storm', 'Subsidence', 'Theft', 'Other'],

    // Starting answers. The values in the designs are 1a: Buildings & contents, start date "Other" (10/12/2026),
    // Allianz; 1b: own with mortgage, house, semi-detached, 2 bedrooms, 2 bathrooms, 3 other rooms;
    // 3c: no claims, 8 years claim-free. Everything else is ASSUMED.
    persona: function () {
      return {
        // 1a
        policyType: 'both',
        postcode: 'BH1 1HB',
        address: '7 High Street, Poole, Dorset BH1 1HB',
        startChoice: 'other',
        startDate: iso(plusDays(15)),
        provider: 'Allianz',
        providerNone: false,
        renewalPrice: 312.4,
        renewalOptOut: false,
        // 1b
        ownership: 'mortgage',
        propertyType: 'house',
        houseType: 'semi',
        bedrooms: 2,
        bathrooms: 2,
        otherRooms: 3,
        // 1c
        trees: 'no',
        water: 'no',
        selfContained: 'yes',
        goodRepair: 'yes',
        buildingWork: 'no',
        subsidence: 'no',
        underpinning: 'no',
        flooding: 'no',
        // 1d
        yearBuilt: 1985,
        movedIn: '2018-06-12',
        listed: 'no',
        walls: 'brick',
        roof: 'slate',
        flatRoof: 'no',
        heating: 'gas',
        // 1e
        rebuildCost: 366000,
        // 1f
        adults: 2,
        children: 2,
        smokers: 'no',
        mainResidence: 'yes',
        letOut: 'no',
        boarders: 'no',
        guests: 'no',
        unoccupied: 'no',
        business: 'no',
        // 1g
        windowLocks: 'yes',
        doorLock: 'multipoint',
        patioDoors: 'keyrail',
        alarm: 'ssaib',
        smokeAlarm: 'yes',
        neighbourhoodWatch: 'no',
        // 2a
        contentsValue: 55000,
        // 2b
        bikes: 'yes',
        bikeItems: [{ name: 'Racing bike', value: 1800 }, { name: 'Mountain bike', value: 950 }],
        // 2c
        valuables: 'yes',
        valuableItems: [{ name: 'Watch', value: 2400 }, { name: 'Laptop', value: 1500 }],
        // 2d
        awayCover: 'yes',
        awayValue: 2500,
        // 3a
        firstName: 'Anna',
        lastName: 'Smith',
        dob: '1973-12-24',
        email: 'asmith@gmail.com',
        phone: '07476 383444',
        marital: 'married',
        ukResident: 'yes',
        employment: 'employed',
        occupation: 'Designer',
        // 3b
        jRelationship: 'spouse',
        jFirstName: 'John',
        jLastName: 'Smith',
        jDob: '1971-05-12',
        jMarital: 'married',
        jUkResident: 'yes',
        jEmployment: 'employed',
        jOccupation: 'Engineer',
        // 3c
        claimsMade: 'no',
        claims: [],
        yearsBuildings: 8,
        yearsContents: 8,
        // 4a
        excessBuildings: 250,
        excessContents: 100,
        // 4b
        accidentalBuildings: 'yes',
        accidentalContents: 'no',
        // 5a
        convictions: 'no',
        ccj: 'no',
        bankrupt: 'no',
        refused: 'no'
      };
    }
  };
})();
