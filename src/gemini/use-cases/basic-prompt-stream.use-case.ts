import { GoogleGenAI } from '@google/genai';
import { BasicPromptDto } from '../dtos';

interface Options {
  model?: string;
  systemInstruction?: string;
}
//* Método para generar conteneido con stream utilizando el modelo Gemini 2.0 Flash.
/*
 * generateContentStream() permite enviar un prompt y recibir una respuesta generada por el modelo en formato de stream.
 * Devuelve un AsyncGenerator<GenerateContentResponse, any, any> lo que significa que se puede iterar sobre la respuesta a medida
 * que se va generando, permitiendo un manejo más eficiente de la memoria y una respuesta más rápida al usuario.
 * Lo que devuelve se le conoce como un "stream" de respuesta, ya que se puede ir recibiendo en partes a medida que el modelo
 * genera la respuesta.
 */
export const basicPromptStreamUseCase = async (
  ai: GoogleGenAI,
  basicPromptDto: BasicPromptDto,
  options?: Options,
) => {
  const {
    model = 'gemini-2.0-flash',
    systemInstruction = `
      Responde únicamente en español, en formato markdown.
      Usa negritas de esta forma __.
      Usa el sistema métrico decimal.
    `,
  } = options ?? {};

  const response = await ai.models.generateContentStream({
    model: model,
    contents: basicPromptDto.prompt,
    config: {
      systemInstruction,
    },
  });
  // console.log(JSON.stringify(response, null, 2));

  return response;
};
