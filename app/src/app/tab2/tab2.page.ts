import {Component} from '@angular/core'
import {NoticeService} from '../notice.service'
import {Router} from '@angular/router'

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  title = 'Join Room'
  roomCode = ''
  isScanning = false

  constructor(
    public noticeService: NoticeService,
    public router: Router,
  ) {
  }

  ionViewDidLeave() {

  }

  ionViewDidEnter() {

  }

  scan() {
    this.isScanning = true
  }

  scanSuccess(code: string) {
    if(code.includes('?')){
      let params = new URLSearchParams(code.slice(code.indexOf('?')))
      code = params.get('code') || code
    }
    this.roomCode = code
    this.isScanning = false
  }

  joinRoom() {
    const code = this.roomCode.trim()
    if (!code) {
      return this.noticeService.showError('Cannot join room', 'Missing room code. Please input or scan the room code.')
    }
    return this.router.navigate(['/room',], {queryParams: {code}})
  }
}
