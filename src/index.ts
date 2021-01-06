import jwt from 'jsonwebtoken'
import axios, { AxiosRequestConfig } from 'axios'

export type NoPasswordAuthorizerConfig = {
    baseUrl: string; // http://localhost:27001 without trailing slash
    clientId: string;
    sharedSecretKey: string;
    verbose?: boolean; // default (undefined) is to not be verbose
}

export type AuthRequest = {
    email: string;
}

export type ValidationRequest = {
    email: string;
    code: string;
    token: string;
}

/**
 * Shape of the response to the auth request.  This definition is replicated in the npuser client.
 */
export type AuthResponse = {
  message: string;
  token: string;
  code?: string; // only present if testing is set true in auth request
}

/**
 * Shape of the response to the validate request.  This definition is replicated in the npuser client.
 */
export type ValidateResponse = {
  message: string;
  jwt: string;
}

const URL_BASE_PATH = 'apiuser'
const URL_VALIDATE_SUBPATH = 'validate'

export class NoPasswordAuthorizer {
  private readonly cfg: NoPasswordAuthorizerConfig;
  private readonly verbose: boolean;
  private readonly authUrl: URL;
  private readonly validationUrl: URL;

  constructor (props: NoPasswordAuthorizerConfig) {
    this.verbose = props.verbose || false
    this.cfg = props
    let base = props.baseUrl
    if (base.charAt(base.length - 1) === '/') {
      throw new Error(`npuser-client invalid configuration. Do not add trailing slash to url ${base}`)
    }
    try {
      base += '/' + URL_BASE_PATH
      this.authUrl = new URL(base)
      this.validationUrl = new URL(base + '/' + URL_VALIDATE_SUBPATH)
    } catch (e) {
      throw new Error(`npuser-client invalid baseUrl in configuration. ${base}`)
    }
    if (this.verbose) console.log('npuser-client authUrl ', this.authUrl.href)
  }

  async sendPost (url: URL, payload) {
    if (this.verbose) console.log('npuser-client sendPost to', url.href)
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
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        if (this.verbose) console.log('npuser-client error', error.message)
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          return Promise.reject(error.response)
        }
        // else
        return Promise.reject(error)
      })
  }

  async sendAuth (userEmailAddress): Promise<AuthResponse> {
    const authRequest: AuthRequest = { email: userEmailAddress }
    const url = this.authUrl
    const response: AuthResponse = await this.sendPost(url, authRequest) as AuthResponse
    if (this.verbose) console.log('npuser-client sent auth request got', response)
    return response
  }

  async sendValidation (userEmailAddress, token, vCode): Promise<ValidateResponse> {
    const url = this.validationUrl
    const vr: ValidationRequest = {
      email: userEmailAddress,
      code: vCode,
      token: token
    }
    const response:ValidateResponse = await this.sendPost(url, vr) as ValidateResponse
    if (this.verbose) console.log('npuser-client sent validate got: ', response)
    return response
  }
}
