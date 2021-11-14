import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { print } from 'listening-on'
import { config } from './config'
import * as express from 'express'
import * as path from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.use(express.static(path.resolve(path.join('..', 'app', 'www'))))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
      res.sendFile(path.resolve(path.join('..', 'app', 'www', 'index.html')))
      return
    }
    next()
  })
  const port = config.PORT
  await app.listen(port)
  print(port)
}

bootstrap()
