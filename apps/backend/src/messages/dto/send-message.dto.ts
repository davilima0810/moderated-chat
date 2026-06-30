import { IsOptional, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  roomId?: string;

  @IsString()
  @MinLength(1)
  content: string;
}
