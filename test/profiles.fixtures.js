function makeRegion() {
  return [
    {
      id: 1,
      country: 'ProfileTest Country',
    },
  ];
}

function makeProfileType() {
  return [
    {
      id: 1,
      name: 'ProfileTest ProfileType',
      bust: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      waist: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      hips: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
    },
  ];
}

function makeProfilesArray() {
  return [
    {
      id: 1,
      profiletype_id: 1,
      region_id: 1,
      fit: 'Test - Fit 1',
      category: 'Cat1',
      number_sizes: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      results: 'the results 1',
    },
    {
      id: 2,
      profiletype_id: 1,
      region_id: 1,
      fit: 'Test - Fit 2',
      category: 'Cat2',
      number_sizes: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      results: 'the results 2',
    },
    {
      id: 3,
      profiletype_id: 1,
      region_id: 1,
      fit: 'Test - Fit 3',
      category: 'Cat3',
      number_sizes: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      results: 'the results 3',
    },
  ];
}

function makeMaliciousProfile() {
  const maliciousProfile = {
    id: 911,
    profiletype_id: 1,
    region_id: 1,
    fit: 'Test - Malicious',
    category: 'Cat911',
    number_sizes: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
    results: 'Naughty naughty very naughty <script>alert("xss");</script>',
  };
  const expectedProfile = {
    ...maliciousProfile,
    results: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  };
  return {
    maliciousProfile,
    expectedProfile,
  };
}

module.exports = {
  makeRegion,
  makeProfileType,
  makeProfilesArray,
  makeMaliciousProfile,
};
