const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeProfileTypesArray, makeMaliciousProfileType } = require('./profileTypes.fixtures');

describe('ProfileTypes Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE profile_types, profiles RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE profile_types, profiles RESTART IDENTITY CASCADE'));

  describe('GET /api/profileTypes', () => {
    context('Given no profileTypes', () => {
      it('responds with 200 and a empty list', () => supertest(app)
        .get('/api/profileTypes')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, []));
    });

    context('Given there are profileTypes in the database', () => {
      const testProfileTypes = makeProfileTypesArray();

      beforeEach('insert profileTypes', () => db
        .into('profile_types')
        .insert(testProfileTypes));

      it('GET /api/profileTypes responds with 200 and all of the profileTypes', () => supertest(app)
        .get('/api/profileTypes')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testProfileTypes));
    });

    context('Given an XSS attack profileType', () => {
      const { maliciousProfileType, expectedProfileType } = makeMaliciousProfileType();

      beforeEach('insert malicious profileType', () => db
        .into('profile_types')
        .insert([maliciousProfileType]));

      it('removes XSS attack content', () => supertest(app)
        .get('/api/profileTypes')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200)
        .expect((res) => {
          expect(res.body[0].name).to.eql(expectedProfileType.name);
        }));
    });
  });

  describe('GET /api/profileTypes/:profileType_id', () => {
    context('Given no profileTypes', () => {
      it('responds with 404', () => {
        const profileTypeId = 123456;
        return supertest(app)
          .get(`/api/profileTypes/${profileTypeId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: 'ProfileType Not Found' } });
      });
    });

    context('Given there are profileTypes in the database', () => {
      const testProfileTypes = makeProfileTypesArray();

      beforeEach('insert profileTypes', () => db
        .into('profile_types')
        .insert(testProfileTypes));

      it('responds with 200 and the specified profileType', () => {
        const profileTypeId = 2;
        const expectedProfileType = testProfileTypes[profileTypeId - 1];
        return supertest(app)
          .get(`/api/profileTypes/${profileTypeId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedProfileType);
      });
    });
  });

  describe('POST /api/profileTypes', () => {
    it('creates a profileType, responding with 201 and the new profileType', () => {
      const newProfileType = {
        name: 'Test new name',
        bust: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
        waist: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
        hips: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      };
      return supertest(app)
        .post('/api/profileTypes')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(newProfileType)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(newProfileType.name);
          expect(res.body.bust).to.eql(newProfileType.bust);
          expect(res.body.waist).to.eql(newProfileType.waist);
          expect(res.body.hips).to.eql(newProfileType.hips);
          expect(res.headers.location).to.eql(`/api/profileTypes/${res.body.id}`);
          expect(res.body).to.have.property('id');
        })
        .then((res) => supertest(app)
          .get(`/api/profileTypes/${res.body.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(res.body));
    });
    const requiredFields = ['name', 'bust', 'waist', 'hips'];

    requiredFields.forEach((field) => {
      const newProfileType = {
        name: 'Test new name',
        bust: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
        waist: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
        hips: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'],
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newProfileType[field];

        return supertest(app)
          .post('/api/profileTypes')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(newProfileType)
          .expect(400, {
            error: { message: `'${field}' is required` },
          });
      });
    });

    it('removes XSS attack content from the response', () => {
      const { maliciousProfileType, expectedProfileType } = makeMaliciousProfileType();
      return supertest(app)
        .post('/api/profileTypes')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(maliciousProfileType)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(expectedProfileType.name);
        });
    });
  });

  describe('DELETE /api/profileTypes/:profileType_id', () => {
    context('Given no profileTypes', () => {
      it('responds with 404', () => {
        const profileTypeId = 123456;
        return supertest(app)
          .delete(`/api/profileTypes/${profileTypeId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: 'ProfileType Not Found' } });
      });
    });
    context('Given there are profileTypes in the database', () => {
      const testProfileTypes = makeProfileTypesArray();

      beforeEach('insert profileTypes', () => db
        .into('profile_types')
        .insert(testProfileTypes));

      it('responds with 204 and removes the profileType', () => {
        const idToRemove = 2;
        const expectedProfileTypes = testProfileTypes.filter((profileType) => profileType.id !== idToRemove);
        return supertest(app)
          .delete(`/api/profileTypes/${idToRemove}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .then((res) => supertest(app)
            .get('/api/profileTypes')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(expectedProfileTypes));
      });
    });
  });

  describe('PATCH /api/profileTypes/:profileType_id', () => {
    context('Given no profileTypes', () => {
      it('responds with 404', () => {
        const profileTypeId = 123456;
        return supertest(app)
          .patch(`/api/profileTypes/${profileTypeId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: 'ProfileType Not Found' } });
      });
    });
    context('Given there are profileTypes in the database', () => {
      const testProfileTypes = makeProfileTypesArray();

      beforeEach('insert profileTypes', () => db
        .into('profile_types')
        .insert(testProfileTypes));

      it('responds with 204 and updates the profileType', () => {
        const idToUpdate = 2;
        const updateProfileType = {
          name: 'updated name',
        };
        const expectedProfileType = {
          ...testProfileTypes[idToUpdate - 1],
          ...updateProfileType,
        };
        return supertest(app)
          .patch(`/api/profileTypes/${idToUpdate}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(updateProfileType)
          .expect(204)
          .then((res) => supertest(app)
            .get(`/api/profileTypes/${idToUpdate}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(expectedProfileType));
      });

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/profileTypes/${idToUpdate}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send({ irrelavantField: 'boo' })
          .expect(400, {
            error: {
              message: 'Request body must contain either \'name\', \'bust\', \'waist\' or \'hips\'',
            },
          });
      });

      it('responds with 204 when updating only a subset of the fields', () => {
        const idToUpdate = 2;
        const updateProfileType = {
          name: 'update the name',
        };
        const expectedProfileType = {
          ...testProfileTypes[idToUpdate - 1],
          ...updateProfileType,
        };

        return supertest(app)
          .patch(`/api/profileTypes/${idToUpdate}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send({
            ...updateProfileType,
            fieldToIgnore: 'should not be in GET response',
          })
          .expect(204)
          .then((res) => supertest(app)
            .get(`/api/profileTypes/${idToUpdate}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(expectedProfileType));
      });
    });
  });
});
