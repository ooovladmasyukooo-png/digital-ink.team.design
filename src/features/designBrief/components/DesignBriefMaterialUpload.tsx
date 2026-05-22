import { useEffect, useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import {
  materialAcceptAttribute,
  readDesignBriefMaterialFiles,
  type DesignBriefMaterialUploadConfig,
} from '../designBriefMaterials';
import { downloadMaterialsArchive } from '../designBriefMaterialsArchive';
import styles from '../designBrief.module.css';
import type { DesignBriefMaterial } from '../types';

function MaterialPreviewLightbox({
  material,
  onClose,
}: {
  material: DesignBriefMaterial;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className={styles['db-image-lightbox']} role="dialog" aria-modal="true" onClick={onClose}>
      <button type="button" className={styles['db-image-lightbox-close']} onClick={onClose} aria-label="Закрити">
        {Icons.close}
      </button>
      {material.kind === 'video' ? (
        <video
          className={styles['db-image-lightbox-img']}
          src={material.dataUrl}
          controls
          autoPlay
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <img
          className={styles['db-image-lightbox-img']}
          src={material.dataUrl}
          alt={material.name}
          onClick={(event) => event.stopPropagation()}
        />
      )}
    </div>
  );
}

interface MaterialGridProps {
  materials: DesignBriefMaterial[];
  config: DesignBriefMaterialUploadConfig;
  compact?: boolean;
  onAdd: (materials: DesignBriefMaterial[]) => void;
  onRemove: (id: string) => void;
  onError: (message: string | null) => void;
}

function MaterialGrid({ materials, config, compact = false, onAdd, onRemove, onError }: MaterialGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<DesignBriefMaterial | null>(null);
  const canAdd = materials.length < config.maxCount;

  const onFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return;
    const result = await readDesignBriefMaterialFiles(files, materials.length, config);
    if (result.materials.length > 0) onAdd(result.materials);
    onError(result.errors[0] ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <ul className={cx(styles['db-materials-grid'], compact && styles['db-materials-grid-compact'])}>
        {materials.map((material) => (
          <li key={material.id} className={styles['db-material-item']}>
            <button
              type="button"
              className={cx(styles['db-material-thumb'], compact && styles['db-material-thumb-compact'])}
              onClick={() => setPreview(material)}
              title={material.name}
              aria-label={`Переглянути ${material.name}`}
            >
              {material.kind === 'video' ? (
                <video className={styles['db-material-media']} src={material.dataUrl} muted playsInline />
              ) : (
                <img className={styles['db-material-media']} src={material.dataUrl} alt={material.name} />
              )}
              {material.kind === 'video' ? (
                <span className={styles['db-material-play']} aria-hidden>
                  {Icons.play}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className={styles['db-material-remove']}
              onClick={() => onRemove(material.id)}
              aria-label={`Видалити ${material.name}`}
            >
              {Icons.close}
            </button>
          </li>
        ))}
        {canAdd ? (
          <li className={styles['db-material-item']}>
            <button
              type="button"
              className={cx(styles['db-material-add'], compact && styles['db-material-add-compact'])}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Додати файл"
            >
              {Icons.plus}
            </button>
          </li>
        ) : null}
      </ul>
      <input
        ref={fileInputRef}
        type="file"
        accept={materialAcceptAttribute(config)}
        multiple
        className={styles['db-materials-file-input']}
        onChange={(e) => void onFilesSelected(e.target.files)}
      />
      {preview ? <MaterialPreviewLightbox material={preview} onClose={() => setPreview(null)} /> : null}
    </>
  );
}

interface DesignBriefReferenceMaterialsRowProps {
  materials: DesignBriefMaterial[];
  onChange: (materials: DesignBriefMaterial[]) => void;
  config: DesignBriefMaterialUploadConfig;
  hint: string;
}

export function DesignBriefReferenceMaterialsRow({
  materials,
  onChange,
  config,
  hint,
}: DesignBriefReferenceMaterialsRowProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={cx(styles['db-detail-row'], styles['db-detail-row-material'])}>
      <span className={styles['db-detail-k']}>Референс</span>
      <div className={styles['db-detail-material-field']}>
        <MaterialGrid
          materials={materials}
          config={config}
          compact
          onAdd={(added) => onChange([...materials, ...added])}
          onRemove={(id) => {
            onChange(materials.filter((item) => item.id !== id));
            setError(null);
          }}
          onError={setError}
        />
        <p className={styles['db-materials-hint']}>{hint}</p>
        {error ? <p className={styles['db-materials-error']}>{error}</p> : null}
      </div>
    </div>
  );
}

interface DesignBriefVideoMaterialsSectionProps {
  materials: DesignBriefMaterial[];
  onChange: (materials: DesignBriefMaterial[]) => void;
  config: DesignBriefMaterialUploadConfig;
  hint: string;
  archiveName: string;
}

export function DesignBriefVideoMaterialsSection({
  materials,
  onChange,
  config,
  hint,
  archiveName,
}: DesignBriefVideoMaterialsSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return;
    const result = await readDesignBriefMaterialFiles(files, materials.length, config);
    if (result.materials.length > 0) onChange([...materials, ...result.materials]);
    setError(result.errors[0] ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onDownloadArchive = () => {
    try {
      downloadMaterialsArchive(materials, archiveName);
    } catch {
      setError('Не вдалося створити архів');
    }
  };

  if (materials.length === 0) {
    return (
      <>
        <button
          type="button"
          className={cx(
            styles['db-drawer-block'],
            styles['db-drawer-block-materials'],
            styles['db-drawer-block-materials-empty'],
            styles['db-drawer-block-empty-hit'],
          )}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Додати фото / відео матеріал"
        >
          <span className={styles['db-drawer-empty-t']}>
            {Icons.plus}
            Додати фото / відео матеріал
          </span>
          <span className={styles['db-materials-hint']}>{hint}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={materialAcceptAttribute(config)}
          multiple
          className={styles['db-materials-file-input']}
          onChange={(e) => void onFilesSelected(e.target.files)}
        />
        {error ? <p className={styles['db-materials-error']}>{error}</p> : null}
      </>
    );
  }

  return (
    <section className={cx(styles['db-drawer-block'], styles['db-drawer-block-materials'])}>
      <div className={styles['db-drawer-block-head']}>
        <h3 className={styles['db-drawer-block-title']}>Фото / відео матеріал</h3>
        <div className={styles['db-drawer-block-head-actions']}>
          <button
            type="button"
            className={styles['db-materials-archive-btn']}
            onClick={onDownloadArchive}
            aria-label="Завантажити архів матеріалів"
          >
            {Icons.download}
            <span>Архів</span>
          </button>
          <span className={styles['db-drawer-block-meta']}>
            {materials.length}/{config.maxCount}
          </span>
        </div>
      </div>
      <div className={styles['db-drawer-block-body']}>
        <MaterialGrid
          materials={materials}
          config={config}
          onAdd={(added) => onChange([...materials, ...added])}
          onRemove={(id) => {
            onChange(materials.filter((item) => item.id !== id));
            setError(null);
          }}
          onError={setError}
        />
        <p className={styles['db-materials-hint']}>{hint}</p>
        {error ? <p className={styles['db-materials-error']}>{error}</p> : null}
      </div>
    </section>
  );
}
