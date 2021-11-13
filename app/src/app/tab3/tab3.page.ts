import {Component} from '@angular/core'
import {AlertController} from '@ionic/angular'
import {AccountService} from '../account.service'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  title = 'Settings'

  token = this.accountService.token

  constructor(
    public accountService: AccountService,
    public alertController: AlertController,
  ) {
  }

  ionViewDidLoad() {
    this.token = this.accountService.token
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
          text: 'Confirm', handler: () => {
            this.accountService.token = this.token
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
          text: 'Confirm', handler: () => {
            this.accountService.resetToken()
            this.token = this.accountService.token
          }
        }
      ]
    })
    await alert.present()
  }

}
