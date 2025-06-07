import { Body, Controller, Post } from '@nestjs/common';

import { GeminiService } from './gemini.service';
import { BasicPromptDto } from './dtos';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('basic-prompt')
  basicPrompt(@Body() basicPromptDto: BasicPromptDto) {
    return this.geminiService.basicPrompt(basicPromptDto);
  }
}
