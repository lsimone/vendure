import { Module, Injectable, Controller, Get } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Nestjs!';
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class RestModule {}
