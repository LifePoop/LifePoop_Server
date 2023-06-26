import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Hello')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Hello world!' })
  @ApiOkResponse({ description: 'Hello world!' })
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/error')
  getError(): void {
    throw new Error('Hi Sentry!');
  }
}
