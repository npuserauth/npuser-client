import jwt from 'jsonwebtoken'
import http from 'http'
import https from 'https'

export type NoPasswordAuthorizerConfig = {
    baseUrl: string; // http://localhost:27001 without trailing slash
    verbose: boolean; // default (undefined) is to not be verbose
    clientId: string;
    sharedSecretKey: string;
    dev: boolean;
}

export type AuthResponsePacket = {
    message: string;
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
  private readonly verbose: boolean;
  private readonly authUrl: URL;
  private readonly validationUrl: URL;

  constructor (props: NoPasswordAuthorizerConfig) {
    this.cfg = props
    this.verbose = props.verbose || false
    let base = this.cfg.baseUrl
    if (base.charAt(base.length - 1) === '/') {
      throw new Error(`NP User Client invalid configuration. Do not add trailing slash to url ${base}`)
    }
    try {
      base += '/' + URL_BASE_PATH
      this.authUrl = new URL(base)
      this.validationUrl = new URL(base + '/' + URL_VALIDATE_SUBPATH)
    } catch (e) {
      throw new Error(`NP User Client invalid baseUrl in configuration. ${base}`)
    }
    if (this.verbose) console.log('NPUser-client authUrl ', this.authUrl.href)
  }

  async sendPost (url: URL, payload): Promise<object> {
    const opts = { method: 'POST' }
    const { clientId, sharedSecretKey } = this.cfg
    if (this.verbose) console.log('NPUser-client sendPost to', url.href)
    return new Promise((resolve, reject) => {
      const transport = url.protocol === 'https:' ? https : http
      const request = transport.request(url, opts, response => {
        let str = ''
        response.on('data', chunk => {
          str += chunk
        })

        response.on('end', () => {
          let json
          if (str.length > 0) {
            try {
              json = JSON.parse(str)
              if (this.verbose) console.log('NPUser-client recv on-end', json)
            } catch (error) {
              if (this.verbose) console.log('NPUser-client. Error parsing response', str)
              return reject(error)
            }
          } else {
            console.log('No response to np user client request')
            reject(new Error('No response to np user client request'))
          }
          resolve(json)
        })
      })
      const signedPayload = {
        clientId: clientId,
        data: jwt.sign(payload, sharedSecretKey)
      }
      if (this.verbose) console.log('NPUser-client sending: ', signedPayload)
      request.on('error', (error) => {
        console.error('NPUser-client request ERROR:', error.message)
      })
      request.setHeader('Content-Type', 'application/json')
      request.write(JSON.stringify(signedPayload))
      request.end()
    })
  }

  async sendAuth (userEmailAddress): Promise<AuthResponsePacket> {
    const authRequest: AuthRequestPacket = { email: userEmailAddress }
    const url = this.authUrl
    const authResponsePacket: AuthResponsePacket = await this.sendPost(url, authRequest) as AuthResponsePacket
    if (this.verbose) console.log('NPUser-client sent auth request to url', url.href, authResponsePacket)
    return authResponsePacket
  }

  async sendValidation (userEmailAddress, token, vCode) {
    const validateRequest: ValidationRequestPacket = {
      email: userEmailAddress,
      code: vCode,
      token: token
    }
    const validateResponsePacket = await this.sendPost(this.validationUrl, validateRequest)
    if (this.verbose) console.log('NPUser-client sent validate got: ', validateResponsePacket)
    return validateResponsePacket
  }
}

module.exports = NoPasswordAuthorizer
