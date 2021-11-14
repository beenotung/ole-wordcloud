import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { print } from 'listening-on'
import { config } from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  const port = config.PORT
  await app.listen(port)
  print(port)
}

bootstrap()
