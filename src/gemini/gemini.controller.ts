import { Response } from 'express';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';

import { GeminiService } from './gemini.service';
import { BasicPromptDto } from './dtos';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('basic-prompt')
  basicPrompt(@Body() basicPromptDto: BasicPromptDto) {
    return this.geminiService.basicPrompt(basicPromptDto);
  }
  @Post('basic-prompt-stream')
  async basicPromptStream(
    @Body() basicPromptDto: BasicPromptDto,
    @Res() res: Response,
  ) {
    //* Devuelve un stream de respuesta generada por el modelo de Gemini
    const stream = await this.geminiService.basicPromptStream(basicPromptDto);

    //* Se establece el tipo de contenido como texto plano y el estado HTTP como OK (200)
    res.setHeader('Content-Type', 'text/plain');
    res.status(HttpStatus.OK);

    //* 'for await' permite iterar sobre el stream de respuesta a medida que se va generando.
    //* Cada chunk del stream contiene una parte de la respuesta generada por el modelo.
    for await (const chunk of stream) {
      const piece = chunk.text;
      res.write(piece);

      // console.log(piece);
    }

    //* Finaliza la respuesta HTTP una vez que se ha enviado todo el contenido del stream.
    res.end();
  }
}
