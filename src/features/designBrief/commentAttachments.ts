import type { DesignBriefCommentAttachment } from './types';

let nextAttachmentId = 5000;

function createAttachmentId(): string {
  return `att${nextAttachmentId++}`;
}

function readFileAsAttachment(file: File): Promise<DesignBriefCommentAttachment | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        resolve(null);
        return;
      }
      resolve({
        id: createAttachmentId(),
        name: file.name || 'screenshot.png',
        dataUrl: reader.result,
        mimeType: file.type,
      });
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export async function readImageFiles(files: FileList | File[]): Promise<DesignBriefCommentAttachment[]> {
  const list = Array.from(files);
  const attachments = await Promise.all(list.map(readFileAsAttachment));
  return attachments.filter((item): item is DesignBriefCommentAttachment => item !== null);
}

export async function readImagesFromDataTransfer(
  data: DataTransfer | null,
): Promise<DesignBriefCommentAttachment[]> {
  if (!data) return [];

  const fromFiles = data.files?.length ? await readImageFiles(data.files) : [];
  if (fromFiles.length > 0) return fromFiles;

  const fromItems: File[] = [];
  for (const item of Array.from(data.items)) {
    if (!item.type.startsWith('image/')) continue;
    const file = item.getAsFile();
    if (file) fromItems.push(file);
  }

  return readImageFiles(fromItems);
}
