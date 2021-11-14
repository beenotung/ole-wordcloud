import {Component, OnInit} from '@angular/core'
import {APIResponse, GetRoomResponse} from '../../types'
import {ActivatedRoute} from '@angular/router'
import {RoomService} from '../room.service'
import {NoticeService} from '../notice.service'

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  room?: GetRoomResponse['room']
  code?: string

  items: {
    question: string;
    response: string;
    responses: string[];
  }[] = []

  constructor(
    public route: ActivatedRoute,
    public roomService: RoomService,
    public noticeService: NoticeService,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.code = params.code
      return this.refresh()
    })
  }

  refresh() {
    if (!this.code) {
      return
    }
    return this.roomService.getRoom(this.code)
      .then(json => {
        if (json.error) {
          return this.noticeService.showError('Failed to load room', json.error)
        } else {
          this.room = json.room
          this.items = this.room.questions.map(question => ({
            question: question.question,
            response: '',
            responses: question.responses,
          }))
        }
      })
  }

  submit(item: RoomPage['items'][number]) {
    if (!this.code) {
      return
    }
    return this.roomService.submitResponse(this.code, item.question, item.response)
      .then((json: APIResponse) => {
        if (json.error) {
          return this.noticeService.showError('Failed to submit response', json.error)
        } else {
          return this.noticeService.showSuccess('Submitted response')
            .then(()=>this.refresh())
        }
      })
  }

}
