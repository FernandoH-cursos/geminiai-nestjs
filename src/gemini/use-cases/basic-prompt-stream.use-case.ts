import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from '@google/genai';
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
 *
 * ai.files.upload() se utiliza para subir archivos al modelo, como imágenes o documentos, y obtener su URI y tipo MIME.
 
 * createPartFromUri() se utiliza para crear una parte de contenido a partir de un URI y un tipo MIME, lo que permite incluir
 * archivos en la solicitud de generación de contenido.
 
 * createUserContent() se utiliza para crear el contenido del usuario que se enviará al modelo, incluyendo el prompt y los
 * archivos adjuntos. El modelo por defecto es 'gemini-2.0-flash', pero se puede cambiar en las opciones.
 */
export const basicPromptStreamUseCase = async (
  ai: GoogleGenAI,
  basicPromptDto: BasicPromptDto,
  options?: Options,
) => {
  //* Se extraen los archivos del DTO de BasicPromptDto.
  const { prompt, files = [] } = basicPromptDto;
  // console.log({ files });

  //Si solo se envía una sola imagen o archivo, se puede usar directamente su URI y MIME type.
  /* const image = await ai.files.upload({
    file: new Blob([firstImage.buffer], {
      type: firstImage.mimetype,
    }),
  }); */

  //* Si se envían múltiples archivos, se suben todos y se crean partes de contenido para cada uno.
  //* new Blob() se utiliza para crear un objeto Blob a partir del buffer del archivo, especificando el tipo MIME adecuado.
  const images = await Promise.all(
    files.map((file) => {
      return ai.files.upload({
        file: new Blob([file.buffer], {
          type: file.mimetype.includes('image') ? file.mimetype : 'image/jpg',
        }),
      });
    }),
  );

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
    // Solo para texto
    // contents: basicPromptDto.prompt,
    contents: [
      createUserContent([
        prompt,
        // Imagenes o archivos
        // createPartFromUri(image.uri ?? '', image.mimeType ?? ''),
        ...images.map((image) =>
          createPartFromUri(image.uri!, image.mimeType!),
        ),
      ]),
    ],
    config: {
      systemInstruction,
    },
  });
  console.log(JSON.stringify({ images }, null, 2));

  return response;
};
