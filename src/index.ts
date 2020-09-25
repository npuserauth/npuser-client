import jwt from 'jsonwebtoken'
import http from 'http'

export function signPayload (payloadObject, clientId,  sharedSecretKeyString) {
  let tkn = jwt.sign(payloadObject, sharedSecretKeyString)
  return {clientId: clientId, data: tkn}
}

async function send (opts, payload, clientId,  sharedSecretKeyString) {
  return new Promise((resolve, reject) => {
    const request = http.request(opts, response => {
      let str = ''
      response.on('data', chunk => {
        str += chunk
      })

      response.on('end', () => {
        const json = JSON.parse(str)
        resolve(json)
      })
    })
    request.setHeader('Content-Type', 'application/json')
    request.write(signPayload(payload, clientId,  sharedSecretKeyString))
    request.end()
  })
}
type AuthResponsePacket = {
  message: string;
  code: string; // only here temporarily for initial development only
  token: string;
}

type AuthRequestPacket = {
  email: string;
}

async function sendAuth (userEmailAddress, clientId,  sharedSecretKeyString): AuthResponsePacket {
  const opts = {
    host: 'localhost',
    path: '/apiuser',
    port: '27001',
    method: 'POST'
  }
  const authRequest: AuthRequestPacket = {email: userEmailAddress}
  const d: AuthResponsePacket = await send(opts, authRequest, clientId, sharedSecretKeyString) as AuthResponsePacket
  console.log('sent auth got: ', d)
  // To invalidate the request send a bogus v code
  // d.vcode = 'ddd'
  return d
}

async function sendValidation(userEmailAddress, token, vCode, clientId,  sharedSecretKeyString) {
  // Take the results and extract the jwt. Also get the for-dev-only vcode.
  // Send the jwt and vcode (which will eventually be provided by the user reading their email)
  const validatePayload = {jwt: d.jwt, code: d.vcode}
  console.log('send validation payload', validatePayload)
  const opts2 = Object.assign(opts)
  opts2.path = '/apiuser/validate'
  const v = await send(opts2, validatePayload, clientId,  sharedSecretKeyString)
  // console.log('sent validate got: ', v)
  return v
}

async function f1 () {
  const clientId = "client id with np user"
  const sharedSecretKeyString ="some secret shared with np user"
  const d = await sendAuth('bg@g.c', clientId,  sharedSecretKeyString)
  console.log('f1 ', d)
}

f1()
