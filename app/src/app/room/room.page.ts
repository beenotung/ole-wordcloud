import {Component, ElementRef, OnInit} from '@angular/core'
import {APIResponse, GetRoomResponse} from '../../types'
import {ActivatedRoute} from '@angular/router'
import {RoomService} from '../room.service'
import {NoticeService} from '../notice.service'
// @ts-ignore
import * as WordCloud from 'wordcloud/src/wordcloud2.js'

console.log('WordCloud:', WordCloud)

type WordItem = GetRoomResponse['room']['questions'][number]['word_list'][number]

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  room?: GetRoomResponse['room']
  code?: string
  roomUrl?: string

  items: {
    question: string;
    response: string;
    word_list_text: string | null;
  }[] = []

  mutationObserver?: MutationObserver


  constructor(
    public route: ActivatedRoute,
    public roomService: RoomService,
    public noticeService: NoticeService,
    public elementRef: ElementRef,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.code = params.code
      this.roomUrl = location.href
      return this.refresh()
    })
  }

  renderCanvas(){
    const elements = this.elementRef.nativeElement.querySelector('ion-content')
      .querySelectorAll('[data-index]')
    elements.forEach(element => {
      const canvas = element as HTMLCanvasElement
      const rect = canvas.parentElement.getBoundingClientRect()
      const width = Math.floor(rect.width * 0.9)
      const height = Math.floor(width * 3 / 4)
      canvas.width = width
      canvas.height = height
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      const list = JSON.parse(canvas.dataset.list)
      console.log('list:', list)
      WordCloud(canvas, {
        list,
        hover: (item: WordItem) => {
          console.log('hover:', item)
        },
        click: (item: WordItem) => {
          console.log('click:', item)
        },
      })
      console.log('canvas:', canvas)
    })
  }

  ionViewDidEnter() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
    }
    this.mutationObserver = new MutationObserver(mutations => {
      this.renderCanvas()
    })
    this.mutationObserver.observe(this.elementRef.nativeElement, {
      childList: true,
      attributes: true,
      characterData: true,
    })
    this.mutationObserver.observe(this.elementRef.nativeElement.querySelector('ion-content'), {
      childList: true,
      attributes: true,
      characterData: true,
    })
  }

  ionViewDidLeave() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      delete this.mutationObserver
    }
  }


  refresh() {
    if (!this.code) {
      return
    }
    // location.reload()
    return this.roomService.getRoom(this.code)
      .then(json => {
        if (json.error) {
          return this.noticeService.showError('Failed to load room', json.error)
        } else {
          this.room = json.room
          this.items = this.room.questions.map(question => ({
            question: question.question,
            response: '',
            word_list_text: question.word_list ? JSON.stringify(question.word_list) : null
          }))
          setTimeout(() => {
            this.renderCanvas()
          })
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
        }
      })
  }

}
