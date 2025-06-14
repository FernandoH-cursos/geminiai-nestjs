import { GoogleGenAI } from '@google/genai';

const fileMimeTypesByExtension = {
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

//* Este helper permite cargar archivos a gemini.
//* ai.files.upload() se utiliza para subir archivos al modelo, como imágenes o documentos, y obtener su URI y tipo MIME.
export const geminiUploadFiles = async (
  ai: GoogleGenAI,
  files: Express.Multer.File[],
) => {
  const uploadedFiles = await Promise.all(
    files.map((file) => {
      const fileExtension = file.originalname.split('.').pop() ?? '';
      const fileMimeType: string =
        fileMimeTypesByExtension[fileExtension] ?? '';

      // Esto es para cuando el archivo no tiene un mime type reconocido
      const type = file.mimetype.includes('application/octet-strea m')
        ? fileMimeType
        : file.mimetype;

      //* Si se envían múltiples archivos, se suben todos y se crean partes de contenido para cada uno.
      //* new Blob() se utiliza para crear un objeto Blob a partir del buffer del archivo, especificando el tipo MIME adecuado.
      return ai.files.upload({
        file: new Blob([file.buffer], {
          type,
        }),
      });
    }),
  );

  return uploadedFiles;
};
