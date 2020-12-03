import jwt from 'jsonwebtoken'
import axios, { AxiosRequestConfig } from 'axios'

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
    this.verbose = props.verbose || false
    this.cfg = props
    let base = props.baseUrl
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

  async sendPost (url: URL, payload) {
    if (this.verbose) console.log('NPUser-client sendPost to', url.href)
    const verboseDetails = this.verbose || false
    const opts: AxiosRequestConfig = {
      method: 'POST',
      url: url.href,
      data: {
        clientId: this.cfg.clientId,
        data: jwt.sign(payload, this.cfg.sharedSecretKey)
      }
    }
    return axios(opts)
      .then((response) => {
        if (verboseDetails) {
          console.log('data', response.data)
          console.log('status', response.status)
          console.log('status text', response.statusText)
          console.log('headers', response.headers)
          console.log('config', response.config)
        }
        return Promise.resolve(response.data)
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (verboseDetails) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
          }
          return Promise.reject(error.response.data)
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of http.ClientRequest in node.js
          if (verboseDetails) console.log(error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          if (verboseDetails) console.log('Error', error.message)
        }
        return Promise.reject(error.message)
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
/*
 */
