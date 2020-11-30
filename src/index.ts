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
  private readonly baseUrl: string;

  constructor (props: NoPasswordAuthorizerConfig) {
    this.cfg = props
    this.verbose = props.verbose || false
    if (this.verbose) console.log('npuser create url for dev or prod: ', props.dev ? 'dev' : 'prod')
    if (props.dev) {
      this.baseUrl = this.cfg.baseUrl + '/' + URL_BASE_PATH
    } else {
      this.baseUrl = this.cfg.baseUrl + '/api/' + URL_BASE_PATH
    }
  }

  async sendPost (url: string, payload): Promise<object> {
    const opts = { method: 'POST' }
    const { clientId, sharedSecretKey } = this.cfg
    if (this.verbose) console.log('npuser-client sendPost to', url)
    return new Promise((resolve, reject) => {
      const purl = new URL(url)
      const transport = purl.protocol === 'https:' ? https : http
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
              if (this.verbose) console.log('npuser-client recv on-end', json)
            } catch (error) {
              console.log('npuser-client. Error parsing response', str)
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
      if (this.verbose) console.log('npuser-client sending: ', signedPayload)
      request.on('error', (error) => {
        console.error('npuser-client request ERROR:', error.message)
      })
      request.setHeader('Content-Type', 'application/json')
      request.write(JSON.stringify(signedPayload))
      request.end()
    })
  }

  async sendAuth (userEmailAddress): Promise<AuthResponsePacket> {
    const authRequest: AuthRequestPacket = { email: userEmailAddress }
    const url = this.baseUrl
    const authResponsePacket: AuthResponsePacket = await this.sendPost(url, authRequest) as AuthResponsePacket
    if (this.verbose) console.log('npuser-client sent auith request to url', this.baseUrl, authResponsePacket)
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
    if (this.verbose) console.log('npuser-client sent validate got: ', validateResponsePacket)
    return validateResponsePacket
  }
}

module.exports = NoPasswordAuthorizer
