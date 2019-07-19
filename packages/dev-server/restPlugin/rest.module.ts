import { Module, Injectable, Controller, Get, Post } from '@nestjs/common';
import { TaxRateService } from '@vendure/core';
import { ServiceModule } from '@vendure/core/dist/service/service.module'
import { EventBusModule } from '@vendure/core/dist/event-bus/event-bus.module'
// import { ServiceModule } from '../service/service.module';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Nestjs!';
  }
}

@Controller('vsbridge')
export class AppController {
  constructor(
    private readonly taxRateService: TaxRateService,
    private readonly appService: AppService,
    ) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('auth/admin')
  auth(): object {
    console.warn('auth required')
    // TODO: implement authentication
    return {
      "code": 200,
      "result": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjcifQ.AsjbrBmU7phdYo6aXtSx2QI4bmY5ugz4zTUBmiXTsbs"
    }
  }


  @Get('tax')
  getTax(): object {
    // return {}
    return this.taxRateService.findAll()
  }

}

@Module({
  imports: [ServiceModule.forRoot(), EventBusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class RestModule {}
