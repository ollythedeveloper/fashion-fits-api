function makeRegionsArray() {
    return [
        {
            id: 1,
            country: 'First Country'
        },
        {
            id: 2,
            country: 'Second Country'
        },
        {
            id: 3,
            country: 'Third Country'
        }
    ];
}

function makeMaliciousRegion() {
    const maliciousRegion = {
        id: 911,
        country: 'Naughty naughty very naughty <script>alert("xss");</script>'
    }
    const expectedRegion = {
        ...maliciousRegion,
        country: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
    }
    return {
        maliciousRegion,
        expectedRegion
    }
}

module.exports = {
    makeRegionsArray,
    makeMaliciousRegion
}