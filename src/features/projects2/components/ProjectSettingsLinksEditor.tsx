import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import {
  BUILTIN_LINK_LABELS,
  isBuiltinLinkKey,
  moveLinkOrder,
  normalizeLinkOrder,
  type BuiltinLinkKey,
} from '../projectLinks';
import type { ProjectCustomLink, ProjectQuickLinks } from '../types';
import styles from '../projects2.module.css';

interface ProjectSettingsLinksEditorProps {
  quickLinks: ProjectQuickLinks;
  customLinks: ProjectCustomLink[];
  linkOrder: string[];
  onPatch: (patch: {
    quickLinks?: ProjectQuickLinks;
    customLinks?: ProjectCustomLink[];
    linkOrder?: string[];
  }) => void;
}

function newLinkId() {
  return `link-${Date.now().toString(36)}`;
}

export function ProjectSettingsLinksEditor({
  quickLinks,
  customLinks,
  linkOrder,
  onPatch,
}: ProjectSettingsLinksEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const order = normalizeLinkOrder(linkOrder, customLinks);
  const customById = new Map(customLinks.map((row) => [row.id, row]));

  const persistOrder = (nextOrder: string[]) => {
    onPatch({ linkOrder: nextOrder });
  };

  const saveBuiltin = (key: BuiltinLinkKey, url: string) => {
    onPatch({ quickLinks: { ...quickLinks, [key]: url } });
  };

  const saveCustom = (next: ProjectCustomLink[]) => {
    onPatch({ customLinks: next });
  };

  const addCustomLink = () => {
    const id = newLinkId();
    const nextCustom = [...customLinks, { id, label: '', url: '' }];
    onPatch({
      customLinks: nextCustom,
      linkOrder: [...order, id],
    });
  };

  const removeCustomAt = (index: number) => {
    const id = order[index];
    if (!id || isBuiltinLinkKey(id)) return;
    onPatch({
      customLinks: customLinks.filter((row) => row.id !== id),
      linkOrder: order.filter((item) => item !== id),
    });
  };

  const moveRow = (fromIndex: number, toIndex: number) => {
    persistOrder(moveLinkOrder(order, fromIndex, toIndex));
  };

  return (
    <div className={styles['p2-settings-links']}>
      {order.map((id, index) => {
        const isBuiltin = isBuiltinLinkKey(id);
        const custom = isBuiltin ? null : customById.get(id);
        if (!isBuiltin && !custom) return null;

        const label = isBuiltin ? BUILTIN_LINK_LABELS[id] : (custom?.label ?? '');
        const url = isBuiltin ? quickLinks[id] : (custom?.url ?? '');

        return (
          <div
            key={id}
            className={cx(styles['p2-settings-link-row'], dragIndex === index && styles['p2-settings-link-row-drag'])}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragIndex === null || dragIndex === index) return;
              moveRow(dragIndex, index);
              setDragIndex(null);
            }}
          >
            <button
              type="button"
              className={styles['p2-settings-link-grip']}
              aria-label="Перетягнути"
              title="Перетягнути"
              onMouseDown={(event) => event.stopPropagation()}
            >
              {Icons.grip}
            </button>

            {isBuiltin ? (
              <span className={styles['p2-settings-link-k']}>{label}</span>
            ) : (
              <input
                className={cx(styles['p2-settings-link-in'], styles['p2-settings-link-label-in'])}
                type="text"
                value={label}
                placeholder="Назва"
                onChange={(e) =>
                  saveCustom(customLinks.map((row) => (row.id === id ? { ...row, label: e.target.value } : row)))
                }
              />
            )}

            <input
              className={styles['p2-settings-link-in']}
              type="url"
              value={url}
              placeholder="https://"
              onChange={(e) => {
                if (isBuiltin) saveBuiltin(id, e.target.value);
                else saveCustom(customLinks.map((row) => (row.id === id ? { ...row, url: e.target.value } : row)));
              }}
            />

            <div className={styles['p2-settings-link-actions']}>
              <button
                type="button"
                className={styles['p2-settings-link-move']}
                aria-label="Вище"
                disabled={index === 0}
                onClick={() => moveRow(index, index - 1)}
              >
                {Icons.arrowU}
              </button>
              <button
                type="button"
                className={styles['p2-settings-link-move']}
                aria-label="Нижче"
                disabled={index === order.length - 1}
                onClick={() => moveRow(index, index + 1)}
              >
                {Icons.arrowD}
              </button>
              {!isBuiltin ? (
                <button
                  type="button"
                  className={styles['p2-settings-link-remove']}
                  aria-label="Видалити посилання"
                  onClick={() => removeCustomAt(index)}
                >
                  {Icons.close}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}

      <button type="button" className={cx('ghost-btn', 'sm', styles['p2-settings-add-btn'])} onClick={addCustomLink}>
        {Icons.plus} Додати посилання
      </button>
    </div>
  );
}
