function makeProfileTypesArray() {
  return [
    {
      id: 1,
      name: 'First Name',
      bust: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      waist: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      hips: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
    },
    {
      id: 2,
      name: 'Second Name',
      bust: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      waist: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      hips: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
    },
    {
      id: 3,
      name: 'Third Name',
      bust: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      waist: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      hips: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
    },
  ];
}

function makeMaliciousProfileType() {
  const maliciousProfileType = {
    id: 911,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    bust: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
    waist: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
    hips: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
  };
  const expectedProfileType = {
    ...maliciousProfileType,
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  };
  return {
    maliciousProfileType,
    expectedProfileType,
  };
}

module.exports = {
  makeProfileTypesArray,
  makeMaliciousProfileType,
};
