ALTER TABLE profiles
    DROP COLUMN profiletype_id;
ALTER TABLE profiles
    DROP COLUMN region_id;
DROP TABLE IF EXISTS profiles;