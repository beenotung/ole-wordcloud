import {Injectable} from '@angular/core';
import {AlertController, ToastController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
  }

  showError(header: string, message?: string) {
    return this.alertController
      .create({
        header,
        message,
        buttons: [{text: 'Dismiss', role: 'cancel'}]
      })
      .then(alert => alert.present())
  }

  showSuccess(message: string) {
    return this.toastController
      .create({
        message,
        duration: 5 * 1000,
        buttons: [{text: 'Dismiss', role: 'cancel'}]
      })
      .then(toast => toast.present())
  }

}
