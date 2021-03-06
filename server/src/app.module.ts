import { Module } from '@nestjs/common';
import { RoomController } from './room/room.controller';

@Module({
  imports: [],
  controllers: [ RoomController],
  providers: [],
})
export class AppModule {}
