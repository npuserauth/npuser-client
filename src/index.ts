import jwt from 'jsonwebtoken'

const http = require('http')

type NoPasswordAuthorizerConfig = {
    baseUrl: string; // hhtp://localhost:27001 without trailing slash
    clientId: string;
    sharedSecretKey: string;
}

type AuthResponsePacket = {
    message: string;
    code: string; // only here temporarily for initial development only
    token: string;
}

type AuthRequestPacket = {
    email: string;
}

type ValidationRequestPacket = {
    email: string;
    code: string;
    token: string;
}

class NoPasswordAuthorizer {
    private readonly cfg: NoPasswordAuthorizerConfig;

    constructor (props: NoPasswordAuthorizerConfig) {
      this.cfg = props
    }

    async sendPost (url, payload) {
      const opts = { method: 'POST' }
      const { clientId, sharedSecretKey } = this.cfg
      return new Promise((resolve, reject) => {
        const request = http.request(url, opts, response => {
          let str = ''
          response.on('data', chunk => {
            str += chunk
          })

          response.on('end', () => {
            const json = JSON.parse(str)
            resolve(json)
          })
        })
        const signedPayload = {
          clientId: clientId,
          data: jwt.sign(payload, sharedSecretKey)
        }
        request.setHeader('Content-Type', 'application/json')
        request.write(JSON.stringify(signedPayload))
        request.end()
      })
    }

    async sendAuth (userEmailAddress): Promise<AuthResponsePacket> {
      const url = this.cfg.baseUrl + '/apiuser'
      const authRequest: AuthRequestPacket = { email: userEmailAddress }
      const d: AuthResponsePacket = await this.sendPost(url, authRequest) as AuthResponsePacket
      console.log('sent auth got: ', d)
      return d
    }

    async sendValidation (userEmailAddress, token, vCode) {
      const url = this.cfg.baseUrl + '/apiuser/validate'
      const validateRequest: ValidationRequestPacket = {
        email: userEmailAddress,
        code: vCode,
        token: token
      }
      const v = await this.sendPost(url, validateRequest)
      console.log('sent validate got: ', v)
      return v
    }
}

export default NoPasswordAuthorizer
