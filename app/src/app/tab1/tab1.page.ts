import {Component} from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  title = 'Create Room'

  roomName = ''
  questions: { text: string }[] = [{text: ''}]

  constructor() {
  }

  addQuestion() {
    this.questions = this.questions.filter(question => question.text)
    this.questions.push({text: ''})
  }

  submit(){

  }
}
