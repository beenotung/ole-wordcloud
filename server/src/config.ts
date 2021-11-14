import { parse } from 'dotenv'
import { readFileSync } from 'fs'

const env = parse(readFileSync('.env').toString())
export const config = {
  PORT: +env.PORT || 3000
}
