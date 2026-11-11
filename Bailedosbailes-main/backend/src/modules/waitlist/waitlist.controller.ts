import { Body, Controller, Get, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Request } from 'express';

@Controller('api/waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createEntry(@Body() dto: CreateWaitlistDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.waitlistService.create(dto, ip, userAgent);
  }

  @Get('summary')
  async getSummary() {
    const count = await this.waitlistService.count();
    return {
      status: 'OPEN',
      totalWaitlist: count,
      eventName: 'Hotel Cortez Halloween Party 2026',
    };
  }
}
