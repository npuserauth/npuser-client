import NoPasswordAuthorizer from '../src/index'
const nock = require('nock');
const expect = require('chai').expect;

const hostUrl = 'http://localhost:27001'
const emailAddress = 'bg@g.c'

function constructNP() {
  return new NoPasswordAuthorizer({
    baseUrl: hostUrl,
    clientId: 'client id with np user',
    sharedSecretKey: 'some secret shared with np user'
  })
}

function authResponse() {
  return {
    message: 'Nock User auth request',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJnQGcuYyIsImNvZGUiOiI3NzAwNSIsImlhdCI6MTYwMTMyNzI0MCwiZXhwIjoxNjAxMzI3MzAwfQ.JmP7f2GOfUFq13bJ2GuHka7P72rEXyZ8LMk94XaqwTQ'
  }
}

describe('Constructor test', () => {

  it('Should be able to create an instance', () => {
    let np = constructNP()
    expect(typeof np).to.equal('object')
  });
})

describe('Send auth request', () => {

  it ('should be about to post auth', async () => {
    let np = constructNP()
    nock(hostUrl)
      .post('/apiuser')
      .reply(200, authResponse());

    const r = await np.sendAuth(emailAddress)
    expect(r).exist
  })
});

