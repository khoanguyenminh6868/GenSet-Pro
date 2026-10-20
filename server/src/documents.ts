import type Anthropic from '@anthropic-ai/sdk';
import mammoth from 'mammoth';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

type ContentBlock = Anthropic.Beta.BetaContentBlockParam;

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function extension(name: string): string {
  return name.toLowerCase().split('.').pop() ?? '';
}

/**
 * Turn an uploaded tender file into Claude content blocks. PDFs and images are
 * sent as-is so Claude can read scanned pages; Word files are converted to text.
 */
export async function fileToBlocks(file: UploadedFile, label: string): Promise<ContentBlock[]> {
  const ext = extension(file.originalname);
  const title = `${label}: ${file.originalname}`;

  if (file.mimetype === 'application/pdf' || ext === 'pdf') {
    return [
      {
        type: 'document',
        title,
        source: { type: 'base64', media_type: 'application/pdf', data: file.buffer.toString('base64') },
      },
    ];
  }

  if (IMAGE_TYPES.has(file.mimetype) || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    const media = (IMAGE_TYPES.has(file.mimetype) ? file.mimetype : ext === 'png' ? 'image/png' : 'image/jpeg') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/gif'
      | 'image/webp';
    return [
      { type: 'text', text: `--- ${title} (ảnh chụp) ---` },
      { type: 'image', source: { type: 'base64', media_type: media, data: file.buffer.toString('base64') } },
    ];
  }

  let text: string;
  if (ext === 'docx' || file.mimetype.includes('wordprocessingml')) {
    text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
  } else if (ext === 'txt' || ext === 'md' || ext === 'csv' || file.mimetype.startsWith('text/')) {
    text = file.buffer.toString('utf8');
  } else {
    throw new UnsupportedFileError(file.originalname);
  }
  return [{ type: 'document', title, source: { type: 'text', media_type: 'text/plain', data: text } }];
}

export class UnsupportedFileError extends Error {
  constructor(name: string) {
    super(`Định dạng tệp "${name}" chưa được hỗ trợ. Hãy dùng PDF, DOCX, TXT hoặc ảnh (JPG/PNG).`);
  }
}

export function textToBlock(text: string, label: string): ContentBlock {
  return { type: 'document', title: label, source: { type: 'text', media_type: 'text/plain', data: text } };
}
