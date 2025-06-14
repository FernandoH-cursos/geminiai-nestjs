import { Injectable } from '@nestjs/common';
import { BasicPromptDto, ChatPromptDto } from './dtos';
import {
  basicPromptStreamUseCase,
  basicPromptUseCase,
  chatPromptStreamUseCase,
} from './use-cases';

import { Content, GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  //* Inicializando el cliente de Google GenAI con la clave de API para acceder a los modelos de Gemini.
  private ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  //* Mantener historial de chat en memoria
  private chatHistory = new Map<string, Content[]>();

  async basicPrompt(basicPromptDto: BasicPromptDto) {
    const res = await basicPromptUseCase(this.ai, basicPromptDto);

    return res;
  }

  async basicPromptStream(basicPromptDto: BasicPromptDto) {
    const res = await basicPromptStreamUseCase(this.ai, basicPromptDto);

    return res;
  }

  async chatPromptStream(chatPromptDto: ChatPromptDto) {
    //* Obtiene el historial de chat para el chat específico utilizando el ID del chat proporcionado en el DTO.
    const chatHistory = this.getChatHistory(chatPromptDto.chatId);

    const res = await chatPromptStreamUseCase(this.ai, chatPromptDto, {
      history: chatHistory,
    });

    return res;
  }

  //* Guarda un mensaje en el historial de chat para un chat específico
  saveMessage(chatId: string, message: Content) {
    const messages = this.getChatHistory(chatId);

    messages.push(message);

    this.chatHistory.set(chatId, messages);

    // console.log(this.chatHistory);
  }

  //* Obtiene el historial de chat para un chat específico
  getChatHistory(chatId: string) {
    // Usamos structuredClone para evitar problemas de referencia circular, es decir, para evitar que se copien referencias a
    // objetos que podrían causar problemas al serializar o clonar.
    return structuredClone(this.chatHistory.get(chatId)) || [];
  }
}
