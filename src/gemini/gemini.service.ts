import { Injectable } from '@nestjs/common';
import { BasicPromptDto } from './dtos';
import { basicPromptUseCase } from './use-cases';

import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  //* Inicializando el cliente de Google GenAI con la clave de API para acceder a los modelos de Gemini.
  private ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  async basicPrompt(basicPromptDto: BasicPromptDto) {
    const res = await basicPromptUseCase(this.ai, basicPromptDto);

    return res;
  }
}
