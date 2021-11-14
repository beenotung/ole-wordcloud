import {Component} from '@angular/core';
import {AlertController} from "@ionic/angular";
import {RoomService} from "../room.service";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  title = 'Create Room'

  roomName = ''
  questions: { text: string }[] = [{text: ''}]

  constructor(
    public alertController: AlertController,
    public roomService: RoomService,
  ) {
  }

  addQuestion() {
    this.questions = this.questions.filter(question => question.text.trim().length > 0)
    this.questions.push({text: ''})
  }

  checkQuestion(text: string, i: number) {
    let isLast = i === this.questions.length - 1
    if (text.length > 0 && isLast) {
      this.addQuestion()
      return
    }
    if (text.length === 0 && !isLast) {
      this.removeQuestion(i)
    }
  }

  removeQuestion(i: number) {
    this.questions.splice(i, i)
  }

  submit() {
    return this.roomService.createRoom(
      this.roomName,
      this.questions.map(question => question.text)
    )
  }
}
