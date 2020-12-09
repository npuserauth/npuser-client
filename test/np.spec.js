const NoPasswordAuthorizer = require('../dist/index')
const nock = require('nock')
const expect = require('chai').expect

const hostUrl = 'http://localhost:27001'
const emailAddress = 'bg@g.c'

function constructNP () {
  return new NoPasswordAuthorizer({
    baseUrl: hostUrl,
    clientId: 'client id with np user',
    sharedSecretKey: 'some secret shared with np user',
    dev: true
  })
}

function authResponse () {
  return {
    message: 'Nock User auth request',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJnQGcuYyIsImNvZGUiOiI3NzAwNSIsImlhdCI6MTYwMTMyNzI0MCwiZXhwIjoxNjAxMzI3MzAwfQ.JmP7f2GOfUFq13bJ2GuHka7P72rEXyZ8LMk94XaqwTQ'
  }
}

const validationToken = 'tbd'
const code = 'tbd'

describe('Constructor test', () => {
  it('Should be able to create an instance', () => {
    const np = constructNP()
    expect(typeof np).to.equal('object')
  })
})

describe('Send auth request', () => {
  it('should be able to post auth', async () => {
    const np = constructNP()
    nock(hostUrl)
      .post('/apiuser')
      .reply(200, authResponse())

    const r = await np.sendAuth(emailAddress)
    // eslint-disable-next-line no-unused-expressions
    expect(r).exist
  })
})

describe('Send validation request', () => {
  it('should be about to post validation', async () => {
    const np = constructNP()
    nock(hostUrl)
      .post('/apiuser/validate')
      .reply(200, authResponse())

    const v = await np.sendValidation(emailAddress, validationToken, code)
    // eslint-disable-next-line no-unused-expressions
    expect(v).exist
  })
})
