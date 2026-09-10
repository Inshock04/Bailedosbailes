import { IsOptional, IsString } from 'class-validator';

export class MpWebhookDataDto {
  @IsOptional()
  @IsString()
  id?: string;
}

export class MpWebhookNotificationDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  data?: {
    id?: string | number;
  };

  @IsOptional()
  id?: string | number;
}
