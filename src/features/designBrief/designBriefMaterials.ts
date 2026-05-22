import type { DesignBriefMaterial } from './types';

export const REFERENCE_MATERIAL_LIMITS = {
  maxCount: 10,
  maxBytes: 50 * 1024 * 1024,
} as const;

export const VIDEO_MATERIAL_LIMITS = {
  maxCount: 20,
  maxBytes: 50 * 1024 * 1024,
} as const;

export interface DesignBriefMaterialUploadConfig {
  maxCount: number;
  maxBytes: number;
  allowImage: boolean;
  allowVideo: boolean;
}

export interface ReadDesignBriefMaterialsResult {
  materials: DesignBriefMaterial[];
  errors: string[];
}

let nextMaterialId = 7000;

function createMaterialId(): string {
  return `mat${nextMaterialId++}`;
}

export function materialKindFromMime(mimeType: string): DesignBriefMaterial['kind'] {
  return mimeType.startsWith('video/') ? 'video' : 'image';
}

function isAllowedFile(file: File, config: DesignBriefMaterialUploadConfig): boolean {
  if (config.allowImage && file.type.startsWith('image/')) return true;
  if (config.allowVideo && file.type.startsWith('video/')) return true;
  return false;
}

function formatMaxMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

function readFileAsMaterial(file: File, config: DesignBriefMaterialUploadConfig): Promise<DesignBriefMaterial | null> {
  if (!isAllowedFile(file, config)) return Promise.resolve(null);
  if (file.size > config.maxBytes) return Promise.resolve(null);

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        resolve(null);
        return;
      }
      resolve({
        id: createMaterialId(),
        name: file.name || (file.type.startsWith('video/') ? 'video.mp4' : 'image.png'),
        dataUrl: reader.result,
        mimeType: file.type,
        kind: materialKindFromMime(file.type),
      });
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function materialAcceptAttribute(config: DesignBriefMaterialUploadConfig): string {
  const parts: string[] = [];
  if (config.allowImage) parts.push('image/*');
  if (config.allowVideo) parts.push('video/*');
  return parts.join(',');
}

export async function readDesignBriefMaterialFiles(
  files: FileList | File[],
  existingCount: number,
  config: DesignBriefMaterialUploadConfig,
): Promise<ReadDesignBriefMaterialsResult> {
  const list = Array.from(files);
  const errors: string[] = [];
  const slotsLeft = Math.max(0, config.maxCount - existingCount);
  const maxMb = formatMaxMb(config.maxBytes);

  if (slotsLeft === 0) {
    return { materials: [], errors: [`Максимум ${config.maxCount} файлів`] };
  }

  const accepted: File[] = [];
  for (const file of list) {
    if (accepted.length >= slotsLeft) {
      errors.push(`Додано лише ${slotsLeft} з ${list.length} файлів`);
      break;
    }
    if (!isAllowedFile(file, config)) {
      const typeLabel =
        config.allowVideo && !config.allowImage
          ? 'лише відео'
          : config.allowImage && !config.allowVideo
            ? 'лише фото'
            : 'лише фото або відео';
      errors.push(`${file.name}: ${typeLabel}`);
      continue;
    }
    if (file.size > config.maxBytes) {
      errors.push(`${file.name}: більше ${maxMb} МБ`);
      continue;
    }
    accepted.push(file);
  }

  const materials = await Promise.all(accepted.map((file) => readFileAsMaterial(file, config)));
  return {
    materials: materials.filter((item): item is DesignBriefMaterial => item !== null),
    errors,
  };
}

export const REFERENCE_MATERIAL_CONFIG: DesignBriefMaterialUploadConfig = {
  maxCount: REFERENCE_MATERIAL_LIMITS.maxCount,
  maxBytes: REFERENCE_MATERIAL_LIMITS.maxBytes,
  allowImage: true,
  allowVideo: true,
};

export const VIDEO_MATERIAL_CONFIG: DesignBriefMaterialUploadConfig = {
  maxCount: VIDEO_MATERIAL_LIMITS.maxCount,
  maxBytes: VIDEO_MATERIAL_LIMITS.maxBytes,
  allowImage: true,
  allowVideo: true,
};
