import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {AccountService} from './account.service'
import {APIResponse, GetRoomResponse, MyRoomListResponse, NewRoom} from '../types'
import {NoticeService} from './notice.service'

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  origin: string

  constructor(
    private http: HttpClient,
    private noticeService: NoticeService,
    private accountService: AccountService,
  ) {
    const origin = location.origin
    if (origin.endsWith(':4200')) {
      this.origin = origin.replace(':4200', ':3000')
    } else {
      this.origin = 'https://ole-wordcloud.fduat.com'
    }
    this.origin += '/api'
  }

  createRoom(roomName: string, questions: string[]) {
    roomName = roomName.trim()
    questions = questions.map(text => text.trim()).filter(text => text.length > 0)
    const missingFields: string[] = []
    if (!roomName) {
      missingFields.push('room name')
    }
    if (questions.length === 0) {
      missingFields.push('questions')
    }
    if (missingFields.length > 0) {
      return this.noticeService.showError('Cannot create room',
        'Missing ' + missingFields.join('and '))
    }
    const room: NewRoom = {
      name: roomName,
      questions,
      ownerToken: this.accountService.token,
    }
    return this.http.post(this.origin + '/room', {room})
      .toPromise()
      .then((json: APIResponse) => {
        if (json.error) {
          return this.noticeService.showError('Failed to create room', json.error)
        } else {
          return this.noticeService.showSuccess('Created room')
        }
      })
  }

  getMyRooms() {
    return this.http.get(this.origin + '/room/my-list', {params: {token: this.accountService.token}})
      .toPromise()
      .catch(toError) as Promise<MyRoomListResponse>
  }

  getRoom(code: string) {
    return this.http.get(this.origin + '/room', {
      params: {
        code,
        token: this.accountService.token
      }
    })
      .toPromise()
      .catch(toError) as Promise<GetRoomResponse>
  }

  deleteRoom(room_id: number) {
    return this.http.delete(this.origin + '/room', {params: {room_id, token: this.accountService.token}})
      .toPromise()
      .catch(toError)
  }

  submitResponse(
    code: string,
    question: string,
    response: string,
  ) {
    return this.http.post(this.origin + '/room/response?token=' + this.accountService.token + '&room_code=' + code, {
      question,
      response,
    }).toPromise()
      .catch(toError)
  }
}

function toError(error: any) {
  return {error: error?.error?.message || error.message || error.toString()}
}
