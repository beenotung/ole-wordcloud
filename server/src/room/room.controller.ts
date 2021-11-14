import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query
} from '@nestjs/common'
import {
  APIResponse,
  GetRoomResponse,
  MyRoomListResponse,
  NewRoom,
  NewRoomResponse
} from '../types'
import { collection, db, dict, Room } from '../data'
import { randomCode } from '../utils'
import { countWords } from '../wordcloud'

@Controller('room')
export class RoomController {
  @Post('/')
  createRoom(@Body('room') room: NewRoom): NewRoomResponse {
    const { name, questions, ownerToken } = room
    if (!name) {
      throw new HttpException('Missing room.name', HttpStatus.BAD_REQUEST)
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new HttpException('Missing room.questions', HttpStatus.BAD_REQUEST)
    }
    if (!ownerToken) {
      throw new HttpException('Missing room.ownerToken', HttpStatus.BAD_REQUEST)
    }
    for (;;) {
      const code = randomCode()
      if (dict.data.usedCodes?.[code]) {
        continue
      }
      return db.transaction(() => {
        let user_id = dict.data.tokenUsers?.[ownerToken]
        if (!user_id) {
          user_id = collection.add('users', {
            token: ownerToken,
            room_id_list: []
          })
          dict.update('tokenUsers', { [ownerToken]: user_id })
        }
        dict.update('usedCodes', { [code]: 1 })
        const room_id = collection.add('rooms', {
          code,
          name: name,
          ownerToken: ownerToken,
          questions: questions.map((question) => ({
            question,
            responses: {}
          }))
        })
        dict.update('codeRooms', { [code]: room_id })
        const user = collection.data.users[user_id as number]
        collection.update('users', user_id, {
          ...user,
          room_id_list: [...user.room_id_list, room_id]
        })
        return { code }
      })()
    }
  }

  @Get('/my-list')
  getMyList(@Query('token') token: string): MyRoomListResponse {
    token = (token || '').trim()
    if (!token) {
      throw new HttpException('Missing query.token', HttpStatus.BAD_REQUEST)
    }
    const user_id = dict.data.tokenUsers?.[token]
    if (!user_id) {
      return { rooms: [] }
    }
    const user = collection.data.users[user_id as number]
    if (!user) {
      return { rooms: [] }
    }
    return {
      rooms: user.room_id_list.map((room_id) => {
        const room = collection.data.rooms[room_id as number]
        return {
          id: room_id as number,
          code: room.code,
          name: room.name
        }
      })
    }
  }

  @Get('/')
  getRoom(
    @Query('code') code: string,
    @Query('token') token: string
  ): GetRoomResponse {
    code = (code || '').trim()
    if (!code) {
      throw new HttpException('Missing query.code', HttpStatus.BAD_REQUEST)
    }
    token = (token || '').trim()
    if (!token) {
      throw new HttpException('Missing query.token', HttpStatus.BAD_REQUEST)
    }
    const room_id = dict.data.codeRooms?.[code]
    if (!room_id) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND)
    }
    const room = collection.data.rooms[room_id as number]
    const isOwner = room.ownerToken === token
    return {
      room: {
        isOwner,
        name: room.name,
        questions: room.questions.map((question) => {
          if (isOwner) {
            return {
              question: question.question,
              word_list: countWords(Object.values(question.responses))
            }
          } else {
            return {
              question: question.question
            }
          }
        })
      }
    }
  }

  @Delete('/')
  deleteRoom(
    @Query('room_id') room_id: string,
    @Query('token') token: string
  ): APIResponse {
    token = (token || '').trim()
    if (!token) {
      throw new HttpException('Missing query.token', HttpStatus.BAD_REQUEST)
    }
    room_id = (room_id || '').trim()
    if (!room_id) {
      throw new HttpException('Missing query.room_id', HttpStatus.BAD_REQUEST)
    }
    if (!+room_id) {
      throw new HttpException('Invalid query.room_id', HttpStatus.BAD_REQUEST)
    }
    return db.transaction(() => {
      const room = collection.data.rooms[room_id]
      if (room) {
        if (room.ownerToken !== token) {
          throw new HttpException('Not room token', HttpStatus.UNAUTHORIZED)
        }
        const { [room.code]: _room_id, ...codeRooms } = dict.data.codeRooms
        dict.update('codeRooms', codeRooms)
        collection.delete('rooms', +room_id)
      }
      const user_id = dict.data.tokenUsers?.[token]
      const user = collection.data.users[user_id as number]
      if (user) {
        collection.update('users', user_id, {
          ...user,
          room_id_list: user.room_id_list.filter(
            (id) => String(id) !== String(room_id)
          )
        })
      }
      return {}
    })()
  }

  @Post('/response')
  submitResponse(
    @Query('room_code') room_code: string,
    @Query('token') token: string,
    @Body('question') question: string,
    @Body('response') response: string
  ) {
    room_code = (room_code || '').trim()
    if (!room_code) {
      throw new HttpException('Missing query.room_code', HttpStatus.BAD_REQUEST)
    }
    token = (token || '').trim()
    if (!token) {
      throw new HttpException('Missing query.token', HttpStatus.BAD_REQUEST)
    }
    question = (question || '').trim()
    if (!question) {
      throw new HttpException('Missing body.question', HttpStatus.BAD_REQUEST)
    }
    response = (response || '').trim()
    if (!response) {
      throw new HttpException('Missing body.response', HttpStatus.BAD_REQUEST)
    }
    return db.transaction(() => {
      const room_id = dict.data.codeRooms?.[room_code]
      const room = collection.data.rooms[room_id as number]
      if (!room) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND)
      }
      const questions = room.questions.map(
        (item): Room['questions'][number] => {
          if (item.question === question) {
            return {
              ...item,
              responses: {
                ...item.responses,
                [token]: response
              }
            }
          } else {
            return item
          }
        }
      )
      collection.update('rooms', room_id as number, {
        ...room,
        questions
      })
      return {}
    })()
  }
}
