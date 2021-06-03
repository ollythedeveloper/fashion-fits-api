const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeRegionsArray, makeMaliciousRegion } = require('./regions.fixtures');

describe('Regions Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE regions, profiles RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE regions, profiles RESTART IDENTITY CASCADE'));

  describe('GET /api/regions', () => {
    context('Given no regions', () => {
      it('responds with 200 and a empty list', () => supertest(app)
        .get('/api/regions')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, []));
    });

    context('Given there are regions in the database', () => {
      const testRegions = makeRegionsArray();

      beforeEach('insert regions', () => db
        .into('regions')
        .insert(testRegions));

      it('GET /api/regions responds with 200 and all of the regions', () => supertest(app)
        .get('/api/regions')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testRegions));
    });

    context('Given an XSS attack region', () => {
      const { maliciousRegion, expectedRegion } = makeMaliciousRegion();

      beforeEach('insert malicious region', () => db
        .into('regions')
        .insert([maliciousRegion]));

      it('removes XSS attack content', () => supertest(app)
        .get('/api/regions')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200)
        .expect((res) => {
          expect(res.body[0].country).to.eql(expectedRegion.country);
        }));
    });
  });

  describe('GET /api/regions/:region_id', () => {
    context('Given no regions', () => {
      it('responds with 404', () => {
        const regionId = 123456;
        return supertest(app)
          .get(`/api/regions/${regionId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: 'Region Not Found' } });
      });
    });

    context('Given there are regions in the database', () => {
      const testRegions = makeRegionsArray();

      beforeEach('insert regions', () => db
        .into('regions')
        .insert(testRegions));

      it('responds with 200 and the specified region', () => {
        const regionId = 2;
        const expectedRegion = testRegions[regionId - 1];
        return supertest(app)
          .get(`/api/regions/${regionId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedRegion);
      });
    });
  });

  describe('POST /api/regions', () => {
    it('creates a region, responding with 201 and the new region', () => {
      const newRegion = {
        country: 'Test new country',
      };
      return supertest(app)
        .post('/api/regions')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(newRegion)
        .expect(201)
        .expect((res) => {
          expect(res.body.country).to.eql(newRegion.country);
          expect(res.headers.location).to.eql(`/api/regions/${res.body.id}`);
          expect(res.body).to.have.property('id');
        })
        .then((res) => supertest(app)
          .get(`/api/regions/${res.body.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(res.body));
    });
    const requiredFields = ['country'];

    requiredFields.forEach((field) => {
      const newRegion = {
        country: 'Test new country',
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newRegion[field];

        return supertest(app)
          .post('/api/regions')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(newRegion)
          .expect(400, {
            error: { message: `'${field}' is required` },
          });
      });
    });

    it('removes XSS attack content from the response', () => {
      const { maliciousRegion, expectedRegion } = makeMaliciousRegion();
      return supertest(app)
        .post('/api/regions')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(maliciousRegion)
        .expect(201)
        .expect((res) => {
          expect(res.body.country).to.eql(expectedRegion.country);
        });
    });
  });

  describe('DELETE /api/regions/:region_id', () => {
    context('Given no regions', () => {
      it('responds with 404', () => {
        const regionId = 123456;
        return supertest(app)
          .delete(`/api/regions/${regionId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: 'Region Not Found' } });
      });
    });
    context('Given there are regions in the database', () => {
      const testRegions = makeRegionsArray();

      beforeEach('insert regions', () => db
        .into('regions')
        .insert(testRegions));

      it('responds with 204 and removes the region', () => {
        const idToRemove = 2;
        const expectedRegions = testRegions.filter((region) => region.id !== idToRemove);
        return supertest(app)
          .delete(`/api/regions/${idToRemove}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .then((res) => supertest(app)
            .get('/api/regions')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(expectedRegions));
      });
    });
  });

  describe('PATCH /api/regions/:region_id', () => {
    context('Given no regions', () => {
      it('responds with 404', () => {
        const regionId = 123456;
        return supertest(app)
          .patch(`/api/regions/${regionId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: 'Region Not Found' } });
      });
    });
    context('Given there are regions in the database', () => {
      const testRegions = makeRegionsArray();

      beforeEach('insert regions', () => db
        .into('regions')
        .insert(testRegions));

      it('responds with 204 and updates the region', () => {
        const idToUpdate = 2;
        const updateRegion = {
          country: 'updated region',
        };
        const expectedRegion = {
          ...testRegions[idToUpdate - 1],
          ...updateRegion,
        };
        return supertest(app)
          .patch(`/api/regions/${idToUpdate}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(updateRegion)
          .expect(204)
          .then((res) => supertest(app)
            .get(`/api/regions/${idToUpdate}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(expectedRegion));
      });

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/regions/${idToUpdate}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send({ irrelavantField: 'boo' })
          .expect(400, {
            error: {
              message: 'Request body must contain \'country\'',
            },
          });
      });

      it('responds with 204 when updating only a subset of the fields', () => {
        const idToUpdate = 2;
        const updateRegion = {
          country: 'update the country',
        };
        const expectedRegion = {
          ...testRegions[idToUpdate - 1],
          ...updateRegion,
        };

        return supertest(app)
          .patch(`/api/regions/${idToUpdate}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send({
            ...updateRegion,
            fieldToIgnore: 'should not be in GET response',
          })
          .expect(204)
          .then((res) => supertest(app)
            .get(`/api/regions/${idToUpdate}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(expectedRegion));
      });
    });
  });
});
