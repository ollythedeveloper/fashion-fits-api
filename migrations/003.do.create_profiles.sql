CREATE TABLE profiles (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    profiletype_id INTEGER
        REFERENCES profile_types(id) ON DELETE SET NULL,
    region_id INTEGER
        REFERENCES regions(id) ON DELETE SET NULL,
    fit TEXT NOT NULL,
    category TEXT NOT NULL,
    number_sizes TEXT [7] NOT NULL,
    results TEXT NOT NULL
);