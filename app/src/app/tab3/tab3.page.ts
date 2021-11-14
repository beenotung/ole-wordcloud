import {Component} from '@angular/core'
import {AlertController} from '@ionic/angular'
import {AccountService} from '../account.service'
import {APIResponse, MyRoomListResponse} from '../../types'
import {RoomService} from '../room.service'
import {NoticeService} from '../notice.service'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  title = 'Settings'

  token = this.accountService.token

  myRooms?: MyRoomListResponse['rooms']

  constructor(
    public accountService: AccountService,
    public roomService: RoomService,
    public alertController: AlertController,
    public noticeService: NoticeService,
  ) {
  }

  ionViewDidEnter() {
    this.token = this.accountService.token
    return this.loadRooms()
  }

  loadRooms() {
    return this.roomService.getMyRooms().then(json => {
      if (json.error) {
        return this.noticeService.showError('Failed to load my rooms', json.error)
      } else {
        this.myRooms = json.rooms
      }
    })
  }

  canSave() {
    return this.token !== this.accountService.token
  }

  async saveToken() {
    const alert = await this.alertController.create({
      header: 'Confirm to change token?',
      message: 'This will switch your account.',
      buttons: [
        {text: 'Cancel', role: 'cancel'},
        {
          text: 'Change Token', handler: () => {
            this.accountService.token = this.token
            return this.loadRooms()
          }
        }
      ]
    })
    await alert.present()
  }

  async resetToken() {
    const alert = await this.alertController.create({
      header: 'Confirm to reset token?',
      message: 'This will reset your account.',
      buttons: [
        {text: 'Cancel', role: 'cancel'},
        {
          text: 'Reset Token', handler: () => {
            this.accountService.resetToken()
            this.token = this.accountService.token
          }
        }
      ]
    })
    await alert.present()
  }

  deleteRoom(room: MyRoomListResponse['rooms'][number]) {
    return this.alertController.create({
      header: 'Confirm to delete room?',
      message: 'Room ' + room.name + ' will be deleted',
      buttons: [
        {text: 'Cancel', role: 'cancel'},
        {
          text: 'Delete Room',
          handler: () => this.roomService.deleteRoom(room.id)
            .then((json: APIResponse) => {
              if (json.error) {
                return this.noticeService.showError('Failed to delete room', json.error)
              } else {
                this.myRooms.splice(this.myRooms.indexOf(room))
                return this.noticeService.showSuccess('Deleted room')
              }
            })
        }
      ]
    })
      .then(alert => alert.present())
  }

}
