import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, AuthGuard } from '../common/guards/auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@UseGuards(AuthGuard)
@Controller('rooms/:roomId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  list(@Param('roomId') roomId: string) {
    return this.messagesService.list(roomId);
  }

  @Post()
  create(
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.messagesService.createApproved(roomId, dto.content, request.user);
  }
}
