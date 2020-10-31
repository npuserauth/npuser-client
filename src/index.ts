import jwt from 'jsonwebtoken'
import http from 'http'
import https from 'https'

export type NoPasswordAuthorizerConfig = {
    baseUrl: string; // http://localhost:27001 without trailing slash
    silent: boolean; // default is to not show debug messages on console
    clientId: string;
    sharedSecretKey: string;
    dev: boolean;
}

export type AuthResponsePacket = {
    message: string;
    code: string; // only here temporarily for initial development only
    token: string;
}

export type AuthRequestPacket = {
    email: string;
}

export type ValidationRequestPacket = {
    email: string;
    code: string;
    token: string;
}

const URL_BASE_PATH = 'apiuser'
const URL_VALIDATE_SUBPATH = 'validate'

class NoPasswordAuthorizer {
  private readonly cfg: NoPasswordAuthorizerConfig;
  private readonly debug: boolean;
  private readonly baseUrl: string;

  constructor (props: NoPasswordAuthorizerConfig) {
    this.cfg = props
    this.debug = props.silent !== undefined ? !props.silent : false
    console.log('npuser create url for dev or prod: ', props.dev ? 'dev' : 'prod')
    if (props.dev) {
      this.baseUrl = this.cfg.baseUrl + '/' + URL_BASE_PATH
    } else {
      this.baseUrl = this.cfg.baseUrl + '/api/' + URL_BASE_PATH
    }
  }

  async sendPost (url: string, payload) {
    const opts = { method: 'POST' }
    const { clientId, sharedSecretKey } = this.cfg
    console.log('npuser sendPost to', url)
    return new Promise((resolve, reject) => {
      const purl = new URL(url)
      const transport = purl.protocol === 'https:' ? https : http
      const request = transport.request(url, opts, response => {
        let str = ''
        response.on('data', chunk => {
          console.log('npuser recv on-data', chunk)
          str += chunk
        })

        response.on('end', () => {
          console.log('npuser recv on-end', str)
          const json = JSON.parse(str)
          resolve(json)
        })
      })
      const signedPayload = {
        clientId: clientId,
        data: jwt.sign(payload, sharedSecretKey)
      }
      if (this.debug) console.log('npuser client sending: ', signedPayload)
      request.setHeader('Content-Type', 'application/json')
      request.write(JSON.stringify(signedPayload))
      request.end()
    })
  }

  async sendAuth (userEmailAddress): Promise<AuthResponsePacket> {
    const authRequest: AuthRequestPacket = { email: userEmailAddress }
    const url = this.baseUrl
    const authResponsePacket: AuthResponsePacket = await this.sendPost(url, authRequest) as AuthResponsePacket
    if (this.debug) {
      console.log('npuser client sent request to url', this.baseUrl)
      console.log('npuser client seeks to authorize', userEmailAddress)
      console.log('npuser client sent auth got: ', authResponsePacket)
    }
    return authResponsePacket
  }

  async sendValidation (userEmailAddress, token, vCode) {
    const url = this.baseUrl + '/' + URL_VALIDATE_SUBPATH
    const validateRequest: ValidationRequestPacket = {
      email: userEmailAddress,
      code: vCode,
      token: token
    }
    const validateResponsePacket = await this.sendPost(url, validateRequest)
    if (this.debug) console.log('npuser client sent validate got: ', validateResponsePacket)
    return validateResponsePacket
  }
}

module.exports = NoPasswordAuthorizer
