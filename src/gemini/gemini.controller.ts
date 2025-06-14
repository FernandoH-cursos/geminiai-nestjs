import { Response } from 'express';

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { GeminiService } from './gemini.service';
import { BasicPromptDto, ChatPromptDto } from './dtos';
import { GenerateContentResponse } from '@google/genai';

//* FilesInterceptor) es un interceptor de NestJS que permite manejar archivos subidos en una solicitud HTTP.
//* Este interceptor se utiliza para procesar archivos subidos a través de un formulario o una solicitud multipart/form-data.
//* @UploadedFiles() es un decorador que se utiliza para acceder a los archivos subidos en la solicitud.
//* FilesInterceptor y permite obtener el archivo subido como un objeto Express.Multer.File.

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  async outputStreamResponse(
    res: Response,
    stream: AsyncGenerator<GenerateContentResponse, any, any>,
  ) {
    //* Se establece el tipo de contenido como texto plano y el estado HTTP como OK (200)
    res.setHeader('Content-Type', 'text/plain');
    res.status(HttpStatus.OK);

    //* Almacena el texto de la respuesta generada por el modelo.
    let resultText = '';

    //* 'for await' permite iterar sobre el stream de respuesta a medida que se va generando.
    //* Cada chunk del stream contiene una parte de la respuesta generada por el modelo.
    for await (const chunk of stream) {
      const piece = chunk.text;
      resultText += piece;
      res.write(piece);

      // console.log(piece);
    }

    //* Finaliza la respuesta HTTP una vez que se ha enviado todo el contenido del stream.
    res.end();

    return resultText;
  }

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

    this.outputStreamResponse(res, stream);
  }

  @Post('chat-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async chatPrompttream(
    @Body() chatPromptDto: ChatPromptDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    chatPromptDto.files = files;

    const stream = await this.geminiService.chatPromptStream(chatPromptDto);

    const data = await this.outputStreamResponse(res, stream);

    // console.log(JSON.stringify({ text: chatPromptDto.prompt, data }, null, 2));

    const geminiMessage = {
      role: 'model',
      parts: [{ text: data }],
    };

    const userMessage = {
      role: 'user',
      parts: [{ text: chatPromptDto.prompt }],
    };

    //* Guarda los mensajes en el historial de chat para el chat específico.
    //* Se guarda el mensaje del modelo y el mensaje del usuario en el historial de chat.
    this.geminiService.saveMessage(chatPromptDto.chatId, geminiMessage);
    this.geminiService.saveMessage(chatPromptDto.chatId, userMessage);
  }

  @Get('chat-history/:chatId')
  getChatHistory(@Param('chatId') chatId: string) {
    const chatHistory = this.geminiService.getChatHistory(chatId);

    const chatHistoryMapper = chatHistory.map((message) => {
      return {
        role: message.role,
        parts: message.parts.map((part) => part.text).join(''),
      };
    });

    return chatHistoryMapper;
  }
}
