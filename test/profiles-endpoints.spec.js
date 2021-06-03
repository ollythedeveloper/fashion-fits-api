const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const {
  makeRegion, makeProfileType, makeProfilesArray, makeMaliciousProfile,
} = require('./profiles.fixtures');

describe('Profiles Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE profiles, profiles RESTART IDENTITY CASCADE'));
  before('clean profiletypes', () => db.raw('TRUNCATE profile_types, profiles RESTART IDENTITY CASCADE'));
  before('clean regions', () => db.raw('TRUNCATE regions, profiles RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE profiles, profiles RESTART IDENTITY CASCADE'));
  afterEach('clean profiletypes', () => db.raw('TRUNCATE profile_types, profiles RESTART IDENTITY CASCADE'));
  afterEach('clean regions', () => db.raw('TRUNCATE regions, profiles RESTART IDENTITY CASCADE'));

  describe('GET /api/profiles', () => {
    context('Given no profiles', () => {
      it('responds with 200 and a empty list', () => supertest(app)
        .get('/api/profiles')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, []));
    });
  });
});
