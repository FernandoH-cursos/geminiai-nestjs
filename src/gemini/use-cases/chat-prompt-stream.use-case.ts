import { Content, createPartFromUri, GoogleGenAI } from '@google/genai';
import { ChatPromptDto } from '../dtos';
import { geminiUploadFiles } from '../helpers';

interface Options {
  model?: string;
  systemInstruction?: string;
  history: Content[];
}
//* Método para generar contenido con stream utilizando el modelo Gemini 2.0 Flash y que que se tome como referencia el historial de chat.

/*
 * ai.chats.create() se utiliza para crear un nuevo chat con el modelo, especificando el modelo a utilizar y las instrucciones del sistema.
 * - 'history': Permite establecer un historial de chat previo, lo que ayuda al modelo a entender el contexto de la conversación.
 * Recibe un array de objetos con el rol del participante (usuario o modelo) y las partes del mensaje.
 * - 'role': Puede ser 'user' para el usuario o 'model' para el modelo.
 * - 'parts': Contiene el texto del mensaje.
 * chat.sendMessageStream() se utiliza para enviar un mensaje al chat y recibir una respuesta en formato de stream.
 */
export const chatPromptStreamUseCase = async (
  ai: GoogleGenAI,
  chatPromptDto: ChatPromptDto,
  options?: Options,
) => {
  const { prompt, files = [] } = chatPromptDto;

  const uploadedFiles = await geminiUploadFiles(ai, files);

  const {
    model = 'gemini-2.0-flash',
    systemInstruction = `
      Responde únicamente en español, en formato markdown.
      Usa negritas de esta forma __.
      Usa el sistema métrico decimal.
    `,
    history,
  } = options ?? {};

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction,
    },
    history: history,
  });

  return chat.sendMessageStream({
    message: [
      prompt,
      ...uploadedFiles.map((file) =>
        createPartFromUri(file.uri!, file.mimeType!),
      ),
    ],
  });
};
