import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, AuthGuard } from '../common/guards/auth.guard';
import { AddParticipantDto } from './dto/add-participant.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

@UseGuards(AuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  list() {
    return this.roomsService.list();
  }

  @Post()
  create(@Body() dto: CreateRoomDto, @Req() request: AuthenticatedRequest) {
    return this.roomsService.create(dto, request.user);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.roomsService.findByIdOrThrow(id);
  }

  @Post(':id/participants')
  addParticipant(@Param('id') id: string, @Body() dto: AddParticipantDto) {
    return this.roomsService.addParticipant(id, dto.email);
  }
}
