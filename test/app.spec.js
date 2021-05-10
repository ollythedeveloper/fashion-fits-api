const app = require('../src/app')

describe('App', () => {
    it('GET / responds with 200 containing "Welcome to the Fashion Fits API!"', () => {
        return supertest(app)
        .get('/')
        .expect(200, 'Welcome to the Fashion Fits API!')
    })
})