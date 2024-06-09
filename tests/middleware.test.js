// tests/middleware.test.js
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');
const authenticateToken= require("../middleware/authenticateToken")

describe('authenticateToken Middleware', function() {
  let verifyStub;

  before(() => {
    // Stub the jwt.verify method to always call the callback with null error
    verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => callback(null, { userId: '123' }));
  });

  after(() => {
    // Restore the original jwt.verify function
    verifyStub.restore();
  });

  it('should validate token and call next()', function(done) {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/protected-route',
      headers: {
        Authorization: 'Bearer validtoken123'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.fake();

    authenticateToken(req, res, next);

    sinon.assert.calledOnce(next);
    done();
  });
});