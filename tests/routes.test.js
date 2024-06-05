const app = require('../server'); // Import  Express app
const request = require('supertest');
const expect = require('chai').expect;

describe('POST /api/register', function() {
  it('should register a new user and return 201', function(done) {
    request(app)
      .post('/v1/api/register')
      .send({
        firstName: 'Kato',
        lastName: 'Steven',
        email: 'kato.steven70@gmail.com',
        phoneNumber: '0758541682',
        username: 'mubiru123',
        password: 'password123',
        role: 'client'
      })
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property('message', 'User registered successfully');
        done();
      });
  });
});

