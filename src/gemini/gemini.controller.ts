import { Response } from 'express';

import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { GeminiService } from './gemini.service';
import { BasicPromptDto } from './dtos';

//* FilesInterceptor) es un interceptor de NestJS que permite manejar archivos subidos en una solicitud HTTP.
//* Este interceptor se utiliza para procesar archivos subidos a través de un formulario o una solicitud multipart/form-data.
//* @UploadedFiles() es un decorador que se utiliza para acceder a los archivos subidos en la solicitud.
//* FilesInterceptor y permite obtener el archivo subido como un objeto Express.Multer.File.

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('basic-prompt')
  basicPrompt(@Body() basicPromptDto: BasicPromptDto) {
    return this.geminiService.basicPrompt(basicPromptDto);
  }
  @Post('basic-prompt-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async basicPromptStream(
    @Body() basicPromptDto: BasicPromptDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    //* Se asigna el array de archivos subidos al DTO de BasicPromptDto.
    basicPromptDto.files = files;

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
