import { DBInstance, newDB } from 'better-sqlite3-schema'
import { join } from 'path'
import { Collection, Dict, Int, ObjectDict } from 'live-data-sync'

export interface Room {
  code: string
  name: string
  ownerToken: string
  questions: {
    question: string
    responses: { [token: string]: string }
  }[]
}

export interface User {
  token: string
  room_id_list: Int[]
}

export const db: DBInstance = newDB({
  path: join('data', 'state.db'),
  migrate: false
})

export const collection = new Collection<{
  rooms: ObjectDict<Room>
  users: ObjectDict<User>
}>(db)

export const dict = new Dict<{
  usedCodes?: { [code: string]: 1 }
  tokenUsers?: { [token: string]: Int }
  codeRooms?: { [code: string]: Int }
}>(db)
