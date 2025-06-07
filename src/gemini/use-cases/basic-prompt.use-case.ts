import { GoogleGenAI } from '@google/genai';
import { BasicPromptDto } from '../dtos';

interface Options {
  model?: string;
  systemInstruction?: string;
}

//* Método para generar contenido utilizando el modelo Gemini 2.0 Flash.
/*
 * generateContent() permite enviar un prompt y recibir una respuesta generada por el modelo. Recibe las siguientes propiedades:
 * - model: El modelo a utilizar, en este caso 'gemini-2.0-flash'.
 * - contents: El contenido del prompt que se desea enviar al modelo.
 * - config: Configuración adicional para la generación, como instrucciones del sistema. Como:
 *   - systemInstruction: Instrucciones para el modelo, en este caso se especifica que la respuesta debe ser en español
 *     y en formato markdown.
 * * El método devuelve la respuesta generada por el modelo, que se espera sea en formato markdown y en español.
 *
 */
export const basicPromptUseCase = async (
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

  const response = await ai.models.generateContent({
    model: model,
    contents: basicPromptDto.prompt,
    config: {
      systemInstruction,
    },
  });
  // console.log(JSON.stringify(response, null, 2));

  return response.text;
};
