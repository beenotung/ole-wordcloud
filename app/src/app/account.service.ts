import {Injectable} from '@angular/core'
import {randomToken} from '../utils'

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private _token: string

  constructor() {
    this._token = localStorage.getItem('token')
    if (!this._token) {
      this._token = randomToken()
      localStorage.setItem('token', this._token)
    }
  }

  get token() {
    return this._token
  }

  set token(value: string) {
    this._token = value
    localStorage.setItem('token', this._token)
  }


  resetToken() {
    this.token = randomToken()
    localStorage.setItem('token', this.token)
  }
}
